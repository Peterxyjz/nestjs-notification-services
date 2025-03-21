// src/core/interfaces/channel.interface.ts
export interface ChannelPayload {
  userId: string
  content: any
  metadata: Record<string, any>
  options?: Record<string, any>
}

export interface DeliveryResult {
  success: boolean
  channelType: string
  messageId?: string
  timestamp: Date
  metadata?: Record<string, any>
  error?: {
    code: string
    message: string
    retryable: boolean
  }
}

export interface ChannelAdapter {
  send(payload: ChannelPayload): Promise<DeliveryResult>
  verify(): Promise<boolean>
}
