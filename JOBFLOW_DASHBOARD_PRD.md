# JobFlow Dashboard - Product Requirements Document

## Executive Summary
JobFlow Dashboard is a Next.js web application that streamlines the job application process by providing a centralized hub for discovered jobs, AI-generated application materials, and strategic outreach tracking. It reduces application time from 30 minutes to 2 minutes per job while maintaining personalization and quality.

## Problem Statement
Current job application process problems:
- Finding jobs across multiple platforms takes hours
- Tailoring resumes/cover letters is repetitive and time-consuming  
- Tracking applications across platforms is chaotic
- Cold outreach opportunities are missed
- No systematic follow-up process
- Browser automation for auto-apply is unreliable due to CAPTCHAs, account requirements, and ToS violations

## Solution Overview
A semi-automated dashboard that:
1. **Discovers** jobs automatically (fully automated)
2. **Prepares** tailored materials instantly (AI-powered)
3. **Organizes** everything for rapid manual application (2 min/job)
4. **Facilitates** strategic outreach (LinkedIn, email templates)
5. **Tracks** all activity and follow-ups (automated reminders)

## Target User
**Primary**: Renato Dap (personal use for 2026 graduation job search)
**Secondary**: Future expansion to other new grads after proven success

## Core Features

### 1. Daily Job Discovery Feed
**User Story**: As Renato, I want to see the best new jobs each day without searching myself.

**Requirements**:
- Auto-fetch from Adzuna, Indeed, RemoteOK, AngelList every 6 hours
- Score jobs 0-100 based on profile match
- Deduplicate across all sources
- Show only jobs posted in last 7 days
- Highlight "Apply Today" jobs (score >90)

**UI Components**:
- Job cards with company, title, salary, location, days old
- Color-coded by urgency (red = apply today, yellow = this week, green = consider)
- One-click expand for full description
- Bulk actions (select multiple to generate materials)

### 2. Application Kit Generator
**User Story**: As Renato, I want all materials ready so I can apply in 2 minutes.

**Requirements**:
- Generate tailored resume for each job (11 variants)
- Generate cover letter with real achievements
- Create 3 LinkedIn messages (recruiter, hiring manager, engineer)
- Generate cold email templates
- Provide company research summary
- Create interview talking points

**UI Components**:
- "Generate Kit" button on each job card
- Progress indicator during generation
- Tabbed view for all materials
- Copy-to-clipboard for each section
- Download all as ZIP

### 3. Quick Apply Checklist
**User Story**: As Renato, I want step-by-step guidance for each application.

**Requirements**:
- Direct link to job posting
- Direct link to company careers page
- Pre-filled form fields (for copy-paste)
- Required documents checklist
- Platform-specific tips (Greenhouse vs Lever vs Workday)
- Time estimate for application

**UI Components**:
- Collapsible checklist per job
- Checkbox for each step
- Auto-save progress
- "Mark as Applied" button
- Notes field for passwords/usernames created

### 4. Strategic Outreach Center
**User Story**: As Renato, I want to maximize response rates through strategic outreach.

**Requirements**:
- Find LinkedIn profiles of employees at target company
- Generate personalized connection requests
- Create follow-up sequences (3, 7, 14 days)
- Track message status (sent, accepted, replied)
- Email finder for direct outreach
- Calendar integration for follow-up reminders

**UI Components**:
- People finder (searches LinkedIn via company)
- Message templates with merge fields
- Outreach tracker table
- Follow-up queue/calendar
- Response rate analytics

### 5. Application Tracker
**User Story**: As Renato, I want to track all applications and their status.

**Requirements**:
- Auto-track when "Mark as Applied" clicked
- Status pipeline (Applied → Response → Interview → Offer)
- Add notes and next steps
- Set reminders for follow-ups
- Export to CSV for records
- Analytics dashboard (response rate, time to response)

**UI Components**:
- Kanban board view
- Table view with filters
- Status update modal
- Reminder notifications
- Analytics charts

### 6. Profile Management
**User Story**: As Renato, I want my information always current for accurate generation.

**Requirements**:
- Edit personal information
- Update skills and achievements
- Add new projects
- Set job preferences
- Configure outreach style
- Manage resume versions

**UI Components**:
- Profile form with sections
- Achievement/project cards
- Skill tags with proficiency
- Preview generated content
- Import/export profile JSON

## Technical Architecture

### Frontend (Next.js 14 App Router)
```
jobflow-dashboard/
├── app/
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Dashboard home (today's jobs)
│   ├── jobs/
│   │   ├── page.tsx              # All jobs list
│   │   └── [id]/
│   │       ├── page.tsx          # Job detail with kit
│   │       └── apply/page.tsx    # Application checklist
│   ├── outreach/
│   │   ├── page.tsx              # Outreach center
│   │   └── templates/page.tsx    # Message templates
│   ├── applications/
│   │   ├── page.tsx              # Application tracker
│   │   └── analytics/page.tsx    # Analytics dashboard
│   ├── profile/
│   │   └── page.tsx              # Profile management
│   └── api/
│       ├── jobs/
│       │   ├── search/route.ts   # Trigger job search
│       │   └── [id]/
│       │       ├── route.ts      # Get job details
│       │       └── kit/route.ts  # Generate application kit
│       ├── outreach/
│       │   ├── linkedin/route.ts # LinkedIn search
│       │   └── email/route.ts    # Email templates
│       └── applications/route.ts  # Track applications
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   └── JobFilters.tsx
│   ├── application/
│   │   ├── ApplicationKit.tsx
│   │   ├── QuickApplyChecklist.tsx
│   │   └── MaterialsViewer.tsx
│   ├── outreach/
│   │   ├── PeopleFinder.tsx
│   │   ├── MessageComposer.tsx
│   │   └── OutreachTracker.tsx
│   └── tracker/
│       ├── ApplicationBoard.tsx
│       └── StatusPipeline.tsx
├── lib/
│   ├── jobflow/                  # Core JobFlow logic
│   │   ├── search.ts            # Job search orchestrator
│   │   ├── scorer.ts            # Job scoring algorithm
│   │   ├── generator.ts         # AI content generation
│   │   └── deduplicator.ts     # Remove duplicate jobs
│   ├── ai/
│   │   ├── resume.ts            # Resume generation
│   │   ├── cover-letter.ts     # Cover letter generation
│   │   └── outreach.ts         # Outreach message generation
│   └── db/
│       ├── schema.ts            # Database schema
│       └── queries.ts           # Database queries
└── data/
    ├── profile.json             # User profile (Renato's data)
    └── resume-templates/        # Base resume versions
```

### Backend Services (Python FastAPI)
Keep existing Python job search/AI generation as microservices:
- `enhanced_job_finder.py` → API endpoint
- `cold_outreach_generator.py` → API endpoint  
- `ai_content_generator.py` → API endpoint

### Database Schema (PostgreSQL/Supabase)
```sql
-- Jobs discovered
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    job_hash VARCHAR UNIQUE,
    title VARCHAR,
    company VARCHAR,
    location VARCHAR,
    salary_min INTEGER,
    salary_max INTEGER,
    score INTEGER,
    url VARCHAR,
    description TEXT,
    discovered_at TIMESTAMP,
    days_old INTEGER
);

-- Applications tracking
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    applied_at TIMESTAMP,
    status VARCHAR, -- applied, response, interview, offer, rejected
    resume_version VARCHAR,
    cover_letter_sent BOOLEAN,
    notes TEXT,
    next_action VARCHAR,
    next_action_date DATE
);

-- Outreach tracking
CREATE TABLE outreach (
    id UUID PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    contact_name VARCHAR,
    contact_title VARCHAR,
    platform VARCHAR, -- linkedin, email, twitter
    message_sent TEXT,
    sent_at TIMESTAMP,
    response_received BOOLEAN,
    response_text TEXT,
    follow_up_count INTEGER
);

-- Generated materials cache
CREATE TABLE materials (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    material_type VARCHAR, -- resume, cover_letter, linkedin_msg
    content TEXT,
    generated_at TIMESTAMP
);
```

## UI/UX Design Principles

### Visual Design
- **Clean and minimal**: Focus on content, not decoration
- **High contrast**: Easy to scan quickly
- **Mobile responsive**: Apply from phone if needed
- **Dark mode**: Late night job hunting sessions
- **Keyboard shortcuts**: Power user efficiency

### Information Architecture
1. **Dashboard** (default): Today's top jobs + quick stats
2. **Jobs**: Full list with filters and search
3. **Outreach**: People finder and message center
4. **Applications**: Tracker and analytics
5. **Profile**: Settings and preferences

### Key Interactions
- **Drag and drop**: Reorder jobs by priority
- **Bulk actions**: Select multiple jobs for kit generation
- **Quick actions**: Keyboard shortcuts for common tasks
- **Auto-save**: Never lose progress
- **Real-time sync**: Updates across tabs/devices

## Development Phases

### Phase 1: MVP (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Basic job list from existing CSV data
- [ ] Simple application kit generation
- [ ] Manual application checklist
- [ ] Local storage for tracking

### Phase 2: Core Features (Week 2)
- [ ] Connect Python job search via API
- [ ] AI resume/cover letter generation
- [ ] Outreach message templates
- [ ] Application tracker with status
- [ ] Profile management UI

### Phase 3: Enhancement (Week 3)
- [ ] LinkedIn people finder
- [ ] Follow-up automation
- [ ] Analytics dashboard
- [ ] Email integration
- [ ] Polish UI/UX

### Phase 4: Production (Week 4)
- [ ] Deploy to Vercel
- [ ] Set up PostgreSQL/Supabase
- [ ] Add authentication (just for Renato)
- [ ] Daily job search automation
- [ ] Error handling and logging

## Success Metrics

### Primary KPIs
- **Application time**: <2 minutes per job (from 30 min baseline)
- **Daily applications**: 10-20 jobs (from 0-2 baseline)
- **Response rate**: >20% (from <5% baseline)
- **Interview rate**: >10% (from <2% baseline)

### Secondary Metrics
- Jobs discovered per day
- Materials generated per job
- Outreach messages sent
- Follow-up completion rate
- Time to first response

## Technical Requirements

### Performance
- Page load: <2 seconds
- API response: <500ms
- Material generation: <10 seconds
- Search refresh: <30 seconds

### Browser Support
- Chrome (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Integrations
- OpenAI API (content generation)
- Adzuna API (job search)
- Supabase (database + auth)
- Vercel (deployment)
- SendGrid (email)

## Security & Privacy
- All Renato's data stored locally initially
- No external sharing without explicit action
- API keys in environment variables
- HTTPS only in production
- Rate limiting on API endpoints

## Future Enhancements (Post-Success)
1. Multi-user support with waitlist
2. Chrome extension for one-click import
3. Mobile app for on-the-go applications
4. AI interview preparation
5. Salary negotiation assistant
6. Referral network features

## Implementation Notes

### Development Environment
```bash
# Setup
npx create-next-app@latest jobflow-dashboard --typescript --tailwind --app
cd jobflow-dashboard
npm install @supabase/supabase-js openai axios lucide-react
npm install @radix-ui/react-* # UI components
npm install recharts # Analytics charts

# Development
npm run dev  # http://localhost:3000

# Python backend (keep existing)
python enhanced_job_finder.py  # Run job search
python -m uvicorn api:app --reload  # API server
```

### Deployment
```bash
# Frontend (Vercel)
vercel deploy

# Backend (Railway/Render)
# Deploy Python API separately

# Database (Supabase)
# Set up project at supabase.com
```

## Conclusion
This PRD defines a practical, achievable solution that solves the real problem: making job applications fast and systematic while maintaining quality and personalization. By focusing on semi-automation rather than unreliable full automation, we can deliver immediate value and actually help Renato land his dream job.

**Next Step**: Start building Phase 1 MVP with Next.js setup and basic job list display.