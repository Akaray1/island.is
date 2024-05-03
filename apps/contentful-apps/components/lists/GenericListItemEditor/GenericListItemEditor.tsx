import { useMemo } from 'react'
import { EditorExtensionSDK } from '@contentful/app-sdk'
import { Box } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'

import { ContentfulField } from '../ContentfulField'
import { mapLocalesToFieldApis } from '../utils'

const createLocaleToFieldMapping = (sdk: EditorExtensionSDK) => {
  return {
    genericList: mapLocalesToFieldApis(
      [sdk.locales.default],
      sdk,
      'genericList',
    ),
    internalTitle: mapLocalesToFieldApis(
      [sdk.locales.default],
      sdk,
      'internalTitle',
    ),
    title: mapLocalesToFieldApis(sdk.locales.available, sdk, 'title'),
    cardIntro: mapLocalesToFieldApis(sdk.locales.available, sdk, 'cardIntro'),
  }
}

const GenericListItemEditor = () => {
  const sdk = useSDK<EditorExtensionSDK>()

  const localeToFieldMapping = useMemo(() => {
    return createLocaleToFieldMapping(sdk)
  }, [sdk])

  return (
    <Box
      paddingLeft="spacingS"
      paddingRight="spacingS"
      paddingTop="spacingL"
      paddingBottom="spacingL"
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        gap: '16px',
        margin: '0 auto',
        maxWidth: '768px',
      }}
    >
      <ContentfulField
        displayName="Generic List"
        fieldID="genericList"
        localeToFieldMapping={localeToFieldMapping}
        sdk={sdk}
        widgetId="entryCardEditor"
      />
      <ContentfulField
        displayName="Internal Title"
        fieldID="internalTitle"
        localeToFieldMapping={localeToFieldMapping}
        sdk={sdk}
      />
      <ContentfulField
        displayName="Title"
        fieldID="title"
        localeToFieldMapping={localeToFieldMapping}
        sdk={sdk}
      />
      <ContentfulField
        displayName="Card Intro"
        fieldID="cardIntro"
        localeToFieldMapping={localeToFieldMapping}
        sdk={sdk}
        widgetId="richTextEditor"
      />
    </Box>
  )
}

export default GenericListItemEditor
