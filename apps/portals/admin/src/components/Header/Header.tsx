import React from 'react'
import { Link } from 'react-router-dom'

import {
  Box,
  Hidden,
  Logo,
  FocusableBox,
  Inline,
  GridContainer,
} from '@island.is/island-ui/core'
import { UserMenu } from '@island.is/shared/components'

import { ModuleSwitcher } from '../ModuleSwitcher/ModuleSwitcher'

import * as styles from './Header.css'

export const Header = () => {
  return (
    <div className={styles.placeholder}>
      <header className={styles.header}>
        <GridContainer>
          <Box
            display="flex"
            justifyContent="spaceBetween"
            alignItems="center"
            width="full"
          >
            <Inline alignY="center">
              <Link to={'/'}>
                <FocusableBox component="div">
                  <Hidden above="md">
                    <Logo width={40} iconOnly />
                  </Hidden>
                  <Hidden below="lg">
                    <Logo width={160} />
                  </Hidden>
                </FocusableBox>
              </Link>
              <ModuleSwitcher />
            </Inline>
            <Hidden print>
              <Box
                display="flex"
                alignItems="center"
                flexWrap="nowrap"
                marginLeft={1}
              >
                <UserMenu showLanguageSwitcher={false} iconOnlyMobile />
              </Box>
            </Hidden>
          </Box>
        </GridContainer>
      </header>
    </div>
  )
}

export default Header
