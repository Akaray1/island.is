import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { DataStatus } from '../../user-profile/types/dataStatusTypes'

export class UserProfileDto {
  @ApiProperty()
  @IsString()
  readonly nationalId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly mobilePhoneNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly locale?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DataStatus)
  readonly mobileStatus?: DataStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DataStatus)
  readonly emailStatus?: DataStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly mobilePhoneNumberVerified?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly emailVerified?: boolean
}
