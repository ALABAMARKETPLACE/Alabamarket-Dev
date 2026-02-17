#!/bin/bash
# deploy.sh - Located in the app root, committed to Git

# Exit on error
set -e

echo "📍 Current Directory: $(pwd)"
echo "🏷️ App Name: $APP_NAME"

# --- STEP 1: LOAD NODE & NPM ---
# We try to find the cPanel-installed Node version if NVM isn't active
if ! command -v npm &> /dev/null; then
    echo "⚠️ npm not found in PATH. Searching for cPanel Node..."
    CPANEL_NODE=$(ls -d /opt/cpanel/ea-nodejs*/bin | sort -V | tail -n 1)
    if [ -d "$CPANEL_NODE" ]; then
        export PATH="$CPANEL_NODE:$PATH"
        echo "✅ Found cPanel Node at: $CPANEL_NODE"
    else
        echo "❌ Could not find Node.js. Ensure it is installed in EasyApache 4."
        exit 1
    fi
fi

# --- STEP 2: INSTALL & BUILD ---
echo "📦 Running npm install..."
npm install --legacy-peer-deps

echo "🏗️ Running npm build..."
npm run build

# --- STEP 3: PM2 MANAGEMENT ---
# Check if PM2 is available, install globally if missing
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 not found. Installing..."
    npm install -g pm2
fi

echo "♻️ Restarting Application..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 reload "$APP_NAME"
else
    # Replace 'start' with your specific npm script if different
    pm2 start npm --name "$APP_NAME" -- start
fi

pm2 save
echo "🚀 Deployment Complete!"
