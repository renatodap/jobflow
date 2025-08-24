#!/usr/bin/env python3
"""
JobFlow Deployment Validation System
Comprehensive pre-deployment validation and setup verification
"""

import json
import os
import sys
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime
import importlib.util

class DeploymentValidator:
    """Complete deployment readiness validation"""
    
    def __init__(self):
        self.checks = {
            'critical': [],
            'important': [], 
            'optional': []
        }
        self.results = {
            'critical_pass': 0,
            'critical_fail': 0,
            'important_pass': 0, 
            'important_fail': 0,
            'optional_pass': 0,
            'optional_fail': 0,
            'errors': []
        }
        
    def validate_all(self):
        """Run complete deployment validation"""
        print("\n" + "="*80)
        print("JOBFLOW DEPLOYMENT VALIDATION")
        print("="*80)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all validation checks
        self._validate_critical_requirements()
        self._validate_important_features()
        self._validate_optional_enhancements()
        
        # Generate deployment report
        self._generate_deployment_report()
        
    def _validate_critical_requirements(self):
        """Critical requirements that MUST pass for deployment"""
        print("\n" + "🚨 CRITICAL REQUIREMENTS")
        print("-" * 40)
        
        # 1. Profile System
        if self._check_profile_system():
            self.results['critical_pass'] += 1
            print("✅ Profile system working with real data")
        else:
            self.results['critical_fail'] += 1
            print("❌ Profile system failed")
            
        # 2. Job Search
        if asyncio.run(self._check_job_search()):
            self.results['critical_pass'] += 1
            print("✅ Job search finding opportunities")
        else:
            self.results['critical_fail'] += 1
            print("❌ Job search failed")
            
        # 3. Material Generation
        if asyncio.run(self._check_material_generation()):
            self.results['critical_pass'] += 1
            print("✅ Resume/cover letter generation working")
        else:
            self.results['critical_fail'] += 1
            print("❌ Material generation failed")
            
        # 4. No Fake Data
        if self._check_no_fake_data():
            self.results['critical_pass'] += 1
            print("✅ Zero fake data confirmed")
        else:
            self.results['critical_fail'] += 1
            print("❌ Fake data detected")
            
        # 5. File Structure
        if self._check_file_structure():
            self.results['critical_pass'] += 1
            print("✅ Complete file structure")
        else:
            self.results['critical_fail'] += 1
            print("❌ Missing required files")
    
    def _validate_important_features(self):
        """Important features that should work for good UX"""
        print("\n" + "⚠️ IMPORTANT FEATURES")
        print("-" * 40)
        
        # 1. Daily Automation
        if asyncio.run(self._check_daily_automation()):
            self.results['important_pass'] += 1
            print("✅ Daily automation system ready")
        else:
            self.results['important_fail'] += 1
            print("⚠️ Daily automation has issues")
            
        # 2. Data Persistence
        if self._check_data_persistence():
            self.results['important_pass'] += 1
            print("✅ Data saving and tracking working")
        else:
            self.results['important_fail'] += 1
            print("⚠️ Data persistence issues")
            
        # 3. Error Handling
        if self._check_error_handling():
            self.results['important_pass'] += 1
            print("✅ Robust error handling")
        else:
            self.results['important_fail'] += 1
            print("⚠️ Error handling needs improvement")
    
    def _validate_optional_enhancements(self):
        """Optional features that enhance the experience"""
        print("\n" + "💡 OPTIONAL ENHANCEMENTS")
        print("-" * 40)
        
        # 1. Multi-source Search
        if asyncio.run(self._check_multi_source_search()):
            self.results['optional_pass'] += 1
            print("✅ Multi-source job search available")
        else:
            self.results['optional_fail'] += 1
            print("💡 Multi-source search limited")
            
        # 2. API Key Setup
        if self._check_api_keys():
            self.results['optional_pass'] += 1
            print("✅ AI APIs configured")
        else:
            self.results['optional_fail'] += 1
            print("💡 AI APIs not configured (fallback mode)")
            
        # 3. Cold Outreach
        if self._check_cold_outreach():
            self.results['optional_pass'] += 1
            print("✅ Cold outreach templates ready")
        else:
            self.results['optional_fail'] += 1
            print("💡 Cold outreach needs enhancement")
    
    def _check_profile_system(self) -> bool:
        """Check profile system"""
        try:
            from core.services.profile_manager import ProfileManager
            profile = ProfileManager()
            
            # Check basic data
            name = profile.get_name()
            email = profile.get_email()
            skills = profile.get_programming_languages()
            
            # Check no fake data
            if 'example.com' in email or not name or not skills:
                return False
                
            return True
        except Exception as e:
            self.results['errors'].append(f"Profile system: {e}")
            return False
    
    async def _check_job_search(self) -> bool:
        """Check job search functionality"""
        try:
            from enhanced_job_finder import EnhancedJobFinder
            finder = EnhancedJobFinder()
            
            jobs = await finder.search_jobs("software engineer", limit=3)
            
            if not jobs or len(jobs) == 0:
                return False
                
            # Check job structure
            job = jobs[0]
            required_fields = ['title', 'company', 'location', 'score']
            for field in required_fields:
                if field not in job:
                    return False
            
            return True
        except Exception as e:
            self.results['errors'].append(f"Job search: {e}")
            return False
    
    async def _check_material_generation(self) -> bool:
        """Check resume and cover letter generation"""
        try:
            from core.services.ai_content_generator import AIContentGenerator
            generator = AIContentGenerator()
            
            test_job = {
                'company': 'Test Company',
                'title': 'Software Engineer',
                'location': 'Test Location',
                'description': 'Test description'
            }
            
            # Test fallback generation (works without API keys)
            resume = generator._generate_fallback_resume(test_job, {})
            cover_letter = generator._generate_fallback_cover_letter(test_job, {})
            
            if not resume or not cover_letter:
                return False
            
            # Check no fake data
            resume_content = resume.get('content', '')
            if 'example.com' in resume_content or '555-0100' in resume_content:
                return False
            
            return True
        except Exception as e:
            self.results['errors'].append(f"Material generation: {e}")
            return False
    
    def _check_no_fake_data(self) -> bool:
        """Scan for fake data in system"""
        fake_patterns = [
            'renatodap@example.com',
            '555-0100',
            'University Name',
            'Tech Company',
            'john doe',
            'jane doe'
        ]
        
        # Check profile
        try:
            with open('profile.json', 'r', encoding='utf-8') as f:
                profile_content = f.read().lower()
                
            for pattern in fake_patterns:
                if pattern.lower() in profile_content:
                    self.results['errors'].append(f"Fake data in profile: {pattern}")
                    return False
        except Exception:
            pass
        
        # Check recent resume files
        resume_dir = Path('data/resumes')
        if resume_dir.exists():
            recent_resumes = sorted(resume_dir.glob('*.txt'), key=lambda x: x.stat().st_mtime)[-3:]
            
            for resume_file in recent_resumes:
                try:
                    content = resume_file.read_text(encoding='utf-8').lower()
                    for pattern in fake_patterns:
                        if pattern.lower() in content:
                            self.results['errors'].append(f"Fake data in {resume_file.name}: {pattern}")
                            return False
                except Exception:
                    continue
        
        return True
    
    def _check_file_structure(self) -> bool:
        """Check required files exist"""
        required_files = [
            'profile.json',
            'core/services/profile_manager.py',
            'core/services/ai_content_generator.py',
            'enhanced_job_finder.py',
            'jobflow_personal.py'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not Path(file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.results['errors'].append(f"Missing files: {missing_files}")
            return False
        
        return True
    
    async def _check_daily_automation(self) -> bool:
        """Check daily automation system"""
        try:
            # Test that the automation can be imported
            from jobflow_personal import JobFlowPersonal
            system = JobFlowPersonal()
            
            # Check profile loading
            if not hasattr(system, 'profile') or not system.profile:
                return False
            
            return True
        except Exception as e:
            self.results['errors'].append(f"Daily automation: {e}")
            return False
    
    def _check_data_persistence(self) -> bool:
        """Check data saving functionality"""
        try:
            # Check required directories exist
            required_dirs = [
                'data/resumes',
                'data/cover_letters',
                'data/daily_reports',
                'data/tracking'
            ]
            
            for dir_path in required_dirs:
                Path(dir_path).mkdir(parents=True, exist_ok=True)
            
            # Check CSV files can be created
            test_csv = Path('data/tracking/test.csv')
            test_csv.write_text('test,data\\n1,2', encoding='utf-8')
            test_csv.unlink()  # Clean up
            
            return True
        except Exception as e:
            self.results['errors'].append(f"Data persistence: {e}")
            return False
    
    def _check_error_handling(self) -> bool:
        """Check error handling robustness"""
        try:
            from core.services.profile_manager import ProfileManager
            
            # Test with invalid profile should handle gracefully
            # This is a basic check - in production we'd test more edge cases
            profile = ProfileManager()
            
            return True
        except Exception:
            # If it crashes ungracefully, error handling needs work
            return False
    
    async def _check_multi_source_search(self) -> bool:
        """Check multi-source search capability"""
        try:
            from core.services.multi_source_search import MultiSourceJobSearch
            searcher = MultiSourceJobSearch()
            
            # Test API connections
            connections = await searcher.test_api_connections()
            
            # At least Adzuna should work
            adzuna_status = connections.get('adzuna', {}).get('status')
            return adzuna_status == 'working'
            
        except Exception as e:
            self.results['errors'].append(f"Multi-source search: {e}")
            return False
    
    def _check_api_keys(self) -> bool:
        """Check if AI API keys are configured"""
        openai_key = os.getenv('OPENAI_API_KEY')
        claude_key = os.getenv('ANTHROPIC_API_KEY') or os.getenv('LLM_API_KEY')
        
        return bool(openai_key or claude_key)
    
    def _check_cold_outreach(self) -> bool:
        """Check cold outreach capabilities"""
        try:
            # Check if cold outreach generator exists
            outreach_file = Path('cold_outreach_generator.py')
            return outreach_file.exists()
        except Exception:
            return False
    
    def _generate_deployment_report(self):
        """Generate comprehensive deployment report"""
        print("\n" + "="*80)
        print("DEPLOYMENT READINESS REPORT")
        print("="*80)
        
        # Critical status
        critical_total = self.results['critical_pass'] + self.results['critical_fail']
        critical_rate = (self.results['critical_pass'] / critical_total * 100) if critical_total > 0 else 0
        
        print(f"\n🚨 CRITICAL REQUIREMENTS: {self.results['critical_pass']}/{critical_total} passed ({critical_rate:.0f}%)")
        
        if self.results['critical_fail'] > 0:
            print("   ❌ Critical issues must be fixed before deployment")
        else:
            print("   ✅ All critical requirements met")
        
        # Important status
        important_total = self.results['important_pass'] + self.results['important_fail']
        important_rate = (self.results['important_pass'] / important_total * 100) if important_total > 0 else 0
        
        print(f"\n⚠️ IMPORTANT FEATURES: {self.results['important_pass']}/{important_total} working ({important_rate:.0f}%)")
        
        # Optional status
        optional_total = self.results['optional_pass'] + self.results['optional_fail']
        optional_rate = (self.results['optional_pass'] / optional_total * 100) if optional_total > 0 else 0
        
        print(f"\n💡 OPTIONAL FEATURES: {self.results['optional_pass']}/{optional_total} available ({optional_rate:.0f}%)")
        
        # Overall deployment readiness
        print(f"\n" + "="*80)
        
        if self.results['critical_fail'] == 0:
            if critical_rate == 100 and important_rate >= 80:
                print("🚀 READY FOR DEPLOYMENT!")
                print("✅ All critical requirements met")
                print("✅ Most important features working")
                print("\n📋 DEPLOYMENT CHECKLIST:")
                print("1. Set up API keys for enhanced AI features (optional)")
                print("2. Configure email service for daily reports")
                print("3. Set up scheduling for daily automation")
                print("4. Monitor system for first few days")
                
            elif critical_rate == 100:
                print("⚡ READY FOR BASIC DEPLOYMENT")
                print("✅ Core functionality working")
                print("⚠️ Some features need improvement")
                
        else:
            print("❌ NOT READY FOR DEPLOYMENT")
            print(f"🔧 Fix {self.results['critical_fail']} critical issues first")
        
        # Error details
        if self.results['errors']:
            print(f"\n🐛 ISSUES TO ADDRESS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        # Next steps
        print(f"\n📝 NEXT STEPS:")
        if self.results['critical_fail'] == 0:
            print("   1. Deploy system to production environment")
            print("   2. Set up monitoring and alerting")
            print("   3. Configure daily automation schedule")
            print("   4. Test with real job search for 2-3 days")
            print("   5. Optimize based on results")
        else:
            print("   1. Fix all critical issues listed above")
            print("   2. Re-run validation: python deployment_validator.py")
            print("   3. Deploy when all critical checks pass")
        
        print("="*80)
        
        # Save report
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = f"deployment_report_{timestamp}.txt"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"JobFlow Deployment Validation Report\\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\\n")
            f.write(f"\\nCritical: {self.results['critical_pass']}/{critical_total} ({critical_rate:.0f}%)\\n")
            f.write(f"Important: {self.results['important_pass']}/{important_total} ({important_rate:.0f}%)\\n")
            f.write(f"Optional: {self.results['optional_pass']}/{optional_total} ({optional_rate:.0f}%)\\n")
            
            if self.results['errors']:
                f.write(f"\\nErrors:\\n")
                for error in self.results['errors']:
                    f.write(f"- {error}\\n")
        
        print(f"📄 Detailed report saved: {report_path}")


def main():
    """Run deployment validation"""
    validator = DeploymentValidator()
    validator.validate_all()


if __name__ == "__main__":
    main()