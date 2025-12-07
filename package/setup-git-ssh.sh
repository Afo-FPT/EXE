#!/bin/bash
# Setup Git SSH key for private repository

set -e

echo "Setting up Git SSH authentication..."

# Check if SSH key already exists
if [ -f ~/.ssh/deploy_key ]; then
    echo "SSH key already exists at ~/.ssh/deploy_key"
    read -p "Do you want to generate a new key? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key..."
    else
        rm -f ~/.ssh/deploy_key ~/.ssh/deploy_key.pub
    fi
fi

# Generate SSH key if not exists
if [ ! -f ~/.ssh/deploy_key ]; then
    echo "Generating SSH key..."
    ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/deploy_key -N ""
    echo "SSH key generated!"
fi

# Set correct permissions
chmod 600 ~/.ssh/deploy_key
chmod 644 ~/.ssh/deploy_key.pub

# Display public key
echo ""
echo "=========================================="
echo "Add this SSH public key to GitHub:"
echo "=========================================="
cat ~/.ssh/deploy_key.pub
echo ""
echo "=========================================="
echo ""
echo "Steps to add SSH key to GitHub:"
echo "1. Copy the public key above"
echo "2. Go to: https://github.com/settings/keys"
echo "3. Click 'New SSH key'"
echo "4. Paste the key and save"
echo ""
read -p "Press Enter after you've added the key to GitHub..."

# Configure SSH to use this key for GitHub
mkdir -p ~/.ssh
cat >> ~/.ssh/config <<EOF

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/deploy_key
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# Test SSH connection
echo "Testing SSH connection to GitHub..."
ssh -T git@github.com || true

echo ""
echo "SSH key setup completed!"
echo ""
echo "Now you can clone/update repository using SSH URL:"
echo "  git@github.com:usafo-FPT/repo.git"

