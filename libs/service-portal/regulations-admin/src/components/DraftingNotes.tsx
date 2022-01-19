import React, { useState } from 'react'
import { Accordion, AccordionItem, Box, Text } from '@island.is/island-ui/core'
import { EditorInput } from './EditorInput'
import { editorMsgs as msg } from '../messages'
import { useLocale } from '../utils'
import { useDraftingState } from '../state/useDraftingState'

export const DraftingNotes = () => {
  const t = useLocale().formatMessage
  const { draft, actions } = useDraftingState()

  const { id, draftingNotes } = draft
  const [expanded, setExpanded] = useState(!!draftingNotes.value)

  return (
    <Box marginTop={[6, 6, 8]}>
      <Accordion>
        <AccordionItem
          id={id + '-notes'}
          label={t(msg.draftingNotes)}
          expanded={expanded}
          onToggle={setExpanded}
        >
          {expanded && (
            <Box marginBottom={2}>
              <EditorInput
                label={t(msg.draftingNotes)}
                hiddenLabel
                draftId={id}
                value={draftingNotes.value}
                onChange={(newValue) =>
                  actions.updateState('draftingNotes', newValue)
                }
              />
              <Text as="p" variant="small" marginTop={2}>
                {t(msg.draftingNotes_descr)}
              </Text>
            </Box>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  )
}
