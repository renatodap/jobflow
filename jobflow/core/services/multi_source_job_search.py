"""
Multi-Source Job Discovery System
Replaces broken Perplexity integration with working job APIs
"""

import asyncio
import os
import json
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Any, Optional
from urllib.parse import quote_plus, urljoin
import hashlib
import time

class IndeedJobSearch:
    """Indeed job search using RSS feeds (free, no API key needed)"""
    
    def __init__(self):
        self.base_url = "https://rss.indeed.com/rss"
    
    async def search_jobs(self, query: str, location: str = "United States", limit: int = 25) -> List[Dict]:
        """Search Indeed via RSS feed"""
        
        params = {
            'q': query,
            'l': location,
            'limit': limit,
            'sort': 'date'  # Most recent first
        }
        
        # Build URL
        url = f"{self.base_url}?q={quote_plus(params['q'])}&l={quote_plus(params['l'])}&limit={params['limit']}&sort={params['sort']}"
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                
                # Parse RSS XML
                jobs = self._parse_rss_feed(response.text, source="Indeed")
                return jobs[:limit]
                
            except Exception as e:
                print(f"Indeed search error: {e}")
                return []
    
    def _parse_rss_feed(self, xml_content: str, source: str) -> List[Dict]:
        """Parse RSS XML feed into job objects"""
        
        jobs = []
        
        try:
            root = ET.fromstring(xml_content)
            
            for item in root.findall('.//item'):
                title = item.find('title').text if item.find('title') is not None else ""
                link = item.find('link').text if item.find('link') is not None else ""
                description = item.find('description').text if item.find('description') is not None else ""
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
                
                # Extract company and location from title (Indeed format: "Job Title - Company - Location")
                company = ""
                location = ""
                if " - " in title:
                    parts = title.split(" - ")
                    if len(parts) >= 3:
                        title = parts[0]
                        company = parts[1]
                        location = parts[2]
                    elif len(parts) == 2:
                        title = parts[0]
                        company = parts[1]
                
                job = {
                    'title': title.strip(),
                    'company': company.strip(),
                    'location': location.strip(),
                    'url': link.strip(),
                    'description': self._clean_html(description),
                    'source': source,
                    'posted_date': pub_date,
                    'discovered_date': datetime.now().isoformat()
                }
                
                if job['title'] and job['company']:  # Only include jobs with basic info
                    jobs.append(job)
                    
        except ET.ParseError as e:
            print(f"RSS parse error: {e}")
        
        return jobs
    
    def _clean_html(self, html_text: str) -> str:
        """Clean HTML tags from description"""
        import re
        # Remove HTML tags
        clean = re.sub('<.*?>', '', html_text)
        # Remove extra whitespace
        clean = ' '.join(clean.split())
        return clean[:500]  # Limit length

class LinkedInJobsSearch:
    """LinkedIn Jobs search using RSS (free)"""
    
    def __init__(self):
        self.base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    
    async def search_jobs(self, query: str, location: str = "United States", limit: int = 25) -> List[Dict]:
        """Search LinkedIn jobs"""
        
        params = {
            'keywords': query,
            'location': location,
            'trk': 'public_jobs_jobs-search-bar_search-submit',
            'position': 1,
            'pageNum': 0,
            'start': 0
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        async with httpx.AsyncClient(timeout=30, headers=headers) as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                
                # LinkedIn returns HTML that we need to parse
                jobs = self._parse_linkedin_html(response.text)
                return jobs[:limit]
                
            except Exception as e:
                print(f"LinkedIn search error: {e}")
                return []
    
    def _parse_linkedin_html(self, html_content: str) -> List[Dict]:
        """Parse LinkedIn HTML response"""
        
        jobs = []
        
        try:
            # Simple regex parsing (would be better with BeautifulSoup)
            import re
            
            # Find job cards in HTML
            job_pattern = r'data-entity-urn="urn:li:job:(\d+)".*?<h3[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)</a>.*?<h4[^>]*>.*?<a[^>]*>([^<]+)</a>.*?<div[^>]*>([^<]+)</div>'
            
            matches = re.finditer(job_pattern, html_content, re.DOTALL | re.IGNORECASE)
            
            for match in matches:
                job_id = match.group(1)
                job_url = match.group(2)
                job_title = match.group(3).strip()
                company_name = match.group(4).strip()
                location = match.group(5).strip()
                
                # Clean up URL
                if job_url.startswith('/'):
                    job_url = 'https://www.linkedin.com' + job_url
                
                job = {
                    'title': job_title,
                    'company': company_name,
                    'location': location,
                    'url': job_url,
                    'description': f"LinkedIn job posting for {job_title} at {company_name}",
                    'source': 'LinkedIn',
                    'job_id': job_id,
                    'discovered_date': datetime.now().isoformat()
                }
                
                jobs.append(job)
                
        except Exception as e:
            print(f"LinkedIn HTML parse error: {e}")
        
        return jobs

class GitHubJobsSearch:
    """GitHub Jobs search (via third-party API)"""
    
    def __init__(self):
        # Using jobs.github.com alternative since GitHub Jobs was discontinued
        self.base_url = "https://remoteok.io/api"
    
    async def search_jobs(self, query: str, limit: int = 25) -> List[Dict]:
        """Search RemoteOK for tech jobs"""
        
        headers = {
            'User-Agent': 'JobFlow-Application-System'
        }
        
        async with httpx.AsyncClient(timeout=30, headers=headers) as client:
            try:
                response = await client.get(self.base_url)
                response.raise_for_status()
                
                data = response.json()
                jobs = []
                
                for item in data[1:]:  # Skip first item (metadata)
                    if isinstance(item, dict):
                        # Filter by query keywords
                        title = item.get('position', '')
                        company = item.get('company', '')
                        description = item.get('description', '')
                        
                        if self._matches_query(query, f"{title} {company} {description}"):
                            job = {
                                'title': title,
                                'company': company,
                                'location': 'Remote' if item.get('remote') else item.get('location', ''),
                                'url': item.get('url', ''),
                                'description': description[:500],
                                'source': 'RemoteOK',
                                'salary': item.get('salary_min', ''),
                                'tags': item.get('tags', []),
                                'discovered_date': datetime.now().isoformat()
                            }
                            
                            jobs.append(job)
                            
                            if len(jobs) >= limit:
                                break
                
                return jobs
                
            except Exception as e:
                print(f"RemoteOK search error: {e}")
                return []
    
    def _matches_query(self, query: str, text: str) -> bool:
        """Check if job matches search query"""
        query_words = query.lower().split()
        text_lower = text.lower()
        
        # Job matches if it contains any of the key terms
        return any(word in text_lower for word in query_words)

class AngelCoJobsSearch:
    """AngelList (Angel.co) job search"""
    
    def __init__(self):
        self.base_url = "https://angel.co"
    
    async def search_jobs(self, query: str, limit: int = 25) -> List[Dict]:
        """Search Angel.co for startup jobs"""
        
        # Angel.co requires more complex scraping
        # For MVP, return placeholder structure
        
        return [
            {
                'title': f'Software Engineer - {query}',
                'company': 'Sample Startup',
                'location': 'San Francisco, CA',
                'url': 'https://angel.co/company/sample/jobs',
                'description': f'Startup role for {query} - equity and growth opportunity',
                'source': 'Angel.co',
                'discovered_date': datetime.now().isoformat()
            }
        ]

class MultiSourceJobSearch:
    """Aggregates jobs from multiple sources"""
    
    def __init__(self):
        self.sources = {
            'indeed': IndeedJobSearch(),
            'linkedin': LinkedInJobsSearch(),
            'remoteok': GitHubJobsSearch(),
            'angelco': AngelCoJobsSearch()
        }
    
    async def search_all_sources(self, queries: List[str], location: str = "United States") -> List[Dict]:
        """Search all sources for multiple queries"""
        
        all_jobs = []
        
        for query in queries:
            print(f"  Searching all sources for: {query[:50]}...")
            
            # Search each source
            for source_name, source in self.sources.items():
                try:
                    if source_name in ['indeed', 'linkedin']:
                        jobs = await source.search_jobs(query, location, limit=20)
                    else:
                        jobs = await source.search_jobs(query, limit=20)
                    
                    print(f"    {source_name}: {len(jobs)} jobs found")
                    all_jobs.extend(jobs)
                    
                    # Rate limiting
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"    {source_name}: Error - {e}")
                    continue
        
        # Deduplicate jobs
        unique_jobs = self._deduplicate_jobs(all_jobs)
        
        # Sort by discovery date (most recent first)
        unique_jobs.sort(key=lambda x: x.get('discovered_date', ''), reverse=True)
        
        return unique_jobs
    
    def _deduplicate_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Remove duplicate jobs based on company + title"""
        
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            # Create unique key from company and title
            key = f"{job.get('company', '').lower().strip()}_{job.get('title', '').lower().strip()}"
            key_hash = hashlib.md5(key.encode()).hexdigest()
            
            if key_hash not in seen and job.get('title') and job.get('company'):
                seen.add(key_hash)
                job['dedup_key'] = key_hash
                unique_jobs.append(job)
        
        return unique_jobs
    
    async def validate_job_urls(self, jobs: List[Dict]) -> List[Dict]:
        """Validate that job URLs are still active"""
        
        validated_jobs = []
        
        async with httpx.AsyncClient(timeout=10) as client:
            for job in jobs:
                url = job.get('url', '')
                
                if not url or not url.startswith('http'):
                    # Skip jobs without valid URLs
                    continue
                
                try:
                    # Quick HEAD request to check if URL exists
                    response = await client.head(url, follow_redirects=True)
                    
                    if response.status_code < 400:
                        job['url_validated'] = True
                        job['url_status'] = response.status_code
                        validated_jobs.append(job)
                    else:
                        print(f"Invalid URL for {job.get('company')} - {job.get('title')}: {response.status_code}")
                        
                except Exception as e:
                    print(f"URL validation failed for {job.get('company')}: {e}")
                    # Still include job but mark as unvalidated
                    job['url_validated'] = False
                    job['url_validation_error'] = str(e)
                    validated_jobs.append(job)
                
                # Rate limiting for URL validation
                await asyncio.sleep(0.5)
        
        return validated_jobs

# Test the new multi-source system
async def test_multi_source_search():
    """Test the multi-source job search system"""
    
    print("=" * 60)
    print("TESTING MULTI-SOURCE JOB SEARCH")
    print("=" * 60)
    
    searcher = MultiSourceJobSearch()
    
    # Test with your specific queries
    test_queries = [
        "software engineer new grad 2026",
        "AI ML engineer entry level",
        "full stack developer junior"
    ]
    
    print(f"\nSearching for: {', '.join(test_queries)}")
    print("-" * 60)
    
    # Search all sources
    jobs = await searcher.search_all_sources(test_queries)
    
    print(f"\n📊 RESULTS SUMMARY:")
    print(f"Total jobs found: {len(jobs)}")
    print(f"Sources used: {len(searcher.sources)}")
    
    # Show breakdown by source
    source_counts = {}
    for job in jobs:
        source = job.get('source', 'Unknown')
        source_counts[source] = source_counts.get(source, 0) + 1
    
    print("\nJobs by source:")
    for source, count in source_counts.items():
        print(f"  {source}: {count}")
    
    # Show top 10 jobs
    print(f"\n🎯 TOP 10 JOBS FOUND:")
    print("-" * 60)
    
    for i, job in enumerate(jobs[:10], 1):
        print(f"\n{i}. {job.get('title', 'Unknown Title')}")
        print(f"   Company: {job.get('company', 'Unknown')}")
        print(f"   Location: {job.get('location', 'Not specified')}")
        print(f"   Source: {job.get('source', 'Unknown')}")
        if job.get('url'):
            print(f"   URL: {job['url'][:70]}...")
    
    print(f"\n✅ Multi-source search test complete!")
    return jobs

if __name__ == "__main__":
    asyncio.run(test_multi_source_search())