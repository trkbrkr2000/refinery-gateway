#!/bin/bash

# FormReady E2E Testing Script
echo "🧪 Starting FormReady E2E Tests..."

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Install Playwright if not already installed
echo "📦 Installing Playwright..."
npx playwright install

# Run tests for different browsers
echo "🌐 Running tests on Chrome..."
npx playwright test --project=chromium

echo "🦊 Running tests on Firefox..."
npx playwright test --project=firefox

echo "🧭 Running tests on Safari..."
npx playwright test --project=webkit

echo "📱 Running tests on Mobile Chrome..."
npx playwright test --project="Mobile Chrome"

echo "📱 Running tests on Mobile Safari..."
npx playwright test --project="Mobile Safari"

echo "🌐 Running tests on Edge..."
npx playwright test --project="Microsoft Edge"

# Generate test report
echo "📊 Generating test report..."
npx playwright show-report

echo "✅ E2E testing complete!"
echo "📈 Check the HTML report for detailed results"

