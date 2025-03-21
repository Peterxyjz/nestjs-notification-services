export interface TemplateEngine {
  name: string
  compile(template: string): (data: any) => string
  renderFile?(filePath: string, data: any): Promise<string>
}
