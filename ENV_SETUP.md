# Environment Setup for Alabamarket Frontend

## Production Environment Variables

The application requires the following environment variables to be set on the production server. These must be added to `/home/alabamarketplace-frontend/.env.local`

### Critical for NextAuth (Authentication)
```bash
# Generate a secure random string for NEXTAUTH_SECRET
# Use: openssl rand -base64 32
NEXTAUTH_SECRET=<generate-secure-random-string>

# The URL of your frontend application (required for next-auth)
NEXTAUTH_URL=https://development.alabamarketplace.ng
```

### API Configuration
```bash
# Base URL for the backend API (use HTTPS in production)
NEXT_PUBLIC_BASE_URL=https://20.56.132.97:8000/
```

### Google API Configuration
```bash
# Get this from Google Cloud Console
NEXT_PUBLIC_GOOGLE_TOKEN=<your-google-api-token>
```

### Firebase Configuration
```bash
# Get these from your Firebase project settings
NEXT_PUBLIC_APIKEY=<firebase-api-key>
NEXT_PUBLIC_AUTHDOMAIN=<firebase-auth-domain>
NEXT_PUBLIC_PROJECTID=<firebase-project-id>
NEXT_PUBLIC_STORAGE_BUCKET=<firebase-storage-bucket>
NEXT_PUBLIC_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
NEXT_PUBLIC_APP_ID=<firebase-app-id>
NEXT_PUBLIC_MEASUREMENT_ID=<firebase-measurement-id>
```

## Setup Instructions

### Step 1: Generate NEXTAUTH_SECRET

On the server, generate a secure random string:

```bash
openssl rand -base64 32
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

### Step 2: Create .env.local on Server

SSH into the server and create the environment file:

```bash
ssh root@20.56.132.97

# Create the env file
cat > /home/alabamarketplace-frontend/.env.local << 'EOF'
# NextAuth Configuration
NEXTAUTH_SECRET=<paste-the-generated-secret-here>
NEXTAUTH_URL=https://development.alabamarketplace.ng

# API Configuration
NEXT_PUBLIC_BASE_URL=https://20.56.132.97:8000/

# Google API
NEXT_PUBLIC_GOOGLE_TOKEN=<your-google-api-token>

# Firebase Configuration
NEXT_PUBLIC_APIKEY=<firebase-values>
NEXT_PUBLIC_AUTHDOMAIN=<firebase-values>
NEXT_PUBLIC_PROJECTID=<firebase-values>
NEXT_PUBLIC_STORAGE_BUCKET=<firebase-values>
NEXT_PUBLIC_MESSAGING_SENDER_ID=<firebase-values>
NEXT_PUBLIC_APP_ID=<firebase-values>
NEXT_PUBLIC_MEASUREMENT_ID=<firebase-values>
EOF

# Verify the file was created
cat /home/alabamarketplace-frontend/.env.local
```

### Step 3: Rebuild and Restart the Application

```bash
cd /home/alabamarketplace-frontend

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Restart PM2
pm2 restart alabamarketplace-frontend
pm2 save
```

## Troubleshooting

### Issue: `/api/auth/session` returns 404

**Cause:** `NEXTAUTH_SECRET` is not set or not properly loaded

**Fix:**
1. Verify `.env.local` exists: `cat /home/alabamarketplace-frontend/.env.local`
2. Check if NEXTAUTH_SECRET is set: `echo $NEXTAUTH_SECRET`
3. If not set, follow Step 2 above
4. Rebuild and restart the application

### Issue: NextAuth throws "secret is required" error

**Cause:** Environment variables are not being passed to the PM2 process

**Fix:**
1. Check PM2 configuration: `pm2 show alabamarketplace-frontend`
2. Restart PM2 with proper env vars:
   ```bash
   pm2 stop alabamarketplace-frontend
   pm2 delete alabamarketplace-frontend
   cd /home/alabamarketplace-frontend
   pm2 start npm --name alabamarketplace-frontend -- start
   pm2 save
   ```

### Issue: Session endpoints still return 404

**Cause:** Next.js build didn't include the API routes

**Fix:**
1. Full rebuild:
   ```bash
   rm -rf .next
   npm run build
   pm2 restart alabamarketplace-frontend
   ```
2. Verify routes exist: `curl https://development.alabamarketplace.ng/api/auth/session`
3. Check PM2 logs: `pm2 logs alabamarketplace-frontend`

## Environment Variable Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| NEXTAUTH_SECRET | String | Yes | `a1b2c3d4e5f6g7h8...` |
| NEXTAUTH_URL | String | Yes | `https://development.alabamarketplace.ng` |
| NEXT_PUBLIC_BASE_URL | String | Yes | `https://20.56.132.97:8000/` |
| NEXT_PUBLIC_GOOGLE_TOKEN | String | No | `AIzaSy...` |
| NEXT_PUBLIC_APIKEY | String | Yes (Firebase) | `AIzaSy...` |
| NEXT_PUBLIC_AUTHDOMAIN | String | Yes (Firebase) | `project.firebaseapp.com` |
| NEXT_PUBLIC_PROJECTID | String | Yes (Firebase) | `project-id` |
| NEXT_PUBLIC_STORAGE_BUCKET | String | Yes (Firebase) | `bucket.appspot.com` |
| NEXT_PUBLIC_MESSAGING_SENDER_ID | String | Yes (Firebase) | `123456789` |
| NEXT_PUBLIC_APP_ID | String | Yes (Firebase) | `1:123456789:web:abc123` |
| NEXT_PUBLIC_MEASUREMENT_ID | String | No | `G-ABC123` |

## Verification Commands

```bash
# Check if .env.local exists and is readable
test -f /home/alabamarketplace-frontend/.env.local && echo "✓ .env.local exists" || echo "✗ .env.local missing"

# Check if environment variables are accessible
pm2 env alabamarketplace-frontend | grep NEXTAUTH_SECRET

# Test the auth endpoint
curl -v https://development.alabamarketplace.ng/api/auth/session

# Check PM2 logs for environment variable warnings
pm2 logs alabamarketplace-frontend --lines 50
```

## GitHub Actions Deployment

The `.github/workflows/deploy-frontend.yml` workflow automatically:
1. Builds the Next.js application
2. Syncs files to the production server
3. Runs `npm install --legacy-peer-deps`
4. Runs `npm run build`
5. Restarts PM2 process

**Note:** Environment variables must already be set in `/home/alabamarketplace-frontend/.env.local` before deployment. The workflow does not create or update `.env.local`.

To update environment variables after deployment:
1. SSH into the server
2. Edit `/home/alabamarketplace-frontend/.env.local`
3. Run: `pm2 restart alabamarketplace-frontend`

