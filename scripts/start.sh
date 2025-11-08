#!/bin/bash

# Nebula Protocol - Start Script
# This script starts all Nebula services using Docker Compose

set -e

echo "🌌 Starting Nebula Protocol Services..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your configuration before proceeding."
    echo "   Then run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service health..."
docker-compose ps

# Test API
echo ""
echo "🧪 Testing API health endpoint..."
curl -f http://localhost:3000/health || echo "⚠️  API health check failed"

echo ""
echo "✅ Nebula Protocol is running!"
echo ""
echo "📊 Service URLs:"
echo "   - API:        http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis:      localhost:6379"
echo "   - Prometheus: http://localhost:9090 (if monitoring profile active)"
echo "   - Grafana:    http://localhost:3001 (if monitoring profile active)"
echo ""
echo "📖 View logs:    docker-compose logs -f"
echo "🛑 Stop:         docker-compose down"
echo "🗑️  Clean:        docker-compose down -v"
echo ""

