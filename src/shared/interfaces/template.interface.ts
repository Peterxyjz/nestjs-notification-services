// src/core/interfaces/template.interface.ts
export interface TemplateContent {
  title?: string
  content?: string
  subject?: string
  body?: string
  isHtml?: boolean
}

export interface TemplateChannels {
  inApp?: TemplateContent
  email?: TemplateContent
  // Thêm các kênh khác khi cần
}

export interface TemplateRenderRequest {
  templateId: string
  data: Record<string, any>
  locale?: string
  channels?: string[]
}

export interface RenderedContent {
  inApp?: {
    title: string
    content: string
  }
  email?: {
    subject: string
    body: string
    isHtml: boolean
  }
  // Thêm các kênh khác khi cần
}
