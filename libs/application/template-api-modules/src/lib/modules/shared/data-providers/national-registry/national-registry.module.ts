import { NationalRegistryApi } from '@island.is/clients/national-registry-v1'
import { DynamicModule } from '@nestjs/common'
import { SharedTemplateAPIModule } from '../..'
import { BaseTemplateAPIModuleConfig } from '../../../../types'
import { NationalRegistryService } from './national-registry.service'

export class NationalRegistryModule {
  static register(config: BaseTemplateAPIModuleConfig): DynamicModule {
    return {
      module: NationalRegistryModule,
      imports: [SharedTemplateAPIModule.register(config)],
      providers: [
        NationalRegistryService,
        {
          provide: NationalRegistryApi,
          useFactory: async () =>
            NationalRegistryApi.instantiateClass(config.nationalRegistry),
        },
      ],
      exports: [NationalRegistryService],
    }
  }
}
