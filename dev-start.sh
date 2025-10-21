#!/bin/bash

# Refinery Platform - Start All Dev Services
# Usage: ./dev-start.sh

set -e

echo "🚀 Starting Refinery Platform Development Services..."
echo ""

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p logs

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    mongod --fork --logpath logs/mongodb.log --dbpath ~/data/db 2>/dev/null || echo "⚠️  MongoDB already running or not installed"
fi

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "📦 Starting Redis..."
    redis-server --daemonize yes --logfile logs/redis.log 2>/dev/null || echo "⚠️  Redis already running or not installed"
fi

echo ""
echo "🔧 Starting Refinery Services..."
echo ""

# Start Backend API (port 3001)
echo "1️⃣  Starting refinery-api on port 3001..."
cd refinery-api
npm run start:dev > ../logs/api.log 2>&1 &
API_PID=$!
echo "   PID: $API_PID"
cd ..

sleep 3

# Start Gateway (port 8080)
echo "2️⃣  Starting refinery-gateway on port 8080..."
cd refinery-gateway
npm run start:dev > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "   PID: $GATEWAY_PID"
cd ..

sleep 3

# Start Python Service (port 8000)
echo "3️⃣  Starting refinery-python on port 8000..."
cd refinery-python
python3 -m uvicorn main:app --reload --port 8000 > ../logs/python.log 2>&1 &
PYTHON_PID=$!
echo "   PID: $PYTHON_PID"
cd ..

sleep 3

# Start FormReady Frontend (port 3000)
echo "4️⃣  Starting refinery-formready on port 3000..."
cd refinery-formready
npm run dev > ../logs/formready.log 2>&1 &
FORMREADY_PID=$!
echo "   PID: $FORMREADY_PID"
cd ..

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FormReady:   http://localhost:3000 (PID: $FORMREADY_PID)"
echo "  Gateway:     http://localhost:8080 (PID: $GATEWAY_PID)"
echo "  API:         http://localhost:3001 (PID: $API_PID)"
echo "  Python:      http://localhost:8000 (PID: $PYTHON_PID)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "  FormReady UI:  http://localhost:3000"
echo "  Gateway Docs:  http://localhost:8080/api/docs"
echo "  API Docs:      http://localhost:3001/api/docs"
echo "  Python Docs:   http://localhost:8000/docs"
echo ""
echo "📝 Logs are in: ./logs/"
echo "🛑 To stop all services, run: ./dev-stop.sh"
echo ""

# Save PIDs for stop script
echo "$FORMREADY_PID" > logs/.formready.pid
echo "$GATEWAY_PID" > logs/.gateway.pid
echo "$API_PID" > logs/.api.pid
echo "$PYTHON_PID" > logs/.python.pid
