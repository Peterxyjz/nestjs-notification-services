import {
  ChannelPreferences,
  NotificationTypePreference
} from '@/shared/interfaces/preference.interface'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PreferenceDocument = Preference & Document

@Schema({ timestamps: true })
export class Preference {
  @Prop({ required: true, unique: true })
  userId: string

  @Prop({
    type: Object,
    default: () => ({
      inApp: true,
      email: true
    })
  })
  channels: ChannelPreferences

  @Prop({ type: Object, default: () => ({}) })
  types: Record<string, NotificationTypePreference>
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference)
PreferenceSchema.index({ userId: 1 })
