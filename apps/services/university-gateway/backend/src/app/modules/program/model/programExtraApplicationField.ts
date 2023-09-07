import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger'
import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { Program } from './program'
import { FieldType } from '@island.is/university-gateway-types'

@Table({
  tableName: 'program_extra_application_field',
})
export class ProgramExtraApplicationField extends Model {
  // @ApiProperty({
  //   description: 'Program extra application field ID',
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

  @ApiProperty({
    description: 'Field name (Icelandic)',
    example: 'Ferilskrá',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nameIs!: string

  @ApiProperty({
    description: 'Field name (English)',
    example: 'CV',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nameEn?: string

  @ApiProperty({
    description: 'Field description (Icelandic)',
    example: 'Fusce sit amet pellentesque magna.',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  descriptionIs?: string

  @ApiProperty({
    description: 'Field description (English)',
    example: 'Phasellus nisi turpis, rutrum vitae congue sed.',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  descriptionEn?: string

  @ApiProperty({
    description: 'Is this field required?',
    example: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  required!: boolean

  @ApiProperty({
    description:
      'What type of field should be displayed in the application form',
    example: FieldType.UPLOAD,
    enum: FieldType,
  })
  @Column({
    type: DataType.ENUM,
    values: Object.values(FieldType),
    allowNull: false,
  })
  fieldType!: FieldType

  @ApiProperty({
    description:
      'If field type is UPLOAD, then this field is required and should list up all file types that should be accepted',
    example: '.pdf, .jpg, .jpeg, .png',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  uploadAcceptedFileType?: string

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
