import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SwaggerScopeExtractorService } from '../auth/swagger-scope-extractor.service';

interface SwaggerDocument {
  openapi: string;
  info: any;
  servers?: any[];
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
  tags?: Array<{ name: string; description?: string }>;
}

@Injectable()
export class SwaggerMergerService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private scopeExtractor: SwaggerScopeExtractorService,
  ) {}

  async getMergedSwaggerDoc(): Promise<SwaggerDocument> {
    const services = [
      {
        name: 'VA Knowledge',
        prefix: '/api/va-knowledge',
        url: this.configService.get<string>('VA_KNOWLEDGE_SERVICE_URL'),
        tag: 'VA Knowledge',
        description: 'VA regulations, statutes, and knowledge base',
      },
      {
        name: 'Forms',
        prefix: '/api/forms',
        url: this.configService.get<string>('FORMS_SERVICE_URL'),
        tag: 'Forms',
        description: 'VA form generation and management',
      },
      {
        name: 'Processor',
        prefix: '/api/processor',
        url: this.configService.get<string>('PROCESSOR_SERVICE_URL'),
        tag: 'Processor',
        description: 'Document processing and analysis',
      },
    ];

    // Base document (gateway's own Swagger)
    const merged: SwaggerDocument = {
      openapi: '3.0.0',
      info: {
        title: 'Refinery Platform API',
        description:
          'Unified API documentation for all Refinery Platform services',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Development Gateway',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          JWT: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for user authentication',
          },
          'API-KEY': {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API key for service-to-service authentication',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentication and authorization' },
        { name: 'Admin', description: 'Admin API for user and key management' },
        { name: 'Gateway', description: 'Gateway health and status' },
      ],
    };

    // Fetch and merge backend service docs
    for (const service of services) {
      if (!service.url) {
        console.warn(`⚠️  ${service.name} service URL not configured, skipping`);
        continue;
      }

      try {
        // Try both NestJS (/api-json) and FastAPI (/openapi.json) endpoints
        const swaggerUrls = [
          `${service.url}/api-json`,      // NestJS
          `${service.url}/openapi.json`,  // FastAPI
        ];

        let serviceDoc: SwaggerDocument = null;
        let lastError = null;

        for (const swaggerUrl of swaggerUrls) {
          try {
            const response = await firstValueFrom(
              this.httpService.get(swaggerUrl, {
                timeout: 5000,
                // Omit 'family' to let Node.js auto-select IP version (fixes Railway internal DNS)
              }),
            );
            serviceDoc = response.data;
            break; // Success!
          } catch (err) {
            lastError = err;
          }
        }

        if (!serviceDoc) {
          throw lastError || new Error('No OpenAPI endpoint found');
        }

        // Add service tag
        merged.tags.push({
          name: service.tag,
          description: service.description,
        });

        // Merge paths with prefix, excluding internal routes
        if (serviceDoc.paths) {
          Object.keys(serviceDoc.paths).forEach((path) => {
            // Skip internal routes (those starting with /internal/)
            if (path.startsWith('/internal/') || path.startsWith('internal/')) {
              console.log(`🔒 Skipping internal route: ${path} from ${service.name}`);
              return;
            }

            const newPath = `${service.prefix}${path}`;
            const pathItem = serviceDoc.paths[path];

            // Add service tag to all operations
            Object.keys(pathItem).forEach((method) => {
              if (pathItem[method].tags) {
                pathItem[method].tags = [service.tag];
              } else {
                pathItem[method].tags = [service.tag];
              }

              // Add API-KEY security requirement
              if (!pathItem[method].security) {
                pathItem[method].security = [{ 'API-KEY': [] }];
              }
            });

            merged.paths[newPath] = pathItem;
          });
        }

        // Merge schemas
        if (serviceDoc.components?.schemas) {
          Object.keys(serviceDoc.components.schemas).forEach((schemaName) => {
            const prefixedName = `${service.name.replace(/\s/g, '')}${schemaName}`;
            merged.components.schemas[prefixedName] =
              serviceDoc.components.schemas[schemaName];
          });
        }

        console.log(`✅ Merged ${service.name} API (${Object.keys(serviceDoc.paths || {}).length} endpoints)`);
      } catch (error) {
        console.warn(
          `⚠️  Failed to fetch ${service.name} Swagger doc: ${error.message}`,
        );
      }
    }

    // Extract and cache scope mappings from merged document
    this.scopeExtractor.updateScopeMappings(merged);

    return merged;
  }
}
