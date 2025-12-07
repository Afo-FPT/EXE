#!/bin/bash
# Deploy from Git - Run this on EC2 to pull latest changes

set -e

DEPLOY_DIR="/home/ubuntu/exe-project"
BRANCH=${1:-main}

echo "Deploying from Git (branch: $BRANCH)..."

cd $DEPLOY_DIR

# Pull latest changes
echo "Pulling latest changes..."
git fetch origin
git reset --hard origin/$BRANCH

# Copy environment file if exists
if [ -f "env.production" ]; then
    cp env.production .env.production
fi

# Install/update dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build application
echo "Building application..."
npm run build -- --no-lint

# Restart PM2
echo "Restarting application..."
pm2 restart exe-project

echo ""
echo "Deployment completed successfully!"
echo "Application restarted."

