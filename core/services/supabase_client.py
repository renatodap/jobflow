"""
Supabase client for Python services
"""

import os
from supabase import create_client, Client
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class SupabaseService:
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = os.getenv('SUPABASE_URL', '')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')  # Use service role for backend
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Service Role Key must be set in environment variables")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    def get_active_users(self) -> List[Dict]:
        """Get all users with active job search"""
        try:
            # Query profiles with active search and valid subscription
            response = self.client.table('profiles') \
                .select('*, search_settings(*)') \
                .eq('approved', True) \
                .eq('search_active', True) \
                .in_('subscription_status', ['trial', 'active']) \
                .execute()
            
            if response.data:
                # Format the data for email delivery
                users = []
                for profile in response.data:
                    # Check if trial is still valid
                    if profile['subscription_status'] == 'trial':
                        trial_ends = datetime.fromisoformat(profile['trial_ends_at'].replace('Z', '+00:00'))
                        if trial_ends < datetime.now(trial_ends.tzinfo):
                            continue  # Skip expired trials
                    
                    # Get search settings
                    settings = profile.get('search_settings', [{}])[0] if profile.get('search_settings') else {}
                    
                    users.append({
                        'id': profile['id'],
                        'email': profile['email'],
                        'full_name': profile['full_name'],
                        'search_active': profile['search_active'],
                        'subscription_status': profile['subscription_status'],
                        'settings': {
                            'job_titles': settings.get('job_titles', []),
                            'locations': settings.get('locations', []),
                            'min_salary': settings.get('min_salary', 0),
                            'max_salary': settings.get('max_salary'),
                            'remote_only': settings.get('remote_only', False),
                            'job_types': settings.get('job_types', ['full-time']),
                            'email_frequency': settings.get('email_frequency', 'daily'),
                            'max_jobs_per_email': settings.get('max_jobs_per_email', 20),
                            'include_resume': settings.get('include_resume', True),
                            'include_cover_letter': settings.get('include_cover_letter', True),
                            'exclude_companies': settings.get('exclude_companies', [])
                        }
                    })
                
                return users
            
            return []
            
        except Exception as e:
            print(f"Error getting active users: {e}")
            return []
    
    def save_jobs(self, jobs: List[Dict]) -> bool:
        """Save discovered jobs to database"""
        try:
            # Prepare jobs for insertion
            jobs_to_insert = []
            for job in jobs:
                jobs_to_insert.append({
                    'job_hash': job.get('job_hash', ''),
                    'title': job.get('title', ''),
                    'company': job.get('company', ''),
                    'location': job.get('location', ''),
                    'salary_min': job.get('salary_min'),
                    'salary_max': job.get('salary_max'),
                    'description': job.get('description', ''),
                    'requirements': job.get('requirements', []),
                    'url': job.get('url', ''),
                    'source': job.get('source', 'adzuna'),
                    'contract_type': job.get('contract_type', ''),
                    'category': job.get('category', ''),
                    'days_old': job.get('days_old', 0),
                    'score': job.get('score', 0),
                    'discovered_at': datetime.now().isoformat()
                })
            
            # Upsert jobs (update if exists, insert if new)
            response = self.client.table('jobs').upsert(
                jobs_to_insert,
                on_conflict='job_hash'
            ).execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"Error saving jobs: {e}")
            return False
    
    def log_email_delivery(self, user_id: str, email_type: str, jobs_count: int, 
                          attachments: List[str] = None, status: str = 'sent') -> bool:
        """Log email delivery in database"""
        try:
            response = self.client.table('email_deliveries').insert({
                'user_id': user_id,
                'email_type': email_type,
                'subject': f'{jobs_count} New Job Opportunities - {datetime.now().strftime("%B %d, %Y")}',
                'jobs_included': jobs_count,
                'attachments_included': attachments or [],
                'delivery_status': status,
                'sent_at': datetime.now().isoformat()
            }).execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"Error logging email delivery: {e}")
            return False
    
    def save_application(self, user_id: str, job_id: str, status: str = 'viewed') -> bool:
        """Save user job application/view"""
        try:
            response = self.client.table('applications').upsert({
                'user_id': user_id,
                'job_id': job_id,
                'status': status,
                'created_at': datetime.now().isoformat()
            }, on_conflict='user_id,job_id').execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"Error saving application: {e}")
            return False
    
    def get_user_preferences(self, user_id: str) -> Optional[Dict]:
        """Get user search preferences"""
        try:
            response = self.client.table('search_settings') \
                .select('*') \
                .eq('user_id', user_id) \
                .single() \
                .execute()
            
            return response.data
            
        except Exception as e:
            print(f"Error getting user preferences: {e}")
            return None
    
    def check_should_send_email(self, user_id: str, frequency: str) -> bool:
        """Check if email should be sent based on frequency"""
        try:
            # Get last email sent to user
            response = self.client.table('email_deliveries') \
                .select('sent_at') \
                .eq('user_id', user_id) \
                .eq('email_type', 'job_delivery') \
                .order('sent_at', desc=True) \
                .limit(1) \
                .execute()
            
            if not response.data:
                return True  # No emails sent yet
            
            last_sent = datetime.fromisoformat(response.data[0]['sent_at'].replace('Z', '+00:00'))
            now = datetime.now(last_sent.tzinfo)
            
            # Check based on frequency
            if frequency == 'daily':
                return (now - last_sent) >= timedelta(hours=20)  # At least 20 hours
            elif frequency == 'twice_daily':
                return (now - last_sent) >= timedelta(hours=10)  # At least 10 hours
            elif frequency == 'weekly':
                return (now - last_sent) >= timedelta(days=6)  # At least 6 days
            
            return True
            
        except Exception as e:
            print(f"Error checking email frequency: {e}")
            return True  # Default to sending if error