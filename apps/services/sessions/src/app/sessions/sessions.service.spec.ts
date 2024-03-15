import { createNationalId } from '@island.is/testing/fixtures'
import { TestApp } from '@island.is/testing/nest'

import { FixtureFactory } from '../../../test/fixture.factory'
import { setupWithoutAuth } from '../../../test/setup'
import { Session } from '../sessions/session.model'
import { SessionsService } from './sessions.service'
import { USER_AGENT_MAX_LENGTH } from './constants'

const mockSession = {
  sessionId: '1',
  actorNationalId: createNationalId(),
  subjectNationalId: createNationalId(),
  clientId: 'clientId',
  timestamp: new Date(),
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  ip: '127.0.0.1',
} as Session

const mockSessionWithIpLocation = { ...mockSession, ipLocation: 'IS' }

const userAgentLong = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 ${'a'.repeat(
  USER_AGENT_MAX_LENGTH,
)}`

describe('SessionsService', () => {
  let app: TestApp
  let sessionsService: SessionsService
  let factory: FixtureFactory

  beforeAll(async () => {
    app = await setupWithoutAuth()
    factory = new FixtureFactory(app)

    sessionsService = app.get(SessionsService)
  })

  beforeEach(async () => {
    await factory.get(Session).destroy({
      where: {},
      cascade: true,
      truncate: true,
      force: true,
    })
  })

  afterAll(async () => {
    await app?.cleanUp()
  })

  it.each`
    session        | userAgent                                                                                                                  | device
    ${mockSession} | ${'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'} | ${'Chrome (Mac OS)'}
    ${mockSession} | ${'Chrome/109.0.0.0'}                                                                                                      | ${'Chrome'}
    ${mockSession} | ${'Macintosh; Intel Mac OS X 10_15_7'}                                                                                     | ${'Mac OS'}
    ${mockSession} | ${'Bogus User Agent'}                                                                                                      | ${null}
    ${mockSession} | ${userAgentLong}                                                                                                           | ${'Chrome (Mac OS)'}
  `(
    'should create session with matching user agent parsing to $device',
    async ({ session, userAgent, device }) => {
      // Act
      await sessionsService.create({
        ...session,
        userAgent,
      })

      // Assert
      const sessions = await factory.get(Session).findAll()
      expect(sessions).toHaveLength(1)
      expect(sessions[0]).toMatchObject({
        ...session,
        userAgent: userAgent.substring(0, USER_AGENT_MAX_LENGTH),
        device,
      })
    },
  )

  it.each`
    session        | ip                  | ipLocation
    ${mockSession} | ${'153.92.156.131'} | ${'IS'}
    ${mockSession} | ${'50.81.31.215'}   | ${'US'}
    ${mockSession} | ${'127.0.0.1'}      | ${null}
  `('should parse location from ip', async ({ session, ip, ipLocation }) => {
    await sessionsService.create({
      ...session,
      ip,
    })

    const sessions = await factory.get(Session).findAll()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({
      ...session,
      ip,
      ipLocation,
    })
  })

  it.each`
    session                      | expectedIpLocation
    ${mockSession}               | ${null}
    ${mockSessionWithIpLocation} | ${'IS'}
  `(
    'should correctly handle ipLocation property',
    async ({ session, expectedIpLocation }) => {
      await sessionsService.create(session)

      const sessions = await factory.get(Session).findAll()
      expect(sessions).toHaveLength(1)
      expect(sessions[0].ipLocation).toBe(expectedIpLocation)
    },
  )
})
