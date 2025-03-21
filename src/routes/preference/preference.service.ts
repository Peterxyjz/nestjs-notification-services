import { UpdatePreferenceDto } from '@/routes/preference/dto/preference.dto'
import { DEFAULT_PREFERENCES } from '@/shared/constants/notification.constants'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Preference, PreferenceDocument } from './schemas/preference.schema'

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger(PreferenceService.name)

  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>
  ) {}

  async findByUserId(userId: string) {
    const preference = await this.preferenceModel.findOne({ userId }).exec()
    if (!preference) {
      throw new NotFoundException(`Preference for user ${userId} not found`)
    }
    return preference
  }

  async findOrCreateByUserId(userId: string) {
    try {
      // Tìm preference hiện có
      let preference = await this.preferenceModel.findOne({ userId }).exec()

      // Nếu chưa có, tạo mới với giá trị mặc định
      if (!preference) {
        preference = await this.preferenceModel.create({
          userId,
          channels: DEFAULT_PREFERENCES.channels,
          types: DEFAULT_PREFERENCES.types
        })
      }

      return preference
    } catch (error) {
      this.logger.error(
        `Failed to find or create preference: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async update(userId: string, updatePreferenceDto: UpdatePreferenceDto) {
    const updateData: any = {}

    // Cập nhật channels nếu có
    if (updatePreferenceDto.channels) {
      for (const [channel, enabled] of Object.entries(
        updatePreferenceDto.channels
      )) {
        updateData[`channels.${channel}`] = enabled
      }
    }

    // Cập nhật notification types nếu có
    if (updatePreferenceDto.types) {
      for (const [type, preference] of Object.entries(updatePreferenceDto.types)) {
        updateData[`types.${type}`] = preference
      }
    }

    // Cập nhật preference
    const updatedPreference = await this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      )
      .exec()

    return updatedPreference
  }

  async removeTypePreference(userId: string, notificationType: string) {
    const preference = await this.findOrCreateByUserId(userId)

    if (preference.types && preference.types[notificationType]) {
      await this.preferenceModel.updateOne(
        { userId },
        { $unset: { [`types.${notificationType}`]: 1 } }
      )
    }

    return this.findByUserId(userId)
  }
}
