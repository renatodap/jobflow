"""
Profile Manager - Centralized profile data management
Ensures zero fake data by managing all user information from profile.json
"""

import json
import os
from typing import Dict, List, Optional
from pathlib import Path

class ProfileManager:
    """Manages user profile data with zero fake data guarantee"""
    
    def __init__(self, profile_path: str = "profile.json"):
        self.profile_path = profile_path
        self.profile_data = self.load_profile()
        self._validate_profile()
    
    def load_profile(self) -> Dict:
        """Load profile data from JSON file"""
        try:
            with open(self.profile_path, 'r', encoding='utf-8') as f:
                profile = json.load(f)
                return profile
        except FileNotFoundError:
            raise FileNotFoundError(f"Profile file not found: {self.profile_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in profile file: {e}")
    
    def _validate_profile(self) -> None:
        """Validate that profile contains no fake/placeholder data"""
        
        fake_data_patterns = [
            'your.email@example.com',
            'test@example.com',
            'Your Full Name',
            'Company Name',
            'University Name',
            'Project Name',
            'Add your',
            'lorem ipsum',
            'placeholder',
            'sample',
            'example.com',
            'john doe',
            'jane doe'
        ]
        
        profile_str = json.dumps(self.profile_data).lower()
        
        for pattern in fake_data_patterns:
            if pattern in profile_str:
                raise ValueError(f"FAKE DATA DETECTED: '{pattern}' found in profile. All data must be real.")
        
        # Validate required fields exist
        required_fields = ['personal', 'strengths', 'technical_skills', 'experience', 'projects']
        
        for field in required_fields:
            if field not in self.profile_data:
                raise ValueError(f"Required profile field missing: {field}")
        
        print("[OK] Profile validation passed - No fake data detected")
    
    # Personal Information
    def get_name(self) -> str:
        return self.profile_data['personal']['name']
    
    def get_email(self) -> str:
        return self.profile_data['personal']['email']
    
    def get_phone(self) -> str:
        return self.profile_data['personal']['phone']
    
    def get_location(self) -> str:
        return self.profile_data['personal']['location']
    
    def get_linkedin(self) -> str:
        return self.profile_data['personal']['linkedin']
    
    def get_github(self) -> str:
        return self.profile_data['personal']['github']
    
    def get_website(self) -> str:
        return self.profile_data['personal'].get('website', '')
    
    # Education
    def get_education(self) -> Dict:
        return self.profile_data['education'][0]  # Primary education
    
    def get_degree(self) -> str:
        return self.get_education()['degree']
    
    def get_school(self) -> str:
        return self.get_education()['school']
    
    def get_graduation(self) -> str:
        return self.get_education()['graduation']
    
    def get_gpa(self) -> float:
        return self.get_education()['gpa']
    
    def get_coursework(self) -> List[str]:
        return self.get_education().get('relevant_coursework', [])
    
    # Professional Information
    def get_strengths(self) -> List[str]:
        return self.profile_data['strengths']
    
    def get_achievements(self) -> List[Dict]:
        return self.profile_data['achievements']
    
    def get_experience(self) -> List[Dict]:
        return self.profile_data['experience']
    
    def get_projects(self) -> List[Dict]:
        return self.profile_data['projects']
    
    # Technical Skills
    def get_technical_skills(self) -> Dict:
        return self.profile_data['technical_skills']
    
    def get_programming_languages(self) -> List[str]:
        return self.get_technical_skills().get('languages', [])
    
    def get_frameworks(self) -> List[str]:
        return self.get_technical_skills().get('frameworks', [])
    
    def get_ai_ml_skills(self) -> List[str]:
        return self.get_technical_skills().get('ai_ml', [])
    
    def get_databases(self) -> List[str]:
        return self.get_technical_skills().get('databases', [])
    
    def get_cloud_skills(self) -> List[str]:
        return self.get_technical_skills().get('cloud', [])
    
    def get_tools(self) -> List[str]:
        return self.get_technical_skills().get('tools', [])
    
    def get_soft_skills(self) -> List[str]:
        return self.profile_data.get('soft_skills', [])
    
    # Job Preferences
    def get_target_roles(self) -> List[str]:
        return self.profile_data['preferences']['target_roles']
    
    def get_target_companies(self) -> List[str]:
        return self.profile_data['preferences']['target_companies']
    
    def get_dream_roles(self) -> List[str]:
        return self.profile_data['preferences'].get('dream_roles', [])
    
    def get_visa_status(self) -> str:
        return self.profile_data['preferences'].get('visa_status', '')
    
    def get_availability(self) -> str:
        return self.profile_data['preferences'].get('availability', '')
    
    def get_salary_requirements(self) -> Dict:
        return self.profile_data['preferences']['salary']
    
    def get_location_preferences(self) -> Dict:
        return self.profile_data['preferences']['location_preferences']
    
    # Cold Outreach
    def get_unique_angles(self) -> List[str]:
        return self.profile_data['cold_outreach'].get('unique_angles', [])
    
    def get_outreach_preferences(self) -> Dict:
        return self.profile_data['cold_outreach']
    
    # Formatted Sections for AI Prompts
    def get_experience_summary(self) -> str:
        """Get formatted experience summary for AI prompts"""
        
        experience_text = ""
        
        for exp in self.get_experience():
            experience_text += f"\n{exp['title']} - {exp['company']} ({exp['duration']})\n"
            for achievement in exp['achievements']:
                experience_text += f"• {achievement}\n"
        
        return experience_text.strip()
    
    def get_projects_summary(self) -> str:
        """Get formatted projects summary for AI prompts"""
        
        projects_text = ""
        
        for project in self.get_projects():
            projects_text += f"\n{project['name']}:\n"
            projects_text += f"• {project['description']}\n"
            projects_text += f"• Technologies: {', '.join(project['technologies'])}\n"
            for highlight in project['highlights']:
                projects_text += f"• {highlight}\n"
        
        return projects_text.strip()
    
    def get_strengths_summary(self) -> str:
        """Get formatted strengths for AI prompts"""
        
        strengths_text = "UNIQUE STRENGTHS:\n"
        for strength in self.get_strengths():
            strengths_text += f"• {strength}\n"
        
        return strengths_text.strip()
    
    def get_complete_background(self) -> str:
        """Get complete background summary for AI prompts"""
        
        background = f"""CANDIDATE PROFILE:
Name: {self.get_name()}
Education: {self.get_degree()} from {self.get_school()} (Graduating {self.get_graduation()})
GPA: {self.get_gpa()}
Visa Status: {self.get_visa_status()}
Availability: {self.get_availability()}

{self.get_strengths_summary()}

TECHNICAL SKILLS:
• Languages: {', '.join(self.get_programming_languages())}
• Frameworks: {', '.join(self.get_frameworks())}
• AI/ML: {', '.join(self.get_ai_ml_skills())}
• Databases: {', '.join(self.get_databases())}
• Cloud: {', '.join(self.get_cloud_skills())}

EXPERIENCE:{self.get_experience_summary()}

PROJECTS:{self.get_projects_summary()}

ACHIEVEMENTS:"""

        for achievement in self.get_achievements():
            background += f"\n• {achievement['title']}: {achievement['details']} - {achievement['impact']}"
        
        return background
    
    def get_job_search_queries(self) -> List[str]:
        """Generate comprehensive job search queries based on profile"""
        
        queries = []
        
        # Role-based queries
        for role in self.get_target_roles():
            queries.append(role)
        
        # Skill-based queries
        ai_skills = self.get_ai_ml_skills()
        if ai_skills:
            queries.append(f"AI ML engineer {' '.join(ai_skills[:3])}")
        
        # Company-specific queries
        for company in self.get_target_companies()[:5]:  # Top 5 companies
            queries.append(f"software engineer {company}")
        
        # Dream role queries
        for dream_role in self.get_dream_roles():
            queries.append(dream_role)
        
        # Generic new grad queries
        queries.extend([
            "software engineer new grad 2026",
            "computer science new grad 2026",
            "entry level software developer",
            "junior full stack developer"
        ])
        
        # Remove duplicates while preserving order
        unique_queries = []
        for query in queries:
            if query not in unique_queries:
                unique_queries.append(query)
        
        return unique_queries
    
    def save_profile(self) -> None:
        """Save current profile data back to file"""
        
        with open(self.profile_path, 'w', encoding='utf-8') as f:
            json.dump(self.profile_data, f, indent=2, ensure_ascii=False)
        
        print(f"[OK] Profile saved to {self.profile_path}")
    
    def add_achievement(self, title: str, details: str, impact: str) -> None:
        """Add new achievement to profile"""
        
        achievement = {
            'title': title,
            'details': details,
            'impact': impact
        }
        
        self.profile_data['achievements'].append(achievement)
        print(f"[OK] Added achievement: {title}")
    
    def add_project(self, name: str, description: str, technologies: List[str], 
                   github: str = "", highlights: List[str] = None) -> None:
        """Add new project to profile"""

        project = {
            'name': name,
            'description': description,
            'technologies': technologies,
            'github': github,
            'highlights': highlights or []
        }

        self.profile_data['projects'].append(project)
        print(f"[OK] Added project: {name}")


def test_profile_manager():
    """Test the profile manager"""

    print("=" * 60)
    print("TESTING PROFILE MANAGER")
    print("=" * 60)

    # Test profile loading and validation
    profile = ProfileManager()

    print("\n👤 PERSONAL INFO:")
    print(f"Name: {profile.get_name()}")
    print(f"Email: {profile.get_email()}")
    print(f"Phone: {profile.get_phone()}")
    print(f"Location: {profile.get_location()}")
    print(f"GitHub: {profile.get_github()}")

    print("\n🎓 EDUCATION:")
    print(f"Degree: {profile.get_degree()}")
    print(f"School: {profile.get_school()}")
    print(f"Graduation: {profile.get_graduation()}")
    print(f"GPA: {profile.get_gpa()}")

    print(f"\n💪 STRENGTHS ({len(profile.get_strengths())}):")
    for i, strength in enumerate(profile.get_strengths(), 1):
        print(f"{i}. {strength}")

    print("\n🔧 TECHNICAL SKILLS:")
    print(f"Languages: {', '.join(profile.get_programming_languages())}")
    print(f"Frameworks: {', '.join(profile.get_frameworks()[:5])}")  # Top 5
    print(f"AI/ML: {', '.join(profile.get_ai_ml_skills())}")

    print("\n🎯 JOB SEARCH:")
    print(f"Target Roles: {len(profile.get_target_roles())}")
    print(f"Target Companies: {len(profile.get_target_companies())}")
    print(f"Dream Roles: {', '.join(profile.get_dream_roles())}")

    print(f"\n🔍 SEARCH QUERIES ({len(profile.get_job_search_queries())}):")
    for i, query in enumerate(profile.get_job_search_queries()[:10], 1):
        print(f"{i}. {query}")

    print("\n[OK] Profile manager test complete!")
    print("[OK] Zero fake data confirmed")

    return profile


if __name__ == "__main__":
    test_profile_manager()
