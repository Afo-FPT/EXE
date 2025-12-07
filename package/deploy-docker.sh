#!/bin/bash

# Docker deployment script for AWS EC2
# Alternative to PM2 deployment

set -e

# Configuration
EC2_HOST="13.237.124.97"
EC2_USER="ubuntu"
PEM_FILE="D:/FPTU/exe/V2 - EC2/EXEkey.pem"
APP_NAME="exe-project"
CONTAINER_NAME="exe-project"

echo "🐳 Starting Docker deployment to AWS EC2..."

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file not found at: $PEM_FILE"
    exit 1
fi

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

echo "📦 Building Docker image..."
docker build -t $APP_NAME .

echo "💾 Saving Docker image..."
docker save $APP_NAME | gzip > $APP_NAME.tar.gz

echo "📤 Uploading to EC2..."
scp -i "$PEM_FILE" "$APP_NAME.tar.gz" "$EC2_USER@$EC2_HOST:/tmp/"

echo "🔧 Setting up Docker on EC2..."
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
    # Update system
    sudo apt update
    
    # Install Docker if not installed
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker ubuntu
    fi
    
    # Install Docker Compose if not installed
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Stop and remove existing container
    docker stop exe-project || true
    docker rm exe-project || true
    
    # Load new image
    docker load < /tmp/exe-project.tar.gz
    
    # Run new container
    docker run -d \
        --name exe-project \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e PORT=3000 \
        exe-project
    
    # Clean up
    rm -f /tmp/exe-project.tar.gz
    
    echo "✅ Docker container deployed successfully!"
    echo "🌐 Application is running on port 3000"
EOF

# Clean up local files
rm -f "$APP_NAME.tar.gz"

echo "🎉 Docker deployment completed successfully!"
echo "🌐 Your application should be accessible at: http://$EC2_HOST"
echo "📊 Check status with: ssh -i '$PEM_FILE' $EC2_USER@$EC2_HOST 'docker ps'"


