import { ChangeEvent, useEffect, useState } from 'react'

import { Input, Stack, Text } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import {
  ClientFormTypes,
  EditApplicationResult,
  schema,
} from '../forms/EditApplication/EditApplication.action'
import { useActionData } from 'react-router-dom'
import { m } from '../../lib/messages'
import { useErrorFormatMessage } from '../../shared/hooks/useFormatErrorMessage'
import ContentCard from '../../shared/components/ContentCard'

interface ClientsUrlProps {
  redirectUris: string[]
  postLogoutRedirectUris: string[]
  inSync?: boolean
}
const ClientsUrl = ({
  redirectUris,
  postLogoutRedirectUris,
  inSync = true,
}: ClientsUrlProps) => {
  const actionData = useActionData() as EditApplicationResult<
    typeof schema.applicationUrl
  >
  const { formatMessage } = useLocale()
  const [uris, setUris] = useState({
    redirectUris,
    postLogoutRedirectUris,
  })
  const { formatErrorMessage } = useErrorFormatMessage()

  useEffect(() => {
    setUris({ redirectUris, postLogoutRedirectUris })
  }, [redirectUris, postLogoutRedirectUris])

  // Generic onChange handler, name in input will need to match object name to change
  const onChangeURLS = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setUris((prev) => ({
      ...prev,
      [event.target.name]: event.target.value.split(', '),
    }))
  }

  useEffect(() => {
    setUris({ redirectUris, postLogoutRedirectUris })
  }, [redirectUris, postLogoutRedirectUris])

  return (
    <ContentCard
      title={formatMessage(m.clientUris)}
      onSave={() => {
        return
      }}
      intent={ClientFormTypes.applicationUrls}
      inSync={inSync}
    >
      <Stack space={3}>
        <Stack space={1}>
          <Input
            name="redirectUris"
            type="text"
            size="sm"
            label={formatMessage(m.callbackUrl)}
            textarea
            rows={4}
            onChange={onChangeURLS}
            backgroundColor="blue"
            value={uris.redirectUris.join(', ')}
            placeholder={formatMessage(m.callBackUrlPlaceholder)}
            errorMessage={formatErrorMessage(
              (actionData?.errors?.redirectUris as unknown) as string,
            )}
          />
          <Text variant="small">{formatMessage(m.callBackUrlDescription)}</Text>
        </Stack>
        <Stack space={1}>
          <Input
            name="postLogoutRedirectUris"
            type="text"
            size="sm"
            label={formatMessage(m.logoutUrl)}
            textarea
            rows={4}
            onChange={onChangeURLS}
            backgroundColor="blue"
            value={uris.postLogoutRedirectUris.join(', ')}
            placeholder={formatMessage(m.logoutUrlPlaceholder)}
            errorMessage={formatErrorMessage(
              (actionData?.errors?.postLogoutRedirectUris as unknown) as string,
            )}
          />
          <Text variant="small">{formatMessage(m.logoutUrlDescription)}</Text>
        </Stack>
      </Stack>
    </ContentCard>
  )
}

export default ClientsUrl
