import { Injectable } from '@nestjs/common'
import {
  Program,
  ProgramCourse,
  ProgramDetailsResponse,
  ProgramExtraApplicationField,
  ProgramModeOfDelivery,
  ProgramResponse,
  ProgramTag,
  Tag,
  TagResponse,
} from './model'
import { Course } from '../course/model'
import { PaginateInput } from './types'
import { InjectModel } from '@nestjs/sequelize'
import { paginate } from '@island.is/nest/pagination'
import { DegreeType, Season } from '@island.is/university-gateway-types'

@Injectable()
export class ProgramService {
  constructor(
    @InjectModel(Program)
    private programModel: typeof Program,

    @InjectModel(ProgramTag)
    // private programTagModel: typeof ProgramTag,

    @InjectModel(Tag)
    private tagModel: typeof Tag,
  ) {}

  async getPrograms(
    { after, before, limit }: PaginateInput,
    active?: boolean,
    year?: number,
    season?: Season,
    universityId?: string,
    degreeType?: DegreeType,
  ): Promise<ProgramResponse> {
    const where: {
      active?: boolean
      startingSemesterYear?: number
      startingSemesterSeason?: Season
      universityId?: string
      degreeType?: DegreeType
    } = {}
    if (active !== undefined) where.active = active
    if (year !== undefined) where.startingSemesterYear = year
    if (season !== undefined) where.startingSemesterSeason = season
    if (universityId !== undefined) where.universityId = universityId
    if (degreeType !== undefined) where.degreeType = degreeType

    return await paginate({
      Model: this.programModel,
      limit: limit,
      after: after,
      before: before,
      primaryKeyField: 'id',
      orderOption: [['created', 'ASC']],
      where: where,
      attributes: {
        exclude: [
          'externalUrlIs',
          'externalUrlEn',
          'admissionRequirementsIs',
          'admissionRequirementsEn',
          'studyRequirementsIs',
          'studyRequirementsEn',
          'costInformationIs',
          'costInformationEn',
          'courses',
          'extraApplicationField',
        ],
      },
      include: [
        {
          model: ProgramTag,
          include: [
            {
              model: Tag,
              attributes: {
                exclude: ['id', 'created', 'modified'],
              },
            },
          ],
          attributes: {
            exclude: ['id', 'programId', 'created', 'modified'],
          },
        },
        {
          model: ProgramModeOfDelivery,
          attributes: { exclude: ['id', 'programId', 'created', 'modified'] },
        },
      ],
    })
  }

  async getProgramDetails(id: string): Promise<ProgramDetailsResponse> {
    const program = await this.programModel.findOne({
      where: { id: id },
      include: [
        {
          model: ProgramCourse,
          include: [
            {
              model: Course,
              attributes: {
                exclude: ['created', 'modified'],
              },
            },
          ],
          attributes: {
            exclude: ['id', 'programId', 'courseId', 'created', 'modified'],
          },
        },
        {
          model: ProgramTag,
          include: [
            {
              model: Tag,
              attributes: {
                exclude: ['id', 'created', 'modified'],
              },
            },
          ],
          attributes: {
            exclude: ['id', 'programId', 'created', 'modified'],
          },
        },
        {
          model: ProgramModeOfDelivery,
          attributes: { exclude: ['id', 'programId', 'created', 'modified'] },
        },
        {
          model: ProgramExtraApplicationField,
          attributes: { exclude: ['id', 'programId', 'created', 'modified'] },
        },
      ],
    })

    if (!program) {
      throw Error('Not found')
    }

    return { data: program }
  }

  async getTags(): Promise<TagResponse> {
    const tags = await this.tagModel.findAll()
    return { data: tags }
  }
}
