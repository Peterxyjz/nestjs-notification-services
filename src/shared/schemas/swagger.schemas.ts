// src/shared/schemas/swagger.schemas.ts
import { ApiProperty } from '@nestjs/swagger'

export class PaginationMeta {
  @ApiProperty({
    description: 'Total number of items',
    example: 50
  })
  total: number

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 5
  })
  totalPages: number

  @ApiProperty({
    description: 'Number of unread notifications',
    example: 3
  })
  unreadCount: number
}

export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of data items',
    isArray: true
  })
  data: T[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta
  })
  meta: PaginationMeta
}

export class HealthCheckResponse {
  @ApiProperty({
    description: 'Status of the API',
    example: 'ok'
  })
  status: string

  @ApiProperty({
    description: 'Current server timestamp',
    example: '2024-03-21T15:30:45.123Z'
  })
  timestamp: string

  @ApiProperty({
    description: 'API version',
    example: '1.0.0'
  })
  version: string

  @ApiProperty({
    description: 'Environment',
    example: 'production'
  })
  environment: string
}
