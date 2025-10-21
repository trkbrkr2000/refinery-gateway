#!/bin/bash

# Clone all Refinery Platform repositories
# Run this from the refinery-platform directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Refinery Platform - Repository Cloner${NC}"
echo ""

# GitHub organization
ORG="monkeybarrels"

# List of repositories
REPOS=(
    "refinery-api"
    "refinery-frontend"
    "refinery-queue"
    "refinery-processor"
    "refinery-docs"
)

# Function to clone or update a repo
clone_or_update() {
    local repo=$1
    
    if [ -d "$repo" ]; then
        echo -e "${YELLOW}📁 $repo already exists, skipping...${NC}"
    else
        echo -e "${GREEN}📥 Cloning $repo...${NC}"
        git clone "https://github.com/$ORG/$repo.git"
        echo -e "${GREEN}✅ $repo cloned successfully${NC}"
    fi
    echo ""
}

# Clone each repository
for repo in "${REPOS[@]}"; do
    clone_or_update "$repo"
done

echo -e "${GREEN}🎉 All repositories cloned!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run ./setup.sh to install dependencies"
echo "  2. Run ./dev.sh to start development environment"
echo ""