import { Inject, Injectable } from '@nestjs/common'
import { ApolloError } from 'apollo-server-express'
import { FetchError } from '@island.is/clients/middlewares'
import {
  FlightLeg,
  UsersApi,
  AdminApi,
} from '@island.is/clients/air-discount-scheme'
import { AuthMiddleware } from '@island.is/auth-nest-tools'
import type { Auth, User } from '@island.is/auth-nest-tools'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import {
  Discount as TDiscount,
  User as TUser,
} from '@island.is/air-discount-scheme/types'
import { Discount as DiscountModel } from '../models/discount.model'

@Injectable()
export class DiscountService {
  constructor(
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
    private usersApi: UsersApi,
    private adminApi: AdminApi,
  ) {}

  handleError(error: any): any {
    this.logger.error(error)

    throw new ApolloError(
      'Failed to resolve request',
      error?.message ?? error?.response?.message,
    )
  }

  discountIsValid(discount: TDiscount): boolean {
    const TWO_HOURS = 7200
    if (discount.expiresIn <= TWO_HOURS) {
      return false
    }

    const { credit } = discount.user.fund
    return credit >= 1
  }

  private handleJSONError(e: FetchError) {
    // Couldn't generate client for Discount | null
    if (e.message.includes('invalid json')) {
      return null
    }
    this.handle4xx(e)
  }

  private handle4xx(error: FetchError) {
    if (error.status === 403 || error.status === 404) {
      return null
    }
    this.handleError(error)
  }

  private getADSWithAuth(auth: Auth) {
    return this.usersApi.withMiddleware(
      new AuthMiddleware(auth, { forwardUserInfo: true }),
    )
  }

  private getAdminADSWithAuth(auth: Auth) {
    return this.adminApi.withMiddleware(
      new AuthMiddleware(auth, { forwardUserInfo: true }),
    )
  }

  async getCurrentDiscounts(auth: User): Promise<DiscountModel[]> {
    const relations: TUser[] = await this.getUserRelations(auth)

    const discounts: DiscountModel[] = []
    for (const relation of relations) {
      const discount: TDiscount | null = await this.getDiscount(
        auth,
        relation.nationalId,
      )

      if (discount && this.discountIsValid(discount)) {
        discounts.push({
          ...discount,
          user: {
            ...relation,
            name: relation.firstName,
            fund: discount.user.fund,
          },
        })
        continue
      }

      const createdDiscount = await this.createDiscount(
        auth,
        relation.nationalId,
      )

      if (createdDiscount) {
        discounts.push({
          ...createdDiscount,
          user: { ...relation, name: relation.firstName },
        })
      }
    }

    return discounts
  }

  async getFlightLegsByUser(auth: User): Promise<FlightLeg[]> {
    const getFlightsResponse = await this.getAdminADSWithAuth(auth)
      .privateFlightControllerGetUserFlights({ nationalId: auth.nationalId })
      .catch((e) => {
        this.handle4xx(e)
      })

    if (!getFlightsResponse) {
      return []
    }
    const flightLegs: FlightLeg[] = []

    getFlightsResponse.forEach((flight) => {
      if (flight?.flightLegs) {
        flightLegs.push(...flight.flightLegs)
      }
    })

    return flightLegs
  }

  private async getDiscount(
    auth: User,
    nationalId: string,
  ): Promise<TDiscount | null> {
    const discountResponse = await this.getADSWithAuth(auth)
      .privateDiscountControllerGetCurrentDiscountByNationalId({
        nationalId,
      })
      .catch((e) => {
        this.handleJSONError(e)
        return null
      })

    return discountResponse
  }

  private async createDiscount(
    auth: User,
    nationalId: string,
  ): Promise<TDiscount | null> {
    const createDiscountResponse = await this.getADSWithAuth(auth)
      .privateDiscountControllerCreateDiscountCode({
        nationalId,
      })
      .catch((e) => {
        this.handle4xx(e)
        return null
      })
    return createDiscountResponse
  }

  private async getUserRelations(auth: User): Promise<TUser[]> {
    const getRelationsResponse = await this.getADSWithAuth(auth)
      .privateUserControllerGetUserRelations({ nationalId: auth.nationalId })
      .catch((e) => {
        this.handle4xx(e)
      })

    if (!getRelationsResponse) {
      return []
    }

    return getRelationsResponse
  }
}
