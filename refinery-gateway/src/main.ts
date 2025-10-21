import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SwaggerMergerService } from './gateway/swagger-merger.service';

async function bootstrap() {
  console.log('🚀 Starting Refinery API Gateway...');
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔌 MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('🔌 Redis URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');

  const app = await NestFactory.create(AppModule);
  console.log('✅ NestJS application created');

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
  // Always allow same-origin for Swagger
  allowedOrigins.push(process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:8080');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Be permissive for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Determine port for Swagger server URL
  const port = process.env.PORT || 8080;

  // Gateway-only Swagger (auth, admin, health endpoints)
  // Railway sets RAILWAY_PUBLIC_DOMAIN or RAILWAY_STATIC_URL
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL;
  const baseUrl = publicDomain
    ? `https://${publicDomain}`
    : `http://localhost:${port}`;

  console.log(`🌐 Swagger server URL: ${baseUrl}`);

  const gatewayConfig = new DocumentBuilder()
    .setTitle('Refinery API Gateway')
    .setDescription(
      'Gateway endpoints for authentication, admin, and health checks',
    )
    .setVersion('1.0')
    .addServer(baseUrl, process.env.NODE_ENV === 'production' ? 'Production' : 'Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for service-to-service authentication',
      },
      'API-KEY',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Admin', 'Admin API for user and key management')
    .addTag('Gateway', 'Health and status')
    .build();

  const gatewayDocument = SwaggerModule.createDocument(app, gatewayConfig);
  SwaggerModule.setup('api/docs/gateway', app, gatewayDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Merged Swagger (all services combined)
  const swaggerMerger = app.get(SwaggerMergerService);
  try {
    console.log('🔄 Fetching and merging backend service Swagger docs...');
    const mergedDocument = await swaggerMerger.getMergedSwaggerDoc();

    // Add gateway's own paths to merged doc
    Object.assign(mergedDocument.paths, gatewayDocument.paths);

    SwaggerModule.setup('api/docs', app, mergedDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
    console.log('✅ Merged Swagger documentation ready');
  } catch (error) {
    console.error('❌ Failed to merge Swagger docs:', error.message);
    // Fallback to gateway-only docs
    SwaggerModule.setup('api/docs', app, gatewayDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);

  console.log(`🚀 API Gateway running on http://localhost:${port}`);
  console.log(`📚 Unified API Docs: http://localhost:${port}/api/docs`);
  console.log(`📚 Gateway-only Docs: http://localhost:${port}/api/docs/gateway`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
