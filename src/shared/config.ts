import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import 'reflect-metadata'

config({
  path: '.env'
})

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

class ConfigSchema {
  @IsString()
  @IsNotEmpty()
  NODE_ENV: string

  @IsString()
  @IsNotEmpty()
  MODULES_SET: string

  @IsString()
  @IsNotEmpty()
  APP_NAME: string

  @IsString()
  @IsNotEmpty()
  APP_URL: string

  @IsNumber()
  @IsNotEmpty()
  APP_PORT: number

  @IsString()
  @IsNotEmpty()
  API_PREFIX: string

  @IsString()
  @IsNotEmpty()
  APP_CORS_ORIGIN: string

  @IsString()
  @IsNotEmpty()
  DB_URI: string

  @IsString()
  @IsNotEmpty()
  DB_NAME: string

  @IsString()
  @IsNotEmpty()
  EMAIL_HOST: string

  @IsNotEmpty()
  EMAIL_PORT: string

  @IsNotEmpty()
  EMAIL_SECURE: string

  @IsNotEmpty()
  EMAIL_USER: string

  @IsNotEmpty()
  EMAIL_PASS: string

  @IsNotEmpty()
  EMAIL_FROM: string
}
const configServer = plainToInstance(ConfigSchema, process.env, {
  enableImplicitConversion: true
})
const errorArray = validateSync(configServer)

if (errorArray.length > 0) {
  console.log('Các giá trị khai báo trong file .env không hợp lệ')
  const errors = errorArray.map((eItem) => {
    return {
      property: eItem.property,
      constraints: eItem.constraints,
      value: eItem.value
    }
  })
  throw errors
}
const envConfig = configServer

export default envConfig
