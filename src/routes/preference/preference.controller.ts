import { UpdatePreferenceDto } from '@/routes/preference/dto/preference.dto'
import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import { PreferenceService } from './preference.service'

@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  findByUserId(@Query('userId') userId: string) {
    return this.preferenceService.findOrCreateByUserId(userId)
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ) {
    return this.preferenceService.update(userId, updatePreferenceDto)
  }

  @Delete(':userId/types/:type')
  removeTypePreference(
    @Param('userId') userId: string,
    @Param('type') type: string
  ) {
    return this.preferenceService.removeTypePreference(userId, type)
  }
}
