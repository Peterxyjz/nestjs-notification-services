import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator'

class ChannelPreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable/disable in-app notifications',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  inApp?: boolean

  @ApiPropertyOptional({
    description: 'Enable/disable email notifications',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  email?: boolean
}

class NotificationTypePreferenceDto {
  @ApiProperty({
    description: 'Enable/disable this notification type',
    example: true
  })
  @IsBoolean()
  enabled: boolean

  @ApiProperty({
    description: 'Channels to use for this notification type',
    example: ['inApp', 'email'],
    type: [String]
  })
  @IsArray()
  channels: string[]
}

export class UpdatePreferenceDto {
  @ApiPropertyOptional({
    description: 'Channel preferences',
    type: ChannelPreferencesDto
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferencesDto)
  channels?: ChannelPreferencesDto

  @ApiPropertyOptional({
    description: 'Notification type specific preferences',
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
  @IsObject()
  @IsOptional()
  types?: Record<string, NotificationTypePreferenceDto>
}
