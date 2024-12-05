#!/bin/bash

# Create backup directory
backup_dir="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Function to backup and remove file
backup_and_remove() {
    if [ -f "$1" ]; then
        echo "Backing up and removing: $1"
        mkdir -p "$(dirname "${backup_dir}/${1}")"
        cp "$1" "${backup_dir}/${1}"
        rm "$1"
    fi
}

# Context implementations
backup_and_remove "src/middleware/context.ts"
backup_and_remove "src/middleware/context-store.ts"
backup_and_remove "src/app/middleware/context-middleware.ts"
backup_and_remove "src/lib/context.ts"
backup_and_remove "src/lib/request-context.ts"

# Redis implementations
backup_and_remove "src/middleware/redis-store.ts"
backup_and_remove "src/lib/redis.ts"

# OIDC implementations
backup_and_remove "src/lib/oidc-utils.ts"
backup_and_remove "src/lib/oidc-context.ts"
backup_and_remove "src/lib/oidc-manager.ts"
backup_and_remove "src/utils/oidc-utils.ts"

# Redundant API routes
backup_and_remove "src/app/api/auth/refresh/route.ts"
backup_and_remove "src/app/api/auth/refreshsession/route.ts"
backup_and_remove "src/app/api/callback.ts"

# Old pages (if using App Router)
backup_and_remove "pages/_app.tsx"
backup_and_remove "src/pages/page.tsx"

echo "Files have been backed up to: $backup_dir"
echo "Removed redundant files successfully"

