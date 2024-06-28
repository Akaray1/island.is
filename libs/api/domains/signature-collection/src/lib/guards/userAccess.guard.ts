import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BYPASS_AUTH_KEY, getRequest } from '@island.is/auth-nest-tools'
import {
  OwnerAccess,
  UserAccess,
} from '../decorators/acessRequirement.decorator'
import { SignatureCollectionService } from '../signatureCollection.service'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class UserAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly signatureCollectionService: SignatureCollectionService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bypassAuth = this.reflector.getAllAndOverride<boolean>(
      BYPASS_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    )
    const ctx = GqlExecutionContext.create(context)
    const gqlContext = ctx.getContext()

    // Access the GraphQL query and variables
    const { variables } = gqlContext.req.body
    console.log(variables)
    console.log(variables.input.type)

    // if the bypass auth exists and is truthy we bypass auth
    if (bypassAuth) {
      return true
    }
    const ownerRestriction = this.reflector.get<OwnerAccess | UserAccess>(
      'owner-access',
      context.getHandler(),
    )
    const request = getRequest(context)

    const user = request.user
    if (!user) {
      return false
    }
    const isDelegatedUser = !!user?.actor?.nationalId
    // IsOwner needs signee
    // get collectionType from request info
    const signee = await this.signatureCollectionService.signee(user)
    request.body = { ...request.body, signee }

    // IsOwner decorator not used
    if (!ownerRestriction) {
      return true
    }
    if (ownerRestriction === UserAccess.RestrictActor) {
      return isDelegatedUser ? false : true
    }

    const { candidate } = signee

    if (signee.isOwner && candidate) {
      // Check if user is an actor for owner and if so check if registered collector, if not actor will be added as collector
      if (isDelegatedUser && ownerRestriction === OwnerAccess.AllowActor) {
        const isCollector = await this.signatureCollectionService.isCollector(
          candidate.id,
          user,
        )
        return isCollector
      }
      return true
    }

    // if the user is not owner we return false
    return false
  }
}
