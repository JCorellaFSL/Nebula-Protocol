#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Nebula Framework MCP Server (Linux/macOS)..."

REPO_ROOT=$(pwd)
MCP_DIR="nebula-framework-mcp"

mkdir -p "$MCP_DIR"
cp -f "nebula-framework-mcp.js" "package.json" "$MCP_DIR/"
echo "Copied MCP server files to $MCP_DIR"

cd "$MCP_DIR"

# Write Cursor MCP configuration (~/.cursor/mcp.json)
CURSOR_DIR="$HOME/.cursor"
CURSOR_CFG="$CURSOR_DIR/mcp.json"
mkdir -p "$CURSOR_DIR"

cat > "$CURSOR_CFG" <<JSON
{
  "mcpServers": {
    "nebula-framework": {
      "command": "node",
      "args": ["$PWD/nebula-framework-mcp.js"],
      "env": {
        "NEBULA_FRAMEWORK_PATH": "${REPO_ROOT}"
      }
    }
  }
}
JSON

echo "Wrote Cursor MCP config to: $CURSOR_CFG"

echo
echo "Next steps (run in your external terminal):"
echo "  1) cd $PWD && npm install"
echo "  2) npm run inspector  # optional: opens MCP inspector"
echo "  3) Restart Cursor and verify the 'nebula-framework' MCP server is available"

echo "Done."


