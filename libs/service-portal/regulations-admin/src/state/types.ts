import {
  DraftingStatus,
  DraftRegulationCancel,
  DraftRegulationChange,
  RegulationDraft,
  RegulationDraftId,
} from '@island.is/regulations/admin'
import {
  HTMLText,
  LawChapterSlug,
  MinistrySlug,
  PlainText,
  URLString,
} from '@island.is/regulations'
import { Kennitala, RegulationType } from '@island.is/regulations'
import { Step } from '../types'
import { RegulationMinistry } from '@island.is/regulations/web'
import { MessageDescriptor } from 'react-intl'

export type DraftIdFromParam = 'new' | RegulationDraftId

export type StepNav = {
  name: Step
  prev?: Step
  next?: Step
}

export type DraftField<Type> = {
  value: Type
  required?: boolean
  dirty?: boolean
  guessed?: boolean
  error?: MessageDescriptor
}

// TODO: Figure out how the Editor components lazy valueRef.current() getter fits into this
export type HtmlDraftField = DraftField<HTMLText>

export type AppendixDraftForm = {
  title: DraftField<PlainText>
  text: HtmlDraftField
  key: string
}

export type BodyDraftFields = {
  title: DraftField<PlainText>
  text: HtmlDraftField
  appendixes: Array<AppendixDraftForm>
  comments: HtmlDraftField
}

export type ChangeDraftFields = Readonly<
  // always prefilled on "create" - non-editable
  Pick<DraftRegulationChange, 'id' | 'type' | 'name'>
> & { date: DraftField<Date> } & BodyDraftFields

export type CancelDraftFields = Readonly<
  // always prefilled on "create" - non-editable
  Pick<DraftRegulationCancel, 'id' | 'type' | 'name'>
> & { date: DraftField<Date> }

export type RegDraftForm = BodyDraftFields & {
  idealPublishDate: DraftField<Date | undefined>
  signatureDate: DraftField<Date | undefined>
  effectiveDate: DraftField<Date | undefined>
  lawChapters: DraftField<Array<LawChapterSlug>>
  ministry: DraftField<MinistrySlug | undefined>
  type: DraftField<RegulationType | undefined>

  signatureText: HtmlDraftField
  signedDocumentUrl: DraftField<URLString | undefined>

  impacts: Array<ChangeDraftFields | CancelDraftFields>

  readonly draftingStatus: DraftingStatus // non-editable except via saveStatus or propose actions
  draftingNotes: HtmlDraftField
  authors: DraftField<Array<Kennitala>>

  id: RegulationDraft['id']
  fastTrack: DraftField<boolean>
}

export type DraftingState = {
  isEditor: boolean
  stepName: Step
  savingStatus?: boolean
  loading?: boolean
  error?: Error
  draft?: RegDraftForm
  ministries: Array<RegulationMinistry>
}

// -----------------------------

export type AppendixFieldNameValuePair = {
  [Key in AppendixFormSimpleProps]: {
    name: Key
    value: AppendixDraftForm[Key]['value']
  }
}[AppendixFormSimpleProps]

export type AppendixFormSimpleProps = Extract<
  keyof AppendixDraftForm,
  'title' | 'text'
>

export type FieldNameValuePair = {
  [Key in RegDraftFormSimpleProps]: {
    name: Key
    value: RegDraftForm[Key]['value']
  }
}[RegDraftFormSimpleProps]

export type RegDraftFormSimpleProps = Extract<
  keyof RegDraftForm,
  | 'title'
  | 'text'
  | 'idealPublishDate' // This prop needs its own action that checks for working days and updates the `fastTrack` flag accordingly
  | 'fastTrack'
  | 'effectiveDate' // Need to be checked and must never be **before** `idealPublishDate`
  | 'signatureDate' // Need to be checked and must never be **after* `idealPublishDate`
  | 'signatureText'
  | 'signedDocumentUrl'
  // | 'lawChapters'
  | 'ministry'
  | 'type'
  | 'draftingNotes'
  | 'authors'
>

export type Action =
  | {
      type: 'CHANGE_STEP'
      stepName: Step
    }
  | {
      type: 'LOADING_DRAFT'
    }
  | {
      type: 'LOADING_DRAFT_ERROR'
      error: Error
    }
  | {
      type: 'LOADING_DRAFT_SUCCESS'
      draft: RegulationDraft
    }
  | {
      type: 'MINISTRIES_LOADED'
      ministries: Array<RegulationMinistry>
    }
  | {
      type: 'SAVING_STATUS'
    }
  | {
      type: 'SAVING_STATUS_DONE'
      error?: Error
    }
  | {
      type: 'UPDATE_LAWCHAPTER_PROP'
      action?: 'add' | 'delete'
      value: LawChapterSlug
    }
  | {
      type: 'UPDATE_MULTIPLE_PROPS'
      multiData: Partial<RegDraftForm>
    }
  | ({
      type: 'UPDATE_PROP'
    } & FieldNameValuePair)
  | {
      type: 'APPENDIX_ADD'
    }
  | ({
      type: 'APPENDIX_SET_PROP'
      idx: number
    } & AppendixFieldNameValuePair)
  | {
      type: 'APPENDIX_MOVE_UP'
      idx: number
    }
  | {
      type: 'APPENDIX_REMOVE'
      idx: number
    }
  | {
      type: 'SHIP'
    }

export type ActionName = Action['type']

export type UpdateAction = Extract<Action, { type: 'UPDATE_PROP' }>
