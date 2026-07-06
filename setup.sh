#!/bin/bash
set -e

echo "🚀 LoveHub Setup Script"
echo "========================"

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. ساخت venv
echo -e "${YELLOW}[1/6] Creating Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 2. نصب dependencies
echo -e "${YELLOW}[2/6] Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. ساخت پوشه data
echo -e "${YELLOW}[3/6] Creating data directory...${NC}"
mkdir -p data
chmod 755 data

# 4. مقداردهی اولیه دیتابیس
echo -e "${YELLOW}[4/6] Initializing database...${NC}"
cd backend
python database.py
cd ..

# 5. ساخت سرویس systemd
echo -e "${YELLOW}[5/6] Creating systemd service...${NC}"
SERVICE_FILE="/etc/systemd/system/lovehub.service"
sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=LoveHub Flask Application
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/venv/bin"
ExecStart=$PROJECT_DIR/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 --timeout 120 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 6. تنظیم Nginx
echo -e "${YELLOW}[6/6] Configuring Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/lovehub"
sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    root $PROJECT_DIR;
    index index.html;
    
    location /css/ {
        alias $PROJECT_DIR/css/;
        expires 1w;
    }
    
    location /js/ {
        alias $PROJECT_DIR/js/;
        expires 1w;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 120s;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location = /app {
        try_files /app.html =404;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. فعال‌سازی سرویس
echo -e "${YELLOW}[7/7] Starting LoveHub service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable lovehub
sudo systemctl restart lovehub

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🌐 Access LoveHub at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo ""
echo "📋 Default credentials:"
echo "   Username: pourya / sarina"
echo "   Password: 12345"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status lovehub"
echo "   sudo journalctl -u lovehub -f"
echo "   sudo systemctl restart lovehub"

