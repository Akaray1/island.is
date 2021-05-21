import { useQuery } from '@apollo/client'
import {
  Close,
  Heading,
  NotificationCard,
  WelcomeCard,
} from '@island.is/island-ui-native'
import React from 'react'
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import CodePush from 'react-native-code-push'
import { NavigationFunctionComponent } from 'react-native-navigation'
import { useTheme } from 'styled-components/native'
import illustrationDarkSrc from '../../assets/illustrations/digital-services-m2-dark.png'
import illustrationSrc from '../../assets/illustrations/digital-services-m2.png'
import logo from '../../assets/logo/logo-64w.png'
import { AppLoading } from '../../components/app-loading/app-loading'
import { BottomTabsIndicator } from '../../components/bottom-tabs-indicator/bottom-tabs-indicator'
import { ViewPager } from '../../components/view-pager/view-pager'
import { client } from '../../graphql/client'
import {
  ListApplicationsResponse,
  LIST_APPLICATIONS_QUERY,
} from '../../graphql/queries/list-applications.query'
import {
  ListNotificationsResponse,
  LIST_NOTIFICATIONS_QUERY,
} from '../../graphql/queries/list-notifications.query'
import { authStore } from '../../stores/auth-store'
import { useNotificationsStore } from '../../stores/notifications-store'
import { usePreferencesStore } from '../../stores/preferences-store'
import { useUiStore } from '../../stores/ui-store'
import { navigateToNotification } from '../../utils/deep-linking'
import { useIntl } from '../../utils/intl'
import { testIDs } from '../../utils/test-ids'
import { useThemedNavigationOptions } from '../../utils/use-themed-navigation-options'
import { ApplicationsModule } from './applications-module'

const {
  useNavigationOptions,
  getNavigationOptions,
} = useThemedNavigationOptions(
  (theme, intl, initialized) => ({
    topBar: {
      visible: initialized,
      animate: false,
      title: {
        text: intl.formatMessage({ id: 'home.screenTitle' }),
      },
    },
    bottomTab: {
      ...({
        accessibilityLabel: intl.formatMessage({ id: 'home.screenTitle' }),
      } as any),
      selectedIconColor: (null as any),
      iconColor: theme.shade.foreground,
      textColor: initialized ? theme.shade.foreground : theme.shade.background,
      icon: initialized ? require('../../assets/icons/tabbar-home.png') : undefined,
    },
  }),
  {
    topBar: {
      animate: false,
      visible: false,
    },
    bottomTab: {
      testID: testIDs.TABBAR_TAB_HOME,
      iconInsets: {
        top: 16,
        bottom: -4,
      },
      iconWidth: 42,
      iconHeight: 42,
      disableIconTint: false,
      disableSelectedIconTint: true,
    },
  },
)

export const MainHomeScreen: NavigationFunctionComponent = ({
  componentId,
}) => {
  useNavigationOptions(componentId)
  const notificationsStore = useNotificationsStore()
  const { dismissed, dismiss } = usePreferencesStore()
  const theme = useTheme()
  const intl = useIntl()
  const ui = useUiStore()
  console.log('oki233', authStore.getState().authorizeResult)


  const notificationsRes = useQuery<ListNotificationsResponse>(
    LIST_NOTIFICATIONS_QUERY,
    { client },
  )

  const applicationsRes = useQuery<ListApplicationsResponse>(
    LIST_APPLICATIONS_QUERY,
    { client },
  )

  if (!ui.initializedApp) {
    return <AppLoading />
  }

  return (
    <>
      <ScrollView testID={testIDs.SCREEN_HOME}>
        {!dismissed.includes('onboardingWidget') && (
          <SafeAreaView style={{ marginHorizontal: 16, marginTop: 16 }}>
            <Heading
              button={
                <TouchableOpacity onPress={() => dismiss('onboardingWidget')}>
                  <Close />
                </TouchableOpacity>
              }
            >
              {intl.formatMessage({ id: 'home.welcomeText' })}{' '}
              {authStore.getState().userInfo?.name.split(' ').shift()}
            </Heading>
            <ViewPager>
              <WelcomeCard
                key="card-1"
                number="1"
                description="Í þessari fyrstu útgáfu af appinu geturðu nálgast rafræn skjöl og skírteini, fengið tilkynningar og séð stöðu umsókna."
                imgSrc={theme.isDark ? illustrationDarkSrc : illustrationSrc}
                backgroundColor={
                  theme.isDark ? '#2A1240' : theme.color.purple100
                }
              />
              <WelcomeCard
                key="card-2"
                number="2"
                description="Í þessari fyrstu útgáfu af appinu geturðu nálgast rafræn skjöl og skírteini, fengið tilkynningar og séð stöðu umsókna."
                imgSrc={theme.isDark ? illustrationDarkSrc : illustrationSrc}
                backgroundColor={theme.isDark ? '#1C1D53' : theme.color.blue100}
              />
              <WelcomeCard
                key="card-3"
                number="3"
                description="Í þessari fyrstu útgáfu af appinu geturðu nálgast rafræn skjöl og skírteini, fengið tilkynningar og séð stöðu umsókna."
                imgSrc={theme.isDark ? illustrationDarkSrc : illustrationSrc}
                backgroundColor={theme.isDark ? '#3E002E' : theme.color.red100}
              />
            </ViewPager>
          </SafeAreaView>
        )}
        <SafeAreaView style={{ marginHorizontal: 16 }}>
          <ApplicationsModule
            applications={applicationsRes.data?.applicationApplications ?? []}
            loading={applicationsRes.loading}
            componentId={componentId}
          />
          <Heading>{intl.formatMessage({ id: 'home.notifications' })}</Heading>
          {notificationsRes.data?.listNotifications
            .slice(0, 5)
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                id={notification.id}
                title={notification.serviceProvider}
                message={notification.title}
                date={new Date(notification.date)}
                icon={logo}
                unread={!notificationsStore.readItems.has(notification.id)}
                onPress={() =>
                  navigateToNotification(notification, componentId)
                }
                actions={notification.actions?.map((action) => ({
                  text: action.text,
                  onPress() {
                    navigateToNotification(
                      { id: notification.id, link: action.link },
                      componentId,
                    )
                  },
                }))}
              />
            ))}
        </SafeAreaView>
      </ScrollView>
      <BottomTabsIndicator index={1} total={3} />
    </>
  )
}

MainHomeScreen.options = getNavigationOptions;

export const HomeScreen = CodePush({
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.ON_NEXT_RESUME,
})(MainHomeScreen)

HomeScreen.options = MainHomeScreen.options
