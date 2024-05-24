import { Inject, Injectable } from '@nestjs/common'
import { LOGGER_PROVIDER, Logger } from '@island.is/logging'
import { ApolloError } from '@apollo/client'
import { AuthMiddleware, User } from '@island.is/auth-nest-tools'
import {
  GroupsApi,
  ApiGroupsGroupIdGetRequest,
  ApiGroupsPostRequest,
  ApiGroupsGroupIdDeleteRequest,
  ApiGroupsGroupIdPutRequest,
  GroupCreationDto,
  GroupUpdateDto,
} from '@island.is/clients/form-system'
import {
  GetGroupInput,
  CreateGroupInput,
  DeleteGroupInput,
  UpdateGroupInput,
} from '../../dto/groups.input'
import { Group } from '../../models/group.model'
import { handle4xx } from '../../utils/errorHandler'

@Injectable()
export class GroupsService {
  constructor(
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
    private formsApi: GroupsApi,
  ) {}

  // eslint-disable-next-line
  handleError(error: any, errorDetail?: string): ApolloError | null {
    const err = {
      error: JSON.stringify(error),
      category: 'groups-service',
    }
    this.logger.error(errorDetail || 'Error in groups service', err)

    throw new ApolloError(error.message)
  }

  private groupsApiWithAuth(auth: User) {
    return this.formsApi.withMiddleware(new AuthMiddleware(auth))
  }

  async getGroup(auth: User, input: GetGroupInput): Promise<Group> {
    const request: ApiGroupsGroupIdGetRequest = {
      groupId: input.id,
    }
    const response = await this.groupsApiWithAuth(auth)
      .apiGroupsGroupIdGet(request)
      .catch((e) =>
        handle4xx(e, this.handleError, 'failed to get group from Id'),
      )
    if (!response || response instanceof ApolloError) {
      return {}
    }
    return response as Group
  }

  async postGroup(auth: User, input: CreateGroupInput): Promise<Group> {
    const request: ApiGroupsPostRequest = {
      groupCreationDto: input.groupCreationDto as GroupCreationDto,
    }
    const response = await this.groupsApiWithAuth(auth)
      .apiGroupsPost(request)
      .catch((e) => handle4xx(e, this.handleError, 'failed to post group'))

    if (!response || response instanceof ApolloError) {
      return {}
    }
    return response as Group
  }

  async deleteGroup(auth: User, input: DeleteGroupInput): Promise<void> {
    const request: ApiGroupsGroupIdDeleteRequest = {
      groupId: input.groupId,
    }

    const response = await this.groupsApiWithAuth(auth)
      .apiGroupsGroupIdDelete(request)
      .catch((e) => handle4xx(e, this.handleError, 'failed to delete group'))

    if (!response || response instanceof ApolloError) {
      return void 0
    }
    return response
  }

  async updateGroup(auth: User, input: UpdateGroupInput): Promise<void> {
    const request: ApiGroupsGroupIdPutRequest = {
      groupId: input.groupId,
      groupUpdateDto: input.groupUpdateDto as GroupUpdateDto,
    }
    const response = await this.groupsApiWithAuth(auth)
      .apiGroupsGroupIdPut(request)
      .catch((e) => handle4xx(e, this.handleError, 'failed to update group'))

    if (!response || response instanceof ApolloError) {
      return void 0
    }
    return response
  }
}