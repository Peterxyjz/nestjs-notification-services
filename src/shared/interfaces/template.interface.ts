// src/shared/interfaces/template.interface.ts
import { ApiProperty } from '@nestjs/swagger'

export class TemplateContent {
  @ApiProperty({
    description: 'Title for the notification',
    example: 'Order Confirmation',
    required: false
  })
  title?: string

  @ApiProperty({
    description: 'Content/body text of the notification',
    example: 'Your order #{{orderNumber}} has been confirmed.',
    required: false
  })
  content?: string

  @ApiProperty({
    description: 'Subject line for email notifications',
    example: 'Your Order #{{orderNumber}} Has Been Confirmed',
    required: false
  })
  subject?: string

  @ApiProperty({
    description: 'Email body content',
    example:
      '<h1>Your Order is Confirmed</h1><p>Hello {{name}},</p><p>Thank you for your order #{{orderNumber}}.</p>',
    required: false
  })
  body?: string

  @ApiProperty({
    description: 'Whether the content is HTML or plain text',
    example: true,
    required: false,
    default: false
  })
  isHtml?: boolean
}

export class TemplateChannels {
  @ApiProperty({
    description: 'In-app notification template content',
    type: TemplateContent,
    required: false
  })
  inApp?: TemplateContent

  @ApiProperty({
    description: 'Email notification template content',
    type: TemplateContent,
    required: false
  })
  email?: TemplateContent

  // Add other channels as needed
}

export class TemplateRenderRequest {
  @ApiProperty({
    description: 'ID of the template to render',
    example: '507f1f77bcf86cd799439011'
  })
  templateId: string

  @ApiProperty({
    description: 'Data to use when rendering the template',
    example: {
      orderNumber: '12345',
      customerName: 'John Doe',
      deliveryDate: '2024-04-25'
    }
  })
  data: Record<string, any>

  @ApiProperty({
    description: 'Locale to use for template translations',
    example: 'en',
    default: 'default',
    required: false
  })
  locale?: string

  @ApiProperty({
    description: 'Channels to render the template for',
    example: ['inApp', 'email'],
    required: false,
    type: [String]
  })
  channels?: string[]
}

export class RenderedContent {
  @ApiProperty({
    description: 'Rendered in-app notification content',
    required: false,
    example: {
      title: 'Order Confirmed',
      content: 'Your order #12345 has been confirmed.'
    }
  })
  inApp?: {
    title: string
    content: string
  }

  @ApiProperty({
    description: 'Rendered email notification content',
    required: false,
    example: {
      subject: 'Your Order #12345 Has Been Confirmed',
      body: '<h1>Your Order is Confirmed</h1><p>Hello John,</p><p>Thank you for your order #12345.</p>',
      isHtml: true
    }
  })
  email?: {
    subject: string
    body: string
    isHtml: boolean
  }

  // Add other channels as needed
}
