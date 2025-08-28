# Dashboard and Account Features Design

## Feature Overview
Private user space with two main pages accessible after authentication:
1. **Dashboard** - View and manage job opportunities
2. **Account/Preferences** - Configure profile and search preferences

## 1. Dashboard Page

### Purpose
Display all job opportunities found by the system with quick actions and status tracking.

### Components

#### Job Card
- **Title**: Job position title
- **Company**: Company name
- **Location**: Job location (or "Remote")
- **Salary**: Salary range if available
- **Description**: Brief job description (truncated to 200 chars)
- **Score**: Relevance score (0-100)
- **Posted**: Days since posting

#### Action Buttons
- **Download Resume**: Generate and download tailored resume for this position
- **Download Cover Letter**: Generate and download tailored cover letter
- **View Details**: Expand to see full job description

#### Status Checkboxes
- **Pending** (default, auto-checked when job found)
- **Applied** (user applied to this position)
- **Interview** (got interview invitation)
- **Rejected** (application rejected)
- **Accepted** (job offer received)

### Data Flow
1. Load jobs from `applications` table joined with `jobs` table
2. Display in card grid layout
3. Save status changes to database immediately on checkbox change
4. Generate documents on-demand when download buttons clicked

## 2. Account/Preferences Page

### Purpose
Complete profile configuration and search preferences in one place.

### Sections

#### Personal Information
- **Full Name** (text)
- **Email** (text, pre-filled)
- **Phone** (text)
- **Location** (text)
- **LinkedIn URL** (text)
- **GitHub URL** (text)
- **Personal Website** (text)

#### Professional Background
- **Current Title** (text)
- **Years of Experience** (number)
- **Education** (textarea)
  - University, Degree, Year
- **Work Experience** (textarea)
  - Company, Role, Duration, Description
- **Projects** (textarea)
  - Project Name, Tech Stack, Description, Link
- **Skills** (textarea)
  - Technical skills, languages, frameworks
- **Certifications** (textarea)

#### Search Preferences
- **Target Job Titles** (textarea, comma-separated)
- **Preferred Locations** (textarea, comma-separated)
- **Minimum Salary** (number)
- **Maximum Salary** (number)
- **Remote Only** (checkbox)
- **Job Types** (checkboxes):
  - Full-time
  - Part-time
  - Contract
  - Internship

#### AI Customization
- **Notes** (textarea)
  - Free-form field for specific requirements
  - Example: "Only software engineering jobs related to music"
  - AI uses this for additional filtering

#### Delivery Preferences
- **Email Frequency** (select):
  - Daily
  - Twice Daily
  - Weekly
- **Max Jobs per Email** (number, default: 20)
- **Include Resume** (checkbox, default: true)
- **Include Cover Letter** (checkbox, default: true)
- **Companies to Exclude** (textarea, comma-separated)

### Inline Editing UX
1. Each field displays current value or placeholder
2. Click on field to edit
3. "Save" button appears on change
4. Save updates database immediately
5. Success indicator shows save completed

## Database Schema Updates

### Update `applications` table
```sql
-- Already has status field, just need to ensure it includes all states
ALTER TABLE public.applications 
ALTER COLUMN status TYPE TEXT,
DROP CONSTRAINT IF EXISTS applications_status_check,
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'applied', 'interview', 'rejected', 'accepted'));
```

### Update `profiles` table
```sql
-- Add professional fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_title TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS work_experience TEXT,
ADD COLUMN IF NOT EXISTS projects TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS ai_notes TEXT;
```

## Navigation Structure
```
/dashboard (private)
├── Navigation Menu
│   ├── Dashboard (active)
│   └── Account
└── Job Cards Grid

/account (private)
├── Navigation Menu
│   ├── Dashboard
│   └── Account (active)
└── Profile Form Sections
```

## API Endpoints Needed

### Dashboard
- `GET /api/jobs/user` - Get user's job opportunities
- `PATCH /api/applications/:id` - Update application status
- `POST /api/generate/resume` - Generate resume for job
- `POST /api/generate/cover-letter` - Generate cover letter

### Account
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile field
- `GET /api/settings` - Get search settings
- `PATCH /api/settings` - Update settings field

## Success Criteria
1. User can see all their job opportunities in dashboard
2. Status changes persist to database
3. Documents generate with single click
4. Profile fields save individually
5. AI uses notes field for customization
6. Navigation between pages works smoothly