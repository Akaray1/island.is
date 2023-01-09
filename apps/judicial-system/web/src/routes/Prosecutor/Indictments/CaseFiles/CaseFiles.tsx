import React, { useCallback, useContext } from 'react'
import { useIntl } from 'react-intl'
import router from 'next/router'

import {
  ProsecutorCaseInfo,
  FormContentContainer,
  FormFooter,
  PageLayout,
  FormContext,
  SectionHeading,
} from '@island.is/judicial-system-web/src/components'
import {
  IndictmentsProsecutorSubsections,
  Sections,
} from '@island.is/judicial-system-web/src/types'
import PageHeader from '@island.is/judicial-system-web/src/components/PageHeader/PageHeader'
import { errors, titles } from '@island.is/judicial-system-web/messages'
import {
  Box,
  InputFileUpload,
  Text,
  toast,
  UploadFile,
} from '@island.is/island-ui/core'
import {
  useS3Upload,
  useS3UploadV2,
} from '@island.is/judicial-system-web/src/utils/hooks'
import { CaseFileCategory } from '@island.is/judicial-system/types'
import { fileExtensionWhitelist } from '@island.is/island-ui/core/types'
import * as constants from '@island.is/judicial-system/consts'

import * as strings from './CaseFiles.strings'

const CaseFiles: React.FC = () => {
  const {
    workingCase,
    setWorkingCase,
    isLoadingWorkingCase,
    caseNotFound,
  } = useContext(FormContext)
  const { formatMessage } = useIntl()
  const { files, handleS3Upload, handleRetry, allFilesUploaded } = useS3Upload(
    workingCase,
  )
  const { remove } = useS3UploadV2(workingCase.id)

  const stepIsValid = allFilesUploaded
  const handleNavigationTo = useCallback(
    (destination: string) => router.push(`${destination}/${workingCase.id}`),
    [workingCase.id],
  )
  const handleRemove = useCallback(
    async (file: UploadFile) => {
      try {
        if (file.id) {
          await remove(file.id)
          setWorkingCase((prev) => ({
            ...prev,
            caseFiles: prev.caseFiles?.filter(
              (caseFile) => caseFile.id !== file.id,
            ),
          }))
        }
      } catch {
        toast.error(formatMessage(errors.general))
      }
    },
    [formatMessage, remove, setWorkingCase],
  )

  return (
    <PageLayout
      workingCase={workingCase}
      activeSection={Sections.PROSECUTOR}
      activeSubSection={IndictmentsProsecutorSubsections.CASE_FILES}
      isLoading={isLoadingWorkingCase}
      notFound={caseNotFound}
      isValid={stepIsValid}
      onNavigationTo={handleNavigationTo}
    >
      <PageHeader
        title={formatMessage(titles.prosecutor.indictments.caseFiles)}
      />
      <FormContentContainer>
        <Box marginBottom={7}>
          <Text as="h1" variant="h1">
            {formatMessage(strings.caseFiles.heading)}
          </Text>
        </Box>
        <ProsecutorCaseInfo workingCase={workingCase} />
        <Box component="section" marginBottom={5}>
          <SectionHeading
            title={formatMessage(strings.caseFiles.sections.coverLetter)}
          />
          <InputFileUpload
            fileList={files.filter(
              (file) => file.category === CaseFileCategory.COVER_LETTER,
            )}
            accept={Object.values(fileExtensionWhitelist)}
            header={formatMessage(strings.caseFiles.sections.inputFieldLabel)}
            buttonLabel={formatMessage(strings.caseFiles.sections.buttonLabel)}
            multiple={false}
            onChange={(files) =>
              handleS3Upload(files, false, CaseFileCategory.COVER_LETTER)
            }
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        </Box>
        <Box component="section" marginBottom={5}>
          <SectionHeading
            title={formatMessage(strings.caseFiles.sections.indictment)}
          />
          <InputFileUpload
            fileList={files.filter(
              (file) => file.category === CaseFileCategory.INDICTMENT,
            )}
            accept={Object.values(fileExtensionWhitelist)}
            header={formatMessage(strings.caseFiles.sections.inputFieldLabel)}
            buttonLabel={formatMessage(strings.caseFiles.sections.buttonLabel)}
            multiple={false}
            onChange={(files) =>
              handleS3Upload(files, false, CaseFileCategory.INDICTMENT)
            }
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        </Box>
        <Box component="section" marginBottom={5}>
          <SectionHeading
            title={formatMessage(strings.caseFiles.sections.criminalRecord)}
          />
          <InputFileUpload
            fileList={files.filter(
              (file) => file.category === CaseFileCategory.CRIMINAL_RECORD,
            )}
            accept={Object.values(fileExtensionWhitelist)}
            header={formatMessage(strings.caseFiles.sections.inputFieldLabel)}
            buttonLabel={formatMessage(strings.caseFiles.sections.buttonLabel)}
            onChange={(files) =>
              handleS3Upload(files, false, CaseFileCategory.CRIMINAL_RECORD)
            }
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        </Box>
        <Box component="section" marginBottom={5}>
          <SectionHeading
            title={formatMessage(strings.caseFiles.sections.costBreakdown)}
          />
          <InputFileUpload
            fileList={files.filter(
              (file) => file.category === CaseFileCategory.COST_BREAKDOWN,
            )}
            accept={Object.values(fileExtensionWhitelist)}
            header={formatMessage(strings.caseFiles.sections.inputFieldLabel)}
            buttonLabel={formatMessage(strings.caseFiles.sections.buttonLabel)}
            onChange={(files) =>
              handleS3Upload(files, false, CaseFileCategory.COST_BREAKDOWN)
            }
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        </Box>
        <Box component="section" marginBottom={10}>
          <SectionHeading
            title={formatMessage(strings.caseFiles.sections.otherDocuments)}
          />
          <InputFileUpload
            fileList={files.filter(
              (file) =>
                file.category === CaseFileCategory.CASE_FILE &&
                !file.policeCaseNumber,
            )}
            accept={Object.values(fileExtensionWhitelist)}
            header={formatMessage(strings.caseFiles.sections.inputFieldLabel)}
            buttonLabel={formatMessage(strings.caseFiles.sections.buttonLabel)}
            onChange={(files) =>
              handleS3Upload(files, false, CaseFileCategory.CASE_FILE)
            }
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        </Box>
      </FormContentContainer>
      <FormContentContainer isFooter>
        <FormFooter
          previousUrl={`${constants.INDICTMENTS_PROCESSING_ROUTE}/${workingCase.id}`}
          onNextButtonClick={() =>
            handleNavigationTo(constants.INDICTMENTS_OVERVIEW_ROUTE)
          }
          nextIsDisabled={!stepIsValid}
          nextIsLoading={isLoadingWorkingCase}
        />
      </FormContentContainer>
    </PageLayout>
  )
}

export default CaseFiles
