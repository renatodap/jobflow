"""
Daily Automation for JobFlow Personal
Runs automated job search, generates applications, and sends summary
"""

import asyncio
import json
import schedule
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import logging

# Import our modules
from jobflow_personal import JobFlowPersonal
from cold_outreach_generator import ColdOutreachGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/automation_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

class DailyJobAutomation:
    """Automated daily job search and application system"""
    
    def __init__(self):
        self.setup_folders()
        self.load_config()
        
    def setup_folders(self):
        """Create necessary folders"""
        Path('logs').mkdir(exist_ok=True)
        Path('data/automation').mkdir(parents=True, exist_ok=True)
        
    def load_config(self):
        """Load automation configuration"""
        try:
            with open('profile.json', 'r', encoding='utf-8') as f:
                profile = json.load(f)
                self.config = profile.get('preferences', {}).get('job_search_settings', {})
                self.max_jobs = self.config.get('max_jobs_per_day', 20)
                self.auto_apply = self.config.get('auto_apply', False)
                self.send_email = self.config.get('send_daily_email', True)
        except Exception as e:
            logging.error(f"Failed to load config: {e}")
            self.max_jobs = 20
            self.auto_apply = False
            self.send_email = True
    
    async def run_daily_search(self):
        """Execute daily job search routine"""
        
        logging.info("="*60)
        logging.info("STARTING DAILY JOB AUTOMATION")
        logging.info("="*60)
        
        try:
            # Initialize JobFlow
            jobflow = JobFlowPersonal()
            
            # Run comprehensive search
            logging.info("Starting comprehensive job search...")
            results = await jobflow.run_comprehensive_search()
            
            # Score and rank jobs
            scored_jobs = self.score_jobs(results['jobs'])
            top_jobs = scored_jobs[:self.max_jobs]
            
            logging.info(f"Found {len(results['jobs'])} total jobs")
            logging.info(f"Selected top {len(top_jobs)} jobs")
            
            # Generate materials for top jobs
            materials_generated = 0
            outreach_generated = 0
            
            for job in top_jobs:
                try:
                    # Generate resume
                    resume_path = await jobflow.generate_resume_for_job(job)
                    
                    # Generate cover letter
                    cover_path = await jobflow.generate_cover_letter_for_job(job)
                    
                    if resume_path and cover_path:
                        materials_generated += 1
                    
                    # Generate cold outreach
                    outreach_package = jobflow.outreach_generator.create_outreach_package(job)
                    job_id = f"{job['company']}_{job['title']}".replace(' ', '_')[:50]
                    jobflow.outreach_generator.save_outreach_package(outreach_package, job_id)
                    outreach_generated += 1
                    
                except Exception as e:
                    logging.error(f"Error processing job {job.get('title')}: {e}")
            
            # Generate summary report
            report = self.generate_report(
                total_jobs=len(results['jobs']),
                top_jobs=top_jobs,
                materials_generated=materials_generated,
                outreach_generated=outreach_generated
            )
            
            # Save report
            report_path = self.save_report(report)
            logging.info(f"Report saved to: {report_path}")
            
            # Send email summary if enabled
            if self.send_email:
                self.send_email_summary(report, top_jobs)
            
            # Update tracking
            self.update_tracking(top_jobs)
            
            logging.info("="*60)
            logging.info("DAILY AUTOMATION COMPLETE")
            logging.info(f"Jobs Found: {len(results['jobs'])}")
            logging.info(f"Materials Generated: {materials_generated}")
            logging.info(f"Outreach Packages: {outreach_generated}")
            logging.info("="*60)
            
            return {
                'success': True,
                'jobs_found': len(results['jobs']),
                'materials_generated': materials_generated,
                'outreach_generated': outreach_generated,
                'report_path': report_path
            }
            
        except Exception as e:
            logging.error(f"Daily automation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def score_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Score and rank jobs based on profile preferences"""
        
        try:
            with open('profile.json', 'r', encoding='utf-8') as f:
                profile = json.load(f)
                preferences = profile.get('preferences', {})
        except:
            preferences = {}
        
        target_companies = [c.lower() for c in preferences.get('target_companies', [])]
        target_roles = [r.lower() for r in preferences.get('target_roles', [])]
        min_salary = preferences.get('salary', {}).get('minimum', 0)
        desired_salary = preferences.get('salary', {}).get('desired', 0)
        preferred_locations = [l.lower() for l in preferences.get('location_preferences', {}).get('preferred_locations', [])]
        
        scored_jobs = []
        
        for job in jobs:
            score = 0
            reasons = []
            
            # Company match (30 points)
            company_lower = job.get('company', '').lower()
            if any(target in company_lower for target in target_companies):
                score += 30
                reasons.append("Target company match")
            
            # Role match (25 points)
            title_lower = job.get('title', '').lower()
            if any(role in title_lower for role in target_roles):
                score += 25
                reasons.append("Target role match")
            
            # Salary match (20 points)
            salary_min = job.get('salary_min', 0) or 0
            if salary_min >= desired_salary:
                score += 20
                reasons.append("Exceeds desired salary")
            elif salary_min >= min_salary:
                score += 10
                reasons.append("Meets minimum salary")
            
            # Location match (15 points)
            location_lower = job.get('location', '').lower()
            if any(loc in location_lower for loc in preferred_locations):
                score += 15
                reasons.append("Preferred location")
            elif 'remote' in location_lower:
                score += 10
                reasons.append("Remote opportunity")
            
            # New grad friendly (10 points)
            if 'new grad' in title_lower or 'entry level' in title_lower or 'junior' in title_lower:
                score += 10
                reasons.append("New grad friendly")
            
            # Recent posting (5 points)
            if job.get('created'):
                try:
                    created_date = datetime.fromisoformat(job['created'].replace('Z', '+00:00'))
                    days_old = (datetime.now(created_date.tzinfo) - created_date).days
                    if days_old <= 7:
                        score += 5
                        reasons.append("Posted within 7 days")
                except:
                    pass
            
            job['automation_score'] = score
            job['score_reasons'] = reasons
            scored_jobs.append(job)
        
        # Sort by score (highest first)
        scored_jobs.sort(key=lambda x: x['automation_score'], reverse=True)
        
        return scored_jobs
    
    def generate_report(self, total_jobs: int, top_jobs: List[Dict], 
                       materials_generated: int, outreach_generated: int) -> str:
        """Generate daily report"""
        
        report = []
        report.append("="*60)
        report.append("JOBFLOW DAILY AUTOMATION REPORT")
        report.append(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        report.append("="*60)
        report.append("")
        
        # Summary
        report.append("SUMMARY:")
        report.append(f"  Total Jobs Found: {total_jobs}")
        report.append(f"  Top Jobs Selected: {len(top_jobs)}")
        report.append(f"  Application Materials Generated: {materials_generated}")
        report.append(f"  Cold Outreach Packages: {outreach_generated}")
        report.append("")
        
        # Top Opportunities
        report.append("TOP OPPORTUNITIES:")
        report.append("-"*60)
        
        for i, job in enumerate(top_jobs[:10], 1):
            report.append(f"\n{i}. {job['title']}")
            report.append(f"   Company: {job['company']}")
            report.append(f"   Location: {job['location']}")
            
            if job.get('salary_min'):
                report.append(f"   Salary: ${job['salary_min']:,.0f}+")
            
            report.append(f"   Score: {job.get('automation_score', 0)}/100")
            
            if job.get('score_reasons'):
                report.append(f"   Why: {', '.join(job['score_reasons'])}")
            
            report.append(f"   URL: {job.get('url', 'N/A')}")
        
        # Action Items
        report.append("")
        report.append("="*60)
        report.append("ACTION ITEMS:")
        report.append("")
        report.append("1. Review generated resumes in: data/resumes/")
        report.append("2. Review cover letters in: data/cover_letters/")
        report.append("3. Send cold outreach from: data/cold_outreach/")
        report.append("4. Apply to top jobs through company websites")
        report.append("5. Track applications in: data/tracking/applications.csv")
        
        # Statistics
        report.append("")
        report.append("="*60)
        report.append("STATISTICS BY CATEGORY:")
        report.append("")
        
        # Company distribution
        companies = {}
        for job in top_jobs:
            company = job.get('company', 'Unknown')
            companies[company] = companies.get(company, 0) + 1
        
        report.append("Top Companies:")
        for company, count in sorted(companies.items(), key=lambda x: x[1], reverse=True)[:5]:
            report.append(f"  - {company}: {count} positions")
        
        # Location distribution
        locations = {}
        for job in top_jobs:
            location = job.get('location', 'Unknown').split(',')[0]
            locations[location] = locations.get(location, 0) + 1
        
        report.append("")
        report.append("Top Locations:")
        for location, count in sorted(locations.items(), key=lambda x: x[1], reverse=True)[:5]:
            report.append(f"  - {location}: {count} positions")
        
        # Salary ranges
        salaries = [job.get('salary_min', 0) for job in top_jobs if job.get('salary_min')]
        if salaries:
            report.append("")
            report.append("Salary Range:")
            report.append(f"  - Minimum: ${min(salaries):,.0f}")
            report.append(f"  - Maximum: ${max(salaries):,.0f}")
            report.append(f"  - Average: ${sum(salaries)/len(salaries):,.0f}")
        
        report.append("")
        report.append("="*60)
        report.append("END OF REPORT")
        report.append("="*60)
        
        return "\n".join(report)
    
    def save_report(self, report: str) -> Path:
        """Save report to file"""
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = Path(f'data/daily_reports/report_{timestamp}.txt')
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Also save as latest
        latest_path = Path('data/daily_reports/latest_report.txt')
        with open(latest_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return report_path
    
    def send_email_summary(self, report: str, top_jobs: List[Dict]):
        """Send email summary (placeholder for future implementation)"""
        
        # For now, just save to a special file
        email_path = Path('data/daily_reports/email_summary.txt')
        
        with open(email_path, 'w', encoding='utf-8') as f:
            f.write("TO: [Your Email from profile.json]\n")
            f.write(f"SUBJECT: JobFlow Daily Report - {len(top_jobs)} New Opportunities\n")
            f.write("="*60 + "\n\n")
            f.write(report)
            f.write("\n\n")
            f.write("Note: Email sending not yet implemented.\n")
            f.write("Future integration with SendGrid/AWS SES planned.\n")
        
        logging.info(f"Email summary saved to: {email_path}")
    
    def update_tracking(self, jobs: List[Dict]):
        """Update tracking database"""
        
        tracking_file = Path('data/automation/automation_history.json')
        tracking_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load existing tracking
        if tracking_file.exists():
            with open(tracking_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = []
        
        # Add today's run
        run_data = {
            'date': datetime.now().isoformat(),
            'jobs_processed': len(jobs),
            'top_companies': list(set(job.get('company') for job in jobs[:10])),
            'average_score': sum(job.get('automation_score', 0) for job in jobs) / len(jobs) if jobs else 0
        }
        
        history.append(run_data)
        
        # Keep last 30 days
        if len(history) > 30:
            history = history[-30:]
        
        # Save updated history
        with open(tracking_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2)
    
    def run_once(self):
        """Run automation once (for testing)"""
        asyncio.run(self.run_daily_search())
    
    def schedule_daily(self, hour: int = 9, minute: int = 0):
        """Schedule daily run at specified time"""
        
        time_str = f"{hour:02d}:{minute:02d}"
        schedule.every().day.at(time_str).do(self.run_once)
        
        logging.info(f"Scheduled daily job search at {time_str}")
        logging.info("Press Ctrl+C to stop")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute


def main():
    """Main entry point"""
    
    import sys
    
    automation = DailyJobAutomation()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--now':
        # Run immediately
        print("Running job automation now...")
        automation.run_once()
    elif len(sys.argv) > 2 and sys.argv[1] == '--schedule':
        # Schedule at specific time
        try:
            hour = int(sys.argv[2])
            minute = int(sys.argv[3]) if len(sys.argv) > 3 else 0
            print(f"Scheduling daily run at {hour:02d}:{minute:02d}")
            automation.schedule_daily(hour, minute)
        except ValueError:
            print("Usage: python daily_automation.py --schedule HOUR [MINUTE]")
            print("Example: python daily_automation.py --schedule 9 30")
    else:
        # Show usage
        print("JobFlow Daily Automation")
        print("="*40)
        print("Usage:")
        print("  python daily_automation.py --now          # Run immediately")
        print("  python daily_automation.py --schedule 9   # Run daily at 9:00 AM")
        print("  python daily_automation.py --schedule 9 30 # Run daily at 9:30 AM")


if __name__ == "__main__":
    main()