import {
  Button,
  EmptyList,
  ListItem,
  ListItemSkeleton,
  SearchBar,
  Tag,
  TopLine,
} from '@ui'
import { setBadgeCountAsync } from 'expo-notifications'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import {
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import { useNavigationComponentDidAppear } from 'react-native-navigation-hooks/dist'
import styled, { useTheme } from 'styled-components/native'
import filterIcon from '../../assets/icons/filter-icon.png'
import inboxReadIcon from '../../assets/icons/inbox-read.png'
import illustrationSrc from '../../assets/illustrations/le-company-s3.png'
import { BottomTabsIndicator } from '../../components/bottom-tabs-indicator/bottom-tabs-indicator'
import {
  useMarkAllDocumentsAsReadMutation,
  DocumentV2,
  useListDocumentsQuery,
} from '../../graphql/types/schema'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import { useConnectivityIndicator } from '../../hooks/use-connectivity-indicator'
import { navigateTo } from '../../lib/deep-linking'
import { useOrganizationsStore } from '../../stores/organizations-store'
import { useUiStore } from '../../stores/ui-store'
import { ComponentRegistry } from '../../utils/component-registry'
import { getRightButtons } from '../../utils/get-main-root'
import { testIDs } from '../../utils/test-ids'
import { isAndroid } from '../../utils/devices'
import { InboxCard } from '@ui/lib/card/inbox-card'
import { useApolloClient } from '@apollo/client'

type ListItem =
  | { id: string; type: 'skeleton' | 'empty' }
  | (DocumentV2 & { type: undefined })

const DEFAULT_PAGE_SIZE = 12

const LoadingWrapper = styled.View`
  padding-vertical: ${({ theme }) => theme.spacing[3]}px;
  ${({ theme }) => isAndroid && `padding-bottom: ${theme.spacing[6]}px;`}
`

const ListHeaderWrapper = styled.View`
  padding: ${({ theme }) => theme.spacing[2]}px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[1]}px;
  min-height: 76px; // To prevent flickering on android
`

const TagsWrapper = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing[2]}px;
  padding-bottom: ${({ theme }) => theme.spacing[2]}px;
  margin-top: -4px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[2]}px;
`

const { useNavigationOptions, getNavigationOptions } =
  createNavigationOptionHooks(
    (theme, intl, initialized) => ({
      topBar: {
        title: {
          text: intl.formatMessage({ id: 'inbox.screenTitle' }),
        },
        rightButtons: initialized ? getRightButtons({ theme } as any) : [],
      },
      bottomTab: {
        iconColor: theme.color.blue400,
        text: initialized
          ? intl.formatMessage({ id: 'inbox.bottomTabText' })
          : '',
      },
    }),
    {
      topBar: {
        elevation: 0,
        largeTitle: {
          visible: true,
        },
        scrollEdgeAppearance: {
          active: true,
          noBorder: true,
        },
      },
      bottomTab: {
        testID: testIDs.TABBAR_TAB_INBOX,
        iconInsets: {
          bottom: -4,
        },
        icon: require('../../assets/icons/tabbar-inbox.png'),
        selectedIcon: require('../../assets/icons/tabbar-inbox-selected.png'),
      },
    },
  )

const PressableListItem = React.memo(
  ({ item, listParams }: { item: DocumentV2; listParams: any }) => {
    const { getOrganizationLogoUrl } = useOrganizationsStore()
    return (
      <InboxCard
        key={item.id}
        subject={item.subject}
        publicationDate={item.publicationDate}
        id={item.id}
        unread={!item.opened}
        bookmarked={item.bookmarked}
        senderName={item.sender.name}
        icon={item.sender.name && getOrganizationLogoUrl(item.sender.name, 75)}
        onPress={() =>
          navigateTo(`/inbox/${item.id}`, {
            title: item.sender.name,
            listParams,
          })
        }
      />
    )
  },
)

function useThrottleState(state: string, delay = 500) {
  const [throttledState, setThrottledState] = useState(state)
  useEffect(() => {
    const timeout = setTimeout(
      () => setThrottledState(state),
      state === '' ? 0 : delay,
    )
    return () => clearTimeout(timeout)
  }, [state, delay])
  return throttledState
}

type Filters = {
  opened?: boolean
  archived?: boolean
  bookmarked?: boolean
  subjectContains?: string
}

function applyFilters(filters?: Filters) {
  return {
    archived: filters?.archived ? true : undefined,
    bookmarked: filters?.bookmarked ? true : undefined,
    opened: filters?.opened ? false : undefined,
    subjectContains: filters?.subjectContains ?? '',
  }
}

export const InboxScreen: NavigationFunctionComponent<{
  opened?: boolean
  archived?: boolean
  bookmarked?: boolean
}> = ({
  componentId,
  opened = false,
  archived = false,
  bookmarked = false,
}) => {
  useNavigationOptions(componentId)
  const ui = useUiStore()
  const intl = useIntl()
  const scrollY = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)
  const client = useApolloClient()
  const [query, setQuery] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const queryString = useThrottleState(query)
  const theme = useTheme()
  const [visible, setVisible] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const pageRef = useRef(1)
  const loadingTimeout = useRef<ReturnType<typeof setTimeout>>()

  const incomingFilters = useMemo(() => {
    return {
      opened,
      archived,
      bookmarked,
      subjectContains: queryString,
    }
  }, [opened, archived, bookmarked, queryString])

  const [filters, setFilters] = useState(applyFilters(incomingFilters))

  const res = useListDocumentsQuery({
    variables: {
      input: {
        pageSize: DEFAULT_PAGE_SIZE,
        ...filters,
      },
    },
  })

  const [markAllAsRead, { loading: markAllAsReadLoading }] =
    useMarkAllDocumentsAsReadMutation({
      onCompleted: (result) => {
        if (result.documentsV2MarkAllAsRead?.success) {
          // If all documents are successfully marked as read, update cache to reflect that
          for (const document of res.data?.documentsV2?.data || []) {
            client.cache.modify({
              id: client.cache.identify(document),
              fields: {
                opened: () => true,
              },
            })
          }

          // Set unread count to 0 so red badge disappears
          client.cache.modify({
            fields: {
              documentsV2: (existing) => {
                return {
                  ...existing,
                  unreadCount: 0,
                }
              },
            },
          })
        }
      },
    })

  const unreadCount = res?.data?.documentsV2?.unreadCount ?? 0

  useConnectivityIndicator({
    componentId,
    rightButtons: getRightButtons(),
    queryResult: res,
    refetching: refetching || markAllAsReadLoading,
  })

  useEffect(() => {
    const appliedFilters = applyFilters(incomingFilters)
    // deep equal incoming filters
    if (
      JSON.stringify(appliedFilters) === JSON.stringify(filters) ||
      incomingFilters === undefined
    ) {
      return
    }
    // Reset page on filter changes
    setFilters(appliedFilters)
  }, [incomingFilters, filters])

  const items = useMemo(() => res.data?.documentsV2?.data ?? [], [res.data])
  const isSearch = ui.inboxQuery.length > 2

  const loadMore = async () => {
    if (res.loading || loadingMore) {
      return
    }

    const numItems = res.data?.documentsV2?.totalCount ?? DEFAULT_PAGE_SIZE

    // No more items left to fetch
    if (DEFAULT_PAGE_SIZE * pageRef.current > numItems) {
      return
    }
    setLoadingMore(true)

    pageRef.current = pageRef.current + 1
    const page = pageRef.current

    try {
      await res.fetchMore({
        variables: {
          input: {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            ...filters,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || !fetchMoreResult.documentsV2?.data?.length) {
            return prev
          }

          return {
            documentsV2: {
              ...fetchMoreResult.documentsV2,
              data: [
                ...(prev.documentsV2?.data || []),
                ...(fetchMoreResult.documentsV2?.data || []),
              ],
            },
          }
        },
      })
    } catch (e) {
      // TODO handle error
    }
    setLoadingMore(false)
  }

  useEffect(() => {
    Navigation.mergeOptions(ComponentRegistry.InboxScreen, {
      bottomTab: {
        iconColor: theme.color.blue400,
        textColor: theme.shade.foreground,
        text: intl.formatMessage({ id: 'inbox.bottomTabText' }),
        testID: testIDs.TABBAR_TAB_INBOX,
        iconInsets: {
          bottom: -4,
        },
        icon: require('../../assets/icons/tabbar-inbox.png'),
        selectedIcon: require('../../assets/icons/tabbar-inbox-selected.png'),
        badge: unreadCount > 0 ? unreadCount.toString() : (null as any),
        badgeColor: theme.color.red400,
      },
    })
    setBadgeCountAsync(unreadCount)
  }, [intl, theme, unreadCount])

  const keyExtractor = useCallback(
    (item: ListItem) => {
      return item.id.toString()
    },
    [items],
  )

  const onRefresh = useCallback(() => {
    try {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current)
      }
      setRefetching(true)
      res
        .refetch()
        .then(() => {
          ;(loadingTimeout as any).current = setTimeout(() => {
            setRefetching(false)
          }, 1331)
        })
        .catch(() => {
          setRefetching(false)
        })
    } catch (err) {
      setRefetching(false)
    }
  }, [])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItem>) => {
      if (item.type === 'skeleton') {
        return <ListItemSkeleton />
      }
      if (item.type === 'empty') {
        return (
          <View style={{ marginTop: 80 }}>
            <EmptyList
              title={intl.formatMessage({ id: 'inbox.emptyListTitle' })}
              description={intl.formatMessage({
                id: 'inbox.emptyListDescription',
              })}
              image={
                <Image
                  source={illustrationSrc}
                  style={{ width: 134, height: 176 }}
                  resizeMode="contain"
                />
              }
            />
          </View>
        )
      }
      return (
        <PressableListItem
          item={item as DocumentV2}
          listParams={{
            ...filters,
          }}
        />
      )
    },
    [intl, filters],
  )

  const data = useMemo(() => {
    if (res.loading && !res.data) {
      return Array.from({ length: 20 }).map((_, id) => ({
        id: String(id),
        type: 'skeleton',
      }))
    }
    if (items.length === 0) {
      return [{ id: '0', type: 'empty' }]
    }
    return items
  }, [res.loading, res.data, items]) as ListItem[]

  useNavigationComponentDidAppear(() => {
    setVisible(true)
  }, componentId)

  const onPressMarkAllAsRead = () => {
    Alert.alert(
      intl.formatMessage({
        id: 'inbox.markAllAsReadPromptTitle',
      }),
      intl.formatMessage({
        id: 'inbox.markAllAsReadPromptDescription',
      }),
      [
        {
          text: intl.formatMessage({
            id: 'inbox.markAllAsReadPromptCancel',
          }),
          style: 'cancel',
        },
        {
          text: intl.formatMessage({
            id: 'inbox.markAllAsReadPromptConfirm',
          }),
          style: 'destructive',
          onPress: async () => {
            await markAllAsRead()
          },
        },
      ],
    )
  }

  if (!visible) {
    return null
  }

  return (
    <>
      <Animated.FlatList
        ref={flatListRef}
        scrollEventThrottle={16}
        scrollToOverflowEnabled
        onEndReachedThreshold={0.5}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          },
        )}
        style={{ marginHorizontal: 0 }}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <ListHeaderWrapper>
              <SearchBar
                placeholder={intl.formatMessage({
                  id: 'inbox.searchPlaceholder',
                })}
                value={query}
                onChangeText={(text) => setQuery(text)}
              />
              <Button
                title={intl.formatMessage({
                  id: 'inbox.filterButtonTitle',
                })}
                isOutlined
                isUtilityButton
                style={{
                  marginLeft: 8,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                icon={filterIcon}
                iconStyle={{ tintColor: theme.color.blue400 }}
                onPress={() => {
                  navigateTo('/inbox-filter', {
                    opened,
                    archived,
                    bookmarked,
                  })
                }}
              />
              <Button
                icon={inboxReadIcon}
                isUtilityButton
                isOutlined
                style={{
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingLeft: 12,
                  paddingRight: 12,
                  minWidth: 40,
                }}
                onPress={onPressMarkAllAsRead}
              />
            </ListHeaderWrapper>
            {opened || archived || bookmarked ? (
              <TagsWrapper>
                {opened && (
                  <Tag
                    title={intl.formatMessage({
                      id: 'inbox.filterOpenedTagTitle',
                    })}
                    closable
                    onClose={() =>
                      Navigation.updateProps(componentId, { opened: false })
                    }
                  />
                )}
                {archived && (
                  <Tag
                    title={intl.formatMessage({
                      id: 'inbox.filterArchivedTagTitle',
                    })}
                    closable
                    onClose={() =>
                      Navigation.updateProps(componentId, { archived: false })
                    }
                  />
                )}
                {bookmarked && (
                  <Tag
                    title={intl.formatMessage({
                      id: 'inbox.filterStarredTagTitle',
                    })}
                    closable
                    onClose={() =>
                      Navigation.updateProps(componentId, { bookmarked: false })
                    }
                  />
                )}
              </TagsWrapper>
            ) : null}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refetching} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          loadMore()
        }}
        ListFooterComponent={
          loadingMore && !res.error ? (
            <LoadingWrapper>
              <ActivityIndicator
                size="small"
                animating
                color={theme.color.blue400}
              />
            </LoadingWrapper>
          ) : null
        }
      />
      <BottomTabsIndicator index={0} total={5} />
      {!isSearch && <TopLine scrollY={scrollY} />}
    </>
  )
}

InboxScreen.options = getNavigationOptions
