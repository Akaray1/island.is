import { Injectable, Inject } from '@nestjs/common'
import { ValidationFailed } from '@island.is/nest/problem'
import {
  ApplicationTemplateHelper,
  validateAnswers,
} from '@island.is/application/core'
import {
  Application,
  ApplicationContext,
  ApplicationStateSchema,
  ApplicationTemplate,
  FormValue,
  TemplateApi,
} from '@island.is/application/types'
import { FeatureFlagService, Features } from '@island.is/nest/feature-flags'
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { Unwrap } from '@island.is/shared/types'
import { environment } from '../../../../environments'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { User } from '@island.is/auth-nest-tools'
import type { FormatMessage } from '@island.is/cms-translations'
import { TemplateService } from '@island.is/application/api/core'
import { EventObject } from 'xstate'

const isRunningOnProductionEnvironment = () => {
  return (
    environment.production === true &&
    environment.name !== 'local' &&
    environment.name !== 'dev' &&
    environment.name !== 'staging'
  )
}

@Injectable()
export class ApplicationValidationService {
  constructor(
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
    private readonly featureFlagService: FeatureFlagService,
    private readonly templateService: TemplateService,
  ) {}

  async validateThatApplicationIsReady(
    application: Application,
    user: User,
  ): Promise<void> {
    console.log('validateThatApplicationIsReady')
    const applicationTemplate =
      await this.templateService.getApplicationTemplate(
        application.typeId,
        application.subTypeId,
      )

    if (!applicationTemplate) {
      throw new BadRequestException(
        `No template exists for type: ${application.typeId}`,
      )
    }

    await this.validateThatTemplateIsReady(applicationTemplate, user)
  }

  async isTemplateFeatureFlaggedReady(featureFlag: Features, user?: User) {
    return await this.featureFlagService.getValue(featureFlag, false, user)
  }

  // Determines if a template is ready based on the presence of a configcat flag or the readyForProduction flag.
  async isTemplateReady(
    template: ApplicationTemplate<
      ApplicationContext,
      ApplicationStateSchema<EventObject>,
      EventObject
    >,
    user?: User,
  ): Promise<boolean> {
    // If the featureFlag is present, use the isTemplateFeatureFlaggedReady function.
    if (template.featureFlag) {
      return await this.isTemplateFeatureFlaggedReady(
        template.featureFlag,
        user,
      )
    }
    // If the code is running in a production environment and the readyForProduction flag is undefined or true, consider the template ready.
    if (isRunningOnProductionEnvironment()) {
      return template.readyForProduction ?? true
    }
    // If the code is not running in a production environment, consider the template ready.
    return true
  }

  async validateThatTemplateIsReady(
    template: ApplicationTemplate<
      ApplicationContext,
      ApplicationStateSchema<EventObject>,
      EventObject
    >,
    user?: User,
  ): Promise<void> {
    const results = await this.isTemplateReady(template, user)
    if (!results) {
      throw new BadRequestException(
        `Template ${template.type} is not ready for production`,
      )
    }
  }

  async validateApplicationSchema(
    application: Pick<Application, 'typeId' | 'subTypeId'>,
    newAnswers: FormValue,
    formatMessage: FormatMessage,
    user: User,
  ): Promise<void> {
    console.log('validateApplicationSchema')
    const applicationTemplate =
      await this.templateService.getApplicationTemplate(
        application.typeId,
        application.subTypeId,
      )

    if (applicationTemplate === null) {
      throw new BadRequestException(
        `No template exists for type: ${application.typeId}`,
      )
    }

    await this.validateThatTemplateIsReady(applicationTemplate, user)

    const schemaFormValidationError = validateAnswers({
      dataSchema: applicationTemplate.dataSchema,
      answers: newAnswers,
      isFullSchemaValidation: false,
      formatMessage,
    })

    if (schemaFormValidationError) {
      this.logger.error('Failed to validate schema', schemaFormValidationError)
      throw new ValidationFailed(schemaFormValidationError)
    }
  }

  async validateIncomingAnswers(
    application: Application,
    newAnswers: FormValue | undefined,
    nationalId: string,
    isStrict = true,
    formatMessage: FormatMessage,
  ): Promise<FormValue> {
    if (!newAnswers) {
      return {}
    }
    console.log('validateIncomingAnswers')
    const template = await this.templateService.getApplicationTemplate(
      application.typeId,
      application.subTypeId,
    )
    const role = template.mapUserToRole(nationalId, application)

    if (!role) {
      throw new UnauthorizedException(
        'Current user does not have a role in this application state',
      )
    }

    const helper = new ApplicationTemplateHelper(application, template)
    const writableAnswersAndExternalData =
      helper.getWritableAnswersAndExternalData(role)

    let trimmedAnswers: FormValue

    if (writableAnswersAndExternalData === 'all') {
      trimmedAnswers = newAnswers
    } else {
      if (
        isStrict &&
        (!writableAnswersAndExternalData ||
          !writableAnswersAndExternalData?.answers)
      ) {
        throw new ForbiddenException(
          `Current user is not permitted to update answers in this state: ${application.state}`,
        )
      }

      const permittedAnswers = writableAnswersAndExternalData?.answers ?? []
      trimmedAnswers = {}
      const illegalAnswers: string[] = []

      Object.keys(newAnswers).forEach((key) => {
        if (permittedAnswers.indexOf(key) === -1) {
          illegalAnswers.push(key)
        } else {
          trimmedAnswers[key] = newAnswers[key]
        }
      })

      if (isStrict && illegalAnswers.length > 0) {
        throw new ForbiddenException(
          `Current user is not permitted to update the following answers: ${illegalAnswers.toString()}`,
        )
      }
    }

    try {
      const errorMap = await helper.applyAnswerValidators(
        newAnswers,
        formatMessage,
      )
      if (errorMap) {
        throw new ValidationFailed(errorMap)
      }
    } catch (error) {
      this.logger.error('Failed to validate answers', error)
      throw error
    }

    return trimmedAnswers
  }

  async validateIncomingExternalDataProviders(
    application: Application,
    templateApis: TemplateApi[],
    nationalId: string,
  ): Promise<void> {
    if (!templateApis) {
      return
    }
    console.log('validateIncomingExternalDataProviders')
    const template = await this.templateService.getApplicationTemplate(
      application.typeId,
      application.subTypeId,
    )
    const role = template.mapUserToRole(nationalId, application)
    if (!role) {
      throw new UnauthorizedException(
        'Current user does not have a role in this application state',
      )
    }
    const helper = new ApplicationTemplateHelper(application, template)
    const writableAnswersAndExternalData =
      helper.getWritableAnswersAndExternalData(role)
    if (writableAnswersAndExternalData === 'all') {
      return
    }
    if (
      !writableAnswersAndExternalData ||
      !writableAnswersAndExternalData?.externalData
    ) {
      throw new BadRequestException(
        `Current user is not permitted to update external data in this state: ${application.state}`,
      )
    }
    const permittedDataProviders = writableAnswersAndExternalData.externalData

    const illegalDataProviders: string[] = []

    templateApis.forEach(({ externalDataId }) => {
      if (permittedDataProviders.indexOf(externalDataId) === -1) {
        illegalDataProviders.push(externalDataId)
      }
    })
    if (illegalDataProviders.length > 0) {
      throw new BadRequestException(
        `Current user is not permitted to update the following data providers: ${illegalDataProviders.toString()}`,
      )
    }
  }
}
