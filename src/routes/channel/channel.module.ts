import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Notification,
  NotificationSchema
} from '../notification/schemas/notification.schema'
import { EmailAdapter } from './adapters/email.adapter'
import { InAppAdapter } from './adapters/in-app.adapter'
import { ChannelService } from './channel.service'

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  providers: [ChannelService, EmailAdapter, InAppAdapter],
  exports: [ChannelService]
})
export class ChannelModule {}
