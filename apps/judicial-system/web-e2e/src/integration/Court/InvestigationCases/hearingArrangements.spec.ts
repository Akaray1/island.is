import faker from 'faker'

import { Case, CaseState } from '@island.is/judicial-system/types'
import {
  makeInvestigationCase,
  makeCourt,
} from '@island.is/judicial-system/formatters'

import { intercept } from '../../../utils'

describe('/domur/rannsoknarheimild/fyrirtaka/:id', () => {
  beforeEach(() => {
    cy.login()

    cy.stubAPIResponses()
    cy.visit('/domur/rannsoknarheimild/fyrirtaka/test_id_stadfest')
  })

  it('should display case comments', () => {
    const caseData = makeInvestigationCase()
    const comment = faker.lorem.sentence(1)
    const caseDataAddition: Case = {
      ...caseData,
      comments: comment,
    }

    intercept(caseDataAddition)

    cy.contains(comment)
  })

  it('should allow users to choose if they send COURT_DATE notification', () => {
    const caseData = makeInvestigationCase()
    const caseDataAddition: Case = {
      ...caseData,
      // judge: makeJudge(),
      court: makeCourt(),
      requestedCourtDate: '2020-09-16T19:50:08.033Z',
      state: CaseState.RECEIVED,
    }

    intercept(caseDataAddition)

    cy.getByTestid('select-judge').click()
    cy.get('#react-select-judge-option-0').click()
    cy.getByTestid('select-registrar').click()
    cy.get('#react-select-registrar-option-0').click()
    cy.get('[name="session-arrangements-all-present"]').click()
    cy.getByTestid('courtroom').type('1337')
    cy.getByTestid('continueButton').click()
    cy.getByTestid('modal').should('be.visible')
  })

  it('should navigate to the next step when all input data is valid and the continue button is clicked', () => {
    const caseData = makeInvestigationCase()
    const caseDataAddition: Case = {
      ...caseData,
      court: makeCourt(),
      requestedCourtDate: '2020-09-16T19:50:08.033Z',
      state: CaseState.RECEIVED,
    }

    intercept(caseDataAddition)

    cy.getByTestid('select-judge').click()
    cy.get('#react-select-judge-option-0').click()
    cy.get('[name="session-arrangements-all-present"]').click()
    cy.getByTestid('continueButton').should('not.be.disabled')
    cy.getByTestid('continueButton').click()
    cy.getByTestid('modalSecondaryButton').click()
    cy.url().should('include', '/domur/rannsoknarheimild/thingbok')
  })
})
