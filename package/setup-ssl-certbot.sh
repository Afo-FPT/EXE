#!/bin/bash
# Complete SSL setup with Certbot for kyvuongsuytam.site
# Run this on EC2 after deployment

set -e

DOMAIN="kyvuongsuytam.site"
EMAIL="admin@kyvuongsuytam.site"  # Thay đổi email của bạn

echo "=========================================="
echo "Setting up SSL Certificate with Certbot"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# Step 1: Update system
echo "[1/7] Updating system..."
sudo apt update -y

# Step 2: Install Certbot
echo "[2/7] Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
else
    echo "Certbot already installed"
fi

# Step 3: Check DNS
echo "[3/7] Checking DNS configuration..."
SERVER_IP="47.130.211.9"
CURRENT_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
echo "   Expected Server IP: $SERVER_IP"
echo "   Current Server IP: $CURRENT_IP"
echo "   Please ensure $DOMAIN DNS A record points to $SERVER_IP"
echo ""
read -p "Press Enter after verifying DNS is correct..."

# Step 4: Stop Nginx temporarily
echo "[4/7] Stopping Nginx temporarily..."
sudo systemctl stop nginx

# Step 5: Obtain certificate
echo "[5/7] Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --preferred-challenges http

# Check if certificate was created
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "ERROR: Certificate not found!"
    echo "Please check:"
    echo "  1. DNS is pointing to $SERVER_IP"
    echo "  2. Security Group allows port 80"
    exit 1
fi

echo "Certificate obtained successfully!"

# Step 6: Configure Nginx with SSL
echo "[6/7] Configuring Nginx with SSL..."
sudo tee /etc/nginx/sites-available/kyvuongsuytam.site > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 200M;
    }

    # Upload routes
    location /api/upload/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
        client_max_body_size 100M;
    }

    # All other requests
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable SSL site
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/exe-project
sudo ln -sf /etc/nginx/sites-available/kyvuongsuytam.site /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Step 7: Start Nginx and setup auto-renewal
echo "[7/7] Starting Nginx and setting up auto-renewal..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "Testing certificate renewal..."
sudo certbot renew --dry-run

# Update environment variables
if [ -f "/home/ubuntu/exe-project/env.production" ]; then
    echo "Updating environment variables..."
    cd /home/ubuntu/exe-project
    sed -i 's|http://47.130.211.9|https://kyvuongsuytam.site|g' env.production
    if [ -f ".env.production" ]; then
        cp env.production .env.production
        pm2 restart exe-project
    fi
fi

echo ""
echo "=========================================="
echo "✅ SSL Certificate Setup Completed!"
echo "=========================================="
echo ""
echo "🌐 Your site: https://$DOMAIN"
echo "📜 Certificate location:"
echo "   Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "   Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "📅 Certificate expires on: $(sudo openssl x509 -in /etc/letsencrypt/live/$DOMAIN/cert.pem -noout -enddate | cut -d= -f2)"
echo ""
echo "🔄 Certificate will auto-renew before expiration"
echo ""

