# 🚀 JobFlow Setup & Run Guide - GET IT WORKING NOW

This is the ONLY guide you need. Follow these steps exactly to get JobFlow running today.

## What JobFlow Actually Does

**JobFlow finds jobs and generates application materials automatically:**
- Searches multiple job boards simultaneously (Adzuna, Remotive, USAJobs, TheMuse, and more)
- Works even without API keys (3 free sources always available)
- Generates tailored resumes for each job type
- Creates personalized cover letters
- Provides LinkedIn outreach templates
- Saves you 90% of application time (2 min vs 30 min per job)

**What you still do manually:**
- Copy/paste materials to job sites (avoids CAPTCHAs)
- Click submit on applications
- Schedule interviews

## System Architecture

JobFlow now uses a **modular multi-source system**:
- Always returns the best 20 jobs from whatever sources are available
- Gracefully handles missing API keys
- Web-based profile setup (optional - can use local profile.json)
- Database support (optional - works with local files too)

## Prerequisites (20 minutes total)

### Required Software (Check First!)
- **Python 3.9+** 
  - Windows: `py --version` or install from python.org
  - Mac/Linux: `python3 --version`
- **Node.js 18+** (only for web dashboard)
  - Check: `node --version`
  - Install from nodejs.org if needed
- **Git**
  - Check: `git --version`

### Required Accounts & API Keys

#### Minimum Setup (FREE - Works Immediately)
**No API keys required!** JobFlow will automatically use:
- ✅ **Remotive.io** - Remote tech jobs (no key needed)
- ✅ **USAJobs.gov** - Government positions (no key needed)
- ✅ **TheMuse.com** - Career-focused listings (no key needed)

#### Recommended Setup (Better Coverage)

##### 1. **OpenAI** (AI Generation) - RECOMMENDED
- **Sign up**: https://platform.openai.com
- **Add credits**: $10-20 for starting (lasts ~500 applications)
- **Get API Key**: 
  - Go to https://platform.openai.com/api-keys
  - Click "Create new secret key"
  - Copy immediately (won't show again!)
- **Usage**: Generates resumes and cover letters

##### 2. **Adzuna** (Job Search) - RECOMMENDED
- **Sign up**: https://developer.adzuna.com
- **Free tier**: 5,000 requests/month
- **Get Keys**:
  - Register and verify email
  - Go to Dashboard
  - Copy App ID and API Key
- **Usage**: Adds ~200-500 more jobs to search results

#### Optional Setup (Full Features)

##### 3. **Supabase** (Database & Auth) - OPTIONAL
- **Only needed if**: You want web-based profile management
- **Sign up**: https://supabase.com (FREE)
- **Setup**: See Step 2 below

##### 4. **Stripe** (Payments) - OPTIONAL
- **Only if**: Building SaaS for other users
- **Sign up**: https://stripe.com

##### 5. **Resend/SendGrid** (Email) - OPTIONAL
- **Only if**: Want daily email summaries
- **Sign up**: https://resend.com or https://sendgrid.com

## Step 1: Clone & Install (5 minutes)

### Windows Installation
```bash
# Clone the repository
git clone [repository-url]
cd jobflow-clean

# Install Python dependencies (Windows)
py -m pip install supabase python-dotenv requests beautifulsoup4 aiohttp pandas numpy openai

# Optional: Install backend API dependencies
py -m pip install fastapi uvicorn python-multipart

# Install Node dependencies (only if using web dashboard)
npm install
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### Mac/Linux Installation
```bash
# Clone the repository
git clone [repository-url]
cd jobflow-clean

# Install Python dependencies (Mac/Linux)
python3 -m pip install supabase python-dotenv requests beautifulsoup4 aiohttp pandas numpy openai

# Optional: Install backend API dependencies
python3 -m pip install fastapi uvicorn python-multipart

# Install Node dependencies (only if using web dashboard)
npm install
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

## Step 2: Database Setup (OPTIONAL - Skip if using local files)

<details>
<summary>Click here only if you want web-based profile management</summary>

### 2.1 Create Supabase Project
1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Choose:
   - Organization: Your name
   - Project name: "jobflow" 
   - Database Password: **SAVE THIS!**
   - Region: Closest to you
4. Click "Create Project" and wait ~2 minutes

### 2.2 Run Database Schema
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy ENTIRE contents of `database/migrations/001_user_profiles.sql`
4. Paste into query editor
5. Click "Run" (should see "Success. No rows returned")

### 2.3 Get Connection Details
1. Go to Settings (gear icon) → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIs...` (long string)
   - **service_role secret**: Click "Reveal" then copy (KEEP SECRET!)

</details>

## Step 3: Configure Environment (2 minutes)

Create `.env.local` file in root directory:

```bash
# ============================================
# MINIMAL SETUP (Add only what you have)
# ============================================

# If you have OpenAI (RECOMMENDED for AI generation)
OPENAI_API_KEY=sk-proj-...(your OpenAI API key)

# If you have Adzuna (RECOMMENDED for more jobs)
ADZUNA_APP_ID=1234567  # Your numeric app ID
ADZUNA_API_KEY=abcdef123456789  # Your API key

# ============================================
# OPTIONAL - Add only if you set them up
# ============================================

# Supabase (only if you did Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Additional job sources (optional)
REED_API_KEY=your_reed_key  # UK jobs
FINDWORK_API_KEY=your_findwork_key  # Developer jobs

# Email delivery (optional)
RESEND_API_KEY=re_...  # or SENDGRID_API_KEY=SG...

# Stripe (only for SaaS)
STRIPE_SECRET_KEY=sk_test_...
```

**Note**: The system works even with NO API keys! It will use free sources automatically.

## Step 4: Set Up Your Profile (2 minutes)

### Quick Setup (Local File - Recommended for Start)

Edit `profile.json` with YOUR real information:

```json
{
  "personal": {
    "name": "Your Name",
    "email": "your.email@gmail.com",
    "phone": "+1234567890",
    "location": "Your City, State",
    "github": "github.com/yourusername",
    "linkedin": "linkedin.com/in/yourprofile",
    "portfolio": "yourwebsite.com"
  },
  "preferences": {
    "desired_role": "Software Engineer, Backend Developer, Full Stack",
    "experience_level": "Entry Level",
    "min_salary": 80000,
    "max_salary": 150000,
    "locations": ["San Francisco", "New York", "Remote"],
    "job_types": ["Full-time"],
    "company_sizes": ["Startup", "Mid-size", "Large"],
    "remote_preference": "Hybrid"
  },
  "education": {
    "degree": "Bachelor's in Computer Science",
    "university": "Your University",
    "graduation": "May 2024",
    "gpa": "3.8"
  },
  "experience": [
    {
      "company": "Previous Company",
      "role": "Software Engineering Intern",
      "duration": "May 2023 - Aug 2023",
      "description": "Built features using React and Python",
      "achievements": [
        "Improved API performance by 40%",
        "Led migration to TypeScript"
      ]
    }
  ],
  "skills": {
    "languages": ["Python", "JavaScript", "TypeScript", "Java"],
    "frameworks": ["React", "Next.js", "FastAPI", "Django"],
    "databases": ["PostgreSQL", "MongoDB", "Redis"],
    "tools": ["Git", "Docker", "AWS", "Kubernetes"],
    "cloud": ["AWS", "Google Cloud", "Azure"]
  },
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce site with React and Node.js",
      "technologies": ["React", "Node.js", "PostgreSQL", "Stripe"],
      "link": "github.com/you/project"
    }
  ]
}
```

### Advanced Setup (Web Interface - Optional)
<details>
<summary>Click for web-based profile setup (requires Supabase)</summary>

```bash
# Start the application
npm run dev

# Open browser to http://localhost:3000
# Sign up and complete 6-step profile wizard
```

</details>

## Step 5: Run the System (30 seconds!)

### 🎯 Quick Start - Command Line (RECOMMENDED)

```bash
# Windows
py enhanced_job_finder_v2.py

# Mac/Linux
python3 enhanced_job_finder_v2.py
```

**What happens:**
1. Searches all available sources (3-6 depending on API keys)
2. Finds 100-500+ jobs
3. Scores them based on your profile
4. Returns the top 20 best matches
5. Generates resumes/cover letters for top 3
6. Saves everything to `data/` folder

**Example output:**
```
🚀 JobFlow V2 - Multi-Source Job Aggregator
====================================================
✓ Remotive adapter initialized
✓ USAJobs adapter initialized
✓ TheMuse adapter initialized
✓ Adzuna adapter initialized (if API key provided)

🔍 Searching for: 'Software Engineer'
Total unique jobs found: 234
✅ Search Complete!
  • Total jobs found: 234
  • Sources used: 4
  • Top 20 selected

🏆 Top Jobs:
1. Senior Software Engineer at Google (Score: 95/100)
2. Backend Developer at Stripe (Score: 92/100)
3. Full Stack Engineer at Airbnb (Score: 90/100)
...
```

### Web Dashboard (Optional)

<details>
<summary>Click for web dashboard instructions</summary>

```bash
# Terminal 1: Start backend (optional)
cd backend
py api/main.py  # Windows
python3 api/main.py  # Mac/Linux

# Terminal 2: Start frontend
npm run dev

# Open http://localhost:3000
```

</details>

### Daily Automation (Optional)

<details>
<summary>Click for daily automation setup</summary>

```bash
# Run once daily for email summary
py daily_automation_v2.py  # Windows
python3 daily_automation_v2.py  # Mac/Linux

# Or schedule with cron (Linux/Mac) or Task Scheduler (Windows)
```

</details>

## Step 6: Apply to Jobs!

### Your Results Are In:

1. **📁 Open the results folder:**
   ```
   data/
   ├── tracking/
   │   └── jobs_YYYYMMDD_HHMMSS.csv  # All jobs found with scores
   ├── resumes/
   │   └── resume_CompanyName_*.txt  # Tailored resumes
   └── cover_letters/
       └── cover_CompanyName_*.txt  # Tailored cover letters
   ```

2. **📊 Review jobs in Excel/Google Sheets:**
   - Open `data/tracking/jobs_*.csv`
   - Sorted by score (100 = perfect match)
   - Includes: title, company, salary, location, match reasons, apply URL

3. **📝 Apply with generated materials:**
   - Click job URL from spreadsheet
   - Open corresponding resume from `data/resumes/`
   - Open corresponding cover letter from `data/cover_letters/`
   - Copy, paste, submit (2 minutes!)

## Troubleshooting

### "No module named 'supabase'" or similar
```bash
# Windows
py -m pip install supabase python-dotenv requests beautifulsoup4

# Mac/Linux
python3 -m pip install supabase python-dotenv requests beautifulsoup4
```

### "No jobs found"
- **This is rare** with the modular system
- Check internet connection
- Try without any parameters: `py enhanced_job_finder_v2.py`
- The system will use free sources even without API keys

### "OpenAI API error"
- The system still works! It just won't generate custom resumes
- To fix: Add valid OpenAI API key to `.env.local`
- Or use existing resumes from `data/resumes/`

### Windows: "python: command not found"
- Use `py` instead of `python`
- Or install Python from python.org

### Mac: "python: command not found"
- Use `python3` instead of `python`
- Or install with: `brew install python3`

## 📊 What Sources Are Available?

Run this to check which job sources are working:

```bash
# Windows
py -c "from core.services.modular_job_aggregator import ModularJobAggregator; a = ModularJobAggregator(); print('Available sources:', [s.display_name for s, ad in a.adapters.items() if ad.is_available])"

# Mac/Linux
python3 -c "from core.services.modular_job_aggregator import ModularJobAggregator; a = ModularJobAggregator(); print('Available sources:', [s.display_name for s, ad in a.adapters.items() if ad.is_available])"
```

## Quick Commands Reference

```bash
# === MAIN COMMANDS ===

# Find jobs NOW (works even without API keys!)
py enhanced_job_finder_v2.py  # Windows
python3 enhanced_job_finder_v2.py  # Mac/Linux

# === OPTIONAL COMMANDS ===

# Check which sources are available
py -c "from core.services.modular_job_aggregator import ModularJobAggregator; a = ModularJobAggregator()"

# Test system
py test_system.py

# Start web dashboard
npm run dev

# Daily automation
py daily_automation_v2.py
```

## Coverage by Configuration

| Your Setup | Sources | Jobs Found | Coverage |
|------------|---------|------------|----------|
| **No API keys** | Remotive, USAJobs, TheMuse | ~100-200 | 20% |
| **Just Adzuna** | Adzuna only | ~200-500 | 30% |
| **Adzuna + OpenAI** | Adzuna + free sources | ~300-700 | 50% |
| **All configured** | 6+ sources | ~500-1000+ | 70% |

**Bottom line**: Even with ZERO configuration, you get 3 job sources automatically!

## Daily Workflow

### Morning Routine (5 minutes)
```bash
# Run the search
py enhanced_job_finder_v2.py

# Open the CSV in Excel
# Review top 20 jobs
# Apply to best matches with generated materials
```

### Application Process (2 minutes per job)
1. Open job URL from CSV
2. Copy tailored resume from `data/resumes/`
3. Copy cover letter from `data/cover_letters/`
4. Paste into application
5. Submit!

## Cost Breakdown

### Free Forever
- **Job Search**: All free sources (Remotive, USAJobs, TheMuse)
- **Adzuna**: 5,000 searches/month free
- **No limits**: Run as many times as you want

### Optional Costs
- **OpenAI**: ~$0.02 per application (~$10 for 500 applications)
- **Total**: $0-10/month depending on usage

---

## 🎯 Quick Start Checklist

**Absolute Minimum (Works in 2 minutes):**
- [ ] Clone repository
- [ ] Install Python packages: `py -m pip install requests beautifulsoup4`
- [ ] Edit `profile.json` with your info
- [ ] Run: `py enhanced_job_finder_v2.py`

**Recommended Setup (10 minutes):**
- [ ] All of the above, plus:
- [ ] Get OpenAI API key (for AI resumes)
- [ ] Get Adzuna API keys (for more jobs)
- [ ] Add keys to `.env.local`
- [ ] Run: `py enhanced_job_finder_v2.py`

**Full Setup (30 minutes):**
- [ ] All of the above, plus:
- [ ] Set up Supabase database
- [ ] Install Node.js dependencies
- [ ] Run web dashboard: `npm run dev`

---

## 🚀 Bottom Line

**You can start using JobFlow RIGHT NOW with zero configuration!**

1. The system works immediately with 3 free job sources
2. Adding API keys just makes it better (more jobs, AI generation)
3. Stop reading, start job hunting!

**Run this now:**
```bash
py enhanced_job_finder_v2.py  # Windows
python3 enhanced_job_finder_v2.py  # Mac/Linux
```

---

*The system will automatically use whatever sources are available. No configuration required!*