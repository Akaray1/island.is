/**
 * Organization slug is used in the enhanced fetch middleware to identify the API.
 * The slug matches the icelandic slug in the organization content type in Contentful.
 *
 * @note Be sure to keep sync between this type and the english slug in the organization content type in Contentful.
 */
export type OrganizationSlugType =
  | 'haskoli-islands'
  | 'haskolinn-a-akureyri'
  | 'holaskoli-haskolinn-a-holum'
  | 'bifrost'
  | 'landbunadarhaskoli-islands'
  | 'lhi'
  | 'vinnueftirlitid'
  | 'thjodskra'
  | 'stafraent-island'
  | 'samgongustofa'
  | 'hms'
  | 'fjarsysla-rikisins'
  | 'stjornarrad-islands'
  | 'rikislogreglustjori'
  | 'personuvernd'
  | 'tryggingastofnun'
  | 'sjukratryggingar'
  | 'thjodskra-islands'
  | 'fiskistofa'
  | 'domstolasyslan'
  | 'samband-islenskra-sveitafelaga'
  | 'skatturinn'
  | 'syslumenn'
  | 'syslumadurinn-a-austurlandi'
  | 'syslumadurinn-a-hoefudborgarsvaedinu'
  | 'syslumadurinn-a-vestfjordum'
  | 'syslumadurinn-i-vestmannaeyjum'
  | 'syslumadurinn-a-sudurnesjum'
  | 'syslumadurinn-a-sudurlandi'
  | 'syslumadurinn-a-nordurlandi-eystra'
  | 'syslumadurinn-a-nordurlandi-vestra'
  | 'syslumadurinn-a-vesturlandi'
  | 'domsmalaraduneytid'
  | 'utlendingastofnun'
  | 'urvinnslusjodur'
  | 'menntamalastofnun'
  | 'umhverfisstofnun'
  | 'vegagerdin'
  | 'landlaeknir'
  | 'hugverkastofan'
