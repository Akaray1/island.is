import {
  AlertMessage,
  Box,
  Bullet,
  BulletList,
  Text,
  InputError,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { FC, useState } from 'react'
import {
  Machine,
  MachineDetails,
  VehiclesCurrentVehicleWithOwnerchangeChecks,
} from '../../shared'
import { information, applicationCheck, error } from '../../lib/messages'
import { RadioController } from '@island.is/shared/form-fields'
import { useFormContext } from 'react-hook-form'
import { getValueViaPath } from '@island.is/application/core'
import { FieldBaseProps } from '@island.is/application/types'
import { machine } from 'os'
import { gql, useQuery } from '@apollo/client'
import { GET_MACHINE_DETAILS } from '../../graphql/queries'
import {} from '@island.is/api/domains/administration-of-occupational-safety-and-health'

interface Option {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface VehicleSearchFieldProps {
  currentMachineList: Machine[]
}

export const VehicleRadioField: FC<
  React.PropsWithChildren<VehicleSearchFieldProps & FieldBaseProps>
> = ({ currentMachineList, application, errors }) => {
  const { formatMessage } = useLocale()
  const { setValue } = useFormContext()

  const [plate, setPlate] = useState<string>(
    getValueViaPath(application.answers, 'pickVehicle.plate', '') as string,
  )

  const onRadioControllerSelect = (s: string) => {
    const currentVehicle = currentMachineList[parseInt(s, 10)]
    console.log('currentVehicle', currentVehicle)
    // call this
    const { data, loading, error } = useQuery<MachineDetails>(
      gql`
        ${GET_MACHINE_DETAILS}
      `,
      {
        variables: {
          input: {
            id: currentVehicle.id,
          },
        },
      },
    )

    if (!loading && !error) {
      // Once the data is available, assign it to the queryData variable
    }

    setPlate(currentVehicle.registrationNumber || '')
    setValue('vehicle.plate', currentVehicle.registrationNumber)
    setValue('vehicle.type', currentVehicle.type)
    setValue('vehicle.date', new Date().toISOString().substring(0, 10))
    setValue('pickVehicle.plate', currentVehicle.registrationNumber || '')
    setValue('pickVehicle.color', 'color' || undefined)
  }

  function isCurrentMachineDisabled(status?: string): boolean {
    const disabledStatuses = [
      'Læst',
      'Í skráningarferli',
      'Eigandaskipti í gangi',
      'Umráðamannaskipti í gangi',
      'Afskráð tímabundið',
      'Afskráð endanlega',
    ]
    if (status === undefined) return true
    if (disabledStatuses.includes(status)) {
      return true
    } else {
      return false
    }
  }

  const vehicleOptions = (machines: Machine[]) => {
    const options = [] as Option[]
    for (const [index, machine] of machines.entries()) {
      const disabled = isCurrentMachineDisabled(machine.status)
      options.push({
        value: `${index}`,
        label: (
          <Box display="flex" flexDirection="column">
            <Box>
              <Text variant="default" color={disabled ? 'dark200' : 'dark400'}>
                {machine.registrationNumber}
              </Text>
              <Text variant="small" color={disabled ? 'dark200' : 'dark400'}>
                {machine.category}: {machine.type}
              </Text>
              {!disabled && (
                <Text variant="small" color={disabled ? 'dark200' : 'dark400'}>
                  {machine.supervisor}
                </Text>
              )}
            </Box>
            {disabled && (
              <Box marginTop={2}>
                <AlertMessage
                  type="error"
                  title={formatMessage(
                    information.labels.pickVehicle.hasErrorTitle,
                  )}
                  message={
                    <Box>
                      <BulletList>
                        {!true && (
                          <Bullet>
                            {formatMessage(
                              information.labels.pickVehicle.isNotDebtLessTag,
                            )}
                          </Bullet>
                        )}
                        {!!machine.status?.length && (
                          <Bullet>{machine.status}</Bullet>
                        )}
                      </BulletList>
                    </Box>
                  }
                />
              </Box>
            )}
          </Box>
        ),
        disabled: disabled,
      })
    }
    return options
  }

  return (
    <div>
      <RadioController
        id="pickVehicle.vehicle"
        largeButtons
        backgroundColor="blue"
        onSelect={onRadioControllerSelect}
        options={vehicleOptions(currentMachineList as Machine[])}
      />
      {plate.length === 0 && (errors as any)?.pickVehicle && (
        <InputError errorMessage={formatMessage(error.requiredValidVehicle)} />
      )}
    </div>
  )
}
