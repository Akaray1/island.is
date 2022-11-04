import React from 'react'
import { MessageDescriptor } from 'react-intl'

import {
  Box,
  GridColumn,
  GridRow,
  Hidden,
  Text,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { ModuleAlertBannerSection } from '../AlertMessage/ModuleAlertMessageSection'

interface Props {
  title: MessageDescriptor | string
  intro?: MessageDescriptor | string
  img?: string
  hideImgPrint?: boolean
}

export const IntroHeader = ({
  title,
  intro,
  img,
  hideImgPrint = false,
}: Props) => {
  const { formatMessage } = useLocale()
  return (
    <GridRow marginBottom={6}>
      <GridColumn span={['8/8', '5/8']} order={[2, 1]}>
        <Text variant="h3" as="h1">
          {formatMessage(title)}
        </Text>
        {intro && (
          <Text variant="default" paddingTop={2}>
            {formatMessage(intro)}
          </Text>
        )}
      </GridColumn>
      <GridColumn
        span={['12/12', '12/12', '6/9']}
        order={[4, 3]}
        paddingTop={4}
      >
        <ModuleAlertBannerSection />
      </GridColumn>
      {img && (
        <GridColumn span={['8/8', '3/8']} order={[1, 4]}>
          <Hidden print={hideImgPrint} below="lg">
            <Box textAlign="center" padding={[6, 0]}>
              <img src={img} alt="" />
            </Box>
          </Hidden>
        </GridColumn>
      )}
    </GridRow>
  )
}

export default IntroHeader
