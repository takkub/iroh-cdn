#!/bin/bash
fi
    echo ""
    echo "   Restart:      docker-compose restart"
    echo "   Stop:         docker-compose down"
    echo "   View logs:    docker-compose logs -f"
    echo "📋 Useful commands:"
    echo ""
    echo "   API:     http://localhost:6666"
    echo "   Web UI:  http://localhost:5555"
    echo "📱 Access:"
    echo ""
    echo "🎉 Iroh CDN is ready!"
    echo "================================"
    echo ""
else
    echo "Check logs with: docker-compose logs"
    echo "⚠️  Services took longer than expected to start"
    echo ""
if [ $WAIT_COUNT -eq $MAX_WAIT ]; then

done
    sleep 2
    echo -n "."
    WAIT_COUNT=$((WAIT_COUNT+1))

    fi
        fi
            break
            echo "✅ All services are ready!"
            echo ""
        if curl -f http://localhost:6666/assets > /dev/null 2>&1; then
        # Check if API is responding
    if docker-compose ps | grep -q "Up"; then
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do

WAIT_COUNT=0
MAX_WAIT=120

echo "⏳ Waiting for services to be ready..."
echo ""
# Wait for services to be healthy

docker-compose up --build -d

echo ""
echo "⏱️  This may take 10-30 minutes on first run..."
echo "🔨 Building and starting services..."
echo ""
# Build and start

docker-compose down -v 2>/dev/null || true
echo "🛑 Stopping existing containers..."
echo ""
# Stop any running containers

fi
    echo "✅ .env file already exists"
else
    echo "✅ Created .env file"
EOF
NEXT_PUBLIC_API_URL=http://localhost:6666
WEB_PORT=5555
# Web

DATABASE_URL=postgresql://iroh:iroh@db:5432/irohcdn
API_PORT=6666
# API

POSTGRES_PORT=5432
POSTGRES_DB=irohcdn
POSTGRES_PASSWORD=iroh
POSTGRES_USER=iroh
# Database
    cat > .env << 'EOF'
    echo "⚙️  Creating .env file..."
if [ ! -f .env ]; then
# Check if .env exists

echo "✅ Docker is running"

fi
    exit 1
    echo "Please start Docker Desktop and try again."
    echo "❌ Error: Docker is not running!"
if ! docker info > /dev/null 2>&1; then
# Check if Docker is running

echo ""
echo "================================"
echo "🚀 Iroh CDN - One Command Setup"

set -e

# Usage: ./setup.sh
# One-command setup script for Iroh CDN

