#!/bin/bash

# Script to setup environment variables for Alabamarket Frontend
# Run this on the production server as: bash setup-env.sh

set -e

APP_DIR="/home/alabamarketplace-frontend"
ENV_FILE="$APP_DIR/.env.local"

echo "=========================================="
echo "Alabamarket Frontend Environment Setup"
echo "=========================================="
echo ""

# Check if running as root (needed for file operations)
if [ "$EUID" -ne 0 ]; then 
    echo "❌ This script must be run as root"
    echo "   Run: sudo bash setup-env.sh"
    exit 1
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application directory not found: $APP_DIR"
    exit 1
fi

# Ask user for configuration
echo "🔧 Configuring NextAuth..."
echo ""

# Generate NEXTAUTH_SECRET if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Generating secure NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✓ Generated: ${NEXTAUTH_SECRET:0:20}..."
fi

# Get NEXTAUTH_URL
read -p "Enter your frontend URL (default: https://development.alabamarketplace.ng): " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-https://development.alabamarketplace.ng}

# Get API Base URL
read -p "Enter API base URL (default: https://20.56.132.97:8000/): " API_BASE_URL
API_BASE_URL=${API_BASE_URL:-https://20.56.132.97:8000/}

# Get Google Token (optional)
read -p "Enter NEXT_PUBLIC_GOOGLE_TOKEN (press Enter to skip): " GOOGLE_TOKEN

echo ""
echo "ℹ️  Firebase configuration..."
read -p "Enter NEXT_PUBLIC_APIKEY: " FB_APIKEY
read -p "Enter NEXT_PUBLIC_AUTHDOMAIN: " FB_AUTHDOMAIN
read -p "Enter NEXT_PUBLIC_PROJECTID: " FB_PROJECTID
read -p "Enter NEXT_PUBLIC_STORAGE_BUCKET: " FB_STORAGE_BUCKET
read -p "Enter NEXT_PUBLIC_MESSAGING_SENDER_ID: " FB_SENDER_ID
read -p "Enter NEXT_PUBLIC_APP_ID: " FB_APP_ID
read -p "Enter NEXT_PUBLIC_MEASUREMENT_ID (optional, press Enter to skip): " FB_MEASUREMENT_ID

# Create .env.local
echo ""
echo "📝 Creating $ENV_FILE..."

cat > "$ENV_FILE" << EOF
# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=$NEXTAUTH_URL

# API Configuration
NEXT_PUBLIC_BASE_URL=$API_BASE_URL

# Google API Configuration
NEXT_PUBLIC_GOOGLE_TOKEN=$GOOGLE_TOKEN

# Firebase Configuration
NEXT_PUBLIC_APIKEY=$FB_APIKEY
NEXT_PUBLIC_AUTHDOMAIN=$FB_AUTHDOMAIN
NEXT_PUBLIC_PROJECTID=$FB_PROJECTID
NEXT_PUBLIC_STORAGE_BUCKET=$FB_STORAGE_BUCKET
NEXT_PUBLIC_MESSAGING_SENDER_ID=$FB_SENDER_ID
NEXT_PUBLIC_APP_ID=$FB_APP_ID
NEXT_PUBLIC_MEASUREMENT_ID=$FB_MEASUREMENT_ID
EOF

# Set proper permissions
chmod 600 "$ENV_FILE"
chown alabamarketplace-user:alabamarketplace-user "$ENV_FILE" 2>/dev/null || true

echo "✓ Environment file created: $ENV_FILE"
echo ""

# Verify file content (without showing secrets)
echo "✓ File contents (secrets redacted):"
echo "  - NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
echo "  - NEXTAUTH_URL: $NEXTAUTH_URL"
echo "  - NEXT_PUBLIC_BASE_URL: $API_BASE_URL"
echo ""

# Ask if user wants to rebuild and restart
read -p "🔨 Do you want to rebuild and restart the application? (y/N): " REBUILD
if [ "$REBUILD" = "y" ] || [ "$REBUILD" = "Y" ]; then
    echo ""
    echo "Building application..."
    cd "$APP_DIR"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    # Build
    echo "Building Next.js application..."
    npm run build
    
    # Restart PM2
    echo "Restarting PM2..."
    pm2 stop alabamarketplace-frontend || true
    pm2 restart alabamarketplace-frontend
    pm2 save
    
    echo ""
    echo "✓ Application rebuilt and restarted"
    echo ""
    echo "Testing endpoints..."
    sleep 2
    
    # Test the endpoints
    if curl -s -o /dev/null -w "%{http_code}" "https://development.alabamarketplace.ng/api/auth/session" | grep -q "200\|405"; then
        echo "✓ API routes are accessible!"
    else
        echo "⚠️  API routes might not be accessible yet. Give it 10-15 seconds and try again."
    fi
else
    echo ""
    echo "⚠️  Remember to rebuild and restart the application:"
    echo "   cd $APP_DIR"
    echo "   npm install --legacy-peer-deps"
    echo "   npm run build"
    echo "   pm2 restart alabamarketplace-frontend"
fi

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify PM2 is running: pm2 status"
echo "2. Check logs: pm2 logs alabamarketplace-frontend"
echo "3. Test endpoints: curl https://development.alabamarketplace.ng/api/auth/session"
echo ""
