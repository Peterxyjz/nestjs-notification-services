export const NOTIFICATION_CHANNELS = {
  IN_APP: 'inApp',
  EMAIL: 'email'
}

export const DEFAULT_PREFERENCES = {
  channels: {
    inApp: true,
    email: true
  },
  types: {
    system: {
      enabled: true,
      channels: [NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.EMAIL]
    },
    marketing: {
      enabled: true,
      channels: [NOTIFICATION_CHANNELS.EMAIL]
    }
  }
}
