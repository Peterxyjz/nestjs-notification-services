// src/routes/template/template-engine.factory.ts
import { TemplateEngine } from '@/shared/interfaces/template-engine.interface'
import { Injectable } from '@nestjs/common'
import { HandlebarsEngine } from './engines/handlebars.engine'
import { HbsEngine } from './engines/hbs.engine'

@Injectable()
export class TemplateEngineFactory {
  private engines: Map<string, TemplateEngine> = new Map()

  constructor(
    private handlebarsEngine: HandlebarsEngine,
    private hbsEngine: HbsEngine
  ) {
    this.register(handlebarsEngine)
    this.register(hbsEngine)
  }

  register(engine: TemplateEngine): void {
    this.engines.set(engine.name, engine)
  }

  getEngine(name: string): TemplateEngine {
    const engine = this.engines.get(name)
    if (!engine) {
      throw new Error(`Template engine '${name}' not found`)
    }
    return engine
  }
}
