import { Label, ReviewGroup } from '@island.is/application/ui-components'

import { ActionCard, Box, GridColumn, GridRow } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { format as formatKennitala } from 'kennitala'
import { newPrimarySchoolMessages } from '../../../lib/messages'
import {
  getApplicationAnswers,
  getApplicationExternalData,
} from '../../../lib/newPrimarySchoolUtils'
import { ReviewGroupProps } from './props'

export const Child = ({
  application,
  editable,
  goToScreen,
}: ReviewGroupProps) => {
  const { formatMessage } = useLocale()
  const { childsNationalId } = getApplicationAnswers(application.answers)
  const { children } = getApplicationExternalData(application.externalData)

  // Find the child name since we only have nationalId in the answers
  const selectedChild = children.find((child) => {
    return child.nationalId === childsNationalId
  })

  return (
    <ReviewGroup
      isEditable={editable}
      editAction={() => goToScreen?.('childsNationalId')}
    >
      <GridRow>
        <GridColumn span={['12/12', '12/12', '12/12', '12/12']}>
          <Label>{formatMessage(newPrimarySchoolMessages.confirm.child)}</Label>
        </GridColumn>
      </GridRow>

      <Box marginTop={3}>
        <ActionCard
          headingVariant="h4"
          heading={selectedChild?.fullName || ''}
          text={formatKennitala(childsNationalId || '')}
        />
      </Box>
    </ReviewGroup>
  )
}
