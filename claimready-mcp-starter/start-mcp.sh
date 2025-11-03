#!/bin/bash

# ClaimReady MCP Standards Server Startup Script

echo "🚀 Starting ClaimReady MCP Standards Server..."

cd "$(dirname "$0")/apps/mcp-nest"

# Check if built
if [ ! -f "dist/main.js" ]; then
    echo "📦 Building server..."
    npm run build
fi

# Start server
echo "✅ Starting on port 7101..."
PORT=7101 node dist/main.js
