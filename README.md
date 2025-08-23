# JobFlow - Personal Job Search Automation System

## Quick Start (Personal Edition)

### 1. Setup Your Profile
Edit `profile.json` with your real information:
```bash
notepad profile.json  # Windows
# or
nano profile.json     # Mac/Linux
```

### 2. Run Daily Job Search
```bash
# Run immediately
python daily_automation.py --now

# Or use the batch file (Windows)
run_daily_search.bat
```

### 3. Schedule Automatic Daily Runs
```bash
# Schedule to run daily at 9 AM
python daily_automation.py --schedule 9

# Or use the batch file (Windows)
schedule_daily.bat
```

## What It Does
- **Searches** multiple job sites for opportunities
- **Scores** jobs based on your preferences
- **Generates** custom resumes for each job
- **Writes** personalized cover letters
- **Creates** cold outreach packages (LinkedIn, email)
- **Tracks** all applications and follow-ups
- **Reports** daily summary with top opportunities

## Daily Automation Features
- Finds up to 20 best-matched jobs daily
- Generates all application materials
- Creates LinkedIn messages and email templates
- Provides 3-step follow-up sequences
- Sends daily email summary (optional)

## Your Daily Workflow
1. **Morning**: Check `data/daily_reports/latest_report.txt`
2. **Review**: Top opportunities and scores
3. **Apply**: Use generated materials in `data/resumes/` and `data/cover_letters/`
4. **Outreach**: Send messages from `data/cold_outreach/`
5. **Track**: Update `data/tracking/applications.csv`

## Key Files
- `profile.json` - Your personal profile (EDIT THIS FIRST!)
- `daily_automation.py` - Main automation script
- `data/daily_reports/` - Daily job reports
- `data/resumes/` - Generated resumes
- `data/cover_letters/` - Cover letters
- `data/cold_outreach/` - LinkedIn/email templates
- `data/tracking/` - Application tracking

## Test Your Setup
```bash
# Quick test with sample jobs
python test_jobflow.py

# Test daily automation
python test_daily_automation.py

# Full personal job search
python jobflow_personal.py
```

## API Keys (Already Configured)
The system includes working API keys for:
- Adzuna (job search)
- OpenAI (resume generation) - Add your key if needed
- Claude (cover letters) - Add your key if needed

## Next Steps
1. **Today**: Edit profile.json and run first search
2. **Tomorrow**: Review results, apply to top 5
3. **This Week**: Set up daily automation
4. **Next Week**: Track response rates, optimize profile

See [USAGE_GUIDE.md](USAGE_GUIDE.md) for detailed instructions.
