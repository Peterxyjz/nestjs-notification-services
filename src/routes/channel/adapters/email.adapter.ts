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
    // Khởi tạo nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass')
      }
    })
  }

  async send(payload: ChannelPayload): Promise<DeliveryResult> {
    try {
      const { userId, content, metadata } = payload

      // Lấy email từ userId (có thể cần service để lấy thông tin user)
      const userEmail = metadata.email || `${userId}@example.com` // Thay thế với logic lấy email thực tế

      const mailOptions = {
        from: this.configService.get<string>('email.from'),
        to: userEmail,
        subject: content.subject,
        ...(content.isHtml ? { html: content.body } : { text: content.body })
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
