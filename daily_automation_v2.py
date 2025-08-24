"""
Daily Automation V2 - Complete Job Search Pipeline
Finds exactly 20 best jobs daily and generates all application materials
Zero fake data, maximum automation
"""

import asyncio
import json
import os
import pandas as pd
import schedule
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Import our enhanced modules
from core.services.profile_manager import ProfileManager
from core.services.enhanced_job_search import EnhancedJobSearchEngine
from core.services.ai_content_generator_v2 import AIContentGeneratorV2

class DailyJobAutomationV2:
    """
    Complete daily job search automation system
    Finds 20 best jobs daily and generates all application materials
    """
    
    def __init__(self, profile_path: str = "profile.json"):
        self.profile = ProfileManager(profile_path)
        self.job_search = EnhancedJobSearchEngine(profile_path)
        self.ai_generator = AIContentGeneratorV2(profile_path)
        
        self.setup_folders()
        self.setup_logging()
        
        # Daily automation settings
        self.target_jobs_per_day = 20
        self.generate_application_materials = True
        self.save_learning_paths = True
        
    def setup_folders(self):
        """Create all necessary folders"""
        folders = [
            'data/daily_searches',
            'data/tracking', 
            'data/resumes',
            'data/cover_letters',
            'data/learning_paths',
            'data/cold_outreach',
            'data/daily_reports',
            'logs'
        ]
        
        for folder in folders:
            Path(folder).mkdir(parents=True, exist_ok=True)
    
    def setup_logging(self):
        """Setup comprehensive logging"""
        log_file = f"logs/daily_automation_{datetime.now().strftime('%Y%m%d')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
    
    async def run_daily_job_search(self) -> Dict:
        """
        Run complete daily job search pipeline
        Returns summary of results
        """
        
        start_time = datetime.now()
        
        self.logger.info("=" * 60)
        self.logger.info("STARTING DAILY JOB SEARCH AUTOMATION V2")
        self.logger.info("=" * 60)
        
        try:
            # 1. Comprehensive job search
            self.logger.info(f"🔍 Phase 1: Searching for {self.target_jobs_per_day} best jobs...")
            jobs = await self.job_search.comprehensive_job_search(max_jobs=self.target_jobs_per_day)
            
            self.logger.info(f"✅ Found {len(jobs)} jobs")
            
            # 2. Save jobs to database
            await self._save_jobs_to_database(jobs)
            
            # 3. Generate application materials
            if self.generate_application_materials and jobs:
                self.logger.info("📝 Phase 2: Generating application materials...")
                materials_generated = await self._generate_application_materials(jobs)
                self.logger.info(f"✅ Generated materials for {materials_generated} jobs")
            
            # 4. Generate learning paths
            if self.save_learning_paths and jobs:
                self.logger.info("📚 Phase 3: Creating learning paths...")
                learning_paths = await self._generate_learning_paths(jobs[:5])  # Top 5 jobs
                self.logger.info(f"✅ Created {learning_paths} learning paths")
            
            # 5. Create daily report
            report = await self._create_daily_report(jobs, start_time)
            
            # 6. Update tracking files
            await self._update_tracking_files(jobs)
            
            self.logger.info("🎯 DAILY AUTOMATION COMPLETE!")
            
            return {
                'status': 'success',
                'jobs_found': len(jobs),
                'materials_generated': materials_generated if self.generate_application_materials else 0,
                'learning_paths_created': learning_paths if self.save_learning_paths else 0,
                'execution_time_minutes': (datetime.now() - start_time).total_seconds() / 60,
                'report_file': report['file_path']
            }
            
        except Exception as e:
            self.logger.error(f"❌ Daily automation failed: {e}")
            
            return {
                'status': 'failed',
                'error': str(e),
                'execution_time_minutes': (datetime.now() - start_time).total_seconds() / 60
            }
    
    async def _save_jobs_to_database(self, jobs: List[Dict]) -> None:
        """Save jobs to CSV database with deduplication"""
        
        # Load existing jobs
        master_file = "data/tracking/jobs_master.csv"
        
        if os.path.exists(master_file):
            existing_df = pd.read_csv(master_file)
            existing_hashes = set(existing_df.get('job_hash', []))
        else:
            existing_df = pd.DataFrame()
            existing_hashes = set()
        
        # Process new jobs
        new_jobs = []
        
        for job in jobs:
            # Create unique hash
            job_key = f"{job.get('company', '').lower()}_{job.get('title', '').lower()}"
            job_hash = job.get('dedup_exact_hash', job_key)[:12]  # 12 char hash
            
            if job_hash not in existing_hashes:
                # Add metadata
                job_record = {
                    'job_hash': job_hash,
                    'title': job.get('title', ''),
                    'company': job.get('company', ''),
                    'location': job.get('location', ''),
                    'url': job.get('url', ''),
                    'description': job.get('description', ''),
                    'source': job.get('discovery_source', job.get('source', 'Unknown')),
                    'score': job.get('score', 0),
                    'salary_min': job.get('salary_min', ''),
                    'salary_max': job.get('salary_max', ''),
                    'discovered_at': datetime.now().isoformat(),
                    'applied': 'No',
                    'application_date': '',
                    'status': 'New',
                    'notes': ''
                }
                
                new_jobs.append(job_record)
                existing_hashes.add(job_hash)
        
        if new_jobs:
            # Create DataFrame and append to master file
            new_df = pd.DataFrame(new_jobs)
            
            if not existing_df.empty:
                combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            else:
                combined_df = new_df
            
            # Save to master file
            combined_df.to_csv(master_file, index=False)
            
            # Save daily snapshot
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            daily_file = f"data/daily_searches/jobs_{timestamp}.csv"
            new_df.to_csv(daily_file, index=False)
            
            self.logger.info(f"💾 Saved {len(new_jobs)} new jobs to database")
        else:
            self.logger.info("💾 No new jobs to save (all were duplicates)")
    
    async def _generate_application_materials(self, jobs: List[Dict]) -> int:
        """Generate resumes and cover letters for top jobs"""
        
        materials_count = 0
        
        # Generate materials for top 10 jobs (or all if fewer)
        top_jobs = jobs[:10]
        
        for i, job in enumerate(top_jobs):
            try:
                job_id = job.get('job_hash', f"job_{i}")
                company = job.get('company', 'Company')
                title = job.get('title', 'Role')
                
                self.logger.info(f"  Generating materials for: {title} at {company}")
                
                # Generate resume
                resume = await self.ai_generator.generate_tailored_resume(job)
                resume_filename = f"data/resumes/{job_id}_{company.replace(' ', '_')}_resume.md"
                
                with open(resume_filename, 'w', encoding='utf-8') as f:
                    f.write(f"# Resume for {title} at {company}\n\n")
                    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
                    f.write(f"**Job Score:** {job.get('score', 0)}\n")
                    f.write(f"**Generator:** {resume.get('generator', 'Unknown')}\n\n")
                    f.write("---\n\n")
                    f.write(resume['content'])
                
                # Generate cover letter
                cover_letter = await self.ai_generator.generate_cover_letter(job)
                cover_letter_filename = f"data/cover_letters/{job_id}_{company.replace(' ', '_')}_cover_letter.md"
                
                with open(cover_letter_filename, 'w', encoding='utf-8') as f:
                    f.write(f"# Cover Letter for {title} at {company}\n\n")
                    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
                    f.write(f"**Job Score:** {job.get('score', 0)}\n")
                    f.write(f"**Generator:** {cover_letter.get('generator', 'Unknown')}\n\n")
                    f.write("---\n\n")
                    f.write(cover_letter['content'])
                
                materials_count += 1
                
                # Rate limiting
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error(f"  Error generating materials for {job.get('company', 'unknown')}: {e}")
                continue
        
        return materials_count
    
    async def _generate_learning_paths(self, jobs: List[Dict]) -> int:
        """Generate learning paths for top jobs"""
        
        learning_paths_count = 0
        
        for job in jobs:
            try:
                job_id = job.get('job_hash', 'unknown')
                company = job.get('company', 'Company')
                title = job.get('title', 'Role')
                
                self.logger.info(f"  Creating learning path for: {title} at {company}")
                
                # Generate learning path
                learning_path = await self.ai_generator.generate_learning_path(job)
                
                # Save to file
                learning_path_filename = f"data/learning_paths/{job_id}_{company.replace(' ', '_')}_learning_path.md"
                
                with open(learning_path_filename, 'w', encoding='utf-8') as f:
                    f.write(f"# Learning Path for {title} at {company}\n\n")
                    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
                    f.write(f"**Job Score:** {job.get('score', 0)}\n")
                    f.write(f"**Target Role:** {title}\n")
                    f.write(f"**Target Company:** {company}\n\n")
                    f.write("---\n\n")
                    f.write(learning_path['content'])
                
                learning_paths_count += 1
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                self.logger.error(f"  Error creating learning path for {job.get('company', 'unknown')}: {e}")
                continue
        
        return learning_paths_count
    
    async def _create_daily_report(self, jobs: List[Dict], start_time: datetime) -> Dict:
        """Create comprehensive daily report"""
        
        execution_time = (datetime.now() - start_time).total_seconds() / 60
        
        # Calculate statistics
        high_score_jobs = [j for j in jobs if j.get('score', 0) >= 80]
        dream_companies = [j for j in jobs if j.get('company', '').lower() in 
                          [c.lower() for c in self.profile.get_target_companies()]]
        
        # Group jobs by source
        source_breakdown = {}
        for job in jobs:
            source = job.get('discovery_source', job.get('source', 'Unknown'))
            source_breakdown[source] = source_breakdown.get(source, 0) + 1
        
        # Create report content
        report_content = f"""# Daily Job Search Report
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Execution Time:** {execution_time:.1f} minutes
**Profile:** {self.profile.get_name()}

## Summary
- **Total Jobs Found:** {len(jobs)}
- **High Score Jobs (80+):** {len(high_score_jobs)}
- **Target Company Matches:** {len(dream_companies)}
- **Sources Searched:** {len(source_breakdown)}

## Top 10 Opportunities

"""
        
        for i, job in enumerate(jobs[:10], 1):
            report_content += f"""### {i}. {job.get('title', 'Unknown Title')} - {job.get('company', 'Unknown')}
- **Score:** {job.get('score', 0)}/100
- **Location:** {job.get('location', 'Not specified')}
- **Source:** {job.get('discovery_source', job.get('source', 'Unknown'))}
- **URL:** {job.get('url', 'No URL available')}
- **Applied:** {job.get('applied', 'No')}

"""
        
        # Add source breakdown
        report_content += f"""## Source Breakdown
"""
        for source, count in sorted(source_breakdown.items(), key=lambda x: x[1], reverse=True):
            report_content += f"- **{source}:** {count} jobs\n"
        
        # Add next steps
        report_content += f"""

## Next Steps (Action Items)

### High Priority Applications (Score 90+)
"""
        top_jobs = [j for j in jobs if j.get('score', 0) >= 90]
        for job in top_jobs[:5]:
            report_content += f"- [ ] Apply to {job.get('title')} at {job.get('company')} (Score: {job.get('score')})\n"
        
        report_content += f"""
### This Week Goals
- [ ] Apply to top 5 highest-scoring positions
- [ ] Complete learning path for most relevant role
- [ ] Update profile based on common job requirements
- [ ] Follow up on any pending applications

### Learning Priorities
Based on today's job analysis, focus on:
"""
        
        # Add top skills mentioned in jobs
        all_descriptions = ' '.join([job.get('description', '') for job in jobs[:10]]).lower()
        common_skills = ['python', 'react', 'typescript', 'ai', 'machine learning', 'aws', 'docker']
        mentioned_skills = [skill for skill in common_skills if skill in all_descriptions]
        
        for skill in mentioned_skills[:5]:
            report_content += f"- [ ] Strengthen {skill.title()} skills\n"
        
        # Save report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"data/daily_reports/daily_report_{timestamp}.md"
        
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        # Also save as "latest" for easy access
        with open("data/daily_reports/latest_report.md", 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        self.logger.info(f"📊 Daily report saved to {report_filename}")
        
        return {
            'file_path': report_filename,
            'jobs_analyzed': len(jobs),
            'high_score_jobs': len(high_score_jobs),
            'target_company_matches': len(dream_companies)
        }
    
    async def _update_tracking_files(self, jobs: List[Dict]) -> None:
        """Update various tracking files"""
        
        # Update jobs found counter
        tracking_file = "data/tracking/search_history.json"
        
        if os.path.exists(tracking_file):
            with open(tracking_file, 'r') as f:
                tracking_data = json.load(f)
        else:
            tracking_data = {'daily_searches': [], 'total_jobs_found': 0}
        
        # Add today's search
        today_search = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'jobs_found': len(jobs),
            'high_score_jobs': len([j for j in jobs if j.get('score', 0) >= 80]),
            'sources_used': len(self.job_search.get_search_statistics()),
            'execution_time_minutes': (datetime.now() - datetime.now()).total_seconds() / 60
        }
        
        tracking_data['daily_searches'].append(today_search)
        tracking_data['total_jobs_found'] += len(jobs)
        
        # Keep only last 30 days
        tracking_data['daily_searches'] = tracking_data['daily_searches'][-30:]
        
        with open(tracking_file, 'w') as f:
            json.dump(tracking_data, f, indent=2)
    
    def schedule_daily_automation(self, run_time: str = "09:00") -> None:
        """Schedule daily automation to run at specified time"""
        
        def run_automation():
            """Wrapper to run async automation in sync context"""
            asyncio.run(self.run_daily_job_search())
        
        schedule.every().day.at(run_time).do(run_automation)
        
        self.logger.info(f"📅 Daily automation scheduled for {run_time} every day")
        self.logger.info("Starting scheduler... (Press Ctrl+C to stop)")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            self.logger.info("📅 Scheduler stopped by user")
    
    async def run_test_search(self) -> Dict:
        """Run a test search with limited scope"""
        
        self.logger.info("🧪 Running test search...")
        
        # Temporarily reduce target jobs for testing
        original_target = self.target_jobs_per_day
        self.target_jobs_per_day = 5
        
        # Run search
        result = await self.run_daily_job_search()
        
        # Restore original target
        self.target_jobs_per_day = original_target
        
        return result
    
    def get_system_status(self) -> Dict:
        """Get comprehensive system status"""
        
        status = {
            'profile_configured': True,
            'api_keys_configured': {
                'openai': bool(os.getenv('OPENAI_API_KEY')),
                'anthropic': bool(os.getenv('ANTHROPIC_API_KEY') or os.getenv('LLM_API_KEY')),
                'adzuna': bool(os.getenv('ADZUNA_API_ID') and os.getenv('ADZUNA_API_KEY'))
            },
            'folders_created': all(Path(folder).exists() for folder in [
                'data/daily_searches', 'data/tracking', 'data/resumes', 
                'data/cover_letters', 'data/learning_paths', 'logs'
            ]),
            'profile_name': self.profile.get_name(),
            'target_jobs_per_day': self.target_jobs_per_day,
            'generation_enabled': self.generate_application_materials,
            'learning_paths_enabled': self.save_learning_paths
        }
        
        return status


# Command line interface
async def main():
    """Main CLI interface for daily automation"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='JobFlow Daily Automation V2')
    parser.add_argument('--now', action='store_true', help='Run job search immediately')
    parser.add_argument('--schedule', type=str, help='Schedule daily runs at specified time (e.g., 09:00)')
    parser.add_argument('--test', action='store_true', help='Run test search with limited scope')
    parser.add_argument('--status', action='store_true', help='Show system status')
    
    args = parser.parse_args()
    
    automation = DailyJobAutomationV2()
    
    if args.status:
        status = automation.get_system_status()
        print("\n🔧 SYSTEM STATUS:")
        print("=" * 40)
        for key, value in status.items():
            print(f"{key}: {value}")
        return
    
    if args.test:
        print("🧪 Running test search...")
        result = await automation.run_test_search()
        print(f"\n✅ Test completed: {result}")
        return
    
    if args.now:
        print("🚀 Running job search now...")
        result = await automation.run_daily_job_search()
        print(f"\n✅ Search completed: {result}")
        return
    
    if args.schedule:
        print(f"📅 Scheduling daily runs at {args.schedule}")
        automation.schedule_daily_automation(args.schedule)
        return
    
    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    asyncio.run(main())