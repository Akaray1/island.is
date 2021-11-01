import { gql } from '@apollo/client'

export const ApplicationQuery = gql`
  query GetApplicationQuery($input: ApplicationInput!) {
    application(input: $input) {
      id
      nationalId
      created
      modified
      name
      phoneNumber
      email
      homeCircumstances
      student
      employment
      hasIncome
      usePersonalTaxCredit
      bankNumber
      ledger
      accountNumber
      interview
      employmentCustom
      homeCircumstancesCustom
      familyStatus
      spouseNationalId
      spouseName
      city
      streetName
      postalCode
      files {
        id
        applicationId
        name
        size
        created
        type
      }
      state
      formComment
      studentCustom
      amount
      rejection
      staff {
        name
        municipalityId
      }
      applicationEvents {
        id
        applicationId
        eventType
        comment
        created
        staffName
        staffNationalId
      }
    }
  }
`

export const UpdateApplicationTableMutation = gql`
  mutation UpdateApplicationTableMutation(
    $input: UpdateApplicationInputTable!
  ) {
    updateApplicationTable(input: $input) {
      applications {
        id
        nationalId
        name
        phoneNumber
        email
        modified
        created
        state
        staff {
          name
          municipalityId
        }
      }
      filters {
        New
        InProgress
        DataNeeded
        Rejected
        Approved
        MyCases
      }
    }
  }
`

export const ApplicationsQuery = gql`
  query GetApplicationsQuery($input: AllApplicationInput!) {
    applications(input: $input) {
      id
      nationalId
      name
      phoneNumber
      email
      modified
      created
      state
      staff {
        name
      }
    }
  }
`

// Is defined as a mutation to be callable but is a query, that is doesn't mutate anything.
export const ApplicationFiltersMutation = gql`
  mutation GetApplicationFiltersQuery {
    applicationFilters {
      New
      InProgress
      DataNeeded
      Rejected
      Approved
      MyCases
    }
  }
`

export const ApplicationEventMutation = gql`
  mutation CreateApplicationEvent($input: CreateApplicationEventInput!) {
    createApplicationEvent(input: $input) {
      id
      nationalId
      created
      modified
      name
      phoneNumber
      email
      homeCircumstances
      student
      employment
      hasIncome
      usePersonalTaxCredit
      bankNumber
      ledger
      accountNumber
      interview
      employmentCustom
      homeCircumstancesCustom
      files {
        id
        applicationId
        name
        size
        created
        type
      }
      state
      formComment
      studentCustom
      amount
      rejection
      staff {
        name
        municipalityId
      }
      applicationEvents {
        id
        applicationId
        eventType
        comment
        created
        staffNationalId
        staffName
      }
    }
  }
`

export const CurrentUserQuery = gql`
  query CurrentUserQuery {
    currentUser {
      nationalId
      name
      phoneNumber
      staff {
        id
        nationalId
        name
        municipalityId
        phoneNumber
        roles
        active
        municipalityHomepage
      }
    }
  }
`

export const UpdateApplicationMutation = gql`
  mutation UpdateApplicationMutation($input: UpdateApplicationInput!) {
    updateApplication(input: $input) {
      id
      nationalId
      created
      modified
      name
      phoneNumber
      email
      homeCircumstances
      student
      employment
      hasIncome
      usePersonalTaxCredit
      bankNumber
      ledger
      accountNumber
      interview
      employmentCustom
      homeCircumstancesCustom
      files {
        id
        applicationId
        name
        size
        created
        type
      }
      state
      formComment
      studentCustom
      amount
      rejection
      applicationEvents {
        id
        applicationId
        eventType
        comment
        created
        staffNationalId
        staffName
      }
      staff {
        name
        municipalityId
      }
    }
  }
`
