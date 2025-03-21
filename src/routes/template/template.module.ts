// src/routes/template/template.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HandlebarsEngine } from './engines/handlebars.engine'
import { HbsEngine } from './engines/hbs.engine'
import { Template, TemplateSchema } from './schemas/template.schema'
import { TemplateEngineFactory } from './template-engine.factory'
import { TemplateController } from './template.controller'
import { TemplateService } from './template.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }])
  ],
  providers: [TemplateService, HandlebarsEngine, HbsEngine, TemplateEngineFactory],
  controllers: [TemplateController],
  exports: [TemplateService]
})
export class TemplateModule {}
