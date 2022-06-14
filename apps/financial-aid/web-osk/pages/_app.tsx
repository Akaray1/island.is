import React from 'react'
import App, { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'

import { client } from '../graphql'
import {
  FormProvider,
  AppProvider,
  AppLayout,
} from '@island.is/financial-aid-web/osk/src/components'
import { Provider } from 'next-auth/client'

import '@island.is/financial-aid-web/osk/src/styles.css'

class FinancialAidApplication extends App<AppProps> {
  render() {
    const { Component, pageProps } = this.props

    return (
      <Provider
        session={pageProps.session}
        options={{ clientMaxAge: 120, basePath: `/api/auth` }}
      >
        <ApolloProvider client={client}>
          <FormProvider>
            <AppProvider>
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>

              <style jsx global>{`
                @font-face {
                  font-family: 'IBM Plex Sans';
                  font-style: normal;
                  font-weight: 300;
                  font-display: swap;
                  src: local('IBM Plex Sans Light'), local('IBMPlexSans-Light'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-300.woff2')
                      format('woff2'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-300.woff')
                      format('woff');
                }
                @font-face {
                  font-family: 'IBM Plex Sans';
                  font-style: normal;
                  font-weight: 400;
                  font-display: swap;
                  src: local('IBM Plex Sans'), local('IBMPlexSans'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-regular.woff2')
                      format('woff2'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-regular.woff')
                      format('woff');
                }
                @font-face {
                  font-family: 'IBM Plex Sans';
                  font-style: italic;
                  font-weight: 400;
                  font-display: swap;
                  src: local('IBM Plex Sans Italic'),
                    local('IBMPlexSans-Italic'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-italic.woff2')
                      format('woff2'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-italic.woff')
                      format('woff');
                }
                @font-face {
                  font-family: 'IBM Plex Sans';
                  font-style: normal;
                  font-weight: 500;
                  font-display: swap;
                  src: local('IBM Plex Sans Medium'),
                    local('IBMPlexSans-Medium'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-500.woff2')
                      format('woff2'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-500.woff')
                      format('woff');
                }
                @font-face {
                  font-family: 'IBM Plex Sans';
                  font-style: normal;
                  font-weight: 600;
                  font-display: swap;
                  src: local('IBM Plex Sans SemiBold'),
                    local('IBMPlexSans-SemiBold'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-600.woff2')
                      format('woff2'),
                    url('/fonts/ibm-plex/ibm-plex-sans-v7-latin-600.woff')
                      format('woff');
                }
              `}</style>
            </AppProvider>
          </FormProvider>
        </ApolloProvider>
      </Provider>
    )
  }
}

export default FinancialAidApplication
