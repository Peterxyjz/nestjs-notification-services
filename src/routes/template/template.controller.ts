import {
  CreateTemplateDto,
  UpdateTemplateDto
} from '@/routes/template/dto/template.dto'
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { TemplateService } from './template.service'

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.create(createTemplateDto)
  }

  @Get()
  findAll() {
    return this.templateService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id)
  }

  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.templateService.findByType(type)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templateService.update(id, updateTemplateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templateService.remove(id)
  }
}
