import { buildSection, getValueViaPath } from '@island.is/application/core'
import { Application, FormValue } from '@island.is/application/types'
import { supportingDocuments } from '../../../lib/messages'
import { ChildrenPassportSubSection } from '../ChildrenSupportingDocuments/ChildrenPassportSubSection'
import { OtherDocumentsSubSection } from './OtherDocumentsSubSection'
import { getSelectedIndividualName, isIndividualSelected } from '../../../utils'
import { PassportSubSection } from './PassportSubSection'
import { Routes } from '../../../lib/constants'
import { CitizenIndividual } from '../../../shared'

export const SupportingDocumentsSection = buildSection({
  id: Routes.SUPPORTINGDOCUMENTS,
  title: (application: Application) => {
    const applicant = getValueViaPath(
      application.externalData,
      'individual.data',
      '',
    ) as CitizenIndividual | undefined

    return {
      ...supportingDocuments.general.sectionTitleWithPerson,
      values: {
        person: `${applicant?.givenName} ${applicant?.familyName}`,
      },
    }
  },
  children: [PassportSubSection, OtherDocumentsSubSection],
})
