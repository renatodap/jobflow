"""
Autonomous Daily Job Search System
Runs completely independently to find 20 best jobs every day
Zero manual intervention required - full automation
"""

import asyncio
import schedule
import time
import json
import smtplib
import os
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, List, Optional
import pandas as pd

# Import our enhanced services
from core.services.comprehensive_job_search import ComprehensiveJobSearch, JobSearchQuery
from core.services.cover_letter_generator import CoverLetterGenerator
from core.services.profile_manager import ProfileManager
from core.services.ai_content_generator import AIContentGenerator


class AutonomousDailySystem:
    """
    Fully autonomous job search system that operates independently
    Finds jobs, generates materials, creates learning paths, sends emails
    """
    
    def __init__(self, user_profile_path: str = "profile.json"):
        self.profile = ProfileManager(user_profile_path)
        self.job_search = ComprehensiveJobSearch()
        self.cover_generator = CoverLetterGenerator()
        self.ai_generator = AIContentGenerator()
        
        self.email_config = self._load_email_config()
        self.system_stats = {
            'days_running': 0,
            'total_jobs_found': 0,
            'total_applications_generated': 0,
            'last_run': None,
            'success_rate': 100.0
        }
        
        # Load user preferences
        self.user_preferences = self._load_user_preferences()
        
    def _load_email_config(self) -> Dict:
        """Load email configuration for daily delivery"""
        return {
            'smtp_server': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', 587)),
            'sender_email': os.getenv('SMTP_USER', 'jobflow@example.com'),
            'sender_password': os.getenv('SMTP_PASS', ''),
            'recipient_email': self.profile.get_email()
        }
    
    def _load_user_preferences(self) -> Dict:
        """Load user job search preferences"""
        return {
            'target_jobs_per_day': 20,
            'max_jobs_per_day': 50,  # Search more, select best 20
            'keywords': [
                'software engineer', 'software developer', 'python developer',
                'full stack developer', 'backend developer', 'frontend developer',
                'machine learning engineer', 'data engineer', 'DevOps engineer'
            ],
            'locations': ['San Francisco', 'New York', 'Seattle', 'Austin', 'Remote'],
            'experience_levels': ['entry level', 'junior', 'new grad', '0-2 years'],
            'job_types': ['full-time', 'internship'],
            'salary_minimum': 70000,
            'visa_sponsorship_required': True,
            'exclude_companies': ['recruiting agencies'],  # Avoid spam
            'posted_within_days': 3,  # Very recent jobs only
            'minimum_score_threshold': 60  # Only send high-quality matches
        }
    
    async def run_daily_search(self) -> Dict:
        """
        Execute complete daily job search and application generation
        This is the main autonomous function that runs every day
        """
        
        print("[*] AUTONOMOUS DAILY JOB SEARCH STARTING")
        print(f"[*] Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        start_time = time.time()
        
        try:
            # Phase 1: Comprehensive Job Discovery
            print("[*] PHASE 1: COMPREHENSIVE JOB DISCOVERY")
            print("-" * 50)
            
            query = JobSearchQuery(
                keywords=self.user_preferences['keywords'],
                locations=self.user_preferences['locations'],
                experience_levels=self.user_preferences['experience_levels'],
                job_types=self.user_preferences['job_types'],
                posted_within_days=self.user_preferences['posted_within_days'],
                salary_min=self.user_preferences['salary_minimum'],
                visa_sponsorship=self.user_preferences['visa_sponsorship_required']
            )
            
            # Search ALL sources for maximum coverage
            all_jobs = await self.job_search.search_all_sources(
                query, 
                max_results=self.user_preferences['max_jobs_per_day']
            )
            
            print(f"[OK] Found {len(all_jobs)} total opportunities")
            
            # Phase 2: Filter and Select Best Jobs
            print("\n[*] PHASE 2: INTELLIGENT JOB SELECTION")
            print("-" * 50)
            
            # Filter by minimum score threshold
            quality_jobs = [
                job for job in all_jobs 
                if job.get('relevance_score', 0) >= self.user_preferences['minimum_score_threshold']
            ]
            
            # Select top N jobs
            target_count = min(
                self.user_preferences['target_jobs_per_day'], 
                len(quality_jobs)
            )
            selected_jobs = quality_jobs[:target_count]
            
            print(f"[OK] Selected {len(selected_jobs)} high-quality jobs (score >={self.user_preferences['minimum_score_threshold']})")
            
            # Phase 3: Generate Application Materials
            print("\n📝 PHASE 3: AI APPLICATION GENERATION")
            print("-" * 50)
            
            application_materials = []
            
            for i, job in enumerate(selected_jobs, 1):
                print(f"Generating materials for job {i}/{len(selected_jobs)}: {job['title']} at {job['company']}")
                
                try:
                    # Generate resume
                    resume = await self.ai_generator.generate_targeted_resume(job, self.profile.get_profile_data())
                    
                    # Generate cover letter  
                    cover_letter = await self.cover_generator.generate_cover_letter(job, "high")
                    
                    # Create application package
                    application_package = {
                        'job': job,
                        'resume': resume,
                        'cover_letter': cover_letter,
                        'application_score': job.get('relevance_score', 0),
                        'generated_at': datetime.now().isoformat()
                    }
                    
                    application_materials.append(application_package)
                    
                    # Save individual files
                    self._save_application_materials(application_package)
                    
                except Exception as e:
                    print(f"[ERROR] Failed to generate materials for {job['company']}: {e}")
                    continue
            
            print(f"[OK] Generated {len(application_materials)} complete application packages")
            
            # Phase 4: Create Learning & Development Path
            print("\n[*] PHASE 4: LEARNING PATH GENERATION")
            print("-" * 50)
            
            learning_path = await self._generate_learning_path(selected_jobs)
            
            print(f"[OK] Created learning path with {len(learning_path.get('skills_to_learn', []))} skills")
            print(f"[OK] Identified {len(learning_path.get('projects_to_build', []))} project recommendations")
            
            # Phase 5: Create Daily Summary Report
            print("\n[*] PHASE 5: DAILY SUMMARY GENERATION")
            print("-" * 50)
            
            daily_report = self._create_daily_report(
                all_jobs, selected_jobs, application_materials, learning_path
            )
            
            # Phase 6: Email Delivery
            print("\n[*] PHASE 6: EMAIL DELIVERY")
            print("-" * 50)
            
            email_sent = await self._send_daily_email(
                daily_report, application_materials, learning_path
            )
            
            # Update system statistics
            execution_time = time.time() - start_time
            
            self.system_stats.update({
                'last_run': datetime.now().isoformat(),
                'days_running': self.system_stats['days_running'] + 1,
                'total_jobs_found': self.system_stats['total_jobs_found'] + len(all_jobs),
                'total_applications_generated': self.system_stats['total_applications_generated'] + len(application_materials),
                'last_execution_time': round(execution_time, 2),
                'last_success': True,
                'jobs_today': len(selected_jobs),
                'applications_today': len(application_materials)
            })
            
            print(f"\n🎉 DAILY SEARCH COMPLETE")
            print("=" * 70)
            print(f"[*] Total Time: {execution_time:.2f} seconds")
            print(f"[*] Jobs Delivered: {len(selected_jobs)}")
            print(f"📝 Applications Generated: {len(application_materials)}")
            print(f"[*] Email Sent: {'YES' if email_sent else 'NO'}")
            print(f"[*] Learning Items: {len(learning_path.get('skills_to_learn', []))}")
            
            return {
                'success': True,
                'jobs_found': len(all_jobs),
                'jobs_selected': len(selected_jobs),
                'applications_generated': len(application_materials),
                'learning_items': len(learning_path.get('skills_to_learn', [])),
                'execution_time': execution_time,
                'email_sent': email_sent,
                'report': daily_report
            }
            
        except Exception as e:
            print(f"[ERROR] DAILY SEARCH FAILED: {e}")
            
            self.system_stats.update({
                'last_run': datetime.now().isoformat(),
                'last_success': False,
                'last_error': str(e)
            })
            
            return {
                'success': False,
                'error': str(e),
                'execution_time': time.time() - start_time
            }
    
    async def _generate_learning_path(self, jobs: List[Dict]) -> Dict:
        """
        Analyze job requirements and generate personalized learning path
        """
        
        # Extract all required skills from job descriptions
        all_requirements = []
        for job in jobs:
            description = job.get('description', '').lower()
            title = job.get('title', '').lower()
            all_requirements.append(f"{title} {description}")
        
        combined_text = ' '.join(all_requirements)
        
        # Use AI to analyze skill gaps and generate learning path
        learning_prompt = f"""
        Based on these job requirements from today's opportunities, create a personalized learning path for {self.profile.get_name()}.
        
        Current Profile:
        - Education: {self.profile.get_degree()} at {self.profile.get_school()}
        - Skills: {', '.join(self.profile.get_technical_skills())}
        - Experience: {self.profile.get_experience_summary()}
        
        Job Requirements Analysis:
        {combined_text[:2000]}...
        
        Create a focused learning plan with:
        1. Top 5 skills to learn (prioritized by job demand)
        2. 3 specific projects to build (that demonstrate these skills)
        3. Recommended courses/resources
        4. Timeline for completion (before graduation in {self.profile.get_graduation()})
        
        Return as JSON with skills_to_learn, projects_to_build, courses, timeline.
        """
        
        try:
            learning_response = await self.ai_generator.generate_content(
                prompt=learning_prompt,
                content_type="learning_path",
                use_openai=True
            )
            
            learning_path = json.loads(learning_response['content'])
            
            # Save learning path to file
            timestamp = datetime.now().strftime('%Y%m%d')
            learning_file = os.path.join('data', 'learning_paths', f'learning_path_{timestamp}.md')
            
            os.makedirs(os.path.dirname(learning_file), exist_ok=True)
            
            with open(learning_file, 'w', encoding='utf-8') as f:
                f.write(f"# Learning Path - {datetime.now().strftime('%Y-%m-%d')}\n\n")
                f.write("## Skills to Learn\n")
                for skill in learning_path.get('skills_to_learn', []):
                    f.write(f"- {skill}\n")
                
                f.write("\n## Projects to Build\n")
                for project in learning_path.get('projects_to_build', []):
                    f.write(f"- {project}\n")
                
                f.write("\n## Recommended Courses\n")
                for course in learning_path.get('courses', []):
                    f.write(f"- {course}\n")
                
                f.write(f"\n## Timeline\n{learning_path.get('timeline', 'Complete before graduation')}\n")
            
            print(f"💾 Saved learning path: {learning_file}")
            
            return learning_path
            
        except Exception as e:
            print(f"[ERROR] Learning path generation failed: {e}")
            return {
                'skills_to_learn': ['Python', 'React', 'System Design', 'Data Structures', 'Cloud Platforms'],
                'projects_to_build': ['Full-stack web app', 'API service', 'Data pipeline'],
                'courses': ['Coding interview preparation', 'Cloud certification', 'Open source contributions'],
                'timeline': f'Complete before graduation in {self.profile.get_graduation()}'
            }
    
    def _save_application_materials(self, package: Dict):
        """Save application materials to organized folders"""
        
        timestamp = datetime.now().strftime('%Y%m%d')
        job = package['job']
        
        company = job['company'].replace(' ', '_').replace('/', '_')
        title = job['title'].replace(' ', '_').replace('/', '_')
        
        base_name = f"{company}_{title}_{timestamp}"
        
        # Save resume
        resume_path = os.path.join('data', 'resumes', f"resume_{base_name}.txt")
        os.makedirs(os.path.dirname(resume_path), exist_ok=True)
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(package['resume']['content'])
        
        # Save cover letter
        cover_path = os.path.join('data', 'cover_letters', f"cover_letter_{base_name}.txt")
        os.makedirs(os.path.dirname(cover_path), exist_ok=True)
        with open(cover_path, 'w', encoding='utf-8') as f:
            f.write(package['cover_letter']['content'])
        
        print(f"💾 Saved materials for {job['company']}")
    
    def _create_daily_report(self, all_jobs: List[Dict], selected_jobs: List[Dict], 
                           applications: List[Dict], learning_path: Dict) -> str:
        """Create comprehensive daily report"""
        
        report = f"""
# JobFlow Daily Report - {datetime.now().strftime('%Y-%m-%d')}

## Search Summary
- **Total Jobs Found**: {len(all_jobs)}
- **High-Quality Jobs**: {len(selected_jobs)}
- **Applications Generated**: {len(applications)}
- **Search Sources**: {self.job_search.get_search_statistics()['sources_used']}

## Top Opportunities Today

"""
        
        for i, app in enumerate(applications[:10], 1):
            job = app['job']
            score = job.get('relevance_score', 0)
            
            report += f"""### {i}. {job['title']} at {job['company']}
- **Location**: {job['location']}
- **Score**: {score}/100
- **Source**: {job['source']}
- **URL**: {job['url']}

"""
        
        report += f"""
## Learning Path for Today

### Skills to Develop
"""
        
        for skill in learning_path.get('skills_to_learn', [])[:5]:
            report += f"- {skill}\n"
        
        report += "\n### Projects to Build\n"
        
        for project in learning_path.get('projects_to_build', [])[:3]:
            report += f"- {project}\n"
        
        report += f"""
## Next Steps
1. Review attached job opportunities
2. Apply to top 5-10 jobs using generated materials
3. Start working on recommended learning items
4. Follow up on previous applications

## System Stats
- Days Running: {self.system_stats['days_running']}
- Total Jobs Found: {self.system_stats['total_jobs_found']}
- Success Rate: {self.system_stats.get('success_rate', 100)}%

---
*Generated by JobFlow Autonomous System*
"""
        
        # Save report
        report_path = os.path.join('data', 'daily_reports', f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return report
    
    async def _send_daily_email(self, report: str, applications: List[Dict], learning_path: Dict) -> bool:
        """Send comprehensive daily email with all materials"""
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['sender_email']
            msg['To'] = self.email_config['recipient_email']
            msg['Subject'] = f"JobFlow Daily Delivery - {len(applications)} Opportunities - {datetime.now().strftime('%Y-%m-%d')}"
            
            # Email body
            body = f"""
Your daily JobFlow delivery is ready!

* {len(applications)} high-quality job opportunities found
📝 Complete application materials generated
* Personalized learning path created

Check the attachments for:
- Daily report with top opportunities
- Job opportunities CSV
- Learning path recommendations

All resume and cover letter files have been saved to your data/ folders.

Best of luck with your applications!

JobFlow Autonomous System
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach daily report
            with open('temp_daily_report.md', 'w', encoding='utf-8') as f:
                f.write(report)
            
            with open('temp_daily_report.md', 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    'attachment; filename= "daily_report.md"'
                )
                msg.attach(part)
            
            # Create and attach jobs CSV
            jobs_data = [app['job'] for app in applications]
            df = pd.DataFrame(jobs_data)
            csv_path = 'temp_jobs.csv'
            df.to_csv(csv_path, index=False)
            
            with open(csv_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    'attachment; filename= "todays_jobs.csv"'
                )
                msg.attach(part)
            
            # Send email
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['sender_email'], self.email_config['sender_password'])
            text = msg.as_string()
            server.sendmail(self.email_config['sender_email'], self.email_config['recipient_email'], text)
            server.quit()
            
            # Clean up temp files
            os.remove('temp_daily_report.md')
            os.remove('temp_jobs.csv')
            
            print("[OK] Daily email sent successfully")
            return True
            
        except Exception as e:
            print(f"[ERROR] Email sending failed: {e}")
            return False
    
    def schedule_daily_runs(self, run_time: str = "06:00"):
        """Schedule the system to run automatically every day"""
        
        print(f"⏰ SCHEDULING DAILY RUNS AT {run_time}")
        print("🤖 System will now run autonomously every day")
        
        schedule.every().day.at(run_time).do(
            lambda: asyncio.run(self.run_daily_search())
        )
        
        print(f"[OK] Scheduled daily job search at {run_time}")
        print("[*] Starting scheduler loop...")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run_once_now(self):
        """Run the system once immediately (for testing)"""
        
        print("RUNNING AUTONOMOUS SYSTEM ONCE (TEST MODE)")
        result = asyncio.run(self.run_daily_search())
        return result


# CLI Interface
if __name__ == "__main__":
    import sys
    
    system = AutonomousDailySystem()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--schedule":
            run_time = sys.argv[2] if len(sys.argv) > 2 else "06:00"
            system.schedule_daily_runs(run_time)
        elif sys.argv[1] == "--now":
            result = system.run_once_now()
            print(f"\n[OK] Execution completed: {result['success']}")
            if result['success']:
                print(f"[*] Jobs found: {result['jobs_found']}")
                print(f"📝 Applications: {result['applications_generated']}")
            else:
                print(f"[ERROR] Error: {result['error']}")
    else:
        print("""
JobFlow Autonomous Daily System

Usage:
  python autonomous_daily_system.py --now                # Run once immediately
  python autonomous_daily_system.py --schedule [TIME]    # Schedule daily runs (default: 06:00)

Examples:
  python autonomous_daily_system.py --now                # Test run
  python autonomous_daily_system.py --schedule 07:30     # Run daily at 7:30 AM
        """)