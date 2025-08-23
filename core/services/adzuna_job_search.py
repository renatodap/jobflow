"""
Adzuna Job Search Integration
Real, working job API with 1000 free searches per month
"""

import os
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from urllib.parse import quote_plus

class AdzunaJobSearch:
    """
    Adzuna API integration for real job discovery
    Free tier: 1000 API calls per month
    """
    
    def __init__(self):
        self.app_id = os.getenv('ADZUNA_APP_ID', '5305c49d')
        self.api_key = os.getenv('ADZUNA_API_KEY', '13a9a9862ef8dba5e373ba5f197773ef')
        
        if not self.app_id or not self.api_key:
            raise ValueError("Adzuna API credentials not found in environment")
        
        self.base_url = "https://api.adzuna.com/v1/api/jobs"
        self.countries = {
            'us': 'United States',
            'gb': 'United Kingdom', 
            'ca': 'Canada',
            'au': 'Australia'
        }
    
    async def search_jobs(
        self, 
        query: str, 
        location: str = "", 
        country: str = "us",
        results_per_page: int = 50,
        max_days_old: int = 30,
        salary_min: int = None,
        full_time: bool = None
    ) -> List[Dict]:
        """
        Search for jobs using Adzuna API
        
        Args:
            query: Search query (e.g., "software engineer new grad")
            location: Location filter (e.g., "San Francisco")
            country: Country code (us, gb, ca, au)
            results_per_page: Number of results (max 50)
            max_days_old: Only jobs posted within X days
            salary_min: Minimum salary filter
            full_time: Full-time only filter
        
        Returns:
            List of job dictionaries
        """
        
        # Build API URL
        url = f"{self.base_url}/{country}/search/1"
        
        # Build parameters
        params = {
            'app_id': self.app_id,
            'app_key': self.api_key,
            'results_per_page': min(results_per_page, 50),
            'what': query,
            'content-type': 'application/json'
        }
        
        # Add optional parameters
        if location:
            params['where'] = location
        
        if max_days_old:
            params['max_days_old'] = max_days_old
        
        if salary_min:
            params['salary_min'] = salary_min
        
        if full_time is not None:
            params['full_time'] = 1 if full_time else 0
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                jobs = self._parse_adzuna_response(data, country)
                
                print(f"  Adzuna: Found {len(jobs)} jobs for '{query[:50]}'")
                return jobs
                
            except httpx.HTTPError as e:
                print(f"  Adzuna API error: {e}")
                return []
            except Exception as e:
                print(f"  Adzuna error: {e}")
                return []
    
    def _parse_adzuna_response(self, data: Dict, country: str) -> List[Dict]:
        """Parse Adzuna API response into standardized job format"""
        
        jobs = []
        
        for item in data.get('results', []):
            # Extract job information
            job = {
                'title': item.get('title', ''),
                'company': item.get('company', {}).get('display_name', ''),
                'location': item.get('location', {}).get('display_name', ''),
                'description': item.get('description', ''),
                'url': item.get('redirect_url', ''),
                'salary_min': item.get('salary_min'),
                'salary_max': item.get('salary_max'),
                'created': item.get('created'),
                'category': item.get('category', {}).get('label', ''),
                'contract_type': item.get('contract_type', ''),
                'contract_time': item.get('contract_time', ''),
                'source': 'Adzuna',
                'country': self.countries.get(country, country),
                'job_id': item.get('id'),
                'discovered_date': datetime.now().isoformat()
            }
            
            # Clean up the data
            job = self._clean_job_data(job)
            
            if job['title'] and job['company']:
                jobs.append(job)
        
        return jobs
    
    def _clean_job_data(self, job: Dict) -> Dict:
        """Clean and standardize job data"""
        
        # Clean HTML from description
        import re
        if job.get('description'):
            # Remove HTML tags
            clean_desc = re.sub('<.*?>', '', job['description'])
            # Remove extra whitespace
            clean_desc = ' '.join(clean_desc.split())
            job['description'] = clean_desc[:1000]  # Limit length
        
        # Format salary information
        if job.get('salary_min'):
            job['salary_formatted'] = self._format_salary(
                job.get('salary_min'), 
                job.get('salary_max')
            )
        
        # Calculate days old
        if job.get('created'):
            try:
                created_date = datetime.fromisoformat(job['created'].replace('Z', '+00:00'))
                days_old = (datetime.now() - created_date.replace(tzinfo=None)).days
                job['days_old'] = days_old
                job['is_fresh'] = days_old <= 7  # Posted within a week
            except:
                job['days_old'] = None
                job['is_fresh'] = False
        
        return job
    
    def _format_salary(self, salary_min: float, salary_max: float = None) -> str:
        """Format salary for display"""
        
        if salary_max and salary_max != salary_min:
            return f"${salary_min:,.0f} - ${salary_max:,.0f}"
        elif salary_min:
            return f"${salary_min:,.0f}+"
        return ""
    
    async def search_multiple_queries(
        self, 
        queries: List[str], 
        location: str = "",
        **kwargs
    ) -> List[Dict]:
        """
        Search for multiple queries and aggregate results
        
        Args:
            queries: List of search queries
            location: Location filter
            **kwargs: Additional parameters for search_jobs
        
        Returns:
            Aggregated list of unique jobs
        """
        
        all_jobs = []
        seen_ids = set()
        
        for query in queries:
            print(f"  Searching Adzuna: {query[:60]}...")
            
            jobs = await self.search_jobs(query, location, **kwargs)
            
            # Deduplicate by job ID
            for job in jobs:
                job_id = job.get('job_id')
                if job_id and job_id not in seen_ids:
                    seen_ids.add(job_id)
                    all_jobs.append(job)
            
            # Rate limiting (Adzuna has 5 requests per second limit)
            await asyncio.sleep(0.3)
        
        return all_jobs
    
    async def get_top_companies(self, location: str = "", country: str = "us") -> List[Dict]:
        """Get top hiring companies in a location"""
        
        url = f"{self.base_url}/{country}/top_companies"
        
        params = {
            'app_id': self.app_id,
            'app_key': self.api_key,
            'what': 'software engineer',
            'content-type': 'application/json'
        }
        
        if location:
            params['where'] = location
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get('leaderboard', [])
                
            except Exception as e:
                print(f"  Adzuna top companies error: {e}")
                return []
    
    async def get_salary_stats(self, job_title: str, location: str = "", country: str = "us") -> Dict:
        """Get salary statistics for a job title"""
        
        url = f"{self.base_url}/{country}/history"
        
        params = {
            'app_id': self.app_id,
            'app_key': self.api_key,
            'what': job_title,
            'months': 3,
            'content-type': 'application/json'
        }
        
        if location:
            params['where'] = location
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Get latest month's data
                if data.get('month'):
                    latest = list(data['month'].values())[-1]
                    return {
                        'average_salary': latest.get('salary', 0),
                        'job_count': latest.get('count', 0)
                    }
                
                return {}
                
            except Exception as e:
                print(f"  Adzuna salary stats error: {e}")
                return {}


# Test the Adzuna API
async def test_adzuna_search():
    """Test Adzuna job search with real API"""
    
    print("=" * 60)
    print("TESTING ADZUNA JOB SEARCH API")
    print("=" * 60)
    
    searcher = AdzunaJobSearch()
    
    # Test queries for new grad software engineer
    test_queries = [
        "software engineer graduate",
        "software developer entry level",
        "junior software engineer",
        "software engineer new grad",
        "python developer junior"
    ]
    
    print(f"\nSearching for new grad positions...")
    print("-" * 60)
    
    # Search with multiple queries
    all_jobs = await searcher.search_multiple_queries(
        queries=test_queries[:3],  # Limit to conserve API calls
        location="",  # Search entire US
        max_days_old=30,  # Fresh postings only
        salary_min=70000  # Minimum salary filter
    )
    
    print(f"\nRESULTS:")
    print(f"Total jobs found: {len(all_jobs)}")
    
    # Analyze results
    fresh_jobs = [j for j in all_jobs if j.get('is_fresh')]
    high_salary = [j for j in all_jobs if j.get('salary_min', 0) >= 80000]
    
    print(f"Fresh jobs (<=7 days): {len(fresh_jobs)}")
    print(f"High salary ($80k+): {len(high_salary)}")
    
    # Show top 10 jobs
    print(f"\nTOP JOBS FOUND:")
    print("-" * 60)
    
    for i, job in enumerate(all_jobs[:10], 1):
        print(f"\n{i}. {job['title']}")
        print(f"   Company: {job['company']}")
        print(f"   Location: {job['location']}")
        if job.get('salary_formatted'):
            print(f"   Salary: {job['salary_formatted']}")
        if job.get('days_old') is not None:
            print(f"   Posted: {job['days_old']} days ago")
        print(f"   URL: {job['url'][:70]}...")
    
    # Test salary statistics
    print(f"\nSALARY STATISTICS:")
    print("-" * 60)
    
    stats = await searcher.get_salary_stats("software engineer", "San Francisco")
    if stats:
        print(f"Average salary in San Francisco: ${stats.get('average_salary', 0):,.0f}")
        print(f"Number of jobs: {stats.get('job_count', 0)}")
    
    # Test top companies
    print(f"\nTOP HIRING COMPANIES:")
    print("-" * 60)
    
    companies = await searcher.get_top_companies()
    for i, company in enumerate(companies[:5], 1):
        print(f"{i}. {company.get('canonical_name', 'Unknown')} - {company.get('count', 0)} jobs")
    
    print(f"\nAdzuna API test complete!")
    print(f"API calls used: ~{len(test_queries) + 2} (out of 1000 monthly limit)")
    
    return all_jobs


if __name__ == "__main__":
    # Run test
    asyncio.run(test_adzuna_search())