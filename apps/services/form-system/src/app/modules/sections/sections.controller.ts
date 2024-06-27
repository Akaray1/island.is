import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  NotFoundException,
  Put,
} from '@nestjs/common'
import { SectionsService } from './sections.service'
import { CreateSectionDto } from './models/dto/createSection.dto'
import { Section } from './models/section.model'
import { Documentation } from '@island.is/nest/swagger'
import { ApiTags } from '@nestjs/swagger'
import { UpdateSectionDto } from './models/dto/updateSection.dto'
import { SectionDto } from './models/dto/section.dto'
import { UpdateSectionsDisplayOrderDto } from './models/dto/updateSectionsDisplayOrder.dto'

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(@Body() createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionsService.create(createSectionDto)
  }

  @Get()
  @Documentation({
    description: 'Get all Sections',
    response: { status: 200, type: [Section] },
  })
  async findAll(): Promise<Section[]> {
    return await this.sectionsService.findAll()
  }

  @Get(':id')
  @Documentation({
    description: 'Get Section by id',
    response: { status: 200, type: Section },
  })
  async findOne(@Param('id') id: string): Promise<Section> {
    const section = await this.sectionsService.findOne(id)
    if (!section) {
      throw new NotFoundException(`Section not found`)
    }

    return section
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.sectionsService.delete(id)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ): Promise<SectionDto> {
    return await this.sectionsService.update(id, updateSectionDto)
  }

  @Put()
  @Documentation({
    description: 'Update display order of sections',
    response: { status: 204 },
  })
  async updateDisplayOrder(
    @Body() updateSectionsDisplayOrderDto: UpdateSectionsDisplayOrderDto,
  ): Promise<void> {
    return this.sectionsService.updateDisplayOrder(
      updateSectionsDisplayOrderDto,
    )
  }
}
