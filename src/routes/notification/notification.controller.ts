import { CreateNotificationDto } from '@/routes/notification/dto/notification.dto'
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { NotificationService } from './notification.service'

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully created.'
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number
  })
  @ApiQuery({
    name: 'unread',
    required: false,
    description: 'Filter for unread notifications',
    type: Boolean
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications with pagination metadata'
  })
  findAll(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('unread') unread?: boolean
  ) {
    return this.notificationService.findAll(userId, page, limit, unread)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications for a user' })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Count of unread notifications',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 5
        }
      }
    }
  })
  getUnreadCount(@Query('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'ID of the notification' })
  @ApiResponse({
    status: 200,
    description: 'The notification details'
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found'
  })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id)
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'ID of the notification' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been marked as read'
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found'
  })
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id)
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          example: '61dbae02-c147-4e28-863c-db7bd402b2d6'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        count: {
          type: 'number',
          example: 10
        }
      }
    }
  })
  markAllAsRead(@Body('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId)
  }
}
