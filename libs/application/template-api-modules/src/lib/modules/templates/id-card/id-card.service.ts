import { Inject, Injectable } from '@nestjs/common'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { SharedTemplateApiService } from '../../shared'
import { TemplateApiModuleActionProps } from '../../../types'
import { coreErrorMessages, getValueViaPath } from '@island.is/application/core'
import {
  DistrictCommissionerAgencies,
  IdentityDocumentChild,
} from './constants'
import {
  ChargeFjsV2ClientService,
  getPaymentIdFromExternalData,
} from '@island.is/clients/charge-fjs-v2'
import { generateAssignParentBApplicationEmail } from './emailGenerators/assignParentBEmail'
import { PassportsService } from '@island.is/clients/passports'
import { BaseTemplateApiService } from '../../base-template-api.service'
import { ApplicationTypes } from '@island.is/application/types'
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
    const identityDocument = await this.passportApi.getCurrentPassport(
      auth,
      'Id',
    )
    if (!identityDocument) {
      this.logger.warn(
        'No passport found for user for application: ',
        application.id,
      )
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

  async deliveryAddress({ auth, application }: TemplateApiModuleActionProps) {
    const res = await this.passportApi.getDeliveryAddress(auth)
    if (!res) {
      this.logger.warn(
        'No delivery address for passport found for user for application: ',
        application.id,
      )
      throw new TemplateApiError(
        {
          title: coreErrorMessages.failedDataProvider,
          summary: coreErrorMessages.errorDataProvider,
        },
        400,
      )
    }

    // We want to make sure that Þjóðskrá locations are the first to appear, their key starts with a number
    const deliveryAddresses = (res as DistrictCommissionerAgencies[]).sort(
      (a, b) => {
        const keyA = a.key.toUpperCase() // ignore upper and lowercase
        const keyB = b.key.toUpperCase() // ignore upper and lowercase
        if (keyA < keyB) {
          return -1
        }
        if (keyA > keyB) {
          return 1
        }

        // keys must be equal
        return 0
      },
    )

    return deliveryAddresses
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
      ssn: answers.firstGuardianInformation?.nationalId || '',
      name: answers.firstGuardianInformation?.name || '',
      email: answers.firstGuardianInformation?.email,
      phone: answers.firstGuardianInformation?.phoneNumber,
    }
    const parentB = answers.secondGuardianInformation?.nationalId
      ? {
          ssn: answers.secondGuardianInformation?.nationalId || '',
          name: answers.secondGuardianInformation?.name || '',
          email: answers.secondGuardianInformation?.email,
          phone: answers.secondGuardianInformation?.phoneNumber,
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

    // 2. Submit the application
    const answers = application.answers as IdCardAnswers

    const userIsApplicant =
      answers.applicantInformation.nationalId === auth.nationalId
    const applicantInformation = answers.applicantInformation
    const firstGuardianInformation = answers.firstGuardianInformation
    const secondGuardianInformation = answers.secondGuardianInformation
    const applicantChild = (
      getValueViaPath(
        application.externalData,
        'identityDocument.data.childPassports',
        [],
      ) as Array<IdentityDocumentChild>
    )?.find((child) => {
      return child.childNationalId === applicantInformation.nationalId
    })

    if (userIsApplicant) {
      await this.passportApi.preregisterIdentityDocument(auth, {
        guid: application.id,
        appliedForPersonId: auth.nationalId,
        priority:
          answers.priceList.priceChoice === Services.REGULAR ||
          answers.priceList.priceChoice === Services.REGULAR_DISCOUNT
            ? 0
            : 1,
        deliveryName: answers.priceList.location,
        contactInfo: {
          phoneAtHome: applicantInformation.phoneNumber,
          phoneAtWork: applicantInformation.phoneNumber,
          phoneMobile: applicantInformation.phoneNumber,
          email: applicantInformation.email,
        },
      })
    } else {
      const approvalB = {
        personId: secondGuardianInformation?.nationalId?.replace('-', '') || '',
        name: secondGuardianInformation?.name || '',
        approved: new Date(),
      }
      await this.passportApi.preregisterChildIdentityDocument(auth, {
        guid: application.id,
        appliedForPersonId: applicantInformation.nationalId,
        priority:
          answers.priceList.priceChoice === Services.REGULAR_DISCOUNT ? 0 : 1,
        deliveryName: answers.priceList.location,
        approvalA: {
          personId:
            firstGuardianInformation?.nationalId?.replace('-', '') || '',
          name: firstGuardianInformation?.name || '',
          approved: application.created,
        },
        approvalB: applicantChild?.secondParent ? approvalB : undefined, // TODO make this better
        contactInfo: {
          phoneAtHome: firstGuardianInformation?.phoneNumber || '',
          phoneAtWork: firstGuardianInformation?.phoneNumber || '',
          phoneMobile: firstGuardianInformation?.phoneNumber || '',
          email: firstGuardianInformation?.email || '',
        },
      })
    }

    // 3. Notify everyone in the process that the application has successfully been submitted
    const parentA = {
      ssn: firstGuardianInformation?.nationalId || '',
      name: firstGuardianInformation?.name || '',
      email: firstGuardianInformation?.email,
      phone: firstGuardianInformation?.phoneNumber,
    }
    const parentB = applicantChild?.secondParent
      ? {
          ssn: secondGuardianInformation?.nationalId || '',
          name: secondGuardianInformation?.name || '',
          email: secondGuardianInformation?.email,
          phone: secondGuardianInformation?.phoneNumber,
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
