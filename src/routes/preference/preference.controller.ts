import { UpdatePreferenceDto } from '@/routes/preference/dto/preference.dto'
import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { PreferenceService } from './preference.service'

@ApiTags('preferences')
@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences for a user' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID of the user to get preferences for'
  })
  @ApiResponse({
    status: 200,
    description: 'User notification preferences'
  })
  findByUserId(@Query('userId') userId: string) {
    return this.preferenceService.findOrCreateByUserId(userId)
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update notification preferences for a user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update preferences for'
  })
  @ApiBody({ type: UpdatePreferenceDto })
  @ApiResponse({
    status: 200,
    description: 'The notification preferences have been updated'
  })
  update(
    @Param('userId') userId: string,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ) {
    return this.preferenceService.update(userId, updatePreferenceDto)
  }

  @Delete(':userId/types/:type')
  @ApiOperation({ summary: 'Remove a specific notification type preference' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user'
  })
  @ApiParam({
    name: 'type',
    description: 'Type of notification preference to remove'
  })
  @ApiResponse({
    status: 200,
    description: 'The notification type preference has been removed'
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found'
  })
  removeTypePreference(
    @Param('userId') userId: string,
    @Param('type') type: string
  ) {
    return this.preferenceService.removeTypePreference(userId, type)
  }
}
