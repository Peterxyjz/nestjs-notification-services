import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PreferenceController } from './preference.controller'
import { PreferenceService } from './preference.service'
import { Preference, PreferenceSchema } from './schemas/preference.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }])
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService],
  exports: [PreferenceService]
})
export class PreferenceModule {}
