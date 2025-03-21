import { PartialType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator'

class TemplateContentDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  subject?: string

  @IsString()
  @IsOptional()
  body?: string

  @IsBoolean()
  @IsOptional()
  isHtml?: boolean
}

export class CreateTemplateDto {
  @IsString()
  name: string

  @IsString()
  type: string

  @IsObject()
  channels: {
    inApp?: TemplateContentDto
    email?: TemplateContentDto
  }

  @IsObject()
  @IsOptional()
  translations?: Record<string, any>

  @IsArray()
  variables: string[]

  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
