import {
  CreateTemplateDto,
  UpdateTemplateDto
} from '@/routes/template/dto/template.dto'
import { TemplateEngineFactory } from '@/routes/template/template-engine.factory'
import {
  RenderedContent,
  TemplateRenderRequest
} from '@/shared/interfaces/template.interface'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Template, TemplateDocument } from './schemas/template.schema'

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name)
  private readonly compiledTemplates = new Map<string, any>()

  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    private templateEngineFactory: TemplateEngineFactory
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    try {
      // Validate các biến trong template
      this.validateTemplateVariables(createTemplateDto)

      const templateData = {
        name: createTemplateDto.name,
        type: createTemplateDto.type,
        channels: createTemplateDto.channels,
        variables: createTemplateDto.variables,
        translations: createTemplateDto.translations,
        active: createTemplateDto.active ?? true
      }
      const createdTemplate = await this.templateModel.create(templateData)
      return createdTemplate.toObject()
    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`, error.stack)
      throw error
    }
  }

  private validateTemplateVariables(template: CreateTemplateDto) {
    const declaredVariables = new Set(template.variables)

    // Kiểm tra các biến trong template content cho mỗi kênh
    for (const [channelName, channelContent] of Object.entries(template.channels)) {
      for (const [contentKey, contentValue] of Object.entries(channelContent)) {
        if (typeof contentValue === 'string') {
          // Handlebars regular expression to find variables
          const regex = /{{([^{}]+)}}/g
          let match
          while ((match = regex.exec(contentValue)) !== null) {
            const variable = match[1].trim()
            // Bỏ qua helpers và block expressions
            if (!variable.includes(' ') && !declaredVariables.has(variable)) {
              throw new Error(
                `Undeclared variable "${variable}" in ${channelName}.${contentKey}`
              )
            }
          }
        }
      }
    }
  }

  async findAll() {
    return this.templateModel.find().exec()
  }

  async findOne(id: string) {
    const template = await this.templateModel.findById(id).exec()
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }
    return template
  }

  async findByType(type: string) {
    const template = await this.templateModel.findOne({ type, active: true }).exec()
    if (!template) {
      throw new NotFoundException(`Active template with type ${type} not found`)
    }
    return template
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto) {
    // Validate template variables if channels are being updated
    if (updateTemplateDto.channels) {
      const template = await this.findOne(id)
      const mergedTemplate = {
        ...template.toObject(),
        ...updateTemplateDto,
        variables: updateTemplateDto.variables || template.variables
      }

      this.validateTemplateVariables(mergedTemplate as CreateTemplateDto)
    }

    const updatedTemplate = await this.templateModel
      .findByIdAndUpdate(id, updateTemplateDto, { new: true })
      .exec()

    if (!updatedTemplate) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    // Xóa template đã biên dịch khỏi cache
    this.clearCompiledTemplate(id)

    return updatedTemplate
  }

  async remove(id: string) {
    const template = await this.findOne(id)
    await template.deleteOne()
    // Xóa template đã biên dịch khỏi cache
    this.clearCompiledTemplate(id)
    return { id }
  }

  private clearCompiledTemplate(templateId: string) {
    // Xóa tất cả các template biên dịch liên quan đến templateId
    for (const key of this.compiledTemplates.keys()) {
      if (key.startsWith(`${templateId}_`)) {
        this.compiledTemplates.delete(key)
      }
    }
  }

  async renderTemplate(request: TemplateRenderRequest): Promise<RenderedContent> {
    try {
      const { templateId, data, locale = 'default', channels = [] } = request

      // Lấy template
      const template = await this.findOne(templateId)

      const result: RenderedContent = {}

      // Render cho mỗi kênh được yêu cầu
      for (const [channelName, channelContent] of Object.entries(
        template.channels
      )) {
        // Bỏ qua nếu không yêu cầu kênh này
        if (channels.length > 0 && !channels.includes(channelName)) {
          continue
        }

        // Lấy nội dung phù hợp với ngôn ngữ
        const localizedContent = this.getLocalizedContent(
          template,
          channelName,
          locale
        )

        // Nếu không có nội dung cho kênh này, bỏ qua
        if (!localizedContent) {
          continue
        }

        // Biên dịch và render template cho từng trường
        const renderedChannelContent: any = {}

        for (const [fieldName, fieldValue] of Object.entries(localizedContent)) {
          if (typeof fieldValue === 'string') {
            // Lấy engine type từ template hoặc mặc định là handlebars
            const engineType = localizedContent.engineType || 'handlebars'
            const engine = this.templateEngineFactory.getEngine(engineType)

            const cacheKey = `${templateId}_${channelName}_${fieldName}_${locale}_${engineType}`
            const compiledTemplate = this.getCompiledTemplate(
              cacheKey,
              fieldValue,
              engineType
            )

            renderedChannelContent[fieldName] = compiledTemplate(data)
          }
        }

        result[channelName] = renderedChannelContent
      }

      return result
    } catch (error) {
      this.logger.error(`Template rendering failed: ${error.message}`, error.stack)
      throw error
    }
  }

  private getCompiledTemplate(
    cacheKey: string,
    templateContent: string,
    engineType: string
  ) {
    if (!this.compiledTemplates.has(cacheKey)) {
      const engine = this.templateEngineFactory.getEngine(engineType)
      this.compiledTemplates.set(cacheKey, engine.compile(templateContent))
    }
    return this.compiledTemplates.get(cacheKey)
  }

  private getLocalizedContent(
    template: Template,
    channelName: string,
    locale: string
  ) {
    // Nếu có bản dịch cho locale này
    if (
      template.translations &&
      template.translations[locale] &&
      template.translations[locale][channelName]
    ) {
      return {
        ...template.channels[channelName],
        ...template.translations[locale][channelName]
      }
    }

    // Sử dụng nội dung mặc định
    return template.channels[channelName]
  }
}
