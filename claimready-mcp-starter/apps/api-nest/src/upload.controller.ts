import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as AWS from 'aws-sdk'

@Controller('upload')
export class UploadController {
  private s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: true,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
  })

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const Key = `${Date.now()}-${file.originalname}`
    await this.s3.putObject({
      Bucket: process.env.S3_BUCKET!,
      Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise()
    return { ok: true, key: Key }
  }
}
