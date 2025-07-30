#!/bin/bash

# Online Judge Platform - Docker Deployment Script
# This script helps you deploy the entire platform with Docker

set -e

echo "🚀 Online Judge Platform Deployment"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding."
    echo "   Important: Update JWT_SECRET, COOKIE_KEY, and API keys!"
    read -p "Press Enter after updating .env file..."
fi

echo "🔨 Building Docker images..."
docker-compose build

echo "🏃 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:    http://localhost:80"
echo "   Backend API: http://localhost:5001"
echo "   Compiler:    http://localhost:3000"
echo "   AI Module:   http://localhost:5003"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:      docker-compose restart"
echo ""
echo "📋 Health checks:"

# Health check function
check_health() {
    local service=$1
    local url=$2
    local name=$3
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "  $name: Running"
    else
        echo "  $name: Not responding"
    fi
}

check_health "backend" "http://localhost:5001" "Backend Server"
check_health "compiler" "http://localhost:3000/health" "Compiler Service"  
check_health "ai" "http://localhost:5003/health" "AI Module"
check_health "frontend" "http://localhost:80" "Frontend"

echo ""
echo "🎉 Your Online Judge Platform is ready!"
echo "   Open http://localhost in your browser to get started."
