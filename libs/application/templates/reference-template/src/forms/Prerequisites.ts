import get from 'lodash/get'
import {
  Application,
  buildForm,
  buildDescriptionField,
  buildMultiField,
  buildSection,
  buildSubmitField,
  Form,
  FormModes,
  buildExternalDataProvider,
  buildDataProviderItem,
  SharedDataProviders,
} from '@island.is/application/core'
import { m } from '../lib/messages'
import { ReferenceApplicationDataProviders } from '../shared'

export const Prerequisites: Form = buildForm({
  id: 'PrerequisitesDraft',
  title: 'Skilyrði',
  mode: FormModes.APPLYING,
  children: [
    buildSection({
      id: 'conditions',
      title: m.conditionsSection,
      children: [
        buildExternalDataProvider({
          id: 'approveExternalData',
          title: 'Utanaðkomandi gögn',
          dataProviders: [
            buildDataProviderItem({
              id: 'anotherReference',
              type: SharedDataProviders.userProfileProvider.dataProviderType,
              title: 'getAnotherReferenceData',
              subTitle: 'Another Refernence Data',
            }),
            buildDataProviderItem({
              id: 'nationalRegistryFamily',
              type:
                SharedDataProviders.familyRelationsProvider.dataProviderType,
              title: 'Upplýsingar um fjölskyldumeðlimi',
              subTitle: 'Upplýsingar um fjölskyldumeðlimi upp úr Þjóðskrá.',
            }),
            buildDataProviderItem({
              id: 'reference',
              type:
                ReferenceApplicationDataProviders.referenceProvider
                  .dataProviderType,
              title: 'getReferenceData',
              subTitle: 'Reference data',
            }),
            buildDataProviderItem({
              id: 'nationalRegistry',
              type:
                SharedDataProviders.nationalRegistryProvider.dataProviderType,
              title: 'Þjóðskrá',
              subTitle: 'Upplýsingar um þig í Þjóðskrá.',
            }),
          ],
        }),
        buildMultiField({
          id: 'externalDataSuccess',
          title: 'Tókst að sækja gögn',
          children: [
            buildDescriptionField({
              id: 'externalDataSuccessDescription',
              title: '',
              description: (application: Application) =>
                `Gildið frá data provider: ${get(
                  application.externalData,
                  'reference.data.referenceData.numbers',
                  'fannst ekki',
                )}`,
            }),
            buildSubmitField({
              id: 'toDraft',
              placement: 'footer',
              title: 'Hefja umsókn',
              refetchApplicationAfterSubmit: true,
              actions: [
                {
                  event: 'SUBMIT',
                  name: 'Hefja umsókn',
                  type: 'primary',
                },
              ],
            }),
          ],
        }),
        buildDescriptionField({
          id: 'neverDisplayed',
          title: '',
          description: '',
        }),
      ],
    }),
    buildSection({
      id: 'intro',
      title: m.introSection,
      children: [],
    }),
    buildSection({
      id: 'career',
      title: m.career,
      children: [],
    }),
    buildSection({
      id: 'confirmation',
      title: 'Staðfesta',
      children: [],
    }),
  ],
})
