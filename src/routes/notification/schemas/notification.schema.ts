import {
  NotificationPriority,
  NotificationStatus
} from '@/shared/interfaces/notification.interface'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

export type NotificationDocument = Notification & Document

@Schema()
export class ChannelStatus {
  @ApiProperty({
    enum: ['pending', 'sent', 'failed'],
    example: 'sent',
    description: 'Status of delivery through this channel'
  })
  @Prop({ required: true, enum: ['pending', 'sent', 'failed'] })
  status: string

  @ApiProperty({
    description: 'Unique message ID from the channel',
    example: '<abc123@mail.example.com>',
    required: false
  })
  @Prop()
  messageId?: string

  @ApiProperty({
    description: 'Error message if delivery failed',
    required: false,
    example: 'Invalid email address'
  })
  @Prop()
  error?: string

  @ApiProperty({
    description: 'Additional metadata about the delivery',
    required: false,
    type: Object
  })
  @Prop({ type: Object })
  metadata?: Record<string, any>

  @ApiProperty({
    description: 'When the notification was sent',
    required: false,
    type: Date
  })
  @Prop()
  sentAt?: Date
}

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({
    description: 'ID of the user the notification belongs to',
    example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
  })
  @Prop({ required: true })
  userId: string

  @ApiProperty({
    description: 'Type of notification',
    example: 'order_confirmation'
  })
  @Prop({ required: true })
  type: string

  @ApiProperty({
    description: 'ID of the template used for this notification',
    example: '507f1f77bcf86cd799439011'
  })
  @Prop({ required: true })
  templateId: string

  @ApiProperty({
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
    description: 'Current status of the notification'
  })
  @Prop({
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  })
  status: NotificationStatus

  @ApiProperty({
    description: 'Notification title',
    example: 'Order Confirmed',
    required: false
  })
  @Prop()
  title: string

  @ApiProperty({
    description: 'Notification content',
    example: 'Your order #12345 has been confirmed',
    required: false
  })
  @Prop()
  content: string

  @ApiProperty({
    description: 'Template data used to generate the notification',
    example: {
      orderNumber: '12345',
      customerName: 'John Doe',
      deliveryDate: '2024-04-25',
      email: 'john.doe@example.com'
    },
    type: Object
  })
  @Prop({ type: Object })
  data: Record<string, any>

  @ApiProperty({
    description: 'Status of delivery through different channels',
    example: {
      inApp: {
        status: 'sent',
        messageId: '12345',
        sentAt: '2024-03-21T15:30:45.123Z'
      },
      email: {
        status: 'sent',
        messageId: '<abc123@mail.example.com>',
        sentAt: '2024-03-21T15:30:46.456Z'
      }
    },
    type: Object
  })
  @Prop({ type: Object })
  channels: Record<string, ChannelStatus>

  @ApiProperty({
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.NORMAL,
    description: 'Priority level of the notification'
  })
  @Prop({
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.NORMAL
  })
  priority: NotificationPriority

  @ApiProperty({
    description: 'When the notification was read by the user',
    required: false,
    type: Date
  })
  @Prop()
  readAt?: Date

  @ApiProperty({
    description: 'When the notification expires',
    required: false,
    type: Date
  })
  @Prop()
  expireAt?: Date

  @ApiProperty({
    description: 'Unique key to prevent duplicate notifications',
    required: false,
    example: 'order-123-confirmation'
  })
  @Prop()
  idempotencyKey?: string

  @ApiProperty({
    description: 'Additional metadata about the notification',
    required: false,
    type: Object
  })
  @Prop({ type: Object })
  metadata?: Record<string, any>
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true })
