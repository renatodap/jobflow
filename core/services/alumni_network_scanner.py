"""
Alumni Network Scanner
Finds jobs at companies where Rose-Hulman alumni work
Higher success rate through warm connections
"""

import requests
from typing import List, Dict, Set
from datetime import datetime
import json

class AlumniNetworkScanner:
    """Find jobs through alumni connections - much higher success rate"""
    
    def __init__(self):
        # Rose-Hulman known alumni employers (this would be expanded with real data)
        self.alumni_companies = {
            'major_tech': [
                {'company': 'Microsoft', 'alumni_count': 500+, 'hiring_rate': 'high'},
                {'company': 'Google', 'alumni_count': 200+, 'hiring_rate': 'high'},
                {'company': 'Amazon', 'alumni_count': 300+, 'hiring_rate': 'high'},
                {'company': 'Apple', 'alumni_count': 150+, 'hiring_rate': 'medium'},
                {'company': 'Meta', 'alumni_count': 100+, 'hiring_rate': 'medium'},
                {'company': 'Tesla', 'alumni_count': 80+, 'hiring_rate': 'high'},
                {'company': 'SpaceX', 'alumni_count': 60+, 'hiring_rate': 'medium'},
            ],
            'consulting': [
                {'company': 'Deloitte', 'alumni_count': 100+, 'hiring_rate': 'high'},
                {'company': 'Accenture', 'alumni_count': 80+, 'hiring_rate': 'high'},
                {'company': 'PwC', 'alumni_count': 60+, 'hiring_rate': 'high'},
            ],
            'aerospace': [
                {'company': 'Boeing', 'alumni_count': 150+, 'hiring_rate': 'medium'},
                {'company': 'Lockheed Martin', 'alumni_count': 120+, 'hiring_rate': 'medium'},
                {'company': 'Northrop Grumman', 'alumni_count': 100+, 'hiring_rate': 'medium'},
                {'company': 'Raytheon', 'alumni_count': 80+, 'hiring_rate': 'medium'},
            ],
            'automotive': [
                {'company': 'General Motors', 'alumni_count': 100+, 'hiring_rate': 'high'},
                {'company': 'Ford', 'alumni_count': 80+, 'hiring_rate': 'medium'},
                {'company': 'Cummins', 'alumni_count': 200+, 'hiring_rate': 'high'},
                {'company': 'Honda', 'alumni_count': 60+, 'hiring_rate': 'medium'},
            ],
            'software': [
                {'company': 'Epic Systems', 'alumni_count': 150+, 'hiring_rate': 'high'},
                {'company': 'Salesforce', 'alumni_count': 80+, 'hiring_rate': 'high'},
                {'company': 'ServiceNow', 'alumni_count': 40+, 'hiring_rate': 'high'},
                {'company': 'Workday', 'alumni_count': 30+, 'hiring_rate': 'medium'},
                {'company': 'Palantir', 'alumni_count': 20+, 'hiring_rate': 'low'},
            ],
            'indiana_tech': [
                {'company': 'Roche Diagnostics', 'alumni_count': 100+, 'hiring_rate': 'high'},
                {'company': 'Eli Lilly', 'alumni_count': 150+, 'hiring_rate': 'high'},
                {'company': 'Allison Transmission', 'alumni_count': 80+, 'hiring_rate': 'medium'},
                {'company': 'Rolls-Royce', 'alumni_count': 120+, 'hiring_rate': 'medium'},
            ]
        }
        
        # LinkedIn patterns for finding alumni
        self.linkedin_search_patterns = [
            'site:linkedin.com/in "{company}" "Rose-Hulman"',
            'site:linkedin.com/in "{company}" "RHIT"',
            'site:linkedin.com/in "{company}" "Rose Hulman Institute of Technology"'
        ]
        
    def find_alumni_connection_jobs(self, user_preferences: Dict) -> List[Dict]:
        """Find jobs at companies with Rose-Hulman alumni"""
        
        jobs_with_connections = []
        
        for category, companies in self.alumni_companies.items():
            # Filter by user preferences
            if not self._matches_preferences(category, user_preferences):
                continue
            
            for company_info in companies:
                company = company_info['company']
                
                # Search for current openings
                jobs = self._search_company_jobs(company, user_preferences)
                
                for job in jobs:
                    # Enrich with alumni information
                    job['alumni_connection'] = True
                    job['alumni_count'] = company_info['alumni_count']
                    job['hiring_rate'] = company_info['hiring_rate']
                    job['connection_strength'] = self._calculate_connection_strength(company_info)
                    job['referral_probability'] = self._estimate_referral_probability(company_info)
                    job['suggested_approach'] = self._generate_networking_strategy(company, job)
                    
                    jobs_with_connections.append(job)
        
        # Sort by connection strength and fit
        jobs_with_connections.sort(
            key=lambda x: (x['connection_strength'], x.get('score', 0)), 
            reverse=True
        )
        
        return jobs_with_connections
    
    def _matches_preferences(self, category: str, preferences: Dict) -> bool:
        """Check if category matches user preferences"""
        
        category_mapping = {
            'major_tech': ['software', 'ai', 'ml', 'full-stack'],
            'software': ['software', 'saas', 'cloud'],
            'aerospace': ['aerospace', 'defense', 'hardware'],
            'automotive': ['automotive', 'manufacturing', 'robotics'],
            'consulting': ['consulting', 'strategy', 'business'],
            'indiana_tech': ['biotech', 'pharma', 'medical']
        }
        
        user_interests = preferences.get('industries', []) + preferences.get('target_roles', [])
        user_interests = [i.lower() for i in user_interests]
        
        # Check for overlap
        category_keywords = category_mapping.get(category, [])
        return any(keyword in ' '.join(user_interests) for keyword in category_keywords)
    
    def _search_company_jobs(self, company: str, preferences: Dict) -> List[Dict]:
        """Search for jobs at specific company"""
        # This would integrate with job search APIs
        # For now, return mock data
        
        mock_jobs = [
            {
                'title': f'Software Engineer - New Grad 2026',
                'company': company,
                'location': 'Various Locations',
                'description': f'Join {company} as a new grad software engineer',
                'url': f'https://careers.{company.lower().replace(" ", "")}.com',
                'posted_date': datetime.now().isoformat()
            }
        ]
        
        return mock_jobs
    
    def _calculate_connection_strength(self, company_info: Dict) -> int:
        """Calculate strength of alumni connection"""
        score = 0
        
        # Alumni count factor
        if company_info['alumni_count'] >= 200:
            score += 40
        elif company_info['alumni_count'] >= 100:
            score += 30
        elif company_info['alumni_count'] >= 50:
            score += 20
        else:
            score += 10
        
        # Hiring rate factor
        hiring_rates = {'high': 30, 'medium': 20, 'low': 10}
        score += hiring_rates.get(company_info['hiring_rate'], 0)
        
        # Recent hire factor (would check LinkedIn for recent grads)
        score += 20  # Bonus if recent grads were hired
        
        return min(100, score)
    
    def _estimate_referral_probability(self, company_info: Dict) -> str:
        """Estimate probability of getting a referral"""
        
        if company_info['alumni_count'] >= 100 and company_info['hiring_rate'] == 'high':
            return 'very_high'
        elif company_info['alumni_count'] >= 50:
            return 'high'
        elif company_info['alumni_count'] >= 20:
            return 'medium'
        else:
            return 'low'
    
    def _generate_networking_strategy(self, company: str, job: Dict) -> Dict:
        """Generate personalized networking strategy"""
        
        strategy = {
            'linkedin_search': f'"Rose-Hulman" "{company}" "Software Engineer"',
            'message_template': self._create_outreach_template(company, job),
            'target_titles': [
                f'Software Engineer at {company}',
                f'Engineering Manager at {company}',
                f'Senior Engineer at {company}',
                f'New Grad at {company}'
            ],
            'approach': 'warm',
            'talking_points': [
                'Rose-Hulman connection',
                'Similar technical background',
                'Interest in company culture',
                'Career path questions'
            ]
        }
        
        return strategy
    
    def _create_outreach_template(self, company: str, job: Dict) -> str:
        """Create LinkedIn outreach template for alumni"""
        
        template = f"""Hi [Name],

I noticed you're a fellow Rose-Hulman alum working at {company} - go Fightin' Engineers! 

I'm a current CS student graduating in May 2026 and really interested in the {job['title']} role at {company}. 

I've been working on some exciting projects including an AI fitness platform using computer vision and would love to hear about your experience transitioning from Rose to {company}.

Would you have 15 minutes for a quick chat about the engineering culture and new grad opportunities at {company}?

Best,
Renato
RHIT Class of 2026"""

        return template
    
    def find_warm_connections(self, company: str) -> List[Dict]:
        """Find specific alumni at target company for warm introductions"""
        
        # This would integrate with LinkedIn API or scraping
        # For now, return guidance
        
        search_strategies = [
            {
                'method': 'LinkedIn Alumni Tool',
                'steps': [
                    f'Go to LinkedIn.com/school/rose-hulman-institute-of-technology/people/',
                    f'Filter by "Where they work" → {company}',
                    'Sort by "Recently active" for engaged alumni',
                    'Look for recent grads (2020-2024) for relatability'
                ]
            },
            {
                'method': 'LinkedIn Search',
                'query': f'"{company}" "Rose-Hulman" "Software Engineer"',
                'filters': ['2nd degree connections', 'Current company', 'School']
            },
            {
                'method': 'Rose-Hulman Career Services',
                'action': 'Request alumni mentor list for company',
                'email': 'careers@rose-hulman.edu'
            }
        ]
        
        return search_strategies


def test_alumni_scanner():
    """Test alumni network scanner"""
    
    scanner = AlumniNetworkScanner()
    
    # User preferences
    preferences = {
        'industries': ['software', 'ai', 'tech'],
        'target_roles': ['Software Engineer', 'ML Engineer'],
        'locations': ['San Francisco', 'Seattle', 'Austin', 'Remote']
    }
    
    print("Scanning Rose-Hulman alumni network for opportunities...")
    jobs = scanner.find_alumni_connection_jobs(preferences)
    
    print(f"\nFound {len(jobs)} jobs with alumni connections!\n")
    
    for job in jobs[:5]:
        print(f"{'='*60}")
        print(f"Company: {job['company']}")
        print(f"Title: {job['title']}")
        print(f"Alumni Count: {job['alumni_count']}+")
        print(f"Connection Strength: {job['connection_strength']}/100")
        print(f"Referral Probability: {job['referral_probability']}")
        print(f"Hiring Rate: {job['hiring_rate']}")
        print(f"\nNetworking Strategy:")
        strategy = job['suggested_approach']
        print(f"  LinkedIn Search: {strategy['linkedin_search']}")
        print(f"  Approach Type: {strategy['approach']}")
        print(f"  Key Talking Points: {', '.join(strategy['talking_points'][:3])}")
    
    print(f"\n{'='*60}")
    print("Warm Connection Finding Strategy:")
    
    strategies = scanner.find_warm_connections("Microsoft")
    for strategy in strategies:
        print(f"\nMethod: {strategy['method']}")
        if 'steps' in strategy:
            for step in strategy['steps']:
                print(f"  • {step}")
        if 'query' in strategy:
            print(f"  Search: {strategy['query']}")


if __name__ == "__main__":
    test_alumni_scanner()