#!/usr/bin/env python3
"""
Enhanced Job Finder V2 - Modular Multi-Source Aggregation
Always returns the best available jobs from whatever sources are working
"""

import os
import sys
import json
import csv
from datetime import datetime
from typing import Dict, List, Any

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.services.modular_job_aggregator import ModularJobAggregator
from core.services.profile_database_client import ProfileManager
from core.services.ai_content_generator import AIContentGenerator

class EnhancedJobFinderV2:
    """
    Main job finding system with modular source aggregation
    Gracefully handles missing APIs and always returns best available jobs
    """
    
    def __init__(self, use_database_profile: bool = True):
        """
        Initialize job finder with modular aggregator
        
        Args:
            use_database_profile: Whether to use database profile (vs local profile.json)
        """
        print("\n" + "="*60)
        print("JobFlow V2 - Multi-Source Job Aggregator")
        print("="*60)
        
        self.aggregator = ModularJobAggregator()
        self.profile_manager = ProfileManager(prefer_database=use_database_profile)
        self.ai_generator = AIContentGenerator()
        
        # Load user profile
        self.user_profile = self._load_profile()
        
        # Tracking
        self.jobs_found = []
        self.materials_generated = {}
        
    def _load_profile(self) -> Dict:
        """Load user profile from database or local file"""
        print("\n📋 Loading user profile...")
        
        # Try to get profile (will use database if available, else local)
        profile = self.profile_manager.get_profile()
        
        if profile:
            print(f"  [OK] Profile loaded for: {profile['personal']['name']}")
            print(f"  [OK] Desired role: {profile['preferences'].get('desired_role', 'Not specified')}")
            
            # Convert to format expected by aggregator
            # Handle both single string and list formats for desired_role
            desired_role = profile['preferences'].get('desired_role', 'Software Engineer')
            if isinstance(desired_role, str):
                # Split comma-separated roles into list
                desired_roles = [r.strip() for r in desired_role.split(',')]
            else:
                desired_roles = desired_role
            
            profile['preferences']['desired_roles'] = desired_roles
            
            # Ensure preferred_locations is a list
            locations = profile['preferences'].get('locations', [])
            if isinstance(locations, str):
                locations = [locations]
            profile['preferences']['preferred_locations'] = locations
            
            return profile
        else:
            print("  ⚠ No profile found, using defaults")
            return self._get_default_profile()
    
    def _get_default_profile(self) -> Dict:
        """Return a default profile for testing"""
        return {
            'personal': {
                'name': 'Job Seeker',
                'email': 'user@example.com',
                'location': 'United States'
            },
            'preferences': {
                'desired_roles': ['Software Engineer', 'Developer'],
                'preferred_locations': ['Remote', 'San Francisco', 'New York'],
                'min_salary': 60000,
                'max_salary': 200000,
                'remote_preference': 'No Preference'
            },
            'skills': {
                'languages': ['Python', 'JavaScript'],
                'frameworks': ['React', 'Django'],
                'databases': ['PostgreSQL'],
                'tools': ['Git', 'Docker']
            }
        }
    
    def search_jobs(self, custom_query: str = None, custom_location: str = None, 
                   limit: int = 20) -> Dict[str, Any]:
        """
        Search for jobs using all available sources
        
        Args:
            custom_query: Override default query from profile
            custom_location: Override default location from profile
            limit: Number of top jobs to return (default 20)
        
        Returns:
            Dictionary with jobs and statistics
        """
        # Determine search parameters
        if custom_query:
            query = custom_query
        else:
            # Build query from desired roles
            roles = self.user_profile['preferences'].get('desired_roles', ['Software Engineer'])
            query = ' OR '.join(roles)
        
        if custom_location:
            location = custom_location
        else:
            # Use first preferred location
            locations = self.user_profile['preferences'].get('preferred_locations', [''])
            location = locations[0] if locations else ''
        
        print(f"\n[SEARCH] Searching for: '{query}'")
        print(f"[LOCATION] Location: '{location or 'Anywhere'}'")
        print(f"[TARGET] Returning top {limit} matches")
        print("-"*40)
        
        # Search all sources and get best jobs
        results = self.aggregator.get_best_jobs(
            query=query,
            location=location,
            user_profile=self.user_profile,
            limit=limit
        )
        
        self.jobs_found = results['jobs']
        
        # Display summary
        print(f"\n[COMPLETE] Search Complete!")
        print(f"  • Total jobs found: {results['total_found']}")
        print(f"  • Sources used: {results['sources_used']}")
        print(f"  • Top {len(results['jobs'])} selected")
        
        if results['source_breakdown']:
            print(f"\n[STATS] Jobs by source:")
            for source, count in results['source_breakdown'].items():
                print(f"  • {source}: {count} jobs")
        
        return results
    
    def generate_materials(self, job_index: int = None) -> Dict[str, str]:
        """
        Generate resume and cover letter for a specific job
        
        Args:
            job_index: Index of job in jobs_found list (0-based)
        
        Returns:
            Dictionary with 'resume' and 'cover_letter' content
        """
        if not self.jobs_found:
            print("❌ No jobs found. Run search_jobs() first.")
            return {}
        
        if job_index is None:
            # Generate for top job
            job_index = 0
        
        if job_index >= len(self.jobs_found):
            print(f"❌ Invalid job index. Only {len(self.jobs_found)} jobs available.")
            return {}
        
        job = self.jobs_found[job_index]
        
        print(f"\n📝 Generating materials for:")
        print(f"  Position: {job['title']}")
        print(f"  Company: {job['company']}")
        
        # Generate resume
        resume = self.ai_generator.generate_resume(
            job_description=job.get('description', ''),
            job_title=job['title'],
            company=job['company'],
            user_profile=self.user_profile
        )
        
        # Generate cover letter
        cover_letter = self.ai_generator.generate_cover_letter(
            job_description=job.get('description', ''),
            job_title=job['title'],
            company=job['company'],
            user_profile=self.user_profile
        )
        
        materials = {
            'resume': resume,
            'cover_letter': cover_letter,
            'job': job
        }
        
        # Save to tracking
        job_key = f"{job['company']}_{job['title']}"
        self.materials_generated[job_key] = materials
        
        print("  [OK] Resume generated")
        print("  [OK] Cover letter generated")
        
        return materials
    
    def save_results(self, save_materials: bool = True) -> Dict[str, str]:
        """
        Save all results to files
        
        Args:
            save_materials: Whether to save generated materials
        
        Returns:
            Dictionary with file paths
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_files = {}
        
        # Save jobs to CSV
        if self.jobs_found:
            csv_file = f"data/tracking/jobs_{timestamp}.csv"
            os.makedirs(os.path.dirname(csv_file), exist_ok=True)
            
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                fieldnames = ['score', 'title', 'company', 'location', 'source', 
                             'url', 'salary_min', 'salary_max', 'remote', 'match_reasons']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                for job in self.jobs_found:
                    writer.writerow({
                        'score': job.get('score', 0),
                        'title': job['title'],
                        'company': job['company'],
                        'location': job['location'],
                        'source': job['source'],
                        'url': job['url'],
                        'salary_min': job.get('salary_min', ''),
                        'salary_max': job.get('salary_max', ''),
                        'remote': job.get('remote', False),
                        'match_reasons': '; '.join(job.get('match_reasons', []))
                    })
            
            saved_files['jobs_csv'] = csv_file
            print(f"\n💾 Jobs saved to: {csv_file}")
        
        # Save generated materials
        if save_materials and self.materials_generated:
            for job_key, materials in self.materials_generated.items():
                # Save resume
                safe_key = "".join(c for c in job_key if c.isalnum() or c in (' ', '-', '_')).rstrip()
                safe_key = safe_key.replace(' ', '_')[:50]
                
                resume_file = f"data/resumes/resume_{safe_key}_{timestamp}.txt"
                os.makedirs(os.path.dirname(resume_file), exist_ok=True)
                with open(resume_file, 'w', encoding='utf-8') as f:
                    f.write(materials['resume'])
                
                # Save cover letter
                cover_file = f"data/cover_letters/cover_{safe_key}_{timestamp}.txt"
                os.makedirs(os.path.dirname(cover_file), exist_ok=True)
                with open(cover_file, 'w', encoding='utf-8') as f:
                    f.write(materials['cover_letter'])
                
                print(f"  [OK] Materials saved for: {materials['job']['title']}")
        
        # Save search metadata
        meta_file = f"data/daily_searches/search_meta_{timestamp}.json"
        os.makedirs(os.path.dirname(meta_file), exist_ok=True)
        
        metadata = {
            'timestamp': datetime.now().isoformat(),
            'profile': self.user_profile['personal']['name'],
            'total_jobs_found': len(self.jobs_found),
            'materials_generated': len(self.materials_generated),
            'saved_files': saved_files
        }
        
        with open(meta_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        saved_files['metadata'] = meta_file
        
        return saved_files
    
    def display_top_jobs(self, count: int = 10):
        """Display top jobs in a formatted table"""
        if not self.jobs_found:
            print("No jobs to display. Run search_jobs() first.")
            return
        
        print(f"\n[TOP JOBS] Top {min(count, len(self.jobs_found))} Jobs")
        print("="*80)
        
        for i, job in enumerate(self.jobs_found[:count], 1):
            print(f"\n{i}. {job['title']}")
            print(f"   Company: {job['company']}")
            print(f"   Location: {job['location']}")
            print(f"   Source: {job['source']}")
            
            if job.get('salary_min') or job.get('salary_max'):
                salary = f"${job.get('salary_min', 'N/A'):,} - ${job.get('salary_max', 'N/A'):,}"
                print(f"   Salary: {salary}")
            
            print(f"   Score: {job.get('score', 0):.1f}/100")
            
            if job.get('match_reasons'):
                print(f"   Why it matches: {', '.join(job['match_reasons'][:2])}")
            
            print(f"   Apply: {job['url'][:70]}...")
        
        print("\n" + "="*80)
        print(f"Showing {min(count, len(self.jobs_found))} of {len(self.jobs_found)} total jobs found")


def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("  JOBFLOW V2 - MULTI-SOURCE JOB AGGREGATOR")
    print("  Always finds the best jobs from available sources")
    print("="*60)
    
    # Initialize finder
    finder = EnhancedJobFinderV2(use_database_profile=True)
    
    # Search for jobs (will use whatever sources are available)
    results = finder.search_jobs(limit=20)
    
    if results['jobs']:
        # Display top jobs
        finder.display_top_jobs(count=10)
        
        # Generate materials for top 3 jobs
        print("\n[GENERATING] Generating application materials for top 3 jobs...")
        for i in range(min(3, len(results['jobs']))):
            finder.generate_materials(job_index=i)
        
        # Save everything
        saved = finder.save_results()
        
        print("\n[SUCCESS] Job search complete!")
        print(f"  • {results['total_found']} total jobs found")
        print(f"  • {results['sources_used']} sources successfully queried")
        print(f"  • {len(results['jobs'])} best matches selected")
        print(f"  • {len(finder.materials_generated)} application kits generated")
        
        # Show source coverage
        if results['source_breakdown']:
            print("\n[ANALYSIS] Coverage Analysis:")
            total = results['total_found']
            for source, count in sorted(results['source_breakdown'].items(), 
                                       key=lambda x: x[1], reverse=True):
                pct = (count / total * 100) if total > 0 else 0
                print(f"  • {source}: {count} jobs ({pct:.1f}%)")
    else:
        print("\n⚠️ No jobs found. Possible issues:")
        print("  1. Check your internet connection")
        print("  2. Verify API keys in .env.local")
        print("  3. Try a broader search term")
        print("  4. Some sources may be temporarily down")
    
    print("\n" + "="*60)
    print("JobFlow V2 session complete")
    print("="*60)


if __name__ == "__main__":
    main()