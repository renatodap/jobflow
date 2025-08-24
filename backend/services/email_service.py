"""
Email Service for JobFlow
Handles email notifications, daily job reports, and user communications
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import httpx
import json
import csv
import io
from typing import Dict, List, Optional
from datetime import datetime
import asyncio

class EmailService:
    """Manages email delivery for JobFlow users"""
    
    def __init__(self):
        # Email provider configuration
        self.resend_api_key = os.getenv('RESEND_API_KEY')
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        
        # SMTP configuration (fallback)
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        
        # Default sender
        self.from_email = os.getenv('FROM_EMAIL', 'jobs@jobflow.ai')
        self.from_name = os.getenv('FROM_NAME', 'JobFlow')
        
        # Supabase for database operations
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    async def send_daily_jobs_email(
        self, 
        user_email: str, 
        user_name: str,
        jobs: List[Dict],
        resume_content: str = "",
        cover_letters: Dict = None,
        learning_path: str = ""
    ) -> bool:
        """
        Send daily jobs report with resume, cover letters, and learning path
        """
        
        if not jobs:
            return True  # No jobs to send
        
        # Create email content
        subject = f"JobFlow Daily Report - {len(jobs)} New Opportunities"
        
        # Generate HTML email
        html_content = self._generate_daily_email_html(
            user_name, jobs, resume_content, cover_letters, learning_path
        )
        
        # Generate CSV attachment
        jobs_csv = self._generate_jobs_csv(jobs)
        
        # Prepare attachments
        attachments = [
            {
                'filename': f'jobs_{datetime.now().strftime("%Y%m%d")}.csv',
                'content': jobs_csv,
                'content_type': 'text/csv'
            }
        ]
        
        # Add resume attachment if provided
        if resume_content:
            attachments.append({
                'filename': f'resume_{datetime.now().strftime("%Y%m%d")}.txt',
                'content': resume_content,
                'content_type': 'text/plain'
            })
        
        # Add learning path attachment if provided
        if learning_path:
            attachments.append({
                'filename': f'learning_path_{datetime.now().strftime("%Y%m%d")}.md',
                'content': learning_path,
                'content_type': 'text/markdown'
            })
        
        return await self._send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content,
            attachments=attachments
        )
    
    async def send_application_confirmation(
        self, 
        user_email: str,
        user_name: str, 
        job_title: str,
        company: str
    ) -> bool:
        """Send confirmation email when user applies to a job"""
        
        subject = f"Application Submitted: {job_title} at {company}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Submitted Successfully!</h2>
            
            <p>Hi {user_name},</p>
            
            <p>Great job! You've successfully applied to:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">{job_title}</h3>
                <p style="margin: 0; color: #666;">{company}</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ul>
                <li>Follow up in 1 week if no response</li>
                <li>Connect with hiring manager on LinkedIn</li>
                <li>Prepare for potential screening call</li>
            </ul>
            
            <p>Keep up the great work!</p>
            
            <p>Best,<br>The JobFlow Team</p>
        </div>
        """
        
        return await self._send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content
        )
    
    async def send_approval_notification(
        self,
        user_email: str,
        user_name: str
    ) -> bool:
        """Send notification when user account is approved"""
        
        subject = "JobFlow Account Approved - Welcome!"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🎉 Your JobFlow Account is Approved!</h2>
            
            <p>Hi {user_name},</p>
            
            <p>Great news! Your JobFlow account has been approved and you can now access the full platform.</p>
            
            <h3>What's Next:</h3>
            <ul>
                <li>Complete your profile for better job matching</li>
                <li>Set up your job search preferences</li>
                <li>Start receiving daily job recommendations</li>
                <li>Use AI-powered resume and cover letter generation</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://jobflow.ai/dashboard" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   Access Your Dashboard
                </a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy job hunting!</p>
            
            <p>Best,<br>The JobFlow Team</p>
        </div>
        """
        
        return await self._send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content
        )
    
    async def send_interview_reminder(
        self,
        user_email: str,
        user_name: str,
        job_title: str,
        company: str,
        interview_date: str
    ) -> bool:
        """Send interview reminder email"""
        
        subject = f"Interview Reminder: {job_title} at {company}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📅 Interview Reminder</h2>
            
            <p>Hi {user_name},</p>
            
            <p>This is a friendly reminder about your upcoming interview:</p>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <h3 style="margin: 0 0 10px 0; color: #333;">{job_title}</h3>
                <p style="margin: 0 0 5px 0; color: #666;"><strong>Company:</strong> {company}</p>
                <p style="margin: 0; color: #666;"><strong>Date:</strong> {interview_date}</p>
            </div>
            
            <h3>Interview Preparation Tips:</h3>
            <ul>
                <li>Research the company and recent news</li>
                <li>Review the job description and your application</li>
                <li>Prepare STAR method answers for common questions</li>
                <li>Have questions ready to ask the interviewer</li>
                <li>Test your technology if it's a video interview</li>
            </ul>
            
            <p>You've got this! Good luck with your interview.</p>
            
            <p>Best,<br>The JobFlow Team</p>
        </div>
        """
        
        return await self._send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content
        )
    
    async def send_weekly_summary(
        self,
        user_email: str,
        user_name: str,
        applications_count: int,
        interviews_count: int,
        response_rate: float
    ) -> bool:
        """Send weekly job search summary"""
        
        subject = f"JobFlow Weekly Summary - {applications_count} Applications"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📊 Your Weekly Job Search Summary</h2>
            
            <p>Hi {user_name},</p>
            
            <p>Here's how your job search went this week:</p>
            
            <div style="display: flex; justify-content: space-around; margin: 30px 0;">
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; flex: 1; margin: 0 5px;">
                    <h3 style="margin: 0; font-size: 2em; color: #007bff;">{applications_count}</h3>
                    <p style="margin: 5px 0 0 0; color: #666;">Applications</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; flex: 1; margin: 0 5px;">
                    <h3 style="margin: 0; font-size: 2em; color: #28a745;">{interviews_count}</h3>
                    <p style="margin: 5px 0 0 0; color: #666;">Interviews</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; flex: 1; margin: 0 5px;">
                    <h3 style="margin: 0; font-size: 2em; color: #ffc107;">{response_rate:.1f}%</h3>
                    <p style="margin: 5px 0 0 0; color: #666;">Response Rate</p>
                </div>
            </div>
            
            <h3>Keep Up the Momentum!</h3>
            <p>Consistent applications lead to better results. Keep applying and refining your approach.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://jobflow.ai/dashboard" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   View Full Analytics
                </a>
            </div>
            
            <p>Best,<br>The JobFlow Team</p>
        </div>
        """
        
        return await self._send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content
        )
    
    def _generate_daily_email_html(
        self,
        user_name: str,
        jobs: List[Dict],
        resume_content: str,
        cover_letters: Dict,
        learning_path: str
    ) -> str:
        """Generate HTML content for daily jobs email"""
        
        # Job listings HTML
        jobs_html = ""
        for i, job in enumerate(jobs[:10], 1):  # Show top 10 in email
            score_color = "#28a745" if job.get('score', 0) >= 80 else "#ffc107" if job.get('score', 0) >= 60 else "#6c757d"
            
            jobs_html += f"""
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; margin: 15px 0; padding: 15px;">
                <div style="display: flex; justify-content: between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 5px 0; color: #333;">
                            <a href="{job.get('url', '#')}" style="text-decoration: none; color: #007bff;">
                                {job.get('title', 'Job Title')}
                            </a>
                        </h3>
                        <p style="margin: 0 0 5px 0; color: #666; font-weight: bold;">{job.get('company', 'Company')}</p>
                        <p style="margin: 0 0 10px 0; color: #888; font-size: 14px;">{job.get('location', 'Location')}</p>
                        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.4;">
                            {job.get('description', '')[:200]}...
                        </p>
                    </div>
                    <div style="margin-left: 15px; text-align: center; min-width: 60px;">
                        <div style="background: {score_color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                            {job.get('score', 0)}
                        </div>
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">Score</div>
                    </div>
                </div>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #888;">
                    {job.get('job_type', 'Full-time')} • Posted: {job.get('posted_date', 'Recently')[:10]} • Source: {job.get('source', 'Unknown').title()}
                </div>
            </div>
            """
        
        # Attachments summary
        attachments_html = "<ul>"
        if resume_content:
            attachments_html += "<li>📄 Tailored Resume (resume_YYYYMMDD.txt)</li>"
        if learning_path:
            attachments_html += "<li>📚 Learning Path Recommendations (learning_path_YYYYMMDD.md)</li>"
        attachments_html += "<li>📊 Complete Job List (jobs_YYYYMMDD.csv)</li>"
        attachments_html += "</ul>"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>JobFlow Daily Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff;">
                    <h1 style="margin: 0; color: #007bff; font-size: 28px;">JobFlow Daily Report</h1>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">{datetime.now().strftime('%B %d, %Y')}</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0;">Hi {user_name}! 👋</h2>
                    <p style="margin: 0; opacity: 0.9;">We found <strong>{len(jobs)} new job opportunities</strong> that match your profile. Here are the top matches:</p>
                </div>
                
                <div>
                    <h2 style="color: #333; margin-bottom: 20px;">🎯 Top Job Matches</h2>
                    {jobs_html}
                    
                    {f'<p style="text-align: center; margin: 20px 0; color: #666;"><em>+ {len(jobs) - 10} more opportunities in the attached CSV file</em></p>' if len(jobs) > 10 else ''}
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #333;">📎 Attached Files</h3>
                    {attachments_html}
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                        <em>All materials are generated using your real profile data - no fake information!</em>
                    </p>
                </div>
                
                <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #007bff;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">💡 Quick Application Tips</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Apply within 24-48 hours of posting for best visibility</li>
                        <li>Customize the first paragraph of your cover letter for each application</li>
                        <li>Follow up with hiring managers on LinkedIn</li>
                        <li>Set follow-up reminders for 5-7 days after applying</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://jobflow.ai/dashboard" 
                       style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                       View Full Dashboard
                    </a>
                </div>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
                    <p style="margin: 0;">Keep applying consistently - you've got this! 🚀</p>
                    <p style="margin: 10px 0 0 0;">Best regards,<br>The JobFlow Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_content
    
    def _generate_jobs_csv(self, jobs: List[Dict]) -> str:
        """Generate CSV content for job listings"""
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # CSV headers
        headers = [
            'Title', 'Company', 'Location', 'Salary Min', 'Salary Max', 
            'Job Type', 'Remote', 'Score', 'Posted Date', 'Source', 'URL', 'Description'
        ]
        writer.writerow(headers)
        
        # Job data
        for job in jobs:
            writer.writerow([
                job.get('title', ''),
                job.get('company', ''),
                job.get('location', ''),
                job.get('salary_min', ''),
                job.get('salary_max', ''),
                job.get('job_type', ''),
                'Yes' if job.get('remote', False) else 'No',
                job.get('score', 0),
                job.get('posted_date', ''),
                job.get('source', ''),
                job.get('url', ''),
                job.get('description', '')[:500]  # Truncate description
            ])
        
        return output.getvalue()
    
    async def _send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email using available service"""
        
        # Try Resend first (preferred)
        if self.resend_api_key:
            return await self._send_via_resend(to_email, subject, html_content, attachments)
        
        # Try SendGrid
        elif self.sendgrid_api_key:
            return await self._send_via_sendgrid(to_email, subject, html_content, attachments)
        
        # Fallback to SMTP
        elif self.smtp_username and self.smtp_password:
            return await self._send_via_smtp(to_email, subject, html_content, attachments)
        
        else:
            print("No email service configured")
            return False
    
    async def _send_via_resend(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email via Resend API"""
        
        try:
            email_data = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            # Add attachments if provided
            if attachments:
                email_data["attachments"] = []
                for attachment in attachments:
                    email_data["attachments"].append({
                        "filename": attachment['filename'],
                        "content": attachment['content'],
                        "content_type": attachment.get('content_type', 'application/octet-stream')
                    })
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.resend_api_key}",
                        "Content-Type": "application/json"
                    },
                    json=email_data,
                    timeout=30
                )
                
                return response.status_code == 200
        
        except Exception as e:
            print(f"Resend email error: {e}")
            return False
    
    async def _send_via_sendgrid(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email via SendGrid API"""
        
        # SendGrid implementation would go here
        # For now, return False
        return False
    
    async def _send_via_smtp(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email via SMTP"""
        
        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add HTML content
            message.attach(MIMEText(html_content, "html"))
            
            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment['content'].encode('utf-8'))
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {attachment["filename"]}'
                    )
                    message.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, to_email, message.as_string())
            
            return True
        
        except Exception as e:
            print(f"SMTP email error: {e}")
            return False