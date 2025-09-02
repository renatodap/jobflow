# JobFlow Usage Guide

## Quick Start (3 Steps)

### 1. Set Up Your Profile
Edit `profile/profile.json` with your information:
```json
{
  "personal": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "phone": "555-0100",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/yourprofile",
    "github": "github.com/yourusername"
  }
}
```

### 2. Test The System
```bash
python test_system.py
```
This will verify all APIs are working (Adzuna, OpenAI, Claude).

### 3. Run Job Search
```bash
python run_job_search.py
```
This will find jobs and generate application materials.

---

## Folder Structure

```
jobflow/
├── data/                    # All your job search data
│   ├── jobs/               # Individual job folders
│   ├── applications/       # Application packages  
│   └── tracking/           # CSV files for tracking
│       ├── jobs.csv        # All discovered jobs
│       └── applications.csv # Application status
│
├── core/                    # System code (don't modify)
│   ├── services/           # API integrations
│   └── utils/              # Helper functions
│
├── profile/                 # Your information
│   ├── profile.json        # Your details (EDIT THIS!)
│   └── resumes/            # Your base resumes
│
├── run_job_search.py       # Main script to find jobs
├── run_complete_system.py  # Full system with guides
└── test_system.py          # Test all components
```

---

## How To Use

### Finding Jobs

1. **Run the search:**
   ```bash
   python run_job_search.py
   ```

2. **Check results:**
   Open `data/tracking/jobs.csv` in Excel

3. **Review materials:**
   Check `data/applications/[Company_JobID]/` folders

### For Each Job Application

1. **Find the job folder:**
   `data/applications/CompanyName_JobID/`

2. **You'll find:**
   - `resume.html` - Open in browser, print to PDF
   - `resume_ats.txt` - Upload to application forms
   - `cover_letter.txt` - If required
   - `application_guide.md` - Step-by-step instructions

3. **Follow the guide:**
   Open `application_guide.md` for exact steps

4. **Track your application:**
   Update `data/tracking/applications.csv`

---

## What The System Does

1. **Finds Real Jobs**
   - Uses Adzuna API (1000 free searches/month)
   - Searches for your target roles
   - Scores jobs 0-100 based on fit

2. **Generates Resumes**
   - OpenAI creates ATS-optimized resumes
   - Tailored to each specific job
   - HTML and plain text versions

3. **Writes Cover Letters**
   - Claude writes personalized letters
   - Only when required by job
   - Natural, engaging tone

4. **Creates Application Guides**
   - Direct link to job posting
   - All form fields pre-filled
   - Step-by-step instructions
   - Follow-up templates

5. **Tracks Everything**
   - CSV files for all jobs and applications
   - Status tracking
   - Response rates

---

## Configuration

### API Keys (.env file)
```
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
```

### Search Settings
Edit `run_job_search.py` to change:
- Search queries
- Location preferences  
- Minimum salary
- Experience level

---

## Tracking Your Applications

### Jobs CSV Columns
- `job_id` - Unique identifier
- `company` - Company name
- `title` - Job title
- `score` - Match score (0-100)
- `status` - new/reviewing/applied/rejected
- `url` - Direct application link

### Applications CSV Columns
- `app_id` - Application ID
- `date_applied` - When you applied
- `status` - pending/interviewed/offered/rejected
- `response_date` - When they responded
- `outcome` - Final result

---

## Tips For Success

1. **Customize your profile.json**
   - Add all your skills
   - Include relevant projects
   - Update experience regularly

2. **Review generated materials**
   - AI is good but not perfect
   - Check for accuracy
   - Ensure formatting is clean

3. **Follow up**
   - Use the templates in guides
   - Track responses in CSV
   - Update status regularly

4. **Apply quickly**
   - New jobs score higher
   - Apply within 7 days
   - Earlier applications get more views

---

## Commands Reference

```bash
# Test everything works
python test_system.py

# Find and process jobs  
python run_job_search.py

# Run complete system with all features
python run_complete_system.py

# Check your tracking
# Open in Excel: data/tracking/jobs.csv
# Open in Excel: data/tracking/applications.csv
```

---

## Troubleshooting

### "No module named X"
```bash
pip install httpx python-dotenv openai anthropic beautifulsoup4
```

### "API key not found"
Create `.env` file with your keys (see Configuration above)

### "No jobs found"
- Try broader search terms
- Remove location filter
- Lower minimum salary

### "API rate limit"
- Adzuna: 1000 calls/month
- OpenAI: Check your plan
- Claude: Check your plan

---

## Support

1. Check if APIs are working: `python test_system.py`
2. Review this guide
3. Check your API keys in `.env`
4. Ensure internet connection is stable

---

*JobFlow - Automated Job Application System*
*Find jobs, generate materials, track applications*
