import { Case, CaseDecision } from '@island.is/judicial-system/types'
import {
  COURT_RECORD_ROUTE,
  RULING_ROUTE,
} from '@island.is/judicial-system/consts'

import { makeRestrictionCase, intercept } from '../../../utils'

describe(`${RULING_ROUTE}/:id`, () => {
  beforeEach(() => {
    cy.stubAPIResponses()
  })

  it('should autofill prosecutor demands', () => {
    const caseData = makeRestrictionCase()
    const caseDataAddition: Case = {
      ...caseData,
      caseFacts: 'lorem ipsum',
      legalArguments: 'lorem ipsum',
      demands:
        'Þess er krafist að Donald Duck, kt. 000000-0000, sæti gæsluvarðhaldi með úrskurði Héraðsdóms Reykjavíkur, til miðvikudagsins 16. september 2020, kl. 19:50, og verði gert að sæta einangrun á meðan á varðhaldi stendur.',
    }
    cy.visit(`${RULING_ROUTE}/test_id_stadfest`)

    intercept(caseDataAddition)

    cy.getByTestid('prosecutorDemands').contains(
      'Þess er krafist að Donald Duck, kt. 000000-0000, sæti gæsluvarðhaldi með úrskurði Héraðsdóms Reykjavíkur, til miðvikudagsins 16. september 2020, kl. 19:50, og verði gert að sæta einangrun á meðan á varðhaldi stendur.',
    )
  })

  it('should show appropriate valid to dates based on decision', () => {
    const caseData = makeRestrictionCase()
    const caseDataAddition: Case = {
      ...caseData,
      caseFacts: 'lorem ipsum',
      legalArguments: 'lorem ipsum',
      demands:
        'Þess er krafist að Donald Duck, kt. 000000-0000, sæti gæsluvarðhaldi með úrskurði Héraðsdóms Reykjavíkur, til miðvikudagsins 16. september 2020, kl. 19:50, og verði gert að sæta einangrun á meðan á varðhaldi stendur.',
    }
    cy.visit(`${RULING_ROUTE}/test_id_stadfest`)

    intercept(caseDataAddition)

    cy.getByTestid('caseDecisionSection').should('not.exist')
    cy.get('#case-decision-accepting').check()
    cy.getByTestid('caseDecisionSection').should('exist')
    cy.get('#case-decision-rejecting').check()
    cy.getByTestid('caseDecisionSection').should('not.exist')
    cy.get('#case-decision-accepting-partially').check()
    cy.getByTestid('caseDecisionSection').should('exist')
  })

  it('should have a disabled isolationTo datepicker if isolation is nor selected and not if it is', () => {
    const caseData = makeRestrictionCase()
    const caseDataAddition: Case = {
      ...caseData,
      decision: CaseDecision.ACCEPTING,
      isCustodyIsolation: true,
    }
    cy.visit(`${RULING_ROUTE}/test_id_stadfest`)

    intercept(caseDataAddition)

    cy.get('#isolationToDate').should('not.have.attr', 'disabled')
    cy.get('[name="isCustodyIsolation"]').uncheck()
    cy.get('#isolationToDate').should('have.attr', 'disabled')
  })

  it('should navigate to the next step when all input data is valid and the continue button is clicked', () => {
    const caseData = makeRestrictionCase()
    const caseDataAddition: Case = {
      ...caseData,
      caseFacts: 'lorem ipsum',
      legalArguments: 'lorem ipsum',
      demands:
        'Þess er krafist að Donald Duck, kt. 000000-0000, sæti gæsluvarðhaldi með úrskurði Héraðsdóms Reykjavíkur, til miðvikudagsins 16. september 2020, kl. 19:50, og verði gert að sæta einangrun á meðan á varðhaldi stendur.',
    }
    cy.visit(`${RULING_ROUTE}/test_id_stadfest`)

    intercept(caseDataAddition)
    cy.wait('@gqlCaseQuery')

    // Introduction validation
    cy.getByTestid('introduction').invoke('val').should('not.be.empty')
    cy.getByTestid('introduction').clear()
    cy.clickOutside()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('introduction').type('lorem')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    // Prosecutor demands validation
    cy.getByTestid('prosecutorDemands').invoke('val').should('not.be.empty')
    cy.getByTestid('prosecutorDemands').clear()
    cy.clickOutside()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('prosecutorDemands').type('lorem')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    // Court case facts validation
    cy.getByTestid('courtCaseFacts').invoke('val').should('not.be.empty')
    cy.getByTestid('courtCaseFacts').clear()
    cy.clickOutside()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('courtCaseFacts').type('lorem')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    // Legal arguments validation
    cy.getByTestid('courtLegalArguments').invoke('val').should('not.be.empty')
    cy.getByTestid('courtLegalArguments').clear()
    cy.clickOutside()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('courtLegalArguments').type('lorem')
    cy.getByTestid('inputErrorMessage').should('not.exist')

    // Ruling should be autofilled but not required
    cy.getByTestid('ruling').invoke('val').should('not.be.empty')
    cy.getByTestid('ruling').clear()

    cy.get('#case-decision-accepting').check()
    cy.getByTestid('continueButton').should('not.be.disabled').click()
    cy.url().should('include', COURT_RECORD_ROUTE)
  })
})
