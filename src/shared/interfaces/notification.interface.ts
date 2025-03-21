// src/shared/interfaces/notification.interface.ts
import { ApiProperty } from '@nestjs/swagger'

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  PARTIAL = 'partial'
}

export enum NotificationPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export class NotificationOptions {
  @ApiProperty({
    enum: NotificationPriority,
    description: 'Priority level of the notification',
    required: false,
    default: NotificationPriority.NORMAL
  })
  priority?: NotificationPriority

  @ApiProperty({
    description: 'Date when the notification expires',
    required: false,
    type: Date
  })
  expireAt?: Date

  @ApiProperty({
    description: 'Unique key to prevent duplicate notifications',
    required: false,
    example: 'order-123-confirmation'
  })
  idempotencyKey?: string
}

export class NotificationRequest {
  @ApiProperty({
    description: 'ID of the user to receive the notification',
    example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
  })
  userId: string

  @ApiProperty({
    description: 'Type of notification',
    example: 'order_confirmation'
  })
  type: string

  @ApiProperty({
    description: 'ID of the template to use',
    example: '507f1f77bcf86cd799439011'
  })
  templateId: string

  @ApiProperty({
    description: 'Data to be used in the notification template',
    example: {
      orderNumber: '12345',
      productName: 'Wireless Headphones',
      deliveryDate: '2024-04-25'
    }
  })
  data: Record<string, any>

  @ApiProperty({
    description: 'Channels to deliver this notification through',
    example: ['inApp', 'email'],
    required: false,
    type: [String]
  })
  channels?: string[]

  @ApiProperty({
    description: 'Additional options for the notification',
    required: false,
    type: NotificationOptions
  })
  options?: NotificationOptions
}

export class ChannelStatus {
  @ApiProperty({
    description: 'Status of delivery through this channel',
    enum: ['pending', 'sent', 'failed'],
    example: 'sent'
  })
  status: 'pending' | 'sent' | 'failed'

  @ApiProperty({
    description: 'Unique message ID from the channel',
    required: false,
    example: '<abc123@mail.example.com>'
  })
  messageId?: string

  @ApiProperty({
    description: 'Error message if delivery failed',
    required: false,
    example: 'Invalid email address'
  })
  error?: string
}

export class NotificationMetadata {
  @ApiProperty({
    description: 'When the notification was created',
    type: Date
  })
  createdAt: Date

  @ApiProperty({
    description: 'When the notification was last updated',
    type: Date
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Type of notification',
    example: 'order_confirmation'
  })
  type: string
}

export class NotificationResult {
  @ApiProperty({
    description: 'Unique ID of the notification',
    example: '507f1f77bcf86cd799439011'
  })
  id: string

  @ApiProperty({
    description: 'Overall status of the notification',
    enum: NotificationStatus,
    example: NotificationStatus.SENT
  })
  status: NotificationStatus

  @ApiProperty({
    description: 'Status of delivery through each channel',
    example: {
      inApp: {
        status: 'sent',
        messageId: '12345'
      },
      email: {
        status: 'sent',
        messageId: '<abc123@mail.example.com>'
      }
    },
    type: Object
  })
  channels: {
    [channel: string]: ChannelStatus
  }

  @ApiProperty({
    description: 'Additional metadata about the notification',
    type: NotificationMetadata
  })
  metadata: NotificationMetadata
}
