#!/bin/bash
set -e

echo "🚀 LoveHub - Complete Setup Script"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="lovehub"

# 1. Check Python
echo -e "${YELLOW}[1/8] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python3 not found. Installing...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-venv python3-pip
fi
echo -e "${GREEN}✓ Python ready${NC}"

# 2. Create venv
echo -e "${YELLOW}[2/8] Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment ready${NC}"

# 3. Install dependencies
echo -e "${YELLOW}[3/8] Installing Python packages...${NC}"
pip install --upgrade pip --quiet
pip install -r backend/requirements.txt --quiet
echo -e "${GREEN}✓ Dependencies installed${NC}"

# 4. Create directories
echo -e "${YELLOW}[4/8] Creating directories...${NC}"
mkdir -p data
chmod 755 data
chmod 755 backend
echo -e "${GREEN}✓ Directories ready${NC}"

# 5. Initialize database
echo -e "${YELLOW}[5/8] Initializing database...${NC}"
cd backend
python3 database.py
cd ..
echo -e "${GREEN}✓ Database initialized${NC}"

# 6. Create systemd service
echo -e "${YELLOW}[6/8] Creating systemd service...${NC}"
SERVICE_FILE="/etc/systemd/system/${PROJECT_NAME}.service"
sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=LoveHub Flask Application
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/venv/bin"
Environment="PYTHONPATH=$PROJECT_DIR/backend"
ExecStart=$PROJECT_DIR/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 --timeout 120 --access-logfile - app:app
Restart=always
RestartSec=5
StandardOutput=append:/var/log/${PROJECT_NAME}.log
StandardError=append:/var/log/${PROJECT_NAME}-error.log

[Install]
WantedBy=multi-user.target
EOF

# 7. Setup Nginx
echo -e "${YELLOW}[7/8] Configuring Nginx...${NC}"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt update
    sudo apt install -y nginx
fi

# Copy project files to web root
WEB_ROOT="/var/www/${PROJECT_NAME}"
sudo mkdir -p $WEB_ROOT
sudo cp -r $PROJECT_DIR/* $WEB_ROOT/ 2>/dev/null || true
sudo chown -R $USER:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Nginx config
NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}"
sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    root $WEB_ROOT;
    index index.html;
    
    location /css/ {
        alias $WEB_ROOT/css/;
        expires 1w;
    }
    
    location /js/ {
        alias $WEB_ROOT/js/;
        expires 1w;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }
    
    location = /app {
        try_files /app.html =404;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 8. Start service
echo -e "${YELLOW}[8/8] Starting LoveHub service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable $PROJECT_NAME
sudo systemctl restart $PROJECT_NAME

# Wait for service to start
sleep 3

# Check status
if sudo systemctl is-active --quiet $PROJECT_NAME; then
    echo -e "${GREEN}✓ Service running${NC}"
else
    echo -e "${RED}✗ Service failed to start${NC}"
    sudo journalctl -u $PROJECT_NAME -n 20 --no-pager
fi

# Configure UFW
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp 2>/dev/null || true
    sudo ufw allow 22/tcp 2>/dev/null || true
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "🌐 Access LoveHub at:"
echo "   http://$SERVER_IP/"
echo ""
echo "📋 Default credentials:"
echo "   Username: pourya / sarina"
echo "   Password: 12345"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status $PROJECT_NAME"
echo "   sudo journalctl -u $PROJECT_NAME -f"
echo "   sudo systemctl restart $PROJECT_NAME"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Change SECRET_KEY in backend/config.py"
echo "   2. Add GROQ_API_KEY for AI features"
echo "   3. Change default passwords after first login"
echo ""

