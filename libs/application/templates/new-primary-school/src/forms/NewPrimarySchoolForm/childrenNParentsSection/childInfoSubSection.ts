import {
  buildCustomField,
  buildMultiField,
  buildRadioField,
  buildSelectField,
  buildSubSection,
  buildTextField,
} from '@island.is/application/core'
import { Application, NO, YES } from '@island.is/application/types'
import { newPrimarySchoolMessages } from '../../../lib/messages'
import {
  formatGender,
  getApplicationAnswers,
  getApplicationExternalData,
  getGenderOptions,
  getSelectedChild,
} from '../../../lib/newPrimarySchoolUtils'
import { OptionsType } from '../../../lib/constants'

export const childInfoSubSection = buildSubSection({
  id: 'childInfoSubSection',
  title: newPrimarySchoolMessages.childrenNParents.childInfoSubSectionTitle,
  children: [
    buildMultiField({
      id: 'childInfo',
      title: newPrimarySchoolMessages.childrenNParents.childInfoTitle,
      description:
        newPrimarySchoolMessages.childrenNParents.childInfoDescription,
      children: [
        buildTextField({
          id: 'childInfo.name',
          title: newPrimarySchoolMessages.shared.fullName,
          disabled: true,
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData)
              .childInformation.name,
        }),
        buildTextField({
          id: 'childInfo.nationalId',
          title: newPrimarySchoolMessages.shared.nationalId,
          width: 'half',
          format: '######-####',
          disabled: true,
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData)
              .childInformation.nationalId,
        }),
        buildTextField({
          id: 'childInfo.address.streetAddress',
          title: newPrimarySchoolMessages.shared.address,
          width: 'half',
          disabled: true,
          // TODO: Nota gögn frá Júní
          // TODO: Hægt að nota heimilisfang innskráðs foreldris? (foreldri getur ekki sótt um nema barn sé með sama lögheimili)
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData)
              .applicantAddress,
        }),
        buildTextField({
          id: 'childInfo.address.postalCode',
          title: newPrimarySchoolMessages.shared.postalCode,
          width: 'half',
          disabled: true,
          // TODO: Nota gögn frá Júní
          // TODO: Hægt að nota heimilisfang innskráðs foreldris? (foreldri getur ekki sótt um nema barn sé með sama lögheimili)
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData)
              .applicantPostalCode,
        }),
        buildTextField({
          id: 'childInfo.address.city',
          title: newPrimarySchoolMessages.shared.municipality,
          width: 'half',
          disabled: true,
          // TODO: Nota gögn frá Júní
          // TODO: Hægt að nota heimilisfang innskráðs foreldris? (foreldri getur ekki sótt um nema barn sé með sama lögheimili)
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData).applicantCity,
        }),
        buildTextField({
          id: 'childInfo.preferredName',
          title:
            newPrimarySchoolMessages.childrenNParents.childInfoPreferredName,
          width: 'half',
          defaultValue: (application: Application) =>
            getApplicationExternalData(application.externalData)
              .childInformation.preferredName,
        }),
        buildSelectField({
          id: 'childInfo.gender',
          title: newPrimarySchoolMessages.childrenNParents.childInfoGender,
          placeholder:
            newPrimarySchoolMessages.childrenNParents
              .childInfoGenderPlaceholder,
          width: 'half',
          // TODO: Nota gögn fá Júní
          options: getGenderOptions(),
          defaultValue: (application: Application) =>
            formatGender(getSelectedChild(application)?.genderCode),
        }),
        buildCustomField(
          {
            id: 'childInfo.pronouns',
            title: newPrimarySchoolMessages.childrenNParents.childInfoPronouns,
            component: 'FriggOptionsAsyncSelectField',
          },
          {
            optionsType: OptionsType.PRONOUN,
            placeholder:
              newPrimarySchoolMessages.childrenNParents
                .childInfoPronounsPlaceholder,
          },
        ),
        buildRadioField({
          id: 'childInfo.differentPlaceOfResidence',
          title:
            newPrimarySchoolMessages.childrenNParents.differentPlaceOfResidence,
          width: 'half',
          required: true,
          space: 4,
          options: [
            {
              label: newPrimarySchoolMessages.shared.yes,
              value: YES,
            },
            {
              label: newPrimarySchoolMessages.shared.no,
              value: NO,
            },
          ],
        }),
        buildTextField({
          id: 'childInfo.placeOfResidence.streetAddress',
          title:
            newPrimarySchoolMessages.childrenNParents.childInfoPlaceOfResidence,
          width: 'half',
          required: true,
          condition: (answers) => {
            const { differentPlaceOfResidence } = getApplicationAnswers(answers)

            return differentPlaceOfResidence === YES
          },
        }),
        buildTextField({
          id: 'childInfo.placeOfResidence.postalCode',
          title: newPrimarySchoolMessages.shared.postalCode,
          width: 'half',
          format: '###',
          required: true,
          condition: (answers) => {
            const { differentPlaceOfResidence } = getApplicationAnswers(answers)

            return differentPlaceOfResidence === YES
          },
        }),
      ],
    }),
  ],
})
