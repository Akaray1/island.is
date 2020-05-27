import { Channel } from '@island.is/message-queue'

export type User = {
  ssn: string
}

export interface GraphQLContext {
  channel: Channel
  appExchangeId: string
  user?: User
}

export type Credentials = {
  user: User
  csrfToken: string
}
