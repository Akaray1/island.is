import { Controller, Post } from '@nestjs/common'
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InternalCourseService } from './internalCourse.service'

@ApiTags('Internal course')
@Controller('api/internal')
export class InternalCourseController {
  constructor(private readonly internalCourseService: InternalCourseService) {}

  @Post('courses/update')
  @ApiNoContentResponse()
  @ApiOperation({
    summary:
      'Updates courses (in program) in our DB by fetching data from the university APIs',
  })
  async updatePrograms(): Promise<void> {
    console.log('--------HER updateCourses')
    // await this.internalCourseService.updateCourses()
  }
}
