import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator'

class ChannelPreferencesDto {
  @IsBoolean()
  @IsOptional()
  inApp?: boolean

  @IsBoolean()
  @IsOptional()
  email?: boolean
}

class NotificationTypePreferenceDto {
  @IsBoolean()
  enabled: boolean

  @IsArray()
  channels: string[]
}

export class UpdatePreferenceDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferencesDto)
  channels?: ChannelPreferencesDto

  @IsObject()
  @IsOptional()
  types?: Record<string, NotificationTypePreferenceDto>
}
