import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator'

class TemplateContentDto {
  @ApiPropertyOptional({
    description: 'Title for the notification',
    example: 'Order Confirmation'
  })
  @IsString()
  @IsOptional()
  title?: string

  @ApiPropertyOptional({
    description: 'Content/body text of the notification',
    example:
      'Your order #{{orderNumber}} has been confirmed and will be delivered on {{deliveryDate}}.'
  })
  @IsString()
  @IsOptional()
  content?: string

  @ApiPropertyOptional({
    description: 'Subject line for email notifications',
    example: 'Your Order #{{orderNumber}} Has Been Confirmed'
  })
  @IsString()
  @IsOptional()
  subject?: string

  @ApiPropertyOptional({
    description: 'Email body content',
    example:
      '<h1>Your Order is Confirmed</h1><p>Hello {{name}},</p><p>Thank you for your order #{{orderNumber}}.</p>'
  })
  @IsString()
  @IsOptional()
  body?: string

  @ApiPropertyOptional({
    description: 'Whether the content is HTML or plain text',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isHtml?: boolean

  @ApiPropertyOptional({
    description: 'Template engine to use for rendering',
    example: 'handlebars',
    default: 'handlebars'
  })
  @IsString()
  @IsOptional()
  engineType?: string
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Display name for the template',
    example: 'Order Confirmation Template'
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Unique type identifier for the template',
    example: 'order_confirmation'
  })
  @IsString()
  type: string

  @ApiProperty({
    description: 'Template content for different notification channels',
    example: {
      inApp: {
        title: 'Order Confirmed',
        content: 'Your order #{{orderNumber}} has been confirmed.'
      },
      email: {
        subject: 'Order Confirmation',
        body: '<h1>Your order has been confirmed</h1><p>Order #{{orderNumber}}</p>',
        isHtml: true
      }
    }
  })
  @IsObject()
  channels: {
    inApp?: TemplateContentDto
    email?: TemplateContentDto
  }

  @ApiPropertyOptional({
    description: 'Translations of the template for different locales',
    example: {
      fr: {
        inApp: {
          title: 'Commande Confirmée',
          content: 'Votre commande #{{orderNumber}} a été confirmée.'
        }
      }
    }
  })
  @IsObject()
  @IsOptional()
  translations?: Record<string, any>

  @ApiProperty({
    description: 'Variables that can be used in the template',
    example: ['orderNumber', 'customerName', 'deliveryDate'],
    type: [String]
  })
  @IsArray()
  variables: string[]

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
