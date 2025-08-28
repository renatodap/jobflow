"""
Automated Email Job Delivery System
Sends personalized job opportunities to active users based on their preferences
"""

import os
import sys
import json
import smtplib
import schedule
import time
from datetime import datetime
from typing import List, Dict, Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.modular_job_aggregator import ModularJobAggregator
from services.ai_content_generator_v2 import AIContentGeneratorV2
from services.supabase_client import SupabaseService

class EmailJobDeliveryService:
    def __init__(self):
        """Initialize email delivery service"""
        self.job_aggregator = ModularJobAggregator()
        self.ai_generator = AIContentGeneratorV2()
        self.supabase = SupabaseService()
        
        # Email configuration (use environment variables in production)
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'jobs@jobflow.ai')
        
    def get_active_users(self) -> List[Dict]:
        """Get all users with active job search"""
        try:
            # Get active users from Supabase
            return self.supabase.get_active_users()
        except Exception as e:
            print(f"Error getting active users: {e}")
            return []
    
    def search_jobs_for_user(self, user: Dict) -> List[Dict]:
        """Search for jobs based on user preferences"""
        settings = user.get('settings', {})
        
        # Build search queries from user preferences
        queries = []
        for title in settings.get('job_titles', []):
            for location in settings.get('locations', []):
                queries.append(f"{title} {location}")
        
        if not queries:
            queries = ['Software Engineer']  # Default query
        
        # Search for jobs
        all_jobs = []
        for query in queries[:3]:  # Limit queries to avoid too many API calls
            try:
                jobs = self.job_aggregator.search_jobs(
                    query=query,
                    location=settings.get('locations', ['San Francisco'])[0] if settings.get('locations') else 'San Francisco',
                    results_per_source=10
                )
                all_jobs.extend(jobs)
            except Exception as e:
                print(f"Error searching jobs for query '{query}': {e}")
        
        # Filter by user preferences
        filtered_jobs = []
        for job in all_jobs:
            # Check minimum salary
            if settings.get('min_salary', 0) > 0:
                if job.get('salary_min', 0) < settings['min_salary']:
                    continue
            
            # Check remote preference
            if settings.get('remote_only', False):
                if 'remote' not in job.get('location', '').lower():
                    continue
            
            filtered_jobs.append(job)
        
        # Sort by score and return top jobs
        filtered_jobs.sort(key=lambda x: x.get('score', 0), reverse=True)
        return filtered_jobs[:settings.get('max_jobs_per_email', 20)]
    
    def generate_email_content(self, user: Dict, jobs: List[Dict]) -> str:
        """Generate personalized email content with job listings"""
        settings = user.get('settings', {})
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Your Daily Job Opportunities</h1>
                <p>Hi {user['full_name']},</p>
                <p>We've found {len(jobs)} new job opportunities matching your preferences:</p>
                
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                
                {"".join([self._format_job_html(job, i+1) for i, job in enumerate(jobs)])}
                
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">Application Tips</h3>
                    <ul style="color: #4b5563;">
                        <li>Apply to jobs with score 90+ first</li>
                        <li>Customize your cover letter for each company</li>
                        <li>Follow up within 3-7 days</li>
                        <li>Connect with hiring managers on LinkedIn</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    You're receiving this because your job search is active. 
                    <a href="#" style="color: #2563eb;">Manage preferences</a> | 
                    <a href="#" style="color: #2563eb;">Pause job search</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return html_content
    
    def _format_job_html(self, job: Dict, index: int) -> str:
        """Format a single job as HTML"""
        return f"""
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="color: #1f2937; margin: 0 0 5px 0;">
                        {index}. {job.get('title', 'Job Title')}
                    </h3>
                    <p style="color: #4b5563; margin: 5px 0;">
                        <strong>{job.get('company', 'Company')}</strong> • {job.get('location', 'Location')}
                    </p>
                    <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                        ${job.get('salary_min', 0):,} - ${job.get('salary_max', 0):,} • Posted {job.get('days_old', 0)} days ago
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                        Score: {job.get('score', 0)}
                    </span>
                </div>
            </div>
            
            <p style="color: #4b5563; margin: 10px 0; font-size: 14px;">
                {job.get('description', '')[:200]}...
            </p>
            
            <div style="margin-top: 10px;">
                <a href="{job.get('url', '#')}" style="background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    View & Apply
                </a>
            </div>
        </div>
        """
    
    def send_email(self, to_email: str, subject: str, html_content: str, attachments: List[Dict] = None):
        """Send email with HTML content and optional attachments"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment['content'])
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {attachment["filename"]}'
                    )
                    msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"Error sending email to {to_email}: {e}")
            return False
    
    def process_user_jobs(self, user: Dict):
        """Process and send jobs for a single user"""
        try:
            print(f"Processing jobs for user: {user['email']}")
            
            # Search for jobs
            jobs = self.search_jobs_for_user(user)
            
            if not jobs:
                print(f"No jobs found for user {user['email']}")
                return
            
            print(f"Found {len(jobs)} jobs for user {user['email']}")
            
            # Generate email content
            email_content = self.generate_email_content(user, jobs)
            
            # Prepare attachments if requested
            attachments = []
            if user['settings'].get('include_resume'):
                # Generate tailored resume (placeholder)
                resume_content = f"Resume for {user['full_name']}"
                attachments.append({
                    'filename': 'resume.txt',
                    'content': resume_content.encode()
                })
            
            if user['settings'].get('include_cover_letter') and jobs:
                # Generate cover letter for top job
                cover_letter = self.ai_generator.generate_cover_letter(
                    job_description=jobs[0].get('description', ''),
                    company=jobs[0].get('company', ''),
                    position=jobs[0].get('title', ''),
                    user_profile={'full_name': user['full_name']}
                )
                attachments.append({
                    'filename': 'cover_letter.txt',
                    'content': cover_letter.encode()
                })
            
            # Send email
            subject = f"🎯 {len(jobs)} New Job Opportunities - {datetime.now().strftime('%B %d, %Y')}"
            email_sent = self.send_email(user['email'], subject, email_content, attachments)
            
            # Log email delivery
            if email_sent:
                attachment_names = [a['filename'] for a in attachments] if attachments else []
                self.supabase.log_email_delivery(
                    user_id=user['id'],
                    email_type='job_delivery',
                    jobs_count=len(jobs),
                    attachments=attachment_names,
                    status='sent'
                )
            else:
                self.supabase.log_email_delivery(
                    user_id=user['id'],
                    email_type='job_delivery',
                    jobs_count=len(jobs),
                    status='failed'
                )
            
            # Save jobs to database
            self.supabase.save_jobs(jobs)
            
        except Exception as e:
            print(f"Error processing jobs for user {user['email']}: {e}")
    
    def run_daily_delivery(self):
        """Run daily job delivery for all active users"""
        print(f"Starting daily job delivery at {datetime.now()}")
        
        # Get active users
        active_users = self.get_active_users()
        print(f"Found {len(active_users)} active users")
        
        # Process each user
        for user in active_users:
            if user.get('search_active') and user.get('subscription_status') in ['trial', 'active']:
                # Check if we should send email based on frequency
                frequency = user.get('settings', {}).get('email_frequency', 'daily')
                if self.supabase.check_should_send_email(user['id'], frequency):
                    self.process_user_jobs(user)
                else:
                    print(f"Skipping email for {user['email']} - not time yet based on {frequency} frequency")
        
        print(f"Daily job delivery completed at {datetime.now()}")
    
    def schedule_deliveries(self):
        """Schedule email deliveries based on user preferences"""
        # Schedule daily delivery at 9 AM
        schedule.every().day.at("09:00").do(self.run_daily_delivery)
        
        # Schedule twice daily at 5 PM for users who want it
        schedule.every().day.at("17:00").do(self.run_daily_delivery)
        
        # Schedule weekly for Monday 9 AM
        schedule.every().monday.at("09:00").do(self.run_daily_delivery)
        
        print("Email delivery scheduled. Press Ctrl+C to stop.")
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

def main():
    """Main function to run email delivery service"""
    service = EmailJobDeliveryService()
    
    # Check for immediate run flag
    if len(sys.argv) > 1 and sys.argv[1] == '--now':
        print("Running immediate delivery...")
        service.run_daily_delivery()
    else:
        # Schedule regular deliveries
        service.schedule_deliveries()

if __name__ == "__main__":
    main()