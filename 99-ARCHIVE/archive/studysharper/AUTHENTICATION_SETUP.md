# Authentication Setup Guide

## Issues Identified and Fixed

### ✅ Email Authentication Issue
**Problem**: Users couldn't sign in with email because email confirmation was required but emails weren't being sent.

**Solution**: Created admin tools to manually confirm users.

**Steps to fix existing users**:
1. Go to: `http://localhost:3010/admin/confirm-user`
2. List all users to see which ones need confirmation
3. Enter the email address and click "Confirm User"
4. User can now sign in with email/password

**API endpoints created**:
- `GET /api/admin/list-users` - List all users and their confirmation status
- `POST /api/admin/confirm-user` - Manually confirm a user's email

### 🔧 Google OAuth Issue
**Problem**: Google OAuth leads to 404 or redirects back to sign-in page.

**Root Cause**: Google OAuth application redirect URIs not properly configured.

**Required Google Console Configuration**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 client ID (check your .env.local file for GOOGLE_CLIENT_ID)
4. Add these Authorized redirect URIs:
   ```
   https://[YOUR_SUPABASE_ID].supabase.co/auth/v1/callback
   http://localhost:3010/auth/callback
   http://localhost:3000/auth/callback
   ```

**Supabase Configuration**:
1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Enter your Google Client ID and Secret (from your .env.local file):
   - Client ID: (value of GOOGLE_CLIENT_ID)
   - Client Secret: (value of GOOGLE_CLIENT_SECRET)

## Test Pages Created

### Email Authentication Testing
- `http://localhost:3010/test-auth` - Test all authentication functions
- `http://localhost:3010/test-confirm` - Test user confirmation and sign-in

### Google OAuth Testing  
- `http://localhost:3010/test-google` - Test Google OAuth specifically

### Admin Tools
- `http://localhost:3010/admin/confirm-user` - Manually confirm users
- `http://localhost:3010/auth-status` - Complete authentication dashboard

## Current Status

### ✅ Working
- Email sign-up (creates unconfirmed users)
- Email sign-in (after manual confirmation)
- Admin user confirmation tools
- User listing and management

### 🔧 Needs Google Console Configuration
- Google OAuth sign-in

## Quick Fix for Your 3 Existing Users

Based on the API call, you have these users:
1. `testuser@gmail.com` - ✅ Now confirmed
2. `renato.dansieri@gmail.com` - ✅ Already confirmed  
3. `renatodaprado@gmail.com` - ✅ Already confirmed

All three users should now be able to sign in with their email/password.

## Next Steps

1. **For Google OAuth**: Update Google Console redirect URIs as specified above
2. **For Email Service**: Configure Supabase SMTP settings (in Supabase dashboard > Settings > Auth) to send actual confirmation emails
3. **For Production**: Consider disabling email confirmation requirement in Supabase auth settings for easier user onboarding

## Testing Commands

```bash
# List all users
curl http://localhost:3010/api/admin/list-users

# Confirm a specific user
curl -X POST http://localhost:3010/api/admin/confirm-user \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Test sign-in via Supabase API
curl -X POST "https://[YOUR_SUPABASE_ID].supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```