import * as z from 'zod'
import set from 'lodash/set'
import { ApplicationTemplateHelper } from './ApplicationTemplateHelper'
import { ApplicationTemplate } from '../types/ApplicationTemplate'
import {
  Application,
  ApplicationStatus,
  ExternalData,
  FormValue,
} from '../types/Application'
import { ApplicationTypes } from '../types/ApplicationTypes'
import {
  ApplicationContext,
  ApplicationRole,
  ApplicationStateSchema,
  ApplicationTemplateAPIAction,
} from '../types/StateMachine'
import { buildForm, DefaultStateLifeCycle } from '@island.is/application/core'

const createMockApplication = (
  data: {
    answers?: FormValue
    externalData?: ExternalData
    state?: string
    typeId?: ApplicationTypes
  } = {},
): Application => ({
  id: '123',
  assignees: [],
  applicantActors: [],
  state: data.state || 'draft',
  applicant: '111111-3000',
  typeId: data.typeId || ApplicationTypes.EXAMPLE,
  modified: new Date(),
  created: new Date(),
  answers: data.answers || {},
  externalData: data.externalData || {},
  status: ApplicationStatus.IN_PROGRESS,
})

type TestEvents = { type: 'APPROVE' } | { type: 'REJECT' } | { type: 'SUBMIT' }

const createTestApplicationTemplate = (): ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<TestEvents>,
  TestEvents
> => ({
  mapUserToRole(): ApplicationRole {
    return 'applicant'
  },
  type: ApplicationTypes.EXAMPLE,
  name: 'Test application',
  dataSchema: z.object({
    person: z.object({
      age: z.number().min(18),
      pets: z.array(
        z.object({ name: z.string().nonempty(), kind: z.enum(['dog', 'cat']) }),
      ),
    }),
    externalReviewAccepted: z.boolean(),
    wantsInsurance: z.boolean(),
    wantsCake: z.boolean(),
  }),
  stateMachineConfig: {
    initial: 'draft',
    states: {
      draft: {
        meta: {
          name: 'draft',
          progress: 0.33,
          lifecycle: DefaultStateLifeCycle,
          roles: [
            {
              actions: [{ event: 'SUBMIT', name: 'Submit', type: 'primary' }],
              id: 'applicant',
              formLoader: () =>
                Promise.resolve(
                  buildForm({
                    id: 'ParentalLeave',
                    title: 'parentalLeave',
                    children: [],
                  }),
                ),
              write: {
                answers: ['person', 'wantsInsurance'],
                externalData: ['salary'],
              },
            },
          ],
        },
        on: {
          SUBMIT: { target: 'inReview' },
        },
      },
      inReview: {
        meta: {
          name: 'In Review',
          progress: 0.66,
          lifecycle: DefaultStateLifeCycle,
          roles: [
            {
              id: 'applicant',
            },
            {
              id: 'reviewer',
              read: 'all' as const,
              write: {
                answers: [],
                externalData: [],
              },
            },
          ],
        },
        on: {
          APPROVE: { target: 'approved' },
          REJECT: { target: 'draft' },
        },
      },
      approved: {
        meta: {
          name: 'Approved',
          progress: 1,
          lifecycle: DefaultStateLifeCycle,
        },
        type: 'final' as const,
      },
      rejected: {
        meta: {
          name: 'Rejected',
          lifecycle: DefaultStateLifeCycle,
          roles: [
            {
              id: 'applicant',
              write: 'all',
            },
          ],
        },
      },
      closed: {
        meta: {
          name: 'Closed',
          lifecycle: DefaultStateLifeCycle,
          roles: [
            {
              id: 'applicant',
              write: {
                answers: ['person'],
                externalData: ['salary'],
              },
            },
            {
              id: 'reviewer',
              write: {
                answers: ['wantsCake'],
              },
            },
          ],
        },
      },
    },
  },
})

const testApplicationTemplate = createTestApplicationTemplate()

describe('ApplicationTemplate', () => {
  const application = createMockApplication()
  const templateHelper = new ApplicationTemplateHelper(
    application,
    testApplicationTemplate,
  )
  describe(' getApplicationStateInformation', () => {
    it('should return correct meta data depending on application state', () => {
      expect(templateHelper.getApplicationStateInformation('draft')).toEqual(
        testApplicationTemplate.stateMachineConfig.states.draft.meta,
      )
      expect(templateHelper.getApplicationStateInformation('inReview')).toEqual(
        testApplicationTemplate.stateMachineConfig.states.inReview.meta,
      )
      expect(templateHelper.getApplicationStateInformation('approved')).toEqual(
        testApplicationTemplate.stateMachineConfig.states.approved.meta,
      )
      expect(templateHelper.getApplicationStateInformation('rejected')).toEqual(
        testApplicationTemplate.stateMachineConfig.states.rejected.meta,
      )
    })

    it('should return undefined if there is no state with this key in the application', () => {
      expect(
        templateHelper.getApplicationStateInformation('someRandomState'),
      ).toBeUndefined()
    })
  })

  describe('changeState', () => {
    it('should be able to change from draft to inReview on SUBMIT', () => {
      const [hasChanged, newState] = templateHelper.changeState('SUBMIT')
      expect(newState).toBe('inReview')
      expect(hasChanged).toBe(true)
    })
    it('should throw an error if passing an invalid event that cannot progress the application to any other state', () => {
      // Arrange
      const invalidEvent = 'APPROVE'
      const currentState = 'draft'
      const sut = () => {
        templateHelper.changeState(invalidEvent)
      }

      // Act & Assert
      expect(sut).toThrow(
        new Error(`${invalidEvent} is invalid for state ${currentState}`),
      )
    })
  })

  describe('getPermittedAnswersAndExternalData', () => {
    const answers: FormValue = {
      person: {
        age: 25,
        pets: [
          { name: 'John', kind: 'dog' },
          { name: 'Spot', kind: 'cat' },
        ],
      },
      externalReviewAccepted: false,
      wantsInsurance: true,
      wantsCake: false,
    }
    const externalData: ExternalData = {
      salary: { data: 1000000, date: new Date(), status: 'success' },
      someValidation: {
        date: new Date(),
        status: 'failure',
        reason: 'external validation error',
      },
    }

    it('should ONLY return the answers and externalData that the applicant can read/write in draft state', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'draft',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      const result = helper.getReadableAnswersAndExternalData('applicant')
      expect(result.answers).toEqual({
        person: {
          age: 25,
          pets: [
            { name: 'John', kind: 'dog' },
            { name: 'Spot', kind: 'cat' },
          ],
        },
        wantsInsurance: true,
      })
      expect(result.externalData).toEqual({
        salary: {
          data: 1000000,
          date: externalData.salary.date,
          status: 'success',
        },
      })
      expect(
        helper.getWritableAnswersAndExternalData(['applicant', 'reviewer']),
      ).toEqual({
        answers: ['person', 'wantsInsurance'],
        externalData: ['salary'],
      })
    })

    it('should ONLY return the answers and externalData that the applicant and reviewer can read/write in closed state', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'closed',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      const result = helper.getReadableAnswersAndExternalData([
        'applicant',
        'reviewer',
      ])
      expect(result.answers).toEqual({
        person: {
          age: 25,
          pets: [
            { name: 'John', kind: 'dog' },
            { name: 'Spot', kind: 'cat' },
          ],
        },
        wantsCake: false,
      })
      expect(result.externalData).toEqual({
        salary: {
          data: 1000000,
          date: externalData.salary.date,
          status: 'success',
        },
      })
    })

    it('should return true', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'closed',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      expect(helper.getWritableAnswersAndExternalData('applicant')).toEqual({
        answers: ['person'],
        externalData: ['salary'],
      })
    })

    it('should return no data if the current user has no role in this state', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'draft',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      expect(
        helper.getReadableAnswersAndExternalData('noRoleInDraftState'),
      ).toEqual({ answers: {}, externalData: {} })
    })
    it('should return no data if the current user has a role in this state, but no read nor write access', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'inReview',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      expect(helper.getReadableAnswersAndExternalData('applicant')).toEqual({
        answers: {},
        externalData: {},
      })
    })
    it('should return every answer if the user has a role in this state with read: "all"', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'inReview',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      expect(helper.getReadableAnswersAndExternalData('reviewer')).toEqual({
        answers,
        externalData,
      })
    })
    it('should return every answer if the user has a role in this state with write: "all"', () => {
      const applicationWithAnswersAndExternalData = createMockApplication({
        state: 'rejected',
        answers,
        externalData,
      })
      const helper = new ApplicationTemplateHelper(
        applicationWithAnswersAndExternalData,
        testApplicationTemplate,
      )
      expect(helper.getReadableAnswersAndExternalData('applicant')).toEqual({
        answers,
        externalData,
      })
      expect(
        helper.getWritableAnswersAndExternalData(['applicant', 'reviewer']),
      ).toEqual('all')
    })
  })

  describe('getApplicationProgress', () => {
    const application = createMockApplication()
    const templateHelper = new ApplicationTemplateHelper(
      application,
      testApplicationTemplate,
    )
    it('should return the correct progress for each state', () => {
      expect(templateHelper.getApplicationProgress('draft')).toBe(0.33)
      expect(templateHelper.getApplicationProgress('inReview')).toBe(0.66)
      expect(templateHelper.getApplicationProgress('approved')).toBe(1)
      expect(templateHelper.getApplicationProgress('rejected')).toBe(0)
    })
  })

  describe('getting template api actions', () => {
    let template: ApplicationTemplate<
      ApplicationContext,
      ApplicationStateSchema<TestEvents>,
      TestEvents
    >
    beforeEach(() => {
      template = createTestApplicationTemplate()
    })

    it('should return onEntry action with expected default values', () => {
      const expectedAction: ApplicationTemplateAPIAction = {
        apiModuleAction: 'testAction',
        externalDataId: 'testAction',
        shouldPersistToExternalData: true,
        throwOnError: true,
      }

      const testActionConfig: ApplicationTemplateAPIAction = {
        apiModuleAction: 'testAction',
      }

      set(
        template,
        'stateMachineConfig.states.draft.meta.onEntry',
        testActionConfig,
      )
      set(
        template,
        'stateMachineConfig.states.draft.meta.onExit',
        testActionConfig,
      )

      const helper = new ApplicationTemplateHelper(
        createMockApplication(),
        template,
      )

      expect(helper.getOnEntryStateAPIAction('draft')).toEqual(expectedAction)
      expect(helper.getOnExitStateAPIAction('draft')).toEqual(expectedAction)
    })

    it('should not overwrite custom values with default values', () => {
      const expectedAction: ApplicationTemplateAPIAction = {
        apiModuleAction: 'testAction',
        externalDataId: 'customExternalDataId',
        shouldPersistToExternalData: false,
        throwOnError: false,
      }

      const testActionConfig: ApplicationTemplateAPIAction = {
        apiModuleAction: 'testAction',
        externalDataId: 'customExternalDataId',
        shouldPersistToExternalData: false,
        throwOnError: false,
      }

      set(
        template,
        'stateMachineConfig.states.draft.meta.onEntry',
        testActionConfig,
      )
      set(
        template,
        'stateMachineConfig.states.draft.meta.onExit',
        testActionConfig,
      )

      const helper = new ApplicationTemplateHelper(
        createMockApplication(),
        template,
      )

      expect(helper.getOnEntryStateAPIAction('draft')).toEqual(expectedAction)
      expect(helper.getOnExitStateAPIAction('draft')).toEqual(expectedAction)
    })
  })
})
