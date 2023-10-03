import {
  buildMultiField,
  buildCustomField,
  buildSubSection,
  buildFileUploadField,
  buildAlertMessageField,
  buildDescriptionField,
} from '@island.is/application/core'
import { m } from '../../lib/messages'
import { hasNoDrivingLicenseInOtherCountry } from '../../lib/utils'
import { hasHealthRemarks } from '../../lib/utils/formUtils'
import { FILE_SIZE_LIMIT, UPLOAD_ACCEPT, YES } from '../../lib/constants'

export const subSectionHealthDeclaration = buildSubSection({
  id: 'healthDeclaration',
  title: m.healthDeclarationSectionTitle,
  condition: hasNoDrivingLicenseInOtherCountry,
  children: [
    buildMultiField({
      id: 'overview',
      title: m.healthDeclarationMultiFieldTitle,
      description: m.healthDeclarationMultiFieldSubTitle,
      space: 1,
      children: [
        buildCustomField({
          id: 'remarks',
          title: '',
          component: 'HealthRemarks',
          condition: (_, externalData) => hasHealthRemarks(externalData),
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.usesContactGlasses.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration1,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.usesContactGlasses.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.usesContactGlasses?.answer ===
            YES,
        }),
        buildDescriptionField({
          id: 'space1',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.usesContactGlasses?.answer ===
            YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasReducedPeripheralVision.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration2,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasReducedPeripheralVision.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasReducedPeripheralVision
              ?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space2',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasReducedPeripheralVision
              ?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasEpilepsy.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration3,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasEpilepsy.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasEpilepsy?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space3',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasEpilepsy?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasHeartDisease.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration4,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasHeartDisease.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasHeartDisease?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space4',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasHeartDisease?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasMentalIllness.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration5,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasMentalIllness.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasMentalIllness?.answer ===
            YES,
        }),
        buildDescriptionField({
          id: 'space5',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasMentalIllness?.answer ===
            YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.usesMedicalDrugs.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration6,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.usesMedicalDrugs.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.usesMedicalDrugs?.answer ===
            YES,
        }),
        buildDescriptionField({
          id: 'space6',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.usesMedicalDrugs?.answer ===
            YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.isAlcoholic.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration7,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.isAlcoholic.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.isAlcoholic?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space7',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.isAlcoholic?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasDiabetes.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration8,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasDiabetes.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasDiabetes?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space8',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasDiabetes?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.isDisabled.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration9,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.isDisabled.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.isDisabled?.answer === YES,
        }),
        buildDescriptionField({
          id: 'space9',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.isDisabled?.answer === YES,
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.hasOtherDiseases.answer',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration10,
          },
        ),
        buildFileUploadField({
          id: 'healthDeclaration.hasOtherDiseases.attachment',
          title: '',
          maxSize: FILE_SIZE_LIMIT,
          maxSizeErrorText: m.attachmentMaxSizeError,
          uploadAccept: UPLOAD_ACCEPT,
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasOtherDiseases?.answer ===
            YES,
        }),
        buildDescriptionField({
          id: 'space10',
          title: '',
          marginBottom: 'containerGutter',
          condition: (answers) =>
            (answers.healthDeclaration as any)?.hasOtherDiseases?.answer ===
            YES,
        }),
        buildAlertMessageField({
          id: 'healthDeclaration.error',
          title: '',
          message: 'Vinsamlegast fylltu út heilbringðisyfirlýsingu',
          alertType: 'error',
          condition: (answers) => !!(answers.healthDeclaration as any)?.error,
        }),
      ],
    }),
  ],
})
