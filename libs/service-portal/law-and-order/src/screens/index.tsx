import { FC } from 'react'
import { LawAndOrderProvider } from '../helpers/LawAndOrderContext'
import CourtCaseDetail from './CourtCaseDetail/CourtCaseDetail'
import CourtCases from './CourtCases/CourtCases'
import LawAndOrderOverview from './Overview/LawAndOrderOverview'
import Subpoena from './Subpoena/Subpoena'
import { Components } from '../lib/const'

interface Props {
  component: string
}

// Made to inject provider into all components
// Will be refactored when service will be available
const LawAndOrderIndex: FC<React.PropsWithChildren<Props>> = ({
  component,
}) => {
  const getComponent = (component: string) => {
    switch (component) {
      case Components.OVERVIEW:
        return <LawAndOrderOverview />
        break
      case Components.COURT_CASES:
        return <CourtCases />
      case Components.COURT_CASE_DETAIL:
        return <CourtCaseDetail />
      case Components.SUBPOENA:
        return <Subpoena />
      default:
        return <LawAndOrderOverview />
        break
    }
  }
  return <LawAndOrderProvider>{getComponent(component)}</LawAndOrderProvider>
}
export default LawAndOrderIndex
