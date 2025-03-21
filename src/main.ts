import envConfig from '@/shared/config'
import setupSwagger from '@/shared/utils/setup-swagger'
import {
  ClassSerializerInterceptor,
  RequestMethod,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType
} from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const reflector = app.get(Reflector)
  //CORS
  const corsOrigin = envConfig.APP_CORS_ORIGIN
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true
  })
  console.info('CORS Origin:', corsOrigin)

  // Use global prefix if you don't have subdomain
  app.setGlobalPrefix(envConfig.API_PREFIX, {
    exclude: [
      { method: RequestMethod.GET, path: '/' },
      { method: RequestMethod.GET, path: 'health' }
    ]
  })

  //version
  app.enableVersioning({
    type: VersioningType.URI
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      exceptionFactory: (validationErrors) => {
        return new UnprocessableEntityException(
          validationErrors.map((error) => ({
            field: error.property,
            error: Object.values(error.constraints as any).join(', ')
          }))
        )
      }
    })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector))

  //swagger
  setupSwagger(app)

  await app.listen(envConfig.APP_PORT)
  console.log(`
          ██████╗      █████╗     ███████╗    ███████╗
          ██╔══██╗    ██╔══██╗    ██╔════╝    ██╔════╝
          ██████╔╝    ███████║    ███████╗    ███████╗
          ██╔═══╝     ██╔══██║    ╚════██║    ╚════██║
          ██║         ██║  ██║    ███████║    ███████║
          ╚═╝         ╚═╝  ╚═╝    ╚══════╝    ╚══════╝
    🌟 Your NestJS app is now running! 🌟
    🛠️  Built with TypeScript & NestJS
    `)

  console.info(`Server running on ${await app.getUrl()}`)

  return app
}
bootstrap()
