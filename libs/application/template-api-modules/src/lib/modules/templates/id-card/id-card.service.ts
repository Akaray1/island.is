import { Inject, Injectable } from '@nestjs/common'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { SharedTemplateApiService } from '../../shared'
import { TemplateApiModuleActionProps } from '../../../types'
import { coreErrorMessages, getValueViaPath } from '@island.is/application/core'
import {
  YES,
  YesOrNo,
  DiscountCheck,
  DistrictCommissionerAgencies,
} from './constants'
import { info } from 'kennitala'
import {
  ChargeFjsV2ClientService,
  getPaymentIdFromExternalData,
} from '@island.is/clients/charge-fjs-v2'
import { generateAssignParentBApplicationEmail } from './emailGenerators/assignParentBEmail'
import { PassportsService } from '@island.is/clients/passports'
import { BaseTemplateApiService } from '../../base-template-api.service'
import {
  ApplicationTypes,
  InstitutionNationalIds,
} from '@island.is/application/types'
import { TemplateApiError } from '@island.is/nest/problem'
import {
  IdCardAnswers,
  Services,
} from '@island.is/application/templates/id-card'
import { generateApplicationRejectEmail } from './emailGenerators/rejectApplicationEmail'
import { generateApplicationSubmittedEmail } from './emailGenerators/applicationSubmittedEmail'

@Injectable()
export class IdCardService extends BaseTemplateApiService {
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly sharedTemplateAPIService: SharedTemplateApiService,
    private readonly chargeFjsV2ClientService: ChargeFjsV2ClientService,
    private passportApi: PassportsService,
  ) {
    super(ApplicationTypes.ID_CARD)
  }

  async identityDocument({ auth, application }: TemplateApiModuleActionProps) {
    const identityDocument = await this.passportApi.getCurrentPassport(auth)
    this.logger.warn(
      'No passport found for user for application: ',
      application.id,
    )
    if (!identityDocument) {
      throw new TemplateApiError(
        {
          title: coreErrorMessages.failedDataProvider,
          summary: coreErrorMessages.errorDataProvider,
        },
        400,
      )
    }
    return identityDocument
  }

  async assignParentB({ application, auth }: TemplateApiModuleActionProps) {
    // 1. Validate payment

    // 1a. Make sure a paymentUrl was created
    // TODO: Make sure this is correct according to our external data answers
    const { paymentUrl } = application.externalData.createCharge.data as {
      paymentUrl: string
    }
    if (!paymentUrl) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // 1b. Make sure payment is fulfilled (has been paid)
    const payment: { fulfilled: boolean } | undefined =
      await this.sharedTemplateAPIService.getPaymentStatus(auth, application.id)
    if (!payment?.fulfilled) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // 2. Notify parent B that they need to review

    // TODO: Write in error log email of parentB
    await this.sharedTemplateAPIService
      .sendEmail(generateAssignParentBApplicationEmail, application)
      .catch(() => {
        this.logger.error(`Error sending email about initReview`)
      })
  }

  async rejectApplication({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<void> {
    // 1. Delete charge so that the seller gets reimburshed
    const chargeId = getPaymentIdFromExternalData(application)
    if (chargeId) {
      await this.chargeFjsV2ClientService.deleteCharge(chargeId)
    }
    // 2. Notify everyone in the process that the application has been withdrawn
    const answers = application.answers as IdCardAnswers
    const parentA = {
      ssn: answers.applicantInformation.firstGuardianNationalId || '',
      name: answers.applicantInformation.firstGuardianName || '',
      email: answers.applicantInformation.firstGuardianEmail,
      phone: answers.applicantInformation.firstGuardianPhoneNumber,
    }
    const parentB = answers.applicantInformation.secondGuardianNationalId
      ? {
          ssn: answers.applicantInformation.secondGuardianNationalId || '',
          name: answers.applicantInformation.secondGuardianName || '',
          email: answers.applicantInformation.secondGuardianEmail,
          phone: answers.applicantInformation.secondGuardianPhoneNumber,
        }
      : undefined
    // Email to parent A
    await this.sharedTemplateAPIService
      .sendEmail(
        (props) => generateApplicationRejectEmail(props, parentA),
        application,
      )
      .catch(() => {
        this.logger.error(`Error sending email about initReview`)
      })
    if (parentB) {
      // Email to parent B
      await this.sharedTemplateAPIService
        .sendEmail(
          (props) => generateApplicationRejectEmail(props, parentB),
          application,
        )
        .catch(() => {
          this.logger.error(`Error sending email about initReview`)
        })
    }
  }

  async submitApplication({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<void> {
    // 1. Validate payment

    // 1a. Make sure a paymentUrl was created
    const { paymentUrl } = application.externalData.createCharge.data as {
      paymentUrl: string
    }
    if (!paymentUrl) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // 1b. Make sure payment is fulfilled (has been paid)
    const payment: { fulfilled: boolean } | undefined =
      await this.sharedTemplateAPIService.getPaymentStatus(auth, application.id)
    if (!payment?.fulfilled) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // TODO: Actually submit application

    // 3. Notify everyone in the process that the application has successfully been submitted

    // TODO: Get correct answers
    const answers = application.answers as IdCardAnswers

    const userIsApplicant =
      answers.applicantInformation.applicantNationalId === auth.nationalId
    const applicantInformation = answers.applicantInformation

    let result
    if (userIsApplicant) {
      result = await this.passportApi.preregisterIdentityDocument(auth, {
        guid: application.id,
        appliedForPersonId: auth.nationalId,
        priority:
          answers.priceList.priceChoice === Services.REGULAR ||
          answers.priceList.priceChoice === Services.REGULAR_DISCOUNT
            ? 0
            : 1,
        deliveryName: answers.priceList.location,
        contactInfo: {
          phoneAtHome: applicantInformation.applicantPhoneNumber,
          phoneAtWork: applicantInformation.applicantPhoneNumber,
          phoneMobile: applicantInformation.applicantPhoneNumber,
          email: applicantInformation.applicantEmail,
        },
      })
    } else {
      const approvalB = {
        personId:
          applicantInformation.secondGuardianNationalId?.replace('-', '') || '',
        name: applicantInformation.secondGuardianName || '',
        approved: new Date(),
      }
      result = await this.passportApi.preregisterChildIdentityDocument(auth, {
        guid: application.id,
        appliedForPersonId: applicantInformation.applicantNationalId,
        priority:
          answers.priceList.priceChoice === Services.REGULAR_DISCOUNT ? 0 : 1,
        deliveryName: answers.priceList.location,
        approvalA: {
          personId:
            applicantInformation.firstGuardianNationalId?.replace('-', '') ||
            '',
          name: applicantInformation.firstGuardianName || '',
          approved: application.created,
        },
        approvalB: applicantInformation.secondGuardianNationalId
          ? approvalB
          : undefined, // TODO make this better
        contactInfo: {
          phoneAtHome: applicantInformation.firstGuardianPhoneNumber,
          phoneAtWork: applicantInformation.firstGuardianPhoneNumber,
          phoneMobile: applicantInformation.firstGuardianPhoneNumber,
          email: applicantInformation.firstGuardianEmail,
        },
      })
    }

    const parentA = {
      ssn: answers.applicantInformation.firstGuardianNationalId || '',
      name: answers.applicantInformation.firstGuardianName || '',
      email: answers.applicantInformation.firstGuardianEmail,
      phone: answers.applicantInformation.firstGuardianPhoneNumber,
    }
    const parentB = answers.applicantInformation.secondGuardianNationalId
      ? {
          ssn: answers.applicantInformation.secondGuardianNationalId || '',
          name: answers.applicantInformation.secondGuardianName || '',
          email: answers.applicantInformation.secondGuardianEmail,
          phone: answers.applicantInformation.secondGuardianPhoneNumber,
        }
      : undefined
    // Email to parent A
    await this.sharedTemplateAPIService
      .sendEmail(
        (props) => generateApplicationSubmittedEmail(props, parentA),
        application,
      )
      .catch(() => {
        this.logger.error(`Error sending email about submit application`)
      })
    if (parentB) {
      // Email to parent B
      await this.sharedTemplateAPIService
        .sendEmail(
          (props) => generateApplicationSubmittedEmail(props, parentB),
          application,
        )
        .catch(() => {
          this.logger.error(`Error sending email about submit application`)
        })
    }
  }

  //   private log(lvl: 'error' | 'info', message: string, meta: unknown) {
  //     this.logger.log(lvl, `[passport] ${message}`, meta)
  //   }
}