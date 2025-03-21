import { NOTIFICATION_CHANNELS } from '@/shared/constants/notification.constants'
import { DeliveryResult } from '@/shared/interfaces/channel.interface'
import { Injectable, Logger } from '@nestjs/common'
import { EmailAdapter } from './adapters/email.adapter'
import { InAppAdapter } from './adapters/in-app.adapter'

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name)
  private readonly adapters: Map<string, any> = new Map()

  constructor(
    private readonly emailAdapter: EmailAdapter,
    private readonly inAppAdapter: InAppAdapter
  ) {
    this.adapters.set(NOTIFICATION_CHANNELS.EMAIL, this.emailAdapter)
    this.adapters.set(NOTIFICATION_CHANNELS.IN_APP, this.inAppAdapter)
  }

  async send(payload: {
    channelType: string
    userId: string
    content: any
    metadata?: Record<string, any>
    options?: Record<string, any>
  }): Promise<DeliveryResult> {
    const { channelType, userId, content, metadata = {}, options = {} } = payload

    try {
      const adapter = this.adapters.get(channelType)
      if (!adapter) {
        return {
          success: false,
          channelType,
          timestamp: new Date(),
          error: {
            code: 'CHANNEL_NOT_SUPPORTED',
            message: `Channel ${channelType} is not supported`,
            retryable: false
          }
        }
      }

      const result = await adapter.send({
        userId,
        content,
        metadata,
        options
      })

      return result
    } catch (error) {
      this.logger.error(
        `Error sending via ${channelType}: ${error.message}`,
        error.stack
      )
      return {
        success: false,
        channelType,
        timestamp: new Date(),
        error: {
          code: 'CHANNEL_SEND_ERROR',
          message: error.message,
          retryable: true
        }
      }
    }
  }

  async verifyChannels(): Promise<Record<string, boolean>> {
    const results = {}

    for (const [channelName, adapter] of this.adapters.entries()) {
      try {
        results[channelName] = await adapter.verify()
      } catch (error) {
        this.logger.error(`Error verifying channel ${channelName}: ${error.message}`)
        results[channelName] = false
      }
    }

    return results
  }
}
