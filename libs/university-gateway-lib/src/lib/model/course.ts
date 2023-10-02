import { Requirement, Season } from '../types'

export interface ICourse {
  externalId: string
  nameIs: string
  nameEn: string
  credits: number
  descriptionIs?: string
  descriptionEn?: string
  externalUrlIs?: string
  externalUrlEn?: string
  requirement: Requirement
  semesterYear?: number
  semesterSeason: Season
}
