#!/bin/bash
# deploy.sh - Located in the app root, committed to Git

# Exit on error
set -e

export PATH=/opt/cpanel/ea-nodejs22/bin:$PATH

echo "📍 Current Directory: $(pwd)"
echo "🏷️ App Name: $APP_NAME"

echo "📦 Running npm install..."
npm install --legacy-peer-deps

echo "🧹 Clearing build cache..."
rm -f tsconfig.tsbuildinfo
rm -rf .next

echo "🏗️ Running npm build..."
npm run build

echo "♻️ Restarting Application..."

# If app doesn't exist yet, start it from ecosystem file
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    # Restart using ecosystem config
pm2 restart $APP_NAME --update-env
else
    cd ~  # Where ecosystem.config.js lives
    pm2 start ecosystem.config.js --only "$APP_NAME"
fi

pm2 save
echo "🚀 Deployment Complete!"
