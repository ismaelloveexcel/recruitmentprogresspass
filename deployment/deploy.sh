#!/bin/bash
# Quick deployment script for VPS/dedicated servers
# This script automates the deployment process on a fresh Ubuntu/Debian server

set -e  # Exit on any error

echo "🚀 Baynunah Recruitment Pass - Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Update system
echo ""
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
print_status "System updated"

# Install Node.js 20
echo ""
echo "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    print_status "Node.js installed"
else
    print_status "Node.js already installed"
fi

# Install pnpm (use specific version from package.json)
echo ""
echo "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@latest
    print_status "pnpm installed"
else
    print_status "pnpm already installed"
fi

# Install PM2
echo ""
echo "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Install Nginx
echo ""
echo "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_status "Nginx installed and started"
else
    print_status "Nginx already installed"
fi

# Install MySQL client (for testing database connectivity)
echo ""
echo "Installing MySQL client..."
apt-get install -y mysql-client
print_status "MySQL client installed"

# Create application directory
echo ""
echo "Setting up application directory..."
APP_DIR="/var/www/recruitmentprogresspass"
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    print_status "Application directory created at $APP_DIR"
else
    print_warning "Application directory already exists"
fi

# Set up application user
echo ""
echo "Setting up application user..."
if ! id -u appuser &> /dev/null; then
    useradd -r -s /bin/bash appuser
    print_status "Application user created"
else
    print_status "Application user already exists"
fi

# Clone or update repository
echo ""
read -p "Enter your GitHub repository URL (or press Enter to skip): " REPO_URL
if [ -n "$REPO_URL" ]; then
    if [ -d "$APP_DIR/.git" ]; then
        echo "Updating repository..."
        cd "$APP_DIR"
        git pull
        print_status "Repository updated"
    else
        echo "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        print_status "Repository cloned"
    fi
    
    # Set ownership
    chown -R appuser:appuser "$APP_DIR"
    
    # Install dependencies and build
    echo ""
    echo "Installing dependencies..."
    cd "$APP_DIR"
    sudo -u appuser pnpm install
    print_status "Dependencies installed"
    
    echo ""
    echo "Building application..."
    sudo -u appuser pnpm build
    print_status "Application built"
fi

# Set up environment file
echo ""
echo "Setting up environment configuration..."
if [ ! -f "$APP_DIR/.env" ]; then
    print_warning "No .env file found"
    read -p "Create .env file now? (y/n): " CREATE_ENV
    if [ "$CREATE_ENV" = "y" ]; then
        read -p "Enter DATABASE_URL: " DATABASE_URL
        read -p "Enter ADMIN_EMAIL: " ADMIN_EMAIL
        
        cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=4173
DATABASE_URL=$DATABASE_URL
ADMIN_EMAIL=$ADMIN_EMAIL
EOF
        chown appuser:appuser "$APP_DIR/.env"
        chmod 600 "$APP_DIR/.env"
        print_status "Environment file created"
    fi
else
    print_status "Environment file exists"
fi

# Run database migrations
echo ""
read -p "Run database migrations? (y/n): " RUN_MIGRATIONS
if [ "$RUN_MIGRATIONS" = "y" ]; then
    cd "$APP_DIR"
    sudo -u appuser pnpm db:push
    print_status "Database migrations completed"
fi

# Set up PM2
echo ""
echo "Setting up PM2..."
cd "$APP_DIR"
sudo -u appuser pm2 start dist/index.js --name recruitment-pass
sudo -u appuser pm2 save
pm2 startup systemd -u appuser --hp /home/appuser
print_status "PM2 configured"

# Set up Nginx
echo ""
read -p "Configure Nginx? (y/n): " CONFIGURE_NGINX
if [ "$CONFIGURE_NGINX" = "y" ]; then
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    
    if [ -n "$DOMAIN_NAME" ]; then
        # Create Nginx config from template
        cat > "/etc/nginx/sites-available/recruitment-pass" <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable site
        ln -sf /etc/nginx/sites-available/recruitment-pass /etc/nginx/sites-enabled/
        
        # Test and reload Nginx
        nginx -t
        systemctl reload nginx
        print_status "Nginx configured for $DOMAIN_NAME"
        
        # Offer to install SSL
        echo ""
        read -p "Install SSL certificate with Let's Encrypt? (y/n): " INSTALL_SSL
        if [ "$INSTALL_SSL" = "y" ]; then
            apt-get install -y certbot python3-certbot-nginx
            certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME"
            print_status "SSL certificate installed"
        fi
    fi
fi

# Set up firewall
echo ""
read -p "Configure firewall (UFW)? (y/n): " CONFIGURE_FIREWALL
if [ "$CONFIGURE_FIREWALL" = "y" ]; then
    apt-get install -y ufw
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw --force enable
    print_status "Firewall configured"
fi

# Final status
echo ""
echo "================================================"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "Access your application at:"
if [ -n "$DOMAIN_NAME" ]; then
    echo "  http://$DOMAIN_NAME"
else
    echo "  http://$(curl -s ifconfig.me):4173"
fi
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs recruitment-pass - View application logs"
echo "  pm2 restart recruitment-pass - Restart application"
echo "  pm2 stop recruitment-pass    - Stop application"
echo ""
print_warning "Remember to update your DNS records to point to this server!"
