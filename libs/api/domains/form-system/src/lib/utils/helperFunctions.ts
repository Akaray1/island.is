// import { LanguageType } from "../../models/global.model"
// import { InputSettings, ListItem } from "../../models/inputSettings.model"
import { InputUpdateDto } from "@island.is/clients/form-system"
import { Input } from "../../models/input.model";

// export interface RESTInputSettings {
//   isLarge?: boolean
//   size?: string
//   interval?: string
//   erHlekkur?: boolean
//   url?: string
//   hnapptexti?: LanguageType
//   tegundir?: string[]
//   hamarksstaerd?: number
//   erFjolval?: boolean
//   fjoldi?: number
//   header?: string
//   hamarkslengd?: number
//   lagmarkslengd?: number
//   laggildi?: number
//   hagildi?: number
//   listi?: ListItem[]
//   $type?: string
//   name?: LanguageType
//   erListi?: boolean
//   erInnslattur?: boolean
//   [key: string]: unknown
// }

// interface GraphQLInputSettings {
//   hasInput?: boolean
//   isList?: boolean
//   isLarge?: boolean
//   size?: string
//   interval?: string
//   list?: ListItem[]
//   max?: number
//   min?: number
//   maxLength?: number
//   minLength?: number
//   amount?: number
//   isMulti?: boolean
//   maxSize?: number
//   types?: string[]
//   buttonText?: LanguageType
//   hasLink?: boolean
//   $type?: string
//   name?: LanguageType
//   [key: string]: unknown
// }

// export const restToGraphqlInputSettings = (input?: RESTInputSettings): GraphQLInputSettings => {
//   return {
//     hasInput: input?.erInnslattur,
//     isList: input?.erListi,
//     isLarge: input?.isLarge,
//     size: input?.size,
//     interval: input?.interval,
//     list: input?.listi,
//     max: input?.hagildi,
//     min: input?.laggildi,
//     maxLength: input?.hamarkslengd,
//     minLength: input?.lagmarkslengd,
//     amount: input?.fjoldi,
//     isMulti: input?.erFjolval,
//     maxSize: input?.hamarksstaerd,
//     types: input?.tegundir,
//     buttonText: input?.hnapptexti,
//     hasLink: input?.erHlekkur,
//     type: input?.type,
//     name: input?.name,
//   }
// }

// export const graphqlToRestInputSettings = (input?: InputSettings): RESTInputSettings => {
//   return {
//     erInnslattur: input?.hasInput,
//     erListi: input?.isList,
//     isLarge: input?.isLarge,
//     size: input?.size,
//     interval: input?.interval,
//     listi: input?.list,
//     hagildi: input?.max,
//     laggildi: input?.min,
//     hamarkslengd: input?.maxLength,
//     lagmarkslengd: input?.minLength,
//     fjoldi: input?.amount,
//     erFjolval: input?.isMulti,
//     hamarksstaerd: input?.maxSize,
//     tegundir: input?.types,
//     hnapptexti: input?.buttonText,
//     erHlekkur: input?.hasLink,
//     type: input?.type,
//     name: input?.name,
//   }
// }

// export const addType = (input: Input | InputUpdateDto) => {
//   const types = ['TextaInnsláttur', 'Textalýsing', 'Fellilisti', 'Valhnappar', 'Skjal', 'Tölustafir', 'Fasteignanúmer', 'Klukkinnsláttur', 'Dagssetningarval']
//   const type = {
//     TextaInnsláttur: 'texti',
//     Textalýsing: 'textalysing',
//     Fellilisti: 'fellilisti',
//     Valhnappar: 'valhnappar',
//     Skjal: 'skjal',
//     Tölustafir: 'tolustafir',
//     Fasteignanúmer: 'fasteignanumer',
//     Klukkinnsláttur: 'klukkinnslattur',
//     Dagssetningarval: 'dagssetningarval',
//   }
//   if (input.type !== null && input.type !== undefined) {
//     if (types.includes(input.type)) {
//       const newInputSettings = {
//         ...input.inputSettings,
//         $type: type[input.type as keyof typeof type]
//       }
//       return {
//         ...input,
//         inputSettings: newInputSettings,
//       }
//     }
//   }
//   return input
// }
