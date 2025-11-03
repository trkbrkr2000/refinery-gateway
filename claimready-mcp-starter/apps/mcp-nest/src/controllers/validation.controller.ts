import { Controller, Post, Body } from '@nestjs/common'
import { ValidatorService } from '../services/validator.service'

@Controller('validation')
export class ValidationController {
  constructor(private readonly validator: ValidatorService) {}

  @Post('pre-commit')
  async validatePreCommit(@Body() body: { files?: string[]; allFiles?: boolean }) {
    const files = body.files || []
    const allFiles = body.allFiles || false

    const result = await this.validator.validateChanges(files, allFiles)

    if (result.violations.length > 0) {
      return {
        success: false,
        canCommit: false,
        violations: result.violations,
        summary: `❌ Found ${result.violations.length} violation(s). Commit blocked.`,
        fixInstructions: result.violations.map(v => v.fix).filter(Boolean)
      }
    }

    return {
      success: true,
      canCommit: true,
      message: '✅ All validation checks passed',
      checksRun: result.checksRun
    }
  }

  @Post('file')
  async validateFile(@Body() body: { filePath: string }) {
    const result = await this.validator.validateFile(body.filePath)

    return {
      filePath: body.filePath,
      valid: result.violations.length === 0,
      violations: result.violations
    }
  }

  @Post('pattern')
  async validatePattern(@Body() body: { patternId: string; code?: string; filePath?: string }) {
    const result = await this.validator.validateSpecificPattern(
      body.patternId,
      body.code,
      body.filePath
    )

    return {
      patternId: body.patternId,
      passed: result.passed,
      message: result.message,
      fix: result.fix
    }
  }

  @Post('deployment')
  async validateDeployment() {
    const result = await this.validator.validateDeployment()

    return {
      ready: result.ready,
      checks: result.checks,
      blockers: result.checks.filter(c => !c.passed && c.severity === 'error'),
      warnings: result.checks.filter(c => !c.passed && c.severity === 'warning')
    }
  }
}
