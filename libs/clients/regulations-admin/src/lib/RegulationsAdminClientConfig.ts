import * as z from 'zod'
import { defineConfig } from '@island.is/nest/config'

const schema = z.object({
  baseApiUrl: z.string(),
})

export const RegulationsAdminClientConfig = defineConfig({
  name: 'RegulationsAdminClientConfig',
  schema,
  load: (env) => ({
    baseApiUrl: env.required(
      'REGULATIONS_ADMIN_URL',
      'http://localhost:3333/api',
    ),
  }),
})
