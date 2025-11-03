import { Module } from '@nestjs/common'
import { MCPController } from './mcp.controller'
import { ValidationController } from './controllers/validation.controller'
import { TemplateService } from './template.service'
import { GoldenService } from './golden.service'
import { ValidatorService } from './services/validator.service'

@Module({
  controllers: [MCPController, ValidationController],
  providers: [TemplateService, GoldenService, ValidatorService]
})
export class AppModule {}
