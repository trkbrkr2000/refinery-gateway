#!/bin/bash

# Refinery Platform - Local Development Startup Script
# This script starts all services for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Refinery Platform Local Development Environment${NC}"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to start a service in a new terminal tab
start_service() {
    local service_name=$1
    local service_dir=$2
    local service_cmd=$3
    
    echo -e "${YELLOW}Starting $service_name...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$service_dir && $service_cmd\""
    else
        # Linux - try gnome-terminal
        gnome-terminal --tab --title="$service_name" -- bash -c "cd $(pwd)/$service_dir && $service_cmd; bash"
    fi
}

# Check for required tools
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bun is not installed - Processor service will not start${NC}"
fi

# Check application ports
echo "Checking application port availability..."
check_port 4200 || exit 1  # Frontend dev server
check_port 3001 || exit 1  # API
check_port 3002 || exit 1  # Queue
check_port 3003 || exit 1  # Processor

# Check database ports (warn but continue if in use)
echo "Checking database port availability..."
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ MongoDB is already running (port 27017)${NC}"
else
    echo -e "${YELLOW}MongoDB not detected on port 27017 - will start with Docker${NC}"
fi

if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Redis is already running (port 6379)${NC}"
else
    echo -e "${YELLOW}Redis not detected on port 6379 - will start with Docker${NC}"
fi

# Check if databases are already running (Docker or Brew)
echo "Checking database status..."
MONGO_RUNNING=false
REDIS_RUNNING=false

# Check for MongoDB (Docker container or Brew/external)
if docker ps | grep -q refinery-mongodb-dev; then
    echo -e "${GREEN}✅ MongoDB Docker container is running${NC}"
    MONGO_RUNNING=true
elif lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ MongoDB is running (external/Brew)${NC}"
    MONGO_RUNNING=true
fi

# Check for Redis (Docker container or Brew/external)
if docker ps | grep -q refinery-redis-dev; then
    echo -e "${GREEN}✅ Redis Docker container is running${NC}"
    REDIS_RUNNING=true
elif lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Redis is running (external/Brew)${NC}"
    REDIS_RUNNING=true
fi

# Start databases only if not running
if [ "$MONGO_RUNNING" = false ] || [ "$REDIS_RUNNING" = false ]; then
    echo -e "${GREEN}📦 Starting database services with Docker...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for databases to be ready
    echo "Waiting for databases to be ready..."
    sleep 5
    
    # Verify they started
    if ! docker ps | grep -q refinery-mongodb-dev; then
        echo -e "${RED}❌ MongoDB failed to start${NC}"
        exit 1
    fi
    
    if ! docker ps | grep -q refinery-redis-dev; then
        echo -e "${RED}❌ Redis failed to start${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Database services are now running${NC}"
else
    echo -e "${GREEN}✅ All database services are already running${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database services are running!${NC}"
echo ""
echo "MongoDB Express: http://localhost:8081"
echo "Redis Commander: http://localhost:8082"
echo ""

# Copy .env.local.example files if .env.local doesn't exist
echo "Setting up environment files..."
for service in refinery-api refinery-queue refinery-processor refinery-frontend; do
    if [ ! -f "$service/.env.local" ]; then
        if [ -f "$service/.env.local.example" ]; then
            cp "$service/.env.local.example" "$service/.env.local"
            echo -e "${YELLOW}Created .env.local for $service${NC}"
        fi
    fi
done

echo ""
echo -e "${GREEN}Starting application services in separate terminals...${NC}"

# Start services in new terminal tabs/windows
start_service "API Service" "refinery-api" "npm run dev"
sleep 2

start_service "Queue Service" "refinery-queue" "npm run dev"
sleep 2

start_service "Processor Service" "refinery-processor" "bun run dev"
sleep 2

start_service "Frontend" "refinery-frontend" "npm run dev"

echo ""
echo -e "${GREEN}🚀 All services are starting!${NC}"
echo ""
echo "Services will be available at:"
echo "  Frontend:    http://localhost:4200 (development with hot reload)"
echo "  API:         http://localhost:3001/api"
echo "  API Docs:    http://localhost:3001/api/docs"
echo "  Queue Admin: http://localhost:3002/api/admin/queues"
echo "  Processor:   http://localhost:3003"
echo ""
echo "Database GUIs:"
echo "  MongoDB:     http://localhost:8081"
echo "  Redis:       http://localhost:8082"
echo ""
echo -e "${YELLOW}Production SSR Server:${NC}"
echo "  To test Railway-compatible SSR server:"
echo "  cd refinery-frontend && npm run build && npm start"
echo "  Then visit: http://localhost:3000"
echo ""
echo -e "${YELLOW}Note: Check the terminal tabs for service logs${NC}"
echo ""
echo "To stop all services:"
echo "  1. Close all terminal tabs"
echo "  2. Run: docker-compose -f docker-compose.dev.yml down"
echo ""