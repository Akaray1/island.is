/* eslint-disable @typescript-eslint/naming-convention */
import {
  RegName,
  Kennitala,
  ISODate,
  PlainText,
  HTMLText,
  URLString,
  RegulationType,
  Regulation,
  LawChapter,
  Appendix,
} from './types'

// ---------------------------------------------------------------------------

/** Regulation drafts have four lifecycle states:
 *
 * * `draft` = The regulation is still being drafted. Do NOT edit and/or publish!
 * * `proposal` = The regulation is ready for a final review/tweaking by an editor.
 * * `shipped` = The regulation has been sent to Stjórnartíðindi and is awaiting formal publication.
 * * `published` = The regulation has been accepted and published (or queued for publication at a
 *   fixed `publishedDate`) and received a `name`. It can now be `POST`ed to the
 *   "Reglugerðasafn" database — either instantly or on `publishedDate`
 */
export type DraftingStatus = 'draft' | 'proposal' | 'shipped' | 'published'

// ===========================================================================

declare const _RegulationDraftId__Brand: unique symbol
export type RegulationDraftId = string & { [_RegulationDraftId__Brand]: true }

// ===========================================================================

declare const _DraftRegulationCancelId__Brand: unique symbol
export type DraftRegulationCancelId = string & {
  [_DraftRegulationCancelId__Brand]: true
}

// ===========================================================================

declare const _DraftRegulationChangeId__Brand: unique symbol
export type DraftRegulationChangeId = string & {
  [_DraftRegulationChangeId__Brand]: true
}

// ===========================================================================

declare const _RegulationId__Brand: unique symbol
/** Id of a Regulation entry in the Reglugerðagrunnur */
export type RegulationId = number & { [_RegulationId__Brand]: true }

declare const _EmailAddress__Brand: unique symbol
/** Normal email address. Not to be confused with random un-parsed strings. */
export type EmailAddress = string & { [_EmailAddress__Brand]: true }

// ---------------------------------------------------------------------------

export type Author = {
  authorId: Kennitala
  name: string
  // email: EmailAddress
  // TODO: Add to this minimal list of fields... "org??"
}

// ---------------------------------------------------------------------------

export type DraftSummary = Pick<
  RegulationDraft,
  'id' | 'title' | 'idealPublishDate' | 'fastTrack' | 'authors'
> & {
  draftingStatus: Extract<DraftingStatus, 'draft' | 'proposal'>
}

export type ShippedSummary = Pick<
  RegulationDraft,
  'id' | 'title' | 'name' | 'idealPublishDate'
> & {
  draftingStatus: Extract<DraftingStatus, 'shipped' | 'published'>
}

// ---------------------------------------------------------------------------

export type GroupedDraftImpacts = Record<string, Array<DraftImpact>>

export type RegulationDraft = {
  /** undefined signifies a new regulation draft */
  id: RegulationDraftId
  draftingStatus: DraftingStatus
  title: PlainText
  text: Regulation['text']
  appendixes: Regulation['appendixes']
  comments: Regulation['comments']
  name?: RegName
  draftingNotes: HTMLText
  authors: ReadonlyArray<Author>
  lawChapters?: ReadonlyArray<LawChapter>
  idealPublishDate?: ISODate
  fastTrack?: boolean
  effectiveDate?: ISODate
  signatureDate?: ISODate
  signatureText: HTMLText
  signedDocumentUrl?: URLString
  type?: RegulationType
  ministry?: string
  impacts: GroupedDraftImpacts
}

// ---------------------------------------------------------------------------

export type DraftImpactName = RegName | 'self'

export type DraftRegulationCancel = {
  type: 'repeal'
  name: DraftImpactName
  regTitle: PlainText
  id: DraftRegulationCancelId
  date?: ISODate
}

// ---------------------------------------------------------------------------

export type DraftRegulationChange = {
  id: DraftRegulationChangeId
  type: 'amend'
  name: DraftImpactName
  regTitle: PlainText
  date?: ISODate
  title: PlainText
} & Pick<Regulation, 'text' | 'appendixes' | 'comments'>

// ---------------------------------------------------------------------------

export type DraftImpactId = DraftRegulationChangeId | DraftRegulationCancelId

export type DraftImpact = DraftRegulationChange | DraftRegulationCancel

// ---------------------------------------------------------------------------

export type RegulationVersion = Pick<
  Regulation,
  'title' | 'text' | 'appendixes' | 'comments' | 'effectiveDate'
> & {
  /** Name of the Regulation that prescribed this change */
  changedBy?: RegName
}

export type RegulationCancellation = {
  /** Date of cancellation */
  effectiveDate: Regulation['effectiveDate']
  /** Name of the Regulation that prescribes this cancellation */
  cancelledBy?: RegName
}

/** List of all versions of a regulation — including future versions */
export type RegulationHistory = Array<
  RegulationVersion | RegulationCancellation
>

// ---------------------------------------------------------------------------

/** Input data for regulation PDF generation */
export type RegulationPdfInput = {
  title: PlainText
  text: HTMLText
  appendixes: Array<Appendix>
  comments: HTMLText
  name?: RegName
  publishedDate?: ISODate
}

/** API response from regulation API */
export type RegulationPdfResponse = {
  /** Filename of generated PDF */
  fileName?: string

  /** The mime-type of the document in the `data` field
   *
   * Generally just `application/pdf`
   */
  mimeType?: string

  /** base64 of pdf */
  data?: string
}

/** Info about how to download a PDF regulation */
export type RegulationPdfDownload = {
  /** Does the download go through the download service? */
  downloadService?: boolean
  url?: string
}

/** PDF data of a regulation with optional filename */
export type RegulationPdfData = {
  /** Filename of generated PDF */
  fileName: string

  /** The mime-type of the document in the `data` field
   *
   * Generally just `application/pdf`
   */
  mimeType: string

  /** base64 of pdf */
  base64?: string
}

/** Container for an API request for a PDF, either data or error */
export type RegulationPdf =
  | {
      data: RegulationPdfData
      error?: never
    }
  | {
      data?: never
      error: string
    }
