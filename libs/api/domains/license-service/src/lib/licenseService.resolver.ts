import type { User } from '@island.is/auth-nest-tools'
import {
  CurrentUser,
  IdsUserGuard,
  Scopes,
  ScopesGuard,
} from '@island.is/auth-nest-tools'
import { ApiScope, LicenseApiScope } from '@island.is/auth/scopes'
import { Audit } from '@island.is/nest/audit'

import type { Locale } from '@island.is/shared/types'
import { ForbiddenException, UseGuards } from '@nestjs/common'
import {
  Args,
  Directive,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { CreateBarcodeResult } from './dto/CreateBarcodeResult.dto'
import { GeneratePkPassInput } from './dto/GeneratePkPass.input'
import { GenericPkPass } from './dto/GenericPkPass.dto'
import { GenericPkPassQrCode } from './dto/GenericPkPassQrCode.dto'
import { GenericPkPassVerification } from './dto/GenericPkPassVerification.dto'
import { GenericUserLicense } from './dto/GenericUserLicense.dto'
import { GetGenericLicenseInput } from './dto/GetGenericLicense.input'
import { GetGenericLicensesInput } from './dto/GetGenericLicenses.input'
import { VerifyLicenseBarcodeInput } from './dto/VerifyLicenseBarcodeInput'
import { VerifyLicenseBarcodeResult } from './dto/VerifyLicenseBarcodeResult.dto'
import { VerifyPkPassInput } from './dto/VerifyPkPass.input'
import { LicenseServiceService } from './licenseService.service'
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
import { LicenseCollection } from './dto/GenericLicenseCollection.dto'
import { LicenseError } from './dto/GenericLicenseError.dto'
import { GenericLicense } from './dto/GenericLicense.dto'
import {
  OrganizationLogoByReferenceIdDataLoader,
  OrganizationLogoByReferenceIdLoader,
  OrganizationTitleByReferenceIdDataLoader,
  OrganizationTitleByReferenceIdLoader,
} from '@island.is/cms'
import { Loader } from '@island.is/nest/dataloader'
<<<<<<< Updated upstream
=======
import { GenericLicenseProvider } from './dto/GenericLicenseProvider.dto'
>>>>>>> Stashed changes
>>>>>>> Stashed changes

@UseGuards(IdsUserGuard, ScopesGuard)
@Scopes(ApiScope.internal, ApiScope.licenses)
@Resolver(() => LicenseCollection)
@Audit({ namespace: '@island.is/api/license-service' })
export class LicenseServiceResolver {
  constructor(private readonly licenseServiceService: LicenseServiceService) {}

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
  @Query(() => LicenseCollection)
  @Audit()
  async genericLicenseCollection(
    @CurrentUser() user: User,
    @Args('locale', { type: () => String, nullable: true })
    locale: Locale = 'is',
    @Args('input') input: GetGenericLicensesInput,
  ) {
    const licenses = await this.licenseServiceService.getLicenseCollection(
      user,
      locale,
      {
        ...input,
        includedTypes: input?.includedTypes ?? ['DriversLicense'],
        excludedTypes: input?.excludedTypes,
        force: input?.force,
        onlyList: input?.onlyList,
      },
    )
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
    return {
      licenses,
    }
  }
<<<<<<< Updated upstream

  @ResolveField('providerName', () => String, {
    nullable: true,
=======
  @ResolveField('providerName', () => String)
  async resolveProviderName(
    @Parent() license: GenericLicenseProvider,
    @Loader(OrganizationTitleByReferenceIdLoader)
    organizationTitleLoader: OrganizationTitleByReferenceIdDataLoader,
  ): Promise<string> {
    if (!license.referenceId) {
      return ''
    }

    const title: string | null = await organizationTitleLoader.load(
      license.referenceId,
    )

    return title ?? ''
  }

  @ResolveField('providerLogo', () => String)
  async resolveProviderLogo(
    @Parent() license: GenericLicenseProvider,
    @Loader(OrganizationLogoByReferenceIdLoader)
    organizationLogoLoader: OrganizationLogoByReferenceIdDataLoader,
  ): Promise<string> {
    if (!license.referenceId) {
      return ''
    }

    const logo: string | null = await organizationLogoLoader.load(
      license.referenceId,
    )
    return logo ?? ''
  }

>>>>>>> Stashed changes
  @Query(() => [GenericUserLicense], {
    deprecationReason: 'Use genericUserLicenses instead',
>>>>>>> Stashed changes
  })
  async resolveProviderName(
    @Parent() license: GenericLicense,
    @Loader(OrganizationTitleByReferenceIdLoader)
    organizationTitleLoader: OrganizationTitleByReferenceIdDataLoader,
  ): Promise<string | null> {
    if (!license.provider.referenceId) {
      return null
    }
    return organizationTitleLoader.load(license.provider.referenceId)
  }

  @ResolveField('providerLogo', () => String, {
    nullable: true,
  })
  async resolveProviderLogo(
    @Parent() license: GenericLicense,
    @Loader(OrganizationLogoByReferenceIdLoader)
    organizationLogoLoader: OrganizationLogoByReferenceIdDataLoader,
  ): Promise<string | null> {
    if (!license.provider.referenceId) {
      return null
    }
    return organizationLogoLoader.load(license.provider.referenceId)
  }

  @Query(() => [GenericUserLicense], {
    deprecationReason: 'Use genericLicenseCollection instead',
  })
  @Directive(
    '@deprecated(reason: "Deprecated in favor of genericLicenseCollection")',
  )
  @Audit()
  async genericLicenses(
    @CurrentUser() user: User,
    @Args('locale', { type: () => String, nullable: true })
    locale: Locale = 'is',
    @Args('input', { nullable: true }) input?: GetGenericLicensesInput,
  ) {
    const licenseCollection =
      await this.licenseServiceService.getLicenseCollection(user, locale, {
        includedTypes: input?.includedTypes ?? ['DriversLicense'],
        excludedTypes: input?.excludedTypes,
        force: input?.force,
        onlyList: input?.onlyList,
      })

    return licenseCollection.filter(
      (licenseResult) => licenseResult instanceof GenericUserLicense,
    )
  }

  @Query(() => GenericUserLicense, { nullable: true })
  @Audit()
  async genericLicense(
    @CurrentUser() user: User,
    @Args('locale', { type: () => String, nullable: true })
    locale: Locale = 'is',
    @Args('input') input: GetGenericLicenseInput,
  ) {
    const license = await this.licenseServiceService.getLicense(
      user,
      locale,
      input.licenseType,
      input.licenseId,
    )

    if (license instanceof LicenseError) {
      return null
    }

    return license
  }

  @ResolveField('barcode', () => CreateBarcodeResult, { nullable: true })
  async createBarcode(
    @CurrentUser() user: User,
    @Parent() genericUserLicense: GenericUserLicense,
  ): Promise<CreateBarcodeResult | null> {
    if (!user.scope.includes(LicenseApiScope.licensesBarcode)) {
      throw new ForbiddenException(
        'User does not have permission to create barcode',
      )
    }

    return this.licenseServiceService.createBarcode(user, genericUserLicense)
  }

  @Mutation(() => GenericPkPass)
  @Audit()
  async generatePkPass(
    @CurrentUser() user: User,
    @Args('input') input: GeneratePkPassInput,
  ): Promise<GenericPkPass> {
    const pkpassUrl = await this.licenseServiceService.generatePkPassUrl(
      user,
      input.licenseType,
    )

    return {
      pkpassUrl,
    }
  }

  @Mutation(() => GenericPkPassQrCode)
  @Audit()
  async generatePkPassQrCode(
    @CurrentUser() user: User,
    @Args('input') input: GeneratePkPassInput,
  ): Promise<GenericPkPassQrCode> {
    const pkpassQRCode = await this.licenseServiceService.generatePkPassQRCode(
      user,
      input.licenseType,
    )

    return {
      pkpassQRCode,
    }
  }

  @Scopes(ApiScope.internal, ApiScope.licensesVerify)
  @Mutation(() => GenericPkPassVerification, {
    deprecationReason:
      'Should use verifyLicenseBarcode instead of verifyPkPass',
  })
  @Directive(
    '@deprecated(reason: "Should use verifyLicenseBarcode instead of verifyPkPass")',
  )
  @Audit()
  async verifyPkPass(
    @Args('input')
    input: VerifyPkPassInput,
  ): Promise<GenericPkPassVerification> {
    return this.licenseServiceService.verifyPkPassDeprecated(input.data)
  }

  @Scopes(ApiScope.internal, ApiScope.licensesVerify)
  @Mutation(() => VerifyLicenseBarcodeResult, {
    name: 'verifyLicenseBarcode',
  })
  @Audit()
  async verifyLicenseBarcode(
    @Args('input') input: VerifyLicenseBarcodeInput,
  ): Promise<VerifyLicenseBarcodeResult> {
    return this.licenseServiceService.verifyLicenseBarcode(input.data)
  }
}
