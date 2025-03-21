// src/shared/interfaces/channel.interface.ts
import { ApiProperty } from '@nestjs/swagger'

export class ChannelPayload {
  @ApiProperty({
    description: 'ID of the user to send notification to',
    example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
  })
  userId: string

  @ApiProperty({
    description: 'Content of the notification',
    example: {
      title: 'New Message',
      content: 'You have received a new message',
      subject: 'New Message Notification',
      body: '<p>You have received a new message from John</p>'
    }
  })
  content: any

  @ApiProperty({
    description: 'Additional metadata for the notification',
    example: {
      notificationId: '507f1f77bcf86cd799439011',
      email: 'user@example.com'
    }
  })
  metadata: Record<string, any>

  @ApiProperty({
    description: 'Additional options for the notification delivery',
    required: false
  })
  options?: Record<string, any>
}

export class DeliveryError {
  @ApiProperty({
    description: 'Error code',
    example: 'EMAIL_SEND_FAILED'
  })
  code: string

  @ApiProperty({
    description: 'Error message',
    example: 'Failed to send email: Invalid recipient'
  })
  message: string

  @ApiProperty({
    description: 'Whether the operation can be retried',
    example: true
  })
  retryable: boolean
}

export class DeliveryResult {
  @ApiProperty({
    description: 'Whether the delivery was successful',
    example: true
  })
  success: boolean

  @ApiProperty({
    description: 'Type of channel used for delivery',
    example: 'email'
  })
  channelType: string

  @ApiProperty({
    description: 'Unique message identifier from the channel',
    example: '<abc123@mail.example.com>',
    required: false
  })
  messageId?: string

  @ApiProperty({
    description: 'Timestamp of the delivery attempt',
    type: Date
  })
  timestamp: Date

  @ApiProperty({
    description: 'Additional metadata about the delivery',
    required: false,
    example: {
      accepted: ['user@example.com'],
      response: '250 OK'
    }
  })
  metadata?: Record<string, any>

  @ApiProperty({
    description: 'Error information if delivery failed',
    required: false,
    type: DeliveryError
  })
  error?: DeliveryError
}

export interface ChannelAdapter {
  send(payload: ChannelPayload): Promise<DeliveryResult>
  verify(): Promise<boolean>
}
