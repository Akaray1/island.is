import {
  ApplicationTemplate,
  ApplicationContext,
  ApplicationStateSchema,
  Application,
  ApplicationTypes,
  ApplicationConfigurations,
  ApplicationRole,
  DefaultEvents,
  NationalRegistryUserApi,
  UserProfileApi,
} from '@island.is/application/types'

import { pruneAfterDays } from '@island.is/application/core'
import { Events, Roles, States } from './constants'
import { dataSchema } from './dataSchema'
import { answerValidators } from './answerValidators'
import { pensionSupplementFormMessage } from './messages'

const PensionSupplementTemplate: ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<Events>,
  Events
> = {
  type: ApplicationTypes.PENSION_SUPPLEMENT,
  name: pensionSupplementFormMessage.shared.applicationTitle,
  institution: pensionSupplementFormMessage.shared.institution,
  readyForProduction: false, // hafa þetta svona atm?
  translationNamespaces: [
    ApplicationConfigurations.PensionSupplement.translation,
  ],
  dataSchema,
  stateMachineConfig: {
    initial: States.PREREQUISITES,
    states: {
      [States.PREREQUISITES]: {
        meta: {
          name: States.PREREQUISITES,
          status: 'draft',
          lifecycle: pruneAfterDays(1),
          progress: 0.25,
          //onExit: defineTemplateApi - kalla á TR
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Prerequisites').then((val) =>
                  Promise.resolve(val.PrerequisitesForm),
                ),
              actions: [
                {
                  event: DefaultEvents.SUBMIT,
                  name: 'Submit',
                  type: 'primary',
                },
              ],
              write: 'all',
              api: [NationalRegistryUserApi, UserProfileApi],
              delete: true,
            },
          ],
        },
        on: {
          SUBMIT: States.DRAFT,
        },
      },
      [States.DRAFT]: {
        meta: {
          name: States.DRAFT,
          status: 'draft',
          lifecycle: pruneAfterDays(30),
          progress: 0.25,
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/PensionSupplementForm').then((val) =>
                  Promise.resolve(val.PensionSupplementForm),
                ),
              actions: [
                {
                  event: DefaultEvents.SUBMIT,
                  name: 'Submit',
                  type: 'primary',
                },
              ],
              write: 'all',
              delete: true,
            },
          ],
        },
        // on: {
        //   SUBMIT: [],
        // },
      },
    },
  },
  mapUserToRole(
    id: string,
    application: Application,
  ): ApplicationRole | undefined {
    if (id === application.applicant) {
      return Roles.APPLICANT
    }
    return undefined
  },
  answerValidators,
}

export default PensionSupplementTemplate
