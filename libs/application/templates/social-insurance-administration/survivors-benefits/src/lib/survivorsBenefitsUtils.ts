import { getValueViaPath } from '@island.is/application/core'
import { Application } from '@island.is/application/types'
import { AttachmentLabel } from './constants'
import {
  FileType,
  Attachments,
  AdditionalInformation,
} from '@island.is/application/templates/social-insurance-administration-core/types'
import { ChildInformation } from '../types'

enum AttachmentTypes {
  ADDITIONAL_DOCUMENTS = 'additionalDocuments',
}

export function getApplicationAnswers(answers: Application['answers']) {
  const applicantPhonenumber = getValueViaPath(
    answers,
    'applicantInfo.phonenumber',
  ) as string

  const comment = getValueViaPath(answers, 'comment') as string

  const additionalAttachments = getValueViaPath(
    answers,
    'fileUploadAdditionalFiles.additionalDocuments',
  ) as FileType[]

  const additionalAttachmentsRequired = getValueViaPath(
    answers,
    'fileUploadAdditionalFilesRequired.additionalDocumentsRequired',
  ) as FileType[]

  const tempAnswers = getValueViaPath(
    answers,
    'tempAnswers',
  ) as Application['answers']

  return {
    applicantPhonenumber,
    comment,
    additionalAttachments,
    additionalAttachmentsRequired,
    tempAnswers,
  }
}

export function getApplicationExternalData(
  externalData: Application['externalData'],
) {
  const applicantName = getValueViaPath(
    externalData,
    'nationalRegistry.data.fullName',
  ) as string

  const applicantNationalId = getValueViaPath(
    externalData,
    'nationalRegistry.data.nationalId',
  ) as string

  const email = getValueViaPath(
    externalData,
    'socialInsuranceAdministrationApplicant.data.emailAddress',
  ) as string

  const children = getValueViaPath(
    externalData,
    'socialInsuranceAdministrationChildren.data',
  ) as ChildInformation[]

  return {
    applicantName,
    applicantNationalId,
    email,
    children,
  }
}

export function getAttachments(application: Application) {
  const getAttachmentDetails = (
    attachmentsArr: FileType[] | undefined,
    attachmentType: AttachmentTypes,
  ) => {
    if (attachmentsArr && attachmentsArr.length > 0) {
      attachments.push({
        attachments: attachmentsArr,
        label: AttachmentLabel[attachmentType],
      })
    }
  }

  const { answers } = application

  const attachments: Attachments[] = []

  const additionalInfo =
    answers.fileUploadAdditionalFiles as AdditionalInformation

  const additionalDocuments = [
    ...(additionalInfo.additionalDocuments &&
    additionalInfo.additionalDocuments?.length > 0
      ? additionalInfo.additionalDocuments
      : []),
    ...(additionalInfo.additionalDocumentsRequired &&
    additionalInfo.additionalDocumentsRequired?.length > 0
      ? additionalInfo.additionalDocumentsRequired
      : []),
  ]

  if (additionalDocuments.length > 0) {
    getAttachmentDetails(
      additionalDocuments,
      AttachmentTypes.ADDITIONAL_DOCUMENTS,
    )
  }

  return attachments
}
