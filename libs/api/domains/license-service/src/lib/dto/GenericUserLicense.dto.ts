import { Field, ObjectType } from '@nestjs/graphql'
import { GenericLicense } from './GenericLicense.dto'
import { GenericLicenseFetch } from './GenericLicenseFetch.dto'
import { Payload } from './Payload.dto'

@ObjectType()
export class GenericUserLicense {
  @Field({
    description: 'National ID of license owner',
    deprecationReason: 'Moved one level up',
  })
  nationalId!: string

  @Field(() => GenericLicense, { description: 'License info' })
  license!: GenericLicense

  @Field(() => GenericLicenseFetch, { description: 'Info about license fetch' })
  fetch!: GenericLicenseFetch

  @Field(() => Payload, {
    nullable: true,
    description: 'Potential payload of license, both parsed and raw',
  })
  payload?: Payload
}
