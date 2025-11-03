import { Controller, Post, Body } from '@nestjs/common'
import axios from 'axios'

@Controller('parse')
export class ParseController {
  @Post()
  async parse(@Body() body: { s3Key: string, uploadId?: string }) {
    const { data } = await axios.post((process.env.PARSER_BASE_URL || 'http://localhost:8100') + '/parse', { s3Key: body.s3Key })
    return data
  }
}
