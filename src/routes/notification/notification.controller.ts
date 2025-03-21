import { CreateNotificationDto } from '@/routes/notification/dto/notification.dto'
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { NotificationService } from './notification.service'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto)
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('unread') unread?: boolean
  ) {
    return this.notificationService.findAll(userId, page, limit, unread)
  }

  @Get('unread-count')
  getUnreadCount(@Query('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id)
  }

  @Post('mark-all-read')
  markAllAsRead(@Body('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId)
  }
}
