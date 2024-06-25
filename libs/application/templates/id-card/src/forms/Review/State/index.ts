import {
  buildActionCardListField,
  buildMultiField,
  buildSection,
  getValueViaPath,
  buildAlertMessageField,
} from '@island.is/application/core'
import { Routes } from '../../../lib/constants'
import { state } from '../../../lib/messages'

export const StateSection = buildSection({
  id: 'reviewState',
  title: state.general.sectionTitle,
  children: [
    buildMultiField({
      id: `reviewStateMultiField`,
      title: state.general.pageTitle,
      description: ({ answers }) => ({
        ...state.general.description,
        values: {
          guardianName: getValueViaPath(
            answers,
            `${Routes.FIRSTGUARDIANINFORMATION}.name`,
            '',
          ) as string,
          childName: getValueViaPath(
            answers,
            `${Routes.APPLICANTSINFORMATION}.name`,
            '',
          ) as string,
        },
      }),
      children: [
        buildAlertMessageField({
          id: 'stateAlertMessage',
          title: '',
          message: state.labels.alertMessage,
          alertType: 'info',
        }),
        buildActionCardListField({
          id: 'approvalActionCard',
          doesNotRequireAnswer: true,
          marginTop: 2,
          title: '',
          items: (application) => {
            const chosenApplicantName = getValueViaPath(
              application.answers,
              `${Routes.APPLICANTSINFORMATION}.name`,
              '',
            ) as string
            return [
              {
                heading: state.labels.actionCardTitle,
                tag: {
                  label: state.labels.actionCardTag,
                  outlined: false,
                  variant: 'purple',
                },
                text: `${state.labels.actionCardDescription} ${chosenApplicantName}`,
              },
            ]
          },
        }),
      ],
    }),
  ],
})
