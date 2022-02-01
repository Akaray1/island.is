import React, { FC, Fragment, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useLocale, useNamespaces } from '@island.is/localization'
import {
  DraftImpactId,
  RegulationDraft,
  RegulationDraftId,
} from '@island.is/regulations/admin'
import { isUuid } from 'uuidv4'
import { Step } from '../types'
import { User } from 'oidc-client'

import {
  RegDraftingProvider,
  ensureStepName,
  useDraftingState,
} from '../state/useDraftingState'
import {
  useLawChaptersQuery,
  useMinistriesQuery,
  useRegulationDraftQuery,
} from '../utils/dataHooks'
import { ServicePortalModuleComponent } from '@island.is/service-portal/core'
import { MessageDescriptor } from '@formatjs/intl'
import { editorMsgs } from '../messages'
import { EditBasics } from '../components/EditBasics'
import { EditMeta } from '../components/EditMeta'
import { EditSignature } from '../components/EditSignature'
import { EditImpacts } from '../components/EditImpacts'
import { EditReview } from '../components/EditReview'
import { Box, SkeletonLoader, Text, toast } from '@island.is/island-ui/core'
import { SaveDeleteButtons } from '../components/SaveDeleteButtons'
import { DraftingNotes } from '../components/DraftingNotes'
import { ButtonBar } from '../components/ButtonBar'
import { DownloadDraftButton } from '../components/DownloadDraftButton'

// ---------------------------------------------------------------------------

const assertStep = (maybeStep: string | undefined): Step => {
  const stepName = ensureStepName(maybeStep || 'basics')
  if (stepName) {
    return stepName
  }
  throw new Error('Invalid RegulationDraft editing Step')
}

const assertDraftId = (maybeId: string | undefined): RegulationDraftId => {
  if (typeof maybeId === 'string' && isUuid(maybeId)) {
    return maybeId as RegulationDraftId
  }
  throw new Error('Invalid RegulationDraft editing Id')
}

const assertImpactId = (maybeId: string | undefined): DraftImpactId => {
  if (typeof maybeId === 'string' && maybeId && isUuid(maybeId)) {
    return maybeId as DraftImpactId
  }
  throw new Error('Invalid DraftImpactId')
}

// ---------------------------------------------------------------------------

const stepData: Record<
  Step,
  {
    title: MessageDescriptor
    intro?: MessageDescriptor
    Component: () => ReturnType<FC>
  }
> = {
  basics: {
    title: editorMsgs.stepContentHeadline,
    Component: EditBasics,
  },
  meta: {
    title: editorMsgs.stepMetaHeadline,
    Component: EditMeta,
  },
  signature: {
    title: editorMsgs.stepSignatureHeadline,
    intro: editorMsgs.stepSignatureIntro,
    Component: EditSignature,
  },
  impacts: {
    title: editorMsgs.stepImpactHeadline,
    intro: editorMsgs.stepImpactIntro,
    Component: EditImpacts,
  },
  review: {
    title: editorMsgs.stepReviewHeadline,
    intro: editorMsgs.stepReviewIntro,
    Component: EditReview,
  },
}

const EditScreen = ({
  userInfo,
  regulationDraft,
}: {
  userInfo: User
  regulationDraft: RegulationDraft
}) => {
  const t = useLocale().formatMessage
  const state = useDraftingState()
  const step = stepData[state.step.name]

  useEffect(() => {
    if (state.error) {
      const { message, error } = state.error
      console.error(error || message)
      toast.error(t(message))
    }
  }, [state.error, t])

  return (
    <>
      <Box marginBottom={[2, 2, 4]}>
        <Text as="h1" variant="h1">
          {t(step.title)}
        </Text>
        {step.intro && (
          <Text as="p" marginTop={1}>
            {t(step.intro)}
          </Text>
        )}
      </Box>
      <DownloadDraftButton
        userInfo={userInfo}
        regulationDraftId={regulationDraft.id}
      />
      <SaveDeleteButtons wrap />
      <step.Component />
      <DraftingNotes />
      <ButtonBar />
    </>
  )
}

// ---------------------------------------------------------------------------

const EditApp: ServicePortalModuleComponent = ({ userInfo }) => {
  useNamespaces('ap.regulations-admin')

  const params = useParams<Record<string, string | undefined>>()
  const draftId = assertDraftId(params.draftId)
  const stepName = assertStep(params.stepName)
  const impactId =
    stepName === 'impacts' && params.impact
      ? assertImpactId(params.impact)
      : undefined

  const regulationDraft = useRegulationDraftQuery(draftId)
  const ministries = useMinistriesQuery()
  const lawChapters = useLawChaptersQuery()

  if (regulationDraft.loading || ministries.loading || lawChapters.loading) {
    return <p>Loading...</p>
  }

  if (regulationDraft.error) {
    throw new Error(`Regulation ${draftId} not found`)
  }
  if (ministries.error) {
    throw ministries.error
  }
  if (lawChapters.error) {
    throw lawChapters.error
  }

  return (
    <RegDraftingProvider
      regulationDraft={regulationDraft.data}
      activeImpact={impactId}
      stepName={stepName}
      ministries={ministries.data}
      lawChapters={lawChapters.data}
    >
      <EditScreen
        key={draftId}
        userInfo={userInfo}
        regulationDraft={regulationDraft.data}
      />
    </RegDraftingProvider>
  )
}

export default EditApp
