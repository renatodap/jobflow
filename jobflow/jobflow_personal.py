"""
JobFlow Personal - Phase 1 Implementation
Complete job search system for personal use (no login required)
Reads from profile.json for all user data
"""

import asyncio
import json
import csv
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set
import httpx

# Import our modules
from cold_outreach_generator import ColdOutreachGenerator

class JobFlowPersonal:
    """Personal job search system - no database, no login"""
    
    def __init__(self):
        self.profile = self.load_profile()
        self.validate_profile()
        self.setup_folders()
        self.existing_jobs = self.load_existing_jobs()
        
        # Initialize generators
        self.outreach_generator = ColdOutreachGenerator(self.profile)
        
        # API credentials (hardcoded for personal use)
        self.adzuna_app_id = '5305c49d'
        self.adzuna_api_key = '13a9a9862ef8dba5e373ba5f197773ef'
        
    def load_profile(self) -> Dict:
        """Load profile from profile.json"""
        profile_path = Path('profile.json')
        if not profile_path.exists():
            raise FileNotFoundError(
                "profile.json not found! Please edit profile.json with your information."
            )
        
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile = json.load(f)
        
        print(f"Loaded profile for: {profile['personal']['name']}")
        return profile
    
    def validate_profile(self):
        """Validate profile has no fake data"""
        forbidden = [
            "your full name", "your.email@example", "your actual",
            "add your", "company name", "university name"
        ]
        
        profile_str = json.dumps(self.profile).lower()
        
        issues = []
        for term in forbidden:
            if term in profile_str:
                issues.append(f"Please update placeholder: '{term}'")
        
        if issues:
            print("\n[WARNING] PROFILE NEEDS UPDATING:")
            for issue in issues:
                print(f"  - {issue}")
            print("\nEdit profile.json with your real information before continuing.\n")
            return False
        
        print("[OK] Profile validated - no placeholder data found")
        return True
    
    def setup_folders(self):
        """Create folder structure for personal use"""
        folders = [
            'data/jobs',
            'data/resumes',
            'data/cover_letters',
            'data/cold_outreach',
            'data/daily_reports',
            'data/tracking',
            'data/learning_paths'
        ]
        
        for folder in folders:
            Path(folder).mkdir(parents=True, exist_ok=True)
        
        print("[OK] Folder structure created")
    
    def load_existing_jobs(self) -> Set[str]:
        """Load existing job IDs to prevent duplicates"""
        existing = set()
        master_csv = Path('data/tracking/jobs_master.csv')
        
        if master_csv.exists():
            with open(master_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if 'job_hash' in row:
                        existing.add(row['job_hash'])
        
        return existing
    
    async def search_jobs(self) -> List[Dict]:
        """Enhanced job search - leave no opportunity behind"""
        print("\n[SEARCH] STARTING EXHAUSTIVE JOB SEARCH")
        print("="*60)
        
        all_jobs = []
        
        # Generate all query variations
        queries = self.generate_search_queries()
        
        print(f"Generated {len(queries)} search queries")
        
        for i, query in enumerate(queries, 1):
            print(f"\n[{i}/{len(queries)}] Searching: {query}")
            
            jobs = await self.search_adzuna(query)
            
            # Process each job
            for job in jobs:
                job_hash = self.generate_job_hash(job)
                
                # Skip duplicates
                if job_hash in self.existing_jobs:
                    continue
                
                # Add metadata
                job['job_hash'] = job_hash
                job['score'] = self.score_job(job)
                job['discovered_at'] = datetime.now().isoformat()
                
                all_jobs.append(job)
                self.existing_jobs.add(job_hash)
            
            # Rate limiting
            await asyncio.sleep(0.5)
        
        print(f"\n[OK] Found {len(all_jobs)} new unique jobs")
        return all_jobs
    
    def generate_search_queries(self) -> List[str]:
        """Generate comprehensive search queries based on profile"""
        queries = []
        
        # Direct role searches
        for role in self.profile['preferences']['target_roles']:
            queries.append(role)
        
        # Skill-based searches
        for skill in self.profile['technical_skills']['languages'][:3]:
            queries.append(f"{skill} developer")
            queries.append(f"{skill} engineer")
        
        # Experience level variations
        experience_terms = [
            "new grad", "entry level", "junior", "early career",
            "0-2 years", "associate", "fresh graduate"
        ]
        
        base_roles = ["software engineer", "developer", "programmer"]
        
        for exp in experience_terms:
            for role in base_roles:
                queries.append(f"{exp} {role}")
                queries.append(f"{role} {exp}")
        
        # Company-specific searches
        for company in self.profile['preferences']['target_companies'][:5]:
            queries.append(f"{company} software engineer")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_queries = []
        for q in queries:
            if q.lower() not in seen:
                seen.add(q.lower())
                unique_queries.append(q)
        
        return unique_queries[:30]  # Limit to 30 queries to avoid rate limits
    
    async def search_adzuna(self, query: str) -> List[Dict]:
        """Search Adzuna API"""
        url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
        
        params = {
            'app_id': self.adzuna_app_id,
            'app_key': self.adzuna_api_key,
            'results_per_page': 10,
            'what': query,
            'max_days_old': 30,
            'sort_by': 'date'
        }
        
        # Add location preference
        if self.profile['preferences']['location_preferences']['preferred_locations']:
            location = self.profile['preferences']['location_preferences']['preferred_locations'][0]
            if location != "Remote":
                params['where'] = location
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                jobs = []
                for item in data.get('results', []):
                    job = {
                        'title': item.get('title', ''),
                        'company': item.get('company', {}).get('display_name', ''),
                        'location': item.get('location', {}).get('display_name', ''),
                        'salary_min': item.get('salary_min'),
                        'salary_max': item.get('salary_max'),
                        'url': item.get('redirect_url', ''),
                        'description': item.get('description', '')[:1000],
                        'created': item.get('created'),
                        'source': 'Adzuna'
                    }
                    
                    if job['title'] and job['company']:
                        jobs.append(job)
                
                print(f"  Found {len(jobs)} jobs")
                return jobs
                
            except Exception as e:
                print(f"  Error: {e}")
                return []
    
    def generate_job_hash(self, job: Dict) -> str:
        """Generate unique hash for job"""
        unique_str = f"{job['company']}_{job['title']}_{job['location']}"
        return hashlib.md5(unique_str.encode()).hexdigest()[:12]
    
    def score_job(self, job: Dict) -> int:
        """Score job based on profile preferences"""
        score = 50  # Base score
        
        title_lower = job['title'].lower()
        desc_lower = job.get('description', '').lower()
        
        # Target role match
        for target_role in self.profile['preferences']['target_roles']:
            if target_role.lower() in title_lower:
                score += 20
                break
        
        # Target company match
        for target_company in self.profile['preferences']['target_companies']:
            if target_company.lower() in job['company'].lower():
                score += 25
                break
        
        # Skill match
        skill_matches = 0
        for skill_category in self.profile['technical_skills'].values():
            if isinstance(skill_category, list):
                for skill in skill_category:
                    if skill.lower() in desc_lower:
                        skill_matches += 1
        score += min(skill_matches * 3, 15)
        
        # Salary match
        min_salary = self.profile['preferences']['salary']['minimum']
        if job.get('salary_min', 0) >= min_salary:
            score += 15
        if job.get('salary_min', 0) >= self.profile['preferences']['salary']['desired']:
            score += 10
        
        # Experience level
        junior_terms = ['junior', 'entry', 'new grad', 'early career', '0-2']
        if any(term in title_lower for term in junior_terms):
            score += 20
        
        senior_terms = ['senior', 'lead', 'principal', 'staff', 'architect']
        if any(term in title_lower for term in senior_terms):
            score -= 25
        
        return max(0, min(100, score))
    
    async def generate_application_materials(self, job: Dict) -> Dict:
        """Generate all application materials for a job"""
        print(f"\n[GENERATE] Materials for: {job['company']} - {job['title']}")
        
        materials = {
            'job': job,
            'resume': await self.generate_resume(job),
            'cover_letter': await self.generate_cover_letter(job),
            'cold_outreach': self.outreach_generator.create_outreach_package(job)
        }
        
        return materials
    
    async def generate_resume(self, job: Dict) -> str:
        """Generate tailored resume (simplified for personal use)"""
        # For now, use a template approach
        # In production, this would call OpenAI API
        
        resume = f"""
{self.profile['personal']['name']}
{self.profile['personal']['email']} | {self.profile['personal']['phone']}
{self.profile['personal']['linkedin']} | {self.profile['personal']['github']}

SUMMARY
Passionate software engineer with expertise in {', '.join(self.profile['technical_skills']['languages'][:3])}.
{self.profile['strengths'][0]}.

EDUCATION
"""
        
        for edu in self.profile['education']:
            resume += f"{edu['degree']} - {edu['school']} - {edu['graduation']}\n"
        
        resume += "\nEXPERIENCE\n"
        for exp in self.profile['experience']:
            resume += f"{exp['title']} at {exp['company']} - {exp['duration']}\n"
            for achievement in exp['achievements']:
                resume += f"• {achievement}\n"
        
        resume += "\nSKILLS\n"
        resume += f"Languages: {', '.join(self.profile['technical_skills']['languages'])}\n"
        resume += f"Frameworks: {', '.join(self.profile['technical_skills']['frameworks'])}\n"
        
        return resume
    
    async def generate_cover_letter(self, job: Dict) -> str:
        """Generate tailored cover letter (simplified for personal use)"""
        # For now, use a template approach
        # In production, this would call Claude API
        
        cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job['title']} position at {job['company']}.

With my background in {', '.join(self.profile['technical_skills']['languages'][:2])} and experience in 
{self.profile['experience'][0]['title'] if self.profile['experience'] else 'software development'}, 
I am confident I would be a valuable addition to your team.

{self.profile['strengths'][0]}. This aligns perfectly with the requirements of your role.

I am particularly drawn to {job['company']} because of your work in the industry. 
The opportunity to contribute to your team while growing my skills is exactly what I'm looking for.

Thank you for considering my application. I look forward to discussing how I can contribute to {job['company']}.

Best regards,
{self.profile['personal']['name']}
"""
        
        return cover_letter
    
    def save_results(self, jobs: List[Dict], materials: List[Dict]):
        """Save all results to files"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save jobs to CSV
        jobs_csv = Path(f'data/daily_reports/jobs_{timestamp}.csv')
        with open(jobs_csv, 'w', newline='', encoding='utf-8') as f:
            if jobs:
                fieldnames = ['score', 'company', 'title', 'location', 'salary_min', 
                             'salary_max', 'url', 'job_hash']
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                
                sorted_jobs = sorted(jobs, key=lambda x: x['score'], reverse=True)
                writer.writerows(sorted_jobs)
        
        print(f"\n[OK] Saved {len(jobs)} jobs to: {jobs_csv}")
        
        # Update master CSV
        master_csv = Path('data/tracking/jobs_master.csv')
        existing_data = []
        
        if master_csv.exists():
            with open(master_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                existing_data = list(reader)
        
        # Add new jobs
        for job in jobs:
            job['applied'] = 'No'
            job['status'] = 'New'
            existing_data.append(job)
        
        # Write back sorted by score
        with open(master_csv, 'w', newline='', encoding='utf-8') as f:
            if existing_data:
                fieldnames = list(existing_data[0].keys())
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                sorted_data = sorted(existing_data, 
                                   key=lambda x: int(x.get('score', 0)), 
                                   reverse=True)
                writer.writerows(sorted_data)
        
        print(f"[OK] Updated master tracking: {master_csv}")
        
        # Save materials
        if materials:
            materials_dir = Path(f'data/daily_reports/materials_{timestamp}')
            materials_dir.mkdir(parents=True, exist_ok=True)
            
            for i, material in enumerate(materials[:5]):  # Save top 5
                job = material['job']
                job_dir = materials_dir / f"{i+1}_{job['company'].replace(' ', '_')}"
                job_dir.mkdir(exist_ok=True)
                
                # Save resume
                with open(job_dir / 'resume.txt', 'w', encoding='utf-8') as f:
                    f.write(material['resume'])
                
                # Save cover letter
                with open(job_dir / 'cover_letter.txt', 'w', encoding='utf-8') as f:
                    f.write(material['cover_letter'])
                
                # Save outreach
                with open(job_dir / 'cold_outreach.json', 'w', encoding='utf-8') as f:
                    json.dump(material['cold_outreach'], f, indent=2)
            
            print(f"[OK] Saved application materials for top {len(materials[:5])} jobs")
        
        # Create summary report
        self.create_summary_report(jobs, timestamp)
    
    def create_summary_report(self, jobs: List[Dict], timestamp: str):
        """Create human-readable summary report"""
        report_path = Path(f'data/daily_reports/summary_{timestamp}.txt')
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"JOBFLOW DAILY REPORT\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            f.write(f"User: {self.profile['personal']['name']}\n")
            f.write("="*60 + "\n\n")
            
            f.write(f"SUMMARY\n")
            f.write(f"Total new jobs found: {len(jobs)}\n")
            
            if jobs:
                high_score = len([j for j in jobs if j['score'] >= 80])
                target_companies = [j for j in jobs 
                                  if any(tc.lower() in j['company'].lower() 
                                        for tc in self.profile['preferences']['target_companies'])]
                
                f.write(f"High-match jobs (80+): {high_score}\n")
                f.write(f"Target company jobs: {len(target_companies)}\n")
                
                f.write(f"\nTOP 10 JOBS TO APPLY\n")
                f.write("-"*60 + "\n")
                
                sorted_jobs = sorted(jobs, key=lambda x: x['score'], reverse=True)
                for i, job in enumerate(sorted_jobs[:10], 1):
                    f.write(f"\n{i}. [Score: {job['score']}] {job['title']}\n")
                    f.write(f"   Company: {job['company']}\n")
                    f.write(f"   Location: {job['location']}\n")
                    if job.get('salary_min'):
                        f.write(f"   Salary: ${job['salary_min']:,.0f}+\n")
                    f.write(f"   Apply: {job['url']}\n")
                
                f.write(f"\n\nNEXT STEPS\n")
                f.write("-"*60 + "\n")
                f.write("1. Review application materials in materials folder\n")
                f.write("2. Customize if needed\n")
                f.write("3. Apply to high-score jobs first\n")
                f.write("4. Send cold outreach messages\n")
                f.write("5. Update jobs_master.csv when applied\n")
        
        print(f"[OK] Created summary report: {report_path}")
    
    async def run_complete_search(self):
        """Run complete job search workflow"""
        print("\n" + "="*60)
        print("JOBFLOW PERSONAL - COMPLETE JOB SEARCH")
        print("="*60)
        
        # Search for jobs
        jobs = await self.search_jobs()
        
        if not jobs:
            print("\n[ERROR] No new jobs found. Try updating search queries in profile.json")
            return
        
        # Generate materials for top jobs
        print(f"\n[GENERATE] Application materials for top {min(5, len(jobs))} jobs...")
        
        materials = []
        for job in sorted(jobs, key=lambda x: x['score'], reverse=True)[:5]:
            material = await self.generate_application_materials(job)
            materials.append(material)
        
        # Save everything
        self.save_results(jobs, materials)
        
        print("\n" + "="*60)
        print("[COMPLETE] JOB SEARCH FINISHED!")
        print("="*60)
        print(f"\nFound: {len(jobs)} new jobs")
        print(f"High-match (80+): {len([j for j in jobs if j['score'] >= 80])}")
        print(f"\nAll results saved to: data/daily_reports/")
        print(f"Master tracking: data/tracking/jobs_master.csv")
        print("\nNext: Review materials and start applying!")


async def main():
    """Main entry point"""
    system = JobFlowPersonal()
    
    # Check if profile needs updating
    if "Your Full Name" in system.profile['personal']['name']:
        print("\n[ACTION REQUIRED]")
        print("Please edit profile.json with your real information before running.")
        print("Replace all placeholder text with your actual details.")
        return
    
    await system.run_complete_search()


if __name__ == "__main__":
    asyncio.run(main())