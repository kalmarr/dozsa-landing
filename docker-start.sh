#!/bin/bash

# Dózsa Apartman Docker Start Script
# Usage: ./docker-start.sh

set -e

echo "🏠 Dózsa Apartman Landing - Docker Setup"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "✅ Dózsa Apartman Landing is running!"
echo ""
echo "📍 Access the website at:"
echo "   http://localhost:8081"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Shell access: docker-compose exec web bash"
echo ""
echo "📝 The src/ folder is mounted, so changes are live!"
echo ""
