import {
  ApplicantChildCustodyInformation,
  FieldBaseProps,
} from '@island.is/application/types'
import { personal, review, selectChildren } from '../../lib/messages'
import { Box, GridColumn, GridRow, Text } from '@island.is/island-ui/core'
import DescriptionText from '../../components/DescriptionText'
import { useLocale } from '@island.is/localization'
import { Routes } from '../../lib/constants'
import SummaryBlock from '../../components/SummaryBlock'

interface ChildrenReviewProps extends FieldBaseProps {
  selectedChildren: Array<ApplicantChildCustodyInformation> | undefined
  goToScreen?: (id: string) => void
  route: Routes
}

export const ChildrenReview = ({
  selectedChildren,
  goToScreen,
  route,
}: ChildrenReviewProps) => {
  const { formatMessage } = useLocale()
  return (
    <SummaryBlock editAction={() => goToScreen?.(route)}>
      <Box paddingBottom={4}>
        <DescriptionText
          text={review.labels.children}
          textProps={{
            as: 'h4',
            fontWeight: 'semiBold',
            marginBottom: 0,
          }}
        />
        {selectedChildren &&
          selectedChildren.map((child) => {
            return (
              <GridRow>
                <GridColumn span="1/2">
                  <Text>{`${child.givenName} ${child.familyName}`}</Text>
                  {child.otherParent && (
                    <Text>
                      {`${selectChildren.checkboxes.subLabel}: ${child.otherParent?.fullName}`}
                    </Text>
                  )}
                </GridColumn>
                <GridColumn span="1/2">
                  <Text>
                    {`${formatMessage(
                      personal.labels.userInformation.citizenship,
                    )}: ${child.citizenship?.name}`}
                  </Text>
                </GridColumn>
              </GridRow>
            )
          })}
      </Box>
    </SummaryBlock>
  )
}
