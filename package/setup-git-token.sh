#!/bin/bash
# Setup Git with Personal Access Token

set -e

if [ -z "$1" ]; then
    echo "Usage: bash setup-git-token.sh <github-username> <personal-access-token>"
    echo ""
    echo "To create a Personal Access Token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select scopes: repo (full control)"
    echo "4. Copy the token"
    exit 1
fi

GITHUB_USER=$1
GITHUB_TOKEN=$2

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: Personal Access Token is required"
    exit 1
fi

REPO_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/usafo-FPT/repo.git"
DEPLOY_DIR="/home/ubuntu/exe-project"

echo "Setting up Git with Personal Access Token..."

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Updating repository URL..."
    cd $DEPLOY_DIR
    git remote set-url origin $REPO_URL
    git fetch origin
    git reset --hard origin/main
else
    echo "Cloning repository..."
    rm -rf $DEPLOY_DIR
    git clone -b main $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Store credentials (optional, for convenience)
git config --global credential.helper store
echo "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com" > ~/.git-credentials

echo ""
echo "Git setup with token completed!"
echo "Repository URL configured with token."

