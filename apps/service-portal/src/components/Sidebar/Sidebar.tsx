import React, { useState } from 'react'
import { Box, Stack, Logo } from '@island.is/island-ui/core'
import {
  ServicePortalPath,
  useDynamicRoutesWithNavigation,
} from '@island.is/service-portal/core'
import { Link } from 'react-router-dom'
import { useListDocuments } from '@island.is/service-portal/graphql'
import { useAuth } from '@island.is/auth/react'
import { useLocale } from '@island.is/localization'
import { sharedMessages } from '@island.is/shared/translations'
import ModuleNavigation from './ModuleNavigation'
import NavItem from './NavItem/NavItem'
import cn from 'classnames'
import * as styles from './Sidebar.css'
import { MAIN_NAVIGATION } from '../../lib/masterNavigation'

interface Props {
  position: number
}

export const Sidebar = ({ position }: Props) => {
  const navigation = useDynamicRoutesWithNavigation(MAIN_NAVIGATION)
  //const [{ sidebarState }, dispatch] = useStore()
  const [collapsed, setCollapsed] = useState(false) //useState(sidebarState === 'closed')
  // const { width } = useWindowSize()
  const { signOut } = useAuth()
  // const isTablet = width < theme.breakpoints.lg && width >= theme.breakpoints.md
  // const isMobile = width < theme.breakpoints.md
  const { unreadCounter } = useListDocuments()
  const { formatMessage } = useLocale()

  /* This is commented out because this will be revisited next fall (2022) */
  // useEffect(() => {
  //   if (isTablet) {
  //     dispatch({
  //       type: ActionType.SetSidebarMenuState,
  //       payload: 'closed',
  //     })
  //     setCollapsed(true)
  //   }
  // }, [isTablet])

  // useEffect(() => {
  //   if (isMobile) {
  //     dispatch({
  //       type: ActionType.SetSidebarMenuState,
  //       payload: 'open',
  //     })
  //     setCollapsed(false)
  //   }
  // }, [isMobile])

  return (
    <aside
      className={cn(styles.sidebar, collapsed && styles.collapsed)}
      style={{ top: position }}
    >
      {/*  Inline style to dynamicly change position of header because of alert banners */}
      <Box
        className={collapsed && styles.logoCollapsed}
        paddingTop={6}
        paddingBottom={3}
        paddingLeft={collapsed ? 0 : 4}
      >
        <Link to={ServicePortalPath.MinarSidurRoot}>
          {collapsed ? (
            <Logo width={24} height={22} iconOnly id="sidebar-collapsed" />
          ) : (
            <Logo width={136} height={22} id="sidebar" />
          )}
        </Link>
      </Box>
      {/* This is commented out because this will be revisited next fall (2022) */}
      {/* <Box
        className={styles.navIcon}
        borderRadius="circle"
        display="flex"
        alignItems="center"
        marginRight={2}
        padding="smallGutter"
        background="blue200"
        onClick={() => {
          dispatch({
            type: ActionType.SetSidebarMenuState,
            payload: collapsed ? 'open' : 'closed',
          })
          setCollapsed(!collapsed)
        }}
      >
        <Icon
          type="outline"
          icon={collapsed ? 'chevronForward' : 'chevronBack'}
          size="medium"
          color="blue400"
        />
      </Box> */}

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="spaceBetween"
        paddingLeft={collapsed ? 6 : 0}
        paddingRight={collapsed ? 6 : 0}
        paddingBottom={4}
        paddingTop={5}
        height="full"
      >
        <Stack space={1}>
          {navigation?.children?.map(
            (rootItem, rootIndex) =>
              !rootItem.navHide && (
                <ModuleNavigation
                  key={rootIndex}
                  nav={rootItem}
                  badge={
                    rootItem.subscribesTo === 'documents' && unreadCounter > 0
                  }
                />
              ),
          )}
        </Stack>

        <Box marginTop={1} background="white" width="full">
          <NavItem
            onClick={() => signOut()}
            active={false}
            icon={{ icon: 'logOut', type: 'outline' }}
          >
            {formatMessage(sharedMessages.logout)}
          </NavItem>
        </Box>
      </Box>
    </aside>
  )
}

export default Sidebar
