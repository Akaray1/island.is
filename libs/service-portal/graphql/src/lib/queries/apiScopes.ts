import { gql } from '@apollo/client'
import { AUTH_API_SCOPE_FRAGMENT } from '../fragments/scope'

export const AUTH_API_SCOPES_QUERY = gql`
  query AuthApiScopes($input: AuthApiScopesInput!) {
    authApiScopes(input: $input) {
      name
      displayName
      description
      group {
        name
        displayName
        description
      }
    }
  }
`

export const AUTH_SCOPE_TREE_QUERY = gql`
  query AuthScopeTree($input: AuthApiScopesInput!) {
    authScopeTree(input: $input) {
      __typename
      ... on AuthApiScope {
        name
        displayName
        description
        group {
          name
          displayName
          description
          children {
            ...AuthApiScopeFragment
          }
        }
      }
      ... on AuthApiScopeGroup {
        name
        displayName
        description
        children {
          ...AuthApiScopeFragment
        }
      }
    }
  }
  ${AUTH_API_SCOPE_FRAGMENT}
`
