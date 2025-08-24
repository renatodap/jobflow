"""
Modular Job Aggregator System
Searches multiple sources, gracefully handles failures, always returns best jobs available
"""

import os
import json
import hashlib
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobSource(Enum):
    """Enum for job sources with priority weights"""
    ADZUNA = ("Adzuna", 1.0, True)  # (name, weight, requires_api_key)
    REMOTIVE = ("Remotive", 1.0, False)
    USAJOBS = ("USAJobs", 0.9, False)
    GITHUB = ("GitHub", 0.8, False)
    REED = ("Reed", 1.0, True)
    FINDWORK = ("Findwork", 1.0, True)
    THEMUSE = ("TheMuse", 0.9, False)
    JOOBLE = ("Jooble", 0.9, True)
    
    def __init__(self, display_name: str, weight: float, requires_key: bool):
        self.display_name = display_name
        self.weight = weight
        self.requires_key = requires_key

@dataclass
class Job:
    """Standardized job posting structure"""
    # Required fields
    title: str
    company: str
    source: str
    url: str
    
    # Optional fields
    location: str = ""
    description: str = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    posted_date: Optional[str] = None
    job_type: str = "Full-time"
    remote: bool = False
    tags: List[str] = None
    
    # Scoring fields
    score: float = 0.0
    match_reasons: List[str] = None
    
    # Deduplication
    job_hash: str = ""
    
    def __post_init__(self):
        """Generate hash and initialize fields after creation"""
        if not self.job_hash:
            text = f"{self.company.lower()}{self.title.lower()}{self.location.lower()}"
            text = ''.join(text.split())
            self.job_hash = hashlib.md5(text.encode()).hexdigest()[:12]
        
        if self.tags is None:
            self.tags = []
        if self.match_reasons is None:
            self.match_reasons = []
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'source': self.source,
            'url': self.url,
            'description': self.description[:500] if self.description else '',
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'posted_date': self.posted_date,
            'job_type': self.job_type,
            'remote': self.remote,
            'tags': self.tags,
            'score': self.score,
            'match_reasons': self.match_reasons,
            'job_hash': self.job_hash
        }


class JobSourceAdapter:
    """Base class for job source adapters"""
    
    def __init__(self, source: JobSource):
        self.source = source
        self.is_available = self._check_availability()
    
    def _check_availability(self) -> bool:
        """Check if this source is available (has API keys if needed)"""
        if not self.source.requires_key:
            return True
        
        # Override in subclasses to check specific API keys
        return True
    
    def search(self, query: str, location: str = "", limit: int = 50) -> List[Job]:
        """Search for jobs - must be implemented by subclasses"""
        raise NotImplementedError
    
    def _safe_request(self, url: str, params: Dict = None, headers: Dict = None, 
                     timeout: int = 10) -> Optional[requests.Response]:
        """Make a safe HTTP request with error handling"""
        try:
            response = requests.get(url, params=params, headers=headers, timeout=timeout)
            if response.status_code == 200:
                return response
            else:
                logger.warning(f"{self.source.display_name} returned status {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.warning(f"{self.source.display_name} request failed: {e}")
            return None
        except Exception as e:
            logger.error(f"{self.source.display_name} unexpected error: {e}")
            return None


class AdzunaAdapter(JobSourceAdapter):
    """Adapter for Adzuna API"""
    
    def _check_availability(self) -> bool:
        return bool(os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_API_KEY'))
    
    def search(self, query: str, location: str = "us", limit: int = 50) -> List[Job]:
        if not self.is_available:
            logger.info("Adzuna API keys not configured, skipping")
            return []
        
        jobs = []
        app_id = os.getenv('ADZUNA_APP_ID')
        api_key = os.getenv('ADZUNA_API_KEY')
        
        url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
        params = {
            'app_id': app_id,
            'app_key': api_key,
            'what': query,
            'results_per_page': limit
        }
        
        response = self._safe_request(url, params=params)
        if response:
            try:
                data = response.json()
                for item in data.get('results', []):
                    job = Job(
                        title=item.get('title', ''),
                        company=item.get('company', {}).get('display_name', 'Unknown'),
                        location=item.get('location', {}).get('display_name', ''),
                        source=self.source.display_name,
                        url=item.get('redirect_url', ''),
                        description=item.get('description', ''),
                        salary_min=item.get('salary_min'),
                        salary_max=item.get('salary_max'),
                        posted_date=item.get('created', ''),
                        job_type=item.get('contract_type', 'Full-time')
                    )
                    jobs.append(job)
            except Exception as e:
                logger.error(f"Error parsing Adzuna response: {e}")
        
        return jobs


class RemotiveAdapter(JobSourceAdapter):
    """Adapter for Remotive.io (no API key needed)"""
    
    def search(self, query: str, location: str = "", limit: int = 50) -> List[Job]:
        jobs = []
        url = "https://remotive.io/api/remote-jobs"
        params = {
            'search': query,
            'limit': limit
        }
        
        response = self._safe_request(url, params=params)
        if response:
            try:
                data = response.json()
                for item in data.get('jobs', []):
                    job = Job(
                        title=item.get('title', ''),
                        company=item.get('company_name', 'Unknown'),
                        location='Remote',
                        source=self.source.display_name,
                        url=item.get('url', ''),
                        description=item.get('description', ''),
                        posted_date=item.get('publication_date', ''),
                        job_type=item.get('job_type', 'Full-time'),
                        remote=True,
                        tags=item.get('tags', [])
                    )
                    jobs.append(job)
            except Exception as e:
                logger.error(f"Error parsing Remotive response: {e}")
        
        return jobs


class USAJobsAdapter(JobSourceAdapter):
    """Adapter for USAJobs.gov (government jobs, no API key needed)"""
    
    def search(self, query: str, location: str = "", limit: int = 50) -> List[Job]:
        jobs = []
        headers = {
            'Host': 'data.usajobs.gov',
            'User-Agent': 'job_search_app',
            'Authorization-Key': 'DEMO_KEY'  # Public demo key
        }
        
        url = "https://data.usajobs.gov/api/search"
        params = {
            'Keyword': query,
            'LocationName': location,
            'ResultsPerPage': min(limit, 25)  # USAJobs limits to 25 per request
        }
        
        response = self._safe_request(url, params=params, headers=headers)
        if response:
            try:
                data = response.json()
                for item in data.get('SearchResult', {}).get('SearchResultItems', []):
                    desc = item.get('MatchedObjectDescriptor', {})
                    
                    # Parse salary
                    salary_info = desc.get('PositionRemuneration', [{}])[0]
                    salary_min = None
                    salary_max = None
                    if salary_info:
                        try:
                            salary_min = float(salary_info.get('MinimumRange', 0))
                            salary_max = float(salary_info.get('MaximumRange', 0))
                        except:
                            pass
                    
                    job = Job(
                        title=desc.get('PositionTitle', ''),
                        company=desc.get('OrganizationName', 'US Government'),
                        location=desc.get('PositionLocationDisplay', ''),
                        source=self.source.display_name,
                        url=desc.get('PositionURI', ''),
                        description=desc.get('UserArea', {}).get('Details', {}).get('JobSummary', ''),
                        salary_min=salary_min,
                        salary_max=salary_max,
                        posted_date=desc.get('PublicationStartDate', ''),
                        job_type=desc.get('PositionSchedule', [{}])[0].get('Name', 'Full-time')
                    )
                    jobs.append(job)
            except Exception as e:
                logger.error(f"Error parsing USAJobs response: {e}")
        
        return jobs


class TheMuseAdapter(JobSourceAdapter):
    """Adapter for TheMuse.com (no API key needed for basic search)"""
    
    def search(self, query: str, location: str = "", limit: int = 50) -> List[Job]:
        jobs = []
        url = "https://www.themuse.com/api/public/jobs"
        
        # TheMuse uses page-based pagination
        params = {
            'q': query,
            'location': location,
            'page': 1,
            'per_page': min(limit, 20)  # Max 20 per page
        }
        
        response = self._safe_request(url, params=params)
        if response:
            try:
                data = response.json()
                for item in data.get('results', []):
                    # TheMuse includes company info
                    company_name = item.get('company', {}).get('name', 'Unknown')
                    
                    job = Job(
                        title=item.get('name', ''),
                        company=company_name,
                        location=', '.join(loc.get('name', '') for loc in item.get('locations', [])),
                        source=self.source.display_name,
                        url=item.get('refs', {}).get('landing_page', ''),
                        description=item.get('contents', ''),
                        posted_date=item.get('publication_date', ''),
                        job_type=item.get('type', 'Full-time'),
                        tags=item.get('categories', [])
                    )
                    jobs.append(job)
            except Exception as e:
                logger.error(f"Error parsing TheMuse response: {e}")
        
        return jobs


class ModularJobAggregator:
    """
    Main aggregator that uses all available sources and returns best jobs
    """
    
    def __init__(self):
        self.adapters = self._initialize_adapters()
        self.seen_jobs = set()
        
    def _initialize_adapters(self) -> Dict[JobSource, JobSourceAdapter]:
        """Initialize all available adapters"""
        adapters = {}
        
        # Map sources to their adapter classes
        adapter_map = {
            JobSource.ADZUNA: AdzunaAdapter,
            JobSource.REMOTIVE: RemotiveAdapter,
            JobSource.USAJOBS: USAJobsAdapter,
            JobSource.THEMUSE: TheMuseAdapter,
        }
        
        for source, adapter_class in adapter_map.items():
            try:
                adapter = adapter_class(source)
                adapters[source] = adapter
                if adapter.is_available:
                    logger.info(f"[OK] {source.display_name} adapter initialized")
                else:
                    logger.info(f"[SKIP] {source.display_name} not available (missing API key)")
            except Exception as e:
                logger.error(f"Failed to initialize {source.display_name}: {e}")
        
        return adapters
    
    def search_all_sources(self, query: str, location: str = "", 
                          max_per_source: int = 50) -> List[Job]:
        """
        Search all available sources in parallel
        Returns aggregated list of unique jobs
        """
        all_jobs = []
        source_stats = {}
        
        # Use ThreadPoolExecutor for parallel searches
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Submit all search tasks
            future_to_source = {}
            for source, adapter in self.adapters.items():
                if adapter.is_available:
                    future = executor.submit(adapter.search, query, location, max_per_source)
                    future_to_source[future] = source
            
            # Collect results as they complete
            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    jobs = future.result(timeout=15)
                    
                    # Deduplicate and add to results
                    unique_jobs = []
                    for job in jobs:
                        if job.job_hash not in self.seen_jobs:
                            self.seen_jobs.add(job.job_hash)
                            all_jobs.append(job)
                            unique_jobs.append(job)
                    
                    source_stats[source.display_name] = {
                        'found': len(jobs),
                        'unique': len(unique_jobs)
                    }
                    
                    logger.info(f"  {source.display_name}: {len(jobs)} found, {len(unique_jobs)} unique")
                    
                except Exception as e:
                    logger.error(f"  {source.display_name} failed: {e}")
                    source_stats[source.display_name] = {'found': 0, 'unique': 0}
        
        # Log summary
        total_unique = len(all_jobs)
        logger.info(f"\nTotal unique jobs found: {total_unique}")
        for source_name, stats in source_stats.items():
            if stats['found'] > 0:
                pct = (stats['unique'] / total_unique * 100) if total_unique > 0 else 0
                logger.info(f"  {source_name}: {stats['unique']}/{stats['found']} ({pct:.1f}% of total)")
        
        return all_jobs
    
    def score_jobs(self, jobs: List[Job], user_profile: Dict) -> List[Job]:
        """
        Score jobs based on user profile and preferences
        """
        for job in jobs:
            score = 0.0
            match_reasons = []
            
            # Title match
            desired_roles = user_profile.get('preferences', {}).get('desired_roles', [])
            for role in desired_roles:
                if role.lower() in job.title.lower():
                    score += 30
                    match_reasons.append(f"Title matches desired role: {role}")
            
            # Location match
            preferred_locations = user_profile.get('preferences', {}).get('preferred_locations', [])
            for loc in preferred_locations:
                if loc.lower() in job.location.lower():
                    score += 20
                    match_reasons.append(f"Location match: {loc}")
            
            # Remote preference
            if user_profile.get('preferences', {}).get('remote_preference') == 'Remote Only':
                if job.remote:
                    score += 25
                    match_reasons.append("Remote position")
            
            # Salary range match
            min_salary = user_profile.get('preferences', {}).get('min_salary', 0)
            max_salary = user_profile.get('preferences', {}).get('max_salary', 999999)
            
            if job.salary_min and job.salary_max:
                if job.salary_min >= min_salary and job.salary_max <= max_salary:
                    score += 20
                    match_reasons.append("Salary in range")
                elif job.salary_max >= min_salary:
                    score += 10
                    match_reasons.append("Salary partially in range")
            
            # Skills match (check description for skills)
            skills = []
            for category in ['languages', 'frameworks', 'databases', 'tools']:
                skills.extend(user_profile.get('skills', {}).get(category, []))
            
            description_lower = (job.description or '').lower()
            matched_skills = []
            for skill in skills:
                if skill.lower() in description_lower:
                    matched_skills.append(skill)
            
            if matched_skills:
                score += min(25, len(matched_skills) * 5)
                match_reasons.append(f"Skills match: {', '.join(matched_skills[:3])}")
            
            # Source weight adjustment
            for source in JobSource:
                if source.display_name == job.source:
                    score *= source.weight
                    break
            
            # Cap score at 100
            job.score = min(100, score)
            job.match_reasons = match_reasons
        
        return jobs
    
    def get_best_jobs(self, query: str, location: str = "", 
                     user_profile: Dict = None, limit: int = 20) -> Dict[str, Any]:
        """
        Main method: Search all sources, score, and return best jobs
        Always returns the requested number of jobs (or all available if less)
        """
        logger.info(f"\n{'='*60}")
        logger.info(f"🔍 Searching for: '{query}' in '{location or 'anywhere'}'")
        logger.info(f"{'='*60}")
        
        # Search all available sources
        start_time = time.time()
        all_jobs = self.search_all_sources(query, location)
        search_time = time.time() - start_time
        
        if not all_jobs:
            logger.warning("No jobs found from any source!")
            return {
                'jobs': [],
                'total_found': 0,
                'sources_used': 0,
                'search_time': search_time,
                'query': query,
                'location': location
            }
        
        # Score jobs if profile provided
        if user_profile:
            all_jobs = self.score_jobs(all_jobs, user_profile)
            # Sort by score (highest first)
            all_jobs.sort(key=lambda x: x.score, reverse=True)
        else:
            # Sort by posted date if available
            all_jobs.sort(key=lambda x: x.posted_date or '', reverse=True)
        
        # Get top jobs (up to limit)
        top_jobs = all_jobs[:limit]
        
        # Calculate statistics
        sources_used = len(set(job.source for job in all_jobs))
        source_breakdown = {}
        for job in all_jobs:
            source_breakdown[job.source] = source_breakdown.get(job.source, 0) + 1
        
        logger.info(f"\n📊 Results Summary:")
        logger.info(f"  Total jobs found: {len(all_jobs)}")
        logger.info(f"  Sources used: {sources_used}")
        logger.info(f"  Returning top: {len(top_jobs)}")
        logger.info(f"  Search time: {search_time:.2f}s")
        
        if user_profile and top_jobs:
            avg_score = sum(job.score for job in top_jobs) / len(top_jobs)
            logger.info(f"  Average score of top {len(top_jobs)}: {avg_score:.1f}/100")
        
        return {
            'jobs': [job.to_dict() for job in top_jobs],
            'total_found': len(all_jobs),
            'sources_used': sources_used,
            'source_breakdown': source_breakdown,
            'search_time': search_time,
            'query': query,
            'location': location,
            'timestamp': datetime.now().isoformat()
        }
    
    def save_results(self, results: Dict, filename: str = None) -> str:
        """Save results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"data/daily_searches/modular_search_{timestamp}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"💾 Results saved to: {filename}")
        return filename


# Example usage and testing
if __name__ == "__main__":
    # Initialize aggregator
    aggregator = ModularJobAggregator()
    
    # Example user profile (would come from database in production)
    user_profile = {
        'preferences': {
            'desired_roles': ['Software Engineer', 'Backend Developer', 'Full Stack'],
            'preferred_locations': ['San Francisco', 'Remote', 'New York'],
            'remote_preference': 'Remote Only',
            'min_salary': 80000,
            'max_salary': 200000
        },
        'skills': {
            'languages': ['Python', 'JavaScript', 'TypeScript'],
            'frameworks': ['React', 'Django', 'FastAPI'],
            'databases': ['PostgreSQL', 'MongoDB'],
            'tools': ['Docker', 'Git', 'AWS']
        }
    }
    
    # Search and get best 20 jobs
    results = aggregator.get_best_jobs(
        query="software engineer",
        location="San Francisco",
        user_profile=user_profile,
        limit=20
    )
    
    # Save results
    aggregator.save_results(results)
    
    # Display top 5 jobs
    print(f"\n🎯 Top 5 Jobs (from {results['total_found']} total):")
    print("="*60)
    for i, job in enumerate(results['jobs'][:5], 1):
        print(f"\n{i}. {job['title']}")
        print(f"   Company: {job['company']}")
        print(f"   Location: {job['location']}")
        print(f"   Source: {job['source']}")
        print(f"   Score: {job['score']:.1f}/100")
        if job['match_reasons']:
            print(f"   Matches: {', '.join(job['match_reasons'][:2])}")
        print(f"   URL: {job['url'][:60]}...")