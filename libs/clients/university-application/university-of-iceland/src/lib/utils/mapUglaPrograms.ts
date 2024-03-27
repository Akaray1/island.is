import {
  DegreeType,
  FieldType,
  IProgram,
  ModeOfDelivery,
  Season,
  mapStringToEnum,
} from '@island.is/university-gateway'
import {
  InlineResponse2002,
  InlineResponse2002Data,
  InlineResponse2002ExtraApplicationFields,
} from '../../../gen/fetch'

export const mapUglaPrograms = (
  res: InlineResponse2002,
  logError: (programExternalId: string, error: Error) => void,
): IProgram[] => {
  const mappedRes = []
  const programList = res.data || []
  for (let i = 0; i < programList.length; i++) {
    const program = programList[i]
    try {
      mappedRes.push({
        externalId: program.externalId || '',
        nameIs: program.nameIs || '',
        nameEn: program.nameEn || '',
        departmentNameIs: program.departmentNameIs || '',
        departmentNameEn: program.departmentNameEn || '',
        startingSemesterYear: Number(program.startingSemesterYear) || 0,
        startingSemesterSeason: mapStringToEnum(
          program.startingSemesterSeason,
          Season,
        ),
        applicationStartDate: program.applicationStartDate || new Date(),
        applicationEndDate: program.applicationEndDate || new Date(),
        schoolAnswerDate: undefined, //TODO missing in api
        studentAnswerDate: undefined, //TODO missing in api
        degreeType: mapStringToEnum(program.degreeType, DegreeType),
        degreeAbbreviation: program.degreeAbbreviation || '',
        credits: program.credits || 0,
        descriptionIs: program.descriptionIs || '',
        descriptionEn: program.descriptionEn || '',
        durationInYears: program.durationInYears || 0,
        costPerYear: program.costPerYear,
        iscedCode: program.iscedCode || '',
        externalUrlIs: program.externalUrlIs,
        externalUrlEn: program.externalUrlEn,
        admissionRequirementsIs: program.admissionRequirementsIs,
        admissionRequirementsEn: program.admissionRequirementsEn,
        studyRequirementsIs: program.studyRequirementsIs,
        studyRequirementsEn: program.studyRequirementsEn,
        costInformationIs: program.costInformationIs,
        costInformationEn: program.costInformationEn,
        arrangementIs: undefined, //TODO missing in api
        arrangementEn: undefined, //TODO missing in api
        allowException: program.extraApplicationSettings?.bannaUndanthagur
          ? program.extraApplicationSettings?.bannaUndanthagur !== 't'
          : true,
        allowThirdLevelQualification: program.extraApplicationSettings
          ?.thridjaStigsnamLeyft
          ? program.extraApplicationSettings?.thridjaStigsnamLeyft === 't'
          : false,
        modeOfDelivery:
          program.modeOfDelivery?.map((m) => {
            return mapStringToEnum(m, ModeOfDelivery)
          }) || [],
        extraApplicationFields: mapExtraApplicationFields(program),
        specializations: program.kjorsvid?.map((k) => ({
          externalId: k.id?.toString() || '',
          nameIs: k.heiti || '',
          nameEn: k.heitiEn || '',
        })),
        applicationPeriodOpen: mapApplicationPeriodOpen(program),
        applicationInUniversityGateway: program.canApplyOnHaskolanam || true,
      })
    } catch (e) {
      logError(program.externalId || '', e)
    }
  }

  return mappedRes
}

const mapApplicationPeriodOpen = (program: InlineResponse2002Data): boolean => {
  if (!program.applicationStartDate || !program.applicationEndDate) return false
  return (
    new Date() > program.applicationStartDate &&
    new Date() < program.applicationEndDate
  )
}

const mapExtraApplicationFields = (
  program: InlineResponse2002Data,
): IProgram['extraApplicationFields'] => {
  let fields =
    program.extraApplicationFields?.map((field) => ({
      externalId: '', //TODO missing in api
      nameIs: field.nameIs || '',
      nameEn: field.nameEn || '',
      descriptionIs: field.descriptionIs,
      descriptionEn: field.descriptionEn,
      required: field.required || false,
      fieldType: field.fieldType as unknown as FieldType,
      uploadAcceptedFileType: field.uploadAcceptedFileType,
      options: mapOptions(program, field),
    })) || []

  if (program.mustPickExamVenue) {
    fields.push({
      externalId: '', //TODO missing in the api
      nameIs: 'Prófstaður',
      nameEn: 'Exam venue',
      required: true,
      descriptionIs: undefined,
      descriptionEn: undefined,
      fieldType: FieldType.TESTING_SITE,
      uploadAcceptedFileType: undefined,
      options: JSON.stringify(program?.simenntunarstodvar) ?? undefined,
    })
  }

  return fields
}

const mapOptions = (
  program: InlineResponse2002Data,
  field: InlineResponse2002ExtraApplicationFields,
): string | undefined => {
  const type = field.fieldType as FieldType
  // More fields can be added here
  switch (type) {
    case FieldType.TESTING_SITE:
      return JSON.stringify(program?.simenntunarstodvar) ?? undefined
    default:
      return undefined
  }
}
