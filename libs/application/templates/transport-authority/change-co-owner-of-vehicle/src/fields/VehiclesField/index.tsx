import { FieldBaseProps } from '@island.is/application/types'
import { Box } from '@island.is/island-ui/core'
import { FC, useCallback, useEffect } from 'react'
import { CurrentVehiclesAndRecords } from '../../shared'
import { VehicleRadioField } from './VehicleRadioField'
import { useFormContext } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { UPDATE_APPLICATION } from '@island.is/application/graphql'
import { useLocale } from '@island.is/localization'
import { VehicleFindField } from './VehicleFindField'

export const VehiclesField: FC<React.PropsWithChildren<FieldBaseProps>> = (
  props,
) => {
  const { locale } = useLocale()
  const { setValue } = useFormContext()
  const { application } = props
  const [updateApplication] = useMutation(UPDATE_APPLICATION)
  const currentVehicleList = application.externalData.currentVehicleList
    .data as CurrentVehiclesAndRecords

  const updateData = useCallback(async () => {
    await updateApplication({
      variables: {
        input: {
          id: application.id,
          answers: {
            ownerCoOwners: [],
          },
        },
        locale,
      },
    })
  }, [])

  useEffect(() => {
    setValue('ownerCoOwners', [])
    updateData()
  }, [setValue])

  return (
    <Box paddingTop={2}>
      {currentVehicleList.totalRecords > 5 ? (
        <VehicleFindField
          currentVehicleList={currentVehicleList.vehicles}
          {...props}
        />
      ) : (
        // currentVehicleList.totalRecords > 5 ? (
        //   <VehicleSelectField
        //     currentVehicleList={currentVehicleList.vehicles}
        //     {...props}
        //   />
        // ) :
        <VehicleRadioField
          currentVehicleList={currentVehicleList?.vehicles}
          {...props}
        />
      )}
    </Box>
  )
}
