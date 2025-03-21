// src/core/interfaces/notification.interface.ts
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

export interface NotificationRequest {
  userId: string
  type: string
  templateId: string
  data: Record<string, any>
  channels?: string[]
  options?: {
    priority?: NotificationPriority
    expireAt?: Date
    idempotencyKey?: string
  }
}

export interface NotificationResult {
  id: string
  status: NotificationStatus
  channels: {
    [channel: string]: {
      status: 'pending' | 'sent' | 'failed'
      messageId?: string
      error?: string
    }
  }
  metadata: Record<string, any>
}
