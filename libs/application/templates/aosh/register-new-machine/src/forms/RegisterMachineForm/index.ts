import { buildForm, buildSection } from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import { Logo } from '../../assets/Logo'
import { buildFormConclusionSection } from '@island.is/application/ui-forms'
import { conclusion, externalData } from '../../lib/messages'
import { InformationSection } from './InformationSection'
import { MachineSection } from './MachineSection'

export const RegisterNewMachineForm: Form = buildForm({
  id: 'RegisterNewMachineFormDraft',
  title: '',
  logo: Logo,
  mode: FormModes.DRAFT,
  renderLastScreenButton: true,
  renderLastScreenBackButton: true,
  children: [
    buildSection({
      id: 'externalData',
      title: externalData.dataProvider.sectionTitle,
      children: [],
    }),
    InformationSection,
    MachineSection,
    buildFormConclusionSection({
      sectionTitle: conclusion.general.sectionTitle,
      multiFieldTitle: conclusion.general.title,
      alertTitle: conclusion.default.accordionTitle,
      expandableHeader: conclusion.default.expandableHeader,
      expandableDescription: conclusion.default.expandableDescription,
    }),
  ],
})
