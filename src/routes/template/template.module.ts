import { TemplateController } from '@/routes/template/template.controller'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Template, TemplateSchema } from './schemas/template.schema'
import { TemplateService } from './template.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }])
  ],
  providers: [TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService]
})
export class TemplateModule {}
