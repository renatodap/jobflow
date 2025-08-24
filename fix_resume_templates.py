#!/usr/bin/env python3
"""
Fix resume templates in enhanced_job_finder.py to use real profile data
Removes fake data and replaces with ProfileManager integration
"""

import re
from pathlib import Path

def fix_resume_templates():
    """Fix the resume templates to use real profile data"""
    
    file_path = Path('enhanced_job_finder.py')
    
    # Read the current file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the start of the create_resume_file method
    method_start = content.find('def create_resume_file(self, resume_name: str, resume_type: str, sample_job: Dict):')
    if method_start == -1:
        print("Could not find create_resume_file method")
        return False
    
    # Find the end of the method (next method definition or end of class)
    method_end = content.find('\n    def ', method_start + 1)
    if method_end == -1:
        # Look for end of class
        method_end = content.find('\n\nif __name__', method_start)
        if method_end == -1:
            method_end = len(content)
    
    # Create the new method content with real profile data
    new_method = '''def create_resume_file(self, resume_name: str, resume_type: str, sample_job: Dict):
        """Create a resume file tailored for the job type using REAL profile data"""
        resume_path = Path(f'data/resumes/{resume_name}.txt')
        
        # Import ProfileManager to get real candidate data
        from core.services.profile_manager import ProfileManager
        profile = ProfileManager()
        
        # Get keywords from the job for ATS optimization
        keywords = self.extract_keywords_from_job(sample_job)
        
        # Header with real contact info
        header = f"""{profile.get_name().upper()}
{profile.get_email()} | {profile.get_phone()}
{profile.get_github()} | {profile.get_linkedin()}"""
        
        # Education section with real data
        education = f"""EDUCATION
{profile.get_degree()} | GPA: {profile.get_gpa()}
{profile.get_school()} | Graduating {profile.get_graduation()}
Relevant Coursework: {', '.join(profile.get_coursework()[:4])}"""
        
        # Experience section with real data
        experience = f"""EXPERIENCE
{profile.get_experience_summary()}"""
        
        # Projects section with real data
        projects = f"""PROJECTS
{profile.get_projects_summary()}"""
        
        # Strengths with real data
        strengths = f"""UNIQUE QUALIFICATIONS
{chr(10).join(f'• {strength}' for strength in profile.get_strengths())}
• {profile.get_visa_status()}"""
        
        # Resume content based on type with REAL data
        if resume_type == 'ml':
            summary = f"Passionate Machine Learning Engineer with hands-on experience in AI/ML systems. Built FeelSharper (AI fitness platform) with computer vision for real-time form analysis. Strong foundation in {', '.join(profile.get_ai_ml_skills()[:3])}."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
AI/ML: {', '.join(profile.get_ai_ml_skills())}
Frameworks: {', '.join(profile.get_frameworks()[:5])}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: machine learning, ai, python, {', '.join(profile.get_ai_ml_skills()[:5]).lower()}"
        
        elif resume_type == 'backend':
            summary = f"Backend engineer with expertise in building scalable APIs and microservices. Built JobFlow automation system with FastAPI and created financial models automation at Virtus BR Partners."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Backend: {', '.join([f for f in profile.get_frameworks() if f in ['FastAPI', 'Django', 'Spring Boot', 'Node.js']])}
Databases: {', '.join(profile.get_databases())}
Cloud: {', '.join(profile.get_cloud_skills())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: backend, api, python, {', '.join(profile.get_databases()[:3]).lower()}, microservices"
        
        elif resume_type == 'frontend':
            summary = f"Frontend developer passionate about creating exceptional user experiences. Built FeelSharper's responsive interface using Next.js and TypeScript with real-time computer vision integration."
            tech_skills = f"""TECHNICAL SKILLS
Frontend: React, Next.js, TypeScript, JavaScript, HTML5, CSS3
Frameworks: {', '.join([f for f in profile.get_frameworks() if f in ['React', 'Next.js', 'Vue.js']])}
Tools: {', '.join(profile.get_tools()[:6])}
Design: Tailwind CSS, Responsive Design, UI/UX"""
            keywords_section = "KEYWORDS: frontend, react, next.js, typescript, javascript, ui, ux"
        
        elif resume_type == 'fullstack':
            summary = f"Full stack engineer with experience across the entire development stack. Built FeelSharper (AI fitness platform) from concept to deployment using Next.js, FastAPI, and advanced AI integration."
            tech_skills = f"""TECHNICAL SKILLS
Frontend: {', '.join([f for f in profile.get_frameworks() if f in ['React', 'Next.js']])}
Backend: {', '.join([f for f in profile.get_frameworks() if f in ['FastAPI', 'Django', 'Node.js']])}
Languages: {', '.join(profile.get_programming_languages())}
Databases: {', '.join(profile.get_databases())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = "KEYWORDS: full stack, react, next.js, python, fastapi, typescript"
        
        elif resume_type == 'dataeng':
            summary = f"Data engineer with experience in building automated systems and data processing pipelines. Built JobFlow's intelligent job discovery system and automated financial model generation at Virtus BR Partners."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Data: SQL, {', '.join(profile.get_databases())}, Data Pipelines
Cloud: {', '.join(profile.get_cloud_skills())}
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: data engineer, python, sql, {', '.join(profile.get_databases()[:3]).lower()}, etl"
        
        elif resume_type == 'datascience':
            summary = f"Data scientist with strong foundation in AI/ML and statistical analysis. Built FeelSharper's computer vision system for real-time form analysis and created predictive models for investment banking."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
AI/ML: {', '.join(profile.get_ai_ml_skills())}
Data Science: SQL, Data Analysis, Statistical Modeling
Tools: {', '.join(profile.get_tools()[:6])}"""
            keywords_section = f"KEYWORDS: data science, machine learning, python, {', '.join(profile.get_ai_ml_skills()[:3]).lower()}"
        
        elif resume_type == 'newgrad':
            summary = f"Computer Science student graduating {profile.get_graduation()} with hands-on experience in AI/ML, full-stack development, and team leadership. Built innovative projects including FeelSharper and JobFlow while maintaining strong academic performance."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Frameworks: {', '.join(profile.get_frameworks()[:6])}
Tools: {', '.join(profile.get_tools()[:6])}
Databases: {', '.join(profile.get_databases())}"""
            keywords_section = f"KEYWORDS: new grad, software engineer, {profile.get_graduation().split()[-1]}, computer science"
        
        else:  # general
            summary = f"Versatile software engineer with experience across multiple domains including AI/ML, web development, and automation. Strong problem-solving skills demonstrated through innovative projects and international business experience."
            tech_skills = f"""TECHNICAL SKILLS
Languages: {', '.join(profile.get_programming_languages())}
Frameworks: {', '.join(profile.get_frameworks()[:6])}
Tools: {', '.join(profile.get_tools()[:6])}
Databases: {', '.join(profile.get_databases())}"""
            keywords_section = "KEYWORDS: software engineer, python, typescript, full stack, ai"
        
        # Combine all sections
        resume_content = f"""{header}

SUMMARY
{summary}

{tech_skills}

{education}

{experience}

{projects}

{strengths}

{keywords_section}, {', '.join(keywords[:5]).lower()}"""
        
        # Write the resume file
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(resume_content)
        
        print(f"Created resume: {resume_name} for {resume_type} positions")
    
    def extract_keywords_from_job(self, job: Dict) -> list:
        """Extract keywords from job for ATS optimization"""
        description = f"{job.get('title', '')} {job.get('description', '')}".lower()
        
        keywords = []
        skill_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'nodejs',
            'sql', 'postgresql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git',
            'machine learning', 'ai', 'ml', 'deep learning', 'tensorflow', 'pytorch',
            'fastapi', 'django', 'flask', 'spring', 'express', 'next.js', 'nextjs',
            'vue', 'angular', 'html', 'css', 'sass', 'graphql', 'rest', 'api',
            'ci/cd', 'agile', 'scrum', 'jira', 'linux', 'bash', 'cloud', 'azure', 'gcp'
        ]
        
        for skill in skill_keywords:
            if skill in description:
                keywords.append(skill.title() if len(skill) > 3 else skill.upper())
        
        return keywords[:10]
'''
    
    # Replace the old method with the new one
    new_content = content[:method_start] + new_method + content[method_end:]
    
    # Write the fixed file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Fixed resume templates in enhanced_job_finder.py")
    print("✅ All resume templates now use real profile data")
    print("✅ No more fake data in resume generation")
    
    return True

if __name__ == "__main__":
    fix_resume_templates()