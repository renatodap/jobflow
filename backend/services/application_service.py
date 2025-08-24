"""
Application Service for JobFlow
Handles job applications, cover letter generation, and tracking
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
from dataclasses import asdict
import asyncio

class ApplicationService:
    """Manages job applications and AI-generated content"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.claude_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    async def generate_application_kit(
        self, 
        user_id: str, 
        job_data: Dict,
        profile_context: str
    ) -> Dict:
        """
        Generate complete application kit: resume, cover letter, LinkedIn message
        Uses user profile context to ensure ZERO fake data
        """
        
        # Generate all materials in parallel
        tasks = [
            self._generate_resume(profile_context, job_data),
            self._generate_cover_letter(profile_context, job_data),
            self._generate_linkedin_message(profile_context, job_data)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        resume = results[0] if not isinstance(results[0], Exception) else "Error generating resume"
        cover_letter = results[1] if not isinstance(results[1], Exception) else "Error generating cover letter"
        linkedin_message = results[2] if not isinstance(results[2], Exception) else "Error generating LinkedIn message"
        
        # Store application kit
        kit_data = {
            'user_id': user_id,
            'job_url': job_data.get('url'),
            'job_title': job_data.get('title'),
            'company': job_data.get('company'),
            'resume_content': resume,
            'cover_letter_content': cover_letter,
            'linkedin_message_content': linkedin_message,
            'generated_at': datetime.now().isoformat(),
            'status': 'generated'
        }
        
        await self._store_application_kit(kit_data)
        
        return {
            'job': {
                'title': job_data.get('title'),
                'company': job_data.get('company'),
                'url': job_data.get('url')
            },
            'resume': resume,
            'cover_letter': cover_letter,
            'linkedin_message': linkedin_message,
            'generated_at': kit_data['generated_at']
        }
    
    async def _generate_resume(self, profile_context: str, job_data: Dict) -> str:
        """Generate tailored resume using ONLY real profile data"""
        
        prompt = f"""
{profile_context}

JOB REQUIREMENTS:
Title: {job_data.get('title', 'Software Engineer')}
Company: {job_data.get('company', 'Company Name')}
Description: {job_data.get('description', '')[:1000]}

TASK: Create a tailored resume using ONLY the real profile data above.

CRITICAL REQUIREMENTS:
1. Use ONLY real data from the USER PROFILE section
2. Do NOT invent any experience, skills, or achievements
3. If information is missing, omit that section rather than fabricating
4. Tailor existing real experience to highlight relevant aspects for this job
5. Format as clean, professional resume text

Generate the resume now:
"""
        
        return await self._call_ai_api(prompt, max_tokens=800)
    
    async def _generate_cover_letter(self, profile_context: str, job_data: Dict) -> str:
        """Generate personalized cover letter using ONLY real profile data"""
        
        prompt = f"""
{profile_context}

JOB DETAILS:
Title: {job_data.get('title', 'Software Engineer')}
Company: {job_data.get('company', 'Company Name')}
Description: {job_data.get('description', '')[:1000]}

TASK: Write a compelling cover letter using ONLY the real profile data above.

CRITICAL REQUIREMENTS:
1. Use ONLY real data from the USER PROFILE section
2. Do NOT invent any experiences, projects, or achievements
3. If specific information is missing, focus on what IS available
4. Use the UNIQUE ANGLES section for personalization
5. Keep it concise (3-4 paragraphs)
6. Format as professional business letter

Structure:
1. Opening: Why this specific role/company excites you
2. Body: How your REAL experience/skills align with their needs
3. Unique angle: What sets you apart (from profile data only)
4. Closing: Professional sign-off

Generate the cover letter now:
"""
        
        return await self._call_ai_api(prompt, max_tokens=600)
    
    async def _generate_linkedin_message(self, profile_context: str, job_data: Dict) -> str:
        """Generate LinkedIn connection message for hiring manager"""
        
        prompt = f"""
{profile_context}

JOB DETAILS:
Title: {job_data.get('title', 'Software Engineer')}
Company: {job_data.get('company', 'Company Name')}

TASK: Write a concise LinkedIn connection message to a hiring manager using ONLY real profile data.

CRITICAL REQUIREMENTS:
1. Use ONLY real data from the USER PROFILE section
2. Keep it under 200 characters (LinkedIn limit)
3. Be professional but personable
4. Mention genuine interest in the role
5. Do NOT invent any connections or experiences

Format: Brief introduction + genuine interest + request to connect

Generate the LinkedIn message now:
"""
        
        return await self._call_ai_api(prompt, max_tokens=150)
    
    async def _call_ai_api(self, prompt: str, max_tokens: int = 500) -> str:
        """Call AI API (OpenAI or Claude) for content generation"""
        
        try:
            if self.openai_api_key:
                return await self._call_openai(prompt, max_tokens)
            elif self.claude_api_key:
                return await self._call_claude(prompt, max_tokens)
            else:
                return "AI API key not configured"
        except Exception as e:
            return f"Error generating content: {str(e)}"
    
    async def _call_openai(self, prompt: str, max_tokens: int) -> str:
        """Call OpenAI GPT API"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a professional resume and cover letter writer. Use ONLY the real information provided. Do NOT invent or fabricate any details."
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    "max_tokens": max_tokens,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content'].strip()
            else:
                return f"OpenAI API error: {response.status_code}"
    
    async def _call_claude(self, prompt: str, max_tokens: int) -> str:
        """Call Anthropic Claude API"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.claude_api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-sonnet-20240229",
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                    "messages": [
                        {
                            "role": "user",
                            "content": f"You are a professional resume and cover letter writer. Use ONLY the real information provided. Do NOT invent or fabricate any details.\n\n{prompt}"
                        }
                    ]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['content'][0]['text'].strip()
            else:
                return f"Claude API error: {response.status_code}"
    
    async def track_application(self, application_data: Dict) -> Dict:
        """Track job application submission"""
        
        application_record = {
            'user_id': application_data['user_id'],
            'job_url': application_data['job_url'],
            'job_title': application_data.get('job_title'),
            'company': application_data.get('company'),
            'applied_date': datetime.now().isoformat(),
            'application_method': application_data.get('application_method', 'company_website'),
            'status': 'applied',
            'notes': application_data.get('notes', ''),
            'materials_used': application_data.get('materials_used', []),
            'follow_up_date': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.supabase_url}/rest/v1/applications",
                json=application_record,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                return {
                    'success': True,
                    'application_id': response.json()[0]['id'] if response.json() else None,
                    'follow_up_date': application_record['follow_up_date']
                }
            else:
                return {
                    'success': False,
                    'error': f"Database error: {response.status_code}"
                }
    
    async def get_application_pipeline(self, user_id: str) -> Dict:
        """Get application pipeline for Kanban view"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/applications",
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "applied_date.desc"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                applications = response.json()
                
                # Group by status
                pipeline = {
                    'applied': [],
                    'screening': [],
                    'interview': [],
                    'offer': [],
                    'rejected': []
                }
                
                for app in applications:
                    status = app.get('status', 'applied')
                    if status in pipeline:
                        pipeline[status].append(app)
                
                return pipeline
        
        return {
            'applied': [],
            'screening': [],
            'interview': [],
            'offer': [],
            'rejected': []
        }
    
    async def update_application_status(
        self, 
        application_id: str, 
        new_status: str,
        notes: Optional[str] = None
    ) -> bool:
        """Update application status"""
        
        update_data = {
            'status': new_status,
            'updated_at': datetime.now().isoformat()
        }
        
        if notes:
            update_data['notes'] = notes
        
        # Add status-specific updates
        if new_status == 'interview':
            update_data['interview_date'] = (datetime.now() + timedelta(days=5)).isoformat()
        elif new_status == 'rejected':
            update_data['rejected_date'] = datetime.now().isoformat()
        elif new_status == 'offer':
            update_data['offer_date'] = datetime.now().isoformat()
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/applications",
                params={"id": f"eq.{application_id}"},
                json=update_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code in [200, 204]
    
    async def get_application_analytics(self, user_id: str) -> Dict:
        """Get application analytics and insights"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/applications",
                params={"user_id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                applications = response.json()
                
                total_applications = len(applications)
                
                if total_applications == 0:
                    return {
                        'total_applications': 0,
                        'response_rate': 0,
                        'interview_rate': 0,
                        'avg_response_time': 0,
                        'status_breakdown': {}
                    }
                
                # Calculate metrics
                status_counts = {}
                responses = 0
                interviews = 0
                response_times = []
                
                for app in applications:
                    status = app.get('status', 'applied')
                    status_counts[status] = status_counts.get(status, 0) + 1
                    
                    if status != 'applied':
                        responses += 1
                    
                    if status in ['interview', 'offer']:
                        interviews += 1
                    
                    # Calculate response time if applicable
                    if status != 'applied' and app.get('applied_date') and app.get('updated_at'):
                        try:
                            applied = datetime.fromisoformat(app['applied_date'].replace('Z', '+00:00'))
                            updated = datetime.fromisoformat(app['updated_at'].replace('Z', '+00:00'))
                            response_time = (updated - applied).days
                            response_times.append(response_time)
                        except:
                            pass
                
                response_rate = (responses / total_applications) * 100
                interview_rate = (interviews / total_applications) * 100
                avg_response_time = sum(response_times) / len(response_times) if response_times else 0
                
                return {
                    'total_applications': total_applications,
                    'response_rate': round(response_rate, 1),
                    'interview_rate': round(interview_rate, 1),
                    'avg_response_time': round(avg_response_time, 1),
                    'status_breakdown': status_counts
                }
        
        return {
            'total_applications': 0,
            'response_rate': 0,
            'interview_rate': 0,
            'avg_response_time': 0,
            'status_breakdown': {}
        }
    
    async def _store_application_kit(self, kit_data: Dict):
        """Store application kit in database"""
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/application_kits",
                json=kit_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )