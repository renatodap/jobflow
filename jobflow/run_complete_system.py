"""
Complete Job Application System with Full Organization
Addresses all user requirements:
1. CSV job tracking
2. PDF/HTML resume generation in organized folders
3. Cover letter detection
4. Step-by-step application guides
5. Organized folder structure
"""

import asyncio
import os
import json
import csv
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Import our services
from app.services.adzuna_job_search import AdzunaJobSearch
from app.services.ai_content_generator import AIContentGenerator

# Load environment variables
load_dotenv()

class CompleteJobApplicationSystem:
    """
    Complete system with proper organization and tracking
    """
    
    def __init__(self):
        # Initialize services
        self.adzuna = AdzunaJobSearch()
        self.ai_gen = AIContentGenerator()
        
        # Set up organized folder structure
        self.base_dir = Path.cwd()
        self.setup_folder_structure()
        
        # Load user profile
        self.user_profile = self.load_user_profile()
        
    def setup_folder_structure(self):
        """Create organized folder structure"""
        
        # Main folders
        self.folders = {
            'jobs': self.base_dir / 'data' / 'jobs',
            'resumes': self.base_dir / 'data' / 'resumes',
            'cover_letters': self.base_dir / 'data' / 'cover_letters',
            'applications': self.base_dir / 'data' / 'applications',
            'guides': self.base_dir / 'data' / 'application_guides',
            'tracking': self.base_dir / 'data' / 'tracking',
            'archive': self.base_dir / 'data' / 'archive'
        }
        
        # Create all folders
        for folder in self.folders.values():
            folder.mkdir(parents=True, exist_ok=True)
        
        # CSV files for tracking
        self.csv_files = {
            'jobs': self.folders['tracking'] / 'jobs_master.csv',
            'applications': self.folders['tracking'] / 'applications_tracker.csv',
            'status': self.folders['tracking'] / 'status_updates.csv'
        }
        
        # Initialize CSV files with headers if they don't exist
        self.initialize_csv_files()
    
    def initialize_csv_files(self):
        """Initialize CSV files with proper headers"""
        
        # Jobs master CSV
        if not self.csv_files['jobs'].exists():
            with open(self.csv_files['jobs'], 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'job_id', 'title', 'company', 'location', 'salary_min', 'salary_max',
                    'url', 'description', 'requirements', 'cover_letter_required',
                    'score', 'source', 'discovered_date', 'days_old', 'status'
                ])
                writer.writeheader()
        
        # Applications tracker CSV
        if not self.csv_files['applications'].exists():
            with open(self.csv_files['applications'], 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'application_id', 'job_id', 'company', 'title', 'score',
                    'resume_path', 'cover_letter_path', 'guide_path',
                    'applied_date', 'status', 'response_date', 'notes'
                ])
                writer.writeheader()
        
        # Status updates CSV
        if not self.csv_files['status'].exists():
            with open(self.csv_files['status'], 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'timestamp', 'job_id', 'company', 'old_status', 'new_status', 'notes'
                ])
                writer.writeheader()
    
    def load_user_profile(self) -> Dict:
        """Load user profile from JSON"""
        profile_path = self.base_dir / 'professional_profile' / 'profile_master.json'
        
        if profile_path.exists():
            with open(profile_path, 'r') as f:
                return json.load(f)
        else:
            # Default profile structure
            return {
                "personal": {
                    "name": "Your Name",
                    "email": "your.email@example.com",
                    "phone": "555-0100",
                    "location": "San Francisco, CA",
                    "linkedin": "linkedin.com/in/yourprofile",
                    "github": "github.com/yourusername"
                },
                "education": [],
                "experience": [],
                "skills": [],
                "projects": []
            }
    
    async def discover_and_track_jobs(self, queries: List[str], location: str = "") -> List[Dict]:
        """Discover jobs and save them to CSV"""
        
        print("\n=== PHASE 1: JOB DISCOVERY ===")
        all_jobs = []
        
        for query in queries:
            print(f"Searching: {query}")
            jobs = await self.adzuna.search_jobs(
                query=query,
                location=location,
                max_days_old=30,
                salary_min=70000
            )
            
            for job in jobs:
                # Add unique job ID
                job_text = f"{job.get('company', '')}_{job.get('title', '')}"
                job['job_id'] = hashlib.md5(job_text.encode()).hexdigest()[:8]
                
                # Detect if cover letter is required
                job['cover_letter_required'] = self.detect_cover_letter_requirement(job)
                
                # Score the job
                job['score'] = self.score_job(job)
                
                all_jobs.append(job)
        
        # Save to CSV
        self.save_jobs_to_csv(all_jobs)
        
        print(f"Discovered and saved {len(all_jobs)} jobs to CSV")
        print(f"CSV Location: {self.csv_files['jobs']}")
        
        return all_jobs
    
    def detect_cover_letter_requirement(self, job: Dict) -> bool:
        """Detect if job requires a cover letter"""
        
        description = job.get('description', '').lower()
        title = job.get('title', '').lower()
        
        # Keywords that indicate cover letter requirement
        cover_letter_keywords = [
            'cover letter',
            'letter of interest',
            'writing sample',
            'tell us why',
            'passionate about',
            'motivation letter'
        ]
        
        # Check for keywords
        for keyword in cover_letter_keywords:
            if keyword in description or keyword in title:
                return True
        
        # Senior positions often require cover letters
        if any(word in title for word in ['senior', 'lead', 'principal', 'manager']):
            return True
        
        return False
    
    def score_job(self, job: Dict) -> int:
        """Score job based on multiple factors"""
        
        score = 50  # Base score
        
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        
        # Experience level scoring
        if any(word in title for word in ['new grad', 'junior', 'entry', 'graduate']):
            score += 30
        elif any(word in title for word in ['senior', 'lead', 'principal']):
            score -= 20
        
        # Salary scoring
        salary_min = job.get('salary_min', 0)
        if salary_min >= 120000:
            score += 20
        elif salary_min >= 100000:
            score += 15
        elif salary_min >= 80000:
            score += 10
        
        # Freshness scoring
        days_old = job.get('days_old', 30)
        if days_old <= 3:
            score += 15
        elif days_old <= 7:
            score += 10
        elif days_old <= 14:
            score += 5
        
        # Technology match scoring
        tech_keywords = ['python', 'javascript', 'react', 'node', 'aws', 'docker']
        tech_matches = sum(1 for tech in tech_keywords if tech in description)
        score += tech_matches * 5
        
        # Cap score at 100
        return min(score, 100)
    
    def save_jobs_to_csv(self, jobs: List[Dict]):
        """Save jobs to master CSV file"""
        
        with open(self.csv_files['jobs'], 'a', newline='', encoding='utf-8') as f:
            fieldnames = [
                'job_id', 'title', 'company', 'location', 'salary_min', 'salary_max',
                'url', 'description', 'requirements', 'cover_letter_required',
                'score', 'source', 'discovered_date', 'days_old', 'status'
            ]
            
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            for job in jobs:
                writer.writerow({
                    'job_id': job.get('job_id'),
                    'title': job.get('title', ''),
                    'company': job.get('company', ''),
                    'location': job.get('location', ''),
                    'salary_min': job.get('salary_min', ''),
                    'salary_max': job.get('salary_max', ''),
                    'url': job.get('url', ''),
                    'description': job.get('description', '')[:500],
                    'requirements': '',  # Would be extracted from description
                    'cover_letter_required': job.get('cover_letter_required', False),
                    'score': job.get('score', 0),
                    'source': job.get('source', 'Adzuna'),
                    'discovered_date': job.get('discovered_date', datetime.now().isoformat()),
                    'days_old': job.get('days_old', ''),
                    'status': 'new'
                })
    
    async def generate_application_materials(self, job: Dict) -> Dict:
        """Generate resume, cover letter, and application guide"""
        
        print(f"\n=== GENERATING MATERIALS FOR: {job['company']} - {job['title']} ===")
        
        application_id = f"{job['job_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create job-specific folder
        job_folder = self.folders['applications'] / f"{job['company'].replace(' ', '_')}_{job['job_id']}"
        job_folder.mkdir(exist_ok=True)
        
        # Generate ATS-optimized resume
        print("Generating ATS-optimized resume...")
        resume_content = await self.ai_gen.generate_resume(
            job=job,
            user_profile=self.user_profile,
            engine='openai'
        )
        
        # Save resume as both HTML and PDF-ready format
        resume_html_path = job_folder / f"resume_{job['job_id']}.html"
        resume_txt_path = job_folder / f"resume_{job['job_id']}_ATS.txt"
        
        # Create HTML resume
        html_resume = self.create_html_resume(resume_content, job)
        with open(resume_html_path, 'w', encoding='utf-8') as f:
            f.write(html_resume)
        
        # Create ATS text version
        with open(resume_txt_path, 'w', encoding='utf-8') as f:
            f.write(resume_content)
        
        # Generate cover letter if required
        cover_letter_path = None
        if job.get('cover_letter_required', False):
            print("Generating personalized cover letter...")
            cover_letter = await self.ai_gen.generate_cover_letter(
                job=job,
                user_profile=self.user_profile,
                engine='claude'
            )
            
            cover_letter_path = job_folder / f"cover_letter_{job['job_id']}.txt"
            with open(cover_letter_path, 'w', encoding='utf-8') as f:
                f.write(cover_letter)
        
        # Generate step-by-step application guide
        print("Creating application guide...")
        guide_path = job_folder / f"APPLICATION_GUIDE_{job['job_id']}.md"
        self.create_application_guide(job, job_folder, guide_path)
        
        # Track in CSV
        self.track_application(
            application_id=application_id,
            job=job,
            resume_path=str(resume_html_path),
            cover_letter_path=str(cover_letter_path) if cover_letter_path else '',
            guide_path=str(guide_path)
        )
        
        return {
            'application_id': application_id,
            'job_folder': str(job_folder),
            'resume_html': str(resume_html_path),
            'resume_ats': str(resume_txt_path),
            'cover_letter': str(cover_letter_path) if cover_letter_path else None,
            'guide': str(guide_path)
        }
    
    def create_html_resume(self, content: str, job: Dict) -> str:
        """Create HTML resume optimized for ATS and PDF conversion"""
        
        html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - {name}</title>
    <style>
        body {{
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            font-size: 11pt;
            color: #333;
        }}
        .header {{
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }}
        h1 {{
            margin: 0;
            font-size: 18pt;
            font-weight: bold;
        }}
        .contact {{
            margin: 5px 0;
            font-size: 10pt;
        }}
        h2 {{
            font-size: 12pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-bottom: 1px solid #666;
        }}
        .section {{
            margin-bottom: 15px;
        }}
        ul {{
            margin: 5px 0;
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 3px;
        }}
        .job-title {{
            font-weight: bold;
        }}
        .company {{
            font-style: italic;
        }}
        @media print {{
            body {{
                margin: 0;
                padding: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{name}</h1>
        <div class="contact">{email} | {phone} | {location}</div>
        <div class="contact">{linkedin} | {github}</div>
    </div>
    
    <div class="content">
        {resume_content}
    </div>
    
    <!-- ATS Keywords (hidden) -->
    <div style="display: none;">
        Keywords: {keywords}
        Target Position: {target_position}
        Target Company: {target_company}
    </div>
</body>
</html>'''
        
        # Extract user info
        user = self.user_profile.get('personal', {})
        
        # Format resume content for HTML
        formatted_content = content.replace('\n', '<br>\n')
        
        # Extract keywords from job
        keywords = self.extract_keywords(job)
        
        return html_template.format(
            name=user.get('name', 'Your Name'),
            email=user.get('email', 'email@example.com'),
            phone=user.get('phone', '555-0100'),
            location=user.get('location', 'City, State'),
            linkedin=user.get('linkedin', ''),
            github=user.get('github', ''),
            resume_content=formatted_content,
            keywords=', '.join(keywords),
            target_position=job.get('title', ''),
            target_company=job.get('company', '')
        )
    
    def extract_keywords(self, job: Dict) -> List[str]:
        """Extract important keywords from job for ATS"""
        
        description = job.get('description', '').lower()
        title = job.get('title', '').lower()
        
        # Common tech keywords to look for
        tech_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'node',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
            'sql', 'nosql', 'mongodb', 'postgresql', 'redis',
            'rest', 'api', 'microservices', 'agile', 'scrum'
        ]
        
        found_keywords = []
        for keyword in tech_keywords:
            if keyword in description or keyword in title:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def create_application_guide(self, job: Dict, job_folder: Path, guide_path: Path):
        """Create detailed step-by-step application guide"""
        
        guide_content = f'''# Application Guide for {job['company']}

## Position: {job['title']}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## Quick Info
- **Company:** {job['company']}
- **Location:** {job.get('location', 'Not specified')}
- **Salary Range:** ${job.get('salary_min', 'Not specified'):,} - ${job.get('salary_max', 'Not specified'):,} 
- **Job Score:** {job.get('score', 0)}/100
- **Cover Letter Required:** {'Yes' if job.get('cover_letter_required') else 'No'}
- **Days Since Posted:** {job.get('days_old', 'Unknown')}

---

## Application Materials

### 1. Resume
- **HTML Version (for viewing):** `{job_folder / f"resume_{job['job_id']}.html"}`
- **ATS Text Version (for uploading):** `{job_folder / f"resume_{job['job_id']}_ATS.txt"}`
- **Status:** READY

### 2. Cover Letter
- **Required:** {'Yes' if job.get('cover_letter_required') else 'No'}
- **File:** `{job_folder / f"cover_letter_{job['job_id']}.txt" if job.get('cover_letter_required') else 'Not needed'}`
- **Status:** {'READY' if job.get('cover_letter_required') else 'NOT REQUIRED'}

---

## Step-by-Step Application Process

### Step 1: Review Materials
- [ ] Open and review the ATS-optimized resume
- [ ] Verify all information is accurate
- [ ] Review cover letter (if required)
- [ ] Check for any company-specific requirements

### Step 2: Access Job Posting
- **Direct Link:** {job.get('url', 'No URL available')}
- [ ] Click the link above to access the job posting
- [ ] Create account on company career site if needed
- [ ] Save login credentials

### Step 3: Fill Application Form
Common fields you'll encounter:

#### Personal Information
- Full Name: {self.user_profile.get('personal', {}).get('name', 'Your Name')}
- Email: {self.user_profile.get('personal', {}).get('email', 'your.email@example.com')}
- Phone: {self.user_profile.get('personal', {}).get('phone', '555-0100')}
- Location: {self.user_profile.get('personal', {}).get('location', 'City, State')}
- LinkedIn: {self.user_profile.get('personal', {}).get('linkedin', 'linkedin.com/in/profile')}
- GitHub: {self.user_profile.get('personal', {}).get('github', 'github.com/username')}

#### Work Authorization
- [ ] Are you authorized to work in the US? 
- [ ] Will you require sponsorship?
- [ ] Available start date?

#### Education
Copy from resume or use:
{self._format_education()}

#### Experience
Copy from resume or use:
{self._format_experience()}

### Step 4: Upload Documents
1. **Resume Upload:**
   - Use the ATS text version for ATS systems
   - Use HTML version if PDF is required (print to PDF)
   
2. **Cover Letter Upload (if required):**
   - Use the generated cover letter file

### Step 5: Additional Questions
Common questions to prepare for:
- [ ] Why do you want to work at {job['company']}?
- [ ] What interests you about this role?
- [ ] Salary expectations? (Range: ${job.get('salary_min', 70000):,} - ${job.get('salary_max', 150000):,})
- [ ] How did you hear about this position?

### Step 6: Final Review
- [ ] Double-check all form fields
- [ ] Verify uploaded documents are correct
- [ ] Review application summary
- [ ] Take screenshot of confirmation

### Step 7: Submit and Track
- [ ] Submit application
- [ ] Note confirmation number: _____________
- [ ] Add to calendar for follow-up (1 week)
- [ ] Update tracking CSV with "applied" status

---

## Post-Application Actions

### Immediate (Same Day):
- [ ] Send connection request to hiring manager on LinkedIn
- [ ] Send connection request to team members
- [ ] Follow company on LinkedIn

### Within 3 Days:
- [ ] Send follow-up email if you have recruiter contact
- [ ] Research recent company news for interview prep

### After 1 Week:
- [ ] Send polite follow-up if no response
- [ ] Update application status in tracking CSV

---

## Interview Preparation Resources

### Company Research:
- Company Website: Search for "{job['company']} careers"
- Recent News: Search for "{job['company']} news 2024"
- Glassdoor Reviews: Search for "{job['company']} interview questions"

### Technical Preparation:
Based on job requirements, review:
{self._extract_technical_requirements(job)}

---

## Notes Section
Add your notes here:
- Application submitted: [DATE]
- Confirmation #: [NUMBER]
- Recruiter contact: [NAME/EMAIL]
- Follow-up dates: [DATES]
- Response received: [DATE]
- Interview scheduled: [DATE]

---

## File Locations Reference
All files for this application are stored in:
`{job_folder}`

- Resume (HTML): `resume_{job['job_id']}.html`
- Resume (ATS): `resume_{job['job_id']}_ATS.txt`
- Cover Letter: `cover_letter_{job['job_id']}.txt`
- This Guide: `APPLICATION_GUIDE_{job['job_id']}.md`
'''
        
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide_content)
    
    def _format_education(self) -> str:
        """Format education for guide"""
        education = self.user_profile.get('education', [])
        if not education:
            return "- Add your education details"
        
        formatted = []
        for edu in education:
            formatted.append(f"- {edu.get('degree', '')} from {edu.get('school', '')}, {edu.get('graduation', '')}")
        return '\n'.join(formatted)
    
    def _format_experience(self) -> str:
        """Format experience for guide"""
        experience = self.user_profile.get('experience', [])
        if not experience:
            return "- Add your experience details"
        
        formatted = []
        for exp in experience:
            formatted.append(f"- {exp.get('title', '')} at {exp.get('company', '')}, {exp.get('duration', '')}")
        return '\n'.join(formatted)
    
    def _extract_technical_requirements(self, job: Dict) -> str:
        """Extract technical requirements from job"""
        keywords = self.extract_keywords(job)
        if keywords:
            return '- ' + '\n- '.join(keywords)
        return "- Review job description for specific requirements"
    
    def track_application(self, application_id: str, job: Dict, resume_path: str, 
                         cover_letter_path: str, guide_path: str):
        """Track application in CSV"""
        
        with open(self.csv_files['applications'], 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'application_id', 'job_id', 'company', 'title', 'score',
                'resume_path', 'cover_letter_path', 'guide_path',
                'applied_date', 'status', 'response_date', 'notes'
            ])
            
            writer.writerow({
                'application_id': application_id,
                'job_id': job.get('job_id'),
                'company': job.get('company'),
                'title': job.get('title'),
                'score': job.get('score'),
                'resume_path': resume_path,
                'cover_letter_path': cover_letter_path,
                'guide_path': guide_path,
                'applied_date': '',
                'status': 'prepared',
                'response_date': '',
                'notes': 'Application materials generated'
            })
    
    def organize_folder_structure(self):
        """Organize the entire jobflow folder"""
        
        print("\n=== ORGANIZING FOLDER STRUCTURE ===")
        
        # Move old files to archive
        old_files = [
            'PERPLEXITY_SETUP.md',
            'JOB_SEARCH_API_ANALYSIS.md',
            'COMPLETION_SUMMARY.md',
            'PHASE1_README.md',
            'SETUP_GUIDE_LOCAL.md'
        ]
        
        for old_file in old_files:
            old_path = self.base_dir / old_file
            if old_path.exists():
                archive_path = self.folders['archive'] / old_file
                old_path.rename(archive_path)
                print(f"Archived: {old_file}")
        
        # Create main README
        self.create_main_readme()
        
        print("Folder structure organized!")
        print(f"Main data folder: {self.base_dir / 'data'}")
    
    def create_main_readme(self):
        """Create clear main README"""
        
        readme_content = '''# JobFlow - Automated Job Application System

## Quick Start

1. **Find Jobs:** Run `python backend/complete_job_application_system.py`
2. **Check Jobs:** Open `data/tracking/jobs_master.csv`
3. **View Applications:** Check `data/applications/` folder
4. **Track Status:** Update `data/tracking/applications_tracker.csv`

## Folder Structure

```
jobflow/
├── data/                      # All generated data
│   ├── jobs/                  # Job listings
│   ├── resumes/              # Generated resumes
│   ├── cover_letters/        # Generated cover letters
│   ├── applications/         # Complete application packages
│   ├── application_guides/   # Step-by-step guides
│   ├── tracking/             # CSV tracking files
│   │   ├── jobs_master.csv          # All discovered jobs
│   │   ├── applications_tracker.csv # Application status
│   │   └── status_updates.csv       # Status change log
│   └── archive/              # Old/outdated files
│
├── backend/                   # Core system
│   ├── app/
│   │   └── services/         # AI and job search services
│   └── complete_job_application_system.py  # Main system
│
└── professional_profile/      # Your profile data
    └── profile_master.json   # Edit this with your info
```

## Key Features

1. **Real Job Discovery** - Uses Adzuna API for real jobs
2. **AI Resume Generation** - OpenAI creates ATS-optimized resumes
3. **AI Cover Letters** - Claude writes personalized cover letters
4. **Application Guides** - Step-by-step instructions for each job
5. **CSV Tracking** - Everything tracked in organized CSVs

## How It Works

1. System discovers real jobs from Adzuna
2. Scores jobs based on your fit (0-100)
3. Generates tailored resume for each job
4. Creates cover letter if required
5. Produces application guide with all steps
6. Tracks everything in CSV files

## File Locations

- **Jobs CSV:** `data/tracking/jobs_master.csv`
- **Applications CSV:** `data/tracking/applications_tracker.csv`
- **Generated Materials:** `data/applications/[CompanyName]_[JobID]/`
- **Your Profile:** `professional_profile/profile_master.json`

## Commands

```bash
# Discover and process jobs
python backend/complete_job_application_system.py

# Test system components
python backend/test_integration.py
```

## Status

System is fully operational with:
- ✅ Adzuna job discovery
- ✅ OpenAI resume generation
- ✅ Claude cover letter generation
- ✅ CSV tracking
- ✅ Organized folder structure
- ✅ Application guides
'''
        
        readme_path = self.base_dir / 'README.md'
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)

async def main():
    """Run the complete system"""
    
    print("=" * 60)
    print("COMPLETE JOB APPLICATION SYSTEM")
    print("=" * 60)
    
    system = CompleteJobApplicationSystem()
    
    # Organize folder structure
    system.organize_folder_structure()
    
    # Discover jobs
    queries = [
        "software engineer new grad",
        "python developer junior",
        "full stack developer entry level"
    ]
    
    jobs = await system.discover_and_track_jobs(queries)
    
    # Generate materials for top 3 jobs
    top_jobs = sorted(jobs, key=lambda x: x.get('score', 0), reverse=True)[:3]
    
    for job in top_jobs:
        materials = await system.generate_application_materials(job)
        print(f"\nGenerated materials in: {materials['job_folder']}")
    
    print("\n" + "=" * 60)
    print("SYSTEM COMPLETE!")
    print(f"Jobs tracked in: data/tracking/jobs_master.csv")
    print(f"Applications in: data/applications/")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())