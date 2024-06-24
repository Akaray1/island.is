import { useQuery } from '@apollo/client'
import { useLocale } from '@island.is/localization'
import { friggOptionsQuery } from '../graphql/queries'
import { OptionsType } from '../lib/constants'
import { FriggOptionsQuery } from '../types/schema'

export const useFriggOptions = (type?: OptionsType) => {
  const { lang } = useLocale()
  const { data } = useQuery<FriggOptionsQuery>(friggOptionsQuery, {
    variables: {
      type: {
        type,
      },
    },
  })

  return (
    data?.friggOptions?.flatMap(({ options }) =>
      options.flatMap(({ value, key }) => {
        const content = value.find(({ language }) => language === lang)?.content
        return { value: key ?? '', label: content ?? '' }
      }),
    ) ?? []
  )
}
