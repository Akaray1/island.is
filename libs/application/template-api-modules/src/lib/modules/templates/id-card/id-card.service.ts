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
// import { PassportSchema } from '@island.is/application/templates/passport'
import { PassportsService } from '@island.is/clients/passports'
import { BaseTemplateApiService } from '../../base-template-api.service'
import {
  ApplicationTypes,
  InstitutionNationalIds,
} from '@island.is/application/types'
import { TemplateApiError } from '@island.is/nest/problem'

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

  async createCharge({
    application: { id, answers },
    auth,
  }: TemplateApiModuleActionProps) {
    const chargeItemCode = getValueViaPath<string>(answers, 'chargeItemCode')
    if (!chargeItemCode) {
      throw new Error('chargeItemCode missing in request')
    }
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

  async checkForDiscount({ application, auth }: TemplateApiModuleActionProps) {
    const { answers, externalData } = application

    if (!(externalData.checkForDiscount?.data as DiscountCheck)?.hasDiscount) {
      const { age } = info(auth.nationalId)

      if (age < 18 || age >= 60) {
        return {
          hasDiscount: true,
        }
      }
      const disabilityCheck = getValueViaPath<YesOrNo>(
        answers,
        'personalInfo.hasDisabilityDiscount',
      )

      //TODO: implement check with Tryggingastofnun
      if (disabilityCheck?.includes(YES)) {
        return {
          hasDiscount: true,
        }
      }
    }
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

    // TODO: Get correct answers
    // const answers = application.answers as TransferOfVehicleOwnershipAnswers

    // Email to parent A
    // await this.sharedTemplateAPIService
    //   .sendEmail((props) => generateApplicationRejectEmail(props, answers.parentA), application)
    //   .catch(() => {
    //     this.logger.error(`Error sending email about initReview`)
    //   })

    // Email to parent B
    // await this.sharedTemplateAPIService
    //   .sendEmail((props) => generateApplicationRejectEmail(props, answers.parentB), application)
    //   .catch(() => {
    //     this.logger.error(`Error sending email about initReview`)
    //   })
  }

  //   async submitPassportApplication({
  //     application,
  //     auth,
  //   }: TemplateApiModuleActionProps): Promise<{
  //     success: boolean
  //     orderId?: string[]
  //   }> {
  //     const applicationId = {
  //       guid: application.id,
  //     }
  //     this.logger.info('submitPassportApplication', applicationId)
  //     const isPayment = await this.sharedTemplateAPIService.getPaymentStatus(
  //       auth,
  //       application.id,
  //     )

  //     if (!isPayment?.fulfilled) {
  //       this.logger.error(
  //         'Trying to submit Passportapplication that has not been paid.',
  //       )
  //       throw new Error(
  //         'Ekki er hægt að skila inn umsókn af því að ekki hefur tekist að taka við greiðslu.',
  //       )
  //     }
  //     try {
  //       const {
  //         passport,
  //         personalInfo,
  //         childsPersonalInfo,
  //         service,
  //       }: PassportSchema = application.answers as PassportSchema

  //       const forUser = !!passport.userPassport
  //       let result
  //       if (forUser) {
  //         this.logger.info('preregisterIdentityDocument', applicationId)
  //         result = await this.passportApi.preregisterIdentityDocument(auth, {
  //           guid: application.id,
  //           appliedForPersonId: auth.nationalId,
  //           priority: service.type === 'regular' ? 0 : 1,
  //           deliveryName: service.dropLocation,
  //           contactInfo: {
  //             phoneAtHome: personalInfo.phoneNumber,
  //             phoneAtWork: personalInfo.phoneNumber,
  //             phoneMobile: personalInfo.phoneNumber,
  //             email: personalInfo.email,
  //           },
  //         })
  //         this.logger.info('preregisterIdentityDocument result', result)
  //       } else {
  //         this.logger.info('preregisterChildIdentityDocument', applicationId)
  //         result = await this.passportApi.preregisterChildIdentityDocument(auth, {
  //           guid: application.id,
  //           appliedForPersonId: childsPersonalInfo.nationalId,
  //           priority: service.type === 'regular' ? 0 : 1,
  //           deliveryName: service.dropLocation,
  //           approvalA: {
  //             personId: childsPersonalInfo.guardian1.nationalId.replace('-', ''),
  //             name: childsPersonalInfo.guardian1.name,
  //             approved: application.created,
  //           },
  //           approvalB: childsPersonalInfo.guardian2 && {
  //             personId: childsPersonalInfo.guardian2.nationalId.replace('-', ''),
  //             name: childsPersonalInfo.guardian2.name,
  //             approved: new Date(),
  //           },
  //           contactInfo: {
  //             phoneAtHome: childsPersonalInfo.guardian1.phoneNumber,
  //             phoneAtWork: childsPersonalInfo.guardian1.phoneNumber,
  //             phoneMobile: childsPersonalInfo.guardian1.phoneNumber,
  //             email: childsPersonalInfo.guardian1.email,
  //           },
  //         })
  //         this.logger.info('preregisterChildIdentityDocument result', result)
  //       }

  //       if (!result || !result.success) {
  //         throw new Error(`Application submission failed (${result})`)
  //       }

  //       return result
  //     } catch (e) {
  //       this.log('error', 'Submitting passport failed', {
  //         e,
  //       })

  //       throw e
  //     }
  //   }

  //   private log(lvl: 'error' | 'info', message: string, meta: unknown) {
  //     this.logger.log(lvl, `[passport] ${message}`, meta)
  //   }
}
