import { Controller, Post, Body } from '@nestjs/common'
import { TemplateService } from './template.service'
import { GoldenService } from './golden.service'

@Controller('mcp')
export class MCPController {
  constructor(
    private readonly tmpl: TemplateService,
    private readonly goldens: GoldenService
  ) {}

  @Post('generate/service')
  async generateService(@Body() body: any) {
    const name = body.name || 'example'
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Service'
    const content = this.tmpl.render('nest/service.hbs', { className, name })
    const spec = this.tmpl.render('nest/service.spec.hbs', { className, name })
    const pathSvc = this.tmpl.write(`apps/api-nest/src/${name}.service.ts`, content)
    const pathSpec = this.tmpl.write(`apps/api-nest/test/${name}.service.spec.ts`, spec)
    return { created: [pathSvc, pathSpec] }
  }

  @Post('test/goldens')
  async runGoldens(@Body() body: any) {
    const base = body.parserBaseUrl || process.env.PARSER_BASE_URL || 'http://localhost:8100'
    const result = await this.goldens.run(base)
    return result
  }

  @Post('enforce/patterns')
  enforce(@Body() body: any) {
    // Placeholder: you can implement AST checks or regex scans for DTO validation, etc.
    return { ok: true, checks: ['dto-validation-required', 'idempotency-hints'] }
  }
}
