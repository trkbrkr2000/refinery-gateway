#!/bin/bash

# Test Redis and BullMQ queue operations in isolation

echo "🧪 Testing Redis & BullMQ Queue (Isolated)"
echo ""

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
  echo "❌ Redis not running"
  echo "   Start it with: redis-server"
  exit 1
fi

echo "✅ Redis is running"
echo ""

# Test 1: Redis connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Redis Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PING=$(redis-cli ping 2>/dev/null)
if [ "$PING" = "PONG" ]; then
  echo "✅ PASS: Redis responding to PING"
else
  echo "❌ FAIL: Redis not responding"
  exit 1
fi

echo ""

# Test 2: Check BullMQ queue keys
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: BullMQ Queue Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Checking for pipeline-queue keys..."
KEYS=$(redis-cli KEYS "bull:pipeline-queue:*" 2>/dev/null | wc -l)

if [ "$KEYS" -gt 0 ]; then
  echo "✅ PASS: Found $KEYS BullMQ keys"
  echo ""
  echo "Key types:"
  redis-cli KEYS "bull:pipeline-queue:*" 2>/dev/null | head -10 | while read key; do
    echo "  - ${key##*:}"
  done
else
  echo "⚠️  WARNING: No BullMQ keys found (queue may not have been used yet)"
fi

echo ""

# Test 3: Queue stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Queue Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WAITING=$(redis-cli LLEN bull:pipeline-queue:waiting 2>/dev/null || echo "0")
ACTIVE=$(redis-cli LLEN bull:pipeline-queue:active 2>/dev/null || echo "0")
COMPLETED=$(redis-cli LLEN bull:pipeline-queue:completed 2>/dev/null || echo "0")
FAILED=$(redis-cli LLEN bull:pipeline-queue:failed 2>/dev/null || echo "0")

echo "Queue Status:"
echo "  Waiting: $WAITING jobs"
echo "  Active: $ACTIVE jobs"
echo "  Completed: $COMPLETED jobs"
echo "  Failed: $FAILED jobs"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "✅ PASS: No failed jobs"
else
  echo "⚠️  WARNING: $FAILED jobs failed"
  echo ""
  echo "Recent failed jobs:"
  redis-cli LRANGE bull:pipeline-queue:failed 0 2 2>/dev/null | while read job; do
    echo "  $job"
  done
fi

if [ "$WAITING" -gt 10 ]; then
  echo "⚠️  WARNING: $WAITING jobs waiting (queue may be backed up)"
fi

if [ "$ACTIVE" -gt 5 ]; then
  echo "⚠️  WARNING: $ACTIVE jobs active (may indicate slow processing)"
fi

echo ""

# Test 4: Redis memory usage
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Redis Memory Usage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MEMORY=$(redis-cli INFO memory 2>/dev/null | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r')
PEAK=$(redis-cli INFO memory 2>/dev/null | grep "used_memory_peak_human:" | cut -d: -f2 | tr -d '\r')

echo "Memory:"
echo "  Current: $MEMORY"
echo "  Peak: $PEAK"

echo ""

# Test 5: Job data structure check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Job Data Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$COMPLETED" -gt 0 ]; then
  echo "Checking a completed job..."

  # Get last completed job
  JOB_ID=$(redis-cli LINDEX bull:pipeline-queue:completed -1 2>/dev/null)

  if [ -n "$JOB_ID" ]; then
    JOB_DATA=$(redis-cli GET "bull:pipeline-queue:$JOB_ID" 2>/dev/null)

    if [ -n "$JOB_DATA" ]; then
      echo "✅ PASS: Job data found"
      echo ""
      echo "Job structure:"
      echo "$JOB_DATA" | jq -r '{name, data: .data | keys, timestamp, processedOn, finishedOn}' 2>/dev/null || echo "$JOB_DATA"
    else
      echo "⚠️  WARNING: Job ID found but no data"
    fi
  fi
else
  echo "⚠️  SKIP: No completed jobs to check"
fi

echo ""

# Test 6: Clear old completed jobs (optional)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Queue Maintenance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$COMPLETED" -gt 100 ]; then
  echo "⚠️  INFO: $COMPLETED completed jobs (consider cleanup)"
  echo "   To clean: redis-cli DEL bull:pipeline-queue:completed"
else
  echo "✅ Completed jobs: $COMPLETED (reasonable)"
fi

if [ "$FAILED" -gt 0 ]; then
  echo "⚠️  INFO: $FAILED failed jobs (may need investigation)"
  echo "   To clean: redis-cli DEL bull:pipeline-queue:failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Redis & BullMQ Queue Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
