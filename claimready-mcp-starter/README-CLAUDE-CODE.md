# Using ClaimReady Standards MCP with Claude Code (VSCode)

Claude Code (the VSCode extension) has MCP support, but it's configured differently than Claude Desktop.

## Setup for Claude Code

### 1. Start the Validation API

The MCP server needs the validation API running:

```bash
./start-mcp.sh
```

This starts the validation server on port 7101. Keep it running.

### 2. Configure in VSCode Settings

Open VSCode settings (Cmd+,) and search for "Claude MCP" or add to your `settings.json`:

```json
{
  "claude.mcpServers": {
    "claimready-standards": {
      "command": "node",
      "args": [
        "/Users/jimlivingston/Documents/git/refinery-repos/claimready-mcp-starter/apps/mcp-nest/dist/mcp/mcp-server.js"
      ]
    }
  }
}
```

### 3. Reload VSCode Window

- Press Cmd+Shift+P
- Type "Reload Window"
- Press Enter

### 4. Verify MCP is Connected

Look for the MCP indicator in Claude Code. It should show "claimready-standards" as connected.

## Available Tools

Once connected, these tools are available in your Claude Code conversations:

- **`validate_file`** - Check a file against all ClaimReady standards
  ```
  Validate this file: path/to/file.vue
  ```

- **`validate_changes`** - Validate staged git changes before commit
  ```
  Check my staged changes against standards
  ```

- **`check_standard`** - Test code against a specific standard
  ```
  Does this MongoDB URI follow our standard?
  mongodb://user:pass@host:27017/dbname?authSource=admin
  ```

- **`list_standards`** - Browse all standards
  ```
  Show me all frontend standards
  List all error-level standards
  ```

- **`get_standard_details`** - Get full details about a standard
  ```
  Show details for frontend-explicit-imports
  ```

- **`validate_deployment`** - Pre-deployment checks
  ```
  Am I ready to deploy?
  ```

## How to Use in Conversations

Just ask Claude naturally:

- "Check if this Vue component follows ClaimReady standards"
- "List all the MongoDB standards we have"
- "Does this code follow the dual-save pattern?"
- "Validate my staged changes"

Claude will automatically use the MCP tools to enforce standards!

## Troubleshooting

### MCP shows as "Failed"

1. **Check validation API is running**:
   ```bash
   lsof -i :7101
   ```
   Should show a node process. If not, run `./start-mcp.sh`

2. **Test MCP server manually**:
   ```bash
   node apps/mcp-nest/dist/mcp/mcp-server.js
   ```
   Should print "ClaimReady Standards MCP Server running on stdio"

3. **Check VSCode settings**:
   - Open settings (Cmd+,)
   - Search for "claude mcp"
   - Verify the path is correct

4. **Reload VSCode**:
   - Cmd+Shift+P → "Reload Window"

### MCP connects but tools don't work

The MCP server needs the validation API (port 7101) to actually perform validations. Make sure `./start-mcp.sh` is running.

## What's Next

The MCP currently has 7 validators implemented (out of 16 standards). Missing validators:

- Backend: authorizer-pattern, dto-validation, service-injection
- Python: mongodb-dual-save, python-requirements
- Deployment: env-vars, railway-config
- Frontend: ui-consistency
- Git: commit-format, branch-naming

These standards are documented but not yet enforced by the validators.
