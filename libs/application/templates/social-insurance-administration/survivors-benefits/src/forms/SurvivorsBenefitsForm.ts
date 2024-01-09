import {
  buildCustomField,
  buildFileUploadField,
  buildForm,
  buildMultiField,
  buildPhoneField,
  buildSection,
  buildSubSection,
  buildSubmitField,
  buildTextField,
} from '@island.is/application/core'
import { Application, DefaultEvents } from '@island.is/application/types'
import { Form, FormModes } from '@island.is/application/types'
import Logo from '../assets/Logo'
import { survivorsBenefitsFormMessage } from '../lib/messages'
import { socialInsuranceAdministrationMessage } from '@island.is/application/templates/social-insurance-administration-core/lib/messages'
import { fileUploadSharedProps } from '@island.is/application/templates/social-insurance-administration-core/lib/constants'
import { ApplicantInfo } from '@island.is/application/templates/social-insurance-administration-core/types'
import { buildFormConclusionSection } from '@island.is/application/ui-forms'
import {
  getApplicationAnswers,
  getApplicationExternalData,
} from '../lib/survivorsBenefitsUtils'

export const SurvivorsBenefitsForm: Form = buildForm({
  id: 'SurvivorsBenefitsDraft',
  title: socialInsuranceAdministrationMessage.shared.formTitle,
  logo: Logo,
  mode: FormModes.DRAFT,
  children: [
    buildSection({
      id: 'externalData',
      title: socialInsuranceAdministrationMessage.pre.externalDataSection,
      children: [],
    }),
    buildSection({
      id: 'infoSection',
      title: socialInsuranceAdministrationMessage.info.section,
      children: [
        buildSubSection({
          id: 'info',
          title: socialInsuranceAdministrationMessage.info.subSectionTitle,
          children: [
            buildMultiField({
              id: 'applicantInfo',
              title: socialInsuranceAdministrationMessage.info.subSectionTitle,
              description:
                socialInsuranceAdministrationMessage.info.subSectionDescription,
              children: [
                buildTextField({
                  id: 'applicantInfo.email',
                  title:
                    socialInsuranceAdministrationMessage.info.applicantEmail,
                  width: 'half',
                  variant: 'email',
                  disabled: true,
                  defaultValue: (application: Application) => {
                    const data = application.externalData
                      .socialInsuranceAdministrationApplicant
                      .data as ApplicantInfo
                    return data.emailAddress
                  },
                }),
                buildPhoneField({
                  id: 'applicantInfo.phonenumber',
                  title:
                    socialInsuranceAdministrationMessage.info
                      .applicantPhonenumber,
                  width: 'half',
                  defaultValue: (application: Application) => {
                    const data = application.externalData
                      .socialInsuranceAdministrationApplicant
                      .data as ApplicantInfo
                    return data.phoneNumber
                  },
                }),
              ],
            }),
          ],
        }),
        buildSubSection({
          id: 'deceasedSpouse',
          title: survivorsBenefitsFormMessage.info.deceasedSpouseSubSection,
          children: [
            buildMultiField({
              id: 'deceasedSpouseInfo',
              title: survivorsBenefitsFormMessage.info.deceasedSpouseTitle,
              description:
                survivorsBenefitsFormMessage.info.deceasedSpouseDescription,
              children: [
                buildTextField({
                  id: 'deceasedSpouseInfo.name',
                  title: survivorsBenefitsFormMessage.info.deceasedSpouseName,
                  width: 'half',
                }),
              ],
            }),
          ],
        }),
        buildSubSection({
          id: 'childrenSection',
          title: survivorsBenefitsFormMessage.info.childrenTitle,
          condition: (_, externalData) => {
            const { children } = getApplicationExternalData(externalData)
            // if no children returned, dont show the table
            if (children.length === 0) return false
            return true
          },
          children: [
            buildMultiField({
              id: 'children',
              title: survivorsBenefitsFormMessage.info.childrenTitle,
              description:
                survivorsBenefitsFormMessage.info.childrenDescription,
              children: [
                buildCustomField({
                  id: 'children.table',
                  doesNotRequireAnswer: true,
                  title: '',
                  component: 'Children',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'additionalInfo',
      title: socialInsuranceAdministrationMessage.additionalInfo.section,
      children: [
        buildSubSection({
          id: 'fileUploadAdditionalFiles',
          title:
            socialInsuranceAdministrationMessage.fileUpload.additionalFileTitle,
          children: [
            buildFileUploadField({
              id: 'fileUploadAdditionalFiles.additionalDocuments',
              title:
                socialInsuranceAdministrationMessage.fileUpload
                  .additionalFileTitle,
              description:
                survivorsBenefitsFormMessage.fileUpload
                  .additionalFileDescription,
              introduction:
                survivorsBenefitsFormMessage.fileUpload
                  .additionalFileDescription,
              ...fileUploadSharedProps,
            }),
          ],
        }),
        buildSubSection({
          id: 'commentSection',
          title:
            socialInsuranceAdministrationMessage.additionalInfo.commentSection,
          children: [
            buildTextField({
              id: 'comment',
              title:
                socialInsuranceAdministrationMessage.additionalInfo
                  .commentSection,
              variant: 'textarea',
              rows: 10,
              description:
                socialInsuranceAdministrationMessage.additionalInfo
                  .commentDescription,
              placeholder:
                socialInsuranceAdministrationMessage.additionalInfo
                  .commentPlaceholder,
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'confirm',
      title: socialInsuranceAdministrationMessage.confirm.overviewTitle,
      children: [
        buildMultiField({
          id: 'confirm',
          title: '',
          children: [
            buildCustomField(
              {
                id: 'confirmScreen',
                title: '',
                component: 'Review',
              },
              {
                editable: true,
              },
            ),
            buildSubmitField({
              id: 'submit',
              placement: 'footer',
              title: socialInsuranceAdministrationMessage.confirm.submitButton,
              actions: [
                {
                  event: DefaultEvents.ABORT,
                  name: socialInsuranceAdministrationMessage.confirm
                    .cancelButton,
                  type: 'reject',
                  condition: (answers) => {
                    const { tempAnswers } = getApplicationAnswers(answers)
                    return !!tempAnswers
                  },
                },
                {
                  event: DefaultEvents.SUBMIT,
                  name: socialInsuranceAdministrationMessage.confirm
                    .submitButton,
                  type: 'primary',
                },
              ],
            }),
          ],
        }),
      ],
    }),
    buildFormConclusionSection({
      multiFieldTitle:
        socialInsuranceAdministrationMessage.conclusionScreen.receivedTitle,
      alertTitle:
        socialInsuranceAdministrationMessage.conclusionScreen.alertTitle,
      alertMessage: survivorsBenefitsFormMessage.conclusionScreen.alertMessage,
      expandableDescription:
        survivorsBenefitsFormMessage.conclusionScreen.bulletList,
      expandableIntro:
        survivorsBenefitsFormMessage.conclusionScreen.nextStepsText,
    }),
  ],
})
