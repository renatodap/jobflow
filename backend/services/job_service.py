"""
Job Service for JobFlow
Enhanced job search with multiple sources and comprehensive filtering
"""

import os
import asyncio
import httpx
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import re

@dataclass
class JobResult:
    """Structured job result"""
    title: str
    company: str
    location: str
    description: str
    url: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_type: str = "Full-time"
    remote: bool = False
    posted_date: Optional[str] = None
    source: str = "unknown"
    score: int = 0

class JobService:
    """Enhanced job search service with multiple sources"""
    
    def __init__(self):
        self.adzuna_app_id = os.getenv('ADZUNA_APP_ID')
        self.adzuna_api_key = os.getenv('ADZUNA_API_KEY')
        self.indeed_api_key = os.getenv('INDEED_API_KEY')
        self.linkedin_api_key = os.getenv('LINKEDIN_API_KEY')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        # Job search terms for software engineering roles
        self.search_terms = [
            "software engineer",
            "software developer", 
            "full stack developer",
            "backend developer",
            "frontend developer",
            "python developer",
            "javascript developer",
            "react developer",
            "machine learning engineer",
            "data engineer",
            "DevOps engineer",
            "mobile developer",
            "web developer",
            "junior developer",
            "intern software",
            "graduate developer"
        ]
        
        # Keywords that increase job score
        self.high_value_keywords = [
            "python", "javascript", "react", "typescript", "fastapi",
            "machine learning", "ai", "artificial intelligence",
            "startup", "remote", "full-time", "entry level", "junior",
            "new grad", "recent graduate", "visa sponsorship",
            "tennis", "sports tech", "fintech", "edtech"
        ]
    
    async def comprehensive_job_search(
        self, 
        user_id: str,
        search_params: Optional[Dict] = None
    ) -> List[JobResult]:
        """
        Comprehensive job search across multiple sources
        Returns deduplicated and scored results
        """
        
        if search_params is None:
            search_params = {
                'location': 'United States',
                'max_results_per_source': 50,
                'min_salary': 40000,
                'job_types': ['full-time', 'internship'],
                'remote_ok': True
            }
        
        all_jobs = []
        
        # Search all available sources in parallel
        search_tasks = []
        
        if self.adzuna_app_id and self.adzuna_api_key:
            search_tasks.append(self._search_adzuna(search_params))
        
        if self.indeed_api_key:
            search_tasks.append(self._search_indeed(search_params))
        
        if self.linkedin_api_key:
            search_tasks.append(self._search_linkedin(search_params))
        
        # Always search free sources
        search_tasks.append(self._search_github_jobs(search_params))
        search_tasks.append(self._search_stackoverflow_jobs(search_params))
        
        # Execute all searches concurrently
        if search_tasks:
            results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_jobs.extend(result)
                elif isinstance(result, Exception):
                    print(f"Job search error: {result}")
        
        # Deduplicate jobs
        unique_jobs = self._deduplicate_jobs(all_jobs)
        
        # Score jobs based on relevance
        scored_jobs = self._score_jobs(unique_jobs, search_params)
        
        # Sort by score (highest first)
        scored_jobs.sort(key=lambda x: x.score, reverse=True)
        
        # Store results in database
        await self._store_job_results(user_id, scored_jobs[:100])  # Store top 100
        
        return scored_jobs[:50]  # Return top 50
    
    async def get_daily_job_recommendations(self, user_id: str) -> List[JobResult]:
        """
        Get daily job recommendations (20 best jobs)
        """
        
        # Get user preferences from profile
        user_prefs = await self._get_user_preferences(user_id)
        
        search_params = {
            'location': user_prefs.get('preferred_locations', ['United States'])[0],
            'max_results_per_source': 30,
            'min_salary': user_prefs.get('min_salary', 40000),
            'job_types': user_prefs.get('preferred_job_types', ['full-time', 'internship']),
            'remote_ok': user_prefs.get('remote_ok', True),
            'keywords': user_prefs.get('preferred_keywords', [])
        }
        
        jobs = await self.comprehensive_job_search(user_id, search_params)
        
        # Filter out jobs already applied to
        applied_jobs = await self._get_applied_job_urls(user_id)
        filtered_jobs = [job for job in jobs if job.url not in applied_jobs]
        
        # Return top 20
        return filtered_jobs[:20]
    
    async def _search_adzuna(self, params: Dict) -> List[JobResult]:
        """Search Adzuna API"""
        
        jobs = []
        
        try:
            async with httpx.AsyncClient() as client:
                for term in self.search_terms[:5]:  # Limit API calls
                    url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
                    
                    query_params = {
                        'app_id': self.adzuna_app_id,
                        'app_key': self.adzuna_api_key,
                        'what': term,
                        'where': params.get('location', 'United States'),
                        'results_per_page': params.get('max_results_per_source', 50),
                        'salary_min': params.get('min_salary', 40000),
                        'sort_by': 'date'
                    }
                    
                    response = await client.get(url, params=query_params, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for job in data.get('results', []):
                            jobs.append(JobResult(
                                title=job.get('title', ''),
                                company=job.get('company', {}).get('display_name', ''),
                                location=job.get('location', {}).get('display_name', ''),
                                description=job.get('description', ''),
                                url=job.get('redirect_url', ''),
                                salary_min=job.get('salary_min'),
                                salary_max=job.get('salary_max'),
                                job_type=self._extract_job_type(job.get('contract_type', '')),
                                remote=self._is_remote_job(job.get('description', '') + ' ' + job.get('location', {}).get('display_name', '')),
                                posted_date=job.get('created', ''),
                                source='adzuna'
                            ))
                    
                    # Rate limiting
                    await asyncio.sleep(0.5)
        
        except Exception as e:
            print(f"Adzuna search error: {e}")
        
        return jobs
    
    async def _search_indeed(self, params: Dict) -> List[JobResult]:
        """Search Indeed API (if available)"""
        
        jobs = []
        
        # Indeed API is not publicly available, but we can implement
        # other job board APIs or web scraping here
        # For now, return empty list
        
        return jobs
    
    async def _search_linkedin(self, params: Dict) -> List[JobResult]:
        """Search LinkedIn Jobs API (if available)"""
        
        jobs = []
        
        # LinkedIn API requires special access
        # For now, return empty list
        
        return jobs
    
    async def _search_github_jobs(self, params: Dict) -> List[JobResult]:
        """Search GitHub Jobs (free API)"""
        
        jobs = []
        
        try:
            async with httpx.AsyncClient() as client:
                for term in self.search_terms[:3]:
                    url = f"https://jobs.github.com/positions.json"
                    
                    query_params = {
                        'description': term,
                        'location': params.get('location', ''),
                        'full_time': 'true' if 'full-time' in params.get('job_types', []) else 'false'
                    }
                    
                    response = await client.get(url, params=query_params, timeout=20)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for job in data:
                            jobs.append(JobResult(
                                title=job.get('title', ''),
                                company=job.get('company', ''),
                                location=job.get('location', ''),
                                description=job.get('description', ''),
                                url=job.get('url', ''),
                                job_type=job.get('type', 'Full Time'),
                                remote=self._is_remote_job(job.get('location', '')),
                                posted_date=job.get('created_at', ''),
                                source='github'
                            ))
                    
                    await asyncio.sleep(0.3)
        
        except Exception as e:
            print(f"GitHub Jobs search error: {e}")
        
        return jobs
    
    async def _search_stackoverflow_jobs(self, params: Dict) -> List[JobResult]:
        """Search Stack Overflow Jobs"""
        
        jobs = []
        
        try:
            async with httpx.AsyncClient() as client:
                url = "https://stackoverflow.com/jobs/feed"
                
                response = await client.get(url, timeout=20)
                
                if response.status_code == 200:
                    # Parse RSS feed (simplified)
                    content = response.text
                    
                    # Basic RSS parsing for job titles and links
                    import xml.etree.ElementTree as ET
                    try:
                        root = ET.fromstring(content)
                        
                        for item in root.findall('.//item')[:20]:
                            title = item.find('title')
                            link = item.find('link')
                            description = item.find('description')
                            pub_date = item.find('pubDate')
                            
                            if title is not None and link is not None:
                                # Extract company from title (format: "Job Title at Company")
                                title_text = title.text or ''
                                company_match = re.search(r' at (.+?)(?:\s*\(|$)', title_text)
                                company = company_match.group(1) if company_match else 'Company Not Listed'
                                
                                jobs.append(JobResult(
                                    title=title_text,
                                    company=company,
                                    location='Remote/Various',
                                    description=description.text[:500] if description is not None else '',
                                    url=link.text or '',
                                    remote=True,
                                    posted_date=pub_date.text if pub_date is not None else '',
                                    source='stackoverflow'
                                ))
                    
                    except ET.ParseError:
                        print("Could not parse Stack Overflow RSS feed")
        
        except Exception as e:
            print(f"Stack Overflow Jobs search error: {e}")
        
        return jobs
    
    def _deduplicate_jobs(self, jobs: List[JobResult]) -> List[JobResult]:
        """Remove duplicate jobs based on title and company"""
        
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            # Create a key based on title and company (normalized)
            key = (
                job.title.lower().strip(),
                job.company.lower().strip()
            )
            
            if key not in seen and job.title and job.company:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs
    
    def _score_jobs(self, jobs: List[JobResult], search_params: Dict) -> List[JobResult]:
        """Score jobs based on relevance and desirability"""
        
        for job in jobs:
            score = 50  # Base score
            
            # Score based on title relevance
            title_lower = job.title.lower()
            if any(term in title_lower for term in ['senior', 'lead', 'principal']):
                score -= 20  # Too senior
            elif any(term in title_lower for term in ['junior', 'entry', 'intern', 'new grad']):
                score += 20  # Perfect level
            
            # Score based on company and description keywords
            content = (job.title + ' ' + job.company + ' ' + job.description).lower()
            
            for keyword in self.high_value_keywords:
                if keyword in content:
                    score += 5
            
            # Salary bonus
            if job.salary_min and job.salary_min >= search_params.get('min_salary', 40000):
                score += 10
            
            # Remote work bonus
            if job.remote and search_params.get('remote_ok', True):
                score += 15
            
            # Recent posting bonus
            if job.posted_date:
                try:
                    posted = datetime.fromisoformat(job.posted_date.replace('Z', '+00:00'))
                    days_old = (datetime.now(posted.tzinfo) - posted).days
                    if days_old <= 7:
                        score += 10
                    elif days_old <= 30:
                        score += 5
                except:
                    pass
            
            # Source reliability bonus
            if job.source in ['adzuna', 'linkedin']:
                score += 5
            
            job.score = max(0, min(100, score))  # Clamp between 0-100
        
        return jobs
    
    def _extract_job_type(self, contract_type: str) -> str:
        """Extract standardized job type"""
        
        contract_lower = contract_type.lower()
        
        if 'full' in contract_lower or 'permanent' in contract_lower:
            return 'Full-time'
        elif 'part' in contract_lower:
            return 'Part-time'
        elif 'contract' in contract_lower:
            return 'Contract'
        elif 'intern' in contract_lower:
            return 'Internship'
        else:
            return 'Full-time'
    
    def _is_remote_job(self, location_text: str) -> bool:
        """Determine if job is remote"""
        
        location_lower = location_text.lower()
        remote_indicators = [
            'remote', 'work from home', 'distributed', 'anywhere',
            'wfh', 'telecommute', 'virtual', 'home-based'
        ]
        
        return any(indicator in location_lower for indicator in remote_indicators)
    
    async def _get_user_preferences(self, user_id: str) -> Dict:
        """Get user job search preferences"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profile_data",
                params={"user_id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    return data[0].get('job_preferences', {})
        
        # Default preferences
        return {
            'preferred_locations': ['United States'],
            'min_salary': 40000,
            'preferred_job_types': ['full-time', 'internship'],
            'remote_ok': True,
            'preferred_keywords': []
        }
    
    async def _get_applied_job_urls(self, user_id: str) -> set:
        """Get URLs of jobs user has already applied to"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/applications",
                params={"user_id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {app.get('job_url', '') for app in data}
        
        return set()
    
    async def _store_job_results(self, user_id: str, jobs: List[JobResult]):
        """Store job search results in database"""
        
        job_records = []
        current_time = datetime.now().isoformat()
        
        for job in jobs:
            job_records.append({
                'user_id': user_id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'description': job.description[:1000],  # Truncate for storage
                'url': job.url,
                'salary_min': job.salary_min,
                'salary_max': job.salary_max,
                'job_type': job.job_type,
                'remote': job.remote,
                'posted_date': job.posted_date,
                'source': job.source,
                'score': job.score,
                'found_at': current_time
            })
        
        # Store in batches
        batch_size = 50
        for i in range(0, len(job_records), batch_size):
            batch = job_records[i:i + batch_size]
            
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.supabase_url}/rest/v1/jobs",
                    json=batch,
                    headers={
                        "apikey": self.supabase_key,
                        "Authorization": f"Bearer {self.supabase_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=30
                )
    
    async def get_jobs_mobile(
        self, 
        user_id: str, 
        page: int = 1, 
        limit: int = 20,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """Get jobs for mobile API"""
        
        offset = (page - 1) * limit
        
        async with httpx.AsyncClient() as client:
            params = {
                "user_id": f"eq.{user_id}",
                "limit": str(limit),
                "offset": str(offset),
                "order": "score.desc,found_at.desc"
            }
            
            # Add filters if provided
            if filters:
                for key, value in filters.items():
                    params[key] = f"eq.{value}"
            
            response = await client.get(
                f"{self.supabase_url}/rest/v1/jobs",
                params=params,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                return response.json()
        
        return []
    
    async def count_jobs(self, user_id: str, filters: Optional[Dict] = None) -> int:
        """Count total jobs for pagination"""
        
        async with httpx.AsyncClient() as client:
            params = {
                "user_id": f"eq.{user_id}",
                "select": "count"
            }
            
            if filters:
                for key, value in filters.items():
                    params[key] = f"eq.{value}"
            
            response = await client.get(
                f"{self.supabase_url}/rest/v1/jobs",
                params=params,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0].get('count', 0) if data else 0
        
        return 0