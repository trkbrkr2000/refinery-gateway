#!/bin/bash

# Install ClaimReady Standards MCP Server into Claude Desktop

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
MCP_PATH="$(pwd)/apps/mcp-nest/dist/mcp/mcp-server.js"

echo "🔧 Installing ClaimReady Standards MCP Server..."
echo "   MCP Server: $MCP_PATH"
echo "   Config: $CONFIG_FILE"

# Check if mcp-server.js exists
if [ ! -f "$MCP_PATH" ]; then
    echo "❌ Error: MCP server not found at $MCP_PATH"
    echo "   Run: cd apps/mcp-nest && npm run build"
    exit 1
fi

# Create config directory if it doesn't exist
mkdir -p "$(dirname "$CONFIG_FILE")"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📝 Creating new config file..."
    cat > "$CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "claimready-standards": {
      "command": "node",
      "args": ["$MCP_PATH"]
    }
  }
}
EOF
else
    echo "📝 Updating existing config file..."
    # Backup existing config
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

    # Use jq to add or update the claimready-standards server
    jq ".mcpServers[\"claimready-standards\"] = {\"command\": \"node\", \"args\": [\"$MCP_PATH\"]}" "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
fi

echo "✅ ClaimReady Standards MCP installed!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Claude Desktop to load the MCP server"
echo "   2. Make sure validation server is running: ./start-mcp.sh"
echo "   3. Use these tools in Claude:"
echo "      - validate_file: Check a file against standards"
echo "      - validate_changes: Check staged git changes"
echo "      - check_standard: Test code against specific standard"
echo "      - list_standards: See all available standards"
echo "      - get_standard_details: Get details about a standard"
echo "      - validate_deployment: Pre-deployment checks"
echo ""
echo "💡 The MCP will help enforce ClaimReady standards in your conversations!"
