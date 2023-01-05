import {
  ApplicationApiCoreModule,
  SequelizeConfigService,
} from '@island.is/application/api/core'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Payment } from './payment.model'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentCallbackController } from './payment-callback.controller'
import { LoggingModule } from '@island.is/logging'
import { ConfigModule } from '@nestjs/config'
import {
  ChargeFjsV2ClientConfig,
  ChargeFjsV2ClientModule,
} from '@island.is/clients/charge-fjs-v2'
import { XRoadConfig } from '@island.is/nest/config'

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    SequelizeModule.forFeature([Payment]),
    ApplicationApiCoreModule,
    LoggingModule,
    ChargeFjsV2ClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [XRoadConfig, ChargeFjsV2ClientConfig],
    }),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController, PaymentCallbackController],
})
export class PaymentModule {}
