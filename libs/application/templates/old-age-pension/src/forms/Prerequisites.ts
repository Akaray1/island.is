import {
  buildCustomField,
  buildDataProviderItem,
  buildDescriptionField,
  buildExternalDataProvider,
  buildForm,
  buildMultiField,
  buildRadioField,
  buildSection,
  buildSubmitField,
  buildSubSection,
} from '@island.is/application/core'
import {
  ChildrenCustodyInformationApi,
  DefaultEvents,
  Form,
  FormModes,
  NationalRegistrySpouseApi,
  NationalRegistryUserApi,
  UserProfileApi,
} from '@island.is/application/types'
import Logo from '../assets/Logo'
import { ApplicationType, NO } from '../lib/constants'
import { oldAgePensionFormMessage } from '../lib/messages'
import {
  getApplicationAnswers,
  getYesNOOptions,
} from '../lib/oldAgePensionUtils'
import {
  NationalRegistryResidenceHistoryApi,
  NationalRegistryCohabitantsApi,
} from '../dataProviders'

export const PrerequisitesForm: Form = buildForm({
  id: 'OldAgePensionPrerequisites',
  title: oldAgePensionFormMessage.shared.formTitle,
  logo: Logo,
  mode: FormModes.NOT_STARTED,
  renderLastScreenButton: true,
  renderLastScreenBackButton: true,
  children: [
    buildSection({
      id: 'prerequisites',
      title: oldAgePensionFormMessage.pre.prerequisitesSection,
      children: [
        buildSubSection({
          id: 'forInformation',
          title: oldAgePensionFormMessage.pre.forInfoSubSection,
          children: [
            buildMultiField({
              id: 'preInfo',
              title: oldAgePensionFormMessage.pre.forInfoSubSection,
              children: [
                buildDescriptionField({
                  id: 'preInfo.descriptionOne',
                  title: '',
                  description: oldAgePensionFormMessage.pre.forInfoDescription,
                }),
                // Accordion card here
                buildDescriptionField({
                  id: 'preInfo.descriptionTwo',
                  space: 4,
                  title: '',
                  description:
                    oldAgePensionFormMessage.pre.forInfoSecondDescription,
                }),
              ],
            }),
          ],
        }),
        buildSubSection({
          id: 'externalData',
          title: oldAgePensionFormMessage.pre.externalDataSubSection,
          children: [
            buildExternalDataProvider({
              id: 'approveExternalData',
              title: oldAgePensionFormMessage.pre.externalDataSubSection,
              checkboxLabel: oldAgePensionFormMessage.pre.checkboxProvider,
              dataProviders: [
                buildDataProviderItem({
                  provider: UserProfileApi,
                  title:
                    oldAgePensionFormMessage.pre.userProfileInformationTitle,
                  subTitle:
                    oldAgePensionFormMessage.pre.userProfileInformationSubTitle,
                }),
                buildDataProviderItem({
                  provider: NationalRegistryUserApi,
                  title: oldAgePensionFormMessage.pre.skraInformationTitle,
                  subTitle:
                    oldAgePensionFormMessage.pre.skraInformationSubTitle,
                }),
                buildDataProviderItem({
                  provider: NationalRegistrySpouseApi,
                  title: '',
                }),
                buildDataProviderItem({
                  provider: ChildrenCustodyInformationApi,
                  title: '',
                }),
                buildDataProviderItem({
                  provider: NationalRegistryResidenceHistoryApi,
                  title: '',
                }),
                buildDataProviderItem({
                  provider: NationalRegistryCohabitantsApi,
                  title: '',
                }),
              ],
            }),
          ],
        }),
        buildSubSection({
          id: 'applicationType',
          title: oldAgePensionFormMessage.pre.applicationTypeTitle,
          children: [
            buildRadioField({
              id: 'applicationType.option',
              title: oldAgePensionFormMessage.pre.applicationTypeTitle,
              description:
                oldAgePensionFormMessage.pre.applicationTypeDescription,
              options: [
                {
                  value: ApplicationType.OLD_AGE_PENSION,
                  label: oldAgePensionFormMessage.shared.applicationTitle,
                  subLabel:
                    oldAgePensionFormMessage.pre
                      .retirementPensionApplicationDescription,
                },
                {
                  value: ApplicationType.HALF_OLD_AGE_PENSION,
                  label:
                    oldAgePensionFormMessage.pre
                      .halfRetirementPensionApplicationTitle,
                  subLabel:
                    oldAgePensionFormMessage.pre
                      .halfRetirementPensionApplicationDescription,
                },
                {
                  value: ApplicationType.SAILOR_PENSION,
                  label: oldAgePensionFormMessage.pre.fishermenApplicationTitle,
                  subLabel:
                    oldAgePensionFormMessage.pre
                      .fishermenApplicationDescription,
                },
              ],
              required: true,
            }),
          ],
        }),
        buildSubSection({
          id: 'questions',
          title: oldAgePensionFormMessage.pre.questionTitle,
          children: [
            buildMultiField({
              id: 'questions',
              title: oldAgePensionFormMessage.pre.questionTitle,
              children: [
                buildRadioField({
                  id: 'questions.pensionFund',
                  title: oldAgePensionFormMessage.pre.pensionFundQuestionTitle,
                  description: '',
                  options: getYesNOOptions(),
                  width: 'half',
                }),
                buildCustomField(
                  {
                    id: 'question.pensionFundAlert',
                    title: oldAgePensionFormMessage.pre.pensionFundAlertTitle,
                    component: 'FieldAlertMessage',
                    description:
                      oldAgePensionFormMessage.pre.pensionFundAlertDescription,
                    doesNotRequireAnswer: true,
                    condition: (answers) => {
                      const { pensionFundQuestion } =
                        getApplicationAnswers(answers)

                      return pensionFundQuestion === NO
                    },
                  },
                  { type: 'warning' },
                ),
                buildSubmitField({
                  id: 'toDraft',
                  title: oldAgePensionFormMessage.pre.confirmationTitle,
                  refetchApplicationAfterSubmit: true,
                  actions: [
                    {
                      event: DefaultEvents.SUBMIT,
                      name: oldAgePensionFormMessage.pre.startApplication,
                      type: 'primary',
                      condition: (answers) => {
                        const { pensionFundQuestion } =
                          getApplicationAnswers(answers)

                        return pensionFundQuestion !== NO
                      },
                    },
                  ],
                }),
              ],
            }),
            // Has to be here so that the submit button appears (does not appear if no screen is left).
            // Tackle that as AS task.
            buildDescriptionField({
              id: 'unused',
              title: '',
              description: '',
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'applicant',
      title: oldAgePensionFormMessage.applicant.applicantSection,
      children: [],
    }),
    buildSection({
      id: 'relatedApplications',
      title:
        oldAgePensionFormMessage.connectedApplications
          .connectedApplicationsSection,
      children: [],
    }),
    buildSection({
      id: 'additionalInformation',
      title: oldAgePensionFormMessage.comment.additionalInfoTitle,
      children: [],
    }),
    buildSection({
      id: 'confirm',
      title: oldAgePensionFormMessage.review.confirmSectionTitle,
      children: [],
    }),
  ],
})
