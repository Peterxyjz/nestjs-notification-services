import envConfig from '@/shared/config'
import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

function setupSwagger(app: INestApplication) {
  const appName = envConfig.APP_NAME
  const url = envConfig.APP_URL
  const version = '1.0'

  const config = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription(`API documentation for the ${appName} notification system`)
    .setVersion(version)
    .addTag('notifications', 'Notification management endpoints')
    .addTag('preferences', 'User notification preferences endpoints')
    .addTag('templates', 'Notification template management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT-auth'
    )
    .addServer(url)
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true
  })

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: `${appName} API Documentation`,
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .information-container { padding: 25px 50px }
      .swagger-ui .information-container .info { margin: 0 }
      .swagger-ui .information-container .title { font-size: 2em }
      .swagger-ui .scheme-container { padding: 20px 0 }
      .swagger-ui .opblock-tag { font-size: 1.2em }
    `,
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true
    }
  })
}

export default setupSwagger
