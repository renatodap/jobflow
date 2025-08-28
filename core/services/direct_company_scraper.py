"""
Direct Company Career Page Scraper
Finds hidden gems not on job boards
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
import re
from datetime import datetime

class DirectCompanyScraper:
    """Scrapes directly from company career pages for fresh, exclusive jobs"""
    
    def __init__(self):
        # Target companies organized by category
        self.target_companies = {
            'ai_leaders': [
                {'name': 'OpenAI', 'careers_url': 'https://openai.com/careers/', 'api': 'greenhouse'},
                {'name': 'Anthropic', 'careers_url': 'https://www.anthropic.com/careers', 'api': 'lever'},
                {'name': 'Cohere', 'careers_url': 'https://cohere.com/careers', 'api': 'greenhouse'},
                {'name': 'Stability AI', 'careers_url': 'https://stability.ai/careers', 'api': 'greenhouse'},
                {'name': 'Midjourney', 'careers_url': 'https://www.midjourney.com/careers', 'api': 'custom'},
            ],
            'music_tech': [
                {'name': 'Spotify', 'careers_url': 'https://www.lifeatspotify.com/jobs', 'api': 'custom'},
                {'name': 'SoundCloud', 'careers_url': 'https://careers.soundcloud.com', 'api': 'lever'},
                {'name': 'Native Instruments', 'careers_url': 'https://www.native-instruments.com/en/careers/', 'api': 'custom'},
                {'name': 'Ableton', 'careers_url': 'https://www.ableton.com/en/jobs/', 'api': 'custom'},
                {'name': 'Splice', 'careers_url': 'https://splice.com/careers', 'api': 'greenhouse'},
            ],
            'hot_startups': [
                {'name': 'Perplexity', 'careers_url': 'https://www.perplexity.ai/careers', 'api': 'ashby'},
                {'name': 'Character.AI', 'careers_url': 'https://character.ai/careers', 'api': 'lever'},
                {'name': 'Replit', 'careers_url': 'https://replit.com/careers', 'api': 'ashby'},
                {'name': 'Vercel', 'careers_url': 'https://vercel.com/careers', 'api': 'greenhouse'},
                {'name': 'Railway', 'careers_url': 'https://railway.app/careers', 'api': 'custom'},
            ],
            'sports_tech': [
                {'name': 'Strava', 'careers_url': 'https://www.strava.com/careers', 'api': 'greenhouse'},
                {'name': 'Whoop', 'careers_url': 'https://www.whoop.com/careers/', 'api': 'greenhouse'},
                {'name': 'Peloton', 'careers_url': 'https://www.onepeloton.com/careers', 'api': 'custom'},
                {'name': 'Tonal', 'careers_url': 'https://www.tonal.com/careers/', 'api': 'lever'},
                {'name': 'Zwift', 'careers_url': 'https://www.zwift.com/careers', 'api': 'greenhouse'},
            ],
            'fintech_leaders': [
                {'name': 'Stripe', 'careers_url': 'https://stripe.com/jobs', 'api': 'greenhouse'},
                {'name': 'Plaid', 'careers_url': 'https://plaid.com/careers/', 'api': 'lever'},
                {'name': 'Ramp', 'careers_url': 'https://ramp.com/careers', 'api': 'ashby'},
                {'name': 'Mercury', 'careers_url': 'https://mercury.com/careers', 'api': 'ashby'},
                {'name': 'Brex', 'careers_url': 'https://www.brex.com/careers', 'api': 'lever'},
            ]
        }
        
    async def scrape_greenhouse_api(self, company_name: str, base_url: str) -> List[Dict]:
        """Scrape companies using Greenhouse API"""
        api_url = f"https://boards-api.greenhouse.io/v1/boards/{company_name.lower().replace(' ', '')}/jobs"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        jobs = []
                        for job in data.get('jobs', []):
                            # Filter for new grad/entry level
                            if self._is_relevant_job(job['title']):
                                jobs.append({
                                    'title': job['title'],
                                    'company': company_name,
                                    'location': job.get('location', {}).get('name', 'Remote'),
                                    'url': job['absolute_url'],
                                    'posted_date': job.get('updated_at'),
                                    'department': job.get('departments', [{}])[0].get('name', ''),
                                    'source': 'direct_company_page',
                                    'freshness': self._calculate_freshness(job.get('updated_at'))
                                })
                        return jobs
            except Exception as e:
                print(f"Error scraping {company_name}: {e}")
        return []
    
    async def scrape_lever_api(self, company_name: str, lever_handle: str) -> List[Dict]:
        """Scrape companies using Lever API"""
        api_url = f"https://api.lever.co/v0/postings/{lever_handle}"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        jobs = []
                        for job in data:
                            if self._is_relevant_job(job['text']):
                                jobs.append({
                                    'title': job['text'],
                                    'company': company_name,
                                    'location': job.get('categories', {}).get('location', 'Remote'),
                                    'url': job['applyUrl'],
                                    'posted_date': job.get('createdAt'),
                                    'team': job.get('categories', {}).get('team', ''),
                                    'source': 'direct_company_page',
                                    'freshness': self._calculate_freshness(job.get('createdAt'))
                                })
                        return jobs
            except Exception as e:
                print(f"Error scraping {company_name}: {e}")
        return []
    
    async def scrape_ashby_api(self, company_name: str) -> List[Dict]:
        """Scrape companies using Ashby (newer startups)"""
        # Ashby uses GraphQL, more complex but doable
        api_url = f"https://{company_name.lower()}.ashbyhq.com/api/posting-api/job-board/{company_name.lower()}"
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(api_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        jobs = []
                        for job in data.get('jobs', []):
                            if self._is_relevant_job(job.get('title', '')):
                                jobs.append({
                                    'title': job['title'],
                                    'company': company_name,
                                    'location': job.get('location', 'Remote'),
                                    'url': f"https://{company_name.lower()}.ashbyhq.com/jobs/{job['id']}",
                                    'posted_date': job.get('publishedDate'),
                                    'source': 'direct_company_page',
                                    'exclusive': True,  # These are often exclusive postings
                                    'freshness': self._calculate_freshness(job.get('publishedDate'))
                                })
                        return jobs
            except Exception as e:
                print(f"Error scraping {company_name} via Ashby: {e}")
        return []
    
    def _is_relevant_job(self, title: str) -> bool:
        """Check if job is relevant for new grads"""
        title_lower = title.lower()
        
        # Positive indicators
        positive_keywords = [
            'new grad', 'entry level', 'junior', 'associate',
            'university grad', '2024', '2025', '2026', 'early career',
            'software engineer i', 'swe i', 'engineer i'
        ]
        
        # Negative indicators (skip senior roles)
        negative_keywords = [
            'senior', 'principal', 'staff', 'lead', 'manager',
            'director', 'vp', 'head of', '10+ years', '7+ years'
        ]
        
        # Check positive matches
        if any(keyword in title_lower for keyword in positive_keywords):
            return True
        
        # Check negative matches
        if any(keyword in title_lower for keyword in negative_keywords):
            return False
        
        # Generic "Software Engineer" without seniority is usually entry-friendly
        if 'software engineer' in title_lower and not any(neg in title_lower for neg in negative_keywords):
            return True
        
        return False
    
    def _calculate_freshness(self, posted_date) -> str:
        """Calculate how fresh the job posting is"""
        if not posted_date:
            return 'unknown'
        
        try:
            # Parse the date
            if isinstance(posted_date, int):
                # Unix timestamp
                posted = datetime.fromtimestamp(posted_date / 1000)
            else:
                # ISO format
                posted = datetime.fromisoformat(posted_date.replace('Z', '+00:00'))
            
            days_old = (datetime.now() - posted).days
            
            if days_old == 0:
                return 'posted_today'
            elif days_old <= 3:
                return 'very_fresh'
            elif days_old <= 7:
                return 'fresh'
            elif days_old <= 14:
                return 'recent'
            else:
                return 'older'
        except:
            return 'unknown'
    
    async def scrape_all_companies(self, categories: List[str] = None) -> List[Dict]:
        """Scrape all target companies or specific categories"""
        all_jobs = []
        
        if not categories:
            categories = self.target_companies.keys()
        
        for category in categories:
            if category not in self.target_companies:
                continue
                
            print(f"Scraping {category} companies...")
            
            for company in self.target_companies[category]:
                print(f"  Checking {company['name']}...")
                
                jobs = []
                if company['api'] == 'greenhouse':
                    jobs = await self.scrape_greenhouse_api(company['name'], company['careers_url'])
                elif company['api'] == 'lever':
                    lever_handle = company['careers_url'].split('/')[-2]
                    jobs = await self.scrape_lever_api(company['name'], lever_handle)
                elif company['api'] == 'ashby':
                    jobs = await self.scrape_ashby_api(company['name'])
                
                # Add category and interest score
                for job in jobs:
                    job['category'] = category
                    job['interest_score'] = self._calculate_interest_score(job, category)
                
                all_jobs.extend(jobs)
                
                # Be respectful with rate limiting
                await asyncio.sleep(1)
        
        # Sort by interest score and freshness
        all_jobs.sort(key=lambda x: (x.get('interest_score', 0), x.get('freshness', 'z')), reverse=True)
        
        return all_jobs
    
    def _calculate_interest_score(self, job: Dict, category: str) -> int:
        """Calculate interest score based on user preferences"""
        score = 50  # Base score
        
        # Category bonuses
        category_scores = {
            'ai_leaders': 30,
            'music_tech': 25,  # High for Renato (musician)
            'sports_tech': 20,  # Tennis player
            'hot_startups': 15,
            'fintech_leaders': 10
        }
        score += category_scores.get(category, 0)
        
        # Freshness bonus
        freshness_scores = {
            'posted_today': 20,
            'very_fresh': 15,
            'fresh': 10,
            'recent': 5
        }
        score += freshness_scores.get(job.get('freshness', ''), 0)
        
        # Title relevance
        title_lower = job['title'].lower()
        if 'ai' in title_lower or 'ml' in title_lower:
            score += 10
        if 'new grad' in title_lower or '2026' in title_lower:
            score += 15
        
        return min(100, score)


async def test_company_scraper():
    """Test the company scraper"""
    scraper = DirectCompanyScraper()
    
    # Test specific categories relevant to user
    jobs = await scraper.scrape_all_companies(['ai_leaders', 'music_tech'])
    
    print(f"\nFound {len(jobs)} exclusive jobs from company pages!")
    
    # Show top 5
    for job in jobs[:5]:
        print(f"\n{'='*60}")
        print(f"Title: {job['title']}")
        print(f"Company: {job['company']} ({job['category']})")
        print(f"Location: {job['location']}")
        print(f"Freshness: {job['freshness']}")
        print(f"Interest Score: {job['interest_score']}/100")
        print(f"URL: {job['url']}")
    
    return jobs


if __name__ == "__main__":
    asyncio.run(test_company_scraper())