// src/shared/interfaces/preference.interface.ts
import { ApiProperty } from '@nestjs/swagger'

export class NotificationTypePreference {
  @ApiProperty({
    description: 'Whether notifications of this type are enabled',
    example: true
  })
  enabled: boolean

  @ApiProperty({
    description: 'Channels to use for this notification type',
    example: ['inApp', 'email'],
    type: [String]
  })
  channels: string[]
}

export class ChannelPreferences {
  @ApiProperty({
    description: 'Whether in-app notifications are enabled',
    example: true,
    default: true
  })
  inApp: boolean

  @ApiProperty({
    description: 'Whether email notifications are enabled',
    example: true,
    default: true
  })
  email: boolean

  // Add other channels as needed
}

export class UserPreferences {
  @ApiProperty({
    description: 'ID of the user these preferences belong to',
    example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
  })
  userId: string

  @ApiProperty({
    description: 'Channel-specific preferences',
    type: ChannelPreferences
  })
  channels: ChannelPreferences

  @ApiProperty({
    description: 'Type-specific notification preferences',
    example: {
      system: {
        enabled: true,
        channels: ['inApp', 'email']
      },
      marketing: {
        enabled: false,
        channels: ['email']
      }
    },
    type: Object
  })
  types: {
    [notificationType: string]: NotificationTypePreference
  }
}
