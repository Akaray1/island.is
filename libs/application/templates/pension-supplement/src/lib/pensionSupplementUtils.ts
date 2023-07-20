import { MessageDescriptor } from 'react-intl'
import { getValueViaPath } from '@island.is/application/core'
import { Application, Option } from '@island.is/application/types'
import { ApplicationReason, AttachmentLabel } from './constants'
import { pensionSupplementFormMessage } from './messages'

interface FileType {
  key: string
  name: string
}

interface PensionSupplementAttachments {
  assistedCareAtHome?: FileType[]
  additionalDocuments?: FileType[]
  houseRentAgreement?: FileType[]
  houseRentAllowance?: FileType[]
  assistedLiving?: FileType[]
  purchaseOfHearingAids?: FileType[]
  halfwayHouse?: FileType[]
}

enum AttachmentTypes {
  ASSISTED_CARE_AT_HOME = 'assistedCareAtHome',
  MEDICINE_COST = 'medicineCost',
  HOUSE_RENT = 'houseRent',
  ASSISTED_LIVING = 'assistedLiving',
  PURCHASE_OF_HEARING_AIDS = 'purchaseOfHearingAids',
  OXYGEN_FILTER_COST = 'oxygenFilterCost',
  HALFWAY_HOUSE = 'halfwayHouse',
  ADDITIONAL_DOCUMENTS = 'additionalDocuments',
}

interface Attachments {
  attachments: FileType[]
  label: MessageDescriptor
}

export function getApplicationAnswers(answers: Application['answers']) {
  const applicantEmail = getValueViaPath(
    answers,
    'applicantInfo.email',
  ) as string

  const applicantPhonenumber = getValueViaPath(
    answers,
    'applicantInfo.phonenumber',
  ) as string

  const bank = getValueViaPath(answers, 'paymentInfo.bank') as string

  const applicationReason = getValueViaPath(
    answers,
    'applicationReason',
  ) as ApplicationReason[]

  return {
    applicantEmail,
    applicantPhonenumber,
    bank,
    applicationReason,
  }
}

export function getApplicationExternalData(
  externalData: Application['externalData'],
) {
  const applicantName = getValueViaPath(
    externalData,
    'nationalRegistry.data.fullName',
  ) as string

  const applicantNationalId = getValueViaPath(
    externalData,
    'nationalRegistry.data.nationalId',
  ) as string

  const applicantAddress = getValueViaPath(
    externalData,
    'nationalRegistry.data.address.streetAddress',
  ) as string

  const applicantPostalCode = getValueViaPath(
    externalData,
    'nationalRegistry.data.address.postalCode',
  ) as string

  const applicantLocality = getValueViaPath(
    externalData,
    'nationalRegistry.data.address.locality',
  ) as string

  const applicantMunicipality = applicantPostalCode + ', ' + applicantLocality

  const bank = getValueViaPath(
    externalData,
    'userProfile.data.bankInfo',
  ) as string

  return {
    applicantName,
    applicantNationalId,
    applicantAddress,
    applicantMunicipality,
    bank,
  }
}

export const formatBankInfo = (bankInfo: string) => {
  const formattedBankInfo = bankInfo.replace(/[^0-9]/g, '')
  if (formattedBankInfo && formattedBankInfo.length === 12) {
    return formattedBankInfo
  }

  return bankInfo
}

export function getApplicationReasonOptions() {
  const options: Option[] = [
    {
      value: ApplicationReason.MEDICINE_COST,
      label: pensionSupplementFormMessage.info.applicationReasonMedicineCost,
    },
    {
      value: ApplicationReason.ASSISTED_CARE_AT_HOME,
      label:
        pensionSupplementFormMessage.info.applicationReasonAssistedCareAtHome,
    },
    {
      value: ApplicationReason.OXYGEN_FILTER_COST,
      label:
        pensionSupplementFormMessage.info.applicationReasonOxygenFilterCost,
    },
    {
      value: ApplicationReason.PURCHASE_OF_HEARING_AIDS,
      label:
        pensionSupplementFormMessage.info
          .applicationReasonPurchaseOfHearingAids,
    },
    {
      value: ApplicationReason.ASSISTED_LIVING,
      label: pensionSupplementFormMessage.info.applicationReasonAssistedLiving,
    },
    {
      value: ApplicationReason.HALFWAY_HOUSE,
      label: pensionSupplementFormMessage.info.applicationReasonHalfwayHouse,
    },
    {
      value: ApplicationReason.HOUSE_RENT,
      label: pensionSupplementFormMessage.info.applicationReasonHouseRent,
    },
  ]
  return options
}

export function getAttachments(application: Application) {
  const getAttachmentDetails = (
    attachmentsArr: FileType[] | undefined,
    attachmentType: AttachmentTypes,
  ) => {
    if (attachmentsArr && attachmentsArr.length > 0) {
      attachments.push({
        attachments: attachmentsArr,
        label: AttachmentLabel[attachmentType],
      })
    }
  }

  const { answers } = application
  const { applicationReason } = getApplicationAnswers(answers)
  const attachments: Attachments[] = []

  const pensionSupplementAttachments = answers.fileUpload as PensionSupplementAttachments

  applicationReason.forEach((reason) => {
    if (reason === ApplicationReason.ASSISTED_CARE_AT_HOME) {
      getAttachmentDetails(
        pensionSupplementAttachments?.assistedCareAtHome,
        AttachmentTypes.ASSISTED_CARE_AT_HOME,
      )
    }
    if (reason === ApplicationReason.HOUSE_RENT) {
      if (
        pensionSupplementAttachments?.houseRentAgreement &&
        pensionSupplementAttachments?.houseRentAgreement.length > 0 &&
        pensionSupplementAttachments?.houseRentAllowance &&
        pensionSupplementAttachments?.houseRentAllowance.length > 0
      ) {
        getAttachmentDetails(
          [
            ...pensionSupplementAttachments.houseRentAgreement,
            ...pensionSupplementAttachments.houseRentAllowance,
          ],
          AttachmentTypes.HOUSE_RENT,
        )
      }
    }
    if (reason === ApplicationReason.ASSISTED_LIVING) {
      getAttachmentDetails(
        pensionSupplementAttachments?.assistedLiving,
        AttachmentTypes.ASSISTED_LIVING,
      )
    }
    if (reason === ApplicationReason.PURCHASE_OF_HEARING_AIDS) {
      getAttachmentDetails(
        pensionSupplementAttachments?.purchaseOfHearingAids,
        AttachmentTypes.PURCHASE_OF_HEARING_AIDS,
      )
    }
    if (reason === ApplicationReason.HALFWAY_HOUSE) {
      getAttachmentDetails(
        pensionSupplementAttachments?.halfwayHouse,
        AttachmentTypes.HALFWAY_HOUSE,
      )
    }
  })

  // if (
  //   pensionSupplementAttachments.additionalDocuments &&
  //   pensionSupplementAttachments.additionalDocuments?.length > 0
  // ) {
  //   getAttachmentDetails(
  //     pensionSupplementAttachments?.additionalDocuments,
  //     AttachmentTypes.ADDITIONAL_DOCUMENTS,
  //   )
  // }

  return attachments
}
