#!/bin/bash
# Quick SSL setup script - Run this directly on EC2

DOMAIN="kyvuongsuytam.site"
EMAIL="admin@kyvuongsuytam.site"  # Thay đổi email của bạn

echo "🔒 Setting up SSL for $DOMAIN..."

# Install Certbot
sudo apt update -y
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

# Update Nginx config with SSL
sudo tee /etc/nginx/sites-available/kyvuongsuytam.site > /dev/null <<'EOF'
server {
    listen 80;
    server_name kyvuongsuytam.site www.kyvuongsuytam.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kyvuongsuytam.site www.kyvuongsuytam.site;

    ssl_certificate /etc/letsencrypt/live/kyvuongsuytam.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kyvuongsuytam.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/kyvuongsuytam.site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ SSL setup complete! Visit: https://$DOMAIN"

