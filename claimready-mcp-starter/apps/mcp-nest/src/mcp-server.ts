#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load standards JSON
function loadStandards() {
  const possiblePaths = [
    path.resolve(__dirname, '../../../../standards/claimready-standards.json'),
    path.resolve(__dirname, '../../../standards/claimready-standards.json'),
    path.resolve(__dirname, '../../standards/claimready-standards.json'),
    path.resolve(process.cwd(), 'standards/claimready-standards.json'),
  ];

  for (const standardsPath of possiblePaths) {
    if (fs.existsSync(standardsPath)) {
      const standardsContent = fs.readFileSync(standardsPath, 'utf8');
      console.error(`✅ Loaded standards from: ${standardsPath}`);
      return JSON.parse(standardsContent);
    }
  }

  throw new Error('Could not find claimready-standards.json');
}

const standards = loadStandards();

// Helper to call the REST API validation server
async function callValidationAPI(endpoint: string, body: any = {}): Promise<any> {
  const url = `http://localhost:7101${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to call validation API at ${url}: ${error.message}`);
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'claimready-standards',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'validate_file',
        description: 'Validate a single file against ClaimReady standards. Checks frontend (Vue), backend (TypeScript), Python, and deployment patterns.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute or relative path to the file to validate',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'validate_changes',
        description: 'Validate all staged git changes against ClaimReady standards. Use before committing code.',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional: specific files to validate. If empty, validates all staged changes.',
            },
          },
        },
      },
      {
        name: 'check_standard',
        description: 'Check if code follows a specific ClaimReady standard pattern. Use to verify code meets specific requirements.',
        inputSchema: {
          type: 'object',
          properties: {
            standardId: {
              type: 'string',
              description: 'Standard ID (e.g., frontend-explicit-imports, backend-mongodb-uri-format, python-explicit-none-check)',
              enum: [
                'frontend-explicit-imports',
                'frontend-page-hero-header',
                'frontend-navigation-present',
                'frontend-ui-consistency',
                'backend-mongodb-uri-format',
                'backend-dual-collection-save',
                'backend-authorizer-graphql',
                'backend-dto-validation-required',
                'backend-service-injection',
                'python-explicit-none-check',
                'python-mongodb-dual-save',
                'python-pinned-versions',
                'deployment-submodule-sync',
                'deployment-env-vars',
                'deployment-railway-config',
                'git-commit-format',
                'git-branch-naming',
              ],
            },
            code: {
              type: 'string',
              description: 'Code snippet to validate against the standard',
            },
            filePath: {
              type: 'string',
              description: 'Optional: file path for context',
            },
          },
          required: ['standardId'],
        },
      },
      {
        name: 'list_standards',
        description: 'List all ClaimReady standards with their descriptions, severity levels, and what production issues they prevent.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['frontend', 'backend', 'python', 'deployment', 'git'],
              description: 'Optional: filter by category',
            },
            severity: {
              type: 'string',
              enum: ['error', 'warning', 'info'],
              description: 'Optional: filter by severity',
            },
          },
        },
      },
      {
        name: 'get_standard_details',
        description: 'Get detailed information about a specific standard including examples, rationale, and the production issue it prevents.',
        inputSchema: {
          type: 'object',
          properties: {
            standardId: {
              type: 'string',
              description: 'Standard ID to get details for',
            },
          },
          required: ['standardId'],
        },
      },
      {
        name: 'validate_deployment',
        description: 'Run pre-deployment validation checks (submodules, env vars, etc.). Use before deploying to production.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'standards://claimready/all',
        name: 'All ClaimReady Standards',
        description: 'Complete ClaimReady standards JSON - learned from production issues',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'standards://claimready/all') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify(standards, null, 2),
        },
      ],
    };
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'validate_file': {
        const filePath = (args as any).filePath;
        if (!filePath) {
          throw new Error('filePath is required');
        }

        const result = await callValidationAPI('/validation/file', { filePath });

        if (result.canCommit === false || result.violations?.length > 0) {
          const violations = result.violations || [];
          const violationText = violations
            .map((v: any) => {
              return `❌ ${v.severity?.toUpperCase() || 'ERROR'}: ${v.message}\n   File: ${v.file}${v.line ? `:${v.line}` : ''}\n   ${v.fix ? `Fix: ${v.fix}` : ''}`;
            })
            .join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `❌ Validation failed\n\n${violationText}\n\nChecks run: ${result.checksRun?.join(', ') || 'N/A'}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ File passed all validation checks\n\nChecks run: ${result.checksRun?.join(', ') || 'N/A'}`,
            },
          ],
        };
      }

      case 'validate_changes': {
        const files = (args as any).files || [];
        const result = await callValidationAPI('/validation/pre-commit', { files });

        if (result.canCommit === false || result.violations?.length > 0) {
          const violations = result.violations || [];
          const violationText = violations
            .map((v: any) => {
              return `❌ ${v.severity?.toUpperCase() || 'ERROR'}: ${v.message}\n   File: ${v.file}${v.line ? `:${v.line}` : ''}\n   ${v.fix ? `Fix: ${v.fix}` : ''}`;
            })
            .join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `❌ ${violations.length} violation(s) found\n\n${violationText}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ All changes passed validation\n\nChecks run: ${result.checksRun?.join(', ') || 'N/A'}`,
            },
          ],
        };
      }

      case 'check_standard': {
        const standardId = (args as any).standardId;
        const code = (args as any).code;
        const filePath = (args as any).filePath;

        if (!standardId) {
          throw new Error('standardId is required');
        }

        const result = await callValidationAPI('/validation/pattern', {
          patternId: standardId,
          code,
          filePath,
        });

        return {
          content: [
            {
              type: 'text',
              text: result.passed
                ? `✅ Code follows standard: ${standardId}\n\n${result.message}`
                : `❌ Code violates standard: ${standardId}\n\n${result.message}\n\n${result.fix ? `Fix: ${result.fix}` : ''}`,
            },
          ],
        };
      }

      case 'list_standards': {
        const category = (args as any).category;
        const severity = (args as any).severity;

        let filteredStandards: any[] = [];

        // Flatten standards by category
        for (const [cat, items] of Object.entries(standards.standards)) {
          if (category && cat !== category) continue;

          for (const [, standard] of Object.entries(items as any)) {
            if (severity && (standard as any).severity !== severity) continue;
            filteredStandards.push({
              category: cat,
              ...(standard as any),
            });
          }
        }

        const text = filteredStandards
          .map((s) => {
            return `**${s.id}** (${s.severity})\nCategory: ${s.category}\n${s.description}\n${s.learnedFrom ? `Learned from: ${s.learnedFrom}` : ''}`;
          })
          .join('\n\n---\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${filteredStandards.length} standards:\n\n${text}`,
            },
          ],
        };
      }

      case 'get_standard_details': {
        const standardId = (args as any).standardId;
        if (!standardId) {
          throw new Error('standardId is required');
        }

        // Find the standard
        let standard: any = null;
        for (const category of Object.values(standards.standards)) {
          for (const std of Object.values(category as any)) {
            if ((std as any).id === standardId) {
              standard = std;
              break;
            }
          }
          if (standard) break;
        }

        if (!standard) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Standard not found: ${standardId}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(standard, null, 2),
            },
          ],
        };
      }

      case 'validate_deployment': {
        const result = await callValidationAPI('/validation/deployment');

        const checksText = result.checks
          ?.map((c: any) => {
            return `${c.passed ? '✅' : '❌'} ${c.name} (${c.severity})\n   ${c.message}${c.fix ? `\n   Fix: ${c.fix}` : ''}`;
          })
          .join('\n\n') || 'No checks available';

        return {
          content: [
            {
              type: 'text',
              text: result.ready
                ? `✅ Deployment ready!\n\n${checksText}`
                : `❌ Deployment not ready\n\n${checksText}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}\n\nMake sure the validation server is running:\n  ./start-mcp.sh\n\nOr start it manually:\n  cd apps/mcp-nest && PORT=7101 node dist/main.js`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ClaimReady Standards MCP Server running on stdio');
  console.error('Validation API should be running on http://localhost:7101');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
