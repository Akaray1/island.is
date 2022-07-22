import React from 'react'
import { FeaturedArticles } from '@island.is/web/graphql/schema'
import {
  Box,
  Button,
  FocusableBox,
  Link,
  Stack,
  Text,
  TopicCard,
} from '@island.is/island-ui/core'
import { LinkType, useLinkResolver } from '@island.is/web/hooks/useLinkResolver'
import { useNamespace } from '@island.is/web/hooks'
import { Namespace } from '@island.is/api/schema'
import { useWindowSize } from 'react-use'
import { theme } from '@island.is/island-ui/theme'

interface SliceProps {
  slice: FeaturedArticles
  namespace?: Namespace
}

export const FeaturedArticlesSlice: React.FC<SliceProps> = ({
  slice,
  namespace,
}) => {
  const n = useNamespace(namespace)
  const { linkResolver } = useLinkResolver()
  const { width } = useWindowSize()
  const isMobile = width < theme.breakpoints.md
  const labelId = 'sliceTitle-' + slice.id

  return (
    !!slice.articles.length && (
      <section key={slice.id} aria-labelledby={labelId}>
        <Box
          borderTopWidth="standard"
          borderColor="standard"
          paddingTop={[8, 6, 8]}
          paddingBottom={[8, 6, 6]}
        >
          <Text as="h2" variant="h3" paddingBottom={6} id={labelId}>
            {slice.title}
          </Text>
          <Stack space={2}>
            {slice.articles.map(
              ({ title, slug, processEntry, processEntryButtonText }) => {
                const url = linkResolver('Article' as LinkType, [slug])
                return (
                  <FocusableBox
                    key={slug}
                    borderRadius="large"
                    href={url.href}
                    target={isMobile ? '' : '_blank'}
                  >
                    <TopicCard
                      tag={
                        (!!processEntry || processEntryButtonText) &&
                        n(processEntryButtonText || 'application', 'Umsókn')
                      }
                    >
                      {title}
                    </TopicCard>
                  </FocusableBox>
                )
              },
            )}
          </Stack>
          {!!slice.link && (
            <Box display="flex" justifyContent="flexEnd" paddingTop={6}>
              <Link href={slice.link.url}>
                <Button
                  icon="arrowForward"
                  iconType="filled"
                  type="button"
                  variant="text"
                  as="span"
                >
                  {n('seeAllServices', 'Sjá allt efni')}
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </section>
    )
  )
}
