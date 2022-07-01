import { defineMessages } from 'react-intl'

export const m = defineMessages({
  /* Intro section */
  introTitle: {
    id: 'pa.application:intro.title',
    defaultMessage: 'Inngangur',
    description: 'Some description',
  },
  introSectionTitle: {
    id: 'pa.application:introSection.title',
    defaultMessage: 'Vegabréf',
    description: 'Some description',
  },
  introSectionDescription: {
    id: 'pa.application:intro.introSection.description#markdown',
    defaultMessage: `Í þessari umsókn getur þú sótt um vegabréf fyrir þig eða einstaklinga í þinni forsjá. Eftir þetta ferli þarf að mæta í myndatöku hjá næsta sýslumanni til þess að vegabréfið geti farið í framleiðslu. Þegar vegabréfið er tilbúið þá getur þú sótt það hjá því sýslumannsembætti sem hentar þér best.\\n\\n Umsókn um nýtt vegabréf kostar 13.000 kr. fyrir 18 ára og eldri og 5.600 kr. fyrir börn, aldraða og öryrkja og greiðist í lok þessa ferlis. Athugið að endurtaka þarf þetta ferli fyrir hvern einstakling sem þarf á nýju vegabréfi að halda.\\n\\n Þetta ferli vistast sjálfkrafa á Mínar síður á Ísland.is. Þar getur þú einnig fylgst með stöðu umsóknar eftir að öll gögn hafa verið send inn.`,
    description: 'Some description',
  },
  introSectionInfoMessage: {
    id: 'pa.application:introSection.message#markdown',
    defaultMessage: `Ef vegabréfi hefur verið glatað þarftu fyrst að tilkynna það áður en sótt er um nýtt.\\n\\n [Smelltu hér til að tilkynna glatað vegabréf.](https://island.is/stolidtynt-vegabref).`,
    description: 'Some description',
  },

  /* Data collection section */
  dataCollectionTitle: {
    id: 'pa.application:dataCollection.title',
    defaultMessage: 'Gagnaöflun',
    description: 'Some description',
  },
  dataCollectionSubtitle: {
    id: 'pa.application:dataCollection.subtitle',
    defaultMessage: 'Eftirfarandi gögn verða sótt rafrænt',
    description: 'Some description',
  },
  dataCollectionCheckboxLabel: {
    id: 'pa.application:dataCollection.checkboxLabel',
    defaultMessage: 'Ég skil að ofangreind gögn verði sótt rafrænt',
    description: 'Some description',
  },
  dataCollectionDistrictCommissionersTitle: {
    id: 'pa.application:dataCollection.districtCommissionersTitle',
    defaultMessage: 'Persónuupplýsingar úr Sýslumenn',
    description: 'Some description',
  },
  dataCollectionDistrictCommissionersSubitle: {
    id: 'pa.application:dataCollection.districtCommissionersSubitle',
    defaultMessage:
      'Til þess að auðvelda fyrir sækjum við persónuupplýsingar úr Sýslumenn til þess að fylla út umsóknina.',
    description: 'Some description',
  },
  dataCollectionNationalRegistryTitle: {
    id: 'pa.application:dataCollection.nationalRegistryTitle',
    defaultMessage: 'Persónuupplýsingar',
    description: 'Some description',
  },
  dataCollectionNationalRegistrySubtitle: {
    id: 'pa.application:dataCollection.nationalRegistrySubtitle',
    defaultMessage:
      'Upplýsingar frá Þjóðskrá um fæðingardag, heimilisfang, fjölskylduhagi og hjúskaparstöðu.',
    description: 'Some description',
  },
  dataCollectionUserProfileTitle: {
    id: 'cr.application:dataCollection.userProfileTitle',
    defaultMessage: 'Netfang og símanúmer',
    description: 'Some description',
  },
  dataCollectionUserProfileSubtitle: {
    id: 'pa.application:dataCollection.userProfileSubtitle',
    defaultMessage:
      'Upplýsingar frá Mínum síðum á Ísland.is um netfang og símanúmer.',
    description: 'Some description',
  },
  dataCollectionIdentityDocumentTitle: {
    id: 'cr.application:dataCollection.identityDocumentTitle',
    defaultMessage: 'Skilríkjaskrá',
    description: 'Identity document provider title',
  },
  dataCollectionIdentityDocumentSubtitle: {
    id: 'pa.application:dataCollection.identityDocumentSubtitle',
    defaultMessage:
      'Uppfletting í skilríkjaskrá hjá Þjóðskrá um einstaklinga úr þinni forsjá.',
    description: 'Identity document provider subtitle',
  },

  /* Select passport section */
  selectPassportSectionTitle: {
    id: 'pa.application:selectPassport.title',
    defaultMessage: 'Vegabréfin þín',
    description: 'Some description',
  },
  selectPassportSectionDescription: {
    id: 'pa.application:selectPassport.description',
    defaultMessage:
      'Þú getur sótt um nýtt vegabréf fyrir þig og eftirfarandi einstaklinga í þinni umsjón. Veldu þann einstakling sem þú vilt hefja umsókn fyrir og haltu síðan áfram í næsta skref.',
    description: 'Some description',
  },
  passportNumber: {
    id: 'pa.application:selectPassport.passportNumber',
    defaultMessage: 'Vegabréfsnúmer: ',
    description: 'Some description',
  },
  validTag: {
    id: 'pa.application:selectPassport.validTag',
    defaultMessage: 'Í gildi til ',
    description: 'Some description',
  },
  noPassport: {
    id: 'pa.application:selectPassport.noPassport',
    defaultMessage: 'Vegabréf ekki til',
    description: 'Some description',
  },
  expiredTag: {
    id: 'pa.application:selectPassport.expiredTag',
    defaultMessage: 'Útrunnið',
    description: 'Some description',
  },
  orderedTag: {
    id: 'pa.application:selectPassport.orderedTag',
    defaultMessage: 'Í pöntun',
    description: 'Some description',
  },
  children: {
    id: 'pa.application:selectPassport.childrenHeader',
    defaultMessage: 'Börn',
    description: 'Some description',
  },

  /* Information Section */
  formName: {
    id: 'pa.application:form.name',
    defaultMessage: 'Umsókn um vegabréf',
    description: 'Some description',
  },
  infoTitle: {
    id: 'pa.application:personalInfo.infoTitle',
    defaultMessage: 'Upplýsingar',
    description: 'Some description',
  },
  personalInfoSubtitle: {
    id: 'pa.application:personalInfo.personalInfoSubtitle',
    defaultMessage:
      'Vinsamlegast farðu yfir þínar upplýsingar og gakktu úr skugga um að þær séu réttar.',
    description: 'Some description',
  },
  name: {
    id: 'pa.application:personalInfo.name',
    defaultMessage: 'Nafn',
    description: 'Some description',
  },
  nationalId: {
    id: 'pa.application:personalInfo.nationalId',
    defaultMessage: 'Kennitala',
    description: 'Some description',
  },
  phoneNumber: {
    id: 'pa.application:personalInfo.phoneNumber',
    defaultMessage: 'Símanúmer',
    description: 'Some description',
  },
  email: {
    id: 'pa.application:personalInfo.email',
    defaultMessage: 'Netfang',
    description: 'Some description',
  },
  hasDisabilityDiscount: {
    id: 'pa.application:personalInfo.hasDisabilityDiscount',
    defaultMessage:
      'Ég vil láta fletta mér upp í öryrkjaskrá hjá Tryggingastofnun fyrir lægra gjald á vegabréfi',
    description: 'Some description',
  },

  /* Service and delivery section */
  serviceTitle: {
    id: 'pa.application:service.title',
    defaultMessage: 'Gjaldskrá',
    description: 'Some description',
  },
  serviceTypeTitle: {
    id: 'pa.application:service.type.title',
    defaultMessage: 'Afhendingarmáti',
    description: 'Some description',
  },
  serviceTypeDescription: {
    id: 'pa.application:service.type.description',
    defaultMessage: 'Veldu þann afgreiðslumáta sem hentar þér best.',
    description: 'Some description',
  },
  serviceTypeRegular: {
    id: 'pa.application:service.type.regular',
    defaultMessage: 'Almenn afhending',
    description: 'Some description',
  },
  serviceTypeRegularSublabel: {
    id: 'pa.application:service.regular.sublabel',
    defaultMessage: 'Innan 10 virkra daga frá myndatöku',
    description: 'Some description',
  },
  serviceTypeRegularPrice: {
    id: 'pa.application:service.type.regular.price',
    defaultMessage: '13.000 kr.',
    description: 'Some description',
  },
  serviceTypeRegularPriceWithDiscount: {
    id: 'pa.application:service.type.regular.price.withDiscount',
    defaultMessage: '5.600kr',
    description: 'Some description',
  },
  serviceTypeExpress: {
    id: 'pa.application:service.type.express',
    defaultMessage: 'Hraðafhending',
    description: 'Some description',
  },
  serviceTypeExpressSublabel: {
    id: 'pa.application:service.express.sublabel',
    defaultMessage: 'Innan 2 virkra daga frá myndatöku',
    description: 'Some description',
  },
  serviceTypeExpressPrice: {
    id: 'pa.application:service.type.express.price',
    defaultMessage: '26.000 kr.',
    description: 'Some description',
  },
  serviceTypeExpressPriceWithDiscount: {
    id: 'pa.application:service.type.express.price.withDiscount',
    defaultMessage: '11.000 kr.',
    description: 'Some description',
  },
  dropLocation: {
    id: 'pa.application:service.dropLocation',
    defaultMessage: 'Afhendingarstaður',
    description: 'Some description',
  },
  dropLocationDescription: {
    id: 'pa.application:service.dropLocation.description',
    defaultMessage:
      'Fljótlegast er að sækja vegabréf hjá Þjóðskrá Íslands í Borgartúni 21, 105 Reykjavík. Á öðrum afhendingarstöðum getur afhending tekið allt að 6 - 10 daga.',
    description: 'Some description',
  },
  dropLocationPlaceholder: {
    id: 'pa.application:service.dropLocation.placeholder',
    defaultMessage: 'Veldu afhendingarstað',
    description: 'Some description',
  },

  /* Overview Section */
  overview: {
    id: 'pa.application:overview.title',
    defaultMessage: 'Yfirlit',
    description: 'Some description',
  },
  overviewSectionTitle: {
    id: 'pa.application:overviewSection.title',
    defaultMessage: 'Yfirlit yfir umsókn',
    description: 'Some description',
  },
  overviewDescription: {
    id: 'pa.application:overview.description',
    defaultMessage:
      'Endilega lestu yfir til að vera viss um að réttar upplýsingar hafi verið gefnar.',
    description: 'Some description',
  },
  currentPassportStatus: {
    id: 'pa.application:overview.currentPassport',
    defaultMessage: 'Staða núverandi vegabréfs',
    description: 'Some description',
  },
  currentPassportExpiration: {
    id: 'pa.application:overview.currentPassport.expiration',
    defaultMessage: 'Í gildi til',
    description: 'Some description',
  },
  authenticationType: {
    id: 'pa.application:overview.authenticationType',
    defaultMessage: 'Tegund skilríkja',
    description: 'Some description',
  },
  willBringPassport: {
    id: 'pa.application:overview.willBringPassport',
    defaultMessage: 'Ég mun mæta með núverandi vegabréf í myndatökuna.',
    description: 'Some description',
  },
  proceedToPayment: {
    id: 'pa.application:payment.proceedToPayment',
    defaultMessage: 'Greiða',
    description: 'Some description',
  },

  /* Payment Section */
  paymentSection: {
    id: 'pa.application:payment.section',
    defaultMessage: 'Staðfesting og greiðsla',
    description: 'Some description',
  },
  paymentSectionTitle: {
    id: 'pa.application:payment.section.title',
    defaultMessage: 'Greiðsla',
    description: 'Some description',
  },
  payment: {
    id: 'pa.application:payment',
    defaultMessage: 'Ganga frá greiðslu',
    description: 'Some description',
  },
  confirm: {
    id: 'pa.application:confirm',
    defaultMessage: 'Staðfesta',
    description: 'Some description',
  },
  errorDataProvider: {
    id: 'pa.application:error.dataProvider',
    defaultMessage: 'Úps! Eitthvað fór úrskeiðis við að sækja gögnin',
    description: 'Oops! Something went wrong when fetching your data',
  },

  /* Waiting For Confirmation Section */
  waitingForConfirmationTitle: {
    id: 'pa.application:waitingForConfirmation.title',
    defaultMessage: 'Title',
    description: 'Some description',
  },
  waitingForConfirmationDescription: {
    id: 'pa.application:waitingForConfirmation.description',
    defaultMessage: 'Description',
    description: 'Some description',
  },

  /* ParentB Intro Section */
  parentBIntro: {
    id: 'pa.application:parentBIntro',
    defaultMessage: 'sendi inn umsókn um vegabréf',
    description: 'Some description',
  },
  parentBIntroPart2: {
    id: 'pa.application:parentBIntro.part2',
    defaultMessage:
      'Til þess að halda áfram með ferlið þurfa bæði forráðamenn að senda frá sér persónuupplýsingar til samþykktar af sýslumanni.',
    description: 'Some description',
  },

  /* Done Section */
  applicationCompleteTitle: {
    id: 'pa.application:complete.title',
    defaultMessage: 'Til greiðslu',
    description: 'Some description',
  },
  applicationCompletePassport: {
    id: 'pa.application:complete.passport',
    defaultMessage: 'Vegabréf',
    description: 'Some description',
  },
  applicationCompleteTotal: {
    id: 'pa.application:complete.total',
    defaultMessage: 'Samtals',
    description: 'Some description',
  },
  applicationComplete: {
    id: 'pa.application:complete',
    defaultMessage: 'Umsókn staðfest',
    description: 'Some description',
  },
  applicationCompleteDescription: {
    id: 'pa.application:complete.description',
    defaultMessage: 'Einhver texti hérna sem segir eitthvað um eitthvað.',
    description: 'Some description',
  },
  applicationCompleteNumber: {
    id: 'pa.application:complete.number',
    defaultMessage: 'Númer umsóknar',
    description: 'Some description',
  },
  applicationCompleteNextSteps: {
    id: 'pa.application:complete.nextSteps',
    defaultMessage: 'Næstu skref',
    description: 'Some description',
  },
  applicationCompleteNextStepsDescription: {
    id: 'pa.application:complete.nextSteps.description#markdown',
    defaultMessage: `* Fara í myndatöku á næsta afgreiðslustað sýslumanns.\\n\\n * Þú færð senda tilkynningu á Mínar síður þegar vegabréfið er tilbúið og hægt er að sækja það á þann afhendingarstað sem þú valdir.`,
    description: 'Some description',
  },
})
