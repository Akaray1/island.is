import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { Op } from 'sequelize'
import { PersonalRepresentativeType } from '../entities/models/personal-representative-type.model'
import { PersonalRepresentativeTypeDTO } from '../entities/dto/personal-representative-type.dto'

@Injectable()
export class PersonalRepresentativeTypeService {
  constructor(
    @InjectModel(PersonalRepresentativeType)
    private personalRepresentativeTypeModel: typeof PersonalRepresentativeType,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
  ) {}

  /** Get's all personal repreasentative types  */
  async getAllAsync(): Promise<PersonalRepresentativeType[] | null> {
    return this.personalRepresentativeTypeModel.findAll()
  }

  /** Get's all personal repreasentative types and count */
  async getAndCountAllAsync(
    page: number,
    count: number,
  ): Promise<{
    rows: PersonalRepresentativeType[]
    count: number
  } | null> {
    page--
    const offset = page * count
    return await this.personalRepresentativeTypeModel.findAndCountAll({
      limit: count,
      offset: offset,
    })
  }

  /** Get's all personal repreasentative types and count by searchstring */
  async findAsync(
    searchString: string,
    page: number,
    count: number,
  ): Promise<{
    rows: PersonalRepresentativeType[]
    count: number
  } | null> {
    page--
    const offset = page * count
    return await this.personalRepresentativeTypeModel.findAndCountAll({
      limit: count,
      offset: offset,
      where: {
        $or: [
          {
            name: { [Op.like]: searchString },
          },
          {
            code: { [Op.like]: searchString },
          },
        ],
      },
    })
  }

  /** Get's a personal repreasentative type by code */
  async getPersonalRepresentativeTypeAsync(
    code: string,
  ): Promise<PersonalRepresentativeType | null> {
    this.logger.debug(
      `Finding personal representative type for code - "${code}"`,
    )

    if (!code) {
      throw new BadRequestException('Code must be provided')
    }

    return await this.personalRepresentativeTypeModel.findByPk(code)
  }

  /** Create a new personal repreasentative type */
  async createAsync(
    personalRepresentativeType: PersonalRepresentativeTypeDTO,
  ): Promise<PersonalRepresentativeType> {
    this.logger.debug(
      `Creating personal representative type with code - "${personalRepresentativeType.code}"`,
    )

    return this.personalRepresentativeTypeModel.create({
      ...personalRepresentativeType,
    })
  }

  /** Updates an existing personal repreasentative type */
  async updateAsync(
    code: string,
    personalRepresentativeType: PersonalRepresentativeTypeDTO,
  ): Promise<PersonalRepresentativeType | null> {
    this.logger.debug('Updating personalRepresentativeType with code ', code)

    if (!code) {
      throw new BadRequestException('code must be provided')
    }

    await this.personalRepresentativeTypeModel.update(
      { ...personalRepresentativeType },
      {
        where: { code: code },
      },
    )

    return await this.personalRepresentativeTypeModel.findByPk(
      personalRepresentativeType.code,
    )
  }

  /** Soft delete on a personal repreasentative type by code */
  async deleteAsync(code: string): Promise<number> {
    this.logger.debug(
      'Soft deleting a personal representative type with code: ',
      code,
    )

    if (!code) {
      throw new BadRequestException('Code must be provided')
    }

    const result = await this.personalRepresentativeTypeModel.update(
      { validTo: new Date() },
      {
        where: { code: code },
      },
    )

    return result[0]
  }
}
