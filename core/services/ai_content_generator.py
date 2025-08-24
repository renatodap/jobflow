"""
AI Content Generator Service
Integrates OpenAI and Claude for intelligent resume and cover letter generation
"""

import os
import httpx
import asyncio
import json
from typing import Dict, Optional, List
from datetime import datetime

class AIContentGenerator:
    """
    Manages AI-powered content generation using OpenAI and Claude
    Optimizes for each model's strengths
    """
    
    def __init__(self):
        # API Keys
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY') or os.getenv('LLM_API_KEY')
        
        # Model configurations optimized for each use case
        self.models = {
            'openai': {
                'resume': 'gpt-4o-mini',  # Fast, good for structured content
                'cover_letter': 'gpt-4o-mini',
                'job_analysis': 'gpt-3.5-turbo',  # Cheaper for analysis
            },
            'claude': {
                'resume': 'claude-3-haiku-20240307',  # Fast and cheap
                'cover_letter': 'claude-3-5-sonnet-20241022',  # Best for creative writing
                'job_analysis': 'claude-3-haiku-20240307',
            }
        }
        
        # Track API usage for cost management
        self.usage_stats = {
            'openai_calls': 0,
            'claude_calls': 0,
            'total_tokens': 0
        }
    
    async def generate_tailored_resume(
        self, 
        job: Dict, 
        candidate_profile: Dict,
        use_claude: bool = False
    ) -> Dict:
        """
        Generate AI-tailored resume optimized for ATS and human readers
        
        OpenAI is default for resumes (better at structured content)
        Claude available as alternative
        """
        
        if use_claude and self.anthropic_key:
            return await self._generate_resume_claude(job, candidate_profile)
        elif self.openai_key:
            return await self._generate_resume_openai(job, candidate_profile)
        else:
            return self._generate_fallback_resume(job, candidate_profile)
    
    async def _generate_resume_openai(self, job: Dict, profile_dict: Dict) -> Dict:
        """Generate resume using OpenAI GPT-4"""
        
        # Import and use ProfileManager to ensure real data
        from .profile_manager import ProfileManager
        profile = ProfileManager()
        
        # Craft optimal prompt for resume generation
        system_prompt = """You are an expert ATS-optimized resume writer specializing in tech positions for new graduates. 
        Your resumes consistently achieve 95%+ ATS scores and get interviews.
        
        CRITICAL: You must ONLY use the real candidate information provided. NEVER create fake data, fake companies, fake experience, fake contact information, or fake achievements. If information is missing, leave it out or mark it as "Available upon request".
        
        Key principles:
        1. Use exact keywords from the job description
        2. Quantify achievements with numbers and percentages
        3. Start bullets with strong action verbs
        4. Prioritize relevant experience and skills
        5. Keep formatting clean and ATS-friendly"""
        
        user_prompt = f"""Create a perfectly tailored resume for this specific position using ONLY the real candidate data provided.

JOB DETAILS:
Company: {job.get('company', 'Unknown')}
Title: {job.get('title', 'Software Engineer')}
Location: {job.get('location', 'United States')}
Description: {job.get('description', '')[:1500]}
Required Skills: {self._extract_skills_from_job(job)}

{profile.get_complete_background()}

INSTRUCTIONS:
1. Use ONLY the real data provided above - NO fake data, companies, or experiences
2. Analyze the job requirements and extract key technical keywords
3. Reorganize experience to highlight most relevant items first
4. Rewrite bullet points to include job-specific keywords naturally
5. Emphasize projects/experience that match their tech stack
6. Include a brief professional summary tailored to this role
7. Use contact info exactly as provided: {profile.get_email()}, {profile.get_phone()}
8. Format in clean markdown suitable for ATS parsing

Generate a complete, tailored resume that will score 95%+ on ATS systems using ONLY real candidate data."""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.models['openai']['resume'],
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.3,  # Lower temperature for consistency
                        "max_tokens": 2500,
                        "presence_penalty": 0.1,
                        "frequency_penalty": 0.1
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Track usage
                self.usage_stats['openai_calls'] += 1
                self.usage_stats['total_tokens'] += result.get('usage', {}).get('total_tokens', 0)
                
                resume_content = result['choices'][0]['message']['content']
                
                return {
                    'content': resume_content,
                    'generator': 'OpenAI GPT-4',
                    'model': self.models['openai']['resume'],
                    'ats_optimized': True,
                    'keywords_included': self._extract_skills_from_job(job),
                    'generation_date': datetime.now().isoformat(),
                    'tokens_used': result.get('usage', {}).get('total_tokens', 0)
                }
                
        except Exception as e:
            print(f"OpenAI resume generation error: {e}")
            return self._generate_fallback_resume(job, profile)
    
    async def _generate_resume_claude(self, job: Dict, profile_dict: Dict) -> Dict:
        """Generate resume using Claude (alternative approach)"""
        
        # Import and use ProfileManager to ensure real data
        from .profile_manager import ProfileManager
        profile = ProfileManager()
        
        prompt = f"""Create an ATS-optimized resume tailored for this specific job using ONLY real candidate data.

CRITICAL: You must ONLY use the real candidate information provided below. NEVER create fake data, fake companies, fake experience, fake contact information, or fake achievements.

<job_details>
Company: {job.get('company')}
Position: {job.get('title')}
Description: {job.get('description', '')[:1500]}
</job_details>

<real_candidate_data>
{profile.get_complete_background()}
</real_candidate_data>

Create a tailored resume that:
1. Uses ONLY the real data provided above
2. Uses keywords from the job description for ATS optimization
3. Highlights relevant experience and projects
4. Quantifies achievements with real numbers
5. Shows progression and growth
6. Emphasizes technical skills that match requirements
7. Uses exact contact info: {profile.get_email()}, {profile.get_phone()}

Format in clean markdown. NO FAKE DATA ALLOWED."""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json={
                        "model": self.models['claude']['resume'],
                        "max_tokens": 2500,
                        "temperature": 0.3,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Track usage
                self.usage_stats['claude_calls'] += 1
                
                resume_content = result['content'][0]['text']
                
                return {
                    'content': resume_content,
                    'generator': 'Claude',
                    'model': self.models['claude']['resume'],
                    'ats_optimized': True,
                    'generation_date': datetime.now().isoformat()
                }
                
        except Exception as e:
            print(f"Claude resume generation error: {e}")
            return self._generate_fallback_resume(job, profile)
    
    async def generate_personalized_cover_letter(
        self, 
        job: Dict, 
        candidate_profile: Dict,
        use_openai: bool = False
    ) -> Dict:
        """
        Generate personalized cover letter
        
        Claude is default for cover letters (better at creative writing)
        OpenAI available as alternative
        """
        
        if self.anthropic_key and not use_openai:
            return await self._generate_cover_letter_claude(job, candidate_profile)
        elif self.openai_key:
            return await self._generate_cover_letter_openai(job, candidate_profile)
        else:
            return self._generate_fallback_cover_letter(job, candidate_profile)
    
    async def _generate_cover_letter_claude(self, job: Dict, profile_dict: Dict) -> Dict:
        """Generate cover letter using Claude (best for creative writing)"""
        
        # Import and use ProfileManager to ensure real data
        from .profile_manager import ProfileManager
        profile = ProfileManager()
        
        # Claude excels at natural, engaging writing
        prompt = f"""Write a compelling, authentic cover letter for this position using ONLY real candidate data.

CRITICAL: You must ONLY use the real candidate information provided below. NEVER create fake data, fake companies, fake experience, or fake achievements.

<job>
Company: {job.get('company')}
Position: {job.get('title')}
Location: {job.get('location')}
Description: {job.get('description', '')[:1000]}
Company Culture: {self._infer_company_culture(job)}
</job>

<real_candidate_data>
{profile.get_complete_background()}
</real_candidate_data>

<instructions>
Write a cover letter that:
1. Uses ONLY the real candidate data provided above
2. Opens with a compelling hook that connects to the company's mission
3. Tells a brief story that demonstrates problem-solving ability using real projects/experience
4. Connects unique background to job requirements
5. Shows genuine enthusiasm for the specific role and company
6. Demonstrates research about the company
7. Ends with confidence and clear next steps
8. Maintains professional yet personable tone
9. Avoids clichés and generic statements
10. Uses exact name and contact info as provided

NO FAKE DATA ALLOWED - use only the authentic background provided.
</instructions>

The letter should feel authentic, memorable, and demonstrate why this candidate's unique background makes them exceptional for this role."""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json={
                        "model": self.models['claude']['cover_letter'],  # Using Sonnet for best quality
                        "max_tokens": 1500,
                        "temperature": 0.7,  # Higher for creativity
                        "messages": [
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Track usage
                self.usage_stats['claude_calls'] += 1
                
                cover_letter_content = result['content'][0]['text']
                
                return {
                    'content': cover_letter_content,
                    'generator': 'Claude Sonnet',
                    'model': self.models['claude']['cover_letter'],
                    'personalization_level': 'high',
                    'generation_date': datetime.now().isoformat()
                }
                
        except Exception as e:
            print(f"Claude cover letter generation error: {e}")
            return self._generate_fallback_cover_letter(job, profile)
    
    async def _generate_cover_letter_openai(self, job: Dict, profile: Dict) -> Dict:
        """Generate cover letter using OpenAI (alternative)"""
        
        system_prompt = """You are an expert cover letter writer who creates memorable, authentic letters that get interviews.
        Your letters stand out by telling compelling stories and making genuine connections."""
        
        user_prompt = f"""Write a personalized cover letter for:

POSITION: {job.get('title')} at {job.get('company')}
JOB DESCRIPTION: {job.get('description', '')[:1000]}

CANDIDATE HIGHLIGHTS:
- Rose-Hulman CS student (3.65 GPA, graduating May 2026)
- NCAA tennis player + multi-instrumentalist (unique combination of technical/creative/athletic)
- Built AI-powered fitness platform (FeelSharper) and job automation system (JobFlow)
- International perspective (Brazilian, speaks 4 languages)
- Teaching Assistant + Investment Banking experience

Create a cover letter that:
1. Opens with an engaging hook
2. Tells a specific story demonstrating problem-solving
3. Connects unique background to role requirements
4. Shows genuine interest in the company
5. Closes with confidence

Make it memorable and authentic, not generic."""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.models['openai']['cover_letter'],
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1500
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                self.usage_stats['openai_calls'] += 1
                self.usage_stats['total_tokens'] += result.get('usage', {}).get('total_tokens', 0)
                
                cover_letter_content = result['choices'][0]['message']['content']
                
                return {
                    'content': cover_letter_content,
                    'generator': 'OpenAI GPT-4',
                    'model': self.models['openai']['cover_letter'],
                    'generation_date': datetime.now().isoformat(),
                    'tokens_used': result.get('usage', {}).get('total_tokens', 0)
                }
                
        except Exception as e:
            print(f"OpenAI cover letter generation error: {e}")
            return self._generate_fallback_cover_letter(job, profile)
    
    async def analyze_job_requirements(self, job: Dict) -> Dict:
        """
        Use AI to deeply analyze job requirements and extract insights
        """
        
        if self.openai_key:
            return await self._analyze_job_openai(job)
        elif self.anthropic_key:
            return await self._analyze_job_claude(job)
        else:
            return self._basic_job_analysis(job)
    
    async def _analyze_job_openai(self, job: Dict) -> Dict:
        """Analyze job using OpenAI (good at structured extraction)"""
        
        prompt = f"""Analyze this job posting and extract structured information:

JOB: {job.get('title')} at {job.get('company')}
DESCRIPTION: {job.get('description', '')[:2000]}

Extract and return as JSON:
1. required_skills: List of technical skills explicitly required
2. preferred_skills: List of nice-to-have skills
3. experience_level: Entry/Junior/Mid/Senior
4. visa_friendly: true/false based on any visa mentions
5. red_flags: Any concerns for new grads (e.g., "5+ years required")
6. key_responsibilities: Top 3 main responsibilities
7. tech_stack: Specific technologies mentioned
8. company_culture: Inferred culture from language used
9. growth_opportunity: High/Medium/Low based on description
10. fit_score_factors: Factors that would increase/decrease fit"""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.models['openai']['job_analysis'],
                        "messages": [
                            {"role": "system", "content": "You are a job analysis expert. Always return valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.1,  # Low temperature for consistency
                        "max_tokens": 1000,
                        "response_format": {"type": "json_object"}
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                analysis = json.loads(result['choices'][0]['message']['content'])
                analysis['analyzer'] = 'OpenAI'
                
                return analysis
                
        except Exception as e:
            print(f"OpenAI job analysis error: {e}")
            return self._basic_job_analysis(job)
    
    def _extract_skills_from_job(self, job: Dict) -> List[str]:
        """Extract technical skills from job description"""
        
        description = f"{job.get('title', '')} {job.get('description', '')}".lower()
        
        # Common technical skills to look for
        skills = []
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
                skills.append(skill.title() if len(skill) > 3 else skill.upper())
        
        return skills[:10]  # Top 10 skills
    
    def _infer_company_culture(self, job: Dict) -> str:
        """Infer company culture from job description"""
        
        description = job.get('description', '').lower()
        
        culture_hints = []
        
        if any(word in description for word in ['fast-paced', 'startup', 'agile', 'dynamic']):
            culture_hints.append('fast-paced startup environment')
        if any(word in description for word in ['collaborative', 'team', 'together']):
            culture_hints.append('collaborative team culture')
        if any(word in description for word in ['innovative', 'cutting-edge', 'disrupt']):
            culture_hints.append('innovation-focused')
        if any(word in description for word in ['work-life', 'balance', 'flexible', 'remote']):
            culture_hints.append('work-life balance emphasis')
        if any(word in description for word in ['mentor', 'growth', 'learning', 'development']):
            culture_hints.append('growth and learning culture')
        
        return ', '.join(culture_hints) if culture_hints else 'professional environment'
    
    def _basic_job_analysis(self, job: Dict) -> Dict:
        """Basic job analysis without AI"""
        
        return {
            'required_skills': self._extract_skills_from_job(job),
            'experience_level': self._determine_experience_level(job),
            'company_culture': self._infer_company_culture(job),
            'analyzer': 'Basic (No AI)'
        }
    
    def _determine_experience_level(self, job: Dict) -> str:
        """Determine experience level from job title and description"""
        
        text = f"{job.get('title', '')} {job.get('description', '')}".lower()
        
        if any(term in text for term in ['senior', 'staff', 'principal', 'lead', 'manager']):
            return 'Senior'
        elif any(term in text for term in ['junior', 'entry', 'new grad', 'graduate', 'associate']):
            return 'Entry'
        else:
            return 'Mid'
    
    def _generate_fallback_resume(self, job: Dict, profile_dict: Dict) -> Dict:
        """Generate resume without AI (enhanced template)"""
        
        # Import and use ProfileManager to ensure real data
        from .profile_manager import ProfileManager
        profile = ProfileManager()
        
        skills = self._extract_skills_from_job(job)
        
        resume_content = f"""# {profile.get_name()}
**Software Engineer | AI Enthusiast | NCAA Athlete**

{profile.get_email()} | {profile.get_phone()}
{profile.get_github()} | {profile.get_linkedin()}

## Professional Summary
{self._generate_summary_for_job_real(job, profile)}

## Education
**{profile.get_degree()}** | GPA: {profile.get_gpa()}
{profile.get_school()} | Graduating {profile.get_graduation()}

## Technical Skills
**Languages**: {', '.join(profile.get_programming_languages())}
**Frameworks**: {', '.join(profile.get_frameworks())}
**AI/ML**: {', '.join(profile.get_ai_ml_skills())}
**Tools**: {', '.join(profile.get_tools())}

## Experience
{profile.get_experience_summary()}

## Projects
{profile.get_projects_summary()}

## Additional Qualifications
{chr(10).join(f'- {strength}' for strength in profile.get_strengths())}
- {profile.get_visa_status()}
"""
        
        return {
            'content': resume_content,
            'generator': 'Template Engine (Real Data Only)',
            'ats_optimized': False,
            'generation_date': datetime.now().isoformat()
        }
    
    def _generate_fallback_cover_letter(self, job: Dict, profile_dict: Dict) -> Dict:
        """Generate cover letter without AI"""
        
        # Import and use ProfileManager to ensure real data
        from .profile_manager import ProfileManager
        profile = ProfileManager()
        
        cover_letter = f"""Dear Hiring Manager,

I am writing to express my interest in the {job.get('title')} position at {job.get('company')}. As a Computer Science student at {profile.get_school()} graduating in {profile.get_graduation()}, I am excited about the opportunity to contribute to your team.

{self._generate_body_paragraph_real(job, profile)}

My unique background combining the disciplines of {', '.join(profile.get_strengths()[:3])} has taught me discipline, creativity, and the value of continuous improvement. These qualities, combined with my technical skills and international perspective, position me well to contribute to {job.get('company')}'s success.

I am available for full-time employment starting {profile.get_availability()} and have {profile.get_visa_status()}. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team.

Thank you for your consideration.

Sincerely,
{profile.get_name()}"""
        
        return {
            'content': cover_letter,
            'generator': 'Template Engine (Real Data Only)',
            'personalization_level': 'basic',
            'generation_date': datetime.now().isoformat()
        }
    
    def _generate_summary_for_job_real(self, job: Dict, profile) -> str:
        """Generate professional summary for job using real data"""
        
        projects_text = ', '.join([p['name'] for p in profile.get_projects()[:2]])
        
        if 'ai' in job.get('title', '').lower() or 'ml' in job.get('description', '').lower():
            return f"Passionate computer science student with hands-on experience in AI/ML seeking {job.get('title')} position. Proven track record building innovative applications including {projects_text}."
        else:
            return f"Motivated computer science student with strong foundation in full-stack development seeking {job.get('title')} position. Built impactful projects including {projects_text}, combining technical expertise with unique perspective."
    
    def _generate_body_paragraph_real(self, job: Dict, profile) -> str:
        """Generate body paragraph for cover letter using real data"""
        
        projects = profile.get_projects()
        experience = profile.get_experience()
        
        project_examples = f"{projects[0]['name']} ({projects[0]['description']})" if projects else "innovative software projects"
        experience_examples = f"{experience[0]['title']} at {experience[0]['company']}" if experience else "professional experience"
        
        return f"""Through projects like {project_examples}, I have demonstrated my ability to build scalable, user-focused applications. My experience as {experience_examples} has strengthened my technical and communication skills, while my international background brings a unique perspective to problem-solving and team collaboration."""
    
    def _generate_summary_for_job(self, job: Dict, profile: Dict) -> str:
        """Generate professional summary for job (legacy method)"""
        
        if 'ai' in job.get('title', '').lower() or 'ml' in job.get('description', '').lower():
            return f"Passionate computer science student with hands-on experience in AI/ML seeking {job.get('title')} position. Proven track record building innovative applications including AI-powered fitness platform and intelligent job automation system."
        else:
            return f"Motivated computer science student with strong foundation in full-stack development seeking {job.get('title')} position. Combining technical expertise with unique perspective from athletics and music to deliver innovative solutions."
    
    def _generate_body_paragraph(self, job: Dict, profile: Dict) -> str:
        """Generate body paragraph for cover letter (legacy method)"""
        
        return f"""Through projects like FeelSharper (an AI-powered fitness platform) and JobFlow (an intelligent job application system), I have demonstrated my ability to build scalable, user-focused applications. My experience as a Teaching Assistant has strengthened my communication skills, while my internship at Virtus BR Partners taught me to deliver business value through technology."""
    
    def get_usage_report(self) -> Dict:
        """Get API usage statistics"""
        
        estimated_cost = (
            (self.usage_stats.get('total_tokens', 0) / 1000) * 0.002 +  # Rough OpenAI estimate
            (self.usage_stats.get('claude_calls', 0) * 0.003)  # Rough Claude estimate
        )
        
        return {
            'openai_calls': self.usage_stats.get('openai_calls', 0),
            'claude_calls': self.usage_stats.get('claude_calls', 0),
            'total_tokens': self.usage_stats.get('total_tokens', 0),
            'estimated_cost': f"${estimated_cost:.2f}"
        }


# Test the AI content generator
async def test_ai_generation():
    """Test AI content generation with sample job"""
    
    print("=" * 60)
    print("TESTING AI CONTENT GENERATION")
    print("=" * 60)
    
    generator = AIContentGenerator()
    
    # Sample job for testing
    test_job = {
        'company': 'TechCorp AI',
        'title': 'Junior Machine Learning Engineer',
        'location': 'San Francisco, CA',
        'description': """We're looking for a Junior ML Engineer to join our team. 
        You'll work on computer vision projects using Python, TensorFlow, and PyTorch. 
        Experience with React and cloud platforms (AWS) is a plus. 
        We value creativity, teamwork, and continuous learning. 
        New graduates welcome! We sponsor visas.""",
        'url': 'https://example.com/job/123'
    }
    
    # Sample profile
    test_profile = {
        'name': 'Renato Dap',
        'email': 'renatodapapplications@gmail.com',
        'phone': '+1 (812) 262-8002',
        'github': 'github.com/renatodap',
        'linkedin': 'linkedin.com/in/renato-prado',
        'degree': 'Bachelor of Science in Computer Science',
        'university': 'Rose-Hulman Institute of Technology',
        'graduation': 'May 2026',
        'gpa': '3.65',
        'visa_status': 'F-1 Student Visa (3 years OPT available)',
        'base_resume': """Teaching Assistant - Object-Oriented Software Development
- Support 30+ students in Java and design patterns
- Developed automated grading scripts reducing time by 60%

Investment Banking Intern - Virtus BR Partners
- Built financial models for $50M+ renewable energy deals
- Automated pitch deck generation saving 15 hours weekly

Projects:
- FeelSharper: AI fitness platform with computer vision
- JobFlow: Intelligent job application system"""
    }
    
    print("\n1. Testing Job Analysis...")
    print("-" * 40)
    
    analysis = await generator.analyze_job_requirements(test_job)
    print(f"Analysis by: {analysis.get('analyzer', 'Unknown')}")
    print(f"Required skills: {analysis.get('required_skills', [])}")
    print(f"Experience level: {analysis.get('experience_level', 'Unknown')}")
    print(f"Company culture: {analysis.get('company_culture', 'Unknown')}")
    
    print("\n2. Testing AI Resume Generation...")
    print("-" * 40)
    
    resume = await generator.generate_tailored_resume(test_job, test_profile)
    print(f"Generator: {resume.get('generator', 'Unknown')}")
    print(f"Model: {resume.get('model', 'Unknown')}")
    print(f"ATS Optimized: {resume.get('ats_optimized', False)}")
    if resume.get('keywords_included'):
        print(f"Keywords: {', '.join(resume['keywords_included'][:5])}")
    print(f"\nResume Preview (first 500 chars):")
    print(resume['content'][:500] + "...")
    
    print("\n3. Testing AI Cover Letter Generation...")
    print("-" * 40)
    
    cover_letter = await generator.generate_personalized_cover_letter(test_job, test_profile)
    print(f"Generator: {cover_letter.get('generator', 'Unknown')}")
    print(f"Model: {cover_letter.get('model', 'Unknown')}")
    print(f"Personalization: {cover_letter.get('personalization_level', 'Unknown')}")
    print(f"\nCover Letter Preview (first 500 chars):")
    print(cover_letter['content'][:500] + "...")
    
    print("\n4. API Usage Report")
    print("-" * 40)
    
    usage = generator.get_usage_report()
    print(f"OpenAI calls: {usage['openai_calls']}")
    print(f"Claude calls: {usage['claude_calls']}")
    print(f"Total tokens: {usage['total_tokens']}")
    print(f"Estimated cost: {usage['estimated_cost']}")
    
    print("\n✅ AI content generation test complete!")
    
    return {
        'analysis': analysis,
        'resume': resume,
        'cover_letter': cover_letter,
        'usage': usage
    }


if __name__ == "__main__":
    # Run test
    asyncio.run(test_ai_generation())