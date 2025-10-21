#!/bin/bash

# Master test runner for isolated component tests

echo "══════════════════════════════════════════════════════════════"
echo "  Refinery Platform - Isolated Component Tests"
echo "══════════════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PASS=0
FAIL=0
SKIP=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test
run_test() {
  local test_name="$1"
  local test_script="$2"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $test_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  if [ ! -f "$test_script" ]; then
    echo -e "${RED}❌ SKIP: Test script not found${NC}"
    SKIP=$((SKIP + 1))
    return
  fi

  if bash "$test_script"; then
    echo ""
    echo -e "${GREEN}✅ PASSED: $test_name${NC}"
    PASS=$((PASS + 1))
  else
    echo ""
    echo -e "${RED}❌ FAILED: $test_name${NC}"
    FAIL=$((FAIL + 1))

    if [ "$CONTINUE_ON_FAIL" != "1" ]; then
      echo ""
      echo "Stopping due to failure. Set CONTINUE_ON_FAIL=1 to continue."
      exit 1
    fi
  fi
}

# Parse arguments
QUICK=0
if [ "$1" = "--quick" ]; then
  QUICK=1
  echo "Running in QUICK mode (skipping slow tests)"
  echo ""
fi

# Run tests in dependency order
echo "Starting isolated component tests..."
echo ""

# Infrastructure tests (no dependencies)
run_test "Redis & BullMQ Queue" "$SCRIPT_DIR/test-redis-queue.sh"
run_test "MongoDB Operations" "$SCRIPT_DIR/test-mongodb.sh"

# Service tests (require infrastructure)
run_test "Python Extraction Service" "$SCRIPT_DIR/test-python-extraction.sh"
run_test "NestJS Queue Submission" "$SCRIPT_DIR/test-queue-submission.sh"

# Integration tests (require everything)
if [ "$QUICK" -eq 0 ]; then
  run_test "Groq LLM Service" "$SCRIPT_DIR/test-groq-llm.sh"
else
  echo ""
  echo "⏩ Skipping Groq LLM test (--quick mode)"
  SKIP=$((SKIP + 1))
fi

# Summary
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Test Summary"
echo "══════════════════════════════════════════════════════════════"
echo ""

TOTAL=$((PASS + FAIL + SKIP))

echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
  echo -e "${RED}Failed: $FAIL${NC}"
else
  echo "Failed: $FAIL"
fi
if [ $SKIP -gt 0 ]; then
  echo -e "${YELLOW}Skipped: $SKIP${NC}"
fi

echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
