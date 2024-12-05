i#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for missing files
MISSING_COUNT=0

# Function to check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}MISSING:${NC} $1"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    else
        echo -e "${GREEN}FOUND:${NC} $1"
    fi
}

echo -e "${YELLOW}Checking core library files...${NC}"

# Context Management
echo -e "\n${YELLOW}Checking Context Management:${NC}"
check_file "src/lib/context/manager.ts"
check_file "src/lib/context/symbols.ts"
check_file "src/lib/context/types.ts"

# Redis Implementation
echo -e "\n${YELLOW}Checking Redis Implementation:${NC}"
check_file "src/lib/redis/client.ts"
check_file "src/lib/redis/store.ts"

# OIDC Implementation
echo -e "\n${YELLOW}Checking OIDC Implementation:${NC}"
check_file "src/lib/oidc/auth.ts"
check_file "src/lib/oidc/client.ts"
check_file "src/lib/oidc/config.ts"

# Token Verification
echo -e "\n${YELLOW}Checking Token Verification:${NC}"
check_file "src/lib/tokens/verify.ts"
check_file "src/lib/tokens/types.ts"

# Core API Routes
echo -e "\n${YELLOW}Checking Core API Routes:${NC}"
check_file "src/app/api/auth/login/route.ts"
check_file "src/app/api/auth/callback/route.ts"
check_file "src/app/api/auth/refreshtoken/route.ts"
check_file "src/app/api/auth/logout/route.ts"

# Middleware
echo -e "\n${YELLOW}Checking Middleware:${NC}"
check_file "src/middleware.ts"

# Configuration
echo -e "\n${YELLOW}Checking Configuration:${NC}"
check_file "src/lib/oidc/config.ts"
check_file ".env"

# Summary
echo -e "\n${YELLOW}Summary:${NC}"
if [ $MISSING_COUNT -eq 0 ]; then
    echo -e "${GREEN}All required files are present!${NC}"
else
    echo -e "${RED}Missing $MISSING_COUNT required files!${NC}"
    echo -e "${YELLOW}Please create the missing files to ensure proper functionality.${NC}"
fi

exit $MISSING_COUNT

