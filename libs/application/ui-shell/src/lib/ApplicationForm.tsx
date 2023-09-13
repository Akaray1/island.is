import React, { FC, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

import { APPLICATION_APPLICATION } from '@island.is/application/graphql'
import {
  ApplicationTemplateHelper,
  coreMessages,
  getTypeFromSlug,
} from '@island.is/application/core'
import {
  Application,
  ApplicationConfigurations,
  ApplicationTypes,
  DefaultEvents,
  FieldComponents,
  FieldTypes,
  Form,
  FormItemTypes,
  FormModes,
  NO,
  Schema,
  YES,
} from '@island.is/application/types'
import {
  getApplicationTemplateByTypeId,
  getApplicationUIFields,
} from '@island.is/application/template-loader'
import { useLocale } from '@island.is/localization'
import { useFeatureFlagClient } from '@island.is/react/feature-flags'

import { RefetchProvider } from '../context/RefetchContext'
import { FieldProvider, useFields } from '../context/FieldContext'
import { LoadingShell } from '../components/LoadingShell'
import { useApplicationNamespaces } from '../hooks/useApplicationNamespaces'
import { FormShell } from './FormShell'
import { ErrorShell } from '../components/ErrorShell'
import {
  ProblemType,
  findProblemInApolloError,
} from '@island.is/shared/problem'
import { DelegationsScreen } from '../components/DelegationsScreen'
import data from './jsonStuff/data'

const ApplicationLoader: FC<
  React.PropsWithChildren<{
    applicationId: string
    nationalRegistryId: string
    slug: string
    useJSON: boolean
  }>
> = ({ applicationId, nationalRegistryId, slug, useJSON }) => {
  const type = getTypeFromSlug(slug)
  const [delegationsChecked, setDelegationsChecked] = useState(
    type ? false : true,
  )

  const { lang: locale } = useLocale()
  console.log('ApplicationLoader1', applicationId)
  applicationId = 'e3c29483-4ca9-4de7-b43b-f31534499d43'
  const { data, error, loading, refetch } = useQuery(APPLICATION_APPLICATION, {
    variables: {
      input: {
        id: applicationId,
      },
      locale,
    },
    // Setting this so that refetch causes a re-render
    // https://github.com/apollographql/react-apollo/issues/321#issuecomment-599087392
    // We want to refetch after setting the application back to 'draft', so that
    // it loads the correct form for the 'draft' state.
    notifyOnNetworkStatusChange: true,
    skip: !applicationId,
  })

  const application = data?.applicationApplication
  console.log('ApplicationLoader2', data)
  console.log('a', error)
  console.log('b', loading)
  if (loading) {
    return <LoadingShell />
  }

  const currentTypeId: ApplicationTypes = application?.typeId
  /*if (ApplicationConfigurations[currentTypeId]?.slug !== slug) {
    console.log('error maaan2')
    return <ErrorShell errorType="notExist" />
  }*/

  if (!applicationId || error) {
    const foundError = findProblemInApolloError(error, [
      ProblemType.BAD_SUBJECT,
    ])
    if (
      foundError?.type === ProblemType.BAD_SUBJECT &&
      type &&
      !delegationsChecked
    ) {
      return (
        <DelegationsScreen
          slug={slug}
          alternativeSubjects={foundError.alternativeSubjects}
          checkDelegation={setDelegationsChecked}
        />
      )
    }
    console.log('error maaan')
    return <ErrorShell />
  }

  if (useJSON) {
    return (
      <RefetchProvider
        value={() => {
          refetch()
        }}
      >
        <JShellWrapper
          application={application}
          nationalRegistryId={nationalRegistryId}
        />
      </RefetchProvider>
    )
  }

  return (
    <RefetchProvider
      value={() => {
        refetch()
      }}
    >
      <ShellWrapper
        application={application}
        nationalRegistryId={nationalRegistryId}
      />
    </RefetchProvider>
  )
}

const ShellWrapper: FC<
  React.PropsWithChildren<{
    application: Application
    nationalRegistryId: string
  }>
> = ({ application, nationalRegistryId }) => {
  const [dataSchema, setDataSchema] = useState<Schema>()
  const [form, setForm] = useState<Form>()
  const [, fieldsDispatch] = useFields()
  const { formatMessage } = useLocale()
  const featureFlagClient = useFeatureFlagClient()

  useApplicationNamespaces(application.typeId)

  useEffect(() => {
    async function populateForm() {
      if (dataSchema === undefined && form === undefined) {
        const template = await getApplicationTemplateByTypeId(
          application.typeId,
        )

        if (template !== null) {
          const helper = new ApplicationTemplateHelper(application, template)
          const stateInformation =
            helper.getApplicationStateInformation() || null

          if (stateInformation?.roles?.length) {
            const applicationFields = await getApplicationUIFields(
              application.typeId,
            )

            const role = template.mapUserToRole(nationalRegistryId, application)

            if (!role) {
              throw new Error(formatMessage(coreMessages.userRoleError))
            }

            const currentRole = stateInformation.roles.find(
              (r) => r.id === role,
            )

            if (currentRole && currentRole.formLoader) {
              const formDescriptor = await currentRole.formLoader({
                featureFlagClient,
              })
              setForm(formDescriptor)
              setDataSchema(template.dataSchema)
              fieldsDispatch(applicationFields)
            }
          }
        }
      }
    }
    populateForm()
  }, [
    fieldsDispatch,
    application,
    form,
    nationalRegistryId,
    dataSchema,
    formatMessage,
    featureFlagClient,
  ])

  if (!form || !dataSchema) {
    return <LoadingShell />
  }

  return (
    <FormShell
      application={application}
      dataSchema={dataSchema}
      form={form}
      nationalRegistryId={nationalRegistryId}
    />
  )
}

const JShellWrapper: FC<
  React.PropsWithChildren<{
    application: Application
    nationalRegistryId: string
  }>
> = ({ application, nationalRegistryId }) => {
  const [dataSchema, setDataSchema] = useState<Schema>()
  const [form, setForm] = useState<Form>()
  const [, fieldsDispatch] = useFields()
  const { formatMessage } = useLocale()
  const featureFlagClient = useFeatureFlagClient()

  useApplicationNamespaces(application.typeId)

  useEffect(() => {
    async function populateForm() {
      if (dataSchema === undefined && form === undefined) {
        //USE JSON FILE
        // We will use a shared templates for each type of application
        const template = await getApplicationTemplateByTypeId(
          application.typeId,
        )

        if (template !== null) {
          const helper = new ApplicationTemplateHelper(application, template)
          const stateInformation =
            helper.getApplicationStateInformation() || null

          if (stateInformation?.roles?.length) {
            //use json
            const applicationFields = await getApplicationUIFields(
              application.typeId,
            )

            const role = template.mapUserToRole(nationalRegistryId, application)

            if (!role) {
              throw new Error(formatMessage(coreMessages.userRoleError))
            }

            const currentRole = stateInformation.roles.find(
              (r) => r.id === role,
            )

            //dont get the form from the role but from JSON FILE?
            const formDescriptor: Form = {
              id: 'AccidentNotificationForqm',
              title: 'Halló bingo',
              mode: FormModes.DRAFT,
              type: FormItemTypes.FORM,
              renderLastScreenBackButton: true,
              renderLastScreenButton: true,
              children: [
                {
                  id: 'overview.section',
                  title: 'overview.general.sectionTitle',
                  type: FormItemTypes.SECTION,
                  children: [
                    {
                      id: 'overview.multifield',
                      title: 'overview.general.MultifiledTitle',
                      type: FormItemTypes.MULTI_FIELD,
                      children: [
                        {
                          id: 'onPayRoll.answer',
                          width: 'half',
                          title: '',
                          options: [
                            {
                              value: YES,
                              label: 'já já',
                            },
                            {
                              value: NO,
                              label: 'nei nei',
                            },
                          ],
                          type: FieldTypes.RADIO,
                          component: FieldComponents.RADIO,
                          required: true,
                          children: undefined,
                        },
                        {
                          id: 'overview.submit',
                          title: 'stuff',
                          type: FieldTypes.SUBMIT,
                          placement: 'footer',
                          children: undefined,
                          doesNotRequireAnswer: false,
                          component: FieldComponents.SUBMIT,
                          actions: [
                            {
                              event: DefaultEvents.SUBMIT,
                              name: 'SUBMIT',
                              type: 'primary',
                            },
                          ],
                          refetchApplicationAfterSubmit: false,
                        },
                      ],
                    },
                  ],
                },
              ],
            }

            const formDescriptor2: Form = data as unknown as Form

            setForm(formDescriptor2)
            setDataSchema(template.dataSchema)
            fieldsDispatch(applicationFields)
          }
        }
      }
    }
    populateForm()
  }, [
    fieldsDispatch,
    application,
    form,
    nationalRegistryId,
    dataSchema,
    formatMessage,
    featureFlagClient,
  ])

  if (!form || !dataSchema) {
    return <LoadingShell />
  }

  return (
    <FormShell
      application={application}
      dataSchema={dataSchema}
      form={form}
      nationalRegistryId={nationalRegistryId}
    />
  )
}

export const ApplicationForm: FC<
  React.PropsWithChildren<{
    applicationId: string
    nationalRegistryId: string
    slug: string
    useJSON: boolean
  }>
> = ({ applicationId, nationalRegistryId, slug, useJSON }) => {
  return (
    <FieldProvider>
      <ApplicationLoader
        applicationId={applicationId}
        nationalRegistryId={nationalRegistryId}
        slug={slug}
        useJSON={useJSON}
      />
    </FieldProvider>
  )
}
