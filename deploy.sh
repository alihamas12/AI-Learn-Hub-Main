#!/bin/bash

# LearnHub - Automated Deployment Script
# This script automates the deployment process on Ubuntu 22.04

set -e  # Exit on error

echo "=========================================="
echo "  LearnHub Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Run as regular user with sudo access."
    exit 1
fi

# Get user inputs
echo "Please provide the following information:"
echo ""
read -p "Your domain name (e.g., example.com): " DOMAIN_NAME
read -p "Your email for SSL certificate: " SSL_EMAIL
read -p "MongoDB Connection String: " MONGO_URL
read -p "Database Name [learnhub]: " DB_NAME
DB_NAME=${DB_NAME:-learnhub}

echo ""
print_info "Starting deployment process..."
echo ""

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js
print_info "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js already installed"
fi

# Install Yarn
print_info "Installing Yarn..."
if ! command -v yarn &> /dev/null; then
    sudo npm install -g yarn
    print_success "Yarn installed"
else
    print_success "Yarn already installed"
fi

# Install Python
print_info "Installing Python 3.11..."
if ! command -v python3.11 &> /dev/null; then
    sudo apt install -y python3.11 python3.11-venv python3-pip
    print_success "Python 3.11 installed"
else
    print_success "Python 3.11 already installed"
fi

# Install PM2
print_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Install Nginx
print_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Install Certbot
print_info "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot already installed"
fi

# Create directory structure
print_info "Creating directory structure..."
sudo mkdir -p /var/www/learnhub
sudo chown -R $USER:$USER /var/www/learnhub
print_success "Directory structure created"

# Setup Backend
print_info "Setting up backend..."
cd /var/www/learnhub/backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt
deactivate
print_success "Backend dependencies installed"

# Create backend .env file
print_info "Creating backend .env file..."
cat > .env << EOF
# Database Configuration
MONGO_URL=${MONGO_URL}
DB_NAME=${DB_NAME}

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=$(openssl rand -hex 32)

# Admin Commission
ADMIN_COMMISSION=0.15

# Stripe Configuration (ADD YOUR KEYS)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# SendGrid Configuration (ADD YOUR KEY)
SENDGRID_API_KEY=SG.your_key_here
SENDER_EMAIL=noreply@${DOMAIN_NAME}

# OpenAI Configuration (ADD YOUR KEY)
OPENAI_API_KEY=sk-your_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8001
EOF
print_success "Backend .env created (UPDATE API KEYS!)"

# Create PM2 ecosystem file
print_info "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learnhub-backend',
    script: 'venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    cwd: '/var/www/learnhub/backend',
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF
print_success "PM2 configuration created"

# Setup Frontend
print_info "Setting up frontend..."
cd /var/www/learnhub/frontend

# Install dependencies
yarn install
print_success "Frontend dependencies installed"

# Create frontend .env
print_info "Creating frontend .env file..."
cat > .env << EOF
REACT_APP_BACKEND_URL=https://${DOMAIN_NAME}
EOF
print_success "Frontend .env created"

# Build frontend
print_info "Building frontend (this may take a few minutes)..."
yarn build
print_success "Frontend built successfully"

# Configure Nginx
print_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/learnhub > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    # SSL certificates will be added by Certbot

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
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
    }

    # Frontend
    location / {
        root /var/www/learnhub/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/learnhub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
print_success "Nginx configured"

# Restart Nginx
sudo systemctl restart nginx
print_success "Nginx restarted"

# Start backend with PM2
print_info "Starting backend with PM2..."
cd /var/www/learnhub/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
print_success "Backend started"

# Setup firewall
print_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
print_success "Firewall configured"

# Install SSL certificate
print_info "Installing SSL certificate..."
echo ""
echo "Press Enter to continue with SSL setup, or Ctrl+C to skip (you can run certbot manually later)"
read

sudo certbot --nginx -d ${DOMAIN_NAME} -d www.${DOMAIN_NAME} --non-interactive --agree-tos -m ${SSL_EMAIL} --redirect || print_error "Certbot failed. You may need to run it manually: sudo certbot --nginx -d ${DOMAIN_NAME}"

echo ""
echo "=========================================="
echo "  Deployment Complete! 🎉"
echo "=========================================="
echo ""
print_success "LearnHub has been deployed successfully!"
echo ""
echo "Next Steps:"
echo "1. Update API keys in /var/www/learnhub/backend/.env"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - SENDGRID_API_KEY"
echo "   - OPENAI_API_KEY (or EMERGENT_LLM_KEY)"
echo ""
echo "2. After updating .env, restart backend:"
echo "   pm2 restart learnhub-backend"
echo ""
echo "3. Create an admin user (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "4. Setup Stripe webhook:"
echo "   URL: https://${DOMAIN_NAME}/api/webhook/stripe"
echo ""
echo "5. Test your application:"
echo "   https://${DOMAIN_NAME}"
echo ""
echo "Useful Commands:"
echo "  pm2 status              - Check backend status"
echo "  pm2 logs               - View backend logs"
echo "  sudo systemctl status nginx  - Check Nginx status"
echo "  sudo certbot renew     - Renew SSL certificate"
echo ""
print_info "For detailed documentation, see /var/www/learnhub/DEPLOYMENT_GUIDE.md"
echo ""
