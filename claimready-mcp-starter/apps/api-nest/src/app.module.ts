import { Module } from '@nestjs/common'
import { UploadController } from './upload.controller'
import { ParseController } from './parse.controller'
import { MongoClient } from 'mongodb'
import Redis from 'ioredis'

export const mongoProvider = {
  provide: 'MONGO',
  useFactory: async () => {
    const client = new MongoClient(process.env.MONGO_URI as string)
    await client.connect()
    return client.db()
  }
}

export const redisProvider = {
  provide: 'REDIS',
  useFactory: () => new Redis(process.env.REDIS_URL as string)
}

@Module({
  controllers: [UploadController, ParseController],
  providers: [mongoProvider, redisProvider]
})
export class AppModule {}
