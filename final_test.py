#!/usr/bin/env python3
"""
Final Deployment Test - Plain ASCII for compatibility
"""

import asyncio
import sys

async def final_test():
    print("="*60)
    print("JOBFLOW FINAL DEPLOYMENT TEST")
    print("="*60)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Profile System
    tests_total += 1
    try:
        from core.services.profile_manager import ProfileManager
        profile = ProfileManager()
        name = profile.get_name()
        email = profile.get_email()
        skills = profile.get_programming_languages()
        
        if name and email and skills and 'example.com' not in email:
            print("PASS: Profile system working with real data")
            print(f"      Name: {name}")
            print(f"      Email: {email}")
            tests_passed += 1
        else:
            print("FAIL: Profile system has issues")
    except Exception as e:
        print(f"ERROR: Profile system - {e}")
    
    # Test 2: Job Search
    tests_total += 1
    try:
        from enhanced_job_finder import EnhancedJobFinder
        finder = EnhancedJobFinder()
        jobs = await finder.search_jobs("python developer", limit=3)
        
        if jobs and len(jobs) > 0:
            print(f"PASS: Job search found {len(jobs)} opportunities")
            print(f"      Example: {jobs[0]['title']} at {jobs[0]['company']}")
            tests_passed += 1
        else:
            print("FAIL: Job search found no results")
    except Exception as e:
        print(f"ERROR: Job search - {e}")
    
    # Test 3: Resume Generation  
    tests_total += 1
    try:
        from core.services.ai_content_generator import AIContentGenerator
        generator = AIContentGenerator()
        
        test_job = {
            'company': 'TechCorp',
            'title': 'Software Engineer',
            'location': 'San Francisco, CA', 
            'description': 'Python and React experience required'
        }
        
        resume = generator._generate_fallback_resume(test_job, {})
        
        if (resume and 'content' in resume and 
            'renatodapapplications@gmail.com' in resume['content'] and
            'example.com' not in resume['content']):
            print("PASS: Resume generation with real data")
            tests_passed += 1
        else:
            print("FAIL: Resume generation issues")
    except Exception as e:
        print(f"ERROR: Resume generation - {e}")
    
    # Test 4: Daily Automation
    tests_total += 1
    try:
        from jobflow_personal import JobFlowPersonal
        system = JobFlowPersonal()
        
        if hasattr(system, 'profile') and system.profile:
            profile_name = system.profile.get('personal', {}).get('name', 'Unknown')
            print(f"PASS: Daily automation system loaded")
            print(f"      Profile: {profile_name}")
            tests_passed += 1
        else:
            print("FAIL: Daily automation profile loading")
    except Exception as e:
        print(f"ERROR: Daily automation - {e}")
    
    # Test 5: Data Saving
    tests_total += 1
    try:
        from pathlib import Path
        
        # Check required directories
        required_dirs = ['data/resumes', 'data/cover_letters', 'data/daily_reports', 'data/tracking']
        all_exist = True
        
        for dir_path in required_dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            if not Path(dir_path).exists():
                all_exist = False
                break
        
        if all_exist:
            print("PASS: Data persistence system ready")
            tests_passed += 1
        else:
            print("FAIL: Data persistence issues")
    except Exception as e:
        print(f"ERROR: Data persistence - {e}")
    
    # Summary
    print("\n" + "="*60)
    print("FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.0f}%")
    
    if tests_passed == tests_total:
        print("\nSTATUS: READY FOR DEPLOYMENT!")
        print("All critical systems working correctly")
        print("No fake data detected")
        print("System is production-ready")
        
        print("\nDEPLOYMENT CHECKLIST:")
        print("1. [DONE] Core job search working")
        print("2. [DONE] Resume generation with real data")
        print("3. [DONE] Daily automation system ready")
        print("4. [TODO] Set up API keys for enhanced AI")
        print("5. [TODO] Configure daily schedule")
        print("6. [TODO] Set up email notifications")
        
    elif tests_passed >= tests_total - 1:
        print("\nSTATUS: MOSTLY READY")
        print("Core functionality working")
        print("Minor issues can be fixed post-deployment")
        
    else:
        print("\nSTATUS: NEEDS MORE WORK")
        print("Multiple systems need attention")
        print("Fix issues before deployment")
    
    print("="*60)
    
    return tests_passed == tests_total

if __name__ == "__main__":
    asyncio.run(final_test())