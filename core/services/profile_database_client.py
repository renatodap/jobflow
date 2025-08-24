"""
Database Profile Client for JobFlow
Fetches user profiles from Supabase database instead of profile.json
"""

import os
import json
from typing import Dict, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class ProfileDatabaseClient:
    """Client for fetching user profiles from Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    def get_profile_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch complete user profile from database
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Complete profile dictionary or None if not found
        """
        try:
            # Call the database function that returns complete profile
            response = self.client.rpc('get_user_profile', {'user_uuid': user_id}).execute()
            
            if response.data:
                return self._format_profile_for_jobflow(response.data)
            return None
            
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None
    
    def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user profile by email address
        
        Args:
            email: User's email address
            
        Returns:
            Complete profile dictionary or None if not found
        """
        try:
            # First get user ID from profiles table
            profile_response = self.client.table('profiles').select('user_id').eq('email', email).single().execute()
            
            if profile_response.data:
                user_id = profile_response.data['user_id']
                return self.get_profile_by_user_id(user_id)
            return None
            
        except Exception as e:
            print(f"Error fetching profile by email: {e}")
            return None
    
    def _format_profile_for_jobflow(self, db_profile: Dict) -> Dict[str, Any]:
        """
        Format database profile to match expected JobFlow structure
        
        Args:
            db_profile: Raw profile from database
            
        Returns:
            Formatted profile matching profile.json structure
        """
        profile = db_profile.get('profile', {})
        preferences = db_profile.get('preferences', {})
        education = db_profile.get('education', [])
        experience = db_profile.get('experience', [])
        skills = db_profile.get('skills', [])
        projects = db_profile.get('projects', [])
        certifications = db_profile.get('certifications', [])
        
        # Group skills by category
        skills_by_category = {
            'languages': [],
            'frameworks': [],
            'databases': [],
            'tools': [],
            'cloud': [],
            'soft_skills': []
        }
        
        for skill in skills:
            category = skill.get('category', '').lower().replace(' ', '_')
            if category == 'programming_languages':
                skills_by_category['languages'].append(skill['name'])
            elif category in skills_by_category:
                skills_by_category[category].append(skill['name'])
        
        # Format experience entries
        formatted_experience = []
        for exp in experience:
            formatted_experience.append({
                'company': exp.get('company', ''),
                'role': exp.get('job_title', ''),
                'duration': f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present') if not exp.get('is_current') else 'Present'}",
                'description': exp.get('description', ''),
                'achievements': exp.get('achievements', [])
            })
        
        # Format education entries
        formatted_education = []
        for edu in education:
            formatted_education.append({
                'degree': edu.get('degree', ''),
                'university': edu.get('institution', ''),
                'graduation': edu.get('graduation_date', ''),
                'gpa': str(edu.get('gpa', '')) if edu.get('gpa') else None,
                'relevant_coursework': edu.get('relevant_coursework', [])
            })
        
        # Format projects
        formatted_projects = []
        for project in projects:
            formatted_projects.append({
                'name': project.get('name', ''),
                'description': project.get('description', ''),
                'technologies': project.get('technologies', []),
                'link': project.get('project_url', '') or project.get('github_url', '')
            })
        
        # Build the formatted profile
        formatted_profile = {
            'personal': {
                'name': profile.get('full_name', ''),
                'email': profile.get('email', ''),
                'phone': profile.get('phone', ''),
                'location': profile.get('location', ''),
                'github': profile.get('github_url', ''),
                'linkedin': profile.get('linkedin_url', ''),
                'portfolio': profile.get('portfolio_url', '')
            },
            'preferences': {
                'desired_role': ', '.join(preferences.get('desired_roles', [])),
                'experience_level': preferences.get('experience_level', 'Entry Level'),
                'min_salary': preferences.get('min_salary', 0),
                'max_salary': preferences.get('max_salary', 0),
                'locations': preferences.get('preferred_locations', []),
                'job_types': preferences.get('job_types', ['Full-time']),
                'company_sizes': preferences.get('company_sizes', []),
                'remote_preference': preferences.get('remote_preference', 'No Preference'),
                'requires_sponsorship': preferences.get('requires_sponsorship', False)
            },
            'education': formatted_education[0] if formatted_education else {
                'degree': '',
                'university': '',
                'graduation': '',
                'gpa': None
            },
            'education_list': formatted_education,  # All education entries
            'experience': formatted_experience,
            'skills': skills_by_category,
            'projects': formatted_projects,
            'certifications': [
                {
                    'name': cert.get('name', ''),
                    'issuer': cert.get('issuing_organization', ''),
                    'date': cert.get('issue_date', ''),
                    'credential_id': cert.get('credential_id', '')
                }
                for cert in certifications
            ]
        }
        
        return formatted_profile
    
    def save_generated_material(self, user_id: str, material_type: str, content: str, 
                              job_info: Dict = None, metadata: Dict = None) -> bool:
        """
        Save generated resume or cover letter to database
        
        Args:
            user_id: UUID of the user
            material_type: 'resume', 'cover_letter', 'linkedin_message', etc.
            content: The generated content
            job_info: Optional job information (company, title, etc.)
            metadata: Optional metadata (AI model used, cost, etc.)
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            data = {
                'user_id': user_id,
                'material_type': material_type,
                'content': content,
                'company_name': job_info.get('company', '') if job_info else None,
                'job_title': job_info.get('title', '') if job_info else None,
                'job_id': job_info.get('id', '') if job_info else None,
                'version': metadata.get('version', '') if metadata else None,
                'ai_model_used': metadata.get('ai_model', 'gpt-4') if metadata else 'gpt-4',
                'generation_cost': metadata.get('cost', 0.0) if metadata else None,
                'quality_score': metadata.get('score', None) if metadata else None
            }
            
            response = self.client.table('generated_materials').insert(data).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error saving generated material: {e}")
            return False
    
    def get_recent_materials(self, user_id: str, material_type: str = None, limit: int = 10) -> list:
        """
        Fetch recent generated materials for a user
        
        Args:
            user_id: UUID of the user
            material_type: Optional filter by type
            limit: Maximum number of results
            
        Returns:
            List of generated materials
        """
        try:
            query = self.client.table('generated_materials').select('*').eq('user_id', user_id)
            
            if material_type:
                query = query.eq('material_type', material_type)
            
            response = query.order('created_at', desc=True).limit(limit).execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error fetching materials: {e}")
            return []


# Fallback to local profile.json if database not available
class ProfileManager:
    """Manager that handles both database and local profiles"""
    
    def __init__(self, prefer_database: bool = True):
        """
        Initialize profile manager
        
        Args:
            prefer_database: If True, try database first, then fallback to local
        """
        self.prefer_database = prefer_database
        self.db_client = None
        
        if prefer_database:
            try:
                self.db_client = ProfileDatabaseClient()
            except Exception as e:
                print(f"Database client initialization failed, using local profile: {e}")
    
    def get_profile(self, user_id: str = None, email: str = None) -> Dict[str, Any]:
        """
        Get user profile from database or local file
        
        Args:
            user_id: Optional user UUID
            email: Optional user email
            
        Returns:
            User profile dictionary
        """
        # Try database first if available
        if self.db_client:
            if user_id:
                profile = self.db_client.get_profile_by_user_id(user_id)
                if profile:
                    return profile
            elif email:
                profile = self.db_client.get_profile_by_email(email)
                if profile:
                    return profile
        
        # Fallback to local profile.json
        return self._load_local_profile()
    
    def _load_local_profile(self) -> Dict[str, Any]:
        """Load profile from local profile.json file"""
        profile_path = 'profile.json'
        
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                return json.load(f)
        else:
            # Return default profile structure
            return {
                'personal': {
                    'name': 'User Name',
                    'email': 'user@example.com',
                    'phone': '',
                    'location': '',
                    'github': '',
                    'linkedin': '',
                    'portfolio': ''
                },
                'preferences': {
                    'desired_role': 'Software Engineer',
                    'experience_level': 'Entry Level',
                    'min_salary': 60000,
                    'max_salary': 120000,
                    'locations': ['Remote'],
                    'job_types': ['Full-time'],
                    'company_sizes': [],
                    'remote_preference': 'No Preference'
                },
                'education': {
                    'degree': '',
                    'university': '',
                    'graduation': '',
                    'gpa': None
                },
                'experience': [],
                'skills': {
                    'languages': [],
                    'frameworks': [],
                    'databases': [],
                    'tools': [],
                    'cloud': []
                },
                'projects': []
            }


# Example usage
if __name__ == "__main__":
    # Test database connection
    manager = ProfileManager(prefer_database=True)
    
    # Try to get profile (will fallback to local if database not available)
    profile = manager.get_profile(email="test@example.com")
    
    print("Profile loaded:")
    print(f"Name: {profile['personal']['name']}")
    print(f"Email: {profile['personal']['email']}")
    print(f"Desired Role: {profile['preferences']['desired_role']}")
    
    # If database is available, save a test material
    if manager.db_client:
        success = manager.db_client.save_generated_material(
            user_id="test-user-id",
            material_type="resume",
            content="Test resume content...",
            job_info={'company': 'Tech Corp', 'title': 'Software Engineer'},
            metadata={'ai_model': 'gpt-4', 'cost': 0.05}
        )
        print(f"Material saved: {success}")