#!/bin/bash
# Upgrade Node.js to version 20 on EC2

set -e

echo "Upgrading Node.js to version 20..."

# Stop PM2 app first
pm2 stop exe-project 2>/dev/null || true

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
echo "Node.js version:"
node --version
npm --version

# Reinstall dependencies with new Node version
cd /home/ubuntu/exe-project
npm install --legacy-peer-deps

# Rebuild application
echo "Rebuilding application..."
npm run build -- --no-lint

# Restart PM2
pm2 restart exe-project

echo ""
echo "Node.js upgraded successfully!"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

