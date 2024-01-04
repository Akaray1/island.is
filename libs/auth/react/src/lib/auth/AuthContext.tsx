import { jwtDecode } from 'jwt-decode'
import { createContext, useContext } from 'react'

import { User } from '@island.is/shared/types'

import { AuthReducerState, initialState } from './Auth.state'

export interface AuthContextType extends AuthReducerState {
  signIn(): void
  signInSilent(): void
  switchUser(nationalId?: string): void
  signOut(): void
  authority?: string
}

export const defaultAuthContext = {
  ...initialState,
  signIn() {
    // Intentionally empty
  },
  signInSilent() {
    // Intentionally empty
  },
  switchUser(_nationalId?: string) {
    // Intentionally empty
  },
  signOut() {
    // Intentionally empty
  },
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export const useAuth: () => AuthContextType = () => useContext(AuthContext)

export const useUserInfo = () => {
  const { userInfo } = useContext(AuthContext)

  if (!userInfo) {
    throw new Error('User info is not available. Is the user authenticated?')
  }

  return userInfo
}

export const useUserDecodedIdToken = () => {
  const userInfo = useUserInfo()

  if (!userInfo.id_token) {
    throw new Error(
      'Decoded ID token is not available. Is the user authenticated?',
    )
  }

  return jwtDecode<User['profile']>(userInfo.id_token)
}
