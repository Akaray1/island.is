import {
  buildExternalDataProvider,
  buildDataProviderItem,
  buildSubSection,
} from '@island.is/application/core'
import { m } from '../../lib/messages'

import {
  NationalRegistryUserApi,
  TeachersApi,
  UserProfileApi,
  CurrentLicenseApi,
  DrivingAssessmentApi,
  JurisdictionApi,
  QualityPhotoApi,
  ExistingApplicationApi,
} from '@island.is/application/types'
import { SyslumadurPaymentCatalogApi, GlassesCheckApi } from '../../dataProviders'
import build from 'next/dist/build'
export const sectionExternalData = buildSubSection({
  id: 'externalData',
  title: m.externalDataSection,
  children: [
    buildExternalDataProvider({
      title: m.externalDataTitle,
      id: 'approveExternalData',
      subTitle: m.externalDataSubTitle,
      checkboxLabel: m.externalDataAgreement,
      dataProviders: [
        buildDataProviderItem({
          provider: NationalRegistryUserApi,
          title: m.nationalRegistryTitle,
          subTitle: m.nationalRegistrySubTitle,
        }),
        buildDataProviderItem({
          provider: UserProfileApi,
          title: m.userProfileInformationTitle,
          subTitle: m.userProfileInformationSubTitle,
        }),
        buildDataProviderItem({
          provider: CurrentLicenseApi,
          title: m.infoFromLicenseRegistry,
          subTitle: m.confirmationStatusOfEligability,
        }),
        buildDataProviderItem({
          provider: GlassesCheckApi,
          title: 'Gleraugnavottorð',
          subTitle: 'Til þess að auðvelda umsóknarferlið er sótt gleraugnavottorð frá samgöngustofu',
        }),
        buildDataProviderItem({
          provider: QualityPhotoApi,
          title: '',
          subTitle: '',
        }),
        buildDataProviderItem({
          provider: DrivingAssessmentApi,
          title: '',
        }),
        buildDataProviderItem({
          provider: JurisdictionApi,
          title: '',
        }),
        buildDataProviderItem({
          provider: SyslumadurPaymentCatalogApi,
          title: '',
        }),
        buildDataProviderItem({
          provider: TeachersApi,
          title: '',
        }),
        buildDataProviderItem({
          provider: ExistingApplicationApi,
          title: '',
        }),
      ],
    }),
  ],
})
