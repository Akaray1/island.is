import config from '../../playwright.config.base'

import type { PlaywrightTestConfig } from '@playwright/test'

const localConfig: PlaywrightTestConfig = {
  testDir: './e2e',
  webServer: {
    port: 4200,
    command:
      'yarn infra run-local-env --service=web --dependencies=api --proxies',
    timeout: 120 * 1000, // 2 minutes for the slow web 🐌
    reuseExistingServer: true,
  },
}
export default { ...config, ...localConfig }
