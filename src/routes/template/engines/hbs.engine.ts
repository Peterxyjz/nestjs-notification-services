// src/routes/template/engines/hbs.engine.ts
import { TemplateEngine } from '@/shared/interfaces/template-engine.interface'
import { Injectable } from '@nestjs/common'
import * as Handlebars from 'handlebars'

@Injectable()
export class HbsEngine implements TemplateEngine {
  name = 'hbs'

  compile(template: string): (data: any) => string {
    return Handlebars.compile(template)
  }

  async renderFile(filePath: string, data: any): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs').promises
    const template = await fs.readFile(filePath, 'utf8')
    return this.compile(template)(data)
  }
}
