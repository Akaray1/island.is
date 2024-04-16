import { Inject, Injectable } from '@nestjs/common'
import {
  DrivingLicenseService,
  NewDrivingLicenseResult,
} from '@island.is/api/domains/driving-license'

import { SharedTemplateApiService } from '../../shared'
import { TemplateApiModuleActionProps } from '../../../types'
import { coreErrorMessages, getValueViaPath } from '@island.is/application/core'
import {
  Application,
  ApplicationTypes,
  ApplicationWithAttachments,
  FormValue,
  InstitutionNationalIds,
} from '@island.is/application/types'
import {
  generateDrivingLicenseSubmittedEmail,
  generateDrivingAssessmentApprovalEmail,
} from './emailGenerators'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { BaseTemplateApiService } from '../../base-template-api.service'
import { FetchError } from '@island.is/clients/middlewares'
import { TemplateApiError } from '@island.is/nest/problem'
import { DriverLicenseWithoutImages } from '@island.is/clients/driving-license'
import { User } from '@island.is/auth-nest-tools'
import {
  PostTemporaryLicenseWithHealthDeclarationMapper,
  DrivingLicenseSchema,
} from './utils/healthDeclarationMapper'
import { removeCountryCode } from './utils'
import AmazonS3URI from 'amazon-s3-uri'
import { S3 } from 'aws-sdk'

const calculateNeedsHealthCert = (healthDeclaration = {}) => {
  return !!Object.values(healthDeclaration).find((val) => val === 'yes')
}

@Injectable()
export class DrivingLicenseSubmissionService extends BaseTemplateApiService {
  s3: S3
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly drivingLicenseService: DrivingLicenseService,
    private readonly sharedTemplateAPIService: SharedTemplateApiService,
  ) {
    super(ApplicationTypes.DRIVING_LICENSE)
    this.s3 = new S3()
  }

  async createCharge({
    application: { id, answers },
    auth,
  }: TemplateApiModuleActionProps) {
    const applicationFor = getValueViaPath<'B-full' | 'B-temp' | 'B-renewal'>(
      answers,
      'applicationFor',
      'B-full',
    )

    // TODO: switch on applicationFor for chargeItemCode?
    // What is the chargeItemCode for renewal 65+?
    const chargeItemCode = applicationFor === 'B-full' ? 'AY110' : 'AY114'

    const response = await this.sharedTemplateAPIService.createCharge(
      auth,
      id,
      InstitutionNationalIds.SYSLUMENN,
      [chargeItemCode],
    )

    // last chance to validate before the user receives a dummy
    if (!response?.paymentUrl) {
      throw new Error('paymentUrl missing in response')
    }

    return response
  }

  async submitApplication({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<{ success: boolean }> {
    const { answers } = application
    const nationalId = application.applicant

    const isPayment = await this.sharedTemplateAPIService.getPaymentStatus(
      auth,
      application.id,
    )

    if (!isPayment?.fulfilled) {
      return {
        success: false,
      }
    }

    let result
    try {
      result = await this.createLicense(nationalId, application, auth)
    } catch (e) {
      this.log('error', 'Creating license failed', {
        e,
        applicationFor: answers.applicationFor,
        jurisdiction: answers.jurisdictionId,
      })

      throw e
    }

    if (!result.success) {
      throw new Error(`Application submission failed (${result.errorMessage})`)
    }

    try {
      await this.sharedTemplateAPIService.sendEmail(
        generateDrivingLicenseSubmittedEmail,
        application,
      )
    } catch (e) {
      this.log(
        'error',
        'Could not send email to applicant after successful submission',
        { e },
      )
    }

    return {
      success: true,
    }
  }

  private log(lvl: 'error' | 'info', message: string, meta: unknown) {
    this.logger.log(lvl, `[driving-license-submission] ${message}`, meta)
  }

  private async createLicense(
    nationalId: string,
    application: ApplicationWithAttachments,
    auth: User,
  ): Promise<NewDrivingLicenseResult> {
    const { answers } = application
    const applicationFor =
      getValueViaPath<'B-full' | 'B-temp' | 'B-full-renewal-65'>(
        answers,
        'applicationFor',
      ) ?? 'B-full'

    const needsHealthCert = calculateNeedsHealthCert(answers.healthDeclaration)
    const remarks = answers.hasHealthRemarks === 'yes'
    const needsQualityPhoto = answers.willBringQualityPhoto === 'yes'
    const jurisdictionId = answers.jurisdiction
    const teacher = answers.drivingInstructor as string
    const email = answers.email as string
    const phone = removeCountryCode(answers.phone as string)

    const postHealthDeclaration = async (
      nationalId: string,
      answers: FormValue,
      auth: User,
    ) => {
      await this.drivingLicenseService
        .postHealthDeclaration(
          nationalId,
          PostTemporaryLicenseWithHealthDeclarationMapper(
            answers as DrivingLicenseSchema,
          ),
          auth.authorization.split(' ')[1] ?? '',
        )
        .catch((e) => {
          throw new Error(
            `Unexpected error (creating driver's license with health declarations): '${e}'`,
          )
        })
    }

    if (applicationFor === 'B-full-renewal-65') {
      const healthCertificate: string = await this.getBase64EncodedAttachment(
        application,
      )
      return this.drivingLicenseService.renewDrivingLicense65AndOver(
        auth.authorization.replace('Bearer ', ''),
        {
          districtId: jurisdictionId as number,
          Base64EncodedHealthCertificate: healthCertificate,
        },
      )
    } else if (applicationFor === 'B-full') {
      return this.drivingLicenseService.newDrivingLicense(nationalId, {
        jurisdictionId: jurisdictionId as number,
        needsToPresentHealthCertificate: needsHealthCert || remarks,
        needsToPresentQualityPhoto: needsQualityPhoto,
      })
    } else if (applicationFor === 'B-temp') {
      if (needsHealthCert) {
        await postHealthDeclaration(nationalId, answers, auth)
      }
      return this.drivingLicenseService.newTemporaryDrivingLicense(
        nationalId,
        auth.authorization.replace('Bearer ', ''),
        {
          jurisdictionId: jurisdictionId as number,
          needsToPresentHealthCertificate: needsHealthCert,
          needsToPresentQualityPhoto: needsQualityPhoto,
          teacherNationalId: teacher,
          email: email,
          phone: phone,
        },
      )
    }

    throw new Error('application for unknown type of license')
  }

  async submitAssessmentConfirmation({
    application,
  }: TemplateApiModuleActionProps) {
    const { answers } = application
    const studentNationalId = (answers.student as { nationalId: string })
      .nationalId
    const teacherNationalId = application.applicant

    try {
      const result = await this.drivingLicenseService.newDrivingAssessment(
        studentNationalId as string,
        teacherNationalId,
      )

      if (result.success) {
        await this.sharedTemplateAPIService.sendEmail(
          generateDrivingAssessmentApprovalEmail,
          application,
        )
        return {
          success: result.success,
        }
      } else {
        throw new Error(
          `Unexpected error (creating driver's license): '${result.errorMessage}'`,
        )
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'FetchError') {
        const err = e as unknown as FetchError
        throw new TemplateApiError(
          {
            title:
              err.problem?.title || coreErrorMessages.failedDataProviderSubmit,
            summary: err.problem?.detail || '',
          },
          400,
        )
      }
    }
  }

  async glassesCheck({ auth }: TemplateApiModuleActionProps): Promise<boolean> {
    const licences: DriverLicenseWithoutImages[] =
      await this.drivingLicenseService.getAllDriverLicenses(auth.authorization)
    const hasGlasses: boolean = licences.some((license) => {
      return !!license.comments?.some((comment) => comment.nr?.includes('01.'))
    })
    return hasGlasses
  }

  private async getBase64EncodedAttachment(
    application: ApplicationWithAttachments,
  ): Promise<string> {
    const attachments = getValueViaPath(
      application.answers,
      'healthDeclarationAge65.attachment',
    ) as Array<{ key: string; name: string }>

    const hasAttachments = attachments && attachments?.length > 0

    if (!hasAttachments) {
      return Promise.reject({})
    }

    const attachmentKey = attachments[0].key
    const fileName = (
      application.attachments as {
        [key: string]: string
      }
    )[attachmentKey]

    const { bucket, key } = AmazonS3URI(fileName)

    const uploadBucket = bucket
    const file = await this.s3
      .getObject({
        Bucket: uploadBucket,
        Key: key,
      })
      .promise()
    const fileContent = file.Body as Buffer

    return fileContent?.toString('base64') || ''
  }
}
