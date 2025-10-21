#!/bin/bash

# Complete setup script for Refinery Platform
# Clones repos, installs dependencies, and sets up environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Refinery Platform - Complete Setup${NC}"
echo ""

# Step 1: Clone repositories
echo -e "${GREEN}Step 1: Cloning repositories...${NC}"
./clone-all.sh

# Step 2: Install dependencies for each service
echo -e "${GREEN}Step 2: Installing dependencies...${NC}"

install_deps() {
    local service=$1
    local cmd=$2
    
    if [ -d "$service" ]; then
        echo -e "${YELLOW}📦 Installing dependencies for $service...${NC}"
        cd "$service"
        $cmd
        cd ..
        echo -e "${GREEN}✅ $service dependencies installed${NC}"
    else
        echo -e "${RED}❌ $service directory not found${NC}"
    fi
    echo ""
}

# Install Node dependencies
install_deps "refinery-api" "npm install"
install_deps "refinery-frontend" "npm install"
install_deps "refinery-queue" "npm install"

# Install Bun dependencies
if command -v bun &> /dev/null; then
    install_deps "refinery-processor" "bun install"
else
    echo -e "${YELLOW}⚠️  Bun not installed, skipping refinery-processor${NC}"
fi

# Step 3: Copy environment files
echo -e "${GREEN}Step 3: Setting up environment files...${NC}"

setup_env() {
    local service=$1
    
    if [ -f "$service/.env.local.example" ] && [ ! -f "$service/.env.local" ]; then
        cp "$service/.env.local.example" "$service/.env.local"
        echo -e "${GREEN}✅ Created .env.local for $service${NC}"
    else
        echo -e "${YELLOW}📁 .env.local already exists for $service${NC}"
    fi
}

setup_env "refinery-api"
setup_env "refinery-frontend"
setup_env "refinery-queue"
setup_env "refinery-processor"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update .env.local files with your API keys (Clerk, etc.)"
echo "  2. Run ./dev.sh to start the development environment"
echo ""
echo "Services will be available at:"
echo "  Frontend:    http://localhost:3000"
echo "  API:         http://localhost:3001/api"
echo "  API Docs:    http://localhost:3001/api/docs"
echo "  Queue Admin: http://localhost:3002/api/admin/queues"
echo ""