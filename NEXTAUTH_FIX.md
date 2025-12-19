# Fix for NextAuth 404 Error - Action Required

## Problem Summary
The production server is returning 404 errors for `/api/auth/session` and `/api/auth/_log` because the required NextAuth environment variables are not configured.

**Errors:**
- `GET https://development.alabamarketplace.ng/api/auth/session 404 (Not Found)`
- `POST https://development.alabamarketplace.ng/api/auth/_log 404 (Not Found)`

## Root Cause
- `NEXTAUTH_SECRET` environment variable is missing
- `NEXTAUTH_URL` environment variable is not set
- These are **required** for next-auth to function properly in production

## Solution Implemented

### 1. Code Changes
✅ **Completed locally and pushed to GitHub**
- Added fallback secret function in `src/app/api/auth/[...nextauth]/options.ts`
- Enhanced error handling in `src/app/api/auth/[...nextauth]/route.ts`
- Created comprehensive setup documentation

### 2. New Files Created
✅ **Pushed to GitHub - ready to deploy**
- `ENV_SETUP.md` - Complete configuration guide
- `setup-env.sh` - Automated setup script for production server

## Required Action on Production Server

### Option A: Automated Setup (Recommended)

SSH into the production server and run:

```bash
ssh root@20.56.132.97

# Pull the latest code first
cd /home/alabamarketplace-frontend
git pull origin main

# Make the setup script executable
chmod +x setup-env.sh

# Run the setup script
bash setup-env.sh
```

The script will:
1. Generate a secure NEXTAUTH_SECRET
2. Ask for configuration values
3. Create `.env.local` with all required variables
4. Optionally rebuild and restart the application

### Option B: Manual Setup

1. **Generate secure secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **SSH to server:**
   ```bash
   ssh root@20.56.132.97
   cd /home/alabamarketplace-frontend
   ```

3. **Create `.env.local` file:**
   ```bash
   cat > .env.local << 'EOF'
   # NextAuth Configuration
   NEXTAUTH_SECRET=<paste-generated-secret>
   NEXTAUTH_URL=https://development.alabamarketplace.ng

   # API Configuration
   NEXT_PUBLIC_BASE_URL=https://20.56.132.97:8000/

   # Google API Configuration
   NEXT_PUBLIC_GOOGLE_TOKEN=<your-google-token>

   # Firebase Configuration
   NEXT_PUBLIC_APIKEY=<your-firebase-apikey>
   NEXT_PUBLIC_AUTHDOMAIN=<your-firebase-authdomain>
   NEXT_PUBLIC_PROJECTID=<your-firebase-projectid>
   NEXT_PUBLIC_STORAGE_BUCKET=<your-firebase-storage-bucket>
   NEXT_PUBLIC_MESSAGING_SENDER_ID=<your-firebase-sender-id>
   NEXT_PUBLIC_APP_ID=<your-firebase-app-id>
   NEXT_PUBLIC_MEASUREMENT_ID=<your-firebase-measurement-id>
   EOF
   ```

4. **Rebuild and restart:**
   ```bash
   npm install --legacy-peer-deps
   npm run build
   pm2 restart alabamarketplace-frontend
   pm2 save
   ```

5. **Verify it's working:**
   ```bash
   curl -s https://development.alabamarketplace.ng/api/auth/session | head -20
   ```

## Deployment Status

### Local Changes (Completed ✅)
- [x] NextAuth secret fallback logic added
- [x] Error handling enhanced
- [x] Environment setup documentation created
- [x] Automated setup script created
- [x] All changes pushed to GitHub

### GitHub Actions (In Progress)
- Workflow: `.github/workflows/deploy-frontend.yml`
- Status: Should trigger automatically
- Actions:
  1. Checkout latest code
  2. Build Next.js application
  3. Sync files to production server
  4. Restart PM2 process

### Production Server (Awaiting Action)
- [ ] Run `setup-env.sh` OR manually create `.env.local`
- [ ] Verify endpoints are accessible
- [ ] Monitor PM2 logs for errors

## Verification Commands

After setup, run these on the server to verify:

```bash
# Check environment file exists
test -f /home/alabamarketplace-frontend/.env.local && echo "✓ .env.local exists"

# Check PM2 process
pm2 status

# View recent logs
pm2 logs alabamarketplace-frontend --lines 20

# Test authentication endpoint
curl -v https://development.alabamarketplace.ng/api/auth/session

# Check for errors in logs (should see "✓ Compiled successfully")
pm2 logs alabamarketplace-frontend | grep -i "compiled\|error"
```

## Expected Results

After completing the setup:
- ✅ `/api/auth/session` will return proper response (not 404)
- ✅ `/api/auth/_log` will work correctly
- ✅ NextAuth functionality will be fully operational
- ✅ Authentication flows will work on the frontend

## Troubleshooting

### Still getting 404 errors?

1. **Check if `.env.local` exists:**
   ```bash
   ls -la /home/alabamarketplace-frontend/.env.local
   ```

2. **Verify environment variables loaded:**
   ```bash
   pm2 show alabamarketplace-frontend | grep "env:"
   ```

3. **Check if rebuild completed:**
   ```bash
   ls -la /home/alabamarketplace-frontend/.next
   ```

4. **View full PM2 logs:**
   ```bash
   pm2 logs alabamarketplace-frontend --lines 100
   ```

5. **Check if API routes exist in build:**
   ```bash
   find .next -name "*auth*" -type f
   ```

### NextAuth Secret error?

**Problem:** "secret is required" in logs

**Solution:**
```bash
# Verify NEXTAUTH_SECRET is in .env.local
grep NEXTAUTH_SECRET /home/alabamarketplace-frontend/.env.local

# If not there, add it:
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Restart
pm2 restart alabamarketplace-frontend
```

## Files Changed

### Modified Files
- `src/app/api/auth/[...nextauth]/options.ts` - Added secret fallback
- `src/app/api/auth/[...nextauth]/route.ts` - Enhanced error handling

### New Files
- `ENV_SETUP.md` - Configuration documentation
- `setup-env.sh` - Automated setup script
- `NEXTAUTH_FIX.md` - This action summary

## Timeline

- **Dec 19, 2025 - Current**: Code changes completed and pushed
- **Next Steps**: Execute setup on production server
- **Expected**: Full NextAuth functionality within 5-10 minutes of setup

## Questions?

Refer to the comprehensive guide in [ENV_SETUP.md](./ENV_SETUP.md)

