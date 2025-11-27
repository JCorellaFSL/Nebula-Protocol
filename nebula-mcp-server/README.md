# Nebula Protocol Guardian

A standalone MCP Server that enforces the Nebula Protocol, manages project memory, and ensures compliance.

## Installation

```bash
cd nebula-mcp-server
npm install
```

## Usage with Cursor

Add the following to your `claude_desktop_config.json` or Cursor MCP settings:

```json
{
  "mcpServers": {
    "nebula-guardian": {
      "command": "node",
      "args": ["/path/to/nebula-mcp-server/bin/server.js"]
    }
  }
}
```

## Features

- **Verify Compliance**: Checks for `ROADMAP.md`, `.nebula/` directory, and Central KG connection.
- **Project Memory**: Logs errors and decisions to the local SQLite database.
- **Star Gates**: Records quality gate passages.

## Architecture

This server acts as the "Local Guardian" for the protocol. It connects to:
1. **Local File System**: To read/write project files and local memory.
2. **Central KG (Docker)**: To sync patterns and solutions.

