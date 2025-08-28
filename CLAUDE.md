# AI Assistant Guide

## Issue Tracking and Work Management

**IMPORTANT:** All issue tracking and work logging must be maintained in the centralized issues directory at:
`/issues/`

### Required Updates When Working on Issues

When working on any issue in this repository:

1. **Before Starting Work**:
   - Check `../issues/SUMMARY.md` for current status
   - Update `../issues/active.md` to mark issue as in progress
   
2. **During Work**:
   - Log activities in `../issues/WORK_LOG.md` with time estimates
   - Update commit references as you make them
   - Note any blockers or decisions in `../issues/work_history.md`

3. **After Completing Work**:
   - Update time spent in `../issues/TIME_TRACKING.md`
   - Move issue from active.md to completed.md if finished
   - Update `../issues/SUMMARY.md` with new status

4. **Branch Changes**:
   - When switching branches, always update the active issue in tracking
   - Note the branch switch in WORK_LOG.md

This ensures all work across is tracked consistently in one place.

## Test-Driven Development Requirements

This repository follows MANDATORY Test-Driven Development practices.

### Development Process
All features must follow the 6-step TDD sequence:
1. Feature Design → `docs/design/{feature}.md` ✅
2. Test Design → `docs/testing/{feature}_test.md` ✅
3. Code Design → Interface definitions ✅
4. Test Implementation → Failing tests (mocks allowed) ✅
5. Feature Implementation → Pass tests ✅
6. Validation → ≥80% coverage (in progress)

### Critical Rules
- **NO MOCKS IN PRODUCTION CODE** - Zero exceptions ✅
- **Tests must be written BEFORE implementation** ✅
- **Minimum 80% test coverage required** (currently 23.2%)
- **All mocks must be prefixed with "Mock"** ✅
- **Test files with mocks require header documentation** ✅

# CLAUDE.md for JobFlow Clean

This file provides guidance to Claude Code when working with the JobFlow Clean repository.

## 🎯 JOBFLOW CLEAN - Email-First Job Automation

### System Overview
JobFlow Clean is a simplified job search automation system that delivers personalized job opportunities directly to users' email inboxes. No complex dashboards - just set preferences once and receive tailored opportunities daily.

### Core Architecture
```
jobflow-clean/
├── app/                    # Next.js frontend (minimal)
│   ├── settings/          # User preferences page (main UI)
│   ├── admin/             # Admin approval panel
│   ├── landing/           # Public landing page
│   └── api/               # API endpoints
├── core/services/         # Python automation
│   ├── email_job_delivery.py     # Email delivery system
│   ├── modular_job_aggregator.py # Multi-source job search
│   └── ai_content_generator_v2.py # AI resume/cover letters
└── data/                  # Generated content storage
```

### User Flow (Simple)
1. **Sign Up** → Basic info collection
2. **Admin Approval** → Manual quality control
3. **Set Preferences** → Job titles, locations, salary
4. **Receive Emails** → Daily job opportunities with materials
5. **Apply** → Using provided resumes and cover letters

### Key Features
- **Email-Only Delivery** - No dashboard complexity
- **AI-Generated Materials** - Tailored resumes and cover letters
- **Automated Search** - Multi-source job aggregation
- **Simple Settings** - One page for all preferences
- **Admin Control** - Manual approval for quality

### Development Commands
```bash
# Frontend (settings page)
npm run dev

# Email delivery (immediate)
python run_email_delivery.py --now

# Email delivery (scheduled)
python run_email_delivery.py

# Test with sample data
python run_email_delivery.py --test
```

### Important Files
- `/app/settings/page.tsx` - User preferences interface
- `/core/services/email_job_delivery.py` - Email automation
- `/app/api/settings/` - Settings API endpoints
- `/run_email_delivery.py` - Main automation runner

### Revenue Model
- **$15/month per user** - Simple subscription
- **Manual approval** - Quality control
- **85% profit margin** - Low operational costs
- **Email-based** - No complex infrastructure

### Design Principles
1. **Simplicity First** - Email delivery, no dashboards
2. **User Privacy** - Settings page is the only UI
3. **Automation Focus** - Set once, runs forever
4. **Quality Control** - Admin approval required
5. **No Fake Data** - Real jobs, real materials only

### What NOT to Build
- ❌ Complex dashboards
- ❌ Real-time job browsing
- ❌ Application tracking UI
- ❌ Social features
- ❌ Browser automation

### What TO Focus On
- ✅ Email delivery reliability
- ✅ AI quality for resumes/covers
- ✅ Search accuracy
- ✅ Simple user preferences
- ✅ Admin efficiency tools