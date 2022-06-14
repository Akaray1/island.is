import request from 'supertest'
import { INestApplication } from '@nestjs/common'

import { EmailService } from '@island.is/email-service'
import { IdsUserGuard, MockAuthGuard } from '@island.is/auth-nest-tools'
import { ApplicationScope } from '@island.is/auth/scopes'
import {
  ApplicationStatus,
  ApplicationTypes,
} from '@island.is/application/core'
import { ContentfulRepository } from '@island.is/cms'
import { setup } from '../../../../../test/setup'
import { environment } from '../../../../environments'
import { FileService } from '../files/file.service'
import { AppModule } from '../../../app.module'
import { FeatureFlagService } from '@island.is/nest/feature-flags'
import { MockFeatureFlagService } from './mockFeatureFlagService'
import * as uuid from 'uuidv4'
import jwt from 'jsonwebtoken'

let app: INestApplication

const sendMail = () => ({
  messageId: 'some id',
})

class MockEmailService {
  getTransport() {
    return { sendMail }
  }

  sendEmail() {
    return sendMail()
  }
}

class MockContentfulRepository {
  async getLocalizedEntries() {
    return {
      items: [
        {
          fields: [
            {
              fields: {
                strings: {
                  en: {},
                  'is-IS': {},
                },
              },
            },
          ],
        },
      ],
    }
  }
}

let server: request.SuperTest<request.Test>
// eslint-disable-next-line local-rules/disallow-kennitalas
const nationalId = '1234564321'
const mockAuthGuard = new MockAuthGuard({
  nationalId,
  scope: [ApplicationScope.read, ApplicationScope.write],
})

beforeAll(async () => {
  app = await setup(AppModule, {
    override: (builder) =>
      builder
        .overrideProvider(ContentfulRepository)
        .useClass(MockContentfulRepository)
        .overrideProvider(FeatureFlagService)
        .useClass(MockFeatureFlagService)
        .overrideProvider(EmailService)
        .useClass(MockEmailService)
        .overrideGuard(IdsUserGuard)
        .useValue(mockAuthGuard),
  })

  server = request(app.getHttpServer())
})

describe('Application system API', () => {
  it(`POST /application should register application`, async () => {
    // Act
    const response = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    // Assert
    expect(response.body.id).toBeTruthy()
  })

  // This template does not have readyForProduction: false
  it.skip('should fail when POST-ing an application whose template is not ready for production, on production environment', async () => {
    const envBefore = environment.environment
    environment.environment = 'production'

    const failedResponse = await server
      .post('/applications')
      .send({
        applicant: nationalId,
        state: 'draft',
        attachments: {},
        typeId: ApplicationTypes.EXAMPLE,
        assignees: [nationalId],
        answers: {
          careerHistoryCompanies: ['government'],
          dreamJob: 'pilot',
        },
        status: ApplicationStatus.IN_PROGRESS,
      })
      .expect(400)

    expect(failedResponse.body.message).toBe(
      'Template ExampleForm is not ready for production',
    )

    environment.environment = envBefore
  })

  it('should fail when PUT-ing answers on an application which dont comply the dataschema', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['government'],
          dreamJob: 'pilot',
        },
      })
      .expect(200)

    const putResponse = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['this', 'is', 'not', 'allowed'],
        },
      })
      .expect(400)

    // Assert
    expect(putResponse.body).toMatchInlineSnapshot(`
      Object {
        "detail": "Found issues in these fields: careerHistoryCompanies",
        "fields": Object {
          "careerHistoryCompanies": Array [
            "Ógilt gildi",
            "Ógilt gildi",
            "Ógilt gildi",
            "Ógilt gildi",
          ],
        },
        "status": 400,
        "title": "Validation Failed",
        "type": "https://docs.devland.is/reference/problems/validation-failed",
      }
    `)
  })

  it('should fail when PUT-ing answers on an application where it is in a state where it is not permitted', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['government'],
          dreamJob: 'pilot',
        },
      })
      .expect(200)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const newStateResponse = await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(newStateResponse.body.state).toBe('inReview')

    const failedResponse = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          dreamJob: 'firefighter',
        },
      })
      .expect(403)

    expect(failedResponse.body.detail).toBe(
      'Current user is not permitted to update the following answers: dreamJob',
    )
  })

  it('should be able to PUT answers when updating the state of the application', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['government'],
          dreamJob: 'pilot',
        },
      })
      .expect(200)

    const newStateResponse = await server
      .put(`/applications/${response.body.id}/submit`)
      .send({
        event: 'SUBMIT',
        answers: {
          careerHistoryCompanies: ['advania', 'aranja'],
        },
      })
      .expect(200)

    expect(newStateResponse.body.state).toBe('inReview')
    expect(newStateResponse.body.answers).toEqual({
      careerHistoryCompanies: ['advania', 'aranja'],
      dreamJob: 'pilot',
    })
  })

  it('should not update non-writable answers when PUT-ing answers while updating the state', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['government'],
          dreamJob: 'pilot',
        },
      })
      .expect(200)

    await server
      .put(`/applications/${response.body.id}/submit`)
      .send({
        event: 'SUBMIT',
      })
      .expect(200)

    const finalStateResponse = await server
      .put(`/applications/${response.body.id}/submit`)
      .send({
        event: 'APPROVE',
        answers: {
          careerHistoryCompanies: ['government', 'aranja', 'advania'],
          dreamJob: 'firefighter',
        },
      })
      .expect(200)

    expect(finalStateResponse.body.state).toBe('approved')
    expect(finalStateResponse.body.answers).toEqual({
      careerHistoryCompanies: ['government', 'aranja', 'advania'],
      dreamJob: 'pilot', // this answer is non-writable
    })
  })

  it('should fail when PUT-ing anything else than answers', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        applicant: '1111',
        assignees: ['1234'],
        attachments: {
          someAttachment: 'asdf',
        },
      })
      .expect(400)

    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "detail": Array [
          "property applicant should not exist",
          "property assignees should not exist",
          "property attachments should not exist",
        ],
        "status": 400,
        "title": "Bad Request",
        "type": "https://httpstatuses.com/400",
      }
    `)
  })

  it('should fail when PUT-ing externalData on an application where it is in a state where it is not permitted', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          careerHistoryCompanies: ['government'],
        },
      })
      .expect(200)

    const newStateResponse = await server
      .put(`/applications/${response.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(newStateResponse.body.state).toBe('inReview')

    const failedResponse = await server
      .put(`/applications/${response.body.id}/externalData`)
      .send({
        dataProviders: [{ id: 'test', type: 'ExampleSucceeds' }],
      })
      .expect(400)

    expect(failedResponse.body.detail).toBe(
      'Current user is not permitted to update external data in this state: inReview',
    )
  })

  it('should fail when PUT-ing an application that does not exist', async () => {
    const response = await server
      .put('/applications/98e83b8a-fd75-44b5-a922-0f76c99bdcae')
      .send({
        answers: {
          usage: 4,
        },
      })
      .expect(404)

    // Assert
    expect(response.body).toMatchObject({
      title: 'Not Found',
      detail:
        'An application with the id 98e83b8a-fd75-44b5-a922-0f76c99bdcae does not exist',
    })
  })

  it('should successfully PUT answers to an existing application if said answers comply to the schema', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          usage: 4,
        },
      })
    expect(response.body.answers.usage).toBe(4)
    expect(response.body.answers.spread).toBe(undefined)

    const { id } = response.body
    const putResponse = await server
      .put(`/applications/${id}`)
      .send({
        answers: {
          usage: 1,
          spread: 22,
        },
      })
      .expect(200)

    // Assert
    expect(putResponse.body.answers.usage).toBe(1)
    expect(putResponse.body.answers.spread).toBe(22)
  })

  it('PUT /applications/:id should not be able to overwrite external data', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    const response = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers: {
          usage: 4,
        },
      })

    const { id } = response.body
    const putResponse = await server
      .put(`/applications/${id}`)
      .send({
        externalData: {
          test: { asdf: 'asdf' },
        },
      })
      .expect(400)

    // Assert
    expect(putResponse.body.title).toBe('Bad Request')
  })

  it('GET /users/:nationalId/applications should not return applications that are in an unlisted state', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    const getResponse = await server
      .get(`/users/${nationalId}/applications`)
      .expect(200)

    expect(getResponse.body).toEqual([])

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const updatedGetResponse = await server
      .get(`/users/${nationalId}/applications`)
      .expect(200)

    expect(updatedGetResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          applicant: nationalId,
          typeId: ApplicationTypes.EXAMPLE,
        }),
      ]),
    )
  })

  it('GET /users/:nationalId/applications should return a list of applications of the user', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    await server.put(`/applications/${creationResponse.body.id}`).send({
      answers: {
        usage: 4,
      },
    })

    const getResponse = await server
      .get(`/users/${nationalId}/applications`)
      .expect(200)

    // Assert
    expect(getResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ applicant: nationalId }),
      ]),
    )
  })

  it(`GET /users/:nationalId/applications?typeId=ParentalLeave should return the list of applications of the user by typeId`, async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const getResponse = await server
      .get(
        `/users/${nationalId}/applications?typeId=${ApplicationTypes.PARENTAL_LEAVE}`,
      )
      .expect(200)

    // Assert
    expect(getResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          applicant: nationalId,
          typeId: ApplicationTypes.PARENTAL_LEAVE,
        }),
      ]),
    )
  })

  it('GET /users/:nationalId/applications?typeId=ParentalLeave&status=inprogress should return the list of applications of the user by typeId and status', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const getResponse = await server
      .get(
        `/users/${nationalId}/applications?typeId=${ApplicationTypes.PARENTAL_LEAVE}&status=${ApplicationStatus.IN_PROGRESS}`,
      )
      .expect(200)

    // Assert
    expect(getResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          applicant: nationalId,
          typeId: ApplicationTypes.PARENTAL_LEAVE,
          status: ApplicationStatus.IN_PROGRESS,
        }),
      ]),
    )
  })

  it('PUT /applications/:id/generatePdf should return a presigned url', async () => {
    const expectPresignedUrl = 'presignedurl'
    const type = 'ChildrenResidenceChange'

    const fileService: FileService = app.get<FileService>(FileService)
    jest
      .spyOn(fileService, 'generatePdf')
      .mockImplementation(() => Promise.resolve(expectPresignedUrl))

    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.CHILDREN_RESIDENCE_CHANGE,
      })
      .expect(201)

    const res = await server
      .put(`/applications/${creationResponse.body.id}/generatePdf`)
      .send({
        type: type,
      })
      .expect(200)

    // Assert
    expect(res.body).toEqual({ url: 'presignedurl' })
  })

  it('PUT /applications/:id/requestFileSignature should return a documentToken and controlCode', async () => {
    const expectedControlCode = '0000'
    const expectedDocumentToken = 'token'
    const type = 'ChildrenResidenceChange'

    const fileService: FileService = app.get<FileService>(FileService)
    jest.spyOn(fileService, 'requestFileSignature').mockImplementation(() =>
      Promise.resolve({
        controlCode: expectedControlCode,
        documentToken: expectedDocumentToken,
      }),
    )

    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.CHILDREN_RESIDENCE_CHANGE,
      })
      .expect(201)

    const res = await server
      .put(`/applications/${creationResponse.body.id}/requestFileSignature`)
      .send({
        type: type,
      })
      .expect(200)

    // Assert
    expect(res.body).toEqual({
      controlCode: expectedControlCode,
      documentToken: expectedDocumentToken,
    })
  })

  it('GET /applications/:id/presignedUrl should return a presigned url', async () => {
    const expectedPresignedUrl = 'presignedurl'
    const type = 'ChildrenResidenceChange'

    const fileService: FileService = app.get<FileService>(FileService)
    jest
      .spyOn(fileService, 'getPresignedUrl')
      .mockImplementation(() => Promise.resolve(expectedPresignedUrl))

    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.CHILDREN_RESIDENCE_CHANGE,
      })
      .expect(201)

    const res = await server
      .get(`/applications/${creationResponse.body.id}/${type}/presignedUrl`)
      .send({
        type: type,
      })
      .expect(200)

    // Assert
    expect(res.body).toEqual({ url: expectedPresignedUrl })
  })

  it('PUT /applications/:id/uploadSignedFile should return that document has been signed', async () => {
    const type = 'ChildrenResidenceChange'
    const fileService: FileService = app.get<FileService>(FileService)
    jest
      .spyOn(fileService, 'uploadSignedFile')
      .mockImplementation(() => Promise.resolve())

    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.CHILDREN_RESIDENCE_CHANGE,
      })
      .expect(201)

    const res = await server
      .put(`/applications/${creationResponse.body.id}/uploadSignedFile`)
      .send({
        type: type,
        documentToken: '0000',
      })
      .expect(200)

    // Assert
    expect(res.body).toEqual({ documentSigned: true })
  })

  it('should update external data with template api module action response', async () => {
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.EXAMPLE,
      })
      .expect(201)

    // Advance from prerequisites state
    await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    const answers = {
      person: {
        name: 'Tester',
        nationalId: '1234567890',
        age: '30',
        email: 'tester@island.is',
        phoneNumber: '8234567',
      },
      dreamJob: 'Yes',
      attachments: [],
      careerHistory: 'yes',
      careerHistoryCompanies: ['aranja'],
    }

    const draftStateResponse = await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers,
      })
      .expect(200)

    expect(draftStateResponse.body.state).toBe('draft')
    expect(draftStateResponse.body.externalData).toEqual({})

    const inReviewStateResponse = await server
      .put(`/applications/${draftStateResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(inReviewStateResponse.body.state).toBe('inReview')

    const inReviewExternalDataKeys = Object.keys(
      inReviewStateResponse.body.externalData,
    )
    expect(inReviewExternalDataKeys).toContain('createApplication')
    expect(
      inReviewStateResponse.body.externalData.createApplication.data,
    ).toEqual({ id: 1337 })

    const approvedStateResponse = await server
      .put(`/applications/${draftStateResponse.body.id}/submit`)
      .send({
        event: 'APPROVE',
        answers: {
          ...answers,
          approvedByReviewer: 'APPROVE',
        },
      })
      .expect(200)

    expect(approvedStateResponse.body.state).toBe('approved')

    const approvedExternalDataKeys = Object.keys(
      approvedStateResponse.body.externalData,
    )
    expect(approvedExternalDataKeys).toContain('completeApplication')
    expect(
      approvedStateResponse.body.externalData.completeApplication.data,
    ).toEqual({ id: 1337 })
  })

  const mockParentalLeaveInAssignableState = async (
    includeNonce = true,
  ): Promise<{
    token: string
    applicationId: string
  }> => {
    const secret = environment.templateApi.jwtSecret

    const nonce = uuid.uuid()
    const uuidSpy = jest.spyOn(uuid, 'uuid')
    uuidSpy.mockImplementationOnce(() => nonce)
    //create applications in assign state.
    const creationResponse = await server
      .post('/applications')
      .send({
        typeId: ApplicationTypes.PARENTAL_LEAVE,
      })
      .expect(201)
    const answers = {
      employer: { isSelfEmployed: 'no' },
    }

    await server
      .put(`/applications/${creationResponse.body.id}`)
      .send({
        answers,
      })
      .expect(200)

    const draftStateResponse = await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(draftStateResponse.body.state).toBe('draft')
    expect(draftStateResponse.body.externalData).toEqual({})

    const token = jwt.sign(
      {
        applicationId: creationResponse.body.id,
        state: 'employerWaitingToAssign',
        ...(includeNonce && { nonce }),
      },
      secret,
      { expiresIn: 100 },
    )

    const jwtspy = jest.spyOn(jwt, 'sign')
    jwtspy.mockImplementationOnce(() => token)

    const employerWaitingToAssignResponse = await server
      .put(`/applications/${creationResponse.body.id}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(employerWaitingToAssignResponse.body.state).toBe(
      'employerWaitingToAssign',
    )
    expect(employerWaitingToAssignResponse.body.assignNonces).toStrictEqual([
      nonce,
    ])

    return { token, applicationId: creationResponse.body.id }
  }

  it('PUT applications/assign should work just once', async () => {
    const { token } = await mockParentalLeaveInAssignableState()

    await server
      .put('/applications/assign')
      .send({
        token,
      })
      .expect(200)

    //switch to another user
    mockAuthGuard.auth.nationalId = '1234567890'

    const assignAgain = await server
      .put('/applications/assign')
      .send({
        token,
      })
      .expect(404)
    expect(assignAgain.body.detail).toBe('Token no longer usable.')
  })

  it('PUT applications/assign returns to draft and creates a new token. Old token should be invalid', async () => {
    const { token, applicationId } = await mockParentalLeaveInAssignableState()

    await server
      .put(`/applications/${applicationId}/submit`)
      .send({ event: 'EDIT' })
      .expect(200)

    const employerWaitingToAssignResponse = await server
      .put(`/applications/${applicationId}/submit`)
      .send({ event: 'SUBMIT' })
      .expect(200)

    expect(employerWaitingToAssignResponse.body.state).toBe(
      'employerWaitingToAssign',
    )

    const assignAgain = await server
      .put('/applications/assign')
      .send({
        token,
      })
      .expect(404)

    expect(assignAgain.body.detail).toBe('Token no longer usable.')
  })

  it('PUT applications/assign supports legacy tokens', async () => {
    const { token } = await mockParentalLeaveInAssignableState(false)

    await server
      .put('/applications/assign')
      .send({
        token,
      })
      .expect(200)
  })

  // TODO: Validate that an application that is in a state that should be pruned
  // is not listed when (mocked) Date.now > application.pruneAt
})
