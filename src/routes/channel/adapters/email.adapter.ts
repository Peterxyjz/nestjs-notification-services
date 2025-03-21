import envConfig from '@/shared/config'
import {
  ChannelAdapter,
  ChannelPayload,
  DeliveryResult
} from '@/shared/interfaces/channel.interface'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer from 'nodemailer'

@Injectable()
export class EmailAdapter implements ChannelAdapter {
  private readonly logger = new Logger(EmailAdapter.name)
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    // Khởi tạo nodemailer transporter với kiểu cụ thể
    this.transporter = nodemailer.createTransport({
      host: envConfig.EMAIL_HOST,
      port: parseInt(envConfig.EMAIL_PORT),
      secure: envConfig.EMAIL_SECURE === 'true',
      auth: {
        user: envConfig.EMAIL_USER,
        pass: envConfig.EMAIL_PASS
      }
    } as nodemailer.TransportOptions)
  }

  async send(payload: ChannelPayload): Promise<DeliveryResult> {
    try {
      const { userId, content, metadata } = payload

      // Lấy email từ userId (có thể cần service để lấy thông tin user)
      const userEmail = metadata.email || `${userId}@example.com` // Thay thế với logic lấy email thực tế

      const mailOptions = {
        from: envConfig.EMAIL_FROM,
        to: userEmail,
        subject: content.subject,
        html: content.body
      }

      const result = await this.transporter.sendMail(mailOptions)

      return {
        success: true,
        channelType: 'email',
        messageId: result.messageId,
        timestamp: new Date(),
        metadata: {
          accepted: result.accepted,
          response: result.response
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack)
      return {
        success: false,
        channelType: 'email',
        timestamp: new Date(),
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: error.message,
          retryable: true
        }
      }
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      this.logger.error(`Email verification failed: ${error.message}`)
      return false
    }
  }
}
