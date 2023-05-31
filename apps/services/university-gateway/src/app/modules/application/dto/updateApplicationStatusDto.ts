import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { ApplicationStatus } from '../types'

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @ApiProperty({
    description: 'Column description for status',
    example: ApplicationStatus.IN_REVIEW,
    enum: ApplicationStatus,
  })
  status!: ApplicationStatus
}
