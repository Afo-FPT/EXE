#!/bin/bash

# Setup Nginx and SSL for EC2
# Run this script on EC2 after deployment

set -e

EC2_HOST="13.237.124.97"
DOMAIN="" # Leave empty if using IP only

echo "🔧 Setting up Nginx and SSL..."

# Update nginx configuration
sudo cp /home/ubuntu/exe-project/nginx.conf /etc/nginx/sites-available/exe-project
sudo ln -sf /etc/nginx/sites-available/exe-project /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured successfully!"

# Setup SSL with Let's Encrypt (optional)
if [ ! -z "$DOMAIN" ]; then
    echo "🔒 Setting up SSL certificate..."
    
    # Install certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@example.com
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    echo "✅ SSL certificate installed!"
else
    echo "ℹ️  Skipping SSL setup (no domain provided)"
    echo "   To enable SSL later, run:"
    echo "   sudo certbot --nginx -d yourdomain.com"
fi

echo "🎉 Setup completed!"
echo "🌐 Your application is now accessible at: http://$EC2_HOST"
if [ ! -z "$DOMAIN" ]; then
    echo "🔒 SSL version: https://$DOMAIN"
fi


