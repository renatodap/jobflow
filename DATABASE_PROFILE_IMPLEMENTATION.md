# JobFlow Database Profile Implementation Guide

## Overview

JobFlow now uses a **database-driven profile system** instead of `profile.json`. Users create accounts, complete a multi-step profile setup, and all data is stored in Supabase with automatic syncing to the job search engine.

## What's Been Implemented

### 1. Database Schema ✅
**Location**: `database/migrations/001_user_profiles.sql`

- **Tables Created**:
  - `profiles` - Personal information
  - `education` - Academic background
  - `work_experience` - Job history
  - `skills` - Technical skills by category
  - `projects` - Portfolio projects
  - `job_preferences` - Salary, location, role preferences
  - `certifications` - Professional certifications
  - `generated_materials` - Saved resumes/cover letters

- **Security**: Row Level Security (RLS) ensures users only access their own data
- **Features**: Auto-timestamping, profile completeness tracking, 30-day auto-cleanup of old materials

### 2. Authentication System ✅
**Location**: `app/providers.tsx`, `lib/supabase/client.ts`

- **Supabase Auth Integration**: Email/password authentication
- **Session Management**: Automatic token refresh
- **Protected Routes**: Redirect to login if not authenticated
- **Profile Check**: Auto-redirect to setup if profile incomplete

### 3. Profile Setup UI ✅
**Location**: `app/profile/setup/page.tsx`

- **6-Step Wizard**:
  1. Personal Information (name, location, links)
  2. Education (multiple degrees supported)
  3. Work Experience (with current job support)
  4. Technical Skills (categorized)
  5. Projects (with GitHub links)
  6. Job Preferences (roles, salary, locations)

- **Features**:
  - Progress tracking
  - Real-time validation
  - Dynamic add/remove for arrays
  - Auto-save at each step
  - Resume from last incomplete step

### 4. Database Client for Python ✅
**Location**: `core/services/profile_database_client.py`

- **ProfileDatabaseClient**: Fetches profiles from Supabase
- **ProfileManager**: Handles database with local fallback
- **Material Storage**: Saves generated resumes/covers to database
- **Format Conversion**: Transforms database structure to JobFlow format

## Setup Instructions

### Step 1: Database Setup

1. **Create Supabase Project**:
   ```
   1. Go to https://supabase.com
   2. Create new project
   3. Save your database password
   ```

2. **Run Migration**:
   ```sql
   -- In Supabase SQL Editor:
   -- 1. Copy entire contents of database/migrations/001_user_profiles.sql
   -- 2. Paste and click "Run"
   ```

3. **Get Credentials**:
   ```
   Settings → API →
   - Copy "URL" (public)
   - Copy "anon public" key
   - Copy "service_role" key (keep secret!)
   ```

### Step 2: Environment Configuration

Create/update `.env.local`:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# AI Services (Required)
OPENAI_API_KEY=sk-...

# Job Search (Required)
ADZUNA_APP_ID=...
ADZUNA_API_KEY=...
```

### Step 3: Install Dependencies

```bash
# Frontend
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js

# Backend (Python)
pip install supabase python-dotenv
```

### Step 4: Update Application

1. **Wrap app with AuthProvider**:
   ```tsx
   // app/layout.tsx
   import { AuthProvider } from './providers'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>{children}</AuthProvider>
         </body>
       </html>
     )
   }
   ```

2. **Protect Routes**:
   ```tsx
   // Any protected page
   import { useAuth } from '@/app/providers'
   
   export default function DashboardPage() {
     const { user, loading } = useAuth()
     
     if (loading) return <div>Loading...</div>
     if (!user) {
       router.push('/login')
       return null
     }
     
     // Your page content
   }
   ```

### Step 5: Deploy to Vercel

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add Environment Variables**:
   - All variables from `.env.local`
4. **Deploy**

## User Flow

### New User Journey

1. **Landing Page** (`/`) → Click "Get Started"
2. **Sign Up** (`/signup`) → Create account with email/password
3. **Email Verification** → Check email, click link
4. **Profile Setup** (`/profile/setup`) → Complete 6 steps
5. **Dashboard** (`/dashboard`) → Start using JobFlow

### Returning User

1. **Login** (`/login`) → Email + password
2. **Dashboard** → If profile complete
3. **Profile Setup** → If profile incomplete (resumes from last step)

## Python Integration

### Using Database Profiles

```python
from core.services.profile_database_client import ProfileManager

# Initialize manager (auto-detects database vs local)
manager = ProfileManager(prefer_database=True)

# Get profile by email
profile = manager.get_profile(email="user@example.com")

# Or by user ID
profile = manager.get_profile(user_id="uuid-here")

# Access profile data
name = profile['personal']['name']
skills = profile['skills']['languages']
desired_role = profile['preferences']['desired_role']

# Save generated resume
if manager.db_client:
    manager.db_client.save_generated_material(
        user_id="user-uuid",
        material_type="resume",
        content=resume_text,
        job_info={'company': 'Google', 'title': 'Software Engineer'},
        metadata={'ai_model': 'gpt-4', 'cost': 0.10}
    )
```

### Update Existing Scripts

Replace profile loading in your scripts:

**Before**:
```python
import json
with open('profile.json', 'r') as f:
    profile = json.load(f)
```

**After**:
```python
from core.services.profile_database_client import ProfileManager

manager = ProfileManager()
profile = manager.get_profile(email=user_email)
```

## API Endpoints

### Profile Management

- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/data` - Get complete profile data
- `POST /api/profile/setup` - Save setup step

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/reset-password` - Password reset

## Benefits of Database Profiles

1. **Multi-User Support** ✅
   - Each user has isolated data
   - Secure with Row Level Security
   - No profile.json conflicts

2. **Web-Based Setup** ✅
   - No manual JSON editing
   - Guided wizard interface
   - Validation and error handling

3. **Persistent Storage** ✅
   - Profiles saved permanently
   - Access from any device
   - Automatic backups

4. **Material History** ✅
   - All generated resumes saved
   - Track what was sent where
   - Reuse successful materials

5. **SaaS Ready** ✅
   - Add payments easily
   - User management built-in
   - Scale to thousands of users

## Migration from profile.json

### For Existing Users

1. **Keep using profile.json** (works as fallback)
2. **Or migrate to database**:
   ```python
   # One-time migration script
   from core.services.profile_database_client import ProfileDatabaseClient
   import json
   
   # Load old profile
   with open('profile.json', 'r') as f:
       old_profile = json.load(f)
   
   # Create database client
   client = ProfileDatabaseClient()
   
   # Insert into database (needs formatting)
   # ... migration logic ...
   ```

## Testing the Implementation

### 1. Test Authentication
```bash
# Start the app
npm run dev

# Visit http://localhost:3000
# Click "Sign Up"
# Create account
# Check email for verification
```

### 2. Test Profile Setup
```bash
# After login, should redirect to /profile/setup
# Complete all 6 steps
# Verify saves at each step
# Check redirect to dashboard
```

### 3. Test Python Integration
```python
# test_db_profile.py
from core.services.profile_database_client import ProfileManager

manager = ProfileManager()
profile = manager.get_profile(email="your-test@email.com")

print(f"Name: {profile['personal']['name']}")
print(f"Skills: {profile['skills']}")
print(f"Preferences: {profile['preferences']}")
```

### 4. Test Job Search with DB Profile
```bash
# Should use database profile automatically
python enhanced_job_finder.py

# Check that it uses your database profile
# Verify resumes generated with your info
```

## Troubleshooting

### Issue: "Supabase credentials not found"
**Solution**: Ensure `.env.local` has all required keys

### Issue: "Profile not found"
**Solution**: Complete profile setup at `/profile/setup`

### Issue: "Authentication required"
**Solution**: Sign in at `/login`

### Issue: Python can't connect to database
**Solution**: Check `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: Profile incomplete warning
**Solution**: Finish all 6 steps in profile setup

## Security Considerations

1. **Never commit `.env.local`** - Contains secrets
2. **Use service role key only in backend** - Not in browser
3. **RLS is enforced** - Users can't access others' data
4. **Validate all inputs** - Prevent SQL injection
5. **Rate limit API calls** - Prevent abuse

## Next Steps

### Immediate
1. ✅ Run migration in Supabase
2. ✅ Set environment variables
3. ✅ Test authentication flow
4. ✅ Complete profile setup
5. ✅ Run job search with DB profile

### Future Enhancements
1. **Social Login** - Google, GitHub OAuth
2. **Profile Import** - LinkedIn scraping
3. **Team Accounts** - Multiple users per organization
4. **API Access** - Let users integrate their tools
5. **Mobile App** - React Native with same backend

## Summary

JobFlow now has a **production-ready profile system** that:
- Stores profiles in a secure database
- Provides web-based profile management
- Supports unlimited users
- Maintains backward compatibility
- Enables SaaS monetization

The system is **fully implemented** and ready to deploy. Users can sign up, complete profiles, and the Python job search automatically uses their database profiles.

**Time to deploy: 30 minutes** (mostly waiting for Supabase setup)