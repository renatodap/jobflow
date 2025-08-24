"""
Enhanced Job Finder with Resume Versioning and Duplicate Prevention
- Generates dated CSV files for each search
- Creates appropriate resume versions for each job type
- Prevents duplicate jobs in master tracking
- Assigns resume IDs automatically
"""

import asyncio
import httpx
import json
import csv
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set

class EnhancedJobFinder:
    def __init__(self):
        # API credentials
        self.app_id = '5305c49d'
        self.api_key = '13a9a9862ef8dba5e373ba5f197773ef'
        self.base_url = "https://api.adzuna.com/v1/api/jobs"
        
        # Set up data folders
        Path('data/jobs').mkdir(parents=True, exist_ok=True)
        Path('data/tracking').mkdir(parents=True, exist_ok=True)
        Path('data/resumes').mkdir(parents=True, exist_ok=True)
        Path('data/daily_searches').mkdir(parents=True, exist_ok=True)
        
        # Load existing jobs to prevent duplicates
        self.existing_job_ids = self.load_existing_jobs()
        
        # Resume ID counter
        self.resume_counter = self.get_next_resume_id()
        
        # Resume type mapping
        self.resume_types = {}
        
    def load_existing_jobs(self) -> Set[str]:
        """Load existing job IDs from master CSV to prevent duplicates"""
        existing_ids = set()
        master_csv = Path('data/tracking/jobs_master.csv')
        
        if master_csv.exists():
            with open(master_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if 'job_hash' in row:
                        existing_ids.add(row['job_hash'])
        
        print(f"Loaded {len(existing_ids)} existing jobs to prevent duplicates")
        return existing_ids
    
    def get_next_resume_id(self) -> int:
        """Get the next resume ID by checking existing resumes"""
        resume_dir = Path('data/resumes')
        max_id = -1
        
        if resume_dir.exists():
            for resume_file in resume_dir.glob('renatodap_resume_*_*.txt'):
                try:
                    # Extract ID from filename
                    parts = resume_file.stem.split('_')
                    if len(parts) >= 4:
                        resume_id = int(parts[-1])
                        max_id = max(max_id, resume_id)
                except:
                    continue
        
        return max_id + 1
    
    def generate_job_hash(self, job: Dict) -> str:
        """Generate unique hash for job to prevent duplicates"""
        # Create hash from company + title + location
        unique_string = f"{job.get('company', '')}_{job.get('title', '')}_{job.get('location', '')}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:12]
    
    def determine_resume_type(self, job: Dict) -> str:
        """Determine which resume type to use for this job"""
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()
        category = job.get('category', '').lower()
        
        # Determine job type for resume
        if 'machine learning' in title or 'ml ' in title or 'ai ' in title:
            return 'ml'
        elif 'data scientist' in title or 'data science' in title:
            return 'datascience'
        elif 'data engineer' in title:
            return 'dataeng'
        elif 'backend' in title or 'back-end' in title:
            return 'backend'
        elif 'frontend' in title or 'front-end' in title or 'react' in title:
            return 'frontend'
        elif 'full stack' in title or 'fullstack' in title:
            return 'fullstack'
        elif 'devops' in title or 'sre' in title or 'infrastructure' in title:
            return 'devops'
        elif 'ios' in title or 'swift' in title:
            return 'ios'
        elif 'android' in title or 'kotlin' in title:
            return 'android'
        elif 'cloud' in title or 'aws' in title or 'azure' in title:
            return 'cloud'
        elif 'security' in title or 'cybersecurity' in title:
            return 'security'
        elif 'test' in title or 'qa' in title or 'quality' in title:
            return 'qa'
        elif 'intern' in title:
            return 'intern'
        elif 'graduate' in title or 'new grad' in title or 'entry' in title:
            return 'newgrad'
        else:
            return 'general'
    
    def get_or_create_resume_version(self, job: Dict) -> str:
        """Get existing resume version or assign new one"""
        resume_type = self.determine_resume_type(job)
        
        # Check if we already have a resume for this type
        if resume_type not in self.resume_types:
            # Create new resume version
            resume_id = self.resume_counter
            self.resume_counter += 1
            resume_name = f"renatodap_resume_{resume_type}_{resume_id}"
            self.resume_types[resume_type] = resume_name
            
            # Create the resume file
            self.create_resume_file(resume_name, resume_type, job)
        
        return self.resume_types[resume_type]
    
    def create_resume_file(self, resume_name: str, resume_type: str, sample_job: Dict):
        """Create a resume file tailored for the job type using REAL profile data"""
        resume_path = Path(f'data/resumes/{resume_name}.txt')
        
        # Import ProfileManager to get real candidate data
        from core.services.profile_manager import ProfileManager
        profile = ProfileManager()
        
        # Get keywords from the job for ATS optimization
        keywords = self.extract_keywords_from_job(sample_job)
        
        # Header with real contact info
        header = f"""{profile.get_name().upper()}
{profile.get_email()} | {profile.get_phone()}
{profile.get_github()} | {profile.get_linkedin()}"""
        
        # Education section with real data
        education = f"""EDUCATION
{profile.get_degree()} | GPA: {profile.get_gpa()}
{profile.get_school()} | Graduating {profile.get_graduation()}
Relevant Coursework: {', '.join(profile.get_coursework()[:4])}"""
        
        # Experience section with real data
        experience = f"""EXPERIENCE
{profile.get_experience_summary()}"""
        
        # Projects section with real data
        projects = f"""PROJECTS
{profile.get_projects_summary()}"""
        
        # Strengths with real data
        strengths = f"""UNIQUE QUALIFICATIONS
{chr(10).join(f'• {strength}' for strength in profile.get_strengths())}
• {profile.get_visa_status()}"""
        
        # Resume content based on type with REAL data
        if resume_type == 'ml':
            summary = f"Passionate Machine Learning Engineer with hands-on experience in AI/ML systems. Built FeelSharper (AI fitness platform) with computer vision for real-time form analysis. Strong foundation in {', '.join(profile.get_ai_ml_skills()[:3])}."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
AI/ML: {', '.join(profile.get_ai_ml_skills())}
Frameworks: {', '.join(profile.get_frameworks()[:5])}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: machine learning, ai, python, {', '.join(profile.get_ai_ml_skills()[:5]).lower()}"
        
        elif resume_type == 'backend':
            summary = f"Backend engineer with expertise in building scalable APIs and microservices. Built JobFlow automation system with FastAPI and created financial models automation at Virtus BR Partners."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Backend: {', '.join([f for f in profile.get_frameworks() if f in ['FastAPI', 'Django', 'Spring Boot', 'Node.js']])}
Databases: {', '.join(profile.get_databases())}
Cloud: {', '.join(profile.get_cloud_skills())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: backend, api, python, {', '.join(profile.get_databases()[:3]).lower()}, microservices"
        
        elif resume_type == 'frontend':
            summary = f"Frontend developer passionate about creating exceptional user experiences. Built FeelSharper's responsive interface using Next.js and TypeScript with real-time computer vision integration."
            tech_skills = f"""TECHNICAL SKILLS
Frontend: React, Next.js, TypeScript, JavaScript, HTML5, CSS3
Frameworks: {', '.join([f for f in profile.get_frameworks() if f in ['React', 'Next.js', 'Vue.js']])}
Tools: {', '.join(profile.get_tools()[:6])}
Design: Tailwind CSS, Responsive Design, UI/UX"""
            keywords_section = "KEYWORDS: frontend, react, next.js, typescript, javascript, ui, ux"
        
        elif resume_type == 'fullstack':
            summary = f"Full stack engineer with experience across the entire development stack. Built FeelSharper (AI fitness platform) from concept to deployment using Next.js, FastAPI, and advanced AI integration."
            tech_skills = f"""TECHNICAL SKILLS
Frontend: {', '.join([f for f in profile.get_frameworks() if f in ['React', 'Next.js']])}
Backend: {', '.join([f for f in profile.get_frameworks() if f in ['FastAPI', 'Django', 'Node.js']])}
Languages: {', '.join(profile.get_programming_languages())}
Databases: {', '.join(profile.get_databases())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = "KEYWORDS: full stack, react, next.js, python, fastapi, typescript"
        
        elif resume_type == 'dataeng':
            summary = f"Data engineer with experience in building automated systems and data processing pipelines. Built JobFlow's intelligent job discovery system and automated financial model generation at Virtus BR Partners."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Data: SQL, {', '.join(profile.get_databases())}, Data Pipelines
Cloud: {', '.join(profile.get_cloud_skills())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: data engineer, python, sql, {', '.join(profile.get_databases()[:3]).lower()}, etl"
        
        elif resume_type == 'datascience':
            summary = f"Data scientist with strong foundation in AI/ML and statistical analysis. Built FeelSharper's computer vision system for real-time form analysis and created predictive models for investment banking."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
AI/ML: {', '.join(profile.get_ai_ml_skills())}
Data Science: SQL, Data Analysis, Statistical Modeling
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: data science, machine learning, python, {', '.join(profile.get_ai_ml_skills()[:3]).lower()}"
        
        elif resume_type == 'newgrad':
            summary = f"Computer Science student graduating {profile.get_graduation()} with hands-on experience in AI/ML, full-stack development, and team leadership. Built innovative projects including FeelSharper and JobFlow while maintaining strong academic performance."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Frameworks: {', '.join(profile.get_frameworks()[:6])}
Tools: {', '.join(profile.get_tools()[:6])}
Databases: {', '.join(profile.get_databases())}"""
            keywords_section = f"KEYWORDS: new grad, software engineer, {profile.get_graduation().split()[-1]}, computer science"
        
        else:  # general
            summary = f"Versatile software engineer with experience across multiple domains including AI/ML, web development, and automation. Strong problem-solving skills demonstrated through innovative projects and international business experience."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Frameworks: {', '.join(profile.get_frameworks()[:6])}
Tools: {', '.join(profile.get_tools()[:6])}
Databases: {', '.join(profile.get_databases())}"""
            keywords_section = "KEYWORDS: software engineer, python, typescript, full stack, ai"
        
        # Combine all sections
        resume_content = f"""{header}

SUMMARY
{summary}

{tech_skills}

{education}

{experience}

{projects}

{strengths}

{keywords_section}, {', '.join(keywords[:5]).lower()}"""
        
        # Write the resume file
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(resume_content)
        
        print(f"Created resume: {resume_name} for {resume_type} positions")
    
    def extract_keywords_from_job(self, job: Dict) -> list:
        """Extract keywords from job for ATS optimization"""
        description = f"{job.get('title', '')} {job.get('description', '')}".lower()
        
        keywords = []
        skill_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'nodejs',
            'sql', 'postgresql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git',
            'machine learning', 'ai', 'ml', 'deep learning', 'tensorflow', 'pytorch',
            'fastapi', 'django', 'flask', 'spring', 'express', 'next.js', 'nextjs',
            'vue', 'angular', 'html', 'css', 'sass', 'graphql', 'rest', 'api',
            'ci/cd', 'agile', 'scrum', 'jira', 'linux', 'bash', 'cloud', 'azure', 'gcp'
        ]
        
        for skill in skill_keywords:
            if skill in description:
                keywords.append(skill.title() if len(skill) > 3 else skill.upper())
        
        return keywords[:10]

    def extract_keywords(self, job: Dict) -> List[str]:
        """Extract relevant keywords from job posting"""
        text = f"{job.get('title', '')} {job.get('description', '')}".lower()
        
        # Common tech keywords to look for
        tech_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'node',
            'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'git',
            'agile', 'scrum', 'rest', 'api', 'microservices',
            'machine learning', 'ai', 'data science', 'cloud'
        ]
        
        found = []
        for keyword in tech_keywords:
            if keyword in text:
                found.append(keyword)
        
        return found[:10]  # Limit to 10 keywords
    
    async def search_jobs(self, query: str, location: str = "", limit: int = 20):
        """Search for jobs using Adzuna"""
        print(f"\nSearching for: {query}")
        
        url = f"{self.base_url}/us/search/1"
        
        params = {
            'app_id': self.app_id,
            'app_key': self.api_key,
            'results_per_page': limit,
            'what': query,
            'content-type': 'application/json',
            'max_days_old': 30,
            'sort_by': 'date'
        }
        
        if location:
            params['where'] = location
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                jobs = []
                new_jobs = 0
                duplicates = 0
                
                for item in data.get('results', []):
                    job = {
                        'title': item.get('title', ''),
                        'company': item.get('company', {}).get('display_name', ''),
                        'location': item.get('location', {}).get('display_name', ''),
                        'salary_min': item.get('salary_min'),
                        'salary_max': item.get('salary_max'),
                        'url': item.get('redirect_url', ''),
                        'description': item.get('description', '')[:500],
                        'created': item.get('created'),
                        'category': item.get('category', {}).get('label', ''),
                        'contract_type': item.get('contract_type', ''),
                        'contract_time': item.get('contract_time', '')
                    }
                    
                    # Generate job hash
                    job['job_hash'] = self.generate_job_hash(job)
                    
                    # Check for duplicate
                    if job['job_hash'] in self.existing_job_ids:
                        duplicates += 1
                        continue  # Skip duplicate
                    
                    # Add to existing IDs
                    self.existing_job_ids.add(job['job_hash'])
                    new_jobs += 1
                    
                    # Calculate days old
                    if job['created']:
                        try:
                            created_date = datetime.fromisoformat(job['created'].replace('Z', '+00:00'))
                            days_old = (datetime.now() - created_date.replace(tzinfo=None)).days
                            job['days_old'] = days_old
                        except:
                            job['days_old'] = None
                    
                    # Score the job
                    job['score'] = self.score_job(job)
                    
                    # Assign resume version
                    job['resume_version'] = self.get_or_create_resume_version(job)
                    
                    # Add discovery timestamp
                    job['discovered_at'] = datetime.now().isoformat()
                    
                    jobs.append(job)
                
                print(f"  Found: {len(data.get('results', []))} total, {new_jobs} new, {duplicates} duplicates skipped")
                return jobs
                
            except Exception as e:
                print(f"  Error: {e}")
                return []
    
    def score_job(self, job):
        """Score job based on various factors"""
        score = 50
        
        title = job.get('title', '').lower()
        
        # Experience level
        if any(word in title for word in ['senior', 'lead', 'principal', 'staff', 'architect']):
            score -= 25
        elif any(word in title for word in ['junior', 'entry', 'graduate', 'new grad', 'early career']):
            score += 25
        elif any(word in title for word in ['intern', 'internship']):
            score += 15
        elif 'mid' in title or 'ii' in title:
            score -= 10
        
        # Salary
        salary_min = job.get('salary_min', 0)
        if salary_min:
            if salary_min >= 150000:
                score += 25
            elif salary_min >= 120000:
                score += 20
            elif salary_min >= 100000:
                score += 15
            elif salary_min >= 80000:
                score += 10
            elif salary_min >= 60000:
                score += 5
        
        # Freshness
        days_old = job.get('days_old')
        if days_old is not None:
            if days_old <= 3:
                score += 20
            elif days_old <= 7:
                score += 15
            elif days_old <= 14:
                score += 10
            elif days_old <= 30:
                score += 5
        
        # Contract type
        contract_time = job.get('contract_time', '').lower()
        if 'full_time' in contract_time or 'full' in contract_time:
            score += 10
        
        return min(max(score, 0), 100)
    
    def save_daily_csv(self, jobs: List[Dict]) -> str:
        """Save jobs to dated CSV file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        csv_path = Path(f'data/daily_searches/jobs_{timestamp}.csv')
        
        if jobs:
            fieldnames = ['job_hash', 'score', 'title', 'company', 'location', 
                         'salary_min', 'salary_max', 'days_old', 'resume_version',
                         'url', 'contract_type', 'category', 'description', 'discovered_at']
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                
                sorted_jobs = sorted(jobs, key=lambda x: x.get('score', 0), reverse=True)
                for job in sorted_jobs:
                    writer.writerow(job)
        
        print(f"\nSaved daily search to: {csv_path}")
        return str(csv_path)
    
    def update_master_csv(self, jobs: List[Dict]):
        """Update master CSV with new jobs only"""
        master_csv = Path('data/tracking/jobs_master.csv')
        
        # Read existing data if file exists
        existing_data = []
        fieldnames = ['job_hash', 'score', 'title', 'company', 'location', 
                     'salary_min', 'salary_max', 'days_old', 'resume_version',
                     'url', 'contract_type', 'category', 'description', 
                     'discovered_at', 'applied', 'application_date', 'status', 'notes']
        
        if master_csv.exists():
            with open(master_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                existing_data = list(reader)
                if reader.fieldnames:
                    fieldnames = reader.fieldnames
        
        # Add new jobs
        for job in jobs:
            # Add application tracking fields
            job['applied'] = 'No'
            job['application_date'] = ''
            job['status'] = 'New'
            job['notes'] = ''
            existing_data.append(job)
        
        # Sort by score and write back
        existing_data.sort(key=lambda x: int(x.get('score', 0)), reverse=True)
        
        with open(master_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(existing_data)
        
        print(f"Updated master CSV: {master_csv}")
        print(f"  Total jobs tracked: {len(existing_data)}")
    
    def display_results(self, all_jobs: List[Dict]):
        """Display search results summary"""
        if not all_jobs:
            print("\nNo new jobs found!")
            return
        
        sorted_jobs = sorted(all_jobs, key=lambda x: x.get('score', 0), reverse=True)
        
        print(f"\n{'='*80}")
        print(f"FOUND {len(all_jobs)} NEW JOBS (duplicates filtered)")
        print(f"{'='*80}")
        
        # Show top 10
        print("\nTOP 10 NEW JOBS:")
        print("-" * 80)
        
        for i, job in enumerate(sorted_jobs[:10], 1):
            print(f"\n{i}. [Score: {job['score']}] {job['title']}")
            print(f"   Company: {job['company']}")
            print(f"   Location: {job['location']}")
            print(f"   Resume: {job['resume_version']}")
            
            if job.get('salary_min'):
                if job.get('salary_max'):
                    print(f"   Salary: ${job['salary_min']:,.0f} - ${job['salary_max']:,.0f}")
                else:
                    print(f"   Salary: ${job['salary_min']:,.0f}+")
            
            if job.get('days_old') is not None:
                print(f"   Posted: {job['days_old']} days ago")
        
        # Resume summary
        print(f"\n{'='*80}")
        print("RESUME VERSIONS CREATED:")
        print("-" * 80)
        for resume_type, resume_name in self.resume_types.items():
            count = len([j for j in all_jobs if j['resume_version'] == resume_name])
            print(f"  {resume_name}: {count} jobs ({resume_type})")
        
        print(f"\n  Total unique resume versions: {len(self.resume_types)}")

async def main():
    """Run enhanced job search"""
    print("\n" + "="*80)
    print("ENHANCED JOB FINDER - WITH RESUME VERSIONING")
    print("="*80)
    
    finder = EnhancedJobFinder()
    
    # Search queries
    queries = [
        "software engineer new grad 2025",
        "software engineer new grad 2026",
        "software engineer entry level",
        "software developer junior",
        "python developer entry level",
        "full stack developer junior",
        "backend engineer entry level",
        "frontend developer junior",
        "machine learning engineer entry",
        "data engineer junior",
        "data scientist entry level",
        "devops engineer junior",
        "cloud engineer entry level",
        "software engineer intern 2025"
    ]
    
    all_new_jobs = []
    
    print("\nSearching for jobs (duplicates will be filtered)...")
    print("-" * 80)
    
    for query in queries:
        jobs = await finder.search_jobs(query, location="", limit=15)
        all_new_jobs.extend(jobs)
        await asyncio.sleep(0.5)  # Rate limiting
    
    # Display results
    finder.display_results(all_new_jobs)
    
    # Save to CSVs
    if all_new_jobs:
        # Save daily CSV with timestamp
        daily_file = finder.save_daily_csv(all_new_jobs)
        
        # Update master CSV
        finder.update_master_csv(all_new_jobs)
        
        print(f"\n{'='*80}")
        print("FILES CREATED:")
        print(f"1. Daily search: {daily_file}")
        print(f"2. Master tracking: data/tracking/jobs_master.csv")
        print(f"3. Resume versions: data/resumes/renatodap_resume_*.txt")
        
        print(f"\n{'='*80}")
        print("NEXT STEPS:")
        print("1. Review new jobs in the dated CSV file")
        print("2. Check resume assignments in 'resume_version' column")
        print("3. Master CSV tracks all jobs (no duplicates)")
        print("4. Apply to high-score jobs using assigned resumes")
        print(f"{'='*80}")
    else:
        print("\nNo new jobs found - all were duplicates of existing jobs")

if __name__ == "__main__":
    asyncio.run(main())