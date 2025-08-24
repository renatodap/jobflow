"""
Daily Automation Service for JobFlow
Orchestrates daily job search, content generation, and email delivery
"""

import os
import asyncio
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
import logging
from dataclasses import asdict

from .job_service import JobService
from .application_service import ApplicationService  
from .profile_service import ProfileService
from .email_service import EmailService
from .learning_path_service import LearningPathService

class DailyAutomationService:
    """Main automation orchestrator - runs daily for all active users"""
    
    def __init__(self):
        # Initialize all service dependencies
        self.job_service = JobService()
        self.application_service = ApplicationService()
        self.email_service = EmailService()
        self.learning_path_service = LearningPathService()
        
        # Database connection
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        # Configuration
        self.max_jobs_per_user = 20
        self.min_job_score = 60
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('daily_automation')
    
    async def run_daily_automation(self, target_user_id: Optional[str] = None):
        """
        Run complete daily automation for all active users (or specific user)
        """
        
        self.logger.info("Starting daily automation process...")
        
        # Get active users
        if target_user_id:
            users = [await self._get_user_by_id(target_user_id)]
        else:
            users = await self._get_active_users()
        
        self.logger.info(f"Processing {len(users)} active users")
        
        # Process users in parallel (but limit concurrency)
        semaphore = asyncio.Semaphore(5)  # Max 5 concurrent users
        
        tasks = [
            self._process_user_daily(semaphore, user) 
            for user in users if user
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Log results
        successful = sum(1 for r in results if r is not Exception and r.get('success', False))
        failed = len(results) - successful
        
        self.logger.info(f"Daily automation completed. Success: {successful}, Failed: {failed}")
        
        return {
            'processed_users': len(users),
            'successful': successful,
            'failed': failed,
            'timestamp': datetime.now().isoformat()
        }
    
    async def _process_user_daily(self, semaphore: asyncio.Semaphore, user: Dict) -> Dict:
        """Process daily automation for a single user"""
        
        async with semaphore:
            user_id = user['id']
            user_email = user['email']
            user_name = user.get('full_name', 'User')
            
            try:
                self.logger.info(f"Processing user: {user_email}")
                
                # Step 1: Check if user has remaining searches
                if not await self._can_user_search(user):
                    self.logger.info(f"User {user_email} has no remaining searches")
                    return {'success': False, 'reason': 'no_searches_remaining', 'user_id': user_id}
                
                # Step 2: Get comprehensive job search results
                self.logger.info(f"Searching jobs for {user_email}")
                jobs = await self.job_service.get_daily_job_recommendations(user_id)
                
                if not jobs:
                    self.logger.info(f"No jobs found for {user_email}")
                    return {'success': False, 'reason': 'no_jobs_found', 'user_id': user_id}
                
                # Step 3: Filter to top jobs
                top_jobs = [job for job in jobs if job.score >= self.min_job_score][:self.max_jobs_per_user]
                
                # Step 4: Get user profile context for AI generation
                profile_service = ProfileService(user_id)
                profile_context = await profile_service.get_ai_context_string()
                
                # Step 5: Generate AI content for top jobs
                self.logger.info(f"Generating AI content for {len(top_jobs)} jobs for {user_email}")
                
                # Generate tailored resume
                best_job = top_jobs[0] if top_jobs else jobs[0]
                resume_content = await self._generate_tailored_resume(profile_context, best_job)
                
                # Generate cover letters for top 5 jobs
                cover_letters = {}
                for job in top_jobs[:5]:
                    job_key = f"{job.company}_{job.title}".replace(' ', '_')
                    cover_letter = await self._generate_cover_letter(profile_context, job)
                    cover_letters[job_key] = cover_letter
                
                # Step 6: Generate learning path (weekly refresh)
                learning_path_content = ""
                if await self._should_update_learning_path(user_id):
                    self.logger.info(f"Generating learning path for {user_email}")
                    learning_path_content = await self.learning_path_service.generate_learning_path_document(user_id)
                
                # Step 7: Send daily email with all content
                self.logger.info(f"Sending daily email to {user_email}")
                
                # Convert JobResult objects to dictionaries for email
                jobs_dict = [self._job_result_to_dict(job) for job in top_jobs]
                
                email_sent = await self.email_service.send_daily_jobs_email(
                    user_email=user_email,
                    user_name=user_name,
                    jobs=jobs_dict,
                    resume_content=resume_content,
                    cover_letters=cover_letters,
                    learning_path=learning_path_content
                )
                
                if email_sent:
                    # Step 8: Update user's search count
                    await self._decrement_user_searches(user_id)
                    
                    # Step 9: Log automation success
                    await self._log_automation_run(user_id, {
                        'jobs_found': len(jobs),
                        'jobs_sent': len(top_jobs),
                        'resume_generated': bool(resume_content),
                        'cover_letters_generated': len(cover_letters),
                        'learning_path_updated': bool(learning_path_content),
                        'email_sent': True
                    })
                    
                    self.logger.info(f"Successfully processed {user_email}")
                    return {'success': True, 'user_id': user_id, 'jobs_sent': len(top_jobs)}
                
                else:
                    self.logger.error(f"Failed to send email to {user_email}")
                    return {'success': False, 'reason': 'email_failed', 'user_id': user_id}
                    
            except Exception as e:
                self.logger.error(f"Error processing user {user_email}: {str(e)}")
                return {'success': False, 'reason': 'exception', 'error': str(e), 'user_id': user_id}
    
    async def run_for_single_user(self, user_email: str) -> Dict:
        """
        Run automation for a single user immediately (for testing/manual triggers)
        """
        
        user = await self._get_user_by_email(user_email)
        if not user:
            return {'success': False, 'reason': 'user_not_found'}
        
        semaphore = asyncio.Semaphore(1)
        result = await self._process_user_daily(semaphore, user)
        
        return result
    
    async def _generate_tailored_resume(self, profile_context: str, job: 'JobResult') -> str:
        """Generate tailored resume using application service"""
        
        job_data = self._job_result_to_dict(job)
        
        # Use application service to generate resume
        kit = await self.application_service.generate_application_kit(
            user_id="automation",  # Temporary user ID for automation
            job_data=job_data,
            profile_context=profile_context
        )
        
        return kit.get('resume', '')
    
    async def _generate_cover_letter(self, profile_context: str, job: 'JobResult') -> str:
        """Generate cover letter using application service"""
        
        job_data = self._job_result_to_dict(job)
        
        kit = await self.application_service.generate_application_kit(
            user_id="automation",
            job_data=job_data, 
            profile_context=profile_context
        )
        
        return kit.get('cover_letter', '')
    
    def _job_result_to_dict(self, job: 'JobResult') -> Dict:
        """Convert JobResult dataclass to dictionary"""
        
        if hasattr(job, '__dict__'):
            return job.__dict__
        else:
            # If it's already a dict
            return job
    
    async def _get_active_users(self) -> List[Dict]:
        """Get all active users eligible for daily automation"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={
                    "approved": "eq.true",
                    "subscription_status": "in.(trial,active)",
                    "searches_remaining": "gt.0"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            
            return []
    
    async def _get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                users = response.json()
                return users[0] if users else None
            
            return None
    
    async def _get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"email": f"eq.{email}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                users = response.json()
                return users[0] if users else None
            
            return None
    
    async def _can_user_search(self, user: Dict) -> bool:
        """Check if user can perform job searches"""
        
        # Check remaining searches
        searches_remaining = user.get('searches_remaining', 0)
        if searches_remaining <= 0:
            return False
        
        # Check subscription status
        subscription_status = user.get('subscription_status', 'expired')
        if subscription_status not in ['trial', 'active']:
            return False
        
        # Check if trial expired
        if subscription_status == 'trial':
            trial_end = user.get('trial_ends_at')
            if trial_end:
                try:
                    trial_end_date = datetime.fromisoformat(trial_end.replace('Z', '+00:00'))
                    if trial_end_date < datetime.now(trial_end_date.tzinfo):
                        return False
                except:
                    pass
        
        return True
    
    async def _should_update_learning_path(self, user_id: str) -> bool:
        """Check if learning path should be updated (weekly refresh)"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/learning_paths",
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "generated_date.desc",
                    "limit": "1"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                paths = response.json()
                if paths:
                    last_generated = paths[0]['generated_date']
                    try:
                        last_date = datetime.fromisoformat(last_generated.replace('Z', '+00:00'))
                        days_since = (datetime.now(last_date.tzinfo) - last_date).days
                        return days_since >= 7  # Update weekly
                    except:
                        return True
                
        return True  # No previous path, generate new one
    
    async def _decrement_user_searches(self, user_id: str):
        """Decrement user's remaining searches"""
        
        async with httpx.AsyncClient() as client:
            # Get current count first
            user = await self._get_user_by_id(user_id)
            if user:
                current_searches = user.get('searches_remaining', 0)
                new_count = max(0, current_searches - 1)
                
                await client.patch(
                    f"{self.supabase_url}/rest/v1/profiles",
                    params={"id": f"eq.{user_id}"},
                    json={"searches_remaining": new_count},
                    headers={
                        "apikey": self.supabase_key,
                        "Authorization": f"Bearer {self.supabase_key}",
                        "Content-Type": "application/json"
                    }
                )
    
    async def _log_automation_run(self, user_id: str, stats: Dict):
        """Log automation run statistics"""
        
        log_data = {
            'user_id': user_id,
            'run_date': datetime.now().isoformat(),
            'jobs_found': stats.get('jobs_found', 0),
            'jobs_sent': stats.get('jobs_sent', 0),
            'resume_generated': stats.get('resume_generated', False),
            'cover_letters_generated': stats.get('cover_letters_generated', 0),
            'learning_path_updated': stats.get('learning_path_updated', False),
            'email_sent': stats.get('email_sent', False),
            'success': True
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/automation_logs",
                json=log_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    # Management and monitoring methods
    
    async def get_automation_stats(self, days: int = 30) -> Dict:
        """Get automation statistics for the last N days"""
        
        start_date = datetime.now() - timedelta(days=days)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/automation_logs",
                params={
                    "run_date": f"gte.{start_date.isoformat()}",
                    "select": "*"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                logs = response.json()
                
                total_runs = len(logs)
                successful_runs = len([l for l in logs if l.get('success')])
                total_jobs_found = sum(l.get('jobs_found', 0) for l in logs)
                total_jobs_sent = sum(l.get('jobs_sent', 0) for l in logs)
                emails_sent = len([l for l in logs if l.get('email_sent')])
                
                return {
                    'period_days': days,
                    'total_runs': total_runs,
                    'successful_runs': successful_runs,
                    'success_rate': (successful_runs / total_runs * 100) if total_runs > 0 else 0,
                    'total_jobs_found': total_jobs_found,
                    'total_jobs_sent': total_jobs_sent,
                    'emails_sent': emails_sent,
                    'avg_jobs_per_run': total_jobs_sent / successful_runs if successful_runs > 0 else 0,
                    'active_users': len(set(l.get('user_id') for l in logs))
                }
        
        return {
            'period_days': days,
            'total_runs': 0,
            'successful_runs': 0,
            'success_rate': 0,
            'total_jobs_found': 0,
            'total_jobs_sent': 0,
            'emails_sent': 0,
            'avg_jobs_per_run': 0,
            'active_users': 0
        }
    
    async def get_user_automation_history(self, user_id: str, days: int = 7) -> List[Dict]:
        """Get automation history for a specific user"""
        
        start_date = datetime.now() - timedelta(days=days)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/automation_logs",
                params={
                    "user_id": f"eq.{user_id}",
                    "run_date": f"gte.{start_date.isoformat()}",
                    "order": "run_date.desc"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                return response.json()
        
        return []
    
    async def pause_user_automation(self, user_id: str) -> bool:
        """Pause automation for a specific user"""
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={"automation_paused": True},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code in [200, 204]
    
    async def resume_user_automation(self, user_id: str) -> bool:
        """Resume automation for a specific user"""
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={"automation_paused": False},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code in [200, 204]

# Standalone function for scheduled execution
async def run_daily_automation_all_users():
    """
    Standalone function to run daily automation for all users
    Can be called by cron job or task scheduler
    """
    
    automation_service = DailyAutomationService()
    result = await automation_service.run_daily_automation()
    
    print(f"Daily automation completed: {json.dumps(result, indent=2)}")
    
    return result

# Standalone function for single user testing
async def run_automation_for_user(user_email: str):
    """
    Test automation for a single user
    """
    
    automation_service = DailyAutomationService()
    result = await automation_service.run_for_single_user(user_email)
    
    print(f"Automation for {user_email}: {json.dumps(result, indent=2)}")
    
    return result