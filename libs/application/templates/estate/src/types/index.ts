export enum DataProviderTypes {
  NationalRegistry = 'NationalRegistryProvider',
}

export interface Address {
  streetAddress: string
  postalCode: string
  city: string
}

export interface Person {
  nationalId: string
  fullName: string
  address: Address
}

export interface Child {
  nationalId: string
  livesWithApplicant: boolean
  livesWithBothParents: boolean
  fullName: string
  otherParent: Person
  custodyParents?: string[]
}

export interface NationalRegistry extends Person {
  children: Child[]
}
