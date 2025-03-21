import { TemplateEngine } from '@/shared/interfaces/template-engine.interface'
import { Injectable } from '@nestjs/common'
import Handlebars from 'handlebars'

@Injectable()
export class HandlebarsEngine implements TemplateEngine {
  name = 'handlebars'

  compile(template: string): (data: any) => string {
    return Handlebars.compile(template)
  }

  // Nếu bạn muốn hỗ trợ đọc từ file
  async renderFile(filePath: string, data: any): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs').promises
    const template = await fs.readFile(filePath, 'utf8')
    return this.compile(template)(data)
  }
}
