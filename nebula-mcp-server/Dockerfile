# Nebula Protocol Guardian - MCP Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the server via Stdio (default) or SSE if configured later
# For MCP stdio usage, we just keep the container alive or use it as a one-off command
# But typically MCP servers run locally.
# If running as a service, we might use SSE.

CMD ["node", "bin/server.js"]

