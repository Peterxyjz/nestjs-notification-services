// src/routes/notification/notification.service.spec.ts
import { NOTIFICATION_CHANNELS } from '@/shared/constants/notification.constants'
import { NotificationStatus } from '@/shared/interfaces/notification.interface'
import { NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { ChannelService } from '../channel/channel.service'
import { PreferenceService } from '../preference/preference.service'
import { TemplateService } from '../template/template.service'
import { CreateNotificationDto } from './dto/notification.dto'
import { NotificationService } from './notification.service'
import { Notification } from './schemas/notification.schema'

type MockModel = {
  create: jest.Mock
  findById: jest.Mock
  findOne: jest.Mock
  find: jest.Mock
  updateOne: jest.Mock
  updateMany: jest.Mock
  countDocuments: jest.Mock
}

type MockQuery = {
  sort: jest.Mock
  skip: jest.Mock
  limit: jest.Mock
  exec: jest.Mock
}

describe('NotificationService', () => {
  let service: NotificationService
  let notificationModel: MockModel
  let templateService: { renderTemplate: jest.Mock }
  let preferenceService: { findOrCreateByUserId: jest.Mock }
  let channelService: { send: jest.Mock }

  // Mock data for tests
  const userId = 'user-123'
  const notificationId = 'notification-123'
  const templateId = 'template-123'

  // Create mock query chain
  const createMockQuery = (): MockQuery => {
    return {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn()
    }
  }

  beforeEach(async () => {
    // Create fresh mocks for each test
    const mockQuery = createMockQuery()

    const mockModel: MockModel = {
      create: jest.fn(),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      find: jest.fn().mockReturnValue(mockQuery),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      countDocuments: jest.fn()
    }

    const mockTemplateService = {
      renderTemplate: jest.fn()
    }

    const mockPreferenceService = {
      findOrCreateByUserId: jest.fn()
    }

    const mockChannelService = {
      send: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockModel
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService
        },
        {
          provide: PreferenceService,
          useValue: mockPreferenceService
        },
        {
          provide: ChannelService,
          useValue: mockChannelService
        }
      ]
    }).compile()

    service = module.get<NotificationService>(NotificationService)
    notificationModel = module.get(getModelToken(Notification.name))
    templateService = module.get(TemplateService)
    preferenceService = module.get(PreferenceService)
    channelService = module.get(ChannelService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    const createDto: CreateNotificationDto = {
      userId,
      type: 'order_confirmation',
      templateId,
      data: {
        orderNumber: '12345',
        customerName: 'John Doe',
        email: 'john@example.com'
      },
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
    }

    const mockPreferences = {
      channels: {
        inApp: true,
        email: true
      },
      types: {
        order_confirmation: {
          enabled: true,
          channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
        }
      }
    }

    const mockRenderedContent = {
      inApp: {
        title: 'Order Confirmed',
        content: 'Your order #12345 has been confirmed.'
      },
      email: {
        subject: 'Order Confirmation',
        body: '<h1>Your order has been confirmed</h1><p>Order #12345</p>',
        isHtml: true
      }
    }

    const mockNotification = {
      _id: notificationId,
      userId,
      type: 'order_confirmation',
      templateId,
      data: {
        orderNumber: '12345',
        customerName: 'John Doe',
        email: 'john@example.com'
      },
      status: NotificationStatus.PENDING,
      title: 'Order Confirmed',
      content: 'Your order #12345 has been confirmed.',
      channels: {
        inApp: { status: 'pending' },
        email: { status: 'pending' }
      },
      toObject: () => ({
        _id: notificationId,
        userId,
        type: 'order_confirmation',
        status: NotificationStatus.PENDING,
        channels: {
          inApp: { status: 'pending' },
          email: { status: 'pending' }
        }
      })
    }

    it('should create a notification successfully', async () => {
      // Setup mocks
      preferenceService.findOrCreateByUserId.mockResolvedValue(mockPreferences)
      templateService.renderTemplate.mockResolvedValue(mockRenderedContent)
      notificationModel.create.mockResolvedValue(mockNotification)
      channelService.send.mockResolvedValue({
        success: true,
        channelType: NOTIFICATION_CHANNELS.IN_APP,
        messageId: 'msg123',
        timestamp: new Date()
      })

      // Call method
      const result = await service.create(createDto)

      // Verify
      expect(preferenceService.findOrCreateByUserId).toHaveBeenCalledWith(userId)
      expect(templateService.renderTemplate).toHaveBeenCalledWith({
        templateId,
        data: createDto.data,
        channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
      })
      expect(notificationModel.create).toHaveBeenCalled()
      expect(channelService.send).toHaveBeenCalled()

      // Verify result structure
      expect(result).toHaveProperty('id', notificationId)
      expect(result).toHaveProperty('status', NotificationStatus.PENDING)
      expect(result.channels).toHaveProperty('inApp')
      expect(result.channels).toHaveProperty('email')
    })

    it('should respect user preferences when sending notifications', async () => {
      // User has disabled email notifications
      const customPreferences = {
        channels: {
          inApp: true,
          email: false
        },
        types: {}
      }

      preferenceService.findOrCreateByUserId.mockResolvedValue(customPreferences)
      templateService.renderTemplate.mockResolvedValue({
        inApp: mockRenderedContent.inApp
      })
      notificationModel.create.mockResolvedValue({
        ...mockNotification,
        channels: { inApp: { status: 'pending' } }
      })

      // Call method
      await service.create(createDto)

      // Verify template was rendered only for inApp
      expect(templateService.renderTemplate).toHaveBeenCalledWith({
        templateId,
        data: createDto.data,
        channels: [NOTIFICATION_CHANNELS.IN_APP]
      })
    })

    it('should create notification with PARTIAL status when no channels are enabled', async () => {
      // All channels disabled
      const disabledPreferences = {
        channels: {
          inApp: false,
          email: false
        },
        types: {}
      }

      preferenceService.findOrCreateByUserId.mockResolvedValue(disabledPreferences)
      notificationModel.create.mockResolvedValue({
        ...mockNotification,
        status: NotificationStatus.PARTIAL,
        channels: {}
      })

      // Call method
      const result = await service.create(createDto)

      // Verify
      expect(notificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.PARTIAL,
          channels: {}
        })
      )
      expect(result).toHaveProperty('status', NotificationStatus.PARTIAL)
      expect(templateService.renderTemplate).not.toHaveBeenCalled()
    })

    it('should handle errors during notification creation', async () => {
      // Make sure all required dependencies are properly mocked
      const mockPreferences = {
        channels: {
          inApp: true,
          email: true
        },
        types: {}
      }

      // Mock the renderTemplate response first
      const mockRenderedContent = {
        inApp: {
          title: 'Test Title',
          content: 'Test Content'
        }
      }

      // Set up all dependencies correctly
      preferenceService.findOrCreateByUserId.mockResolvedValue(mockPreferences)
      templateService.renderTemplate.mockResolvedValue(mockRenderedContent)

      // Then mock the database error
      const dbError = new Error('Database error')
      notificationModel.create.mockRejectedValue(dbError)

      // Verify the error is properly propagated
      await expect(service.create(createDto)).rejects.toThrow('Database error')

      // Verify create was called with the right data
      expect(notificationModel.create).toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    const mockNotifications = [
      {
        _id: 'notification1',
        userId,
        type: 'order_confirmation'
      },
      {
        _id: 'notification2',
        userId,
        type: 'payment_received'
      }
    ]

    it('should return paginated notifications', async () => {
      // Setup mock query
      const mockQuery = createMockQuery()
      mockQuery.exec.mockResolvedValue(mockNotifications)
      notificationModel.find.mockReturnValue(mockQuery)

      // Setup count mocks
      notificationModel.countDocuments.mockResolvedValueOnce(10) // total
      notificationModel.countDocuments.mockResolvedValueOnce(5) // unread

      // Call method
      const result = await service.findAll(userId, 1, 5)

      // Verify
      expect(notificationModel.find).toHaveBeenCalledWith({ userId })
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockQuery.skip).toHaveBeenCalledWith(0)
      expect(mockQuery.limit).toHaveBeenCalledWith(5)

      // Check result structure
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('meta')
      expect(result.meta).toEqual({
        total: 10,
        page: 1,
        limit: 5,
        totalPages: 2,
        unreadCount: 5
      })
    })

    it('should filter for unread notifications when requested', async () => {
      // Setup mock query
      const mockQuery = createMockQuery()
      mockQuery.exec.mockResolvedValue(mockNotifications)
      notificationModel.find.mockReturnValue(mockQuery)

      // Setup count mocks
      notificationModel.countDocuments.mockResolvedValueOnce(5) // total unread
      notificationModel.countDocuments.mockResolvedValueOnce(5) // unread count

      // Call method with unread flag
      await service.findAll(userId, 1, 10, true)

      // Verify
      expect(notificationModel.find).toHaveBeenCalledWith({
        userId,
        readAt: { $exists: false }
      })
    })

    it('should handle empty result', async () => {
      // Setup mock query
      const mockQuery = createMockQuery()
      mockQuery.exec.mockResolvedValue([])
      notificationModel.find.mockReturnValue(mockQuery)

      // Setup count mocks
      notificationModel.countDocuments.mockResolvedValueOnce(0)
      notificationModel.countDocuments.mockResolvedValueOnce(0)

      // Call method
      const result = await service.findAll(userId)

      // Verify
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
      expect(result.meta.totalPages).toBe(0)
      expect(result.meta.unreadCount).toBe(0)
    })
  })

  describe('findOne', () => {
    const mockNotification = {
      _id: notificationId,
      userId,
      type: 'order_confirmation'
    }

    it('should return a notification by ID', async () => {
      // Setup mock
      notificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      })

      // Call method
      const result = await service.findOne(notificationId)

      // Verify
      expect(notificationModel.findById).toHaveBeenCalledWith(notificationId)
      expect(result).toEqual(mockNotification)
    })

    it('should throw NotFoundException if notification not found', async () => {
      // Setup mock for not found
      notificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      // Verify error is thrown
      await expect(service.findOne('nonexistentId')).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      // Setup mock notification with save method
      const mockNotification = {
        _id: notificationId,
        userId,
        readAt: undefined,
        save: jest.fn().mockImplementation(function () {
          this.readAt = new Date()
          return this
        })
      }

      // Setup mock
      notificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      })

      // Call method
      const result = await service.markAsRead(notificationId)

      // Verify
      expect(notificationModel.findById).toHaveBeenCalledWith(notificationId)
      expect(mockNotification.save).toHaveBeenCalled()
      expect(result.readAt).toBeDefined()
    })

    it('should throw NotFoundException if notification not found', async () => {
      // Setup mock for not found
      notificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      // Verify error is thrown
      await expect(service.markAsRead('nonexistentId')).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      // Setup mock
      notificationModel.updateMany.mockResolvedValue({
        modifiedCount: 5
      })

      // Call method
      const result = await service.markAllAsRead(userId)

      // Verify
      expect(notificationModel.updateMany).toHaveBeenCalledWith(
        { userId, readAt: { $exists: false } },
        { $set: { readAt: expect.any(Date) } }
      )
      expect(result).toEqual({
        success: true,
        count: 5
      })
    })

    it('should return success with count 0 when no unread notifications exist', async () => {
      // Setup mock
      notificationModel.updateMany.mockResolvedValue({
        modifiedCount: 0
      })

      // Call method
      const result = await service.markAllAsRead(userId)

      // Verify
      expect(result).toEqual({
        success: true,
        count: 0
      })
    })
  })

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      // Setup mock
      notificationModel.countDocuments.mockResolvedValue(3)

      // Call method
      const result = await service.getUnreadCount(userId)

      // Verify
      expect(notificationModel.countDocuments).toHaveBeenCalledWith({
        userId,
        readAt: { $exists: false }
      })
      expect(result).toEqual({ count: 3 })
    })

    it('should return zero when no unread notifications exist', async () => {
      // Setup mock
      notificationModel.countDocuments.mockResolvedValue(0)

      // Call method
      const result = await service.getUnreadCount(userId)

      // Verify
      expect(result).toEqual({ count: 0 })
    })
  })
})
