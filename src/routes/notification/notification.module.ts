import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChannelModule } from '../channel/channel.module'
import { PreferenceModule } from '../preference/preference.module'
import { TemplateModule } from '../template/template.module'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { Notification, NotificationSchema } from './schemas/notification.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ]),
    TemplateModule,
    PreferenceModule,
    ChannelModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
