import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TemplateDocument = Template & Document

@Schema({ timestamps: true })
export class TemplateContent {
  @Prop()
  title?: string

  @Prop()
  content?: string

  @Prop()
  subject?: string

  @Prop()
  body?: string

  @Prop({ default: false })
  isHtml?: boolean
}

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  type: string

  @Prop({ type: Object })
  channels: {
    inApp?: TemplateContent
    email?: TemplateContent
  }

  @Prop({ type: Object })
  translations?: Record<string, any>

  @Prop([String])
  variables: string[]

  @Prop({ default: true })
  active: boolean
}

export const TemplateSchema = SchemaFactory.createForClass(Template)
TemplateSchema.index({ type: 1 })
