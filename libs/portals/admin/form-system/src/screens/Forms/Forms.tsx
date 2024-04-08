import {
  Box,
  Button,
  Text,
  Inline
} from '@island.is/island-ui/core'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { FormSystemPaths } from '../../lib/paths'
import TableRow from '../../components/TableRow/TableRow'
import { useFormSystemGetFormsQuery } from './Forms.generated'
import { useFormSystemCreateFormMutation } from './CreateForm.generated'
import { FormsLoaderResponse } from './Forms.loader'

const Forms = () => {
  const navigate = useNavigate()

  const { data, loading, error } = useFormSystemGetFormsQuery({
    variables: {
      input: {
        organizationId: 1
      }
    }
  })

  const [formSystemCreateFormMutation, { data: newData, loading: newLoading, error: newError }] = useFormSystemCreateFormMutation({
    variables: {
      input: {
        organizationId: 1
      }
    }
  })

  const forms = data?.formSystemGetForms.forms
  console.log(data)
  if (!loading && !error) {
    return (
      <Box>
        {/* Title and buttons  */}
        <Box>
          <Text variant="h2">Forskriftir</Text>
        </Box>
        <Box marginTop={5}>
          <Inline space={2}>
            <Button
              variant="ghost"
              size="medium"
              onClick={async () => {
                const { data } = await formSystemCreateFormMutation({ variables: { input: { organizationId: 1 } } })
                navigate(FormSystemPaths.Form.replace(':formId', String(data?.formSystemCreateForm?.form?.id)))
                console.log(data)
              }}
            >
              Ný forskrift
            </Button>
            <Button variant="ghost" size="medium">
              Hlaða inn forskrift
            </Button>
          </Inline>
        </Box>

        <Box marginTop={5}></Box>

        <Box marginTop={5}>
          <Box width={'half'}></Box>
          <Box></Box>
        </Box>
        <TableRow isHeader={true} />
        {forms &&
          forms?.map((f) => {
            return (
              <TableRow
                key={f?.id}
                id={f?.id}
                name={f?.name?.is ?? ''}
                // created={f?.created}
                // lastModified={f?.lastChanged}
                org={f?.organization?.id}
                isHeader={false}
                translated={f?.isTranslated ?? false}
              />
            )
          })}
      </Box>
    )
  }
  return <>AAAAA</>
}

export default Forms
