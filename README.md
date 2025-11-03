# Refinery Platform

Monorepo containing all Refinery Platform services and shared libraries.

## Services

- **[refinery-api](./refinery-api/)** - REST API service for document extraction
- **[refinery-gateway](./refinery-gateway/)** - API Gateway with authentication and rate limiting
- **[refinery-formready](./refinery-formready/)** - Form management UI (Vue.js)
- **[refinery-chrome-extension](./refinery-chrome-extension/)** - Chrome extension for VA.gov profile syncing
- **[refinery-python](./refinery-python/)** - Python service for document processing
- **[refinery-processor](./refinery-processor/)** - Document processing service
- **[refinery-types](./refinery-types/)** - Shared TypeScript types and interfaces
- **[refinery-e2e-tests](./refinery-e2e-tests/)** - End-to-end regression testing suite

## E2E Regression Testing

End-to-end tests are maintained in the [refinery-e2e-tests](./refinery-e2e-tests/) directory using Playwright.

**Quick Start:**
```bash
cd refinery-e2e-tests
npm install
npm test
```

**Why separate directory?**
- Tests run against deployed environments (local, staging, production)
- Independent deployment cadence from services
- Cross-service workflow testing
- Clean separation of test code from production code

See [refinery-e2e-tests/README.md](./refinery-e2e-tests/README.md) for full documentation.

---

## @refinery/types

Shared TypeScript types and interfaces for Refinery Platform.

## Local Development Setup

### Option 1: TypeScript Path Mapping (Recommended for Development)

Each service has a `tsconfig.local.json` that maps `@refinery/types` directly to the source:

```bash
# In any service directory (refinery-api, refinery-processor, refinery-queue)
npm run build:local  # Uses tsconfig.local.json with path mapping
```

This approach:
- ✅ No need to publish or link packages
- ✅ Changes to types are instantly available
- ✅ Works with Bun, TypeScript, and hot reload
- ✅ No symlink issues

### Option 2: NPM Link (Alternative)

```bash
# In refinery-types directory
npm link

# In each service directory
npm link @refinery/types
```

### Option 3: Direct File Reference (Simplest)

```json
// In service package.json
"dependencies": {
  "@refinery/types": "file:../refinery-types"
}
```

## Production / CI Setup

For production and CI, publish the package:

```bash
# In refinery-types directory
npm version patch  # or minor/major
npm publish        # Publishes to npm registry
```

Then in each service:
```json
"dependencies": {
  "@refinery/types": "^0.1.0"
}
```

## Usage

```typescript
import {
  Component,
  ExecutionContext,
  Pipeline,
  StorageConfig
} from '@refinery/types';

// Use the types
class MyComponent implements Component<MyConfig, MyResult> {
  // ...
}
```

## Type Categories

- **components/** - Component interfaces and base types
- **pipelines/** - Pipeline and execution types
- **storage/** - Storage configurations and clients
- **api/** - API request/response types
- **queue/** - Job and message types
- **common/** - Shared business types

## Development Workflow

1. Make changes to types in `/refinery-types/src/`
2. Services using `tsconfig.local.json` see changes immediately
3. For production, bump version and publish
4. Update service dependencies to new version

## Bun Compatibility

This package uses only standard TypeScript with no decorators or experimental features, ensuring full compatibility with Bun runtime.