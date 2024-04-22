import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsService } from '../notifications.service'
import { LoggingModule, logger, LOGGER_PROVIDER } from '@island.is/logging'
import { HnippTemplate } from '../dto/hnippTemplate.response'
import { CreateHnippNotificationDto } from '../dto/createHnippNotification.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { getModelToken } from '@nestjs/sequelize'
import { Notification } from '../notification.model'
import { NotificationsScope } from '@island.is/auth/scopes'
import type { User } from '@island.is/auth-nest-tools'

import {
  ExtendedPaginationDto,
  UpdateNotificationDto,
  RenderedNotificationDto,
  PaginatedNotificationDto,
  UnreadNotificationsCountDto,
  UnseenNotificationsCountDto,
} from '../dto/notification.dto'

const user: User = {
  nationalId: '1234567890',
  scope: [NotificationsScope.read, NotificationsScope.write],
  authorization: '',
  client: '',
}

const mockHnippTemplate: HnippTemplate = {
  templateId: 'HNIPP.DEMO.ID',
  notificationTitle: 'Demo title ',
  notificationBody: 'Demo body {{arg1}}',
  notificationDataCopy: 'Demo data copy',
  clickAction: 'Demo click action {{arg2}}',
  category: 'Demo category',
  args: ['arg1', 'arg2'],
}

const mockTemplates = [mockHnippTemplate, mockHnippTemplate, mockHnippTemplate]

const mockCreateHnippNotificationDto: CreateHnippNotificationDto = {
  recipient: '1234567890',
  templateId: 'HNIPP.DEMO.ID',
  args: [
    { key: 'arg1', value: 'hello' },
    { key: 'arg2', value: 'world' },
  ],
}

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({}), LoggingModule],
      providers: [
        NotificationsService,
        {
          provide: LOGGER_PROVIDER,
          useValue: logger,
        },
        {
          provide: getModelToken(Notification),
          useClass: jest.fn(() => ({})),
        },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get templates', async () => {
    jest
      .spyOn(service, 'getTemplates')
      .mockImplementation(() => Promise.resolve(mockTemplates))

    const templates = await service.getTemplates()
    expect(templates).toBeInstanceOf(Array)
    expect(templates).toEqual(mockTemplates)
  })

  it('should get template', async () => {
    jest
      .spyOn(service, 'getTemplate')
      .mockImplementation(() => Promise.resolve(mockHnippTemplate))
    const template = await service.getTemplate(mockHnippTemplate.templateId)
    expect(template).toBeInstanceOf(Object)
  })

  it('should validate true argument count match', () => {
    const counts = service.validateArgCounts(
      mockCreateHnippNotificationDto.args,
      mockHnippTemplate,
    )
    expect(mockCreateHnippNotificationDto.args.length).toBe(2)
    expect(counts).toBeTruthy()
  })

  it('should validate false on argument count mismatch +', () => {
    mockCreateHnippNotificationDto.args = [
      { key: 'arg1', value: 'hello' },
      { key: 'arg2', value: 'world' },
      { key: 'arg3', value: 'extra' },
    ]
    const counts = service.validateArgCounts(
      mockCreateHnippNotificationDto.args,
      mockHnippTemplate,
    )
    expect(mockCreateHnippNotificationDto.args.length).toBe(3)
    expect(counts).toBe(false)
  })
  it('should validate false on argument count mismatch -', () => {
    mockCreateHnippNotificationDto.args = [{ key: 'arg2', value: 'world' }]
    const counts = service.validateArgCounts(
      mockCreateHnippNotificationDto.args,
      mockHnippTemplate,
    )
    expect(mockCreateHnippNotificationDto.args.length).toBe(1)
    expect(counts).toBe(false)
  })

  it('should validate false on argument count mismatch 0', () => {
    mockCreateHnippNotificationDto.args = []
    const counts = service.validateArgCounts(
      mockCreateHnippNotificationDto.args,
      mockHnippTemplate,
    )
    expect(mockCreateHnippNotificationDto.args.length).toBe(0)
    expect(counts).toBe(false)
  })

  it('should replace template {{placeholders}} with args', () => {
    mockCreateHnippNotificationDto.args = [
      { key: 'arg1', value: 'hello' },
      { key: 'arg2', value: 'world' },
    ]
    const template = service.formatArguments(
      mockCreateHnippNotificationDto.args,
      mockHnippTemplate,
    )
    expect(template.notificationBody).toEqual('Demo body hello')
    expect(template.clickAction).toEqual('Demo click action world')
  })

  describe('findMany', () => {
    it('should return a paginated list of notifications', async () => {
      const query = new ExtendedPaginationDto()
      const mockedResponse = new PaginatedNotificationDto()
      jest
        .spyOn(service, 'findMany')
        .mockImplementation(async () => mockedResponse)

      expect(await service.findMany(user, query)).toBe(mockedResponse)
    })
  })

  describe('findOne', () => {
    it('should return a specific notification', async () => {
      const id = 123
      const mockedResponse = new RenderedNotificationDto()
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(async () => mockedResponse)

      expect(await service.findOne(user, id, 'en')).toBe(mockedResponse)
    })
  })

  describe('update', () => {
    it('should update a notification', async () => {
      const id = 123
      const updateNotificationDto = new UpdateNotificationDto()
      const mockedResponse = new RenderedNotificationDto()
      jest
        .spyOn(service, 'update')
        .mockImplementation(async () => mockedResponse)

      expect(await service.update(user, id, updateNotificationDto, 'en')).toBe(
        mockedResponse,
      )
    })
  })

  describe('Seen', () => {
    it('should get all unseen notification count', async () => {
      const mockedResponse = new UnseenNotificationsCountDto()
      jest
        .spyOn(service, 'getUnseenNotificationsCount')
        .mockImplementation(async () => mockedResponse)

      expect(await service.getUnseenNotificationsCount(user)).toBe(
        mockedResponse,
      )
    })

    it('should mark all notifications as seen', async () => {
      jest
        .spyOn(service, 'markAllAsSeen')
        .mockImplementation(async () => undefined)

      expect(await service.markAllAsSeen(user)).toBe(undefined)
    })
  })

  describe('unread', () => {
    it('should get all unread notification count', async () => {
      const mockedResponse = new UnreadNotificationsCountDto()
      jest
        .spyOn(service, 'getUnreadNotificationsCount')
        .mockImplementation(async () => mockedResponse)

      expect(await service.getUnreadNotificationsCount(user)).toBe(
        mockedResponse,
      )
    })
  })
})