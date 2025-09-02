# Vercel Deployment Fix Guide

## Current Issues on studysharper.vercel.app

### 🚨 Issue 1: "Invalid email or password" 
**Cause**: Missing environment variables on Vercel

### 🚨 Issue 2: Google OAuth 404
**Cause**: Incorrect redirect URLs and missing environment variables

## ✅ Quick Fix Instructions

### Step 1: Set Environment Variables on Vercel

Go to your Vercel dashboard:
1. Open [studysharper project on Vercel](https://vercel.com/dashboard)
2. Go to Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=[copy from your .env.local]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[copy from your .env.local]
SUPABASE_SERVICE_ROLE_KEY=[copy from your .env.local]
GOOGLE_CLIENT_ID=[copy from your .env.local]
GOOGLE_CLIENT_SECRET=[copy from your .env.local]
NEXT_PUBLIC_SITE_URL=https://studysharper.vercel.app
```

### Step 2: Update Google OAuth Redirect URLs

In [Google Cloud Console](https://console.cloud.google.com/):
1. Go to APIs & Services → Credentials
2. Find your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
```
https://[YOUR_SUPABASE_ID].supabase.co/auth/v1/callback
https://studysharper.vercel.app/auth/callback
```

### Step 3: Redeploy Vercel

After setting environment variables:
1. Go to Vercel dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger deployment

## Testing After Fix

### Test Email Authentication:
- Go to https://studysharper.vercel.app
- Use: `renatodaprado@gmail.com` (confirmed user)
- Should work after environment variables are set

### Test Google OAuth:
- Click "Continue with Google"
- Should redirect properly after Google Console configuration

## Quick Test Commands

```bash
# Test if environment variables are working
curl https://studysharper.vercel.app/api/admin/list-users

# Should return user list instead of error
```

## Alternative: Manual User Confirmation on Production

If you need to confirm users on production:
```bash
# Confirm a user via production API
curl -X POST https://studysharper.vercel.app/api/admin/confirm-user \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@domain.com"}'
```

## Root Cause Summary

1. **Missing Env Vars**: Vercel doesn't have access to your .env.local file
2. **Wrong Redirect URLs**: Google OAuth needs production URLs
3. **Database Mismatch**: Production might be using different Supabase settings

After setting environment variables and redeploying, both email and Google authentication should work on production.