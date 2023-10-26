import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Course, CourseDetailsResponse, CourseResponse } from './model/course'
import { PaginateInput, ProgramCourse } from '../program'
import { paginate } from '@island.is/nest/pagination'
import { Op } from 'sequelize'

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course)
    private courseModel: typeof Course,

    @InjectModel(ProgramCourse)
    private programCourseModel: typeof ProgramCourse,
  ) {}

  async getCourses(
    { after, before, limit }: PaginateInput,
    programId: string,
    universityId: string,
  ): Promise<CourseResponse> {
    const where: {
      id?: { [Op.in]: string[] }
      universityId?: string
    } = {}
    if (programId !== undefined) {
      const courseList = await this.programCourseModel.findAll({
        attributes: ['courseId'],
        where: { programId },
      })
      where.id = { [Op.in]: courseList.map((c) => c.courseId) }
    }
    if (universityId !== undefined) where.universityId = universityId

    return await paginate({
      Model: this.courseModel,
      limit: limit,
      after: after,
      before: before,
      primaryKeyField: 'id',
      orderOption: [['id', 'ASC']],
      where: where,
    })
  }

  async getCourseDetails(id: string): Promise<CourseDetailsResponse> {
    const course = await this.courseModel.findOne({ where: { id: id } })

    if (!course) {
      throw Error('Not found')
    }

    return { data: course }
  }
}
