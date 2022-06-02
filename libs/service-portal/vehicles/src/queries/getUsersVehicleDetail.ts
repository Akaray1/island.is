import { gql } from '@apollo/client'

export const GET_USERS_VEHICLE_DETAIL = gql`
  query GetUsersVehiclesDetail($input: GetVehicleDetailInput!) {
    vehiclesDetail(input: $input) {
      mainInfo {
        model
        subModel
        regno
        year
        co2
        weightedCo2
        co2Wltp
        weightedCo2Wltp
        cubicCapacity
        trailerWithBrakesWeight
        trailerWithoutBrakesWeight
      }
      basicInfo {
        model
        regno
        subModel
        permno
        verno
        year
        country
        preregDateYear
        formerCountry
        importStatus
      }
      registrationInfo {
        firstRegistrationDate
        preRegistrationDate
        newRegistrationDate
        vehicleGroup
        color
        reggroup
        reggroupName
        passengers
        useGroup
        driversPassengers
        standingPassengers
        plateLocation
        specialName
        plateStatus
      }
      currentOwnerInfo {
        owner
        nationalId
        address
        postalcode
        city
        dateOfPurchase
      }
      inspectionInfo {
        type
        date
        result
        nextInspectionDate
        lastInspectionDate
        insuranceStatus
        mortages
        carTax
        inspectionFine
      }
      technicalInfo {
        engine
        totalWeight
        cubicCapacity
        capacityWeight
        length
        vehicleWeight
        width
        trailerWithoutBrakesWeight
        horsepower
        trailerWithBrakesWeight
        carryingCapacity
        axleTotalWeight
        axles {
          axleMaxWeight
          wheelAxle
        }
        tyres {
          axle1
          axle2
          axle3
          axle4
          axle5
        }
      }
      ownersInfo {
        name
        address
        dateOfPurchase
      }
      coOwners {
        nationalId
        owner
        address
        postalcode
        city
        dateOfPurchase
      }
      operators {
        nationalId
        name
        address
        postalcode
        city
        startDate
        endDate
      }
    }
  }
`
