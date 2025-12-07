#!/bin/bash
# Fix 502 Bad Gateway error

echo "Diagnosing 502 Bad Gateway error..."

# 1. Check if PM2 app is running
echo "1. Checking PM2 status..."
pm2 status

# 2. Check if app is listening on port 3000
echo ""
echo "2. Checking port 3000..."
netstat -tlnp | grep :3000 || echo "Port 3000 is not listening!"

# 3. Check PM2 logs
echo ""
echo "3. Recent PM2 logs:"
pm2 logs exe-project --lines 20 --nostream

# 4. Check Nginx error logs
echo ""
echo "4. Recent Nginx error logs:"
sudo tail -n 20 /var/log/nginx/error.log

# 5. Check if app process exists
echo ""
echo "5. Checking Node.js processes:"
ps aux | grep node | grep -v grep

echo ""
echo "If app is not running, try:"
echo "  pm2 restart exe-project"
echo "  or"
echo "  cd /home/ubuntu/exe-project && pm2 start npm --name 'exe-project' -- start"

