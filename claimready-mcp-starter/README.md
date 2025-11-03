# ClaimReady MCP: Coding Buddy & Standards Enforcement

Your standalone coding guardrail system that **blocks commits** violating ClaimReady standards, learned from real production issues.

## What It Does

- ✅ **Blocks Bad Commits**: Git hooks prevent code that violates standards
- ✅ **Enforces Patterns**: 16+ validators check frontend, backend, Python, and deployment
- ✅ **Learned from Production**: Every standard comes from a real bug we fixed
- ✅ **Clear Fix Instructions**: Violations show exactly how to fix the issue
- ✅ **Evolving Standards**: Standards can be proposed, reviewed, and saved
- ✅ **Standalone**: No external dependencies, runs locally

## Layout

```
standards/
  claimready-standards.json  # THE GOLDEN TRUTH - All standards in one place
  history/                   # Standards evolution over time
  proposals/                 # Pending standards awaiting approval
apps/
  mcp-nest/                  # MCP Server (NestJS) - Runs validators
    src/
      controllers/
        validation.controller.ts    # Validation endpoints
      services/
        validator.service.ts        # Validator orchestration
      validators/
        frontend/                   # Vue/Nuxt validators
        backend/                    # NestJS validators
        python/                     # Python validators
        deployment/                 # Git/deployment validators
scripts/
  git-hooks/
    pre-commit                # Git hook that blocks bad commits
  install-hooks.sh            # Install hooks into your repo
  golden-test-runner.mjs      # Golden test runner
```

## Quick Start

### 1. Start the MCP Server

**Easy way:**
```bash
./start-mcp.sh
```

**Manual way:**
```bash
cd apps/mcp-nest
npm install
npm run build
PORT=7101 node dist/main.js
```

Server runs on `http://localhost:7101`

### 1b. Add to Claude Desktop

Install the ClaimReady Standards MCP into Claude Desktop:

```bash
./install-claude-mcp.sh
```

This will add the MCP server to your Claude Desktop config. **Restart Claude Desktop** to activate it.

Once restarted, you'll have these tools available in Claude conversations:
- `validate_file` - Check a file against all standards
- `validate_changes` - Validate staged git changes
- `check_standard` - Test code against a specific standard
- `list_standards` - See all available standards
- `get_standard_details` - Get details about a specific standard
- `validate_deployment` - Run pre-deployment checks

**Important**: The validation API must be running (port 7101) for the MCP tools to work. Start it with `./start-mcp.sh`

### 2. Install Git Hooks

```bash
./scripts/install-hooks.sh
```

This installs the pre-commit hook that validates code before allowing commits.

### 3. Try It Out

Make a change that violates a standard and try to commit:

```bash
# Example: Create a Vue page without Navigation component
echo '<template><div>No navigation!</div></template>' > test-page.vue
git add test-page.vue
git commit -m "Test commit"
```

You'll see:
```
❌ COMMIT BLOCKED - Standards violations found

File: test-page.vue
ERROR: Authenticated page missing Navigation component

Fix: Add Navigation component at the top of your template...
```

### 4. View All Standards

```bash
cat standards/claimready-standards.json
```

## MCP API Endpoints

### Validation

```bash
# Validate files before commit (called by git hook)
POST /validation/pre-commit
Body: { "files": ["path/to/file.vue", ...] }

# Validate a single file
POST /validation/file
Body: { "filePath": "path/to/file.ts" }

# Check deployment readiness
POST /validation/deployment
```

### Standards Management (Coming Soon)

```bash
# List all standards
GET /standards/list

# Propose new standard
POST /standards/propose
Body: { "standard": {...}, "rationale": "..." }

# Approve proposed standard
POST /standards/approve
Body: { "proposalId": "..." }
```

### Code Generation (Existing)

```bash
# Generate NestJS service
POST /mcp/generate/service
Body: { "name": "example" }

# Run golden tests
POST /mcp/test/goldens
```

## Standards Included

### Frontend (Vue/Nuxt)
- ✅ Explicit component imports (Navigation issue)
- ✅ Hero header on authenticated pages
- ✅ Navigation component presence
- ✅ UI consistency (backgrounds, containers)

### Backend (NestJS)
- ✅ MongoDB URI format (`/dbname?authSource=admin`)
- ✅ Dual collection saves (document_extractions + analysis_results)
- ✅ Authorizer GraphQL patterns
- ✅ DTO validation decorators
- ✅ Service injection patterns

### Python (FastAPI)
- ✅ Boolean checks (`if self.db is None:` not `if not self.db:`)
- ✅ MongoDB dual save pattern
- ✅ Pinned package versions

### Deployment
- ✅ Submodule sync (commit+push before parent)
- ✅ Environment variable validation
- ✅ Railway service configuration

## How It Works

1. **You write code** → Make changes to your project
2. **You commit** → `git commit -m "..."`
3. **Hook validates** → Pre-commit hook calls MCP server
4. **Validators run** → Checks code against standards
5. **Block or allow** → If violations found, commit blocked with fix instructions
6. **You fix** → Apply suggested fixes
7. **Commit succeeds** → Code meets standards ✅

## Real Examples from Production

### Example 1: Missing Navigation Import
**Issue**: Navigation component used but not imported, didn't show on page
**Standard**: `frontend-explicit-imports`
**Fix**: `import Navigation from '~/components/organisms/Navigation.vue'`

### Example 2: Wrong MongoDB URI
**Issue**: Connected to wrong database, data not found
**Standard**: `backend-mongodb-uri-format`
**Fix**: Add `/refinery?authSource=admin` to URI

### Example 3: Python Boolean Check Error
**Issue**: Production 500 error "Database objects do not implement truth value testing"
**Standard**: `python-explicit-none-check`
**Fix**: Change `if not self.db:` to `if self.db is None:`

## Bypassing Validation (Not Recommended)

```bash
git commit --no-verify -m "Emergency fix"
```

## Contributing New Standards

When you fix a bug:
1. Document the issue in standards.json
2. Add a validator in `apps/mcp-nest/src/validators/`
3. Register in `validator.service.ts`
4. Test with real code
5. Commit to meta repo

Standards should:
- Come from real production issues
- Have clear rationale
- Provide actionable fix instructions
- Block on `error`, warn on `warning`
