import {
  buildMultiField,
  buildSubSection,
  buildTableRepeaterField,
} from '@island.is/application/core'
import { format as formatKennitala } from 'kennitala'
import {
  ReasonForApplicationOptions,
  SiblingRelationOptions,
} from '../../../lib/constants'
import { newPrimarySchoolMessages } from '../../../lib/messages'
import {
  getApplicationAnswers,
  getSiblingRelationOptionLabel,
  getSiblingRelationOptions,
} from '../../../lib/newPrimarySchoolUtils'

export const siblingsSubSection = buildSubSection({
  id: 'siblingsSubSection',
  title: newPrimarySchoolMessages.primarySchool.siblingsSubSectionTitle,
  condition: (answers) => {
    // Only display section if "Siblings in the same primary school" selected as reason for application
    const { reasonForApplication } = getApplicationAnswers(answers)
    return (
      reasonForApplication ===
      ReasonForApplicationOptions.SIBLINGS_IN_THE_SAME_PRIMARY_SCHOOL
    )
  },
  children: [
    buildMultiField({
      id: 'siblings',
      title: newPrimarySchoolMessages.primarySchool.siblingsTitle,
      children: [
        buildTableRepeaterField({
          id: 'siblings',
          title: '',
          formTitle:
            newPrimarySchoolMessages.primarySchool.siblingsRegistrationTitle,
          addItemButtonText:
            newPrimarySchoolMessages.primarySchool.siblingsAddRelative,
          saveItemButtonText:
            newPrimarySchoolMessages.primarySchool.siblingsRegisterRelative,
          removeButtonTooltipText:
            newPrimarySchoolMessages.primarySchool.siblingsDeleteRelative,
          marginTop: 0,
          fields: {
            fullName: {
              component: 'input',
              label: newPrimarySchoolMessages.shared.fullName,
              width: 'half',
              type: 'text',
              dataTestId: 'sibling-full-name',
            },
            nationalId: {
              component: 'input',
              label: newPrimarySchoolMessages.shared.nationalId,
              width: 'half',
              type: 'text',
              format: '######-####',
              placeholder: '000000-0000',
              dataTestId: 'sibling-national-id',
            },
            relation: {
              component: 'select',
              label: newPrimarySchoolMessages.shared.relation,
              placeholder: newPrimarySchoolMessages.shared.relationPlaceholder,
              // TODO: Nota gögn fá Júní
              options: getSiblingRelationOptions(),
              dataTestId: 'sibling-relation',
            },
          },
          table: {
            format: {
              nationalId: (value) => formatKennitala(value),
              relation: (value) =>
                getSiblingRelationOptionLabel(value as SiblingRelationOptions),
            },
            header: [
              newPrimarySchoolMessages.shared.fullName,
              newPrimarySchoolMessages.shared.nationalId,
              newPrimarySchoolMessages.shared.relation,
            ],
          },
        }),
      ],
    }),
  ],
})
