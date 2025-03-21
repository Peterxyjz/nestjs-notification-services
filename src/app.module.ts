import generateModulesSet from '@/shared/utils/modules-set'
import { Module } from '@nestjs/common'

@Module({
  imports: generateModulesSet(),
  providers: []
})
export class AppModule {}
