import { Field, ID, ObjectType } from '@nestjs/graphql'
import { CacheField } from '@island.is/nest/graphql'
import {
  getOrganizationPageUrlPrefix,
  getProjectPageUrlPrefix,
} from '@island.is/shared/utils'
import {
  ILink,
  ILinkGroup,
  ILinkGroupFields,
  IOrganizationSubpage,
  IProjectPage,
  IProjectSubpage,
} from '../generated/contentfulTypes'
import { Link, mapLink } from './link.model'

@ObjectType()
export class LinkGroup {
  @Field(() => ID)
  id!: string

  @Field()
  name!: string

  @CacheField(() => Link, { nullable: true })
  primaryLink!: Link | null

  @CacheField(() => [Link])
  childrenLinks?: Array<Link>
}

type PageAbove = IProjectPage

type LinkType = Omit<
  ILink | IOrganizationSubpage | IProjectSubpage,
  'update' | 'toPlainObject'
>

export type ILinkGroupModel = {
  fields: Omit<ILinkGroupFields, 'primaryLink' | 'childrenLinks'> & {
    /** Primary Link */
    primaryLink: LinkType

    /** Children Links */
    childrenLinks?: LinkType[] | undefined
  }
  sys: ILinkGroup['sys']
  pageAbove?: PageAbove
}

export const mapLinkGroup = ({
  fields,
  sys,
  pageAbove,
}: ILinkGroupModel): LinkGroup => ({
  id: sys.id,
  name: fields.name ?? '',
  primaryLink: mapLinkWrapper(fields.primaryLink, pageAbove),
  childrenLinks: (fields.childrenLinks ?? []).map((link) =>
    mapLinkWrapper(link, pageAbove),
  ),
})

const mapLinkWrapper = (link: LinkType, pageAbove: PageAbove | undefined) => {
  if (link.sys?.contentType?.sys?.id === 'organizationSubpage') {
    return generateOrganizationSubpageLink(link as IOrganizationSubpage)
  } else if (link.sys.contentType.sys.id === 'projectSubpage') {
    return generateProjectSubpageLink(link as IProjectSubpage, pageAbove)
  } else {
    return mapLink(link as ILink)
  }
}

const generateOrganizationSubpageLink = (subpage: IOrganizationSubpage) => {
  const prefix = getOrganizationPageUrlPrefix(subpage.sys.locale)

  return mapLink({
    ...subpage,
    sys: {
      ...subpage.sys,
      contentType: {
        sys: {
          ...subpage.sys.contentType.sys,
          id: 'link',
        },
      },
    },
    fields: {
      text: subpage.fields.title,
      url: `/${prefix}/${subpage.fields.organizationPage.fields.slug}/${subpage.fields.slug}`,
    },
  })
}

const generateProjectSubpageLink = (
  subpage: IProjectSubpage,
  pageAbove?: PageAbove,
) => {
  const prefix = getProjectPageUrlPrefix(subpage.sys.locale)

  return mapLink({
    ...subpage,
    sys: {
      ...subpage.sys,
      contentType: {
        sys: {
          ...subpage.sys.contentType.sys,
          id: 'link',
        },
      },
    },
    fields: {
      text: subpage.fields.title,
      url: `/${prefix}/${pageAbove?.fields.slug}/${subpage.fields.slug}`,
    },
  })
}
