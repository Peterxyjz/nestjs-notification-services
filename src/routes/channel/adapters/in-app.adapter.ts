import {
  Notification,
  NotificationDocument
} from '@/routes/notification/schemas/notification.schema'
import {
  ChannelAdapter,
  ChannelPayload,
  DeliveryResult
} from '@/shared/interfaces/channel.interface'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class InAppAdapter implements ChannelAdapter {
  private readonly logger = new Logger(InAppAdapter.name)

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>
  ) {}

  async send(payload: ChannelPayload): Promise<DeliveryResult> {
    try {
      const { userId, content, metadata } = payload

      // In-app notifications được lưu trực tiếp vào database
      // và notificationId có thể được trả về từ metadata
      const notificationId = metadata.notificationId

      // Update notification với status đã gửi
      if (notificationId) {
        await this.notificationModel.updateOne(
          { _id: notificationId },
          {
            $set: {
              title: content.title,
              content: content.content,
              'channels.inApp.status': 'sent',
              'channels.inApp.sentAt': new Date()
            }
          }
        )
      }

      return {
        success: true,
        channelType: 'inApp',
        messageId: notificationId,
        timestamp: new Date()
      }
    } catch (error) {
      this.logger.error(
        `Failed to send in-app notification: ${error.message}`,
        error.stack
      )
      return {
        success: false,
        channelType: 'inApp',
        timestamp: new Date(),
        error: {
          code: 'IN_APP_SEND_FAILED',
          message: error.message,
          retryable: true
        }
      }
    }
  }

  async verify(): Promise<boolean> {
    // Luôn trả về true vì in-app notification không cần xác minh kết nối
    return true
  }
}
