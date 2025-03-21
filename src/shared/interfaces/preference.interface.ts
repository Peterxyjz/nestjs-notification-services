// src/core/interfaces/preference.interface.ts
export interface NotificationTypePreference {
  enabled: boolean
  channels: string[]
}

export interface ChannelPreferences {
  inApp: boolean
  email: boolean
  // Thêm các kênh khác khi cần
}

export interface UserPreferences {
  userId: string
  channels: ChannelPreferences
  types: {
    [notificationType: string]: NotificationTypePreference
  }
}
