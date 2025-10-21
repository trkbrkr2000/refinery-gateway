#!/bin/bash

# Refinery Platform - Background Development Startup Script
# This script starts all services in the background with consolidated logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Refinery Platform (Background Mode)${NC}"
echo ""

# Create logs directory
mkdir -p logs

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

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
    
    echo -e "${GREEN}✅ Database services are now running${NC}"
else
    echo -e "${GREEN}✅ All database services are already running${NC}"
fi

# Copy .env.local.example files if needed
echo "Setting up environment files..."
for service in refinery-api refinery-queue refinery-processor refinery-frontend; do
    if [ ! -f "$service/.env.local" ]; then
        if [ -f "$service/.env.local.example" ]; then
            cp "$service/.env.local.example" "$service/.env.local"
            echo -e "${YELLOW}Created .env.local for $service${NC}"
        fi
    fi
done

# Start services in background
echo -e "${GREEN}Starting services in background...${NC}"

cd refinery-api
npm run dev > ../logs/api.log 2>&1 &
API_PID=$!
cd ..

cd refinery-queue
npm run dev > ../logs/queue.log 2>&1 &
QUEUE_PID=$!
cd ..

cd refinery-processor
bun run dev > ../logs/processor.log 2>&1 &
PROCESSOR_PID=$!
cd ..

cd refinery-frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Create PID file for cleanup
echo "$API_PID" > logs/api.pid
echo "$QUEUE_PID" > logs/queue.pid
echo "$PROCESSOR_PID" > logs/processor.pid
echo "$FRONTEND_PID" > logs/frontend.pid

echo ""
echo -e "${GREEN}✅ All services started in background!${NC}"
echo ""
echo "Services will be available at:"
echo "  Frontend:    http://localhost:4200"
echo "  API:         http://localhost:3001/api"
echo "  API Docs:    http://localhost:3001/api/docs"
echo "  Queue Admin: http://localhost:3002/api/admin/queues"
echo "  Processor:   http://localhost:3003"
echo ""
echo "Database GUIs:"
echo "  MongoDB:     http://localhost:8081"
echo "  Redis:       http://localhost:8082"
echo ""
echo "📋 Service logs:"
echo "  API:         tail -f logs/api.log"
echo "  Queue:       tail -f logs/queue.log"
echo "  Processor:   tail -f logs/processor.log"
echo "  Frontend:    tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}To stop all services, run: ./stop-dev.sh${NC}"
echo ""