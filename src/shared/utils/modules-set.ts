import envConfig from '@/shared/config'
import { SharedModule } from '@/shared/shared.module'
import { ModuleMetadata } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = envConfig.DB_URI
        const dbName = envConfig.DB_NAME
        return {
          uri,
          dbName,
          connectionFactory: (connection) => {
            return connection
          }
        }
      }
    })
  ]
  let customModules: ModuleMetadata['imports'] = []

  const modulesSet = envConfig.MODULES_SET || 'monolith'

  switch (modulesSet) {
    case 'monolith':
      customModules = [SharedModule]
      break
    default:
      console.error(`Unsupported modules set: ${modulesSet}`)
      break
  }
  return imports.concat(customModules)
}

export default generateModulesSet
