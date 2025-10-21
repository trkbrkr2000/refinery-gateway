#!/bin/bash

# Refinery Platform - Stop Development Services Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping Refinery Platform Development Services${NC}"
echo ""

# Stop background services using PID files
if [ -f "logs/api.pid" ]; then
    PID=$(cat logs/api.pid)
    if ps -p $PID > /dev/null; then
        kill $PID && echo -e "${GREEN}✅ Stopped API service${NC}"
    fi
    rm logs/api.pid
fi

if [ -f "logs/queue.pid" ]; then
    PID=$(cat logs/queue.pid)
    if ps -p $PID > /dev/null; then
        kill $PID && echo -e "${GREEN}✅ Stopped Queue service${NC}"
    fi
    rm logs/queue.pid
fi

if [ -f "logs/processor.pid" ]; then
    PID=$(cat logs/processor.pid)
    if ps -p $PID > /dev/null; then
        kill $PID && echo -e "${GREEN}✅ Stopped Processor service${NC}"
    fi
    rm logs/processor.pid
fi

if [ -f "logs/frontend.pid" ]; then
    PID=$(cat logs/frontend.pid)
    if ps -p $PID > /dev/null; then
        kill $PID && echo -e "${GREEN}✅ Stopped Frontend service${NC}"
    fi
    rm logs/frontend.pid
fi

# Stop Docker services
echo -e "${YELLOW}Stopping Docker services...${NC}"
docker-compose -f docker-compose.dev.yml down

# Kill any remaining processes on the ports (fallback)
echo -e "${YELLOW}Cleaning up any remaining processes...${NC}"
for port in 4200 3001 3002 3003; do
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null && echo -e "${GREEN}✅ Killed process on port $port${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 All services stopped!${NC}"
echo ""