import * as fs from 'fs'
import * as path from 'path'
import Handlebars from 'handlebars'

export class TemplateService {
  private base = path.resolve(process.cwd(), 'templates')
  render(templatePath: string, context: any) {
    const full = path.join(this.base, templatePath)
    const src = fs.readFileSync(full, 'utf8')
    const t = Handlebars.compile(src)
    return t(context)
  }
  write(targetPath: string, content: string) {
    const full = path.resolve(process.cwd(), targetPath)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content, 'utf8')
    return full
  }
}
