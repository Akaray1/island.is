import { defineMessages } from 'react-intl'

export const overview = {
  general: defineMessages({
    title: {
      id: 'aosh.application:overview.general.title',
      defaultMessage: 'Yfirlit eigendaskipta',
      description: 'Title of overview screen',
    },
    description: {
      id: 'aosh.application:overview.general.description',
      defaultMessage:
        'Vinsamlegast farðu yfir gögnin hér að neðan til að staðfesta að réttar upplýsingar hafi verið gefnar upp.',
      description: 'Description of overview screen',
    },
  }),
  labels: defineMessages({
    sellersCoOwner: {
      id: 'aosh.application:overview.labels.sellersCoOwner',
      defaultMessage: 'Meðeigandi seljanda',
      description: 'Sellers co owner label',
    },
    buyersCoOwner: {
      id: 'aosh.application:overview.labels.buyersCoOwner',
      defaultMessage: 'Meðeigandi kaupanda',
      description: 'Buyers co owner label',
    },
    addCoOwnerAndOperatorButton: {
      id: 'aosh.application:overview.labels.addCoOwnerAndOperatorButton',
      defaultMessage: 'Bæta við umráðamanni',
      description: 'Add co owner and operator button',
    },
    locationTitle: {
      id: 'aosh.application:overview.labels.locationTitle',
      defaultMessage: 'Ný staðsetning tækis',
      description: 'Insurance company title',
    },
    noLocation: {
      id: 'aosh.application:overview.labels.noLocation',
      defaultMessage: 'Ekkert skráð',
      description: 'User has not chosen an insurance company',
    },
    addLocationButton: {
      id: 'aosh.application:overview.labels.addLocation',
      defaultMessage: 'Skrá staðsetningu tækis',
      description: 'Add insurance company button',
    },
    salePrice: {
      id: 'aosh.application:overview.labels.salePrice',
      defaultMessage: 'Söluverð:',
      description: 'Saleprice label',
    },
    agreementDate: {
      id: 'aosh.application:overview.labels.agreementDate',
      defaultMessage: 'Dagsetning samnings:',
      description: 'Agreement date label',
    },
  }),
  confirmationModal: defineMessages({
    title: {
      id: 'aosh.application:overview.confirmationModal.title',
      defaultMessage: 'Hafna tilkynningu',
      description: 'Confirmation modal reject title',
    },
    text: {
      id: 'aosh.application:overview.confirmationModal.text',
      defaultMessage: 'Þú ert að fara að hafna tilkynningu.',
      description: 'Confirmation modal reject text',
    },
    buttonText: {
      id: 'aosh.application:overview.confirmationModal.buttonText',
      defaultMessage: 'Hafna tilkynningu',
      description: 'Confirmation modal reject button',
    },
    cancelButton: {
      id: 'aosh.application:overview.confirmationModal.cancelButton',
      defaultMessage: 'Hætta við',
      description: 'Confirmation modal cancel button',
    },
  }),
}
