import { FieldBaseProps } from '@island.is/application/types'
import { FC, useState } from 'react'
import { Box } from '@island.is/island-ui/core'
import { ApplicationStatus } from '../ApplicationStatus'
import { Overview } from '../Overview'
import { Location } from '../Location'
import { ReviewOperatorRepeater } from '../ReviewOperatorRepeater'
import { Operator, MachineLocation, ReviewState } from '../../shared'
import { getValueViaPath } from '@island.is/application/core'
import { useAuth } from '@island.is/auth/react'
import { buildFormConclusionSection } from '@island.is/application/ui-forms'
import { conclusion } from '../../lib/messages'
import { buyerOperatorSubSection } from '../../forms/TransferOfMachineOwnershipForm/buyerOperatorSection'

export const Review: FC<React.PropsWithChildren<FieldBaseProps>> = (props) => {
  const { application } = props
  const { userInfo } = useAuth()
  const [step, setStep] = useState<ReviewState>('states')

  const [location, setLocation] = useState<MachineLocation>(
    getValueViaPath(application.answers, 'location') as MachineLocation,
  )

  const [buyerOperator, setBuyerOperator] = useState<Operator>(
    getValueViaPath(application.answers, 'buyerOperator') as Operator,
  )

  const reviewerNationalId = userInfo?.profile.nationalId || null

  const filteredBuyerOperator =
    buyerOperator?.wasRemoved !== 'true' ? buyerOperator : null

  const displayScreen = (
    displayStep: ReviewState,
    reviewerNationalId: string,
  ) => {
    switch (displayStep) {
      case 'states':
        return (
          <ApplicationStatus
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            buyerOperator={filteredBuyerOperator}
            {...props}
          />
        )
      case 'overview':
        return (
          <Overview
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            location={location}
            buyerOperator={filteredBuyerOperator}
            {...props}
          />
        )
      case 'conclusion':
        return (
          <>
            {buildFormConclusionSection({
              sectionTitle: conclusion.general.sectionTitle,
              multiFieldTitle: conclusion.general.title,
              alertTitle: conclusion.default.accordionTitle,
              alertMessage: conclusion.default.alertMessage,
              expandableHeader: conclusion.default.accordionTitle,
              expandableDescription: conclusion.default.accordionText,
            })}
          </>
        )
      case 'addPeople':
        return <>{buyerOperatorSubSection}</>
      // <>
      // {buyerOperatorSubSection}
      // </>
      // <ReviewOperatorRepeater
      //   setStep={setStep}
      //   reviewerNationalId={reviewerNationalId}
      //   setBuyerOperator={setBuyerOperator}
      //   buyerOperator={buyerOperator}
      //   {...props}
      // />
      //)
      case 'location':
        return (
          <Location
            setStep={setStep}
            setLocation={setLocation}
            reviewerNationalId={reviewerNationalId}
            {...props}
          />
        )
      default:
        return (
          <ApplicationStatus
            setStep={setStep}
            reviewerNationalId={reviewerNationalId}
            {...props}
          />
        )
    }
  }

  if (!reviewerNationalId) return null

  return <Box>{displayScreen(step, reviewerNationalId)}</Box>
}
