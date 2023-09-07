import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { Course } from '../../course/model'
import { Program } from './program'
import { Requirement } from '@island.is/university-gateway-types'

@Table({
  tableName: 'program_course',
})
export class ProgramCourse extends Model {
  // @ApiProperty({
  //   description: 'Program tag ID',
  //   example: '00000000-0000-0000-0000-000000000000',
  // })
  @ApiHideProperty()
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string

  // @ApiProperty({
  //   description: 'Program ID',
  //   example: '00000000-0000-0000-0000-000000000000',
  // })
  @ApiHideProperty()
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ForeignKey(() => Program)
  programId!: string

  // @ApiProperty({
  //   description: 'Course ID',
  //   example: '00000000-0000-0000-0000-000000000000',
  // })
  @ApiHideProperty()
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ForeignKey(() => Course)
  courseId!: string

  @ApiProperty({
    description: 'Course details',
    type: Course,
  })
  @BelongsTo(() => Course, 'courseId')
  details?: Course

  @ApiProperty({
    description: 'Whether the course is required or not',
    example: Requirement.MANDATORY,
    enum: Requirement,
  })
  @Column({
    type: DataType.ENUM,
    values: Object.values(Requirement),
    allowNull: false,
  })
  requirement!: Requirement

  // @ApiProperty({
  //   type: String,
  // })
  @ApiHideProperty()
  @CreatedAt
  readonly created!: Date

  // @ApiProperty({
  //   type: String,
  // })
  @ApiHideProperty()
  @UpdatedAt
  readonly modified!: Date
}
