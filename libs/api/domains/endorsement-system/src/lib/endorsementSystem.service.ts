import { Inject, Injectable } from '@nestjs/common'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { ApolloError } from 'apollo-server-express'
import {
  EndorsementApi,
  EndorsementListApi,
  EndorsementControllerCreateRequest,
  EndorsementControllerDeleteRequest,
  EndorsementListControllerCreateRequest,
  EndorsementListControllerFindOneRequest,
  EndorsementControllerBulkCreateRequest,
  EndorsementControllerFindAllRequest,
  EndorsementControllerFindByAuthRequest,
  EndorsementListControllerFindByTagsRequest,
  EndorsementListControllerFindEndorsementsRequest,
  EndorsementListControllerGetGeneralPetitionListRequest,
  EndorsementListControllerGetGeneralPetitionListsRequest,
} from '../../gen/fetch'
import { Auth, AuthMiddleware } from '@island.is/auth-nest-tools'
import type { Logger } from '@island.is/logging'

@Injectable()
export class EndorsementSystemService {
  constructor(
    private readonly endorsementApi: EndorsementApi,
    private readonly endorsementListApi: EndorsementListApi,
    @Inject(LOGGER_PROVIDER) private logger: Logger,
  ) {}

  async handleError(error: any): Promise<never> {
    this.logger.error(JSON.stringify(error))

    if (error.json) {
      const json = await error.json()
      this.logger.error(json)
      throw new ApolloError(JSON.stringify(json), error.status)
    }

    throw new ApolloError('Failed to resolve request', error.status)
  }

  endorsementApiWithAuth(auth: Auth) {
    return this.endorsementApi.withMiddleware(new AuthMiddleware(auth))
  }

  endorsementListApiWithAuth(auth: Auth) {
    return this.endorsementListApi.withMiddleware(new AuthMiddleware(auth))
  }

  // Endorsement endpoints
  async endorsementControllerFindAll(
    input: EndorsementControllerFindAllRequest,
    auth: Auth,
  ) {
    return await this.endorsementApiWithAuth(auth)
      .endorsementControllerFindAll(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementControllerFindByAuth(
    input: EndorsementControllerFindByAuthRequest,
    auth: Auth,
  ) {
    return await this.endorsementApiWithAuth(auth)
      .endorsementControllerFindByAuth(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementControllerCreate(
    input: EndorsementControllerCreateRequest,
    auth: Auth,
  ) {
    return await this.endorsementApiWithAuth(auth)
      .endorsementControllerCreate(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementControllerBulkCreate(
    input: EndorsementControllerBulkCreateRequest,
    auth: Auth,
  ) {
    return await this.endorsementApiWithAuth(auth)
      .endorsementControllerBulkCreate(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementControllerDelete(
    input: EndorsementControllerDeleteRequest,
    auth: Auth,
  ) {
    const result = await this.endorsementApiWithAuth(auth)
      .endorsementControllerDelete(input)
      .catch(this.handleError.bind(this))
    return Boolean(result)
  }

  // Auth removed - Tags
  async endorsementListControllerFindLists(
    input: EndorsementListControllerFindByTagsRequest,
  ) {
    return await this.endorsementListApi
      .endorsementListControllerFindByTags(input)
      .catch(this.handleError.bind(this))
  }

  // Auth removed - gp lists
  async endorsementListControllerGetGeneralPetitionLists(
    input: EndorsementListControllerGetGeneralPetitionListsRequest,
  ) {
    return await this.endorsementListApi
      .endorsementListControllerGetGeneralPetitionLists(input)
      .catch(this.handleError.bind(this))
  }
  // Auth removed - pg list
  async endorsementListControllerGetGeneralPetitionList(
    input: EndorsementListControllerGetGeneralPetitionListRequest,
  ) {
    return await this.endorsementListApi
      .endorsementListControllerGetGeneralPetitionList(input)
      .catch(this.handleError.bind(this))
  }
  // Auth removed - pg endorements
  async endorsementControllerGetGeneralPetitionEndorsements(
    input: EndorsementListControllerGetGeneralPetitionListRequest,
  ) {
    return await this.endorsementApi
      .endorsementControllerFind(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementListControllerFindEndorsements(
    auth: Auth,
    input: EndorsementListControllerFindEndorsementsRequest,
  ) {
    return await this.endorsementListApiWithAuth(auth)
      .endorsementListControllerFindEndorsements(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementListControllerFindEndorsementLists(
    auth: Auth,
    input: EndorsementListControllerFindEndorsementsRequest,
  ) {
    return await this.endorsementListApiWithAuth(auth)
      .endorsementListControllerFindEndorsementLists(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementListControllerFindOne(
    input: EndorsementListControllerFindOneRequest,
    auth: Auth,
  ) {
    return await this.endorsementListApiWithAuth(auth)
      .endorsementListControllerFindOne(input)
      .catch(this.handleError.bind(this))
  }

  async endorsementListControllerCreate(
    endorsementList: EndorsementListControllerCreateRequest,
    auth: Auth,
  ) {
    return await this.endorsementListApiWithAuth(auth)
      .endorsementListControllerCreate(endorsementList)
      .catch(this.handleError.bind(this))
  }
}
