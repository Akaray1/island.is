import React, { useState } from 'react'
import { Text, Icon, Box, Checkbox } from '@island.is/island-ui/core'

import {
  ContentContainer,
  Footer,
  Logo,
} from '@island.is/financial-aid-web/osk/src/components'
import * as styles from './info.treat'
import { useRouter } from 'next/router'

import useFormNavigation from '@island.is/financial-aid-web/osk/src/utils/hooks/useFormNavigation'

import {
  getNextPeriod,
  NavigationProps,
} from '@island.is/financial-aid/shared/lib'

import { useLogOut } from '@island.is/financial-aid-web/osk/src/utils/hooks/useLogOut'

const ApplicationInfo = () => {
  const router = useRouter()

  const [accept, setAccept] = useState(false)
  const [hasError, setHasError] = useState(false)

  const logOut = useLogOut()

  const navigation: NavigationProps = useFormNavigation(
    router.pathname,
  ) as NavigationProps

  const errorCheck = () => {
    if (!accept) {
      setHasError(true)
      return
    }

    if (navigation?.nextUrl) {
      router.push(navigation?.nextUrl)
    }
  }

  return (
    <>
      <ContentContainer>
        <Text as="h1" variant="h2" marginBottom={[3, 3, 5]}>
          Gagnaöflun
        </Text>

        <Box className={styles.textIconContainer} marginBottom={3}>
          <Icon
            color="blue400"
            icon="fileTrayFull"
            size="large"
            type="outline"
          />

          <Text as="h2" variant="h4">
            Eftirfarandi gögn verða sótt rafrænt með þínu samþykki.
          </Text>
        </Box>

        <Text marginBottom={3}>
          Við þurfum að afla gagna frá eftirfarandi opinberum aðilum til að
          einfalda umsóknarferlið, staðfesta réttleika upplýsinga og reikna út
          áætlaðar greiðslur.
        </Text>

        <Text as="h3" variant="h5" color="blue400">
          Þjóðskrá Íslands
        </Text>
        <Text marginBottom={3}>Lögheimili, hjúskaparstaða</Text>

        <Text marginBottom={[4, 4, 5]}>
          Við þurfum að fá þig til að renna yfir nokkur atriði varðandi þína
          persónuhagi og fjármál til að reikna út fjárhagsaðstoð til útgreiðslu
          í byrjun {getNextPeriod.month}. Í lok umsóknar getur þú sent hana inn
          eða eytt henni og öllum tengdum gögnum.
        </Text>

        <Box marginBottom={[5, 5, 10]} cursor="pointer">
          <Checkbox
            name={'accept'}
            backgroundColor="blue"
            label="Ég skil að ofangreindra gagna verður aflað í umsóknar- og staðfestingarferlinu"
            large
            checked={accept}
            onChange={(event) => {
              setHasError(false)

              setAccept(event.target.checked)
            }}
            hasError={hasError}
            errorMessage={'Þú þarft að samþykkja gagnaöflun'}
          />
        </Box>

        <Box
          className={styles.logoContainer}
          alignItems="center"
          justifyContent="center"
          marginBottom={5}
        >
          <Logo className={styles.logo} />
        </Box>
      </ContentContainer>
      <Footer
        onPrevButtonClick={() => logOut()}
        previousIsDestructive={true}
        prevButtonText="Hætta við"
        nextButtonText="Staðfesta"
        nextButtonIcon="checkmark"
        onNextButtonClick={errorCheck}
      />
    </>
  )
}

export default ApplicationInfo
