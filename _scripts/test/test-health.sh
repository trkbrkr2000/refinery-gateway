#!/bin/bash

# Health check script for all services

echo "🔍 Checking all services..."
echo ""

# Check Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ PONG"
else
  echo "❌ Not running"
fi

# Check MongoDB
echo -n "MongoDB: "
if mongosh --quiet --eval "db.adminCommand('ping')" refinery > /dev/null 2>&1; then
  echo "✅ Connected"
else
  echo "❌ Not running"
fi

# Check NestJS API
echo -n "NestJS API (3001): "
RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
if echo "$RESPONSE" | grep -q "ok"; then
  echo "✅ $RESPONSE"
else
  echo "❌ Not responding"
fi

# Check Python Service
echo -n "Python Service (8000): "
RESPONSE=$(curl -s http://localhost:8000/health 2>/dev/null)
if echo "$RESPONSE" | grep -q "ok"; then
  echo "✅ $RESPONSE"
else
  echo "❌ Not responding"
fi

echo ""
echo "Health check complete!"
