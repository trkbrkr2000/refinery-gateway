# Your MCP Server Setup

You now have **6 MCP servers** configured in Claude Desktop + 1 standalone validation server.

## Claude Desktop MCP Servers

These run automatically when you use Claude Desktop. Configured in:
`~/Library/Application Support/Claude/claude_desktop_config.json`

### 1. **JetBrains**
- Integrates with JetBrains IDEs
- Package: `@jetbrains/mcp-proxy`

### 2. **Filesystem**
- File operations in your refinery-repos directory
- Package: `@modelcontextprotocol/server-filesystem`
- Path: `/Users/jimlivingston/Documents/git/refinery-repos`

### 3. **Memory**
- Persistent memory across conversations
- Package: `@modelcontextprotocol/server-memory`

### 4. **Sequential Thinking**
- Enhanced reasoning capabilities
- Package: `@modelcontextprotocol/server-sequential-thinking`

### 5. **Codebase Search**
- Fast codebase searching
- Package: `mcp-codebase-search`

### 6. **ClaimReady Standards** ⭐ NEW!
- Your custom coding standards enforcer
- Validates code against ClaimReady standards
- Blocks commits with violations
- Port: 7101

## Standalone: ClaimReady Validation Server

This runs independently for git hooks and can also be called from Claude Desktop.

### Start Server:
```bash
cd /Users/jimlivingston/Documents/git/refinery-repos/claimready-mcp-starter
./start-mcp.sh
```

### What It Does:
- ✅ Enforces 16+ coding standards
- ✅ Blocks git commits that violate standards
- ✅ Provides clear fix instructions
- ✅ Learned from real production bugs

### API Endpoints:
- `POST /validation/pre-commit` - Validate staged files
- `POST /validation/file` - Validate single file
- `POST /validation/pattern` - Test specific pattern
- `POST /validation/deployment` - Pre-deployment checks

## How to Use

### For Git Commits (Automatic):
Just commit normally. The pre-commit hook will automatically:
1. Call the validation server
2. Check your staged files
3. Block if violations found
4. Show you how to fix issues

```bash
git commit -m "Add feature"
# -> Automatically validates
# -> Blocks if violations
# -> Shows fix instructions
```

### From Claude Desktop:
After restarting Claude Desktop, Claude can:
- Access your filesystem
- Search your codebase
- Remember context across conversations
- Validate code against ClaimReady standards
- Use JetBrains integration

### Manual Validation:
```bash
# Validate a specific file
curl -X POST http://localhost:7101/validation/file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/file.vue"}'

# Check deployment readiness
curl -X POST http://localhost:7101/validation/deployment
```

## Restart Claude Desktop to Activate

After making changes to `claude_desktop_config.json`, restart Claude Desktop to load all MCP servers.

**To verify they're running:**
- Look for MCP server icons in Claude Desktop
- Check the MCP servers panel
- All 6 servers should show as connected

## Troubleshooting

### ClaimReady Validation Server Not Running:
```bash
# Check if running
lsof -i :7101

# Start it
./start-mcp.sh

# Or manually
cd apps/mcp-nest
PORT=7101 node dist/main.js
```

### Claude Desktop MCP Servers Not Loading:
1. Restart Claude Desktop completely
2. Check logs: `~/Library/Logs/Claude/`
3. Verify config syntax: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`

## Next Steps

1. ✅ Restart Claude Desktop to activate all MCP servers
2. ✅ Keep ClaimReady validation server running during development
3. ✅ Commit code normally - hooks will validate automatically
4. ✅ Use Claude Desktop with full MCP capabilities
