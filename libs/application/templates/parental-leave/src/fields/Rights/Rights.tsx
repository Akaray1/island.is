import React, { FC } from 'react'

import {
  getApplicationAnswers,
  getMaxMultipleBirthsAndSingleParenttMonths,
  getMaxMultipleBirthsInMonths,
} from '../../lib/parentalLeaveUtils'
import { FieldBaseProps, BoxChartKey } from '@island.is/application/types'
import { Box } from '@island.is/island-ui/core'
import { defaultMonths, additionalSingleParentMonths } from '../../config'
import { parentalLeaveFormMessages } from '../../lib/messages'
import { SINGLE, YES } from '../../constants'
import { BoxChartFormField } from '@island.is/application/ui-fields'

const GiveDaysSlider: FC<React.PropsWithChildren<FieldBaseProps>> = ({
  application,
}) => {
  const { otherParent, hasMultipleBirths } = getApplicationAnswers(
    application.answers,
  )
  const getDefaultMonths =
    otherParent === SINGLE
      ? additionalSingleParentMonths + defaultMonths
      : defaultMonths

  const getMultipleBirthMonths = getMaxMultipleBirthsInMonths(
    application.answers,
  )
  const totalMonths = getMaxMultipleBirthsAndSingleParenttMonths(application)

  const boxChartKeys: BoxChartKey[] =
    hasMultipleBirths === YES
      ? [
          {
            label: () => ({
              ...parentalLeaveFormMessages.shared.yourRightsInMonths,
              values: { months: getDefaultMonths },
            }),
            bulletStyle: 'blue',
          },

          {
            label: () =>
              otherParent === SINGLE
                ? {
                    ...parentalLeaveFormMessages.shared
                      .yourSingleParentMultipleBirthsRightsInMonths,
                    values: { months: getMultipleBirthMonths },
                  }
                : {
                    ...parentalLeaveFormMessages.shared
                      .yourMultipleBirthsRightsInMonths,
                    values: { months: getMultipleBirthMonths },
                  },
            bulletStyle: 'purple',
          },
        ]
      : [
          {
            label: () => ({
              ...parentalLeaveFormMessages.shared.yourRightsInMonths,
              values: { months: getDefaultMonths },
            }),
            bulletStyle: 'blue',
          },
        ]

  return (
    <Box marginBottom={6} marginTop={3}>
      <BoxChartFormField
        application={application}
        field={{
          boxes: Math.ceil(totalMonths),
          calculateBoxStyle: (i) => {
            if (i < getDefaultMonths) return 'blue'
            else return 'purple'
          },
          keys: boxChartKeys as BoxChartKey[],
        }}
      />
    </Box>
  )
}

export default GiveDaysSlider
