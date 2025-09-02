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
        """Create a resume file tailored for the job type"""
        resume_path = Path(f'data/resumes/{resume_name}.txt')
        
        # Resume templates based on type
        templates = {
            'ml': """RENATO DAP
Machine Learning Engineer | AI Systems Developer
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Passionate Machine Learning Engineer with strong foundation in deep learning, NLP, and computer vision. 
Experience with PyTorch, TensorFlow, and scalable ML systems. Seeking to apply AI expertise to solve real-world problems.

TECHNICAL SKILLS
Languages: Python, R, SQL, Java, C++
ML/AI: PyTorch, TensorFlow, Scikit-learn, Keras, OpenCV, NLTK, SpaCy
Tools: Docker, Kubernetes, AWS SageMaker, MLflow, Weights & Biases
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch

EDUCATION
Bachelor of Science in Computer Science | University Name | 2026
- Relevant Courses: Machine Learning, Deep Learning, Computer Vision, NLP
- GPA: 3.8/4.0

EXPERIENCE
ML Engineering Intern | Tech Company | Summer 2025
- Developed and deployed recommendation system serving 1M+ users
- Improved model accuracy by 15% through feature engineering
- Built data pipelines processing 100GB+ daily

PROJECTS
Neural Network Image Classifier
- Built CNN achieving 95% accuracy on custom dataset
- Deployed model using FastAPI and Docker
""",
            'backend': """RENATO DAP
Backend Software Engineer | Distributed Systems Developer
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Backend engineer with expertise in building scalable APIs and microservices. 
Strong experience with cloud infrastructure, databases, and system design.

TECHNICAL SKILLS
Languages: Python, Java, Go, JavaScript, SQL
Frameworks: Django, FastAPI, Spring Boot, Express.js
Databases: PostgreSQL, MySQL, MongoDB, Redis, Cassandra
Cloud/DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform

EDUCATION
Bachelor of Science in Computer Science | University Name | 2026
- Focus: Distributed Systems and Database Design
- GPA: 3.8/4.0

EXPERIENCE
Backend Engineering Intern | Tech Company | Summer 2025
- Designed RESTful APIs handling 10K+ requests/second
- Optimized database queries reducing latency by 40%
- Implemented microservices architecture using Docker/Kubernetes

PROJECTS
Distributed Task Queue System
- Built high-throughput task processing system
- Implemented using Redis and Python with 99.9% uptime
""",
            'frontend': """RENATO DAP
Frontend Software Engineer | UI/UX Developer
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Frontend developer passionate about creating intuitive user experiences.
Expertise in modern JavaScript frameworks and responsive design.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, HTML5, CSS3, Python
Frameworks: React, Vue.js, Angular, Next.js, Redux
Tools: Webpack, Babel, Jest, Cypress, Figma, Git
Design: Responsive Design, Accessibility (WCAG), Material-UI, Tailwind

EDUCATION
Bachelor of Science in Computer Science | University Name | 2026
- Focus: Human-Computer Interaction
- GPA: 3.8/4.0

EXPERIENCE
Frontend Development Intern | Tech Company | Summer 2025
- Built responsive React components used by 100K+ users
- Improved page load time by 50% through optimization
- Collaborated with designers to implement pixel-perfect UIs

PROJECTS
E-commerce Platform Frontend
- Developed full-featured shopping site with React and Redux
- Implemented real-time updates using WebSockets
""",
            'fullstack': """RENATO DAP
Full Stack Software Engineer
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Full stack engineer with experience across the entire web development stack.
Comfortable with both frontend frameworks and backend services.

TECHNICAL SKILLS
Frontend: React, TypeScript, HTML/CSS, Redux, Next.js
Backend: Node.js, Python, Django, Express, GraphQL
Databases: PostgreSQL, MongoDB, Redis
DevOps: Docker, AWS, CI/CD, Nginx

EDUCATION
Bachelor of Science in Computer Science | University Name | 2026
- Full Stack Web Development Focus
- GPA: 3.8/4.0

EXPERIENCE
Full Stack Engineering Intern | Tech Company | Summer 2025
- Developed end-to-end features from database to UI
- Built RESTful APIs and React frontends
- Deployed applications using Docker and AWS

PROJECTS
Social Media Platform Clone
- Built Twitter-like app with React, Node.js, and PostgreSQL
- Implemented real-time messaging with Socket.io
""",
            'newgrad': """RENATO DAP
Software Engineer - New Graduate 2026
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Recent Computer Science graduate with strong foundation in software engineering.
Internship experience at leading tech companies. Eager to contribute to innovative projects.

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, C++, SQL
Web: React, Node.js, HTML/CSS, REST APIs
Tools: Git, Docker, Linux, Agile/Scrum
Databases: PostgreSQL, MongoDB, MySQL

EDUCATION
Bachelor of Science in Computer Science | University Name | Expected: May 2026
- GPA: 3.8/4.0
- Relevant Courses: Data Structures, Algorithms, Software Engineering, Databases

EXPERIENCE
Software Engineering Intern | Major Tech Company | Summer 2025
- Developed features for product used by millions
- Collaborated with cross-functional teams
- Participated in code reviews and design discussions

Software Development Intern | Startup | Summer 2024
- Built full-stack web applications
- Worked in fast-paced agile environment

PROJECTS
Multiple significant projects demonstrating various skills
- Web applications, mobile apps, and system tools
- Open source contributions on GitHub
""",
            'general': """RENATO DAP
Software Engineer
Email: renatodap@example.com | Phone: 555-0100 | LinkedIn: linkedin.com/in/renatodap

SUMMARY
Versatile software engineer with experience in multiple technologies and domains.
Strong problem-solving skills and ability to learn quickly.

TECHNICAL SKILLS
Programming: Python, Java, JavaScript, C++, SQL
Web Technologies: React, Node.js, Django, REST APIs
Tools & Platforms: Git, Docker, Linux, AWS, Agile
Databases: PostgreSQL, MongoDB, MySQL, Redis

EDUCATION
Bachelor of Science in Computer Science | University Name | 2026
- GPA: 3.8/4.0
- Dean's List, Multiple Semesters

EXPERIENCE
Software Engineering Intern | Tech Company | Summer 2025
- Developed and maintained software applications
- Collaborated with team on various projects
- Gained experience in full software development lifecycle

Previous Internship | Company | Summer 2024
- Worked on challenging technical problems
- Contributed to team success

PROJECTS
Portfolio of diverse projects showcasing technical skills
- Web applications, APIs, and tools
- Available on GitHub portfolio
"""
        }
        
        # Get appropriate template
        resume_content = templates.get(resume_type, templates['general'])
        
        # Add job-specific keywords at the bottom
        keywords = self.extract_keywords(sample_job)
        if keywords:
            resume_content += f"\nKEYWORDS: {', '.join(keywords)}"
        
        # Save resume
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(resume_content)
        
        print(f"  Created resume: {resume_name} for {resume_type} positions")
    
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