"""
Multi-Source Job Search Engine
Integrates multiple job APIs to find maximum opportunities
"""

import asyncio
import httpx
import json
import time
from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path

class MultiSourceJobSearch:
    """Comprehensive job search across multiple platforms"""
    
    def __init__(self):
        # API configurations
        self.apis = {
            'adzuna': {
                'app_id': '5305c49d',
                'api_key': '13a9a9862ef8dba5e373ba5f197773ef',
                'base_url': 'https://api.adzuna.com/v1/api/jobs/us/search/1',
                'enabled': True
            },
            # Add more APIs as they become available
            'indeed': {
                'enabled': False,  # Requires API key
                'note': 'Need Indeed Publisher API key'
            },
            'linkedin': {
                'enabled': False,  # Very expensive
                'note': 'LinkedIn API is enterprise-only'
            }
        }
        
        self.results_cache = {}
        
    async def search_all_sources(self, query: str, location: str = "", limit: int = 50) -> List[Dict]:
        """Search all enabled sources"""
        all_jobs = []
        
        print(f"\n[MULTI-SOURCE] Searching: {query}")
        print("-" * 50)
        
        # Adzuna (primary source)
        if self.apis['adzuna']['enabled']:
            adzuna_jobs = await self._search_adzuna(query, location, limit)
            all_jobs.extend(adzuna_jobs)
            print(f"  Adzuna: {len(adzuna_jobs)} jobs")
            await asyncio.sleep(0.5)  # Rate limiting
        
        # Future: Add Indeed, LinkedIn when API keys available
        if self.apis['indeed']['enabled']:
            indeed_jobs = await self._search_indeed(query, location, limit)
            all_jobs.extend(indeed_jobs)
            print(f"  Indeed: {len(indeed_jobs)} jobs")
        else:
            print(f"  Indeed: DISABLED ({self.apis['indeed']['note']})")
            
        if self.apis['linkedin']['enabled']:
            linkedin_jobs = await self._search_linkedin(query, location, limit)
            all_jobs.extend(linkedin_jobs)
            print(f"  LinkedIn: {len(linkedin_jobs)} jobs")
        else:
            print(f"  LinkedIn: DISABLED ({self.apis['linkedin']['note']})")
        
        # Deduplicate jobs
        unique_jobs = self._deduplicate_jobs(all_jobs)
        
        print(f"  Total: {len(all_jobs)} raw, {len(unique_jobs)} unique")
        
        return unique_jobs
    
    async def _search_adzuna(self, query: str, location: str, limit: int) -> List[Dict]:
        """Search Adzuna API"""
        try:
            config = self.apis['adzuna']
            url = config['base_url']
            
            params = {
                'app_id': config['app_id'],
                'app_key': config['api_key'],
                'results_per_page': min(limit, 50),  # Adzuna max
                'what': query,
                'content-type': 'application/json',
                'max_days_old': 30,
                'sort_by': 'date'
            }
            
            if location:
                params['where'] = location
            
            async with httpx.AsyncClient(timeout=30) as client:
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
                        'source': 'Adzuna',
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
                    
                    # Generate unique hash for deduplication
                    job['job_hash'] = self._generate_job_hash(job)
                    
                    if job['title'] and job['company']:
                        jobs.append(job)
                
                return jobs
                
        except Exception as e:
            print(f"    Adzuna error: {e}")
            return []
    
    async def _search_indeed(self, query: str, location: str, limit: int) -> List[Dict]:
        """Search Indeed API (placeholder for when API key is available)"""
        # This would implement Indeed Publisher API when available
        print("    Indeed API not configured")
        return []
    
    async def _search_linkedin(self, query: str, location: str, limit: int) -> List[Dict]:
        """Search LinkedIn API (placeholder for enterprise access)"""
        # This would implement LinkedIn Jobs API when available
        print("    LinkedIn API not configured")  
        return []
    
    def _generate_job_hash(self, job: Dict) -> str:
        """Generate unique hash for job deduplication"""
        import hashlib
        unique_string = f"{job.get('company', '')}_{job.get('title', '')}_{job.get('location', '')}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:12]
    
    def _deduplicate_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Remove duplicate jobs based on hash"""
        seen_hashes = set()
        unique_jobs = []
        
        for job in jobs:
            job_hash = job.get('job_hash')
            if job_hash and job_hash not in seen_hashes:
                seen_hashes.add(job_hash)
                unique_jobs.append(job)
        
        return unique_jobs
    
    async def comprehensive_search(self, queries: List[str], location: str = "") -> List[Dict]:
        """Run comprehensive search across all queries and sources"""
        print("\n[COMPREHENSIVE SEARCH] Starting multi-source job discovery")
        print("=" * 60)
        
        all_jobs = []
        total_queries = len(queries)
        
        for i, query in enumerate(queries, 1):
            print(f"\n[{i}/{total_queries}] Query: {query}")
            
            jobs = await self.search_all_sources(query, location, limit=20)
            all_jobs.extend(jobs)
            
            # Rate limiting between queries
            if i < total_queries:
                await asyncio.sleep(1.0)
        
        # Final deduplication across all results
        unique_jobs = self._deduplicate_jobs(all_jobs)
        
        print(f"\n[COMPREHENSIVE SEARCH] Complete!")
        print(f"Total raw results: {len(all_jobs)}")
        print(f"Unique jobs found: {len(unique_jobs)}")
        
        return unique_jobs
    
    def get_api_status(self) -> Dict:
        """Get status of all job search APIs"""
        status = {}
        for api_name, config in self.apis.items():
            status[api_name] = {
                'enabled': config.get('enabled', False),
                'note': config.get('note', 'Ready' if config.get('enabled') else 'Disabled')
            }
        return status
    
    def enable_api(self, api_name: str, **credentials) -> bool:
        """Enable an API with credentials"""
        if api_name not in self.apis:
            return False
        
        # Update API configuration with credentials
        self.apis[api_name].update(credentials)
        self.apis[api_name]['enabled'] = True
        
        print(f"✓ {api_name.title()} API enabled")
        return True
    
    async def test_api_connections(self) -> Dict:
        """Test all enabled API connections"""
        results = {}
        
        print("\n[API TEST] Testing all enabled connections...")
        
        for api_name, config in self.apis.items():
            if not config.get('enabled'):
                results[api_name] = {'status': 'disabled', 'note': config.get('note', '')}
                continue
            
            print(f"  Testing {api_name.title()}...")
            
            try:
                if api_name == 'adzuna':
                    test_jobs = await self._search_adzuna("software engineer", "", 1)
                    results[api_name] = {
                        'status': 'working' if len(test_jobs) > 0 else 'no_results',
                        'test_results': len(test_jobs)
                    }
                else:
                    results[api_name] = {'status': 'not_implemented'}
                    
            except Exception as e:
                results[api_name] = {'status': 'error', 'error': str(e)}
        
        return results


async def test_multi_source():
    """Test multi-source search functionality"""
    print("=" * 60)
    print("TESTING MULTI-SOURCE JOB SEARCH")
    print("=" * 60)
    
    searcher = MultiSourceJobSearch()
    
    # Test API status
    print("\n1. API Status:")
    status = searcher.get_api_status()
    for api, info in status.items():
        emoji = "✅" if info['enabled'] else "❌"
        print(f"  {emoji} {api.title()}: {info['note']}")
    
    # Test API connections
    print("\n2. API Connection Test:")
    connections = await searcher.test_api_connections()
    for api, result in connections.items():
        print(f"  {api.title()}: {result['status']}")
        if 'test_results' in result:
            print(f"    Found {result['test_results']} test results")
    
    # Test comprehensive search
    print("\n3. Comprehensive Search Test:")
    test_queries = [
        "software engineer new grad",
        "python developer entry level",
        "full stack developer junior"
    ]
    
    jobs = await searcher.comprehensive_search(test_queries, location="San Francisco")
    
    if jobs:
        print(f"\n4. Sample Results:")
        for i, job in enumerate(jobs[:3], 1):
            print(f"  {i}. {job['title']} at {job['company']} ({job['source']})")
            print(f"     Location: {job['location']}")
            if job.get('salary_min'):
                print(f"     Salary: ${job['salary_min']:,.0f}+")
    
    print("\n✅ Multi-source search test complete!")
    return jobs


if __name__ == "__main__":
    # Run test
    asyncio.run(test_multi_source())