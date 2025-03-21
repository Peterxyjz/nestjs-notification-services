import { NotificationPriority } from '@/shared/interfaces/notification.interface'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'

export class NotificationOptionsDto {
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority

  @IsDateString()
  @IsOptional()
  expireAt?: string

  @IsString()
  @IsOptional()
  idempotencyKey?: string
}

export class CreateNotificationDto {
  @IsString()
  userId: string

  @IsString()
  type: string

  @IsString()
  templateId: string

  @IsObject()
  data: Record<string, any>

  @IsArray()
  @IsOptional()
  channels?: string[]

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationOptionsDto)
  options?: NotificationOptionsDto
}

export class UpdateNotificationDto {
  @IsDate()
  @IsOptional()
  readAt?: Date
}
