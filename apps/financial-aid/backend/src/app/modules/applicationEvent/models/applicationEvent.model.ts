import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'

import { ApiProperty } from '@nestjs/swagger'

import { ApplicationModel } from '../../application'

import { ApplicationEventType } from '@island.is/financial-aid/shared/lib'

@Table({
  tableName: 'application_events',
  timestamps: false,
})
export class ApplicationEventModel extends Model<ApplicationEventModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  @ApiProperty()
  id: string

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  @ApiProperty()
  created: Date

  //Todo
  // @ForeignKey(() => ApplicationModel)
  // @Column({
  //   type: DataType.UUID,
  //   allowNull: false,
  // })
  // @BelongsTo(() => ApplicationModel, 'id')
  // @ApiProperty({ type: ApplicationModel })
  // applicationId: string

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(ApplicationEventType),
  })
  @ApiProperty({ enum: ApplicationEventType })
  eventType: ApplicationEventType

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  comment?: string
}
