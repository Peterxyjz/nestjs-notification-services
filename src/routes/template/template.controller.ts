import {
  CreateTemplateDto,
  UpdateTemplateDto
} from '@/routes/template/dto/template.dto'
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { TemplateService } from './template.service'

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'The notification template has been successfully created'
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.create(createTemplateDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({
    status: 200,
    description: 'List of all notification templates'
  })
  findAll() {
    return this.templateService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification template by ID' })
  @ApiParam({ name: 'id', description: 'ID of the template' })
  @ApiResponse({
    status: 200,
    description: 'The notification template'
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found'
  })
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id)
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get a notification template by type' })
  @ApiParam({ name: 'type', description: 'Type of the template' })
  @ApiResponse({
    status: 200,
    description: 'The notification template'
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found for this type'
  })
  findByType(@Param('type') type: string) {
    return this.templateService.findByType(type)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification template' })
  @ApiParam({ name: 'id', description: 'ID of the template to update' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({
    status: 200,
    description: 'The template has been updated'
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found'
  })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templateService.update(id, updateTemplateDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification template' })
  @ApiParam({ name: 'id', description: 'ID of the template to delete' })
  @ApiResponse({
    status: 200,
    description: 'The template has been deleted',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '507f1f77bcf86cd799439011'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found'
  })
  remove(@Param('id') id: string) {
    return this.templateService.remove(id)
  }
}
