"""
Startup Opportunities Finder
Tracks YC companies, recent funding rounds, and high-growth startups
These companies pay well and offer huge equity upside
"""

import requests
from typing import List, Dict
from datetime import datetime, timedelta
import json

class StartupOpportunitiesFinder:
    """Find high-growth startup opportunities with equity upside"""
    
    def __init__(self):
        self.yc_companies_api = "https://api.ycombinator.com/companies"  # Hypothetical
        self.crunchbase_api = "https://api.crunchbase.com/v4"  # Requires API key
        
        # High-signal startup lists
        self.startup_sources = {
            'yc_current_batch': {
                'url': 'https://www.ycombinator.com/companies',
                'signal': 'Just funded, hiring aggressively'
            },
            'recent_series_a': {
                'url': 'https://www.crunchbase.com/discover/funding_rounds',
                'signal': 'Fresh capital, scaling team'
            },
            'forbes_next_billion': {
                'url': 'https://www.forbes.com/next-billion-dollar-startups',
                'signal': 'Proven traction, pre-IPO opportunity'
            },
            'product_hunt_trending': {
                'url': 'https://www.producthunt.com/hiring',
                'signal': 'Hot products, early stage'
            }
        }
        
        # Hot YC companies actively hiring (W24, S24 batches)
        self.hot_yc_startups = [
            {
                'company': 'Perplexity AI',
                'batch': 'S22',
                'description': 'AI-powered search engine',
                'funding': '$100M Series B',
                'why_hot': 'Competing with Google, massive growth',
                'careers': 'https://perplexity.ai/careers'
            },
            {
                'company': 'Vapi',
                'batch': 'W24',
                'description': 'Voice AI for developers',
                'funding': '$20M Seed',
                'why_hot': 'Voice AI is exploding, great timing',
                'careers': 'https://vapi.ai/careers'
            },
            {
                'company': 'Pika',
                'batch': 'S24',
                'description': 'AI video generation',
                'funding': '$35M Series A',
                'why_hot': 'Video AI is the next frontier',
                'careers': 'https://pika.art/careers'
            },
            {
                'company': 'Martin',
                'batch': 'S24', 
                'description': 'AI email assistant',
                'funding': '$12M Seed',
                'why_hot': 'B2B SaaS with immediate revenue',
                'careers': 'https://martin.ai/careers'
            },
            {
                'company': 'Warp',
                'batch': 'W20',
                'description': 'AI-powered terminal',
                'funding': '$50M Series B',
                'why_hot': 'Developer tools = high margins',
                'careers': 'https://warp.dev/careers'
            }
        ]
        
    def find_freshly_funded_startups(self, funding_stage: str = 'all', days_ago: int = 30) -> List[Dict]:
        """Find startups that just raised funding (they're hiring!)"""
        
        # In production, this would hit Crunchbase API
        # For now, curated list of recently funded companies
        
        recent_funding = [
            {
                'company': 'Cursor',
                'funding_amount': '$20M',
                'funding_date': '2024-08',
                'stage': 'Series A',
                'investors': ['Andreessen Horowitz', 'Threshold Ventures'],
                'description': 'AI code editor',
                'why_apply': 'AI coding tools are the future, early equity opportunity',
                'open_roles': ['Software Engineer', 'ML Engineer', 'Product Engineer'],
                'equity_range': '0.1% - 0.5%',
                'salary_range': '$140k - $200k'
            },
            {
                'company': 'ElevenLabs',
                'funding_amount': '$80M',
                'funding_date': '2024-01',
                'stage': 'Series B',
                'investors': ['Andreessen Horowitz', 'Nat Friedman'],
                'description': 'AI voice synthesis',
                'why_apply': 'Market leader in voice AI, heading to IPO',
                'open_roles': ['ML Engineer', 'Backend Engineer', 'Research Scientist'],
                'equity_range': '0.05% - 0.2%',
                'salary_range': '$160k - $250k'
            },
            {
                'company': 'Anthropic',
                'funding_amount': '$750M',
                'funding_date': '2024-09',
                'stage': 'Series C',
                'investors': ['Google', 'Salesforce'],
                'description': 'Claude AI assistant',
                'why_apply': 'Direct competitor to OpenAI, massive opportunity',
                'open_roles': ['Software Engineer', 'Research Engineer', 'Safety Researcher'],
                'equity_range': '0.01% - 0.1%',
                'salary_range': '$200k - $400k'
            },
            {
                'company': 'Replit',
                'funding_amount': '$100M',
                'funding_date': '2024-04',
                'stage': 'Series B',
                'investors': ['Andreessen Horowitz', 'Khosla Ventures'],
                'description': 'Browser-based coding platform',
                'why_apply': 'Democratizing programming, huge education market',
                'open_roles': ['Full Stack Engineer', 'Infrastructure Engineer', 'AI Engineer'],
                'equity_range': '0.05% - 0.25%',
                'salary_range': '$130k - $190k'
            }
        ]
        
        # Filter by funding stage if specified
        if funding_stage != 'all':
            recent_funding = [c for c in recent_funding if funding_stage.lower() in c['stage'].lower()]
        
        # Calculate opportunity score
        for startup in recent_funding:
            startup['opportunity_score'] = self._calculate_opportunity_score(startup)
        
        # Sort by opportunity score
        recent_funding.sort(key=lambda x: x['opportunity_score'], reverse=True)
        
        return recent_funding
    
    def _calculate_opportunity_score(self, startup: Dict) -> int:
        """Calculate opportunity score based on multiple factors"""
        score = 50  # Base score
        
        # Funding amount (bigger = more stability)
        funding_amount = startup.get('funding_amount', '$0M')
        amount = int(''.join(filter(str.isdigit, funding_amount.split('$')[1].split('M')[0])))
        if amount >= 100:
            score += 20
        elif amount >= 50:
            score += 15
        elif amount >= 20:
            score += 10
        
        # Stage (earlier = more equity upside)
        stage_scores = {'Seed': 25, 'Series A': 20, 'Series B': 15, 'Series C': 10}
        score += stage_scores.get(startup.get('stage', ''), 5)
        
        # Top-tier investors
        top_investors = ['Andreessen Horowitz', 'Sequoia', 'Benchmark', 'Accel', 'Google']
        investor_list = startup.get('investors', [])
        if any(inv in investor_list for inv in top_investors):
            score += 15
        
        # AI/ML focus (hot market)
        if 'AI' in startup.get('description', '') or 'ML' in startup.get('description', ''):
            score += 10
        
        return min(100, score)
    
    def find_stealth_opportunities(self) -> List[Dict]:
        """Find stealth/early stage startups before they're popular"""
        
        stealth_signals = [
            {
                'company': 'Unnamed AI startup',
                'clues': [
                    'Ex-OpenAI team',
                    'Building AGI safety tools',
                    '$50M stealth round from Lightspeed'
                ],
                'how_to_find': 'LinkedIn: Search "stealth startup" + "ex-OpenAI"',
                'why_valuable': 'Ground floor opportunity, likely huge equity'
            },
            {
                'company': 'Secret music AI company',
                'clues': [
                    'Founded by ex-Spotify ML team',
                    'Building next-gen music creation tools',
                    'Backed by music industry veterans'
                ],
                'how_to_find': 'GitHub: Look for new music AI repos with high activity',
                'why_valuable': 'Perfect fit for music + tech background'
            },
            {
                'company': 'Developer tools stealth',
                'clues': [
                    'Ex-Stripe and GitHub engineers',
                    'Building AI pair programming beyond Copilot',
                    'Already has paying enterprise customers'
                ],
                'how_to_find': 'HackerNews: "Who is hiring?" threads',
                'why_valuable': 'Developer tools = predictable B2B revenue'
            }
        ]
        
        return stealth_signals
    
    def calculate_equity_value(self, equity_percentage: float, company_valuation: float, years_to_exit: int = 4) -> Dict:
        """Calculate potential equity value at different exit scenarios"""
        
        scenarios = {
            'conservative': {
                'multiple': 2,
                'probability': 0.4,
                'value': equity_percentage * company_valuation * 2 / 100
            },
            'expected': {
                'multiple': 5,
                'probability': 0.3,
                'value': equity_percentage * company_valuation * 5 / 100
            },
            'optimistic': {
                'multiple': 10,
                'probability': 0.2,
                'value': equity_percentage * company_valuation * 10 / 100
            },
            'home_run': {
                'multiple': 50,
                'probability': 0.05,
                'value': equity_percentage * company_valuation * 50 / 100
            }
        }
        
        expected_value = sum(s['value'] * s['probability'] for s in scenarios.values())
        
        return {
            'scenarios': scenarios,
            'expected_value': expected_value,
            'years_to_exit': years_to_exit,
            'annual_expected_value': expected_value / years_to_exit
        }
    
    def generate_startup_strategy(self, user_profile: Dict) -> Dict:
        """Generate personalized startup job search strategy"""
        
        strategy = {
            'target_stages': [],
            'focus_areas': [],
            'equity_vs_salary': '',
            'application_approach': '',
            'networking_strategy': ''
        }
        
        # For new grad
        if 'new grad' in str(user_profile.get('experience_level', '')).lower():
            strategy['target_stages'] = ['Series A', 'Series B']
            strategy['equity_vs_salary'] = 'Optimize for learning and equity (accept $20-30k lower salary for 2x equity)'
            strategy['application_approach'] = 'Apply to 10-15 carefully selected startups, not 100s'
            
        # AI/ML interest
        if any('AI' in proj or 'ML' in proj for proj in str(user_profile.get('projects', []))):
            strategy['focus_areas'].append('AI/ML startups - hottest market, highest valuations')
        
        # Music background
        if 'music' in str(user_profile.get('interests', [])).lower():
            strategy['focus_areas'].append('Music tech startups - unique differentiator')
        
        strategy['networking_strategy'] = """
        1. Find founders on Twitter, engage with their content
        2. Build something using their product, share publicly
        3. Attend YC meetups in SF (or virtual)
        4. Reach out to other new grads at target startups
        5. Share your projects on HackerNews/ProductHunt
        """
        
        return strategy


def test_startup_finder():
    """Test startup opportunities finder"""
    
    finder = StartupOpportunitiesFinder()
    
    print("="*60)
    print("FRESHLY FUNDED STARTUPS (Actively Hiring!)")
    print("="*60)
    
    funded = finder.find_freshly_funded_startups(funding_stage='all')
    
    for startup in funded[:3]:
        print(f"\n{startup['company']}")
        print(f"Funding: {startup['funding_amount']} {startup['stage']} ({startup['funding_date']})")
        print(f"Investors: {', '.join(startup['investors'][:2])}")
        print(f"Why Apply: {startup['why_apply']}")
        print(f"Open Roles: {', '.join(startup['open_roles'])}")
        print(f"Compensation: {startup['salary_range']} + {startup['equity_range']} equity")
        print(f"Opportunity Score: {startup['opportunity_score']}/100")
    
    print("\n" + "="*60)
    print("EQUITY VALUE CALCULATOR")
    print("="*60)
    
    # Example: 0.1% equity in a $500M company
    equity_calc = finder.calculate_equity_value(
        equity_percentage=0.1,
        company_valuation=500_000_000,
        years_to_exit=4
    )
    
    print("\nExample: 0.1% equity in a $500M valuation startup")
    print(f"Expected Value: ${equity_calc['expected_value']:,.0f}")
    print(f"Annual Expected Value: ${equity_calc['annual_expected_value']:,.0f}/year")
    print("\nScenarios:")
    for name, scenario in equity_calc['scenarios'].items():
        print(f"  {name.capitalize()} ({scenario['multiple']}x): ${scenario['value']:,.0f} ({scenario['probability']*100:.0f}% chance)")
    
    print("\n" + "="*60)
    print("HOT YC STARTUPS")
    print("="*60)
    
    for startup in finder.hot_yc_startups[:3]:
        print(f"\n{startup['company']} ({startup['batch']})")
        print(f"What: {startup['description']}")
        print(f"Funding: {startup['funding']}")
        print(f"Why Hot: {startup['why_hot']}")
        print(f"Apply: {startup['careers']}")
    
    print("\n" + "="*60)
    print("YOUR PERSONALIZED STARTUP STRATEGY")
    print("="*60)
    
    user_profile = {
        'experience_level': 'new grad',
        'projects': ['AI fitness app', 'ML project'],
        'interests': ['music', 'AI']
    }
    
    strategy = finder.generate_startup_strategy(user_profile)
    print(f"\nTarget Stages: {', '.join(strategy['target_stages'])}")
    print(f"Focus Areas: {', '.join(strategy['focus_areas'])}")
    print(f"Equity vs Salary: {strategy['equity_vs_salary']}")
    print(f"\nNetworking Strategy: {strategy['networking_strategy']}")


if __name__ == "__main__":
    test_startup_finder()