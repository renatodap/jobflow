"""
API Marketplace Service for JobFlow
Monetize API access with usage-based billing
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class APIMarketplaceService:
    """Manages API marketplace and usage-based billing"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        self.pricing_tiers = self._get_pricing_tiers()
        
    def _get_pricing_tiers(self) -> Dict:
        """Define API pricing tiers"""
        
        return {
            'free': {
                'name': 'Free Tier',
                'price': 0,
                'requests_per_month': 100,
                'rate_limit': 10,  # requests per minute
                'features': ['job_search', 'basic_resume'],
                'support': 'community'
            },
            'starter': {
                'name': 'Starter',
                'price': 49,  # per month
                'requests_per_month': 1000,
                'rate_limit': 30,
                'features': ['job_search', 'resume', 'cover_letter', 'scoring'],
                'support': 'email'
            },
            'growth': {
                'name': 'Growth',
                'price': 199,
                'requests_per_month': 5000,
                'rate_limit': 60,
                'features': ['all_endpoints', 'webhooks', 'batch_operations'],
                'support': 'priority'
            },
            'scale': {
                'name': 'Scale',
                'price': 499,
                'requests_per_month': 20000,
                'rate_limit': 120,
                'features': ['all_endpoints', 'webhooks', 'batch_operations', 'custom_models'],
                'support': 'dedicated'
            },
            'enterprise': {
                'name': 'Enterprise',
                'price': 'custom',
                'requests_per_month': 'unlimited',
                'rate_limit': 'custom',
                'features': ['everything', 'sla', 'custom_integration'],
                'support': 'white_glove'
            }
        }
    
    async def create_api_subscription(
        self,
        user_id: str,
        tier: str,
        payment_method_id: Optional[str] = None
    ) -> Dict:
        """
        Create API subscription for developer
        
        Args:
            user_id: User ID
            tier: Subscription tier
            payment_method_id: Stripe payment method
        
        Returns:
            API subscription details
        """
        
        if tier not in self.pricing_tiers:
            return {'error': 'Invalid subscription tier'}
        
        tier_config = self.pricing_tiers[tier]
        
        # Create or get Stripe customer
        customer = await self._get_or_create_api_customer(user_id)
        
        if tier != 'free' and payment_method_id:
            # Attach payment method
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer.id
            )
            
            # Set as default
            stripe.Customer.modify(
                customer.id,
                invoice_settings={'default_payment_method': payment_method_id}
            )
        
        # Create subscription record
        subscription_data = {
            'user_id': user_id,
            'tier': tier,
            'status': 'active',
            'requests_used': 0,
            'requests_limit': tier_config['requests_per_month'],
            'rate_limit': tier_config['rate_limit'],
            'features': tier_config['features'],
            'stripe_customer_id': customer.id,
            'stripe_subscription_id': None,
            'current_period_start': datetime.now().isoformat(),
            'current_period_end': (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        # Create Stripe subscription for paid tiers
        if tier != 'free':
            stripe_sub = stripe.Subscription.create(
                customer=customer.id,
                items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'JobFlow API - {tier_config["name"]}',
                        },
                        'unit_amount': tier_config['price'] * 100,
                        'recurring': {'interval': 'month'}
                    }
                }],
                metadata={'user_id': user_id, 'tier': tier}
            )
            subscription_data['stripe_subscription_id'] = stripe_sub.id
        
        # Save to database
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.supabase_url}/rest/v1/api_subscriptions",
                json=subscription_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        # Generate initial API key
        api_key = await self._generate_api_key(user_id, tier)
        
        return {
            'subscription_id': subscription_data.get('id'),
            'tier': tier,
            'api_key': api_key,
            'requests_limit': tier_config['requests_per_month'],
            'rate_limit': f"{tier_config['rate_limit']} req/min",
            'documentation': 'https://api.jobflow.ai/docs',
            'dashboard': f'/api/dashboard/{user_id}'
        }
    
    async def track_api_usage(
        self,
        api_key: str,
        endpoint: str,
        method: str,
        response_time: float,
        status_code: int
    ) -> Dict:
        """
        Track API usage for billing and analytics
        
        Args:
            api_key: API key used
            endpoint: API endpoint called
            method: HTTP method
            response_time: Response time in ms
            status_code: HTTP status code
        
        Returns:
            Usage tracking result
        """
        
        # Get subscription from API key
        subscription = await self._get_subscription_by_key(api_key)
        
        if not subscription:
            return {'error': 'Invalid API key'}
        
        # Check rate limit
        rate_limit_ok = await self._check_rate_limit(
            subscription['id'],
            subscription['rate_limit']
        )
        
        if not rate_limit_ok:
            return {'error': 'Rate limit exceeded', 'retry_after': 60}
        
        # Check monthly limit
        if subscription['requests_used'] >= subscription['requests_limit']:
            return {'error': 'Monthly request limit exceeded'}
        
        # Track usage
        usage_data = {
            'subscription_id': subscription['id'],
            'endpoint': endpoint,
            'method': method,
            'response_time': response_time,
            'status_code': status_code,
            'timestamp': datetime.now().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            # Log usage
            await client.post(
                f"{self.supabase_url}/rest/v1/api_usage_logs",
                json=usage_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            # Increment usage counter
            await client.patch(
                f"{self.supabase_url}/rest/v1/api_subscriptions",
                params={"id": f"eq.{subscription['id']}"},
                json={"requests_used": subscription['requests_used'] + 1},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        # Calculate remaining
        remaining = subscription['requests_limit'] - subscription['requests_used'] - 1
        
        return {
            'success': True,
            'requests_remaining': remaining,
            'reset_date': subscription['current_period_end']
        }
    
    async def get_api_analytics(
        self,
        user_id: str,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict:
        """
        Get API usage analytics for developer
        
        Args:
            user_id: User ID
            date_from: Start date
            date_to: End date
        
        Returns:
            API usage analytics
        """
        
        if not date_from:
            date_from = datetime.now() - timedelta(days=30)
        if not date_to:
            date_to = datetime.now()
        
        subscription = await self._get_subscription_by_user(user_id)
        
        if not subscription:
            return {'error': 'No API subscription found'}
        
        # Get usage logs
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/api_usage_logs",
                params={
                    "subscription_id": f"eq.{subscription['id']}",
                    "timestamp": f"gte.{date_from.isoformat()}",
                    "timestamp": f"lte.{date_to.isoformat()}"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            usage_logs = response.json() if response.status_code == 200 else []
        
        # Analyze usage
        analytics = {
            'subscription': {
                'tier': subscription['tier'],
                'status': subscription['status'],
                'requests_used': subscription['requests_used'],
                'requests_limit': subscription['requests_limit'],
                'utilization': f"{(subscription['requests_used']/subscription['requests_limit']*100):.1f}%"
            },
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat()
            },
            'usage_by_endpoint': {},
            'usage_by_day': {},
            'performance': {
                'avg_response_time': 0,
                'p95_response_time': 0,
                'p99_response_time': 0,
                'error_rate': 0
            },
            'top_endpoints': [],
            'cost_breakdown': {
                'base_cost': self.pricing_tiers[subscription['tier']]['price'],
                'overage_cost': 0,
                'total_cost': self.pricing_tiers[subscription['tier']]['price']
            }
        }
        
        # Process logs
        response_times = []
        error_count = 0
        
        for log in usage_logs:
            # By endpoint
            endpoint = log['endpoint']
            if endpoint not in analytics['usage_by_endpoint']:
                analytics['usage_by_endpoint'][endpoint] = 0
            analytics['usage_by_endpoint'][endpoint] += 1
            
            # By day
            day = log['timestamp'][:10]
            if day not in analytics['usage_by_day']:
                analytics['usage_by_day'][day] = 0
            analytics['usage_by_day'][day] += 1
            
            # Performance metrics
            response_times.append(log['response_time'])
            if log['status_code'] >= 400:
                error_count += 1
        
        # Calculate performance stats
        if response_times:
            response_times.sort()
            analytics['performance']['avg_response_time'] = sum(response_times) / len(response_times)
            analytics['performance']['p95_response_time'] = response_times[int(len(response_times) * 0.95)]
            analytics['performance']['p99_response_time'] = response_times[int(len(response_times) * 0.99)]
            analytics['performance']['error_rate'] = f"{(error_count/len(usage_logs)*100):.2f}%"
        
        # Top endpoints
        sorted_endpoints = sorted(
            analytics['usage_by_endpoint'].items(),
            key=lambda x: x[1],
            reverse=True
        )
        analytics['top_endpoints'] = [
            {'endpoint': ep, 'calls': count}
            for ep, count in sorted_endpoints[:5]
        ]
        
        return analytics
    
    async def create_webhook(
        self,
        user_id: str,
        url: str,
        events: List[str],
        secret: Optional[str] = None
    ) -> Dict:
        """
        Create webhook for API events
        
        Args:
            user_id: User ID
            url: Webhook URL
            events: List of events to subscribe to
            secret: Webhook secret for verification
        
        Returns:
            Webhook configuration
        """
        
        import secrets
        
        if not secret:
            secret = secrets.token_hex(32)
        
        webhook_data = {
            'user_id': user_id,
            'url': url,
            'events': events,
            'secret': secret,
            'active': True,
            'created_at': datetime.now().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.supabase_url}/rest/v1/api_webhooks",
                json=webhook_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        return {
            'webhook_id': webhook_data.get('id'),
            'url': url,
            'events': events,
            'secret': secret,
            'test_endpoint': f'/api/webhooks/test/{webhook_data.get("id")}'
        }
    
    async def generate_sdk(
        self,
        language: str,
        api_key: str
    ) -> Dict:
        """
        Generate SDK for specific programming language
        
        Args:
            language: Programming language (python, javascript, go, etc)
            api_key: API key to embed (optional)
        
        Returns:
            SDK package details
        """
        
        supported_languages = {
            'python': 'jobflow-python',
            'javascript': 'jobflow-js',
            'typescript': 'jobflow-ts',
            'go': 'jobflow-go',
            'ruby': 'jobflow-ruby',
            'php': 'jobflow-php',
            'java': 'jobflow-java',
            'csharp': 'jobflow-dotnet'
        }
        
        if language not in supported_languages:
            return {'error': f'Unsupported language. Choose from: {list(supported_languages.keys())}'}
        
        package_name = supported_languages[language]
        
        # Generate SDK code (simplified example)
        if language == 'python':
            sdk_code = f'''"""
JobFlow API Python SDK
Auto-generated SDK for JobFlow API
"""

import requests
from typing import Dict, List, Optional

class JobFlowClient:
    def __init__(self, api_key: str = "{api_key if api_key else 'YOUR_API_KEY'}"):
        self.api_key = api_key
        self.base_url = "https://api.jobflow.ai/v1"
        self.headers = {{
            "Authorization": f"Bearer {{self.api_key}}",
            "Content-Type": "application/json"
        }}
    
    def search_jobs(self, query: str, location: str = None, limit: int = 20) -> Dict:
        """Search for jobs"""
        params = {{"q": query, "location": location, "limit": limit}}
        response = requests.get(f"{{self.base_url}}/jobs/search", headers=self.headers, params=params)
        return response.json()
    
    def generate_resume(self, job_id: str, user_profile: Dict) -> Dict:
        """Generate tailored resume"""
        data = {{"job_id": job_id, "profile": user_profile}}
        response = requests.post(f"{{self.base_url}}/resume/generate", headers=self.headers, json=data)
        return response.json()
    
    def generate_cover_letter(self, job_id: str, user_profile: Dict) -> Dict:
        """Generate cover letter"""
        data = {{"job_id": job_id, "profile": user_profile}}
        response = requests.post(f"{{self.base_url}}/cover-letter/generate", headers=self.headers, json=data)
        return response.json()

# Example usage
if __name__ == "__main__":
    client = JobFlowClient()
    jobs = client.search_jobs("software engineer", "San Francisco")
    print(f"Found {{len(jobs['results'])}} jobs")
'''
        
        elif language == 'javascript':
            sdk_code = f'''/**
 * JobFlow API JavaScript SDK
 * Auto-generated SDK for JobFlow API
 */

class JobFlowClient {{
    constructor(apiKey = '{api_key if api_key else 'YOUR_API_KEY'}') {{
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.jobflow.ai/v1';
    }}
    
    async searchJobs(query, location = null, limit = 20) {{
        const params = new URLSearchParams({{
            q: query,
            location: location,
            limit: limit
        }});
        
        const response = await fetch(`${{this.baseUrl}}/jobs/search?${{params}}`, {{
            headers: {{
                'Authorization': `Bearer ${{this.apiKey}}`,
                'Content-Type': 'application/json'
            }}
        }});
        
        return response.json();
    }}
    
    async generateResume(jobId, userProfile) {{
        const response = await fetch(`${{this.baseUrl}}/resume/generate`, {{
            method: 'POST',
            headers: {{
                'Authorization': `Bearer ${{this.apiKey}}`,
                'Content-Type': 'application/json'
            }},
            body: JSON.stringify({{
                job_id: jobId,
                profile: userProfile
            }})
        }});
        
        return response.json();
    }}
}}

// Example usage
const client = new JobFlowClient();
const jobs = await client.searchJobs('software engineer', 'San Francisco');
console.log(`Found ${{jobs.results.length}} jobs`);

module.exports = JobFlowClient;
'''
        else:
            sdk_code = f"# {language.upper()} SDK coming soon"
        
        # Save SDK to storage
        sdk_url = await self._save_sdk(language, sdk_code)
        
        return {
            'language': language,
            'package_name': package_name,
            'download_url': sdk_url,
            'documentation': f'https://api.jobflow.ai/docs/sdks/{language}',
            'installation': self._get_installation_command(language, package_name)
        }
    
    def _get_installation_command(self, language: str, package_name: str) -> str:
        """Get installation command for SDK"""
        
        commands = {
            'python': f'pip install {package_name}',
            'javascript': f'npm install {package_name}',
            'typescript': f'npm install {package_name}',
            'go': f'go get github.com/jobflow/{package_name}',
            'ruby': f'gem install {package_name}',
            'php': f'composer require jobflow/{package_name}',
            'java': f'// Add to pom.xml or build.gradle',
            'csharp': f'dotnet add package {package_name}'
        }
        
        return commands.get(language, 'See documentation for installation')
    
    # Helper methods
    
    async def _get_or_create_api_customer(self, user_id: str) -> stripe.Customer:
        """Get or create Stripe customer for API user"""
        
        # Get user profile
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            profile = response.json()[0] if response.status_code == 200 else {}
        
        # Check for existing customer
        if profile.get('stripe_customer_id'):
            return stripe.Customer.retrieve(profile['stripe_customer_id'])
        
        # Create new customer
        customer = stripe.Customer.create(
            email=profile.get('email'),
            metadata={'user_id': user_id, 'type': 'api_developer'}
        )
        
        # Save customer ID
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={"stripe_customer_id": customer.id},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        return customer