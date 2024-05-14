import { Button, Typography, NavigationBarSheet } from '@ui'
import React, { useEffect, useState } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  View,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import styled, { useTheme } from 'styled-components/native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import logo from '../../assets/logo/logo-64w.png'
import illustrationSrc from '../../assets/illustrations/digital-services-m1.png'
import { openBrowser, openNativeBrowser } from '../../lib/rn-island'
import { preferencesStore } from '../../stores/preferences-store'
import { registerPasskey } from '../../lib/passkeys/registerPasskey'
import { authenticatePasskey } from '../../lib/passkeys/authenticatePasskey'
import { authStore } from '../../stores/auth-store'

const Text = styled.View`
  margin-horizontal: ${({ theme }) => theme.spacing[7]}px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[5]}px;
  margin-top: ${({ theme }) => theme.spacing[5]}px;
`

const LoadingOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;

  background-color: #000;
  opacity: ${({ theme }) => (theme.isDark ? 0.6 : 0.4)};
  width: 100%;
  height: 100%;
`

const { getNavigationOptions, useNavigationOptions } =
  createNavigationOptionHooks(() => ({
    topBar: {
      visible: false,
    },
  }))

export const PasskeyScreen: NavigationFunctionComponent<{
  url?: string
}> = ({ componentId, url }) => {
  useNavigationOptions(componentId)
  const intl = useIntl()
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    preferencesStore.setState({
      hasOnboardedPasskeys: true,
    })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <NavigationBarSheet
        componentId={componentId}
        title={''}
        onClosePress={() => Navigation.dismissModal(componentId)}
        style={{ marginHorizontal: 16 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Image
            source={logo}
            resizeMode="contain"
            style={{ width: 45, height: 45 }}
          />
          <Text>
            <Typography
              variant={'heading2'}
              style={{
                paddingHorizontal: theme.spacing[2],
                marginBottom: theme.spacing[2],
              }}
              textAlign="center"
            >
              <FormattedMessage
                id="passkeys.headingTitle"
                defaultMessage="Innskrá með Ísland.is appinu"
              />
            </Typography>
            <Typography textAlign="center">
              <FormattedMessage
                id={
                  url
                    ? 'passkeys.openUrlHeadingSubtitle'
                    : 'passkeys.headingSubtitle'
                }
                defaultMessage={
                  url
                    ? 'Þú ert að fara að opna Ísland.is í vafra. Viltu búa til aðgangslykil til að skrá þig inn sjálfkrafa með appinu?'
                    : 'Viltu búa til aðgangslykil til að skrá þig inn sjálfkrafa með appinu?'
                }
              />
            </Typography>
          </Text>
          <Image
            source={illustrationSrc}
            style={{ width: 195, height: 223 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            paddingHorizontal: theme.spacing[2],
            paddingVertical: theme.spacing[4],
          }}
        >
          <Button
            title={intl.formatMessage({
              id: 'passkeys.createButton',
              defaultMessage: 'Búa til aðgangslykil',
            })}
            onPress={async () => {
              try {
                setIsLoading(true)
                // Don't show lockscreen behind native passkey modals
                authStore.setState(() => ({
                  noLockScreenUntilNextAppStateActive: true,
                }))

                const registered = await registerPasskey()

                if (!registered) {
                  setIsLoading(false)
                }
                if (registered && url) {
                  // Don't show lockscreen behind native passkey modals
                  authStore.setState(() => ({
                    noLockScreenUntilNextAppStateActive: true,
                  }))

                  const authenticated = await authenticatePasskey()
                  if (authenticated) {
                    setIsLoading(false)
                    Navigation.dismissModal(componentId)
                    // TODO: Add login hint
                    openNativeBrowser(url)
                  }
                  setIsLoading(false)
                }
              } catch (error) {
                setIsLoading(false)
                Alert.alert(
                  intl.formatMessage({
                    id: 'passkeys.errorTitle',
                    defaultMessage: 'Villa',
                  }),
                  intl.formatMessage({
                    id: 'passkeys.errorRegister',
                    defaultMessage: 'Ekki tókst að búa til aðgangslykil',
                  }),
                )
              }
            }}
            style={{ marginBottom: theme.spacing[1] }}
          />
          <Button
            isOutlined
            title={intl.formatMessage({
              id: 'passkeys.skipButton',
              defaultMessage: 'Sleppa',
            })}
            onPress={() => {
              Navigation.dismissModal(componentId)
              url && openBrowser(url, componentId)
            }}
          />
        </View>
      </SafeAreaView>
      {isLoading && (
        <LoadingOverlay>
          <ActivityIndicator
            size="large"
            color={theme.color.white}
            style={{ marginTop: theme.spacing[4] }}
          />
        </LoadingOverlay>
      )}
    </View>
  )
}

PasskeyScreen.options = getNavigationOptions