import React, { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ValueType } from 'react-select'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  CaseState,
  CaseTransition,
  CaseType,
  NotificationType,
  UserRole,
} from '@island.is/judicial-system/types'
import type { Case, User } from '@island.is/judicial-system/types'
import {
  CaseData,
  ProsecutorSubsections,
  Sections,
  ReactSelectOption,
} from '@island.is/judicial-system-web/src/types'
import {
  Modal,
  PageLayout,
} from '@island.is/judicial-system-web/src/shared-components'
import * as Constants from '@island.is/judicial-system-web/src/utils/constants'
import { setAndSendToServer } from '@island.is/judicial-system-web/src/utils/formHelper'
import { CaseQuery } from '@island.is/judicial-system-web/graphql'
import { UsersQuery } from '@island.is/judicial-system-web/src/utils/mutations'
import {
  useCase,
  useInstitution,
} from '@island.is/judicial-system-web/src/utils/hooks'
import { rcRequestedHearingArrangements } from '@island.is/judicial-system-web/messages'
import { UserContext } from '@island.is/judicial-system-web/src/shared-components/UserProvider/UserProvider'
import StepTwoForm from './StepTwoForm'

export const StepTwo: React.FC = () => {
  const router = useRouter()
  const id = router.query.id
  const { formatMessage } = useIntl()
  const [workingCase, setWorkingCase] = useState<Case>()
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const [substituteProsecutorId, setSubstituteProsecutorId] = useState<string>()
  const [
    isProsecutorAccessModalVisible,
    setIsProsecutorAccessModalVisible,
  ] = useState<boolean>(false)
  const { user } = useContext(UserContext)
  const {
    sendNotification,
    isSendingNotification,
    transitionCase,
    isTransitioningCase,
    updateCase,
  } = useCase()

  const { data, loading } = useQuery<CaseData>(CaseQuery, {
    variables: { input: { id: id } },
    fetchPolicy: 'no-cache',
  })

  const { data: userData, loading: userLoading } = useQuery(UsersQuery, {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  })

  const { courts, loading: institutionLoading } = useInstitution()

  useEffect(() => {
    document.title = 'Óskir um fyrirtöku - Réttarvörslugátt'
  }, [])

  useEffect(() => {
    if (!workingCase && data) {
      setWorkingCase(data.case)
    }
  }, [workingCase, setWorkingCase, data])

  const prosecutors = userData?.users
    .filter(
      (aUser: User) =>
        aUser.role === UserRole.PROSECUTOR &&
        (!workingCase?.creatingProsecutor ||
          aUser.institution?.id ===
            workingCase?.creatingProsecutor?.institution?.id),
    )
    .map((prosecutor: User, _: number) => {
      return { label: prosecutor.name, value: prosecutor.id }
    })

  const handleNextButtonClick = async () => {
    if (!workingCase) {
      return
    }

    const caseOpened =
      workingCase.state === CaseState.NEW
        ? await transitionCase(workingCase, CaseTransition.OPEN, setWorkingCase)
        : true

    if (caseOpened) {
      if (
        (workingCase.state !== CaseState.NEW &&
          workingCase.state !== CaseState.DRAFT) ||
        // TODO: Ignore failed notifications
        workingCase.notifications?.find(
          (notification) => notification.type === NotificationType.HEADS_UP,
        )
      ) {
        router.push(`${Constants.STEP_THREE_ROUTE}/${workingCase.id}`)
      } else {
        setModalVisible(true)
      }
    } else {
      // TODO: Handle error
    }
  }

  const setProsecutor = async (prosecutorId: string) => {
    if (workingCase) {
      return setAndSendToServer(
        'prosecutorId',
        prosecutorId,
        workingCase,
        setWorkingCase,
        updateCase,
      )
    }
  }

  const handleProsecutorChange = (
    selectedOption: ValueType<ReactSelectOption>,
  ) => {
    if (!workingCase) return false

    const option = selectedOption as ReactSelectOption
    const isRemovingCaseAccessFromSelf =
      user?.id !== workingCase.creatingProsecutor?.id

    if (workingCase.isHeightenedSecurityLevel && isRemovingCaseAccessFromSelf) {
      setSubstituteProsecutorId(option.value.toString())
      setIsProsecutorAccessModalVisible(true)

      return false
    } else {
      setProsecutor(option.value.toString())

      return true
    }
  }

  return (
    <PageLayout
      workingCase={workingCase}
      activeSection={
        workingCase?.parentCase ? Sections.EXTENSION : Sections.PROSECUTOR
      }
      activeSubSection={ProsecutorSubsections.CUSTODY_REQUEST_STEP_TWO}
      isLoading={loading || userLoading || institutionLoading}
      notFound={data?.case === undefined}
    >
      {workingCase && prosecutors && !institutionLoading ? (
        <>
          <StepTwoForm
            workingCase={workingCase}
            setWorkingCase={setWorkingCase}
            prosecutors={prosecutors}
            courts={courts}
            handleNextButtonClick={handleNextButtonClick}
            transitionLoading={isTransitioningCase}
            user={user}
            onProsecutorChange={handleProsecutorChange}
          />
          {modalVisible && (
            <Modal
              title={formatMessage(
                rcRequestedHearingArrangements.modal.heading,
              )}
              text={formatMessage(rcRequestedHearingArrangements.modal.text, {
                caseType:
                  workingCase.type === CaseType.CUSTODY
                    ? 'gæsluvarðhald'
                    : 'farbann',
              })}
              primaryButtonText="Senda tilkynningu"
              secondaryButtonText="Halda áfram með kröfu"
              handleClose={() => setModalVisible(false)}
              handleSecondaryButtonClick={() =>
                router.push(`${Constants.STEP_THREE_ROUTE}/${workingCase.id}`)
              }
              handlePrimaryButtonClick={async () => {
                const notificationSent = await sendNotification(
                  workingCase.id,
                  NotificationType.HEADS_UP,
                )

                if (notificationSent) {
                  router.push(`${Constants.STEP_THREE_ROUTE}/${workingCase.id}`)
                }
              }}
              isPrimaryButtonLoading={isSendingNotification}
            />
          )}
          {isProsecutorAccessModalVisible && (
            <Modal
              title={formatMessage(
                rcRequestedHearingArrangements.prosecutorAccessModal.heading,
              )}
              text={formatMessage(
                rcRequestedHearingArrangements.prosecutorAccessModal.text,
              )}
              primaryButtonText={formatMessage(
                rcRequestedHearingArrangements.prosecutorAccessModal
                  .primaryButtonText,
              )}
              secondaryButtonText={formatMessage(
                rcRequestedHearingArrangements.prosecutorAccessModal
                  .secondaryButtonText,
              )}
              handlePrimaryButtonClick={async () => {
                if (substituteProsecutorId) {
                  await setProsecutor(substituteProsecutorId)
                  router.push(Constants.REQUEST_LIST_ROUTE)
                }
              }}
              handleSecondaryButtonClick={() => {
                setIsProsecutorAccessModalVisible(false)
              }}
            />
          )}
        </>
      ) : null}
    </PageLayout>
  )
}

export default StepTwo
