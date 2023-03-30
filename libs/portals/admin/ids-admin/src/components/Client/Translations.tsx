import { Box, Input, Stack, Tabs } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import React, { useEffect, useState } from 'react'
import { m } from '../../lib/messages'
import { AuthApplicationTranslation } from './Client.loader'
import ContentCard from '../../shared/components/ContentCard'
import { ClientFormTypes } from '../forms/EditApplication/EditApplication.action'

interface TranslationsProps {
  translations: AuthApplicationTranslation[]
  inSync?: boolean
}
const Translations = ({ translations, inSync = true }: TranslationsProps) => {
  const { formatMessage } = useLocale()
  const [activeTab, setActiveTab] = useState<string>('0')
  const [copyTranslations, setCopyTranslations] = useState(
    ['is', 'en'].map((locale) => ({
      locale: locale,
      value: translations.find((t) => t.locale === locale)?.value || '',
    })),
  )

  useEffect(() => {
    setCopyTranslations(
      ['is', 'en'].map((locale) => ({
        locale: locale,
        value: translations.find((t) => t.locale === locale)?.value || '',
      })),
    )
  }, [translations])

  const onChangeTranslations = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const temp = copyTranslations
    temp[+activeTab].value = event.target.value
    setCopyTranslations([...temp])
  }

  return (
    <ContentCard
      title={formatMessage(m.translations)}
      onSave={(saveOnAllEnvironments) => {
        console.log('saveOnAllEnvironments: ', saveOnAllEnvironments)
      }}
      intent={ClientFormTypes.translations}
      inSync={inSync}
    >
      <Stack space={3}>
        <Tabs
          label={formatMessage(m.translations)}
          size="md"
          selected={activeTab}
          onChange={setActiveTab}
          contentBackground="white"
          tabs={copyTranslations.map((language) => {
            return {
              label: language.locale === 'is' ? 'Íslenska' : 'English',
              content: (
                <Box marginTop="gutter">
                  <Input
                    backgroundColor="blue"
                    type="text"
                    size="sm"
                    onChange={(e) => onChangeTranslations(e)}
                    name={language.locale + '_displayName'}
                    value={language.value}
                    label={formatMessage(m.displayName)}
                  />
                </Box>
              ),
            }
          })}
        />
      </Stack>
    </ContentCard>
  )
}

export default Translations
