import {
  CustomersApi,
  CustomersArchiveRequest,
  CustomersBatchArchiveRequest,
  CustomersBatchBookmarkRequest,
  CustomersBatchReadDocumentsRequest,
  CustomersBookmarkRequest,
  CustomersCategoriesRequest,
  CustomersDocumentRequest,
  CustomersListDocumentsRequest,
  CustomersMessageTypesRequest,
  CustomersSendersRequest,
  CustomersUnarchiveRequest,
  CustomersUnbookmarkRequest,
  CustomersUpdatePaperMailPreferenceRequest,
  CustomersWantsPaperMailRequest,
} from '../../gen/fetch'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DocumentsClientV2Service {
  constructor(private api: CustomersApi) {}

  getDocumentList(input: CustomersListDocumentsRequest) {
    return this.api.customersListDocuments(input)
  }

  getCustomersDocument(input: CustomersDocumentRequest) {
    return this.api.customersDocument(input)
  }
  getCustomersCategories(input: CustomersCategoriesRequest) {
    return this.api.customersCategories(input)
  }
  getCustomersTypes(input: CustomersMessageTypesRequest) {
    return this.api.customersMessageTypes(input)
  }
  getCustomersSenders(input: CustomersSendersRequest) {
    return this.api.customersSenders(input)
  }
  requestPaperMail(input: CustomersWantsPaperMailRequest) {
    return this.api.customersWantsPaperMail(input)
  }
  updatePaperMailPreferance(body: CustomersUpdatePaperMailPreferenceRequest) {
    return this.api.customersUpdatePaperMailPreference(body)
  }
  archiveMail(body: CustomersArchiveRequest) {
    return this.api.customersArchive(body)
  }
  unArchiveMail(body: CustomersUnarchiveRequest) {
    return this.api.customersUnarchive(body)
  }
  bookmarkMail(body: CustomersBookmarkRequest) {
    return this.api.customersBookmark(body)
  }
  unbookmarkMail(body: CustomersUnbookmarkRequest) {
    return this.api.customersUnbookmark(body)
  }
  batchArchiveMail(body: CustomersBatchArchiveRequest) {
    return this.api.customersBatchArchive(body)
  }
  batchBookmarkMail(body: CustomersBatchBookmarkRequest) {
    return this.api.customersBatchBookmark(body)
  }
  batchReadMail(body: CustomersBatchReadDocumentsRequest) {
    return this.api.customersBatchReadDocuments(body)
  }
}
