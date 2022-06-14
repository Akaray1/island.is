import {
  STEP_FOUR_ROUTE,
  STEP_THREE_ROUTE,
} from '@island.is/judicial-system/consts'
import { CaseType } from '@island.is/judicial-system/types'

import { makeRestrictionCase, intercept } from '../../../utils'

describe(`${STEP_THREE_ROUTE}/:id`, () => {
  beforeEach(() => {
    const caseData = makeRestrictionCase()

    cy.stubAPIResponses()
    cy.visit(`${STEP_THREE_ROUTE}/test_id`)

    intercept(caseData)
  })

  it('should validate form', () => {
    cy.getByTestid('continueButton').should('be.disabled')

    cy.getByTestid('datepicker').click()
    cy.getByTestid('datepickerIncreaseMonth').click()
    cy.contains('15').click()
    cy.getByTestid('reqValidToDate-time').type('13:').blur()
    cy.getByTestid('inputErrorMessage').contains('Dæmi: 12:34 eða 1:23')
    cy.getByTestid('reqValidToDate-time').clear().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('reqValidToDate-time').clear().type('1333')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    cy.getByTestid('continueButton').should('be.disabled')
    cy.getByTestid('lawsBroken').click().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('lawsBroken').type('Lorem ipsum')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    cy.getByTestid('continueButton').should('be.disabled')
    cy.getByTestid('checkbox').first().click()
    cy.getByTestid('continueButton').should('not.be.disabled')
    cy.getByTestid('checkbox').first().click()
    cy.getByTestid('continueButton').should('be.disabled')
    cy.getByTestid('legalBasis').type('Lorem ipsum')

    cy.getByTestid('continueButton').should('not.be.disabled')
  })

  it('should overwrite demands when requested valid date is updated', () => {
    cy.getByTestid('datepicker').click()
    cy.getByTestid('datepickerIncreaseMonth').click()
    cy.contains('15').click()

    cy.getByTestid('reqValidToDate-time').clear().type('1333')
    cy.wait('@UpdateCaseMutation')
      .its('response.body.data.updateCase')
      .should('have.any.key', 'demands')
  })

  it('should navigate to the next step when all input data is valid and the continue button is clicked', () => {
    cy.getByTestid('datepicker').click()
    cy.getByTestid('datepickerIncreaseMonth').click()
    cy.contains('15').click()
    cy.getByTestid('reqValidToDate-time').clear().type('1333')
    cy.getByTestid('lawsBroken').type('Lorem ipsum')
    cy.getByTestid('checkbox').first().click()
    cy.getByTestid('continueButton').click()
    cy.url().should('include', STEP_FOUR_ROUTE)
  })

  it('should show custody restrictions for custody cases', () => {
    cy.getByTestid('custodyRestrictions').should('exist')
  })
})

describe(`${STEP_THREE_ROUTE}/:id - Admission to Facility`, () => {
  beforeEach(() => {
    const caseData = {
      ...makeRestrictionCase(),
      type: CaseType.ADMISSION_TO_FACILITY,
    }

    cy.stubAPIResponses()
    cy.visit(`${STEP_THREE_ROUTE}/test_id`)

    intercept(caseData)
  })

  it('should show custody restrictions for admission to facility cases', () => {
    cy.getByTestid('custodyRestrictions').should('exist')
  })
})

describe(`${STEP_THREE_ROUTE}/:id - Travel Ban`, () => {
  beforeEach(() => {
    const caseData = {
      ...makeRestrictionCase(),
      type: CaseType.TRAVEL_BAN,
    }

    cy.stubAPIResponses()
    cy.visit(`${STEP_THREE_ROUTE}/test_id`)

    intercept(caseData)
  })

  it('should show travel ban restrictions for travel ban cases', () => {
    cy.getByTestid('travelBanRestrictions').should('exist')
  })
})
