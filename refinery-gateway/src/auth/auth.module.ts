import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SwaggerScopeExtractorService } from './swagger-scope-extractor.service';
import { User, UserSchema } from '../common/schemas/user.schema';
import { ApiKey, ApiKeySchema } from '../common/schemas/api-key.schema';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PassportModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SwaggerScopeExtractorService],
  exports: [AuthService, SwaggerScopeExtractorService, JwtModule],
})
export class AuthModule {}
