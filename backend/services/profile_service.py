"""
Profile Service for JobFlow
Manages user profiles, strengths, skills, and personalization data
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

load_dotenv()

class ProfileService:
    """Manages user profile data and personalization"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    async def get_profile_data(self) -> Dict:
        """
        Get complete profile data for AI content generation
        Returns user's strengths, skills, experience, etc.
        """
        
        # Get basic profile
        basic_profile = await self._get_basic_profile()
        
        # Get detailed profile data
        profile_data = await self._get_profile_data()
        
        # Combine and format for AI use
        return {
            'basic_info': basic_profile,
            'strengths': profile_data.get('strengths', []),
            'achievements': profile_data.get('achievements', []),
            'technical_skills': profile_data.get('technical_skills', {}),
            'education': profile_data.get('education', []),
            'experience': profile_data.get('experience', []),
            'projects': profile_data.get('projects', []),
            'unique_angles': profile_data.get('unique_angles', []),
            'job_preferences': profile_data.get('job_preferences', {}),
            'last_updated': profile_data.get('updated_at')
        }
    
    async def get_ai_context_string(self) -> str:
        """
        Generate context string for AI prompts - ZERO fake data
        This replaces hardcoded prompts with dynamic user data
        """
        
        profile = await self.get_profile_data()
        basic = profile['basic_info']
        
        context = f"""
USER PROFILE - REAL DATA ONLY:

BASIC INFO:
- Name: {basic.get('full_name', 'Not provided')}
- Email: {basic.get('email', 'Not provided')}
- Phone: {basic.get('phone', 'Not provided')}
- Location: {basic.get('location', 'Not provided')}

UNIQUE STRENGTHS:
{self._format_list(profile.get('strengths', []))}

KEY ACHIEVEMENTS:
{self._format_list(profile.get('achievements', []))}

TECHNICAL SKILLS:
{self._format_skills(profile.get('technical_skills', {}))}

EXPERIENCE:
{self._format_experience(profile.get('experience', []))}

EDUCATION:
{self._format_education(profile.get('education', []))}

PROJECTS:
{self._format_projects(profile.get('projects', []))}

UNIQUE ANGLES:
{self._format_list(profile.get('unique_angles', []))}

JOB PREFERENCES:
{self._format_preferences(profile.get('job_preferences', {}))}

CRITICAL: Use ONLY the above real data. Do NOT generate fake experience, skills, or achievements.
If information is missing, state "Not specified" rather than inventing data.
"""
        
        return context.strip()
    
    async def update_strengths(self, strengths: List[str]) -> bool:
        """Update user's unique strengths"""
        
        return await self._update_profile_field('strengths', strengths)
    
    async def update_achievements(self, achievements: List[str]) -> bool:
        """Update user's achievements"""
        
        return await self._update_profile_field('achievements', achievements)
    
    async def update_technical_skills(self, skills: Dict) -> bool:
        """Update technical skills with proficiency levels"""
        
        return await self._update_profile_field('technical_skills', skills)
    
    async def update_experience(self, experience: List[Dict]) -> bool:
        """Update work experience"""
        
        # Validate experience format
        for exp in experience:
            required_fields = ['company', 'title', 'start_date']
            for field in required_fields:
                if field not in exp:
                    raise ValueError(f"Missing required field: {field}")
        
        return await self._update_profile_field('experience', experience)
    
    async def update_education(self, education: List[Dict]) -> bool:
        """Update education information"""
        
        return await self._update_profile_field('education', education)
    
    async def update_projects(self, projects: List[Dict]) -> bool:
        """Update project information"""
        
        return await self._update_profile_field('projects', projects)
    
    async def update_unique_angles(self, angles: List[str]) -> bool:
        """Update unique angles for cover letters"""
        
        return await self._update_profile_field('unique_angles', angles)
    
    async def update_job_preferences(self, preferences: Dict) -> bool:
        """Update job search preferences"""
        
        return await self._update_profile_field('job_preferences', preferences)
    
    async def validate_profile_completeness(self) -> Dict:
        """
        Check profile completeness and suggest improvements
        """
        
        profile = await self.get_profile_data()
        
        completeness = {
            'basic_info': bool(profile['basic_info'].get('full_name')),
            'strengths': len(profile.get('strengths', [])) > 0,
            'achievements': len(profile.get('achievements', [])) > 0,
            'technical_skills': len(profile.get('technical_skills', {})) > 0,
            'experience': len(profile.get('experience', [])) > 0,
            'education': len(profile.get('education', [])) > 0,
            'projects': len(profile.get('projects', [])) > 0,
            'unique_angles': len(profile.get('unique_angles', [])) > 0
        }
        
        completion_score = sum(completeness.values()) / len(completeness) * 100
        
        missing_sections = [k for k, v in completeness.items() if not v]
        
        return {
            'completion_score': round(completion_score),
            'missing_sections': missing_sections,
            'recommendations': self._get_profile_recommendations(missing_sections)
        }
    
    # Private helper methods
    async def _get_basic_profile(self) -> Dict:
        """Get basic profile information"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{self.user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else {}
            
            return {}
    
    async def _get_profile_data(self) -> Dict:
        """Get detailed profile data"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profile_data",
                params={"user_id": f"eq.{self.user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else {}
            
            return {}
    
    async def _update_profile_field(self, field_name: str, value) -> bool:
        """Update a specific profile field"""
        
        update_data = {
            field_name: value,
            'updated_at': datetime.now().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/profile_data",
                params={"user_id": f"eq.{self.user_id}"},
                json=update_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code in [200, 204]
    
    def _format_list(self, items: List[str]) -> str:
        """Format list for AI context"""
        
        if not items:
            return "- Not specified"
        
        return "\n".join([f"- {item}" for item in items])
    
    def _format_skills(self, skills: Dict) -> str:
        """Format skills dictionary for AI context"""
        
        if not skills:
            return "- Not specified"
        
        formatted = []
        for category, skill_list in skills.items():
            if isinstance(skill_list, list):
                formatted.append(f"- {category}: {', '.join(skill_list)}")
            else:
                formatted.append(f"- {category}: {skill_list}")
        
        return "\n".join(formatted)
    
    def _format_experience(self, experience: List[Dict]) -> str:
        """Format experience for AI context"""
        
        if not experience:
            return "- Not specified"
        
        formatted = []
        for exp in experience:
            company = exp.get('company', 'Company name not provided')
            title = exp.get('title', 'Title not provided')
            start_date = exp.get('start_date', 'Start date not provided')
            end_date = exp.get('end_date', 'Present')
            description = exp.get('description', 'Description not provided')
            
            formatted.append(f"""- {title} at {company} ({start_date} - {end_date})
  {description}""")
        
        return "\n".join(formatted)
    
    def _format_education(self, education: List[Dict]) -> str:
        """Format education for AI context"""
        
        if not education:
            return "- Not specified"
        
        formatted = []
        for edu in education:
            school = edu.get('school', 'School not provided')
            degree = edu.get('degree', 'Degree not provided')
            field = edu.get('field_of_study', 'Field not provided')
            year = edu.get('graduation_year', 'Year not provided')
            
            formatted.append(f"- {degree} in {field} from {school} ({year})")
        
        return "\n".join(formatted)
    
    def _format_projects(self, projects: List[Dict]) -> str:
        """Format projects for AI context"""
        
        if not projects:
            return "- Not specified"
        
        formatted = []
        for project in projects:
            name = project.get('name', 'Project name not provided')
            description = project.get('description', 'Description not provided')
            technologies = project.get('technologies', [])
            
            tech_str = f" (Technologies: {', '.join(technologies)})" if technologies else ""
            formatted.append(f"- {name}: {description}{tech_str}")
        
        return "\n".join(formatted)
    
    def _format_preferences(self, preferences: Dict) -> str:
        """Format job preferences for AI context"""
        
        if not preferences:
            return "- Not specified"
        
        formatted = []
        for key, value in preferences.items():
            if isinstance(value, list):
                formatted.append(f"- {key}: {', '.join(value)}")
            else:
                formatted.append(f"- {key}: {value}")
        
        return "\n".join(formatted)
    
    def _get_profile_recommendations(self, missing_sections: List[str]) -> List[str]:
        """Get recommendations for profile completion"""
        
        recommendations = []
        
        if 'strengths' in missing_sections:
            recommendations.append("Add 3-5 unique strengths that set you apart from other candidates")
        
        if 'achievements' in missing_sections:
            recommendations.append("List your key accomplishments with specific metrics when possible")
        
        if 'technical_skills' in missing_sections:
            recommendations.append("Categorize your technical skills by type (languages, frameworks, tools)")
        
        if 'experience' in missing_sections:
            recommendations.append("Add your work experience with detailed descriptions")
        
        if 'education' in missing_sections:
            recommendations.append("Include your educational background")
        
        if 'projects' in missing_sections:
            recommendations.append("Showcase your best projects with technologies used")
        
        if 'unique_angles' in missing_sections:
            recommendations.append("Add unique angles for personalized cover letters")
        
        return recommendations