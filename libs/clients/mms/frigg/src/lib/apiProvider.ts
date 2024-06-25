import {
  ConfigType,
  IdsClientConfig,
  LazyDuringDevScope,
  XRoadConfig,
} from '@island.is/nest/config'
import {
  Configuration,
  DefaultApi,
  KeyOptionsManagementApi,
} from '../../gen/fetch'
import { ConfigFactory } from './configFactory'
import { FriggClientConfig } from './friggClient.config'

export const apiProvider = [KeyOptionsManagementApi, DefaultApi].map(
  (apiRecord) => ({
    provide: apiRecord,
    scope: LazyDuringDevScope,
    useFactory: (
      xRoadConfig: ConfigType<typeof XRoadConfig>,
      config: ConfigType<typeof FriggClientConfig>,
      idsClientConfig: ConfigType<typeof IdsClientConfig>,
    ) => {
      return new apiRecord(
        new Configuration(ConfigFactory(xRoadConfig, config, idsClientConfig)),
      )
    },
    inject: [XRoadConfig.KEY, FriggClientConfig.KEY, IdsClientConfig.KEY],
  }),
)
