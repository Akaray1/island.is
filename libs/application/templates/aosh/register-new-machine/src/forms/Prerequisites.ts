import {
  buildDataProviderItem,
  buildExternalDataProvider,
  buildForm,
  buildSection,
  buildSubmitField,
  coreMessages,
} from '@island.is/application/core'
import { DefaultEvents, Form, FormModes } from '@island.is/application/types'
import { Logo } from '../assets/Logo'
import { conclusion, information, externalData } from '../lib/messages'
import { IdentityApi, UserProfileApi } from '../dataProviders'

export const PrerequisitesForm: Form = buildForm({
  id: 'PrerequisitesForm',
  title: '',
  logo: Logo,
  mode: FormModes.NOT_STARTED,
  renderLastScreenButton: true,
  renderLastScreenBackButton: true,
  children: [
    buildExternalDataProvider({
      title: externalData.dataProvider.pageTitle,
      id: 'approveExternalData',
      subTitle: externalData.dataProvider.subTitle,
      checkboxLabel: externalData.dataProvider.checkboxLabel,
      submitField: buildSubmitField({
        id: 'submit',
        placement: 'footer',
        title: '',
        refetchApplicationAfterSubmit: true,
        actions: [
          {
            event: DefaultEvents.SUBMIT,
            name: coreMessages.buttonNext,
            type: 'primary',
          },
        ],
      }),
      dataProviders: [
        buildDataProviderItem({
          provider: IdentityApi,
          title: externalData.nationalRegistry.title,
          subTitle: externalData.nationalRegistry.subTitle,
        }),
        buildDataProviderItem({
          provider: UserProfileApi,
          title: externalData.userProfile.title,
          subTitle: externalData.userProfile.subTitle,
        }),
      ],
    }),
    buildSection({
      id: 'informationSection',
      title: information.general.sectionTitle,
      children: [],
    }),
    buildSection({
      id: 'conclusion',
      title: conclusion.general.sectionTitle,
      children: [],
    }),
  ],
})
