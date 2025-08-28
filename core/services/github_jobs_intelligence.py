"""
GitHub Jobs Intelligence
Finds jobs from companies using your tech stack by analyzing their repos
"""

import requests
from typing import List, Dict, Set
import json
from datetime import datetime, timedelta

class GitHubJobsIntelligence:
    """Discover companies actively hiring that use your exact tech stack"""
    
    def __init__(self, github_token: str = None):
        self.github_token = github_token
        self.headers = {
            'Authorization': f'token {github_token}' if github_token else None,
            'Accept': 'application/vnd.github.v3+json'
        }
        
    def find_companies_using_stack(self, user_profile: Dict) -> List[Dict]:
        """Find companies using the same tech stack as user's projects"""
        
        # Extract user's tech stack from profile
        user_stack = self._extract_user_stack(user_profile)
        
        companies = []
        
        # Search for repos using similar stack
        for tech in user_stack['primary']:
            query = f"{tech} in:readme stars:>100 pushed:>{(datetime.now() - timedelta(days=30)).isoformat()}"
            
            try:
                response = requests.get(
                    'https://api.github.com/search/repositories',
                    params={'q': query, 'sort': 'stars', 'per_page': 20},
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    for repo in data.get('items', []):
                        org = repo.get('owner', {})
                        if org.get('type') == 'Organization':
                            company = {
                                'name': org['login'],
                                'github_url': org['html_url'],
                                'avatar': org['avatar_url'],
                                'repo_name': repo['name'],
                                'repo_url': repo['html_url'],
                                'stars': repo['stargazers_count'],
                                'language': repo['language'],
                                'tech_match': tech,
                                'last_active': repo['pushed_at'],
                                'description': repo.get('description', '')
                            }
                            
                            # Check if they're hiring
                            if self._check_if_hiring(org['login']):
                                company['hiring'] = True
                                company['careers_url'] = self._find_careers_url(org['login'])
                                companies.append(company)
                
            except Exception as e:
                print(f"Error searching GitHub: {e}")
        
        # Score and rank companies
        scored_companies = self._score_companies(companies, user_profile)
        
        return scored_companies
    
    def _extract_user_stack(self, user_profile: Dict) -> Dict:
        """Extract tech stack from user profile"""
        stack = {
            'primary': [],
            'secondary': []
        }
        
        # From user's projects
        for project in user_profile.get('projects', []):
            for tech in project.get('technologies', []):
                if tech not in stack['primary'] and len(stack['primary']) < 5:
                    stack['primary'].append(tech)
        
        # From skills
        for skill in user_profile.get('technical_skills', {}).get('frameworks', []):
            if skill not in stack['primary'] and skill not in stack['secondary']:
                stack['secondary'].append(skill)
        
        return stack
    
    def _check_if_hiring(self, org_name: str) -> bool:
        """Check if organization is actively hiring"""
        
        # Method 1: Check for hiring in repo descriptions
        try:
            response = requests.get(
                f'https://api.github.com/orgs/{org_name}/repos',
                params={'type': 'public', 'sort': 'updated', 'per_page': 10},
                headers=self.headers
            )
            
            if response.status_code == 200:
                repos = response.json()
                hiring_keywords = ['hiring', 'careers', 'jobs', 'join us', 'we\'re hiring']
                
                for repo in repos:
                    desc = (repo.get('description') or '').lower()
                    if any(keyword in desc for keyword in hiring_keywords):
                        return True
        except:
            pass
        
        # Method 2: Check for recent high commit activity (growing team)
        try:
            response = requests.get(
                f'https://api.github.com/orgs/{org_name}/events',
                params={'per_page': 100},
                headers=self.headers
            )
            
            if response.status_code == 200:
                events = response.json()
                
                # Count unique contributors in last 30 days
                recent_contributors = set()
                for event in events:
                    if event.get('type') in ['PushEvent', 'PullRequestEvent']:
                        recent_contributors.add(event.get('actor', {}).get('login'))
                
                # If many active contributors, likely hiring
                if len(recent_contributors) > 10:
                    return True
        except:
            pass
        
        return False
    
    def _find_careers_url(self, org_name: str) -> str:
        """Try to find the careers page URL"""
        
        # Common patterns
        common_urls = [
            f"https://{org_name.lower()}.com/careers",
            f"https://{org_name.lower()}.com/jobs",
            f"https://www.{org_name.lower()}.com/careers",
            f"https://careers.{org_name.lower()}.com",
            f"https://jobs.{org_name.lower()}.com"
        ]
        
        # Check if URL exists
        for url in common_urls:
            try:
                response = requests.head(url, timeout=3)
                if response.status_code < 400:
                    return url
            except:
                continue
        
        # Fallback to GitHub page
        return f"https://github.com/{org_name}"
    
    def _score_companies(self, companies: List[Dict], user_profile: Dict) -> List[Dict]:
        """Score companies based on fit with user profile"""
        
        for company in companies:
            score = 50  # Base score
            
            # Tech stack match
            user_techs = set()
            for project in user_profile.get('projects', []):
                user_techs.update(project.get('technologies', []))
            
            if company['language'] in user_profile.get('technical_skills', {}).get('languages', []):
                score += 20
            
            # Activity level (more stars = more established)
            if company['stars'] > 1000:
                score += 15
            elif company['stars'] > 100:
                score += 10
            
            # Recent activity
            try:
                last_active = datetime.fromisoformat(company['last_active'].replace('Z', '+00:00'))
                days_since = (datetime.now() - last_active).days
                if days_since < 7:
                    score += 10
                elif days_since < 30:
                    score += 5
            except:
                pass
            
            company['fit_score'] = min(100, score)
        
        # Sort by fit score
        companies.sort(key=lambda x: x['fit_score'], reverse=True)
        
        return companies
    
    def find_trending_tech_companies(self) -> List[Dict]:
        """Find fast-growing tech companies (potential high-growth opportunities)"""
        
        trending = []
        
        # Search for repos that gained lots of stars recently
        query = "created:>2022-01-01 stars:>1000 language:TypeScript OR language:Python"
        
        try:
            response = requests.get(
                'https://api.github.com/search/repositories',
                params={'q': query, 'sort': 'stars', 'per_page': 30},
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                
                for repo in data.get('items', []):
                    if repo.get('owner', {}).get('type') == 'Organization':
                        trending.append({
                            'company': repo['owner']['login'],
                            'product': repo['name'],
                            'stars': repo['stargazers_count'],
                            'growth_indicator': 'high_stars',
                            'github_url': repo['html_url'],
                            'description': repo.get('description', ''),
                            'main_language': repo.get('language'),
                            'created_at': repo['created_at']
                        })
        except Exception as e:
            print(f"Error finding trending companies: {e}")
        
        return trending


def test_github_intelligence():
    """Test GitHub jobs intelligence"""
    
    # Sample user profile (Renato's)
    user_profile = {
        'projects': [
            {
                'name': 'FeelSharper',
                'technologies': ['Next.js', 'TypeScript', 'FastAPI', 'OpenCV', 'MediaPipe']
            },
            {
                'name': 'JobFlow',
                'technologies': ['Python', 'FastAPI', 'OpenAI API', 'PostgreSQL']
            }
        ],
        'technical_skills': {
            'languages': ['Python', 'TypeScript', 'JavaScript', 'Java'],
            'frameworks': ['React', 'Next.js', 'FastAPI', 'Django']
        }
    }
    
    # Initialize (add GitHub token for higher rate limits)
    intel = GitHubJobsIntelligence()
    
    print("Finding companies using your tech stack...")
    companies = intel.find_companies_using_stack(user_profile)
    
    print(f"\nFound {len(companies)} companies actively using your stack:")
    for company in companies[:5]:
        print(f"\n{'='*60}")
        print(f"Company: {company['name']}")
        print(f"Tech Match: {company['tech_match']}")
        print(f"Stars: {company['stars']:,}")
        print(f"Fit Score: {company['fit_score']}/100")
        print(f"Hiring: {company.get('hiring', 'Unknown')}")
        print(f"GitHub: {company['github_url']}")
        if company.get('careers_url'):
            print(f"Careers: {company['careers_url']}")
    
    print("\n" + "="*60)
    print("Finding trending tech companies...")
    trending = intel.find_trending_tech_companies()
    
    print(f"\nFound {len(trending)} fast-growing companies:")
    for company in trending[:3]:
        print(f"\nCompany: {company['company']}")
        print(f"Product: {company['product']}")
        print(f"Stars: {company['stars']:,}")
        print(f"Language: {company['main_language']}")


if __name__ == "__main__":
    test_github_intelligence()