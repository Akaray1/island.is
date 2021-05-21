import { useQuery } from '@apollo/client'
import {
  NavigationBarSheet,
  NotificationCard,
} from '@island.is/island-ui-native'
import React from 'react'
import { useIntl } from 'react-intl'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableHighlight,
} from 'react-native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import { useTheme } from 'styled-components'
import logo from '../../assets/logo/logo-64w.png'
import { client } from '../../graphql/client'
import { INotification } from '../../graphql/fragments/notification.fragment'
import {
  ListNotificationsResponse,
  LIST_NOTIFICATIONS_QUERY,
} from '../../graphql/queries/list-notifications.query'
import { useNotificationsStore } from '../../stores/notifications-store'
import { navigateToNotification } from '../../utils/deep-linking'
import { testIDs } from '../../utils/test-ids'
import { useThemedNavigationOptions } from '../../utils/use-themed-navigation-options'

const {
  getNavigationOptions,
  useNavigationOptions,
} = useThemedNavigationOptions(() => ({
  topBar: {
    visible: false,
  },
}))

export const NotificationsScreen: NavigationFunctionComponent = ({
  componentId,
}) => {
  useNavigationOptions(componentId)
  const notificationsRes = useQuery<ListNotificationsResponse>(
    LIST_NOTIFICATIONS_QUERY,
    {
      client,
    },
  )
  const notificationsStore = useNotificationsStore()
  const intl = useIntl()
  const theme = useTheme()

  if (notificationsRes.loading) {
    return <ActivityIndicator />
  }

  if (!notificationsRes.data) {
    return <Text>No data</Text>
  }

  const notifications = notificationsRes.data?.listNotifications!

  const onNotificationPress = (notification: INotification) => {
    navigateToNotification(notification, componentId)
  }

  const renderNotificationItem = ({ item }: { item: INotification }) => {
    const unread = !notificationsStore.readItems.has(item.id)
    return (
      <TouchableHighlight
        underlayColor={theme.color.blue100}
        onPress={() => onNotificationPress(item)}
        testID={testIDs.NOTIFICATION_CARD_BUTTON}
      >
        <NotificationCard
          key={item.id}
          id={item.id}
          title={item.serviceProvider}
          message={item.title}
          date={new Date(item.date)}
          icon={logo}
          unread={!notificationsStore.readItems.has(item.id)}
          onPress={() => navigateToNotification(item, componentId)}
          actions={item.actions?.map((action) => ({
            text: action.text,
            onPress() {
              navigateToNotification(
                { id: item.id, link: action.link },
                componentId,
              )
            },
          }))}
        />
      </TouchableHighlight>
    )
  }

  return (
    <>
      <NavigationBarSheet
        title={intl.formatMessage({ id: 'notifications.screenTitle' })}
        onClosePress={() => Navigation.dismissModal(componentId)}
        style={{ marginHorizontal: 16 }}
      />
      <SafeAreaView
        style={{ marginHorizontal: 16, flex: 1 }}
        testID={testIDs.SCREEN_NOTIFICATIONS}
      >
        <FlatList
          style={{ flex: 1 }}
          data={notifications}
          keyExtractor={(item: any) => item.id}
          renderItem={renderNotificationItem}
        />
      </SafeAreaView>
    </>
  )
}

NotificationsScreen.options = getNavigationOptions
