#!/bin/bash

# Update all Refinery Platform repositories
# Pulls latest changes from main branch for each service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Refinery Platform - Repository Updater${NC}"
echo ""

# List of repositories
REPOS=(
    "refinery-api"
    "refinery-frontend"
    "refinery-queue"
    "refinery-processor"
    "refinery-docs"
)

# Function to update a repo
update_repo() {
    local repo=$1
    
    if [ -d "$repo" ]; then
        echo -e "${GREEN}📥 Updating $repo...${NC}"
        cd "$repo"
        
        # Check for uncommitted changes
        if [[ -n $(git status -s) ]]; then
            echo -e "${YELLOW}⚠️  $repo has uncommitted changes, skipping...${NC}"
        else
            git pull origin main
            echo -e "${GREEN}✅ $repo updated${NC}"
        fi
        
        cd ..
    else
        echo -e "${RED}❌ $repo not found, run ./clone-all.sh first${NC}"
    fi
    echo ""
}

# Update each repository
for repo in "${REPOS[@]}"; do
    update_repo "$repo"
done

echo -e "${GREEN}🎉 All repositories updated!${NC}"
echo ""