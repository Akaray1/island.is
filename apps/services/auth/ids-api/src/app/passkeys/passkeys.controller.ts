import {
  Body,
  Controller,
  Post,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticationResponseJSON } from '@simplewebauthn/types'

import { PasskeysCoreService } from '@island.is/auth-api-lib'
import { Documentation } from '@island.is/nest/swagger'
import {
  AuthenticationOptions,
  AuthenticationResult,
} from './dto/authenticationOptions.dto'
import { IdsAuthGuard, ScopesGuard } from '@island.is/auth-nest-tools'
import { Audit } from '@island.is/nest/audit'

const namespace = '@island.is/auth-ids-api/passkeys'

@ApiTags('passkeys')
@Controller({
  path: 'passkeys',
  version: ['1', VERSION_NEUTRAL],
})
@UseGuards(IdsAuthGuard, ScopesGuard)
@Audit({ namespace })
export class PasskeysController {
  constructor(private readonly passkeysCoreService: PasskeysCoreService) {}

  @Post('authenticate')
  @Documentation({
    summary:
      'Validates passkey authentication based on input from authenticated user.',
    description: 'Verifies authenticated user passkey authentication response.',
    response: { status: 200, type: AuthenticationResult },
  })
  @ApiCreatedResponse({ type: AuthenticationResult })
  @Audit<AuthenticationResult>({
    resources: (authenticationResult) =>
      authenticationResult.verified.toString(),
  })
  async verifyAuthentication(
    @Body() body: AuthenticationOptions,
  ): Promise<AuthenticationResult> {
    const decodedJson = Buffer.from(body.passkey, 'base64').toString('utf-8')
    const parsedJson = JSON.parse(decodedJson) as AuthenticationResponseJSON

    const response = await this.passkeysCoreService.verifyAuthentication(
      parsedJson,
    )

    return response
  }
}
