import { Passkey, PasskeyRegistrationResult } from 'react-native-passkey'
import {
  convertBase64UrlToBase64String,
  convertRegisterResultsToBase64Url,
  padChallenge,
} from './helpers'
import {
  useGetPasskeyRegistrationOptionsLazyQuery,
  useVerifyPasskeyRegistrationMutation,
} from '../../graphql/types/schema'
import { preferencesStore } from '../../stores/preferences-store'

export const useRegisterPasskey = () => {
  const isSupported: boolean = Passkey.isSupported()

  const [getPasskeyRegistrationOptions] =
    useGetPasskeyRegistrationOptionsLazyQuery()

  const [verifyPasskeyRegistration] = useVerifyPasskeyRegistrationMutation()

  const registerPasskey = async () => {
    if (isSupported) {
      try {
        // Get registration options from server
        const options = await getPasskeyRegistrationOptions()

        if (!options.data?.authPasskeyRegistrationOptions) {
          return false
        }
        // Register Passkey on device
        const result: PasskeyRegistrationResult = await Passkey.register({
          ...options.data.authPasskeyRegistrationOptions,
          challenge: padChallenge(
            convertBase64UrlToBase64String(
              options.data.authPasskeyRegistrationOptions.challenge,
            ),
          ),
        })

        // Converting needed since the server expects base64url strings but react-native-passkey returns base64 strings
        const updatedResult = convertRegisterResultsToBase64Url(result)

        // Verify registration with server
        const verifyRegisterResponse = await verifyPasskeyRegistration({
          variables: {
            input: {
              ...updatedResult,
              clientExtensionResults: {},
            },
          },
        })

        if (
          verifyRegisterResponse?.data?.authPasskeyVerifyRegistration.verified
        ) {
          preferencesStore.setState({ hasCreatedPasskey: true })
          return true
        }
        console.error(
          'Passkey registration not verified',
          verifyRegisterResponse,
        )
      } catch (error: any) {
        // User cancelled the register flow, swallow the error
        if (error?.error === 'UserCancelled') {
          return false
        }
        console.error('Error registering passkey', error)
      }
    }
    return false
  }

  return {
    registerPasskey,
  }
}
