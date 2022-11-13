import {
  LocalrunService,
  LocalrunValueFile,
  Services,
} from '../types/output-types'
import { renderers } from '../downstream-dependencies'
import { Localhost } from '../localhost-runtime'
import { EXCLUDED_ENVIRONMENT_NAMES } from '../../cli/render-env-vars'

export const getLocalSetup = (
  uberChart: Localhost,
  services: Services<LocalrunService>,
): LocalrunValueFile => {
  const dockerComposeServices: Services<LocalrunService> = Object.entries(
    services,
  ).reduce((acc, [name, service]) => {
    return {
      ...acc,
      [name]: ` ${
        uberChart.ports[name] ? `PORT=${uberChart.ports[name]} ` : ''
      } PROD_MODE=true ${Object.entries(service.env)
        .filter(([name, val]) => !EXCLUDED_ENVIRONMENT_NAMES.includes(name))
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')} yarn start ${name}`,
    }
  }, {})
  const mocks: Services<LocalrunService> = Object.entries(
    uberChart.mocks,
  ).reduce((acc, [name, target]) => {
    if (name.startsWith('mock-')) {
      return {
        ...acc,
        [name]: {
          'proxy-port': uberChart.ports[name],
          'mountebank-imposter-config': JSON.stringify({
            protocol: 'http',
            name: name,
            port: uberChart.ports[name],
            stubs: [
              {
                predicates: [{ equals: {} }],
                responses: [
                  {
                    proxy: {
                      to: target,
                      mode: 'proxyAlways',
                      predicateGenerators: [
                        {
                          matches: {
                            method: true,
                            path: true,
                            query: true,
                            body: true,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          }),
        },
      }
    }
    return {
      ...acc,
    }
  }, {})

  return {
    services: { ...dockerComposeServices },
    mocks: mocks,
  }
}
