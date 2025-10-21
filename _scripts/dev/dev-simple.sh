#!/bin/bash

# Refinery Platform - Simple Development Startup Script
# This script starts all services in the foreground with visible logs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Refinery Platform (Simple Mode)${NC}"
echo ""

# Check if databases are running
echo -e "${BLUE}Checking databases...${NC}"
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB is not running on port 27017${NC}"
    echo -e "${YELLOW}   Start it with: brew services start mongodb-community${NC}"
    echo -e "${YELLOW}   Or with Docker: docker-compose -f docker-compose.dev.yml up -d${NC}"
    exit 1
fi

if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not running on port 6379${NC}"
    echo -e "${YELLOW}   Start it with: brew services start redis${NC}"
    echo -e "${YELLOW}   Or with Docker: docker-compose -f docker-compose.dev.yml up -d${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Starting all services...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Create logs directory
mkdir -p logs

echo -e "${BLUE}Starting services (use 'tail -f' on log files to see output)${NC}"

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    # Kill all child processes
    jobs -p | xargs -r kill 2>/dev/null || true
    wait
    echo -e "${RED}All services stopped${NC}"
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup INT TERM

# Start services with labeled output (only start services that exist)
if [ -d "refinery-api" ]; then
    (cd refinery-api && npm run dev 2>&1 | sed 's/^/[API] /' | tee logs/api.log) &
    API_PID=$!
    echo "Started API service"
else
    echo "⚠️ refinery-api directory not found - skipping"
fi

if [ -d "refinery-queue" ]; then
    (cd refinery-queue && npm run dev 2>&1 | sed 's/^/[QUEUE] /' | tee logs/queue.log) &
    QUEUE_PID=$!
    echo "Started Queue service"
else
    echo "⚠️ refinery-queue directory not found - skipping"
fi

if [ -d "refinery-processor" ]; then
    (cd refinery-processor && bun run dev 2>&1 | sed 's/^/[PROCESSOR] /' | tee logs/processor.log) &
    PROCESSOR_PID=$!
    echo "Started Processor service"
else
    echo "⚠️ refinery-processor directory not found - skipping"
fi

if [ -d "refinery-frontend" ]; then
    # Check if ng command exists locally or globally
    if [ -f "refinery-frontend/node_modules/.bin/ng" ]; then
        (cd refinery-frontend && npx ng serve --port 3000 2>&1 | sed 's/^/[FRONTEND] /' | tee logs/frontend.log) &
        FRONTEND_PID=$!
        echo "Started Frontend service (using npx ng)"
    elif command -v ng &> /dev/null; then
        (cd refinery-frontend && ng serve --port 3000 2>&1 | sed 's/^/[FRONTEND] /' | tee logs/frontend.log) &
        FRONTEND_PID=$!
        echo "Started Frontend service (using global ng)"
    else
        echo "⚠️ Angular CLI not found - install with 'npm install -g @angular/cli' or run 'npm run dev' in refinery-frontend"
    fi
else
    echo "⚠️ refinery-frontend directory not found - skipping"
fi

echo ""
echo -e "${GREEN}✅ All services starting...${NC}"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:    http://localhost:3000"
echo "   API:         http://localhost:3001/api"
echo "   API Docs:    http://localhost:3001/api/docs"
echo "   Queue:       http://localhost:3002/api"
echo "   Queue Admin: http://localhost:3002/api/admin/queues"
echo "   Processor:   http://localhost:3003"
echo ""
echo "📋 Log files:"
echo "   API:         tail -f logs/api.log"
echo "   Queue:       tail -f logs/queue.log"
echo "   Processor:   tail -f logs/processor.log"
echo "   Frontend:    tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background jobs
wait

echo ""
echo -e "${RED}All services stopped${NC}"