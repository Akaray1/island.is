import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import {
  RegulationDraftId,
  // RegulationDraft
} from '@island.is/regulations/admin'
// import { ISODate } from '@island.is/regulations'

@ObjectType()
export class LawChapters {
  @Field()
  slug?: string

  @Field()
  name?: string
}

@ObjectType()
export class Ministry {
  @Field()
  slug?: string

  @Field()
  name?: string
}

@ObjectType()
export class Appendix {
  @Field()
  title?: string

  @Field()
  text?: string
}

@ObjectType()
export class RegulationAuthor {
  @Field()
  authorId?: string

  @Field()
  name?: string

  @Field()
  email?: string
}

@ObjectType()
export class DraftRegulationModel {
  // @Field((type) => ID)
  // id!: RegulationDraftId
  @Field()
  id!: string

  @Field({ name: 'draftingStatus', nullable: true })
  // drafting_status!: DraftingStatus
  // @Field()
  draftingStatus!: string

  @Field({ name: 'draftingNotes', nullable: true })
  // drafting_notes?: RegulationDraft['draftingNotes']
  // @Field()
  draftingNotes?: string

  // @Field(() => [RegulationAuthor])
  // authors!: RegulationAuthor[]
  @Field(() => [String])
  authors!: string[]

  @Field({ nullable: true })
  title!: string

  @Field({ nullable: true })
  text?: string

  // @Field(() => [Appendix], { nullable: true })
  // appendixes!: Appendix[]
  @Field(() => [String], { nullable: true })
  appendixes!: string[]

  @Field({ nullable: true })
  comments?: string

  // @Field(() => Ministry, { nullable: true })
  // ministry!: Ministry
  @Field(() => String, { nullable: true })
  ministry!: string // name + slug

  // @Field(() => [LawChapters], { name: 'lawChapters', nullable: true })
  // // @Field()
  // law_chapters!: LawChapters[]

  @Field(() => [String], { name: 'lawChapters', nullable: true })
  lawChapters!: string[]

  @Field(() => [String], { nullable: true })
  impacts!: string[] // ?

  @Field({ nullable: true })
  name?: string

  @Field({ name: 'idealPublishDate', nullable: true })
  // @Field()
  idealPublishDate?: string

  @Field({ nullable: true })
  ministryId?: string

  @Field({ nullable: true })
  signatureDate?: string

  @Field({ nullable: true })
  effectiveDate?: string

  @Field({ nullable: true })
  type?: string
}
