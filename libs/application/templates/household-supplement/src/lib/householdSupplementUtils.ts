import { MessageDescriptor } from 'react-intl'
import { getValueViaPath } from '@island.is/application/core'
import {
  HouseholdSupplementHousing,
  YES,
  NO,
  AttachmentLabel,
  MONTHS,
} from './constants'
import { Option, Application, YesOrNo } from '@island.is/application/types'
import { householdSupplementFormMessage } from './messages'
import { addMonths, addYears, subYears } from 'date-fns'
import * as kennitala from 'kennitala'

interface FileType {
  key: string
  name: string
}

interface LeaseAgreementSchoolConfirmationAdditionalDocuments {
  leaseAgreement?: FileType[]
  schoolConfirmation?: FileType[]
  additionalDocuments?: FileType[]
}

enum AttachmentTypes {
  LEASE_AGREEMENT = 'leaseAgreement',
  SCHOOL_CONFIRMATION = 'schoolConfirmation',
  ADDITIONAL_DOCUMENTS = 'additionalDocuments',
}

interface Attachments {
  attachments: FileType[]
  label: MessageDescriptor
}

export function getApplicationAnswers(answers: Application['answers']) {
  const bank = getValueViaPath(answers, 'paymentInfo.bank') as string
  const householdSupplementHousing = getValueViaPath(
    answers,
    'householdSupplement.housing',
  ) as HouseholdSupplementHousing

  const householdSupplementChildren = getValueViaPath(
    answers,
    'householdSupplement.children',
  ) as YesOrNo

  const selectedYear = getValueViaPath(answers, 'period.year') as string

  const selectedMonth = getValueViaPath(answers, 'period.month') as string

  return {
    householdSupplementHousing,
    householdSupplementChildren,
    bank,
    selectedYear,
    selectedMonth,
  }
}

export function getApplicationExternalData(
  externalData: Application['externalData'],
) {
  const cohabitants = getValueViaPath(
    externalData,
    'nationalRegistryCohabitants.data',
    [],
  ) as string[]

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

  const hasSpouse = getValueViaPath(
    externalData,
    'nationalRegistrySpouse.data',
  ) as object

  const spouseName = getValueViaPath(
    externalData,
    'nationalRegistrySpouse.data.name',
  ) as string

  const spouseNationalId = getValueViaPath(
    externalData,
    'nationalRegistrySpouse.data.nationalId',
  ) as string

  const maritalStatus = getValueViaPath(
    externalData,
    'nationalRegistrySpouse.data.maritalStatus',
  ) as string

  const bank = getValueViaPath(
    externalData,
    'userProfile.data.bankInfo',
  ) as string

  return {
    cohabitants,
    applicantName,
    applicantNationalId,
    applicantAddress,
    applicantMunicipality,
    hasSpouse,
    spouseName,
    spouseNationalId,
    maritalStatus,
    bank,
  }
}

export function getYesNOOptions() {
  const options: Option[] = [
    {
      value: YES,
      label: householdSupplementFormMessage.shared.yes,
    },
    {
      value: NO,
      label: householdSupplementFormMessage.shared.no,
    },
  ]
  return options
}

export function isExistsCohabitantOlderThan25(
  externalData: Application['externalData'],
) {
  const { cohabitants, applicantNationalId } = getApplicationExternalData(
    externalData,
  )

  let isOlderThan25 = false
  cohabitants.forEach((cohabitant) => {
    if (cohabitant !== applicantNationalId) {
      if (kennitala.info(cohabitant).age > 25) {
        isOlderThan25 = true
      }
    }
  })

  return isOlderThan25
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
  const {
    householdSupplementChildren,
    householdSupplementHousing,
  } = getApplicationAnswers(answers)
  const attachments: Attachments[] = []

  const leaseAgrSchoolConf = answers.fileUpload as LeaseAgreementSchoolConfirmationAdditionalDocuments

  if (householdSupplementHousing === HouseholdSupplementHousing.RENTER) {
    getAttachmentDetails(
      leaseAgrSchoolConf?.leaseAgreement,
      AttachmentTypes.LEASE_AGREEMENT,
    )
  }
  if (householdSupplementChildren === YES) {
    getAttachmentDetails(
      leaseAgrSchoolConf?.schoolConfirmation,
      AttachmentTypes.SCHOOL_CONFIRMATION,
    )
  }

  //   if (
  //     additionalInfo.additionalDocuments &&
  //     additionalInfo.additionalDocuments?.length > 0
  //   ) {
  //     getAttachmentDetails(
  //       additionalInfo?.additionalDocuments,
  //       AttachmentTypes.ADDITIONAL_DOCUMENTS,
  //     )
  //   }

  return attachments
}

// returns awailable years. Awailable period is
// 2 years back in time and 6 months in the future.
export function getAvailableYears(application: Application) {
  const { applicantNationalId } = getApplicationExternalData(
    application.externalData,
  )

  if (!applicantNationalId) return []

  const twoYearsBackInTime = subYears(new Date(), 2).getFullYear()
  const sixMonthsInTheFuture = addMonths(new Date(), 6).getFullYear()

  console.log('sixMonthsInTheFuture ', sixMonthsInTheFuture)
  return Array.from(
    Array(sixMonthsInTheFuture - (twoYearsBackInTime - 1)),
    (_, i) => {
      return {
        value: (i + twoYearsBackInTime).toString(),
        label: (i + twoYearsBackInTime).toString(),
      }
    },
  )
}

// returns awailable months for selected year, since awailable period is
// 2 years back in time and 6 months in the future.
export function getAvailableMonths(
  application: Application,
  selectedYear: string,
) {
  const { applicantNationalId } = getApplicationExternalData(
    application.externalData,
  )

  if (!applicantNationalId) return []
  if (!selectedYear) return []

  const twoYearsBackInTime = subYears(new Date(), 2)
  const sixMonthsInTheFuture = addMonths(new Date(), 6)

  let months = MONTHS

  if (twoYearsBackInTime.getFullYear().toString() === selectedYear) {
    months = months.slice(twoYearsBackInTime.getMonth(), months.length + 1)
  } else if (sixMonthsInTheFuture.getFullYear().toString() === selectedYear) {
    months = months.slice(0, sixMonthsInTheFuture.getMonth() + 1)
  }

  return months
}
