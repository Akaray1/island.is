import { Inject, Injectable } from '@nestjs/common'
import { EhicApi } from '@island.is/clients/ehic-client-v1'
import { LOGGER_PROVIDER } from '@island.is/logging'
import type { Logger } from '@island.is/logging'
import {
  ApplicationTypes,
  ApplicationWithAttachments,
} from '@island.is/application/types'
import { BaseTemplateApiService } from '../../base-template-api.service'
import {
  CardResponse,
  TempData,
  NationalRegistry,
  ApplicantCard,
  CardType,
  FormApplyType,
} from './types'
import { TemplateApiModuleActionProps } from '../../../types'
import { Auth, AuthMiddleware } from '@island.is/auth-nest-tools'

@Injectable()
export class EuropeanHealthInsuranceCardService extends BaseTemplateApiService {
  constructor(
    private readonly ehicApi: EhicApi,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
  ) {
    super(ApplicationTypes.EUROPEAN_HEALTH_INSURANCE_CARD)
  }

  /** Helper function. Get's applicants by type. If no type is provided then it returns from national registry */
  getApplicants(
    application: ApplicationWithAttachments,
    applyType: string | null = null,
  ): string[] {
    // Get from national registry
    if (!applyType) {
      const nridArr: string[] = []
      const userData = application.externalData.nationalRegistry
        ?.data as NationalRegistry

      if (userData?.nationalId) {
        nridArr.push(userData.nationalId)
      }

      const spouseData = application?.externalData?.nationalRegistrySpouse
        ?.data as NationalRegistry
      if (spouseData?.nationalId) {
        nridArr.push(spouseData.nationalId)
      }

      const custodyData = (application?.externalData
        ?.childrenCustodyInformation as unknown) as NationalRegistry[]
      for (let i = 0; i < custodyData?.length; i++) {
        nridArr.push(custodyData[i].nationalId)
      }
      return nridArr
    }
    return application.answers[applyType] as string[]
  }

  toCommaDelimitedList(arr: string[]) {
    let listString = ''
    for (let i = 0; i < arr.length; i++) {
      listString += arr[i]
      if (i !== arr.length - 1) {
        listString += ','
      }
    }
    return listString
  }

  /** Get's applicants that want a temporary card (PDF) and their current physical (plastic) card number */
  getPDFApplicantsAndCardNumber(
    application: ApplicationWithAttachments,
  ): ApplicantCard[] {
    const pdfApplicantArr: ApplicantCard[] = []

    const applicants = this.getApplicants(
      application,
      FormApplyType.APPLYING_FOR_PDF,
    )

    // Initial card Response
    const cardResponse = application.externalData.cardResponse
      ?.data as CardResponse[]
    // New card response
    const newPlasticCardsResponse = application.externalData
      .applyForCardsResponse?.data as CardResponse[]

    if (applicants) {
      for (let i = 0; i < applicants.length; i++) {
        if (newPlasticCardsResponse && newPlasticCardsResponse.length > 0) {
          const newCardResponse = newPlasticCardsResponse.find(
            (x) => x.applicantNationalId === applicants[i],
          )
          if (newCardResponse) {
            const plasticCard = newCardResponse?.cards?.find(
              (x) => x.isPlastic === true,
            )
            if (plasticCard) {
              pdfApplicantArr.push({
                cardNumber: plasticCard.cardNumber ?? '',
                nationalId: applicants[i],
              })
              continue
            }
          }
        }

        const currentCardResponse = cardResponse.find(
          (x) => x.applicantNationalId === applicants[i],
        )
        if (currentCardResponse) {
          const plasticCard = currentCardResponse?.cards?.find(
            (x) => x.isPlastic === true,
          )
          if (plasticCard) {
            pdfApplicantArr.push({
              cardNumber: plasticCard?.cardNumber ?? '',
              nationalId: applicants[i],
            })
          }
        }
      }
    }

    return pdfApplicantArr
  }

  async getCardResponse({ auth, application }: TemplateApiModuleActionProps) {
    this.logger.info('getCardResponse')
    const nridArr = this.getApplicants(application)

    try {
      const resp = await this.ehicApi
        .withMiddleware(new AuthMiddleware(auth as Auth))
        .cardStatus({
          applicantnationalids: this.toCommaDelimitedList(nridArr),
        })

      this.logger.info('ná í card response')
      this.logger.info(resp)

      if (!resp) {
        this.logger.error('EHIC.API response empty from getCardResponse', resp)
      }

      return resp
    } catch (e) {
      this.logger.info('ná í card response error')
      this.logger.info(e)
      this.logger.error('EHIC.API error getCardResponse', e)
      throw e
    }
    return null
  }

  async applyForPhysicalAndTemporary(obj: TemplateApiModuleActionProps) {
    const result = await this.applyForPhysicalCard(obj)
    await this.applyForTemporaryCard(obj)
    return result
  }

  async applyForPhysicalCard({
    auth,
    application,
  }: TemplateApiModuleActionProps) {
    this.logger.info('applyForPhysicalCard')
    const applicants = this.getApplicants(
      application,
      FormApplyType.APPLYING_FOR_PLASTIC,
    )
    const cardResponses: CardResponse[] = []

    for (let i = 0; i < applicants?.length; i++) {
      try {
        const res = await this.ehicApi
          .withMiddleware(new AuthMiddleware(auth as Auth))
          .requestCard({
            applicantnationalid: applicants[i],
            cardtype: CardType.PLASTIC,
          })
        cardResponses.push(res)
      } catch (error) {
        this.logger.error('EHIC.API error applyForPhysicalCard', error)
        throw error
      }
    }
    return cardResponses
  }

  async applyForTemporaryCard({
    auth,
    application,
  }: TemplateApiModuleActionProps) {
    this.logger.info('applyForTemporaryCard')
    const applicants = this.getApplicants(
      application,
      FormApplyType.APPLYING_FOR_PDF,
    )

    for (let i = 0; i < applicants?.length; i++) {
      try {
        await this.ehicApi
          .withMiddleware(new AuthMiddleware(auth as Auth))
          .requestCard({
            applicantnationalid: applicants[i],
            cardtype: CardType.PDF,
          })
      } catch (error) {
        this.logger.error('EHIC.API error applyForTemporaryCard', error)
        throw error
      }
    }
  }

  async getTemporaryCard({ auth, application }: TemplateApiModuleActionProps) {
    const applicants = this.getPDFApplicantsAndCardNumber(application)
    const pdfArray: TempData[] = []

    for (let i = 0; i < applicants?.length; i++) {
      try {
        const res = await this.ehicApi
          .withMiddleware(new AuthMiddleware(auth as Auth))
          .fetchTempPDFCard({
            applicantnationalid: applicants[i].nationalId ?? '',
            cardnumber: applicants[i].cardNumber ?? '',
          })
        pdfArray.push(res)
      } catch (error) {
        this.logger.error('EHIC.API error getTemporaryCard', error)
        throw error
      }
    }
    this.logger.info('pdf array length')
    this.logger.info(pdfArray.length)
    return pdfArray
  }
}
