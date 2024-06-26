import { Field, InputType } from '@nestjs/graphql'
import { GenericLicenseType } from '../licenceService.type'

@InputType()
export class GetGenericLicenseInput {
  @Field(() => GenericLicenseType)
  licenseType!: GenericLicenseType

  @Field({ nullable: true })
  licenseId?: string
}
