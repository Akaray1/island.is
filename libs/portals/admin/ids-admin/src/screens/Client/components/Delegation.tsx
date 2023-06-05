import { m } from '../../../lib/messages'
import ContentCard from '../../../components/ContentCard'
import { useLocale } from '@island.is/localization'
import { Checkbox, Stack } from '@island.is/island-ui/core'
import { useEnvironmentState } from '../../../hooks/useEnvironmentState'
import { ClientFormTypes } from '../EditClient.action'
import { useMultiEnvSupport } from '../../../hooks/useMultiEnvSupport'
import { useSuperAdmin } from '../../../hooks/useSuperAdmin'

interface DelegationProps {
  supportsProcuringHolders: boolean
  supportsLegalGuardians: boolean
  promptDelegations: boolean
  supportsPersonalRepresentatives: boolean
  supportsCustomDelegation: boolean
  requireApiScopes: boolean
}

const Delegation = ({
  supportsCustomDelegation,
  supportsLegalGuardians,
  supportsPersonalRepresentatives,
  supportsProcuringHolders,
  promptDelegations,
  requireApiScopes,
}: DelegationProps) => {
  const { formatMessage } = useLocale()
  const { shouldSupportMultiEnv } = useMultiEnvSupport()
  const { isSuperAdmin } = useSuperAdmin()

  const [inputValues, setInputValues] = useEnvironmentState({
    supportsCustomDelegation,
    supportsLegalGuardians,
    supportsPersonalRepresentatives,
    supportsProcuringHolders,
    promptDelegations,
    requireApiScopes,
  })

  return (
    <ContentCard
      title={formatMessage(m.delegations)}
      description={formatMessage(m.delegationsDescription)}
      intent={ClientFormTypes.delegations}
      accordionLabel={formatMessage(m.settings)}
      shouldSupportMultiEnvironment={shouldSupportMultiEnv}
    >
      <Stack space={2}>
        <Checkbox
          label={formatMessage(m.supportCustomDelegation)}
          backgroundColor={'blue'}
          large
          name="supportsCustomDelegation"
          value="true"
          disabled={!isSuperAdmin}
          checked={inputValues.supportsCustomDelegation}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              supportsCustomDelegation: !prev.supportsCustomDelegation,
            }))
          }}
          subLabel={formatMessage(m.supportCustomDelegationDescription)}
        />
        <Checkbox
          label={formatMessage(m.supportLegalGuardianDelegation)}
          backgroundColor={'blue'}
          large
          name="supportsLegalGuardians"
          disabled={!isSuperAdmin}
          value="true"
          checked={inputValues.supportsLegalGuardians}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              supportsLegalGuardians: !prev.supportsLegalGuardians,
            }))
          }}
          subLabel={formatMessage(m.supportLegalGuardianDelegationDescription)}
        />
        <Checkbox
          label={formatMessage(m.supportPersonalRepresentativeDelegation)}
          backgroundColor={'blue'}
          large
          disabled={!isSuperAdmin}
          name="supportsPersonalRepresentatives"
          value="true"
          checked={inputValues.supportsPersonalRepresentatives}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              supportsPersonalRepresentatives: !prev.supportsPersonalRepresentatives,
            }))
          }}
          subLabel={formatMessage(
            m.supportPersonalRepresentativeDelegationDescription,
          )}
        />
        <Checkbox
          label={formatMessage(m.supportProcuringHolderDelegation)}
          backgroundColor={'blue'}
          large
          disabled={!isSuperAdmin}
          name="supportsProcuringHolders"
          value="true"
          checked={inputValues.supportsProcuringHolders}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              supportsProcuringHolders: !prev.supportsProcuringHolders,
            }))
          }}
          subLabel={formatMessage(
            m.supportProcuringHolderDelegationDescription,
          )}
        />
        <Checkbox
          label={formatMessage(m.alwaysPromptDelegations)}
          backgroundColor={'blue'}
          large
          disabled={!isSuperAdmin}
          name="promptDelegations"
          value="true"
          checked={inputValues.promptDelegations}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              promptDelegations: !prev.promptDelegations,
            }))
          }}
          subLabel={formatMessage(m.alwaysPromptDelegationsDescription)}
        />
        <Checkbox
          label={formatMessage(m.requirePermissions)}
          backgroundColor={'blue'}
          large
          disabled={!isSuperAdmin}
          name="requireApiScopes"
          value="true"
          checked={inputValues.requireApiScopes}
          onChange={() => {
            setInputValues((prev) => ({
              ...prev,
              requireApiScopes: !prev.requireApiScopes,
            }))
          }}
          subLabel={formatMessage(m.requirePermissionsDescription)}
        />
      </Stack>
    </ContentCard>
  )
}

export default Delegation
