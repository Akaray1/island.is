import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Screen } from '../../../types'
import {
  Card,
  CardTagsProps,
  ServiceWebWrapper,
} from '@island.is/web/components'
import {
  Box,
  Text,
  Stack,
  Breadcrumbs,
  Pagination,
  Link,
  GridContainer,
  GridColumn,
  GridRow,
  LinkContext,
  Button,
} from '@island.is/island-ui/core'
import { useNamespace } from '@island.is/web/hooks'
import {
  GET_NAMESPACE_QUERY,
  GET_SERVICE_WEB_ORGANIZATION,
  GET_SUPPORT_SEARCH_RESULTS_QUERY,
} from '../../queries'
import { CustomNextError } from '@island.is/web/units/errors'
import { withMainLayout } from '@island.is/web/layouts/main'
import {
  QuerySearchResultsArgs,
  ContentLanguage,
  QueryGetNamespaceArgs,
  GetNamespaceQuery,
  SearchableContentTypes,
  SupportQna,
  GetSupportSearchResultsQuery,
  Organization,
  QueryGetOrganizationArgs,
  Query,
} from '../../../graphql/schema'
import { useLinkResolver } from '@island.is/web/hooks'
import ContactBanner from '../ContactBanner/ContactBanner'
import {
  ServiceWebSearchInput,
  ServiceWebModifySearchTerms,
} from '@island.is/web/components'
import { getSlugPart } from '../utils'
import { plausibleCustomEvent } from '@island.is/web/hooks/usePlausible'

const PERPAGE = 10

interface ServiceSearchProps {
  q: string
  page: number
  namespace: GetNamespaceQuery['getNamespace']
  organization?: Organization
  searchResults: GetSupportSearchResultsQuery['searchResults']
}

const ServiceSearch: Screen<ServiceSearchProps> = ({
  q,
  page,
  namespace,
  organization,
  searchResults,
}) => {
  const Router = useRouter()
  const n = useNamespace(namespace)
  const { linkResolver } = useLinkResolver()

  const institutionSlug = getSlugPart(Router.asPath, 2)

  const searchResultsItems = (searchResults.items as Array<SupportQna>).map(
    (item) => ({
      title: item.title,
      parentTitle: item.organization?.title,
      description: item.organization?.description,
      link: {
        href:
          linkResolver('helpdeskcategory', [
            item.organization.slug,
            item.category.slug,
          ]).href + `?&q=${item.slug}`,
      },
      categorySlug: item.category.slug,
      category: item.category.title,
      labels: [item.category.title],
    }),
  )

  // Submit the search query to plausible
  if (q) {
    plausibleCustomEvent('Search Query', {
      query: q.toLowerCase(),
      source: 'Service Web',
    })
  }

  const totalSearchResults = searchResults.total
  const totalPages = Math.ceil(totalSearchResults / PERPAGE)

  const pageTitle = `${n('search', 'Leit')} - ${n(
    'serviceWeb',
    'Þjónustuvefur',
  )} Ísland.is`
  const headerTitle = `${n('serviceWeb', 'Þjónustuvefur')} Ísland.is`

  return (
    <ServiceWebWrapper
      pageTitle={pageTitle}
      headerTitle={headerTitle}
      institutionSlug={institutionSlug}
      organization={organization}
      smallBackground
    >
      <Box marginY={[3, 3, 10]}>
        <GridContainer>
          <GridRow marginBottom={3}>
            <GridColumn
              offset={[null, null, null, '1/12']}
              span={['12/12', '12/12', '12/12', '10/12', '7/12']}
            >
              <Stack space={[3, 3, 4]}>
                <Box display={['none', 'none', 'block']} printHidden>
                  <Breadcrumbs
                    items={[
                      {
                        title: n('serviceWeb', 'Þjónustuvefur'),
                        href: linkResolver('helpdesk').href,
                      },
                      {
                        title: n('search', 'Leit'),
                        isTag: true,
                      },
                    ]}
                    renderLink={(link, { href }) => {
                      return (
                        <NextLink href={href} passHref>
                          {link}
                        </NextLink>
                      )
                    }}
                  />
                </Box>
                <Box
                  paddingBottom={[2, 2, 4]}
                  display={['flex', 'flex', 'none']}
                  justifyContent="spaceBetween"
                  alignItems="center"
                  printHidden
                >
                  <Box flexGrow={1} marginRight={6} overflow={'hidden'}>
                    <LinkContext.Provider
                      value={{
                        linkRenderer: (href, children) => (
                          <Link href={href} pureChildren skipTab>
                            {children}
                          </Link>
                        ),
                      }}
                    >
                      <Text truncate>
                        <a href={linkResolver('helpdesk').href}>
                          <Button
                            preTextIcon="arrowBack"
                            preTextIconType="filled"
                            size="small"
                            type="button"
                            variant="text"
                          >
                            {n('serviceWeb', 'Þjónustuvefur')}
                          </Button>
                        </a>
                      </Text>
                    </LinkContext.Provider>
                  </Box>
                </Box>

                <ServiceWebSearchInput
                  colored={true}
                  size="large"
                  initialInputValue={q}
                />

                {!!q &&
                  (searchResultsItems.length === 0 ? (
                    <>
                      <Text variant="intro" as="p">
                        {n(
                          'nothingFoundWhenSearchingFor',
                          'Ekkert fannst við leit á',
                        )}{' '}
                        <strong>{q}</strong>
                      </Text>

                      <Text variant="intro" as="p">
                        {n('nothingFoundExtendedExplanation')}
                      </Text>
                    </>
                  ) : (
                    <Box marginBottom={2}>
                      <Text variant="intro" as="p">
                        {totalSearchResults}{' '}
                        {totalSearchResults === 1
                          ? n('searchResult', 'leitarniðurstaða')
                          : n('searchResults', 'leitarniðurstöður')}{' '}
                      </Text>
                    </Box>
                  ))}
              </Stack>
            </GridColumn>
          </GridRow>

          <GridRow marginBottom={9}>
            <GridColumn
              offset={[null, null, null, '1/12']}
              span={['12/12', '12/12', '12/12', '10/12', '7/12']}
            >
              <Stack space={2}>
                {searchResultsItems.map(
                  ({ labels, parentTitle, ...rest }, index) => {
                    const tags: Array<CardTagsProps> = []

                    labels.forEach((label) => {
                      tags.push({
                        title: label,
                        tagProps: {
                          outlined: true,
                        },
                      })
                    })

                    return (
                      <Card
                        key={index}
                        tags={tags}
                        subTitle={parentTitle}
                        {...rest}
                      />
                    )
                  },
                )}
              </Stack>
            </GridColumn>
          </GridRow>

          {totalSearchResults > 0 && (
            <GridRow>
              <GridColumn
                offset={[null, null, null, '1/12']}
                span={['12/12', '12/12', '12/12', '10/12', '7/12']}
              >
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  renderLink={(page, className, children) => (
                    <Link
                      href={{
                        pathname: linkResolver('helpdesksearch').href,
                        query: { ...Router.query, page },
                      }}
                    >
                      <span className={className}>{children}</span>
                    </Link>
                  )}
                />
              </GridColumn>
            </GridRow>
          )}

          <GridRow>
            <GridColumn
              offset={[null, null, null, '1/12']}
              span={['12/12', '12/12', '12/12', '10/12']}
            >
              <Box marginTop={[10, 10, 20]}>
                <ContactBanner />
              </Box>
            </GridColumn>
          </GridRow>
        </GridContainer>
      </Box>
    </ServiceWebWrapper>
  )
}

const single = <T,>(x: T | T[]): T => (Array.isArray(x) ? x[0] : x)

ServiceSearch.getInitialProps = async ({ apolloClient, locale, query }) => {
  const q = single(query.q) || ''
  const slug = query.slug ? (query.slug as string) : 'stafraent-island'
  const page = Number(single(query.page)) || 1

  const types = ['webQNA' as SearchableContentTypes]

  const queryString = ServiceWebModifySearchTerms(q)

  const [
    organization,
    {
      data: { searchResults },
    },
    namespace,
  ] = await Promise.all([
    !!slug &&
      apolloClient.query<Query, QueryGetOrganizationArgs>({
        query: GET_SERVICE_WEB_ORGANIZATION,
        variables: {
          input: {
            slug,
            lang: locale as ContentLanguage,
          },
        },
      }),
    apolloClient.query<GetSupportSearchResultsQuery, QuerySearchResultsArgs>({
      query: GET_SUPPORT_SEARCH_RESULTS_QUERY,
      variables: {
        query: {
          language: locale as ContentLanguage,
          queryString,
          types,
          size: PERPAGE,
          page,
        },
      },
    }),
    apolloClient
      .query<GetNamespaceQuery, QueryGetNamespaceArgs>({
        query: GET_NAMESPACE_QUERY,
        variables: {
          input: {
            namespace: 'Search',
            lang: locale,
          },
        },
      })
      .then((variables) => {
        // map data here to reduce data processing in component
        return JSON.parse(variables.data.getNamespace.fields)
      }),
  ])

  if (searchResults.items.length === 0 && page > 1) {
    throw new CustomNextError(404)
  }

  return {
    q,
    page,
    namespace,
    organization: organization?.data?.getOrganization,
    searchResults,
  }
}

export default withMainLayout(ServiceSearch, {
  showHeader: false,
  showFooter: false,
})
