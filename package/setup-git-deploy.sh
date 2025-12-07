#!/bin/bash
# Setup Git deployment on EC2
# Run this script ONCE on EC2 to setup Git deployment

set -e

echo "Setting up Git deployment..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt update
    sudo apt install -y git
fi

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo "Usage: bash setup-git-deploy.sh <git-repo-url> [branch]"
    echo "Example: bash setup-git-deploy.sh https://github.com/username/repo.git main"
    exit 1
fi

REPO_URL=${1:-"https://github.com/Afo-FPT/MLN.git"}
BRANCH=${2:-main}
DEPLOY_DIR="/home/ubuntu/exe-project"

echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo "Deploy directory: $DEPLOY_DIR"

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Repository already exists. Updating..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "Cloning repository..."
    rm -rf $DEPLOY_DIR
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Copy environment file if exists
if [ -f "env.production" ]; then
    cp env.production .env.production
    echo "Environment file copied."
fi

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build application
echo "Building application..."
npm run build -- --no-lint

# Setup PM2
echo "Setting up PM2..."
pm2 stop exe-project 2>/dev/null || true
pm2 delete exe-project 2>/dev/null || true
pm2 start npm --name "exe-project" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Setup Nginx if config exists
if [ -f "nginx.conf" ]; then
    echo "Setting up Nginx..."
    sudo cp nginx.conf /etc/nginx/sites-available/exe-project
    sudo ln -sf /etc/nginx/sites-available/exe-project /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl restart nginx
fi

echo ""
echo "Git deployment setup completed!"
echo "To deploy updates, run: bash deploy-from-git.sh"

