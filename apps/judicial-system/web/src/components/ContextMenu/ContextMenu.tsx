import React, { forwardRef, ReactElement, useCallback, useContext } from 'react'
import { useIntl } from 'react-intl'
import cn from 'classnames'
import { Menu, MenuButton, MenuItem, useMenuState } from 'reakit/Menu'

import {
  Box,
  Button,
  getTextStyles,
  Icon,
  IconMapIcon,
  useBoxStyles,
} from '@island.is/island-ui/core'
import { TestSupport } from '@island.is/island-ui/utils'
import {
  isDefenceUser,
  isProsecutionUser,
} from '@island.is/judicial-system/types'

import {
  CaseAppealState,
  CaseListEntry,
  CaseTransition,
} from '../../graphql/schema'
import { useCase } from '../../utils/hooks'
import { UserContext } from '../UserProvider/UserProvider'
import { contextMenu as strings } from './ContextMenu.strings'
import * as styles from './ContextMenu.css'

export const useContextMenu = () => {
  const { transitionCase } = useCase()
  const { formatMessage } = useIntl()
  const { user } = useContext(UserContext)

  const shouldDisplayWithdrawAppealOption = useCallback(
    (caseEntry: CaseListEntry) => {
      if (!isProsecutionUser(user) && !isDefenceUser(user)) {
        return false
      }

      return Boolean(
        (caseEntry.appealState === CaseAppealState.APPEALED ||
          caseEntry.appealState === CaseAppealState.RECEIVED) &&
          isProsecutionUser(user)
          ? caseEntry.prosecutorPostponedAppealDate
          : caseEntry.accusedPostponedAppealDate,
      )
    },
    [user],
  )

  const withdrawAppealMenuOption = (caseId: string, cases: CaseListEntry[]) => {
    return {
      title: formatMessage(strings.withdrawAppeal),
      onClick: async () => {
        const res = await transitionCase(caseId, CaseTransition.WITHDRAW_APPEAL)

        if (res === true) {
          const transitionedCase = cases.find((tc) => caseId === tc.id)
          if (transitionedCase) {
            transitionedCase.appealState = CaseAppealState.WITHDRAWN
          }
        }
      },
      icon: 'trash' as IconMapIcon,
    }
  }

  return {
    shouldDisplayWithdrawAppealOption,
    withdrawAppealMenuOption,
  }
}

export interface ContextMenuProps {
  // Aria label for menu
  menuLabel: string

  // Menu items
  items: {
    href?: string
    onClick?: () => void
    title: string
    icon?: IconMapIcon
  }[]

  // Text in the menu button
  title?: string

  // Custom element to be used as the menu button
  disclosure?: ReactElement

  // Space between menu and button
  offset?: [string | number, string | number]
}

const ContextMenu = forwardRef<HTMLElement, ContextMenuProps & TestSupport>(
  ({ disclosure, menuLabel, items, title, dataTestId, offset }, ref) => {
    const menu = useMenuState({
      placement: 'bottom-end',
      unstable_offset: offset ?? [0, 4],
    })

    const menuBoxStyle = useBoxStyles({
      component: 'div',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'large',
      zIndex: 10,
    })

    const menuItemBoxStyle = useBoxStyles({
      component: 'button',
      display: 'flex',
      alignItems: 'center',
      width: 'full',
      padding: 2,
      cursor: 'pointer',
    })

    const menuItemTextStyle = getTextStyles({
      variant: 'default',
    })

    return (
      <>
        {disclosure ? (
          <MenuButton
            ref={ref}
            {...menu}
            {...disclosure.props}
            dataTestId={dataTestId}
          >
            {(disclosureProps) =>
              React.cloneElement(disclosure, disclosureProps)
            }
          </MenuButton>
        ) : (
          <MenuButton as={Button} icon="add" {...menu} dataTestId={dataTestId}>
            {title}
          </MenuButton>
        )}
        <Menu
          {...menu}
          aria-label={menuLabel}
          className={cn(styles.menu, menuBoxStyle)}
        >
          {items.map((item, index) => {
            let anchorProps = {}
            if (item.href) {
              anchorProps = {
                href: item.href,
                as: 'a',
              }
            }
            return (
              <MenuItem
                {...menu}
                {...anchorProps}
                key={`${item.title}_${index}`}
                onClick={(evt) => {
                  evt.stopPropagation()
                  menu.hide()
                  if (item.onClick) {
                    item.onClick()
                  }
                }}
                className={cn(
                  menuItemBoxStyle,
                  menuItemTextStyle,
                  styles.menuItem,
                )}
              >
                {item.icon && (
                  <Box display="flex" marginRight={2}>
                    <Icon icon={item.icon} type="outline" color="blue400" />
                  </Box>
                )}
                {item.title}
              </MenuItem>
            )
          })}
        </Menu>
      </>
    )
  },
)

export default ContextMenu
