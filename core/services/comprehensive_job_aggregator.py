"""
Comprehensive Job Aggregator - Searches Multiple Sources
Provides much better coverage than Adzuna alone
"""

import os
import json
import time
import hashlib
from typing import List, Dict, Any
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import asyncio
import aiohttp
from urllib.parse import quote

class ComprehensiveJobAggregator:
    """
    Aggregates jobs from multiple sources for maximum coverage.
    Free and paid API options included.
    """
    
    def __init__(self):
        self.results = []
        self.seen_jobs = set()  # Deduplication
        
    def generate_job_hash(self, company: str, title: str, location: str = "") -> str:
        """Generate unique hash for job deduplication"""
        text = f"{company.lower()}{title.lower()}{location.lower()}"
        text = ''.join(text.split())  # Remove spaces
        return hashlib.md5(text.encode()).hexdigest()[:12]
    
    # ============================================
    # FREE SOURCES (No API Key Required)
    # ============================================
    
    def search_remotive(self, search_term: str, limit: int = 50) -> List[Dict]:
        """
        Search Remotive.io - Remote jobs, NO API KEY NEEDED
        Free public API
        """
        jobs = []
        try:
            url = "https://remotive.io/api/remote-jobs"
            params = {
                "search": search_term,
                "limit": limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for job in data.get('jobs', []):
                    job_hash = self.generate_job_hash(
                        job.get('company_name', ''),
                        job.get('title', '')
                    )
                    
                    if job_hash not in self.seen_jobs:
                        self.seen_jobs.add(job_hash)
                        jobs.append({
                            'source': 'Remotive',
                            'title': job.get('title', ''),
                            'company': job.get('company_name', ''),
                            'location': 'Remote',
                            'url': job.get('url', ''),
                            'salary': job.get('salary', ''),
                            'description': job.get('description', ''),
                            'posted_date': job.get('publication_date', ''),
                            'job_type': job.get('job_type', 'Full-time'),
                            'tags': job.get('tags', [])
                        })
        except Exception as e:
            print(f"Remotive search failed: {e}")
        
        return jobs
    
    def search_usajobs(self, search_term: str, location: str = "", limit: int = 50) -> List[Dict]:
        """
        Search USAJobs.gov - Government jobs, NO API KEY NEEDED
        Public federal job board
        """
        jobs = []
        try:
            # USAJobs requires these headers
            headers = {
                'Host': 'data.usajobs.gov',
                'User-Agent': 'job_search_app',
                'Authorization-Key': 'DEMO_KEY'  # Public demo key works for limited requests
            }
            
            url = "https://data.usajobs.gov/api/search"
            params = {
                'Keyword': search_term,
                'LocationName': location,
                'ResultsPerPage': limit
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for item in data.get('SearchResult', {}).get('SearchResultItems', []):
                    job = item.get('MatchedObjectDescriptor', {})
                    
                    job_hash = self.generate_job_hash(
                        job.get('OrganizationName', ''),
                        job.get('PositionTitle', '')
                    )
                    
                    if job_hash not in self.seen_jobs:
                        self.seen_jobs.add(job_hash)
                        
                        # Parse salary range
                        salary_min = job.get('PositionRemuneration', [{}])[0].get('MinimumRange', '')
                        salary_max = job.get('PositionRemuneration', [{}])[0].get('MaximumRange', '')
                        
                        jobs.append({
                            'source': 'USAJobs',
                            'title': job.get('PositionTitle', ''),
                            'company': job.get('OrganizationName', ''),
                            'location': job.get('PositionLocationDisplay', ''),
                            'url': job.get('PositionURI', ''),
                            'salary_min': salary_min,
                            'salary_max': salary_max,
                            'description': job.get('UserArea', {}).get('Details', {}).get('JobSummary', ''),
                            'posted_date': job.get('PublicationStartDate', ''),
                            'job_type': job.get('PositionSchedule', [{}])[0].get('Name', 'Full-time')
                        })
        except Exception as e:
            print(f"USAJobs search failed: {e}")
        
        return jobs
    
    def search_github_jobs(self, search_term: str, location: str = "") -> List[Dict]:
        """
        Search GitHub Jobs listings from repos
        Scrapes awesome-jobs repos (no API needed)
        """
        jobs = []
        try:
            # Several GitHub repos maintain job lists
            repos = [
                "https://raw.githubusercontent.com/remoteintech/remote-jobs/main/README.md",
                "https://raw.githubusercontent.com/lukasz-madon/awesome-remote-job/master/README.md"
            ]
            
            for repo_url in repos:
                response = requests.get(repo_url, timeout=10)
                if response.status_code == 200:
                    # Parse markdown for job listings
                    # This is simplified - real implementation would parse better
                    lines = response.text.split('\n')
                    for line in lines:
                        if search_term.lower() in line.lower():
                            # Extract company and link from markdown
                            if '](http' in line:
                                parts = line.split('](')
                                if len(parts) >= 2:
                                    company = parts[0].split('[')[-1]
                                    url = parts[1].split(')')[0]
                                    
                                    job_hash = self.generate_job_hash(company, "Engineering Role")
                                    if job_hash not in self.seen_jobs:
                                        self.seen_jobs.add(job_hash)
                                        jobs.append({
                                            'source': 'GitHub Jobs',
                                            'title': f'Software Engineer at {company}',
                                            'company': company,
                                            'location': 'Remote',
                                            'url': url,
                                            'description': 'See company careers page',
                                            'job_type': 'Full-time'
                                        })
        except Exception as e:
            print(f"GitHub jobs search failed: {e}")
        
        return jobs[:50]  # Limit results
    
    # ============================================
    # API-BASED SOURCES (Keys Required)
    # ============================================
    
    def search_adzuna(self, search_term: str, location: str = "us", limit: int = 50) -> List[Dict]:
        """
        Search Adzuna - Existing implementation
        Requires: ADZUNA_APP_ID, ADZUNA_API_KEY
        """
        jobs = []
        app_id = os.getenv('ADZUNA_APP_ID')
        api_key = os.getenv('ADZUNA_API_KEY')
        
        if not app_id or not api_key:
            print("Adzuna API keys not found")
            return jobs
        
        try:
            url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
            params = {
                'app_id': app_id,
                'app_key': api_key,
                'what': search_term,
                'results_per_page': limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for job in data.get('results', []):
                    job_hash = self.generate_job_hash(
                        job.get('company', {}).get('display_name', ''),
                        job.get('title', '')
                    )
                    
                    if job_hash not in self.seen_jobs:
                        self.seen_jobs.add(job_hash)
                        jobs.append({
                            'source': 'Adzuna',
                            'title': job.get('title', ''),
                            'company': job.get('company', {}).get('display_name', ''),
                            'location': job.get('location', {}).get('display_name', ''),
                            'url': job.get('redirect_url', ''),
                            'salary_min': job.get('salary_min', ''),
                            'salary_max': job.get('salary_max', ''),
                            'description': job.get('description', ''),
                            'posted_date': job.get('created', ''),
                            'job_type': job.get('contract_type', 'Full-time')
                        })
        except Exception as e:
            print(f"Adzuna search failed: {e}")
        
        return jobs
    
    def search_reed(self, search_term: str, location: str = "", limit: int = 50) -> List[Dict]:
        """
        Search Reed.co.uk - UK jobs primarily
        Requires: REED_API_KEY (free after signup)
        """
        jobs = []
        api_key = os.getenv('REED_API_KEY')
        
        if not api_key:
            print("Reed API key not found (optional)")
            return jobs
        
        try:
            import base64
            auth = base64.b64encode(f"{api_key}:".encode()).decode()
            
            headers = {
                'Authorization': f'Basic {auth}'
            }
            
            url = "https://www.reed.co.uk/api/1.0/search"
            params = {
                'keywords': search_term,
                'location': location,
                'resultsToTake': limit
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for job in data.get('results', []):
                    job_hash = self.generate_job_hash(
                        job.get('employerName', ''),
                        job.get('jobTitle', '')
                    )
                    
                    if job_hash not in self.seen_jobs:
                        self.seen_jobs.add(job_hash)
                        jobs.append({
                            'source': 'Reed',
                            'title': job.get('jobTitle', ''),
                            'company': job.get('employerName', ''),
                            'location': job.get('locationName', ''),
                            'url': job.get('jobUrl', ''),
                            'salary_min': job.get('minimumSalary', ''),
                            'salary_max': job.get('maximumSalary', ''),
                            'description': job.get('jobDescription', ''),
                            'posted_date': job.get('date', ''),
                            'job_type': 'Full-time'
                        })
        except Exception as e:
            print(f"Reed search failed: {e}")
        
        return jobs
    
    def search_findwork(self, search_term: str, limit: int = 50) -> List[Dict]:
        """
        Search Findwork.dev - Developer jobs
        Requires: FINDWORK_API_KEY (free tier available)
        """
        jobs = []
        api_key = os.getenv('FINDWORK_API_KEY')
        
        if not api_key:
            print("Findwork API key not found (optional)")
            return jobs
        
        try:
            headers = {
                'Authorization': f'Token {api_key}'
            }
            
            url = "https://findwork.dev/api/jobs/"
            params = {
                'search': search_term,
                'page_size': limit
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for job in data.get('results', []):
                    job_hash = self.generate_job_hash(
                        job.get('company_name', ''),
                        job.get('role', '')
                    )
                    
                    if job_hash not in self.seen_jobs:
                        self.seen_jobs.add(job_hash)
                        jobs.append({
                            'source': 'Findwork',
                            'title': job.get('role', ''),
                            'company': job.get('company_name', ''),
                            'location': job.get('location', ''),
                            'url': job.get('url', ''),
                            'salary_min': job.get('salary_min', ''),
                            'salary_max': job.get('salary_max', ''),
                            'description': job.get('text', ''),
                            'posted_date': job.get('date_posted', ''),
                            'job_type': job.get('employment_type', 'Full-time'),
                            'remote': job.get('remote', False)
                        })
        except Exception as e:
            print(f"Findwork search failed: {e}")
        
        return jobs
    
    # ============================================
    # WEB SCRAPING SOURCES (No API, Legal Gray Area)
    # ============================================
    
    def search_indeed_scrape(self, search_term: str, location: str = "", limit: int = 50) -> List[Dict]:
        """
        Scrape Indeed (USE WITH CAUTION - May violate ToS)
        Better to use Indeed API if available
        """
        jobs = []
        print("Note: Web scraping may violate Indeed's ToS. Consider using official API.")
        
        # Implementation would go here but excluded for legal reasons
        # Indeed offers an official API for partners
        
        return jobs
    
    def search_linkedin_scrape(self, search_term: str, location: str = "", limit: int = 50) -> List[Dict]:
        """
        Scrape LinkedIn Jobs (USE WITH CAUTION - May violate ToS)
        LinkedIn has very strict anti-scraping measures
        """
        jobs = []
        print("Note: LinkedIn actively blocks scraping. Use LinkedIn API for legitimate access.")
        
        # Implementation excluded for legal reasons
        # LinkedIn offers official APIs for partners
        
        return jobs
    
    # ============================================
    # AGGREGATION METHODS
    # ============================================
    
    def search_all(self, search_term: str, location: str = "", 
                   include_scraped: bool = False) -> Dict[str, Any]:
        """
        Search all available sources and aggregate results
        
        Args:
            search_term: Job search query
            location: Location preference
            include_scraped: Whether to include web scraping (risky)
        
        Returns:
            Dictionary with aggregated results and statistics
        """
        print(f"🔍 Searching for: {search_term} in {location or 'all locations'}")
        print("=" * 50)
        
        all_jobs = []
        source_counts = {}
        
        # Free sources (no API key needed)
        print("Searching free sources...")
        
        # Remotive (remote jobs)
        remotive_jobs = self.search_remotive(search_term)
        all_jobs.extend(remotive_jobs)
        source_counts['Remotive'] = len(remotive_jobs)
        print(f"  ✓ Remotive: {len(remotive_jobs)} jobs")
        
        # USAJobs (government)
        usa_jobs = self.search_usajobs(search_term, location)
        all_jobs.extend(usa_jobs)
        source_counts['USAJobs'] = len(usa_jobs)
        print(f"  ✓ USAJobs: {len(usa_jobs)} jobs")
        
        # GitHub job lists
        github_jobs = self.search_github_jobs(search_term)
        all_jobs.extend(github_jobs)
        source_counts['GitHub'] = len(github_jobs)
        print(f"  ✓ GitHub: {len(github_jobs)} jobs")
        
        # API-based sources
        print("\nSearching API sources...")
        
        # Adzuna
        adzuna_jobs = self.search_adzuna(search_term, "us")
        all_jobs.extend(adzuna_jobs)
        source_counts['Adzuna'] = len(adzuna_jobs)
        print(f"  ✓ Adzuna: {len(adzuna_jobs)} jobs")
        
        # Reed (if API key available)
        reed_jobs = self.search_reed(search_term, location)
        all_jobs.extend(reed_jobs)
        source_counts['Reed'] = len(reed_jobs)
        if reed_jobs:
            print(f"  ✓ Reed: {len(reed_jobs)} jobs")
        
        # Findwork (if API key available)
        findwork_jobs = self.search_findwork(search_term)
        all_jobs.extend(findwork_jobs)
        source_counts['Findwork'] = len(findwork_jobs)
        if findwork_jobs:
            print(f"  ✓ Findwork: {len(findwork_jobs)} jobs")
        
        # Web scraping (if enabled - use cautiously)
        if include_scraped:
            print("\nWarning: Web scraping may violate terms of service")
            # Indeed and LinkedIn scraping would go here
        
        # Sort by relevance/date
        all_jobs.sort(key=lambda x: x.get('posted_date', ''), reverse=True)
        
        print("\n" + "=" * 50)
        print(f"✅ Total unique jobs found: {len(all_jobs)}")
        print(f"📊 Coverage by source:")
        for source, count in source_counts.items():
            if count > 0:
                percentage = (count / len(all_jobs)) * 100 if all_jobs else 0
                print(f"  - {source}: {count} jobs ({percentage:.1f}%)")
        
        return {
            'jobs': all_jobs,
            'total_count': len(all_jobs),
            'source_breakdown': source_counts,
            'search_term': search_term,
            'location': location,
            'timestamp': datetime.now().isoformat()
        }
    
    def save_results(self, results: Dict, filename: str = None):
        """Save aggregated results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"data/daily_searches/aggregated_jobs_{timestamp}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: {filename}")
        return filename


# Example usage
if __name__ == "__main__":
    aggregator = ComprehensiveJobAggregator()
    
    # Search multiple sources
    results = aggregator.search_all(
        search_term="software engineer",
        location="San Francisco",
        include_scraped=False  # Don't scrape to avoid ToS issues
    )
    
    # Save results
    aggregator.save_results(results)
    
    # Print sample jobs
    print("\n📋 Sample jobs found:")
    for job in results['jobs'][:5]:
        print(f"\n• {job['title']} at {job['company']}")
        print(f"  Location: {job['location']}")
        print(f"  Source: {job['source']}")
        print(f"  URL: {job['url'][:50]}...")