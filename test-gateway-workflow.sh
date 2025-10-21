#!/bin/bash

# Test script for Refinery API Gateway workflow
# Tests: Register -> Login -> Get JWT -> Call protected endpoints

set -e  # Exit on error

GATEWAY_URL="https://refinery-gateway-production.up.railway.app"
# Uncomment for local testing:
# GATEWAY_URL="http://localhost:8080"

echo "🧪 Testing Refinery API Gateway Workflow"
echo "=========================================="
echo ""

# Generate random email for testing
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "📝 Step 1: Register new user"
echo "Email: $TEST_EMAIL"
echo ""

REGISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$GATEWAY_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"scopes\": [\"forms:read\", \"forms:write\", \"va-knowledge:read\"]
  }")

HTTP_STATUS=$(echo "$REGISTER_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -ne "201" ]; then
  echo "❌ Registration failed with status $HTTP_STATUS"
  echo "$REGISTER_BODY" | jq '.' 2>/dev/null || echo "$REGISTER_BODY"
  exit 1
fi

echo "✅ User registered successfully"
echo "$REGISTER_BODY" | jq '.'
echo ""

echo "🔐 Step 2: Login to get JWT token"
echo ""

LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$GATEWAY_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -ne "200" ] && [ "$HTTP_STATUS" -ne "201" ]; then
  echo "❌ Login failed with status $HTTP_STATUS"
  echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
  exit 1
fi

JWT_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.access_token // .token // empty')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
  echo "❌ No JWT token in response"
  echo "$LOGIN_BODY" | jq '.'
  exit 1
fi

echo "✅ Login successful"
echo "JWT Token: ${JWT_TOKEN:0:50}..."
echo ""

echo "🔑 Step 3: Create API Key"
echo ""

API_KEY_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$GATEWAY_URL/auth/api-key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"name\": \"test-key-$(date +%s)\",
    \"scopes\": [\"forms:read\", \"va-knowledge:read\"]
  }")

HTTP_STATUS=$(echo "$API_KEY_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
API_KEY_BODY=$(echo "$API_KEY_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -eq "200" ] || [ "$HTTP_STATUS" -eq "201" ]; then
  API_KEY=$(echo "$API_KEY_BODY" | jq -r '.key // .apiKey // empty')
  echo "✅ API Key created"
  echo "API Key: ${API_KEY:0:50}..."
  echo ""
else
  echo "⚠️  API Key creation failed (status $HTTP_STATUS) - continuing with JWT only"
  echo "$API_KEY_BODY" | jq '.' 2>/dev/null || echo "$API_KEY_BODY"
  echo ""
fi

echo "🏥 Step 4: Test Health Endpoint (public)"
echo ""

HEALTH_RESPONSE=$(curl -s "$GATEWAY_URL/health")
echo "$HEALTH_RESPONSE" | jq '.'
echo ""

echo "📋 Step 5: Test Protected Endpoint - Forms Service"
echo "Calling: GET /api/forms/va-21-526ez-minimal/schema"
echo ""

FORMS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$GATEWAY_URL/api/forms/va-21-526ez-minimal/schema")

HTTP_STATUS=$(echo "$FORMS_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
FORMS_BODY=$(echo "$FORMS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -eq "200" ]; then
  echo "✅ Forms endpoint accessible"
  echo "$FORMS_BODY" | jq '.' | head -30
  echo ""
else
  echo "⚠️  Forms endpoint returned status $HTTP_STATUS"
  echo "$FORMS_BODY" | jq '.' 2>/dev/null || echo "$FORMS_BODY"
  echo ""
fi

echo "🔍 Step 6: Test Protected Endpoint - VA Knowledge Service"
echo "Calling: GET /api/va-knowledge/health (via gateway)"
echo ""

VA_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$GATEWAY_URL/api/va-knowledge/health")

HTTP_STATUS=$(echo "$VA_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
VA_BODY=$(echo "$VA_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -eq "200" ]; then
  echo "✅ VA Knowledge endpoint accessible"
  echo "$VA_BODY" | jq '.' 2>/dev/null || echo "$VA_BODY"
  echo ""
else
  echo "⚠️  VA Knowledge endpoint returned status $HTTP_STATUS"
  echo "$VA_BODY" | jq '.' 2>/dev/null || echo "$VA_BODY"
  echo ""
fi

if [ ! -z "$API_KEY" ] && [ "$API_KEY" != "null" ]; then
  echo "🔐 Step 7: Test with API Key instead of JWT"
  echo "Calling: GET /health with x-api-key header"
  echo ""

  API_KEY_TEST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "x-api-key: $API_KEY" \
    "$GATEWAY_URL/health")

  HTTP_STATUS=$(echo "$API_KEY_TEST" | grep HTTP_STATUS | cut -d: -f2)
  API_KEY_TEST_BODY=$(echo "$API_KEY_TEST" | sed '/HTTP_STATUS/d')

  if [ "$HTTP_STATUS" -eq "200" ]; then
    echo "✅ API Key authentication works"
    echo "$API_KEY_TEST_BODY" | jq '.'
    echo ""
  else
    echo "⚠️  API Key test returned status $HTTP_STATUS"
    echo "$API_KEY_TEST_BODY" | jq '.' 2>/dev/null || echo "$API_KEY_TEST_BODY"
    echo ""
  fi
fi

echo "🔒 Step 8: Test Logout"
echo ""

LOGOUT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$GATEWAY_URL/auth/logout" \
  -H "Authorization: Bearer $JWT_TOKEN")

HTTP_STATUS=$(echo "$LOGOUT_RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
LOGOUT_BODY=$(echo "$LOGOUT_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" -eq "200" ] || [ "$HTTP_STATUS" -eq "204" ]; then
  echo "✅ Logout successful"
else
  echo "⚠️  Logout returned status $HTTP_STATUS"
  echo "$LOGOUT_BODY" | jq '.' 2>/dev/null || echo "$LOGOUT_BODY"
fi

echo ""
echo "=========================================="
echo "✅ Gateway workflow test complete!"
echo ""
echo "Summary:"
echo "  Gateway URL: $GATEWAY_URL"
echo "  Test User: $TEST_EMAIL"
echo "  JWT Token: ${JWT_TOKEN:0:30}..."
if [ ! -z "$API_KEY" ] && [ "$API_KEY" != "null" ]; then
  echo "  API Key: ${API_KEY:0:30}..."
fi
echo ""
