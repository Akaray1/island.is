import { DefaultEvents } from '@island.is/application/types'

export enum ApiActions {
  submitApplication = 'submitApplication',
  createCharge = 'createCharge',
}

export const B_FULL = 'B-full'
export const B_TEMP = 'B-temp'
export const B_FULL_RENEWAL_65 = 'B-full-renewal-65'

export type DrivingLicenseApplicationFor =
  | typeof B_FULL
  | typeof B_TEMP
  | typeof B_FULL_RENEWAL_65

export type Events =
  | { type: DefaultEvents.SUBMIT }
  | { type: DefaultEvents.PAYMENT }
  | { type: DefaultEvents.APPROVE }
  | { type: DefaultEvents.REJECT }
  | { type: DefaultEvents.ABORT }

export enum Roles {
  APPLICANT = 'applicant',
}

export enum States {
  DRAFT = 'draft',
  DONE = 'done',
  PAYMENT = 'payment',
  DECLINED = 'declined',
  PREREQUISITES = 'prerequisites',
}

export const YES = 'yes'
export const NO = 'no'

type FakeCurrentLicense = 'none' | 'temp'
type YesOrNo = 'yes' | 'no'

export interface DrivingLicenseFakeData {
  useFakeData?: YesOrNo
  qualityPhoto?: YesOrNo
  currentLicense?: FakeCurrentLicense
  remarks?: YesOrNo
  howManyDaysHaveYouLivedInIceland: string | number
  age: number
}

export const UPLOAD_ACCEPT = '.pdf, .doc, .docx, .rtf, .txt, .odt'

export const FILE_SIZE_LIMIT = 10000000 // 10MB
