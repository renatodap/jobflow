# Dashboard & Account Setup Guide

## Overview
The JobFlow system now includes a complete private dashboard and account management system with the following features:

### Dashboard Features
- View all job opportunities with detailed cards
- Track application status (Pending → Applied → Interview → Rejected → Accepted)
- Download tailored resumes for each position
- Download tailored cover letters for each position
- Application status summary statistics

### Account Features
- Complete profile management with inline editing
- Professional background (education, experience, projects, skills)
- AI customization notes for personalized job matching
- Search preferences and delivery settings
- All fields save individually with instant feedback

## Database Setup

Run these migrations in your Supabase SQL editor:

1. **Initial Schema** - Already exists at `/database/schema.sql`
2. **Profile Fields Migration** - Run `/database/migrations/002_add_profile_fields.sql`

## Authentication Flow

### Sign In
1. Landing page → Click "Login" button
2. Enter email and password
3. After successful login:
   - Not approved → `/pending-approval` (waiting for admin)
   - No profile → `/settings` (complete profile)
   - Admin user → `/admin` (admin dashboard)
   - Regular approved user → `/dashboard` (job dashboard)

### Sign Up
1. Landing page → Click "Get Started" button
2. Fill out registration form
3. Redirected to `/pending-approval`
4. Admin must approve before access granted

## User Interface

### Dashboard Page (`/dashboard`)
- **Navigation Menu**: Dashboard (active) | Account | Logout
- **Job Cards**: Display each job opportunity with:
  - Title, Company, Location, Salary
  - Brief description (truncated to 200 chars)
  - Relevance score
  - Status checkboxes (radio buttons - only one can be selected)
  - Download buttons for resume and cover letter
- **Statistics Summary**: Shows count of applications by status

### Account Page (`/account`)
- **Navigation Menu**: Dashboard | Account (active) | Logout
- **Personal Information**: Name, Email, Phone, Location, URLs
- **Professional Background**: Title, Experience, Work History, Projects
- **Education & Skills**: Education, Technical Skills, Certifications
- **AI Customization**: Special notes field for job preferences
- **Search Preferences**: Job titles, locations, salary range
- **Delivery Preferences**: Email frequency, resume/cover letter inclusion

## Inline Editing System

All profile fields support inline editing:
1. Click on any field to edit
2. Make changes
3. "Save" button appears when content changes
4. Click Save to persist changes
5. Success feedback appears after save

## API Endpoints

### Dashboard APIs
- `GET /api/jobs/user` - Fetch user's job applications
- `PATCH /api/applications/[id]` - Update application status
- `POST /api/generate/resume` - Generate tailored resume
- `POST /api/generate/cover-letter` - Generate tailored cover letter

### Account APIs
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile fields
- `GET /api/settings` - Get search settings
- `PATCH /api/settings` - Update settings

## Status Tracking

The system automatically tracks job application status:

1. **Pending** (default) - Job found by system, not yet applied
2. **Applied** - User has submitted application
3. **Interview** - Interview scheduled or in progress
4. **Rejected** - Application was rejected
5. **Accepted** - Job offer received

Status changes are persisted immediately to the database.

## Testing the System

### Local Development
```bash
# Start the development server
npm run dev

# Open http://localhost:3000

# Test flow:
1. Click Login → Enter credentials
2. Navigate to Dashboard → View job cards
3. Change status → Verify persistence
4. Download resume/cover → Check generation
5. Go to Account → Edit fields
6. Save changes → Verify updates
```

### Test Credentials
Create a test user through the signup flow or use existing credentials if you have them.

### Required Environment Variables
Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Features Summary

✅ **Complete Authentication System**
- Login/Signup pages
- Session management
- Protected routes

✅ **Dashboard with Job Cards**
- Display all opportunities
- Status tracking
- Document generation

✅ **Account Management**
- Inline field editing
- Comprehensive profile fields
- AI customization notes
- Search preferences

✅ **Persistent Status Tracking**
- Database-backed status updates
- Real-time UI updates
- Status summary statistics

✅ **Document Generation**
- Tailored resumes per job
- Tailored cover letters per job
- Download as text files (can be enhanced to PDF)

## Next Steps

To enhance the system further:
1. Integrate with OpenAI API for actual AI-powered resume/cover letter generation
2. Add PDF generation for documents
3. Implement email notifications for status changes
4. Add job search filters on dashboard
5. Create admin approval interface