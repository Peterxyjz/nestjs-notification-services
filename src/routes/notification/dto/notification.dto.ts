import { NotificationPriority } from '@/shared/interfaces/notification.interface'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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
  @ApiPropertyOptional({
    enum: NotificationPriority,
    description: 'Priority level of the notification'
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority

  @ApiPropertyOptional({
    description: 'Expiration date of the notification',
    example: '2024-12-31T23:59:59Z'
  })
  @IsDateString()
  @IsOptional()
  expireAt?: string

  @ApiPropertyOptional({
    description: 'Unique key to prevent duplicate notifications',
    example: 'order-123-confirmation'
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the user to receive the notification',
    example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
  })
  @IsString()
  userId: string

  @ApiProperty({
    description: 'Type of notification',
    example: 'order_confirmation'
  })
  @IsString()
  type: string

  @ApiProperty({
    description: 'ID of the template to use for this notification',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  templateId: string

  @ApiProperty({
    description: 'Data to be used in the notification template',
    example: {
      orderNumber: '12345',
      productName: 'Wireless Headphones',
      deliveryDate: '2024-04-25',
      email: 'user@example.com'
    }
  })
  @IsObject()
  data: Record<string, any>

  @ApiPropertyOptional({
    description: 'Channels to deliver this notification through',
    example: ['inApp', 'email'],
    type: [String]
  })
  @IsArray()
  @IsOptional()
  channels?: string[]

  @ApiPropertyOptional({
    description: 'Additional options for the notification',
    type: NotificationOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationOptionsDto)
  options?: NotificationOptionsDto
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Timestamp when the notification was read',
    type: Date
  })
  @IsDate()
  @IsOptional()
  readAt?: Date
}
