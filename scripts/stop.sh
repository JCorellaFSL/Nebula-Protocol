#!/bin/bash

# Nebula Protocol - Stop Script

set -e

echo "🛑 Stopping Nebula Protocol Services..."
docker-compose down

echo "✅ All services stopped."
echo ""
echo "To remove volumes as well, run:"
echo "   docker-compose down -v"
echo ""

