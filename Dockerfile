# Nebula Protocol API Server
FROM node:20-alpine

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p /app/projects /app/data /app/logs

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run as non-root user
RUN addgroup -g 1001 nebula && \
    adduser -D -u 1001 -G nebula nebula && \
    chown -R nebula:nebula /app

USER nebula

# Start the API server
CMD ["node", "nebula-api-server.js"]

