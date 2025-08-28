"""
Google Jobs Search Integration
Uses Google's job aggregation to find jobs from EVERYWHERE
Alternative: Direct Google search parsing (free but limited)
"""

import requests
from typing import List, Dict, Optional
import json
import time
from datetime import datetime, timedelta
import re
from urllib.parse import quote_plus

class GoogleJobsSearcher:
    """Search Google Jobs - aggregates from 100+ job boards"""
    
    def __init__(self, serpapi_key: str = None):
        """
        Initialize with optional SerpAPI key
        If no key, falls back to direct Google search (limited)
        """
        self.serpapi_key = serpapi_key
        self.has_paid_api = bool(serpapi_key)
        
        # Google search parameters for jobs
        self.google_job_params = {
            'ibp': 'htl;jobs',  # Google Jobs parameter
            'htichips': 'date_posted:week',  # Posted in last week
            'htischips': 'date_posted;week',
            'htilrad': '50.0',  # 50 mile radius
        }
        
    def search_google_jobs_paid(self, query: str, location: str = None, 
                                num_results: int = 20) -> List[Dict]:
        """
        Search using SerpAPI (paid but reliable)
        $50/month for 5,000 searches
        """
        
        if not self.serpapi_key:
            return []
        
        jobs = []
        
        try:
            params = {
                'api_key': self.serpapi_key,
                'engine': 'google_jobs',
                'q': query,
                'location': location or 'United States',
                'hl': 'en',
                'gl': 'us',
                'chips': 'date_posted:week',  # Recent jobs only
                'num': num_results
            }
            
            response = requests.get(
                'https://serpapi.com/search',
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                for job in data.get('jobs_results', []):
                    formatted_job = {
                        'title': job.get('title', ''),
                        'company': job.get('company_name', ''),
                        'location': job.get('location', ''),
                        'description': job.get('description', ''),
                        'url': job.get('related_links', [{}])[0].get('link', '') if job.get('related_links') else '',
                        'source': f"via {job.get('via', 'Google Jobs')}",
                        'posted_date': job.get('detected_extensions', {}).get('posted_at', ''),
                        'salary': job.get('detected_extensions', {}).get('salary', ''),
                        'job_id': job.get('job_id', ''),
                        'thumbnail': job.get('thumbnail', ''),
                        'extensions': job.get('extensions', []),
                        'google_jobs_url': f"https://www.google.com/search?ibp=htl;jobs&q={quote_plus(query)}#htivrt=jobs&htidocid={job.get('job_id', '')}"
                    }
                    
                    # Parse salary if available
                    if formatted_job['salary']:
                        salary_parsed = self._parse_salary(formatted_job['salary'])
                        formatted_job.update(salary_parsed)
                    
                    jobs.append(formatted_job)
                    
        except Exception as e:
            print(f"SerpAPI error: {e}")
        
        return jobs
    
    def search_google_jobs_free(self, query: str, location: str = None, 
                                num_pages: int = 2) -> List[Dict]:
        """
        Free alternative - parse Google search results directly
        Limited and may break if Google changes format
        """
        
        jobs = []
        
        for page in range(num_pages):
            try:
                # Build Google Jobs search URL
                search_query = f"{query} jobs {location or ''}"
                url = f"https://www.google.com/search"
                
                params = {
                    'q': search_query,
                    'ibp': 'htl;jobs',
                    'htichips': 'date_posted:week',
                    'start': page * 10
                }
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, params=params, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    # Parse HTML (simplified - would need BeautifulSoup for real parsing)
                    content = response.text
                    
                    # Extract job cards using regex (fragile but works)
                    job_pattern = r'<div class="PwjeAc".*?>(.*?)</div>'
                    matches = re.findall(job_pattern, content, re.DOTALL)
                    
                    for match in matches[:10]:  # Limit to 10 per page
                        # Extract basic info (this is simplified)
                        title_match = re.search(r'<div class="BjJfJf PUpOsf">(.*?)</div>', match)
                        company_match = re.search(r'<div class="vNEEBe">(.*?)</div>', match)
                        location_match = re.search(r'<div class="Qk80Jf">(.*?)</div>', match)
                        
                        if title_match:
                            job = {
                                'title': self._clean_html(title_match.group(1)),
                                'company': self._clean_html(company_match.group(1)) if company_match else '',
                                'location': self._clean_html(location_match.group(1)) if location_match else '',
                                'source': 'Google Jobs (Free)',
                                'url': f"https://www.google.com/search?ibp=htl;jobs&q={quote_plus(search_query)}"
                            }
                            jobs.append(job)
                
                # Rate limit to avoid blocking
                time.sleep(2)
                
            except Exception as e:
                print(f"Google free search error: {e}")
                break
        
        return jobs
    
    def _parse_salary(self, salary_string: str) -> Dict:
        """Parse salary string into min/max values"""
        
        result = {
            'salary_min': None,
            'salary_max': None,
            'salary_text': salary_string
        }
        
        # Extract numbers from salary string
        numbers = re.findall(r'[\$£€]?([\d,]+)K?', salary_string)
        
        if numbers:
            # Convert to integers
            values = []
            for num in numbers:
                # Remove commas and convert
                value = int(num.replace(',', ''))
                
                # Check if it's in thousands (K)
                if 'K' in salary_string or 'k' in salary_string:
                    value *= 1000
                elif value < 1000:  # Probably hourly rate
                    value *= 2080  # Convert hourly to annual (40 hrs/week * 52 weeks)
                
                values.append(value)
            
            if values:
                result['salary_min'] = min(values)
                if len(values) > 1:
                    result['salary_max'] = max(values)
        
        return result
    
    def _clean_html(self, text: str) -> str:
        """Remove HTML tags from text"""
        clean = re.sub('<.*?>', '', text)
        return clean.strip()
    
    def search_with_filters(self, profile: Dict, serpapi_key: str = None) -> List[Dict]:
        """
        Smart search using profile preferences and filters
        """
        
        all_jobs = []
        
        # Generate targeted queries
        queries = self._generate_google_queries(profile)
        
        for query in queries[:3]:  # Limit to avoid rate limits
            print(f"Searching Google Jobs: {query}")
            
            if serpapi_key:
                # Use paid API
                jobs = self.search_google_jobs_paid(
                    query=query,
                    location=profile.get('location', 'United States'),
                    num_results=20
                )
            else:
                # Use free method
                jobs = self.search_google_jobs_free(
                    query=query,
                    location=profile.get('location'),
                    num_pages=1
                )
            
            all_jobs.extend(jobs)
            
            # Rate limit
            time.sleep(1)
        
        # Remove duplicates
        seen = set()
        unique_jobs = []
        for job in all_jobs:
            key = f"{job['company']}_{job['title']}"
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs
    
    def _generate_google_queries(self, profile: Dict) -> List[str]:
        """Generate optimized queries for Google Jobs"""
        
        queries = []
        
        # Entry-level specific queries that work well on Google
        base_queries = [
            '"entry level" software engineer',
            '"new grad" software engineer 2026',
            '"early career" developer',
            '"associate software engineer"',
            'software engineer I',
            '"recent graduate" programmer',
            '"university" "software engineer" "2026"'
        ]
        
        queries.extend(base_queries)
        
        # Add skill-specific queries
        for skill in profile.get('technical_skills', {}).get('languages', [])[:2]:
            queries.append(f'"{skill}" "entry level" engineer')
            queries.append(f'"{skill}" "new grad"')
        
        # Add location-specific queries
        for location in profile.get('locations', [])[:2]:
            queries.append(f'"software engineer" "new grad" "{location}"')
        
        return queries
    
    def get_job_details(self, job_id: str) -> Dict:
        """
        Get detailed information about a specific job
        Only works with SerpAPI
        """
        
        if not self.serpapi_key or not job_id:
            return {}
        
        try:
            params = {
                'api_key': self.serpapi_key,
                'engine': 'google_jobs_listing',
                'q': job_id
            }
            
            response = requests.get(
                'https://serpapi.com/search',
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
                
        except Exception as e:
            print(f"Error getting job details: {e}")
        
        return {}


def test_google_jobs():
    """Test Google Jobs search"""
    
    # Initialize (SerpAPI key optional)
    google_searcher = GoogleJobsSearcher(serpapi_key=None)  # Using free method
    
    print("=" * 60)
    print("GOOGLE JOBS SEARCH TEST")
    print("=" * 60)
    
    # Test profile
    profile = {
        'technical_skills': {
            'languages': ['Python', 'JavaScript', 'TypeScript']
        },
        'locations': ['San Francisco', 'Remote'],
        'location': 'California'
    }
    
    # Search
    print("\nSearching Google Jobs (free method)...")
    jobs = google_searcher.search_with_filters(profile)
    
    print(f"\nFound {len(jobs)} jobs from Google")
    
    # Display results
    for job in jobs[:5]:
        print(f"\n{job['title']}")
        print(f"  Company: {job['company']}")
        print(f"  Location: {job['location']}")
        print(f"  Source: {job['source']}")
        if job.get('salary_text'):
            print(f"  Salary: {job['salary_text']}")
            if job.get('salary_min'):
                print(f"  Parsed: ${job['salary_min']:,} - ${job.get('salary_max', job['salary_min']):,}")
        print(f"  URL: {job.get('url', 'N/A')[:60]}...")
    
    print("\n" + "=" * 60)
    print("Note: For better results, add a SerpAPI key ($50/month)")
    print("Free method is limited and may be blocked by Google")
    print("=" * 60)


if __name__ == "__main__":
    test_google_jobs()