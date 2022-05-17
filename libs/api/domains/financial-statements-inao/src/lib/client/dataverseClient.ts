import { createEnhancedFetch } from '@island.is/clients/middlewares'
import type { ConfigType } from '@island.is/nest/config'

import { Inject, Injectable } from '@nestjs/common'

import { dataverseClientConfig } from './dataverseClient.config'
import { ClientType } from '../models/clientType.model'
import { Election } from '../models/election.model'

@Injectable()
export class DataverseClient {
  constructor(
    @Inject(dataverseClientConfig.KEY)
    private config: ConfigType<typeof dataverseClientConfig>,
  ) {}

  basePath = this.config.basePath

  fetch = createEnhancedFetch({
    name: 'financialStatementsInao-odata',
    autoAuth: {
      issuer: this.config.issuer,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      scope: [this.config.scope],
      mode: 'token',
      tokenEndpoint: this.config.tokenEndpoint,
    },
  })

  async getElections() {
    const url = `${this.basePath}/new_elections`
    const response = await this.fetch(url)
    const data = await response.json()

    if (!data || !data.value) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elections: Election[] = data.value.map((x: any) => {
      return <Election>{
        name: x.new_name,
        month: x.new_month,
        year: x.new_year,
        ageLimit: x.new_age_limit,
      }
    })

    return elections
  }

  async getClientTypes() {
    const url = `${this.basePath}/new_clienttypes`
    const response = await this.fetch(url)
    const data = await response.json()

    if (!data || !data.value) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientTypes: ClientType[] = data.value.map((x: any) => {
      return <ClientType>{
        clientTypeId: x.new_clienttypeid,
        code: x.new_code,
        name: x.new_name,
      }
    })

    return clientTypes
  }
}
