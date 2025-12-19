# NextAuth 404 Error - Quick Fix

## The Problem
```
GET https://development.alabamarketplace.ng/api/auth/session 404 (Not Found)
POST https://development.alabamarketplace.ng/api/auth/_log 404 (Not Found)
```

## The Fix (Run on Production Server)

### Step 1: Generate Secret
```bash
ssh root@20.56.132.97
openssl rand -base64 32
# Save the output
```

### Step 2: Quick Auto-Setup
```bash
cd /home/alabamarketplace-frontend
git pull origin main
chmod +x setup-env.sh
bash setup-env.sh
```

### Step 3: Manual Alternative
```bash
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=<generated-secret-from-step-1>
NEXTAUTH_URL=https://development.alabamarketplace.ng
NEXT_PUBLIC_BASE_URL=https://20.56.132.97:8000/
NEXT_PUBLIC_GOOGLE_TOKEN=<get-from-google-console>
NEXT_PUBLIC_APIKEY=<firebase>
NEXT_PUBLIC_AUTHDOMAIN=<firebase>
NEXT_PUBLIC_PROJECTID=<firebase>
NEXT_PUBLIC_STORAGE_BUCKET=<firebase>
NEXT_PUBLIC_MESSAGING_SENDER_ID=<firebase>
NEXT_PUBLIC_APP_ID=<firebase>
NEXT_PUBLIC_MEASUREMENT_ID=<firebase>
EOF

# Build & restart
npm install --legacy-peer-deps
npm run build
pm2 restart alabamarketplace-frontend
```

## Verify It Works
```bash
curl -s https://development.alabamarketplace.ng/api/auth/session | head -20
# Should NOT return 404
```

## Still Broken?
```bash
# Check logs
pm2 logs alabamarketplace-frontend --lines 50

# Verify file exists
cat .env.local | grep NEXTAUTH

# Full rebuild
rm -rf .next
npm run build
pm2 restart alabamarketplace-frontend
```

## Documentation
- Full Guide: [ENV_SETUP.md](./ENV_SETUP.md)
- Setup Script: [setup-env.sh](./setup-env.sh)
- Action Plan: [NEXTAUTH_FIX.md](./NEXTAUTH_FIX.md)
