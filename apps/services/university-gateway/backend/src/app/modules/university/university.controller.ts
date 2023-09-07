import { Controller, Get } from '@nestjs/common'
import { UniversityService } from './university.service'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UniversityResponse } from './model'

@ApiTags('University')
@Controller('api')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Get('universities')
  @ApiOkResponse({
    type: UniversityResponse,
    description: 'Returns all universities',
  })
  @ApiOperation({
    summary: 'Get all universities',
  })
  async getUniversities(): Promise<UniversityResponse> {
    return this.universityService.getUniversities()
  }
}
