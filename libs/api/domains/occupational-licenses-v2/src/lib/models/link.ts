import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum LinkType {
  FILE = 'file',
  LINK = 'link',
  DOCUMENT = 'document',
}

registerEnumType(LinkType, { name: 'OccupationalLicensesV2LinkType' })

@ObjectType('OccupationalLicensesV2Link')
export class Link {
  @Field(() => LinkType)
  type!: LinkType

  @Field()
  text!: string

  @Field()
  url!: string
}
