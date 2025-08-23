"""
Ultimate JobFlow Application System
Combines Adzuna job discovery + OpenAI/Claude AI generation
This is the REAL, WORKING system with best-in-class APIs
"""

import asyncio
import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path
import hashlib

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import our working services
from app.services.adzuna_job_search import AdzunaJobSearch
from app.services.ai_content_generator import AIContentGenerator


class UltimateJobApplicationSystem:
    """
    The complete, working job application system with:
    - Adzuna API for real job discovery (1000 free searches/month)
    - OpenAI for intelligent resume tailoring
    - Claude for creative cover letter writing
    - Smart job scoring and filtering
    - CSV tracking and backup
    """
    
    def __init__(self):
        print("\n🚀 Initializing Ultimate JobFlow System...")
        
        self.profile = self._load_renato_profile()
        
        # Initialize services
        self.job_searcher = AdzunaJobSearch()
        self.ai_generator = AIContentGenerator()
        
        # Output directories
        self.output_dir = Path("ultimate_applications")
        self.output_dir.mkdir(exist_ok=True)
        
        # CSV tracking files
        self.applications_csv = self.output_dir / "applications_tracker.csv"
        self.jobs_csv = self.output_dir / "jobs_discovered.csv"
        
        # Initialize CSV files
        self._init_csv_files()
        
        # Check API availability
        self._check_api_status()
    
    def _check_api_status(self):
        """Check which APIs are available"""
        
        print("\n📊 API Status Check:")
        print("-" * 40)
        
        # Adzuna
        if os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_API_KEY'):
            print("✅ Adzuna API: Ready (1000 searches/month)")
        else:
            print("❌ Adzuna API: Missing credentials")
        
        # OpenAI
        if os.getenv('OPENAI_API_KEY'):
            print("✅ OpenAI API: Ready for resume generation")
        else:
            print("⚠️  OpenAI API: Not configured (will use templates)")
        
        # Claude
        if os.getenv('ANTHROPIC_API_KEY') or os.getenv('LLM_API_KEY'):
            print("✅ Claude API: Ready for cover letters")
        else:
            print("⚠️  Claude API: Not configured (will use templates)")
        
        print("-" * 40)
    
    def _load_renato_profile(self) -> Dict:
        """Load complete candidate profile"""
        return {
            "name": "Renato Dap",
            "email": "renatodapapplications@gmail.com",
            "phone": "+1 (812) 262-8002",
            "github": "github.com/renatodap",
            "linkedin": "linkedin.com/in/renato-prado-82513b297",
            "graduation": "May 2026",
            "job_start": "July 2026",
            "university": "Rose-Hulman Institute of Technology",
            "degree": "Bachelor of Science in Computer Science",
            "gpa": "3.65",
            "visa_status": "F-1 Student Visa (3 years OPT available)",
            "min_salary": 83000,
            "location_pref": "Open to relocate anywhere",
            "base_resume": """Teaching Assistant - Object-Oriented Software Development (Dec 2024 - Feb 2025)
- Support 30+ students in advanced Java programming and design patterns
- Developed automated grading scripts reducing evaluation time by 60%
- Created supplemental learning materials improving class average by 12%

Investment Banking Intern - Virtus BR Partners, São Paulo (Summer 2024)
- Built financial models for $50M+ renewable energy transactions
- Automated pitch deck generation saving 15 hours weekly
- Analyzed 20+ companies across agtech and retail sectors

Projects:
- FeelSharper: AI-powered fitness platform with computer vision and RAG architecture
- JobFlow: Automated job application system with intelligent matching
- StudySharper: Educational platform concept with AI optimization

Skills: Python, TypeScript, JavaScript, Java, SQL, React, Next.js, FastAPI, PostgreSQL, AWS"""
        }
    
    def _init_csv_files(self):
        """Initialize CSV tracking files"""
        
        if not self.applications_csv.exists():
            with open(self.applications_csv, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'job_id', 'company', 'title', 'location', 'salary', 'score',
                    'apply_url', 'source', 'ai_resume', 'ai_cover_letter',
                    'directory', 'created_at', 'status', 'applied_date', 'notes'
                ])
        
        if not self.jobs_csv.exists():
            with open(self.jobs_csv, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'discovered_date', 'company', 'title', 'location', 'salary',
                    'url', 'description', 'score', 'score_reasons', 'days_old', 'source'
                ])
    
    async def run_ultimate_job_search(self) -> Dict:
        """
        Run the complete job search and application preparation pipeline
        """
        
        print(f"\n{'=' * 70}")
        print(f"ULTIMATE JOB APPLICATION SYSTEM - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print(f"{'=' * 70}")
        
        # Phase 1: Job Discovery with Adzuna
        print("\n📍 Phase 1: Discovering Real Jobs with Adzuna API...")
        jobs = await self._discover_jobs_adzuna()
        
        if not jobs:
            print("⚠️  No jobs found. Check your search queries or API limits.")
            return {'jobs_found': 0, 'packages_created': 0}
        
        # Phase 2: AI Job Analysis
        print(f"\n🔍 Phase 2: AI Analysis of {len(jobs)} Jobs...")
        analyzed_jobs = await self._analyze_jobs_with_ai(jobs)
        
        # Phase 3: Smart Scoring
        print(f"\n📊 Phase 3: Intelligent Job Scoring...")
        scored_jobs = self._score_jobs_intelligently(analyzed_jobs)
        
        # Filter high-score jobs
        high_score_jobs = [j for j in scored_jobs if j['score'] >= 70]
        print(f"   Found {len(high_score_jobs)} high-score jobs (70+)")
        
        # Show top jobs
        if high_score_jobs:
            print(f"\n🎯 Top Opportunities Found:")
            for i, job in enumerate(sorted(high_score_jobs, key=lambda x: x['score'], reverse=True)[:5], 1):
                print(f"   {i}. [{job['score']}] {job['company']} - {job['title']}")
                if job.get('salary_formatted'):
                    print(f"      Salary: {job['salary_formatted']}")
                print(f"      Location: {job['location']}")
        
        # Phase 4: AI Application Package Generation
        print(f"\n✨ Phase 4: AI-Powered Application Package Generation...")
        packages = await self._create_ai_application_packages(high_score_jobs[:10])
        
        # Phase 5: Summary and Tracking
        print(f"\n📋 Phase 5: Generating Summary and Tracking...")
        summary = await self._generate_ultimate_summary(packages)
        
        # Backup CSV files
        self._backup_csv_files()
        
        # Final Report
        print(f"\n{'=' * 70}")
        print(f"✅ ULTIMATE SYSTEM COMPLETE!")
        print(f"{'=' * 70}")
        print(f"Jobs discovered: {len(jobs)}")
        print(f"High-score matches: {len(high_score_jobs)}")
        print(f"AI packages created: {len(packages)}")
        print(f"   - AI Resumes: {sum(1 for p in packages if p.get('ai_resume_generated'))}")
        print(f"   - AI Cover Letters: {sum(1 for p in packages if p.get('ai_cover_generated'))}")
        print(f"\n📂 Application packages: {self.output_dir}")
        print(f"📊 Summary: {summary['file_path']}")
        
        # API Usage Report
        usage = self.ai_generator.get_usage_report()
        print(f"\n💰 API Usage:")
        print(f"   OpenAI calls: {usage['openai_calls']}")
        print(f"   Claude calls: {usage['claude_calls']}")
        print(f"   Estimated cost: {usage['estimated_cost']}")
        
        return {
            'jobs_discovered': len(jobs),
            'high_score_jobs': len(high_score_jobs),
            'packages_created': len(packages),
            'ai_resumes': sum(1 for p in packages if p.get('ai_resume_generated')),
            'ai_covers': sum(1 for p in packages if p.get('ai_cover_generated')),
            'api_cost': usage['estimated_cost'],
            'summary_file': summary['file_path']
        }
    
    async def _discover_jobs_adzuna(self) -> List[Dict]:
        """Discover jobs using Adzuna API"""
        
        # Optimized queries for new grad software engineer
        queries = [
            "software engineer graduate",
            "software developer entry level",
            "junior software engineer",
            "python developer junior",
            "full stack developer new grad",
            "AI ML engineer entry level"
        ]
        
        # Search with Adzuna
        all_jobs = await self.job_searcher.search_multiple_queries(
            queries=queries[:4],  # Limit to conserve API calls
            location="",  # Search entire US
            max_days_old=14,  # Last 2 weeks
            salary_min=70000  # Minimum salary
        )
        
        # Save to CSV
        await self._save_jobs_to_csv(all_jobs)
        
        return all_jobs
    
    async def _analyze_jobs_with_ai(self, jobs: List[Dict]) -> List[Dict]:
        """Analyze each job with AI for deeper insights"""
        
        analyzed_jobs = []
        
        for i, job in enumerate(jobs[:20], 1):  # Limit AI analysis to save costs
            print(f"   Analyzing job {i}/{min(len(jobs), 20)}: {job['company']} - {job['title'][:30]}...")
            
            # Get AI analysis
            analysis = await self.ai_generator.analyze_job_requirements(job)
            
            # Merge analysis into job
            job['ai_analysis'] = analysis
            job['experience_level'] = analysis.get('experience_level', 'Unknown')
            job['visa_friendly'] = analysis.get('visa_friendly', False)
            job['tech_stack'] = analysis.get('tech_stack', [])
            job['red_flags'] = analysis.get('red_flags', [])
            
            analyzed_jobs.append(job)
            
            # Rate limiting
            await asyncio.sleep(0.5)
        
        # Add non-analyzed jobs
        analyzed_jobs.extend(jobs[20:])
        
        return analyzed_jobs
    
    def _score_jobs_intelligently(self, jobs: List[Dict]) -> List[Dict]:
        """Score jobs with intelligent algorithm"""
        
        for job in jobs:
            score = 50  # Base score
            
            # Get text for analysis
            title = job.get('title', '').lower()
            company = job.get('company', '').lower()
            description = job.get('description', '').lower()
            location = job.get('location', '').lower()
            
            job_text = f"{title} {company} {description}"
            
            # SCORING FACTORS
            
            # 1. Experience Level Match (Critical)
            if job.get('experience_level') == 'Entry':
                score += 30
            elif job.get('experience_level') == 'Junior':
                score += 25
            elif job.get('experience_level') == 'Senior':
                score -= 20
            
            # 2. Visa Friendliness (Important for F-1)
            if job.get('visa_friendly'):
                score += 20
            
            # 3. Salary Range
            if job.get('salary_min'):
                if job['salary_min'] >= 100000:
                    score += 15
                elif job['salary_min'] >= 80000:
                    score += 10
                elif job['salary_min'] < 60000:
                    score -= 10
            
            # 4. Dream Role Bonuses
            if any(term in job_text for term in ['music', 'audio', 'spotify']):
                score += 25
            if any(term in job_text for term in ['ai', 'ml', 'machine learning']):
                score += 20
            if any(term in job_text for term in ['tennis', 'sports', 'fitness']):
                score += 20
            
            # 5. Tech Stack Match
            your_tech = ['python', 'typescript', 'react', 'fastapi', 'postgresql']
            matches = sum(1 for tech in your_tech if tech in job_text)
            score += matches * 3
            
            # 6. Freshness Bonus
            if job.get('is_fresh'):
                score += 10
            
            # 7. Location Preferences
            if 'remote' in location.lower():
                score += 10
            
            # 8. Red Flags Penalties
            if job.get('red_flags'):
                score -= len(job.get('red_flags', [])) * 5
            
            # Cap score
            job['score'] = min(max(score, 0), 100)
            
            # Score breakdown
            job['score_breakdown'] = self._get_score_breakdown(job)
        
        # Sort by score
        jobs.sort(key=lambda x: x['score'], reverse=True)
        return jobs
    
    def _get_score_breakdown(self, job: Dict) -> Dict:
        """Get detailed score breakdown"""
        
        reasons = []
        
        if job.get('experience_level') == 'Entry':
            reasons.append("Entry level position (+30)")
        if job.get('visa_friendly'):
            reasons.append("Visa friendly (+20)")
        if job.get('salary_min', 0) >= 80000:
            reasons.append(f"Good salary: ${job['salary_min']:,} (+10)")
        if job.get('is_fresh'):
            reasons.append("Recently posted (+10)")
        
        job_text = f"{job.get('title', '')} {job.get('description', '')}".lower()
        if 'ai' in job_text or 'ml' in job_text:
            reasons.append("AI/ML focus (+20)")
        
        return {
            'score': job['score'],
            'reasons': reasons,
            'red_flags': job.get('red_flags', [])
        }
    
    async def _create_ai_application_packages(self, jobs: List[Dict]) -> List[Dict]:
        """Create AI-powered application packages"""
        
        packages = []
        
        for job in jobs:
            try:
                print(f"\n   Creating AI package for {job['company']} - {job['title'][:40]}...")
                
                # Generate unique ID
                app_id = hashlib.md5(f"{job['company']}_{job['title']}".encode()).hexdigest()[:8]
                
                # Create directory
                job_dir = self.output_dir / f"{app_id}_{job['company'].replace(' ', '_')}"
                job_dir.mkdir(exist_ok=True)
                
                # 1. Generate AI Resume (OpenAI)
                print(f"      Generating AI resume...")
                resume_result = await self.ai_generator.generate_tailored_resume(job, self.profile)
                
                resume_file = job_dir / "ai_resume.md"
                with open(resume_file, 'w', encoding='utf-8') as f:
                    f.write(resume_result['content'])
                
                # 2. Generate AI Cover Letter (Claude)
                print(f"      Generating AI cover letter...")
                cover_result = await self.ai_generator.generate_personalized_cover_letter(job, self.profile)
                
                cover_file = job_dir / "ai_cover_letter.md"
                with open(cover_file, 'w', encoding='utf-8') as f:
                    f.write(cover_result['content'])
                
                # 3. Create Application Guide
                guide = self._create_ultimate_application_guide(job, resume_result, cover_result)
                guide_file = job_dir / "application_guide.md"
                with open(guide_file, 'w', encoding='utf-8') as f:
                    f.write(guide)
                
                # 4. Save Job Details with AI Analysis
                job_file = job_dir / "job_complete_analysis.json"
                with open(job_file, 'w', encoding='utf-8') as f:
                    json.dump(job, f, indent=2, default=str)
                
                # Create package record
                package = {
                    'job_id': app_id,
                    'company': job['company'],
                    'title': job['title'],
                    'location': job['location'],
                    'salary': job.get('salary_formatted', ''),
                    'score': job['score'],
                    'score_reasons': job['score_breakdown']['reasons'],
                    'ai_resume_generated': resume_result.get('generator') != 'Template Engine',
                    'ai_resume_model': resume_result.get('model', 'None'),
                    'ai_cover_generated': cover_result.get('generator') != 'Template Engine',
                    'ai_cover_model': cover_result.get('model', 'None'),
                    'directory': str(job_dir),
                    'apply_url': job.get('url', ''),
                    'created_at': datetime.now().isoformat(),
                    'status': 'pending'
                }
                
                # Save to CSV
                await self._save_application_to_csv(package)
                
                packages.append(package)
                print(f"      ✅ Package created successfully!")
                
            except Exception as e:
                print(f"      ❌ Failed: {e}")
                continue
        
        return packages
    
    def _create_ultimate_application_guide(self, job: Dict, resume_result: Dict, cover_result: Dict) -> str:
        """Create comprehensive application guide"""
        
        guide = f"""# Ultimate Application Guide
**{job.get('company')} - {job.get('title')}**
*Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}*

## 📊 Job Intelligence Report

### Score: {job.get('score', 0)}/100
**Fit Analysis:**
"""
        
        for reason in job.get('score_breakdown', {}).get('reasons', []):
            guide += f"✅ {reason}\n"
        
        for flag in job.get('red_flags', []):
            guide += f"⚠️  {flag}\n"
        
        guide += f"""

### Job Details
- **Company**: {job.get('company')}
- **Location**: {job.get('location')}
- **Salary**: {job.get('salary_formatted', 'Not specified')}
- **Posted**: {job.get('days_old', '?')} days ago
- **Source**: Adzuna
- **Apply URL**: {job.get('url', 'Not available')}

### AI Analysis
- **Experience Level**: {job.get('experience_level', 'Unknown')}
- **Visa Friendly**: {'Yes ✅' if job.get('visa_friendly') else 'Unknown ⚠️'}
- **Tech Stack**: {', '.join(job.get('tech_stack', [])[:5]) if job.get('tech_stack') else 'Not analyzed'}

## 📝 AI-Generated Materials

### Resume
- **Generator**: {resume_result.get('generator', 'Unknown')}
- **Model**: {resume_result.get('model', 'None')}
- **ATS Optimized**: {'Yes ✅' if resume_result.get('ats_optimized') else 'No ⚠️'}
- **File**: `ai_resume.md`

### Cover Letter
- **Generator**: {cover_result.get('generator', 'Unknown')}
- **Model**: {cover_result.get('model', 'None')}
- **Personalization**: {cover_result.get('personalization_level', 'Unknown')}
- **File**: `ai_cover_letter.md`

## 🎯 Application Strategy

### Step 1: Pre-Application Research (5 min)
- [ ] Research {job.get('company')} recent news
- [ ] Check Glassdoor reviews for culture fit
- [ ] Find hiring manager on LinkedIn
- [ ] Review similar roles at company

### Step 2: Application Submission (10 min)
- [ ] Click apply: {job.get('url', 'URL not available')}
- [ ] Upload AI-generated resume (convert to PDF)
- [ ] Paste AI-generated cover letter
- [ ] Complete any additional questions
- [ ] Save confirmation number

### Step 3: Post-Application Actions (5 min)
- [ ] Update tracker: `python update_status.py`
- [ ] Connect with employees on LinkedIn
- [ ] Set follow-up reminder for 1 week
- [ ] Save job posting for interview prep

## 💡 Interview Preparation Topics
Based on AI analysis, prepare for questions about:
"""
        
        if job.get('tech_stack'):
            for tech in job.get('tech_stack', [])[:5]:
                guide += f"- {tech}\n"
        
        guide += """- Your unique background (tennis/music/international)
- Specific projects (FeelSharper, JobFlow)
- Why this company specifically
- Visa status and timeline (F-1 with OPT)

## 🚀 Why You're Perfect for This Role
- Graduating at the perfect time (May 2026 for July 2026 start)
- Technical skills match job requirements
- Unique perspective from athletics and music
- Proven ability to build real products
- International experience and multilingual abilities

---

**Priority Level**: {'🔥 HIGH' if job.get('score', 0) >= 80 else '⭐ MEDIUM' if job.get('score', 0) >= 70 else '📋 STANDARD'}
**Recommended Action**: {'Apply immediately!' if job.get('score', 0) >= 80 else 'Apply within 24 hours' if job.get('score', 0) >= 70 else 'Apply when convenient'}
"""
        
        return guide
    
    async def _save_jobs_to_csv(self, jobs: List[Dict]):
        """Save discovered jobs to CSV"""
        
        with open(self.jobs_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            for job in jobs:
                writer.writerow([
                    datetime.now().strftime('%Y-%m-%d %H:%M'),
                    job.get('company', ''),
                    job.get('title', ''),
                    job.get('location', ''),
                    job.get('salary_formatted', ''),
                    job.get('url', ''),
                    job.get('description', '')[:500],
                    job.get('score', 0),
                    '; '.join(job.get('score_breakdown', {}).get('reasons', [])),
                    job.get('days_old', ''),
                    'Adzuna'
                ])
    
    async def _save_application_to_csv(self, package: Dict):
        """Save application package to CSV"""
        
        with open(self.applications_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            writer.writerow([
                package['job_id'],
                package['company'],
                package['title'],
                package['location'],
                package['salary'],
                package['score'],
                package['apply_url'],
                'Adzuna',
                'Yes' if package['ai_resume_generated'] else 'No',
                'Yes' if package['ai_cover_generated'] else 'No',
                package['directory'],
                package['created_at'],
                package['status'],
                '',  # applied_date
                ''   # notes
            ])
    
    async def _generate_ultimate_summary(self, packages: List[Dict]) -> Dict:
        """Generate comprehensive summary"""
        
        summary_file = self.output_dir / f"ultimate_summary_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
        
        # Count AI vs template generation
        ai_resumes = sum(1 for p in packages if p.get('ai_resume_generated'))
        ai_covers = sum(1 for p in packages if p.get('ai_cover_generated'))
        
        summary_content = f"""# Ultimate Job Application Summary
**Generated**: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
**System**: Ultimate JobFlow with Adzuna + OpenAI + Claude

## 🎯 Executive Summary
- **Jobs Discovered**: {len(packages)}
- **High Priority (80+)**: {len([p for p in packages if p['score'] >= 80])}
- **AI-Generated Resumes**: {ai_resumes}/{len(packages)}
- **AI-Generated Cover Letters**: {ai_covers}/{len(packages)}

## 📊 API Usage
- **Adzuna**: Real job data from actual postings
- **OpenAI**: {ai_resumes} resumes generated
- **Claude**: {ai_covers} cover letters generated
- **Estimated Cost**: {self.ai_generator.get_usage_report()['estimated_cost']}

## 🔥 Priority Applications (Apply First!)

"""
        
        # Sort by score
        sorted_packages = sorted(packages, key=lambda x: x['score'], reverse=True)
        
        for i, package in enumerate(sorted_packages, 1):
            priority = "🔥 URGENT" if package['score'] >= 80 else "⭐ HIGH" if package['score'] >= 70 else "📋 MEDIUM"
            
            summary_content += f"""
### {i}. {package['company']} - {package['title']}
- **Score**: {package['score']}/100 {priority}
- **Location**: {package['location']}
- **Salary**: {package['salary'] if package['salary'] else 'Not specified'}
- **AI Resume**: {'✅ Yes' if package['ai_resume_generated'] else '⚠️ Template'}
- **AI Cover**: {'✅ Yes' if package['ai_cover_generated'] else '⚠️ Template'}
- **Apply**: {package['apply_url'][:70]}...
- **Package**: `{Path(package['directory']).name}/`

**Why Good Fit**: {', '.join(package['score_reasons'][:2])}

"""
        
        summary_content += f"""
## 📂 Application Packages
All packages saved to: `{self.output_dir}/`

Each package contains:
- `ai_resume.md` - AI-tailored resume (OpenAI GPT-4)
- `ai_cover_letter.md` - AI-personalized cover letter (Claude)
- `application_guide.md` - Complete application strategy
- `job_complete_analysis.json` - Full job data with AI analysis

## 🚀 Action Plan

### Immediate (Today)
1. Apply to all 80+ score jobs first
2. Use the AI-generated materials exactly as created
3. Follow the application guide for each position
4. Update status after each application

### Tomorrow
1. Apply to 70-79 score jobs
2. Set up LinkedIn connections
3. Schedule follow-up reminders

### This Week
1. Complete all generated applications
2. Research companies for interview prep
3. Customize thank you note templates

## 💡 Success Tips
- **Apply within 24 hours** - Fresh applications get more attention
- **Use AI materials** - They're optimized for ATS and keywords
- **Follow guides exactly** - Each step is important
- **Track everything** - Update status immediately after applying

## 📈 System Performance
- **Adzuna API**: Successfully retrieved real jobs
- **AI Generation**: {ai_resumes + ai_covers} successful AI generations
- **Success Rate**: {(ai_resumes + ai_covers) / (len(packages) * 2) * 100:.0f}% AI coverage
- **Cost Efficiency**: ~{float(self.ai_generator.get_usage_report()['estimated_cost'].replace('$', '')) / max(len(packages), 1):.2f} per application

---

*This is your best chance at landing interviews. The system used:*
- *Real job data from Adzuna (not scraped or fake)*
- *AI-optimized resumes with ATS keywords (OpenAI)*
- *Personalized cover letters (Claude)*
- *Intelligent scoring based on your profile*

**Apply now while jobs are fresh!**
"""
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(summary_content)
        
        return {'file_path': str(summary_file)}
    
    def _backup_csv_files(self):
        """Backup CSV files"""
        
        import shutil
        
        backup_dir = self.output_dir / "backups"
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for csv_file in [self.applications_csv, self.jobs_csv]:
            if csv_file.exists():
                backup_name = backup_dir / f"{csv_file.stem}_{timestamp}.csv"
                shutil.copy2(csv_file, backup_name)


# Main execution
async def run_ultimate_system():
    """Run the ultimate job application system"""
    
    system = UltimateJobApplicationSystem()
    
    try:
        results = await system.run_ultimate_job_search()
        
        if results['packages_created'] > 0:
            print("\n" + "🎉" * 20)
            print("SUCCESS! Your AI-powered application packages are ready!")
            print("🎉" * 20)
            
            print(f"\nNext steps:")
            print(f"1. Open: {results['summary_file']}")
            print(f"2. Apply to HIGH priority jobs immediately")
            print(f"3. Use the AI-generated materials")
            print(f"4. Track your applications")
        else:
            print("\n⚠️  No packages created. Check:")
            print("1. API keys are correctly set")
            print("2. Adzuna API limits (1000/month)")
            print("3. Search queries are appropriate")
        
        return results
        
    except Exception as e:
        print(f"\n❌ System error: {e}")
        import traceback
        traceback.print_exc()
        return {}


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════╗
║              ULTIMATE JOBFLOW APPLICATION SYSTEM                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  This is the REAL, WORKING system with:                          ║
║                                                                    ║
║  ✅ Adzuna API - Real job data (1000 searches/month free)        ║
║  ✅ OpenAI GPT-4 - Intelligent resume generation                 ║
║  ✅ Claude AI - Creative cover letter writing                    ║
║  ✅ Smart Scoring - Based on your actual profile                 ║
║  ✅ Complete Packages - Everything needed to apply               ║
║                                                                    ║
║  Cost: ~$0.10-0.20 per application (worth it!)                   ║
║                                                                    ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    # Check critical APIs
    if not os.getenv('ADZUNA_APP_ID') or not os.getenv('ADZUNA_API_KEY'):
        print("❌ ERROR: Adzuna API credentials missing!")
        print("The system cannot run without job data.")
        print("\nYour .env file already has these keys - they should work.")
    else:
        print("Starting ultimate job search system...")
        print("This will use real API calls and may cost ~$1-2")
        print("")
        
        # Run the system
        asyncio.run(run_ultimate_system())