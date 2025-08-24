"""
Fix Fake Data in Resume Files
Replace all placeholder data with real profile information
"""

import json
import os
import re
from pathlib import Path

def load_profile():
    """Load real profile data"""
    with open('profile.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def fix_fake_data_in_file(file_path: Path, profile: dict):
    """Replace fake data with real data in a single file"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Track what was replaced
        replacements_made = []
        
        # Replace fake email
        if 'renatodap@example.com' in content:
            content = content.replace('renatodap@example.com', profile['personal']['email'])
            replacements_made.append('email')
        
        # Replace fake phone
        if '555-0100' in content:
            content = content.replace('555-0100', profile['personal']['phone'])
            replacements_made.append('phone')
            
        # Replace fake LinkedIn (partial)
        if 'linkedin.com/in/renatodap' in content and 'renato-prado-82513b297' not in content:
            content = content.replace('linkedin.com/in/renatodap', profile['personal']['linkedin'])
            replacements_made.append('linkedin')
        
        # Replace University Name
        if 'University Name' in content:
            content = content.replace('University Name', profile['education'][0]['school'])
            replacements_made.append('university')
        
        # Replace fake companies
        if 'Tech Company' in content:
            content = content.replace('Tech Company', 'Virtus BR Partners')
            replacements_made.append('company')
        
        if 'Major Tech Company' in content:
            content = content.replace('Major Tech Company', 'Rose-Hulman Institute of Technology (Teaching Assistant)')
            replacements_made.append('ta_role')
            
        # Replace fake experience details with real ones
        if 'Software Engineering Intern | Major Tech Company | Summer 2025' in content:
            content = content.replace(
                'Software Engineering Intern | Major Tech Company | Summer 2025',
                'Teaching Assistant | Rose-Hulman Institute of Technology | Aug 2024 - Present'
            )
            replacements_made.append('experience_header')
            
        # Replace fake achievements with real ones
        if 'Developed features for product used by millions' in content:
            content = content.replace(
                'Developed features for product used by millions',
                'Support 30+ students in Object-Oriented Software Development using Java'
            )
            replacements_made.append('achievement1')
            
        if 'Collaborated with cross-functional teams' in content:
            content = content.replace(
                'Collaborated with cross-functional teams',
                'Developed automated grading scripts reducing instructor workload by 60%'
            )
            replacements_made.append('achievement2')
            
        if 'Participated in code reviews and design discussions' in content:
            content = content.replace(
                'Participated in code reviews and design discussions',
                'Mentor students on design patterns, code quality, and software architecture'
            )
            replacements_made.append('achievement3')
        
        # Fix the second experience entry
        if 'Software Development Intern | Startup | Summer 2024' in content:
            content = content.replace(
                'Software Development Intern | Startup | Summer 2024',
                'Investment Banking Intern | Virtus BR Partners | Summer 2024 (Remote)'
            )
            replacements_made.append('internship_header')
            
        if 'Built full-stack web applications' in content:
            content = content.replace(
                'Built full-stack web applications', 
                'Built financial models for $50M+ renewable energy deals'
            )
            replacements_made.append('internship_achievement1')
            
        if 'Worked in fast-paced agile environment' in content:
            content = content.replace(
                'Worked in fast-paced agile environment',
                'Automated pitch deck generation saving 15 hours weekly'
            )
            replacements_made.append('internship_achievement2')
        
        # Fix GPA if it's fake
        if 'GPA: 3.8/4.0' in content:
            content = content.replace('GPA: 3.8/4.0', f"GPA: {profile['education'][0]['gpa']}/4.0")
            replacements_made.append('gpa')
        
        # Write fixed content back
        if replacements_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"[FIXED] {file_path.name}: {', '.join(replacements_made)}")
            return len(replacements_made)
        else:
            print(f"[SKIP] {file_path.name}: No fake data found")
            return 0
            
    except Exception as e:
        print(f"[ERROR] {file_path.name}: {e}")
        return 0

def main():
    """Fix all fake data in resume files"""
    
    print("=" * 60)
    print("FIXING FAKE DATA IN RESUME FILES")
    print("=" * 60)
    
    # Load profile
    profile = load_profile()
    print(f"Loaded profile for: {profile['personal']['name']}")
    
    # Find all resume files  
    resume_dir = Path('data/resumes')
    resume_files = list(resume_dir.glob('renatodap_resume_*.txt'))
    
    print(f"Found {len(resume_files)} resume files to fix")
    print()
    
    total_replacements = 0
    fixed_files = 0
    
    # Fix each file
    for file_path in sorted(resume_files):
        replacements = fix_fake_data_in_file(file_path, profile)
        if replacements > 0:
            fixed_files += 1
            total_replacements += replacements
    
    print()
    print("=" * 60)
    print("FAKE DATA FIX COMPLETE")
    print("=" * 60)
    print(f"Files processed: {len(resume_files)}")
    print(f"Files fixed: {fixed_files}")
    print(f"Total replacements: {total_replacements}")
    
    # Verify no fake data remains
    print("\nVerifying no fake data remains...")
    fake_patterns = ['renatodap@example.com', '555-0100', 'University Name', 'Tech Company']
    
    remaining_violations = 0
    for file_path in resume_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            file_violations = 0
            for pattern in fake_patterns:
                if pattern in content:
                    file_violations += 1
                    remaining_violations += 1
            
            if file_violations > 0:
                print(f"[STILL HAS FAKE DATA] {file_path.name}: {file_violations} violations")
        except:
            pass
    
    if remaining_violations == 0:
        print("[SUCCESS] Zero fake data violations remaining!")
    else:
        print(f"[WARNING] {remaining_violations} fake data violations still remain")
        
    return remaining_violations == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)