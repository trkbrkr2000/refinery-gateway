#!/bin/bash

# Refinery Platform - Stop All Dev Services
# Usage: ./dev-stop.sh

echo "🛑 Stopping Refinery Platform Development Services..."
echo ""

# Stop services by PID files
if [ -f logs/.formready.pid ]; then
    FORMREADY_PID=$(cat logs/.formready.pid)
    echo "Stopping FormReady (PID: $FORMREADY_PID)..."
    kill $FORMREADY_PID 2>/dev/null || echo "  Already stopped"
    rm logs/.formready.pid
fi

if [ -f logs/.gateway.pid ]; then
    GATEWAY_PID=$(cat logs/.gateway.pid)
    echo "Stopping Gateway (PID: $GATEWAY_PID)..."
    kill $GATEWAY_PID 2>/dev/null || echo "  Already stopped"
    rm logs/.gateway.pid
fi

if [ -f logs/.api.pid ]; then
    API_PID=$(cat logs/.api.pid)
    echo "Stopping API (PID: $API_PID)..."
    kill $API_PID 2>/dev/null || echo "  Already stopped"
    rm logs/.api.pid
fi

if [ -f logs/.python.pid ]; then
    PYTHON_PID=$(cat logs/.python.pid)
    echo "Stopping Python (PID: $PYTHON_PID)..."
    kill $PYTHON_PID 2>/dev/null || echo "  Already stopped"
    rm logs/.python.pid
fi

# Also kill by port as backup
echo ""
echo "🧹 Cleaning up any remaining processes on ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To start again, run: ./dev-start.sh"
echo ""
