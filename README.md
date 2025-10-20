# @refinery/types

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