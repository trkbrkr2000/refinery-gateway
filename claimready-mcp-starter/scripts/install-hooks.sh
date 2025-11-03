#!/bin/bash

# ClaimReady MCP - Git Hooks Installer
# Installs pre-commit hooks that enforce ClaimReady standards

set -e

echo "🔧 Installing ClaimReady MCP Git Hooks..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Determine target directory
# If run from claimready-mcp-starter, install hooks there and optionally in parent
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if we're in the MCP repo itself or a parent repo
if [ "$REPO_ROOT" = "$MCP_ROOT" ]; then
    echo "📦 Installing hooks in MCP repository: $REPO_ROOT"
    TARGETS=("$REPO_ROOT")
else
    echo "📦 MCP is in a subdirectory of the main repository"
    echo "   Would you like to install hooks in:"
    echo "   1) MCP repository only ($MCP_ROOT)"
    echo "   2) Main repository only ($REPO_ROOT)"
    echo "   3) Both"
    read -p "   Enter choice [1-3]: " choice

    case $choice in
        1) TARGETS=("$MCP_ROOT");;
        2) TARGETS=("$REPO_ROOT");;
        3) TARGETS=("$MCP_ROOT" "$REPO_ROOT");;
        *) echo "Invalid choice"; exit 1;;
    esac
fi

# Install hooks
for TARGET in "${TARGETS[@]}"; do
    echo ""
    echo "📍 Installing in: $TARGET"

    # Create hooks directory if it doesn't exist
    HOOKS_DIR="$TARGET/.git/hooks"
    if [ ! -d "$HOOKS_DIR" ]; then
        mkdir -p "$HOOKS_DIR"
    fi

    # Copy pre-commit hook
    SOURCE_HOOK="$SCRIPT_DIR/git-hooks/pre-commit"
    TARGET_HOOK="$HOOKS_DIR/pre-commit"

    if [ -f "$TARGET_HOOK" ]; then
        echo "   ⚠️  Existing pre-commit hook found. Creating backup..."
        mv "$TARGET_HOOK" "$TARGET_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    cp "$SOURCE_HOOK" "$TARGET_HOOK"
    chmod +x "$TARGET_HOOK"

    echo "   ✅ pre-commit hook installed"
done

echo ""
echo "✨ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start MCP server:"
echo "      cd apps/mcp-nest && npm run start:dev"
echo ""
echo "   2. Try making a commit - the hook will validate your changes"
echo ""
echo "   3. To bypass validation (not recommended):"
echo "      git commit --no-verify"
echo ""
echo "📚 View standards: cat standards/claimready-standards.json"

