import {
  NotificationPriority,
  NotificationStatus
} from '@/shared/interfaces/notification.interface'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class ChannelStatus {
  @Prop({ required: true, enum: ['pending', 'sent', 'failed'] })
  status: string

  @Prop()
  messageId?: string

  @Prop()
  error?: string

  @Prop({ type: Object })
  metadata?: Record<string, any>

  @Prop()
  sentAt?: Date
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  type: string

  @Prop({ required: true })
  templateId: string

  @Prop({
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  })
  status: NotificationStatus

  @Prop()
  title: string

  @Prop()
  content: string

  @Prop({ type: Object })
  data: Record<string, any>

  @Prop({ type: Object })
  channels: Record<string, ChannelStatus>

  @Prop({
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.NORMAL
  })
  priority: NotificationPriority

  @Prop()
  readAt?: Date

  @Prop()
  expireAt?: Date

  @Prop()
  idempotencyKey?: string

  @Prop({ type: Object })
  metadata?: Record<string, any>
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true })
