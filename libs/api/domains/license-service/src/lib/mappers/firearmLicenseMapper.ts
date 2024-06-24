import {
  FirearmCategories,
  FirearmProperty,
} from '@island.is/clients/firearm-license'
import isAfter from 'date-fns/isAfter'
import { Locale } from '@island.is/shared/types'
import {
  DEFAULT_LICENSE_ID,
  LICENSE_NAMESPACE,
} from '../licenseService.constants'
import {
  GenericLicenseDataField,
  GenericLicenseDataFieldType,
  GenericLicenseMappedPayloadResponse,
  GenericLicenseMapper,
} from '../licenceService.type'
import { FirearmLicenseDto } from '@island.is/clients/license-client'
import { Injectable } from '@nestjs/common'
import { isDefined } from '@island.is/shared/utils'
import { FormatMessage, IntlService } from '@island.is/cms-translations'
import { m } from '../messages'
import { expiryTag } from '../utils/expiryTag'
import { dateFormat } from '@island.is/shared/constants'
import format from 'date-fns/format'

@Injectable()
export class FirearmLicensePayloadMapper implements GenericLicenseMapper {
  constructor(private readonly intlService: IntlService) {}
  async parsePayload(
    payload: Array<unknown>,
    locale: Locale = 'is',
  ): Promise<Array<GenericLicenseMappedPayloadResponse>> {
    if (!payload) return Promise.resolve([])

    const typedPayload = payload as Array<FirearmLicenseDto>

    const { formatMessage } = await this.intlService.useIntl(
      [LICENSE_NAMESPACE],
      locale,
    )
    const mappedPayload: Array<GenericLicenseMappedPayloadResponse> =
      typedPayload
        .map((t) => {
          const { licenseInfo, properties, categories } = t

          if (!licenseInfo) return null

          const data: Array<GenericLicenseDataField> = [
            licenseInfo.licenseNumber
              ? {
                  name: formatMessage(m.basicInfoLicense),
                  type: GenericLicenseDataFieldType.Value,
                  label: formatMessage(m.licenseNumber),
                  value: licenseInfo.licenseNumber,
                }
              : null,
            licenseInfo.name
              ? {
                  type: GenericLicenseDataFieldType.Value,
                  label: formatMessage(m.fullName),
                  value: licenseInfo.name,
                }
              : null,
            licenseInfo.issueDate
              ? {
                  type: GenericLicenseDataFieldType.Value,
                  label: formatMessage(m.publishedDate),
                  value: licenseInfo.issueDate ?? '',
                }
              : null,
            licenseInfo.expirationDate
              ? {
                  type: GenericLicenseDataFieldType.Value,
                  label: formatMessage(m.validTo),
                  value: licenseInfo.expirationDate ?? '',
                }
              : null,
            licenseInfo.collectorLicenseExpirationDate
              ? {
                  type: GenericLicenseDataFieldType.Value,
                  label: formatMessage(m.collectorLicenseValidTo),
                  value: licenseInfo.collectorLicenseExpirationDate ?? '',
                }
              : null,

            licenseInfo.qualifications
              ? this.parseQualifications(
                  licenseInfo.qualifications,
                  categories ?? undefined,
                  formatMessage,
                )
              : null,
            properties
              ? {
                  type: GenericLicenseDataFieldType.Group,
                  hideFromServicePortal: true,
                  label: formatMessage(m.firearmProperties),
                  fields: (properties.properties ?? []).map((property) => ({
                    type: GenericLicenseDataFieldType.Category,
                    fields: this.parseProperties(
                      property,
                      formatMessage,
                    )?.filter(isDefined),
                  })),
                }
              : null,
            properties
              ? {
                  type: GenericLicenseDataFieldType.Table,
                  label: formatMessage(m.firearmProperties),
                  fields: (properties.properties ?? []).map((property) => ({
                    type: GenericLicenseDataFieldType.Category,
                    fields: this.parseProperties(
                      property,
                      formatMessage,
                    )?.filter(isDefined),
                  })),
                }
              : null,
          ].filter(isDefined)

          const isExpired = licenseInfo?.expirationDate
            ? !isAfter(new Date(licenseInfo.expirationDate), new Date())
            : undefined

          return {
            licenseName: formatMessage(m.firearmLicense),
            type: 'user' as const,
            payload: {
              data,
              rawData: JSON.stringify(t),
              name: formatMessage(m.firearmLicense),
              metadata: {
                licenseNumber: t.licenseInfo?.licenseNumber?.toString() ?? '',
                subtitle: formatMessage(m.licenseNumberVariant, {
                  arg:
                    t.licenseInfo?.licenseNumber?.toString() ??
                    formatMessage(m.unknown),
                }),
                licenseId: DEFAULT_LICENSE_ID,
                expired: isExpired,
                expireDate: t.licenseInfo?.expirationDate ?? undefined,
                displayTag:
                  isExpired !== undefined && t.licenseInfo?.expirationDate
                    ? expiryTag(
                        formatMessage,
                        isExpired,
                        formatMessage(m.validUntil, {
                          arg: format(
                            new Date(t.licenseInfo.expirationDate),
                            dateFormat.is,
                          ),
                        }),
                      )
                    : undefined,
                links: [
                  {
                    label: formatMessage(m.renewLicense, {
                      arg: formatMessage(m.firearmLicense).toLowerCase(),
                    }),
                    value: 'https://island.is/skotvopnaleyfi',
                  },
                ],
                title: formatMessage(m.yourFirearmLicense),
                description: [
                  { text: formatMessage(m.yourFirearmLicenseDescription) },
                ],
              },
            },
          }
        })
        .filter(isDefined)
    return mappedPayload
  }

  private parseQualifications = (
    qualifications: string,
    categories?: FirearmCategories,
    formatMessage?: FormatMessage,
  ): GenericLicenseDataField | null => {
    if (!categories || !formatMessage) {
      return null
    }

    return {
      type: GenericLicenseDataFieldType.Group,
      label: formatMessage(m.classesOfRights),
      fields: qualifications.split('').map((qualification) => ({
        type: GenericLicenseDataFieldType.Category,
        name: qualification,
        label:
          categories?.[`${formatMessage(m.category)} ${qualification} `] ?? '',
        description:
          categories?.[`${formatMessage(m.category)} ${qualification} `] ?? '',
      })),
    }
  }

  private parseProperties = (
    property?: FirearmProperty,
    formatMessage?: FormatMessage,
  ): Array<GenericLicenseDataField> | null => {
    if (!property || !formatMessage) return null

    const mappedProperty = [
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.firearmStatus),
        value: property.category ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.type),
        value: property.typeOfFirearm ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.name),
        value: property.name ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.number),
        value: property.serialNumber ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.countryNumber),
        value: property.landsnumer ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.caliber),
        value: property.caliber ?? '',
      },
      {
        type: GenericLicenseDataFieldType.Value,
        label: formatMessage(m.limitations),
        value: property.limitation ?? '',
      },
    ]
    return mappedProperty
  }
}
