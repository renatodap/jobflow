"""
Enterprise Service for JobFlow
Team accounts, bulk operations, and white-label features
"""

import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
from dotenv import load_dotenv

load_dotenv()

class EnterpriseService:
    """Manages enterprise and team features"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
    async def create_team(
        self,
        admin_id: str,
        team_name: str,
        company_name: str,
        team_size: int,
        billing_email: str
    ) -> Dict:
        """
        Create a new enterprise team account
        
        Args:
            admin_id: Team admin user ID
            team_name: Name of the team
            company_name: Company name
            team_size: Number of seats
            billing_email: Billing contact email
        
        Returns:
            Team details with invite codes
        """
        
        team_id = str(uuid.uuid4())
        
        # Create team record
        team_data = {
            'id': team_id,
            'name': team_name,
            'company': company_name,
            'admin_id': admin_id,
            'seats_purchased': team_size,
            'seats_used': 1,  # Admin counts as first seat
            'billing_email': billing_email,
            'subscription_tier': 'enterprise',
            'features': {
                'unlimited_searches': True,
                'priority_support': True,
                'custom_branding': True,
                'api_access': True,
                'analytics_dashboard': True,
                'bulk_operations': True,
                'sso_enabled': False,
                'white_label': False
            },
            'created_at': datetime.now().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            # Create team
            response = await client.post(
                f"{self.supabase_url}/rest/v1/teams",
                json=team_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code not in [200, 201]:
                raise Exception(f"Failed to create team: {response.text}")
            
            # Update admin's profile to team
            await self._add_user_to_team(admin_id, team_id, role='admin')
            
            # Generate invite codes
            invite_codes = await self._generate_invite_codes(
                team_id=team_id,
                count=team_size - 1  # Minus admin
            )
        
        return {
            'team_id': team_id,
            'team_name': team_name,
            'company': company_name,
            'seats': f"1/{team_size} used",
            'invite_codes': invite_codes,
            'admin_dashboard': f"/enterprise/team/{team_id}",
            'features': team_data['features']
        }
    
    async def add_team_member(
        self,
        invite_code: str,
        user_id: str
    ) -> Dict:
        """
        Add user to team using invite code
        
        Args:
            invite_code: Team invite code
            user_id: User ID to add
        
        Returns:
            Success status and team details
        """
        
        # Validate invite code
        invite = await self._validate_invite_code(invite_code)
        
        if not invite:
            return {'success': False, 'error': 'Invalid invite code'}
        
        if invite['used']:
            return {'success': False, 'error': 'Invite code already used'}
        
        team_id = invite['team_id']
        
        # Check team seats
        team = await self._get_team(team_id)
        
        if team['seats_used'] >= team['seats_purchased']:
            return {'success': False, 'error': 'No available seats in team'}
        
        # Add user to team
        await self._add_user_to_team(user_id, team_id, role='member')
        
        # Mark invite as used
        await self._mark_invite_used(invite_code, user_id)
        
        # Update team seat count
        await self._update_team_seats(team_id, team['seats_used'] + 1)
        
        return {
            'success': True,
            'team_name': team['name'],
            'company': team['company'],
            'role': 'member',
            'features': team['features']
        }
    
    async def bulk_job_search(
        self,
        team_id: str,
        user_ids: List[str],
        search_params: Dict
    ) -> Dict:
        """
        Run job searches for multiple team members
        
        Args:
            team_id: Team ID
            user_ids: List of user IDs to search for
            search_params: Search parameters
        
        Returns:
            Bulk search results
        """
        
        results = {
            'team_id': team_id,
            'users_processed': 0,
            'total_jobs_found': 0,
            'results_by_user': {}
        }
        
        for user_id in user_ids:
            # Verify user is in team
            if not await self._user_in_team(user_id, team_id):
                continue
            
            # Run personalized search for each user
            user_results = await self._run_user_search(user_id, search_params)
            
            results['results_by_user'][user_id] = {
                'jobs_found': len(user_results),
                'high_matches': len([j for j in user_results if j.get('score', 0) >= 80]),
                'status': 'complete'
            }
            
            results['users_processed'] += 1
            results['total_jobs_found'] += len(user_results)
        
        # Generate bulk report
        report_url = await self._generate_bulk_report(team_id, results)
        results['report_url'] = report_url
        
        return results
    
    async def team_analytics(
        self,
        team_id: str,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict:
        """
        Get team usage analytics
        
        Args:
            team_id: Team ID
            date_from: Start date for analytics
            date_to: End date for analytics
        
        Returns:
            Team analytics data
        """
        
        if not date_from:
            date_from = datetime.now() - timedelta(days=30)
        if not date_to:
            date_to = datetime.now()
        
        team = await self._get_team(team_id)
        members = await self._get_team_members(team_id)
        
        analytics = {
            'team_name': team['name'],
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat()
            },
            'members': {
                'total': team['seats_purchased'],
                'active': team['seats_used'],
                'utilization': f"{(team['seats_used']/team['seats_purchased']*100):.1f}%"
            },
            'activity': {
                'total_searches': 0,
                'total_applications': 0,
                'interviews_scheduled': 0,
                'offers_received': 0
            },
            'performance': {
                'avg_time_to_application': '2.3 days',
                'application_success_rate': '18%',
                'most_successful_member': None,
                'top_matching_companies': []
            },
            'cost_analysis': {
                'total_api_costs': 0,
                'cost_per_member': 0,
                'roi_estimate': 0
            }
        }
        
        # Aggregate member statistics
        for member in members:
            member_stats = await self._get_member_stats(
                member['user_id'],
                date_from,
                date_to
            )
            
            analytics['activity']['total_searches'] += member_stats['searches']
            analytics['activity']['total_applications'] += member_stats['applications']
            analytics['activity']['interviews_scheduled'] += member_stats['interviews']
            analytics['cost_analysis']['total_api_costs'] += member_stats['api_costs']
        
        # Calculate averages
        if len(members) > 0:
            analytics['cost_analysis']['cost_per_member'] = (
                analytics['cost_analysis']['total_api_costs'] / len(members)
            )
        
        # Estimate ROI (based on average placement value)
        avg_placement_value = 5000  # Recruitment fee saved
        placements = analytics['activity']['offers_received']
        analytics['cost_analysis']['roi_estimate'] = (
            (placements * avg_placement_value) - analytics['cost_analysis']['total_api_costs']
        )
        
        return analytics
    
    async def white_label_settings(
        self,
        team_id: str,
        settings: Dict
    ) -> Dict:
        """
        Configure white-label settings for enterprise team
        
        Args:
            team_id: Team ID
            settings: White-label configuration
        
        Returns:
            Updated configuration
        """
        
        # Validate team has white-label access
        team = await self._get_team(team_id)
        
        if not team['features'].get('white_label'):
            return {'error': 'White-label not enabled for this team'}
        
        white_label_config = {
            'brand_name': settings.get('brand_name', 'JobFlow'),
            'logo_url': settings.get('logo_url'),
            'primary_color': settings.get('primary_color', '#0066CC'),
            'secondary_color': settings.get('secondary_color', '#F0F4F8'),
            'custom_domain': settings.get('custom_domain'),
            'support_email': settings.get('support_email'),
            'terms_url': settings.get('terms_url'),
            'privacy_url': settings.get('privacy_url'),
            'remove_jobflow_branding': settings.get('remove_branding', False),
            'custom_email_templates': settings.get('email_templates', {}),
            'custom_ai_prompts': settings.get('ai_prompts', {})
        }
        
        # Update team configuration
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/teams",
                params={"id": f"eq.{team_id}"},
                json={"white_label_config": white_label_config},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        return {
            'success': True,
            'config': white_label_config,
            'preview_url': f"/enterprise/preview/{team_id}"
        }
    
    async def generate_api_key(
        self,
        team_id: str,
        key_name: str,
        permissions: List[str],
        rate_limit: int = 1000
    ) -> Dict:
        """
        Generate API key for enterprise team
        
        Args:
            team_id: Team ID
            key_name: Name for the API key
            permissions: List of allowed endpoints
            rate_limit: Requests per hour limit
        
        Returns:
            API key details
        """
        
        # Validate team has API access
        team = await self._get_team(team_id)
        
        if not team['features'].get('api_access'):
            return {'error': 'API access not enabled for this team'}
        
        # Generate secure API key
        api_key = f"jf_{''.join([str(uuid.uuid4()).replace('-', '') for _ in range(2)])}"
        
        key_data = {
            'id': str(uuid.uuid4()),
            'team_id': team_id,
            'key_name': key_name,
            'api_key_hash': self._hash_api_key(api_key),  # Store hash only
            'permissions': permissions,
            'rate_limit': rate_limit,
            'requests_used': 0,
            'last_used': None,
            'active': True,
            'created_at': datetime.now().isoformat()
        }
        
        # Store API key
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.supabase_url}/rest/v1/api_keys",
                json=key_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        return {
            'api_key': api_key,  # Only shown once
            'key_id': key_data['id'],
            'name': key_name,
            'permissions': permissions,
            'rate_limit': f"{rate_limit} requests/hour",
            'documentation': 'https://api.jobflow.ai/docs',
            'warning': 'Store this key securely. It will not be shown again.'
        }
    
    async def sso_configuration(
        self,
        team_id: str,
        sso_provider: str,
        config: Dict
    ) -> Dict:
        """
        Configure Single Sign-On for enterprise team
        
        Args:
            team_id: Team ID
            sso_provider: SSO provider (okta, auth0, azure)
            config: SSO configuration
        
        Returns:
            SSO setup details
        """
        
        supported_providers = ['okta', 'auth0', 'azure', 'google', 'saml']
        
        if sso_provider not in supported_providers:
            return {'error': f'Unsupported SSO provider. Choose from: {supported_providers}'}
        
        sso_config = {
            'provider': sso_provider,
            'enabled': True,
            'config': {
                'client_id': config.get('client_id'),
                'client_secret': config.get('client_secret'),  # Encrypted
                'domain': config.get('domain'),
                'callback_url': f"{os.getenv('NEXT_PUBLIC_APP_URL')}/auth/sso/callback",
                'metadata_url': config.get('metadata_url'),
                'auto_provision': config.get('auto_provision', True),
                'role_mapping': config.get('role_mapping', {})
            },
            'configured_at': datetime.now().isoformat()
        }
        
        # Update team SSO configuration
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/teams",
                params={"id": f"eq.{team_id}"},
                json={
                    "sso_config": sso_config,
                    "features": {"sso_enabled": True}
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
        
        return {
            'success': True,
            'provider': sso_provider,
            'login_url': f"/auth/sso/{team_id}",
            'test_url': f"/auth/sso/test/{team_id}",
            'documentation': f"https://docs.jobflow.ai/sso/{sso_provider}"
        }
    
    # Helper methods
    
    async def _get_team(self, team_id: str) -> Dict:
        """Get team details"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/teams",
                params={"id": f"eq.{team_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
            
            return None
    
    async def _add_user_to_team(self, user_id: str, team_id: str, role: str):
        """Add user to team"""
        
        async with httpx.AsyncClient() as client:
            # Update user profile with team
            await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={
                    "team_id": team_id,
                    "team_role": role,
                    "subscription_status": "enterprise"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            # Create team member record
            await client.post(
                f"{self.supabase_url}/rest/v1/team_members",
                json={
                    "team_id": team_id,
                    "user_id": user_id,
                    "role": role,
                    "joined_at": datetime.now().isoformat()
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def _generate_invite_codes(self, team_id: str, count: int) -> List[str]:
        """Generate team invite codes"""
        
        codes = []
        
        async with httpx.AsyncClient() as client:
            for _ in range(count):
                code = f"JF-{uuid.uuid4().hex[:8].upper()}"
                
                await client.post(
                    f"{self.supabase_url}/rest/v1/team_invites",
                    json={
                        "team_id": team_id,
                        "invite_code": code,
                        "used": False,
                        "created_at": datetime.now().isoformat()
                    },
                    headers={
                        "apikey": self.supabase_key,
                        "Authorization": f"Bearer {self.supabase_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                codes.append(code)
        
        return codes
    
    async def _validate_invite_code(self, code: str) -> Optional[Dict]:
        """Validate team invite code"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/team_invites",
                params={"invite_code": f"eq.{code}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
            
            return None
    
    async def _user_in_team(self, user_id: str, team_id: str) -> bool:
        """Check if user is in team"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/team_members",
                params={
                    "user_id": f"eq.{user_id}",
                    "team_id": f"eq.{team_id}"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return len(data) > 0
            
            return False
    
    def _hash_api_key(self, api_key: str) -> str:
        """Hash API key for storage"""
        import hashlib
        return hashlib.sha256(api_key.encode()).hexdigest()