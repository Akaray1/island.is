import { Inject, Injectable } from '@nestjs/common'
import { TemplateApiModuleActionProps } from '../../../types'
import { BaseTemplateApiService } from '../../base-template-api.service'
import { ApplicationTypes } from '@island.is/application/types'
import { EnergyFundsAnswers } from '@island.is/application/templates/energy-funds'
import { VehicleMiniDto, VehicleSearchApi } from '@island.is/clients/vehicles'
import { TemplateApiError } from '@island.is/nest/problem'
import { LOGGER_PROVIDER } from '@island.is/logging'
import type { Logger } from '@island.is/logging'
import { Auth, AuthMiddleware, User } from '@island.is/auth-nest-tools'
import { coreErrorMessages } from '@island.is/application/core'
import { EnergyFundsClientService } from '@island.is/clients/energy-funds'
import format from 'date-fns/format'
import { VehiclesCurrentVehicle } from './types'

@Injectable()
export class EnergyFundsService extends BaseTemplateApiService {
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly energyFundsClientService: EnergyFundsClientService,
    private readonly vehiclesApi: VehicleSearchApi,
  ) {
    super(ApplicationTypes.ENERGY_FUNDS)
  }

  private vehiclesApiWithAuth(auth: Auth) {
    return this.vehiclesApi.withMiddleware(new AuthMiddleware(auth))
  }

  async getCurrentVehiclesWithDetails({ auth }: TemplateApiModuleActionProps) {
    const results = await this.vehiclesApiWithAuth(auth).currentVehiclesGet({
      persidNo: auth.nationalId,
      showOwned: true,
      showCoowned: false,
      showOperated: false,
    })

    let onlyElectricVehicles: Array<VehiclesCurrentVehicle> = []
    onlyElectricVehicles = results.filter(
      (x) => x.fuelCode && parseInt(x.fuelCode) === 3,
    )

    let onlyElectricVehiclesWithGrant = onlyElectricVehicles

    if (onlyElectricVehicles.length < 6) {
      onlyElectricVehicles = await Promise.all(
        onlyElectricVehicles.map(async (vehicle: VehicleMiniDto) => {
          const vehicleGrant =
            await this.energyFundsClientService.getCatalogValueForVehicle(
              auth,
              vehicle,
            )
          return {
            ...vehicle,
            vehicleGrant: vehicleGrant[0]?.priceAmount,
            vehicleGrantItemCode: vehicleGrant[0]?.itemCode,
          }
        }),
      )
      onlyElectricVehiclesWithGrant = onlyElectricVehicles.filter(
        (x) => x.vehicleGrant !== undefined,
      )
    }

    // Validate that user has at least 1 vehicle that fulfills requirements
    if (
      !onlyElectricVehicles ||
      !onlyElectricVehicles.length ||
      onlyElectricVehicles.filter((x) => x.vehicleGrant !== undefined)
        .length === 0
    ) {
      throw new TemplateApiError(
        {
          title: coreErrorMessages.electricVehicleListEmptyOwner,
          summary: coreErrorMessages.electricVehicleListEmptyOwner,
        },
        400,
      )
    }

    return await Promise.all(
      onlyElectricVehicles?.map(async (vehicle) => {
        let vehicleGrantPriceAmount: number | undefined
        let vehicleGrantItemCode: string | undefined
        let hasReceivedSubsidy: boolean | undefined

        // Only validate if fewer than 6 items
        if (onlyElectricVehiclesWithGrant.length < 6) {
          // Get subsidy status
          hasReceivedSubsidy =
            await this.energyFundsClientService.checkVehicleSubsidyAvilability(
              auth,
              vehicle.vin || '',
            )
        }

        return {
          permno: vehicle.permno,
          vin: vehicle.vin,
          make: vehicle.make,
          color: vehicle.color,
          role: vehicle.role,
          firstRegistrationDate: vehicle.firstRegistrationDate,
          newRegistrationDate: vehicle.newRegistrationDate,
          fuelCode: vehicle.fuelCode,
          vehicleRegistrationCode: vehicle.vehicleRegistrationCode,
          importCode: vehicle.importCode,
          vehicleGrant: vehicleGrantPriceAmount,
          vehicleGrantItemCode: vehicleGrantItemCode,
          hasReceivedSubsidy: hasReceivedSubsidy,
        }
      }),
    )
  }

  async submitApplication({
    auth,
    application,
  }: TemplateApiModuleActionProps): Promise<void> {
    const applicationAnswers = application.answers as EnergyFundsAnswers
    const currentVehicleList = application.externalData?.currentVehicles
      ?.data as Array<VehiclesCurrentVehicle>
    const currentvehicleDetails = currentVehicleList.find(
      (x) => x.permno === applicationAnswers.selectVehicle.plate,
    )

    const answers = {
      nationalId: auth.nationalId,
      vIN: currentvehicleDetails?.vin || '',
      carNumber: applicationAnswers?.selectVehicle.plate,
      carType: (currentvehicleDetails && currentvehicleDetails.make) || '',
      itemcode: applicationAnswers?.selectVehicle.grantItemCode || '',
      vehicleGroup: currentvehicleDetails?.vehicleRegistrationCode || '',
      purchasePrice:
        (applicationAnswers?.vehicleDetails.price &&
          parseInt(applicationAnswers?.vehicleDetails.price)) ||
        0,
      registrationDate: currentvehicleDetails
        ? format(
            new Date(currentvehicleDetails.newRegistrationDate || ''),
            'yyyy-MM-dd',
          )
        : '',
      firstRegDate: currentvehicleDetails
        ? format(
            new Date(currentvehicleDetails.firstRegistrationDate || ''),
            'yyyy-MM-dd',
          )
        : '',
      subsidyAmount: applicationAnswers?.selectVehicle.grantAmount || 0,
    }

    await this.energyFundsClientService.submitEnergyFundsApplication(auth, {
      subsidyInput: answers,
    })
  }
}
