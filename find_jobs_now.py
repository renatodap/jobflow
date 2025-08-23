"""
Quick Job Search - Find Jobs Now
Uses the API keys already in the code to find real jobs
"""

import asyncio
import httpx
import json
import csv
from datetime import datetime
from pathlib import Path

class QuickJobFinder:
    def __init__(self):
        # Use the keys that are already in the adzuna_job_search.py file
        self.app_id = '5305c49d'
        self.api_key = '13a9a9862ef8dba5e373ba5f197773ef'
        self.base_url = "https://api.adzuna.com/v1/api/jobs"
        
        # Set up data folders
        Path('data/jobs').mkdir(parents=True, exist_ok=True)
        Path('data/tracking').mkdir(parents=True, exist_ok=True)
        
    async def search_jobs(self, query: str, location: str = "", limit: int = 20):
        """Search for jobs using Adzuna"""
        print(f"\nSearching for: {query}")
        print("-" * 40)
        
        url = f"{self.base_url}/us/search/1"
        
        params = {
            'app_id': self.app_id,
            'app_key': self.api_key,
            'results_per_page': limit,
            'what': query,
            'content-type': 'application/json'
        }
        
        if location:
            params['where'] = location
            
        # Add filters for better results
        params['max_days_old'] = 30  # Only recent jobs
        params['sort_by'] = 'date'  # Newest first
        
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
                        'description': item.get('description', '')[:500],
                        'created': item.get('created'),
                        'category': item.get('category', {}).get('label', ''),
                        'contract_type': item.get('contract_type', ''),
                        'contract_time': item.get('contract_time', '')
                    }
                    
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
                    
                    jobs.append(job)
                
                return jobs
                
            except Exception as e:
                print(f"Error searching: {e}")
                return []
    
    def score_job(self, job):
        """Score job based on various factors"""
        score = 50  # Base score
        
        title = job.get('title', '').lower()
        
        # Experience level scoring
        if any(word in title for word in ['senior', 'lead', 'principal', 'staff']):
            score -= 20  # Too senior
        elif any(word in title for word in ['junior', 'entry', 'graduate', 'new grad', 'early career']):
            score += 25  # Good for entry level
        elif any(word in title for word in ['intern', 'internship']):
            score += 15  # Internships are good too
        
        # Salary scoring
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
        
        # Freshness scoring
        days_old = job.get('days_old')
        if days_old is not None:
            if days_old <= 3:
                score += 20  # Very fresh
            elif days_old <= 7:
                score += 15
            elif days_old <= 14:
                score += 10
            elif days_old <= 30:
                score += 5
        
        # Contract type scoring
        contract_time = job.get('contract_time', '').lower()
        if 'full_time' in contract_time or 'full' in contract_time:
            score += 10
        
        return min(score, 100)  # Cap at 100
    
    def save_to_csv(self, jobs):
        """Save jobs to CSV file"""
        csv_path = Path('data/tracking/jobs_found.csv')
        
        # Write CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            if jobs:
                fieldnames = ['score', 'title', 'company', 'location', 'salary_min', 'salary_max', 
                             'days_old', 'url', 'contract_type', 'category', 'description']
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                
                # Sort by score
                sorted_jobs = sorted(jobs, key=lambda x: x.get('score', 0), reverse=True)
                
                for job in sorted_jobs:
                    writer.writerow(job)
        
        print(f"\nSaved to: {csv_path}")
        
    def display_results(self, all_jobs):
        """Display job search results"""
        
        if not all_jobs:
            print("\nNo jobs found!")
            return
            
        # Sort by score
        sorted_jobs = sorted(all_jobs, key=lambda x: x.get('score', 0), reverse=True)
        
        print(f"\n{'='*80}")
        print(f"FOUND {len(all_jobs)} JOBS")
        print(f"{'='*80}")
        
        # Show top 10 jobs
        print("\nTOP 10 JOBS BY SCORE:")
        print("-" * 80)
        
        for i, job in enumerate(sorted_jobs[:10], 1):
            print(f"\n{i}. [Score: {job['score']}] {job['title']}")
            print(f"   Company: {job['company']}")
            print(f"   Location: {job['location']}")
            
            if job.get('salary_min'):
                if job.get('salary_max'):
                    print(f"   Salary: ${job['salary_min']:,.0f} - ${job['salary_max']:,.0f}")
                else:
                    print(f"   Salary: ${job['salary_min']:,.0f}+")
            
            if job.get('days_old') is not None:
                print(f"   Posted: {job['days_old']} days ago")
            
            if job.get('contract_type'):
                print(f"   Type: {job['contract_type']}")
                
            print(f"   Apply: {job['url'][:70]}...")
        
        # Show score distribution
        print(f"\n{'='*80}")
        print("SCORE DISTRIBUTION:")
        print("-" * 80)
        
        high_score = len([j for j in all_jobs if j.get('score', 0) >= 80])
        med_score = len([j for j in all_jobs if 60 <= j.get('score', 0) < 80])
        low_score = len([j for j in all_jobs if j.get('score', 0) < 60])
        
        print(f"High Match (80-100): {high_score} jobs")
        print(f"Medium Match (60-79): {med_score} jobs")
        print(f"Low Match (0-59): {low_score} jobs")
        
        # Show salary ranges
        print(f"\n{'='*80}")
        print("SALARY RANGES:")
        print("-" * 80)
        
        salaried_jobs = [j for j in all_jobs if j.get('salary_min')]
        if salaried_jobs:
            high_sal = len([j for j in salaried_jobs if j.get('salary_min', 0) >= 120000])
            med_sal = len([j for j in salaried_jobs if 80000 <= j.get('salary_min', 0) < 120000])
            low_sal = len([j for j in salaried_jobs if j.get('salary_min', 0) < 80000])
            
            print(f"$120k+: {high_sal} jobs")
            print(f"$80k-$120k: {med_sal} jobs")
            print(f"Under $80k: {low_sal} jobs")
            print(f"No salary listed: {len(all_jobs) - len(salaried_jobs)} jobs")

async def main():
    """Run job search"""
    print("\n" + "="*80)
    print("JOBFLOW - FINDING REAL JOBS NOW")
    print("="*80)
    
    finder = QuickJobFinder()
    
    # Search queries - targeting entry level and new grad positions
    queries = [
        "software engineer new grad 2025",
        "software engineer entry level",
        "software developer junior",
        "python developer entry level",
        "full stack developer junior",
        "backend engineer new grad",
        "frontend developer entry level",
        "data engineer junior",
        "machine learning engineer entry",
        "software engineer early career"
    ]
    
    all_jobs = []
    seen_urls = set()
    
    print("\nSearching multiple queries to find the best matches...")
    
    for query in queries:
        jobs = await finder.search_jobs(query, location="", limit=10)
        
        # Deduplicate
        for job in jobs:
            if job['url'] not in seen_urls:
                seen_urls.add(job['url'])
                all_jobs.append(job)
        
        print(f"  Found {len(jobs)} jobs")
        
        # Rate limiting
        await asyncio.sleep(0.5)
    
    # Display results
    finder.display_results(all_jobs)
    
    # Save to CSV
    finder.save_to_csv(all_jobs)
    
    print(f"\n{'='*80}")
    print("NEXT STEPS:")
    print("1. Review jobs in: data/tracking/jobs_found.csv")
    print("2. Click on job URLs to apply")
    print("3. Top scoring jobs are your best matches")
    print(f"{'='*80}")

if __name__ == "__main__":
    asyncio.run(main())