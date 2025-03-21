import { ChannelService } from '@/routes/channel/channel.service'
import { CreateNotificationDto } from '@/routes/notification/dto/notification.dto'
import { PreferenceService } from '@/routes/preference/preference.service'
import { TemplateService } from '@/routes/template/template.service'
import {
  NotificationResult,
  NotificationStatus
} from '@/shared/interfaces/notification.interface'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Notification, NotificationDocument } from './schemas/notification.schema'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private templateService: TemplateService,
    private preferenceService: PreferenceService,
    private channelService: ChannelService
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<NotificationResult> {
    try {
      const { userId, type, templateId, data, channels, options } =
        createNotificationDto

      // Kiểm tra idempotency key nếu có
      if (options?.idempotencyKey) {
        const existing = await this.notificationModel.findOne({
          idempotencyKey: options.idempotencyKey
        })
        if (existing) {
          return this.mapToNotificationResult(existing)
        }
      }

      // Lấy user preferences
      const preferences = await this.preferenceService.findOrCreateByUserId(userId)

      // Kiểm tra các kênh được phép gửi
      const allowedChannels = this.getAllowedChannels(preferences, type, channels)
      if (allowedChannels.length === 0) {
        this.logger.log(
          `No channels enabled for user ${userId} and notification type ${type}`
        )
        // Tạo notification với trạng thái PARTIAL (không gửi đi)
        const notification = await this.notificationModel.create({
          userId,
          type,
          templateId,
          data,
          status: NotificationStatus.PARTIAL,
          channels: {},
          priority: options?.priority || 'normal',
          expireAt: options?.expireAt,
          idempotencyKey: options?.idempotencyKey
        })

        return this.mapToNotificationResult(notification)
      }

      // Render template
      const renderedContent = await this.templateService.renderTemplate({
        templateId,
        data,
        channels: allowedChannels
      })

      // Khởi tạo trạng thái cho mỗi kênh
      const channelStates: Record<
        string,
        { status: 'pending' | 'sent' | 'failed'; messageId?: string; error?: string }
      > = {}
      allowedChannels.forEach((channel) => {
        channelStates[channel] = {
          status: 'pending'
        }
      })

      // Tạo notification
      const notification = await this.notificationModel.create({
        userId,
        type,
        templateId,
        data,
        title: renderedContent.inApp?.title,
        content: renderedContent.inApp?.content,
        status: NotificationStatus.PENDING,
        channels: channelStates,
        priority: options?.priority || 'normal',
        expireAt: options?.expireAt,
        idempotencyKey: options?.idempotencyKey
      })

      // Gửi notification qua các kênh được phép
      this.sendToChannels(notification, renderedContent, allowedChannels)

      return this.mapToNotificationResult(notification)
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  private async sendToChannels(
    notification: NotificationDocument,
    renderedContent: any,
    channels: string[]
  ) {
    try {
      for (const channel of channels) {
        const content = renderedContent[channel]
        if (!content) continue

        const result = await this.channelService.send({
          channelType: channel,
          userId: notification.userId,
          content,
          metadata: {
            notificationId: notification._id,
            notificationType: notification.type,
            email: notification.data.email // Nếu có
          }
        })

        // Cập nhật trạng thái của kênh
        await this.notificationModel.updateOne(
          { _id: notification._id },
          {
            $set: {
              [`channels.${channel}.status`]: result.success ? 'sent' : 'failed',
              [`channels.${channel}.messageId`]: result.messageId,
              [`channels.${channel}.error`]: result.error?.message,
              [`channels.${channel}.sentAt`]: result.timestamp,
              [`channels.${channel}.metadata`]: result.metadata
            }
          }
        )
      }

      // Cập nhật trạng thái tổng thể của notification
      const updatedNotification = await this.notificationModel.findById(
        notification._id
      )

      if (updatedNotification) {
        const channelStatuses = Object.values(updatedNotification.channels).map(
          (c) => c.status
        )

        let overallStatus: NotificationStatus
        if (channelStatuses.every((status) => status === 'sent')) {
          overallStatus = NotificationStatus.SENT
        } else if (channelStatuses.every((status) => status === 'failed')) {
          overallStatus = NotificationStatus.FAILED
        } else {
          overallStatus = NotificationStatus.PARTIAL
        }

        await this.notificationModel.updateOne(
          { _id: notification._id },
          { $set: { status: overallStatus } }
        )
      }
    } catch (error) {
      this.logger.error(`Failed to send to channels: ${error.message}`, error.stack)
      await this.notificationModel.updateOne(
        { _id: notification._id },
        { $set: { status: NotificationStatus.FAILED } }
      )
    }
  }

  private getAllowedChannels(
    preferences,
    notificationType,
    requestedChannels
  ): string[] {
    // Lấy cấu hình cho notification type cụ thể
    const typePreference = preferences.types[notificationType]
    if (typePreference && !typePreference.enabled) {
      return [] // Notification type đã bị tắt
    }

    // Nếu có type preference, sử dụng channels từ đó
    const availableChannels =
      typePreference?.channels || Object.keys(preferences.channels)

    // Lọc các kênh được kích hoạt
    const enabledChannels = availableChannels.filter(
      (channel) => preferences.channels[channel]
    )

    // Nếu có requested channels, chỉ sử dụng những kênh được yêu cầu và được kích hoạt
    if (requestedChannels && requestedChannels.length) {
      return requestedChannels.filter((channel) => enabledChannels.includes(channel))
    }

    return enabledChannels
  }

  private mapToNotificationResult(
    notification: NotificationDocument
  ): NotificationResult {
    // Đảm bảo kiểu dữ liệu đúng cho channels
    const typedChannels: Record<
      string,
      {
        status: 'pending' | 'sent' | 'failed'
        messageId?: string
        error?: string
      }
    > = {}

    // Chuyển đổi từ channels trong document sang kiểu dữ liệu mong muốn
    if (notification.channels) {
      Object.entries(notification.channels).forEach(([key, value]) => {
        typedChannels[key] = {
          status: value.status as 'pending' | 'sent' | 'failed',
          messageId: value.messageId,
          error: value.error
        }
      })
    }

    return {
      id: notification._id as unknown as string,
      status: notification.status,
      channels: typedChannels,
      metadata: {
        // Sử dụng timestamps từ Mongoose nếu có (hoặc cung cấp một giá trị mặc định)
        createdAt: notification['createdAt'] || new Date(),
        updatedAt: notification['updatedAt'] || new Date(),
        type: notification.type
      }
    }
  }

  async findAll(userId: string, page = 1, limit = 10, onlyUnread = false) {
    const query: any = { userId }

    if (onlyUnread) {
      query.readAt = { $exists: false }
    }

    const total = await this.notificationModel.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    const skip = (page - 1) * limit
    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec()

    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      readAt: { $exists: false }
    })

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages,
        unreadCount
      }
    }
  }

  async findOne(id: string) {
    const notification = await this.notificationModel.findById(id).exec()
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }
    return notification
  }

  async markAsRead(id: string) {
    const notification = await this.notificationModel.findById(id).exec()
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    notification.readAt = new Date()
    await notification.save()
    return notification
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    )

    return {
      success: true,
      count: result.modifiedCount
    }
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      userId,
      readAt: { $exists: false }
    })

    return { count }
  }
}
