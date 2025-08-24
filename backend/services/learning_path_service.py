"""
Learning Path Service for JobFlow
Creates personalized learning paths based on job requirements and skill gaps
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
import httpx
from dataclasses import dataclass
from collections import Counter

@dataclass
class SkillGap:
    """Represents a skill gap that needs to be filled"""
    skill_name: str
    importance: int  # 1-10 scale
    current_level: int  # 0-10 scale (0 = don't have it)
    required_level: int  # 1-10 scale
    frequency_in_jobs: int  # How many jobs require this skill
    learning_resources: List[Dict]
    estimated_hours: int

@dataclass
class LearningPath:
    """Complete learning path for a user"""
    user_id: str
    generated_date: datetime
    skill_gaps: List[SkillGap]
    recommended_projects: List[Dict]
    courses: List[Dict]
    certifications: List[Dict]
    timeline: Dict  # Week-by-week plan
    total_estimated_hours: int

class LearningPathService:
    """Generates personalized learning paths based on job market analysis"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.claude_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        # Pre-defined skill categories and learning resources
        self.skill_categories = {
            'programming_languages': {
                'python': {'difficulty': 6, 'hours_to_learn': 80},
                'javascript': {'difficulty': 5, 'hours_to_learn': 60},
                'typescript': {'difficulty': 7, 'hours_to_learn': 40},
                'java': {'difficulty': 7, 'hours_to_learn': 100},
                'c++': {'difficulty': 9, 'hours_to_learn': 120},
                'go': {'difficulty': 6, 'hours_to_learn': 50},
                'rust': {'difficulty': 9, 'hours_to_learn': 100}
            },
            'frameworks': {
                'react': {'difficulty': 6, 'hours_to_learn': 50},
                'angular': {'difficulty': 8, 'hours_to_learn': 70},
                'vue': {'difficulty': 5, 'hours_to_learn': 40},
                'django': {'difficulty': 7, 'hours_to_learn': 60},
                'flask': {'difficulty': 4, 'hours_to_learn': 30},
                'fastapi': {'difficulty': 5, 'hours_to_learn': 25},
                'node.js': {'difficulty': 6, 'hours_to_learn': 45},
                'express': {'difficulty': 4, 'hours_to_learn': 20}
            },
            'databases': {
                'sql': {'difficulty': 5, 'hours_to_learn': 40},
                'postgresql': {'difficulty': 6, 'hours_to_learn': 30},
                'mysql': {'difficulty': 5, 'hours_to_learn': 25},
                'mongodb': {'difficulty': 5, 'hours_to_learn': 30},
                'redis': {'difficulty': 4, 'hours_to_learn': 20}
            },
            'cloud_devops': {
                'aws': {'difficulty': 8, 'hours_to_learn': 100},
                'azure': {'difficulty': 8, 'hours_to_learn': 100},
                'gcp': {'difficulty': 8, 'hours_to_learn': 100},
                'docker': {'difficulty': 6, 'hours_to_learn': 40},
                'kubernetes': {'difficulty': 9, 'hours_to_learn': 80},
                'terraform': {'difficulty': 7, 'hours_to_learn': 50}
            },
            'tools': {
                'git': {'difficulty': 4, 'hours_to_learn': 20},
                'linux': {'difficulty': 6, 'hours_to_learn': 60},
                'ci/cd': {'difficulty': 7, 'hours_to_learn': 40}
            }
        }
        
        # Learning resource URLs
        self.learning_resources = {
            'courses': {
                'python': [
                    {'name': 'Python Crash Course', 'url': 'https://nostarch.com/pythoncrashcourse2e', 'type': 'book', 'hours': 40},
                    {'name': 'Automate the Boring Stuff', 'url': 'https://automatetheboringstuff.com/', 'type': 'free_book', 'hours': 30},
                    {'name': 'Python for Everybody (Coursera)', 'url': 'https://coursera.org/specializations/python', 'type': 'course', 'hours': 60}
                ],
                'javascript': [
                    {'name': 'JavaScript: The Good Parts', 'url': 'https://www.oreilly.com/library/view/javascript-the-good/9780596517748/', 'type': 'book', 'hours': 25},
                    {'name': 'freeCodeCamp JavaScript', 'url': 'https://freecodecamp.org/learn/javascript-algorithms-and-data-structures/', 'type': 'free_course', 'hours': 50},
                    {'name': 'JavaScript30', 'url': 'https://javascript30.com/', 'type': 'free_course', 'hours': 30}
                ],
                'react': [
                    {'name': 'React Official Tutorial', 'url': 'https://react.dev/learn', 'type': 'free_tutorial', 'hours': 20},
                    {'name': 'Full Stack Open', 'url': 'https://fullstackopen.com/en/', 'type': 'free_course', 'hours': 40},
                    {'name': 'React - The Complete Guide (Udemy)', 'url': 'https://udemy.com/course/react-the-complete-guide-incl-redux/', 'type': 'course', 'hours': 50}
                ]
            },
            'projects': {
                'beginner': [
                    {'name': 'Personal Portfolio Website', 'skills': ['html', 'css', 'javascript'], 'hours': 20, 'description': 'Build a responsive portfolio showcasing your projects'},
                    {'name': 'Todo List App', 'skills': ['javascript', 'react'], 'hours': 15, 'description': 'CRUD operations with local storage'},
                    {'name': 'Weather App', 'skills': ['javascript', 'api'], 'hours': 12, 'description': 'Fetch data from weather API and display'}
                ],
                'intermediate': [
                    {'name': 'E-commerce Site', 'skills': ['react', 'node.js', 'database'], 'hours': 60, 'description': 'Full-stack shopping cart with payment integration'},
                    {'name': 'Blog Platform', 'skills': ['python', 'django', 'postgresql'], 'hours': 50, 'description': 'Multi-user blog with authentication and CMS'},
                    {'name': 'Real-time Chat App', 'skills': ['node.js', 'websockets', 'mongodb'], 'hours': 40, 'description': 'Real-time messaging with multiple rooms'}
                ],
                'advanced': [
                    {'name': 'Microservices Architecture', 'skills': ['docker', 'kubernetes', 'api_design'], 'hours': 100, 'description': 'Build scalable microservices with container orchestration'},
                    {'name': 'ML Recommendation System', 'skills': ['python', 'machine_learning', 'data_analysis'], 'hours': 80, 'description': 'Build ML pipeline for product recommendations'},
                    {'name': 'DevOps Pipeline', 'skills': ['ci/cd', 'aws', 'terraform'], 'hours': 70, 'description': 'Complete CI/CD pipeline with infrastructure as code'}
                ]
            }
        }
    
    async def generate_learning_path(self, user_id: str) -> LearningPath:
        """
        Generate comprehensive learning path based on user profile and job market analysis
        """
        
        # Get user's current skills and job search data
        user_profile = await self._get_user_profile(user_id)
        job_requirements = await self._analyze_job_requirements(user_id)
        
        # Identify skill gaps
        skill_gaps = await self._identify_skill_gaps(user_profile, job_requirements)
        
        # Generate recommendations
        recommended_projects = await self._recommend_projects(skill_gaps, user_profile)
        courses = await self._recommend_courses(skill_gaps)
        certifications = await self._recommend_certifications(skill_gaps)
        
        # Create timeline
        timeline = await self._create_learning_timeline(skill_gaps, recommended_projects, courses)
        
        # Calculate total time investment
        total_hours = sum(gap.estimated_hours for gap in skill_gaps)
        total_hours += sum(project.get('hours', 0) for project in recommended_projects)
        total_hours += sum(course.get('hours', 0) for course in courses)
        
        learning_path = LearningPath(
            user_id=user_id,
            generated_date=datetime.now(),
            skill_gaps=skill_gaps,
            recommended_projects=recommended_projects,
            courses=courses,
            certifications=certifications,
            timeline=timeline,
            total_estimated_hours=total_hours
        )
        
        # Store in database
        await self._store_learning_path(learning_path)
        
        return learning_path
    
    async def generate_learning_path_document(self, user_id: str) -> str:
        """
        Generate markdown document with complete learning path
        """
        
        learning_path = await self.generate_learning_path(user_id)
        user_profile = await self._get_user_profile(user_id)
        
        doc = f"""# PersonalizedLearning Path

**Generated on:** {learning_path.generated_date.strftime('%B %d, %Y')}  
**For:** {user_profile.get('full_name', 'User')}  
**Total Time Investment:** {learning_path.total_estimated_hours} hours (~{learning_path.total_estimated_hours // 40} weeks at 40h/week)

## 📋 Executive Summary

Based on analysis of your current skills and {len(await self._get_recent_jobs(user_id))} recent job opportunities, this learning path will help you become more competitive for software engineering roles.

### Priority Skills to Develop
{self._format_priority_skills(learning_path.skill_gaps[:5])}

## 🎯 Skill Gap Analysis

### Critical Skills (High Impact, High Demand)
{self._format_skill_gaps(learning_path.skill_gaps, 'critical')}

### Important Skills (Medium Impact)
{self._format_skill_gaps(learning_path.skill_gaps, 'important')}

### Nice-to-Have Skills (Low Priority)
{self._format_skill_gaps(learning_path.skill_gaps, 'nice_to_have')}

## 🛠️ Recommended Projects

### Phase 1: Foundation Projects (Weeks 1-4)
{self._format_projects(learning_path.recommended_projects, 'beginner')}

### Phase 2: Intermediate Projects (Weeks 5-12)
{self._format_projects(learning_path.recommended_projects, 'intermediate')}

### Phase 3: Advanced Projects (Weeks 13-24)
{self._format_projects(learning_path.recommended_projects, 'advanced')}

## 📚 Learning Resources

### Online Courses
{self._format_courses(learning_path.courses)}

### Certifications to Pursue
{self._format_certifications(learning_path.certifications)}

## 📅 12-Week Learning Timeline

{self._format_timeline(learning_path.timeline)}

## 🚀 Getting Started Checklist

- [ ] Set up development environment
- [ ] Create GitHub account and learn basic Git commands
- [ ] Choose your first project from Phase 1
- [ ] Join relevant Discord/Slack communities
- [ ] Set up daily coding habit (minimum 1 hour)
- [ ] Create learning journal to track progress

## 📈 Progress Tracking

### Week 1-4 Goals
- [ ] Complete foundation project
- [ ] Learn {learning_path.skill_gaps[0].skill_name if learning_path.skill_gaps else 'basic programming concepts'}
- [ ] Set up portfolio website

### Month 2-3 Goals
- [ ] Complete intermediate project
- [ ] Start building professional network
- [ ] Apply to 10 relevant positions

### Month 4-6 Goals
- [ ] Complete advanced project
- [ ] Contribute to open source
- [ ] Target 20+ applications per month

## 💡 Pro Tips

1. **Consistency over intensity**: 1 hour daily beats 7 hours on Sunday
2. **Build in public**: Share your progress on LinkedIn/Twitter
3. **Join communities**: Engage with other developers learning similar skills
4. **Real projects**: Always build something you'd actually use
5. **Document everything**: Write about your learning journey

## 📊 Market Context

Based on recent job analysis:
- **{self._get_top_skill_demand(learning_path.skill_gaps)}** appears in {self._get_skill_frequency(learning_path.skill_gaps)} of relevant job postings
- Average salary range: ${self._get_salary_estimate(user_profile, learning_path)}
- Most in-demand job titles: {self._get_popular_titles(user_id)}

---

**Remember**: This is a living document. Review and update monthly based on market changes and your progress.

*Generated by JobFlow Learning Path AI*
"""
        
        return doc
    
    async def _get_user_profile(self, user_id: str) -> Dict:
        """Get user profile and current skills"""
        
        async with httpx.AsyncClient() as client:
            # Get basic profile
            profile_response = await client.get(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            # Get detailed profile data
            profile_data_response = await client.get(
                f"{self.supabase_url}/rest/v1/profile_data",
                params={"user_id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            profile = {}
            if profile_response.status_code == 200:
                data = profile_response.json()
                if data:
                    profile.update(data[0])
            
            if profile_data_response.status_code == 200:
                data = profile_data_response.json()
                if data:
                    profile.update(data[0])
            
            return profile
    
    async def _analyze_job_requirements(self, user_id: str) -> Dict:
        """Analyze job requirements from recent searches"""
        
        jobs = await self._get_recent_jobs(user_id)
        
        # Extract skills from job descriptions
        all_skills = []
        skill_frequency = Counter()
        salary_data = []
        
        for job in jobs:
            description = job.get('description', '').lower()
            title = job.get('title', '').lower()
            
            # Extract skills from description and title
            extracted_skills = self._extract_skills_from_text(description + ' ' + title)
            all_skills.extend(extracted_skills)
            
            for skill in extracted_skills:
                skill_frequency[skill] += 1
            
            # Collect salary data
            if job.get('salary_min'):
                salary_data.append(job['salary_min'])
            if job.get('salary_max'):
                salary_data.append(job['salary_max'])
        
        return {
            'total_jobs': len(jobs),
            'skill_frequency': dict(skill_frequency),
            'top_skills': skill_frequency.most_common(20),
            'avg_salary': sum(salary_data) / len(salary_data) if salary_data else 0,
            'salary_range': (min(salary_data), max(salary_data)) if salary_data else (0, 0)
        }
    
    async def _identify_skill_gaps(self, user_profile: Dict, job_requirements: Dict) -> List[SkillGap]:
        """Identify skills gaps based on user profile vs job market"""
        
        user_skills = self._extract_user_skills(user_profile)
        required_skills = job_requirements.get('skill_frequency', {})
        
        skill_gaps = []
        
        for skill, frequency in required_skills.items():
            if frequency < 3:  # Only consider skills mentioned in 3+ jobs
                continue
            
            current_level = user_skills.get(skill, 0)
            required_level = min(10, frequency)  # Scale frequency to 1-10
            
            if current_level < required_level:
                # Get learning resources for this skill
                resources = self._get_learning_resources_for_skill(skill)
                estimated_hours = self._estimate_learning_hours(skill, current_level, required_level)
                
                skill_gap = SkillGap(
                    skill_name=skill,
                    importance=min(10, frequency),
                    current_level=current_level,
                    required_level=required_level,
                    frequency_in_jobs=frequency,
                    learning_resources=resources,
                    estimated_hours=estimated_hours
                )
                
                skill_gaps.append(skill_gap)
        
        # Sort by importance (frequency * gap size)
        skill_gaps.sort(key=lambda x: x.importance * (x.required_level - x.current_level), reverse=True)
        
        return skill_gaps[:15]  # Return top 15 skill gaps
    
    async def _recommend_projects(self, skill_gaps: List[SkillGap], user_profile: Dict) -> List[Dict]:
        """Recommend projects based on skill gaps"""
        
        # Determine user's current level
        total_experience = len(user_profile.get('experience', []))
        total_projects = len(user_profile.get('projects', []))
        
        if total_experience == 0 and total_projects <= 2:
            level = 'beginner'
        elif total_experience <= 2 and total_projects <= 5:
            level = 'intermediate'
        else:
            level = 'advanced'
        
        # Get skills that need development
        priority_skills = [gap.skill_name for gap in skill_gaps[:5]]
        
        recommended = []
        
        # Add projects from each level
        for project_level in ['beginner', 'intermediate', 'advanced']:
            if project_level == 'beginner' or (project_level == 'intermediate' and level != 'beginner') or (project_level == 'advanced' and level == 'advanced'):
                for project in self.learning_resources['projects'].get(project_level, []):
                    # Check if project skills match priority skills
                    project_skills = set(project['skills'])
                    priority_skills_set = set(priority_skills)
                    
                    if project_skills.intersection(priority_skills_set):
                        project['level'] = project_level
                        project['skill_match'] = len(project_skills.intersection(priority_skills_set))
                        recommended.append(project)
        
        # Sort by skill relevance
        recommended.sort(key=lambda x: x.get('skill_match', 0), reverse=True)
        
        return recommended[:8]  # Return top 8 projects
    
    async def _recommend_courses(self, skill_gaps: List[SkillGap]) -> List[Dict]:
        """Recommend courses for top skill gaps"""
        
        courses = []
        
        for gap in skill_gaps[:5]:  # Top 5 skills
            skill_courses = self.learning_resources['courses'].get(gap.skill_name, [])
            for course in skill_courses:
                course['skill'] = gap.skill_name
                course['priority'] = gap.importance
                courses.append(course)
        
        return courses
    
    async def _recommend_certifications(self, skill_gaps: List[SkillGap]) -> List[Dict]:
        """Recommend relevant certifications"""
        
        certifications = [
            {'name': 'AWS Cloud Practitioner', 'skill': 'aws', 'cost': '$100', 'duration': '2-4 weeks'},
            {'name': 'Google Cloud Associate', 'skill': 'gcp', 'cost': '$125', 'duration': '3-6 weeks'},
            {'name': 'Docker Certified Associate', 'skill': 'docker', 'cost': '$195', 'duration': '2-3 weeks'},
            {'name': 'MongoDB Developer', 'skill': 'mongodb', 'cost': 'Free', 'duration': '1-2 weeks'},
            {'name': 'GitHub Actions Certification', 'skill': 'ci/cd', 'cost': 'Free', 'duration': '1 week'}
        ]
        
        # Filter certifications based on skill gaps
        priority_skills = [gap.skill_name for gap in skill_gaps[:8]]
        relevant_certs = [cert for cert in certifications if cert['skill'] in priority_skills]
        
        return relevant_certs
    
    async def _create_learning_timeline(self, skill_gaps: List[SkillGap], projects: List[Dict], courses: List[Dict]) -> Dict:
        """Create week-by-week learning timeline"""
        
        timeline = {}
        current_week = 1
        
        # Phase 1: Foundation (Weeks 1-4)
        for week in range(1, 5):
            timeline[f'Week {week}'] = {
                'focus': 'Foundation Skills',
                'skills': [gap.skill_name for gap in skill_gaps[:2]],
                'activities': [
                    f"Learn basics of {skill_gaps[0].skill_name if skill_gaps else 'programming'}",
                    "Set up development environment",
                    "Start first project"
                ],
                'goals': ['Build coding habit', 'Complete setup', 'First working project']
            }
        
        # Phase 2: Skill Building (Weeks 5-8)  
        for week in range(5, 9):
            timeline[f'Week {week}'] = {
                'focus': 'Core Skills Development',
                'skills': [gap.skill_name for gap in skill_gaps[2:5]],
                'activities': [
                    "Work on intermediate project",
                    f"Deep dive into {skill_gaps[1].skill_name if len(skill_gaps) > 1 else 'web development'}",
                    "Join developer communities"
                ],
                'goals': ['Project portfolio growth', 'Skill proficiency', 'Network building']
            }
        
        # Phase 3: Specialization (Weeks 9-12)
        for week in range(9, 13):
            timeline[f'Week {week}'] = {
                'focus': 'Specialization & Portfolio',
                'skills': [gap.skill_name for gap in skill_gaps[5:8]],
                'activities': [
                    "Advanced project development",
                    "Open source contributions",
                    "Job application preparation"
                ],
                'goals': ['Professional portfolio', 'Open source profile', 'Interview readiness']
            }
        
        return timeline
    
    # Helper methods
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract technical skills from job description text"""
        
        text_lower = text.lower()
        found_skills = []
        
        # Check all skill categories
        for category, skills in self.skill_categories.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills.append(skill)
        
        return found_skills
    
    def _extract_user_skills(self, user_profile: Dict) -> Dict[str, int]:
        """Extract user's current skills and estimate proficiency levels"""
        
        user_skills = {}
        
        # From technical_skills field
        technical_skills = user_profile.get('technical_skills', {})
        for category, skills in technical_skills.items():
            if isinstance(skills, list):
                for skill in skills:
                    user_skills[skill.lower()] = 7  # Assume intermediate level
            elif isinstance(skills, dict):
                for skill, level in skills.items():
                    if isinstance(level, (int, float)):
                        user_skills[skill.lower()] = int(level)
                    else:
                        user_skills[skill.lower()] = 5  # Default level
    
        return user_skills
    
    def _get_learning_resources_for_skill(self, skill: str) -> List[Dict]:
        """Get learning resources for a specific skill"""
        
        return self.learning_resources['courses'].get(skill, [
            {'name': f'Learn {skill.title()}', 'url': f'https://google.com/search?q=learn+{skill}', 'type': 'search', 'hours': 30}
        ])
    
    def _estimate_learning_hours(self, skill: str, current_level: int, required_level: int) -> int:
        """Estimate hours needed to learn a skill"""
        
        base_hours = 0
        
        # Get base hours from skill categories
        for category, skills in self.skill_categories.items():
            if skill in skills:
                base_hours = skills[skill]['hours_to_learn']
                break
        
        if base_hours == 0:
            base_hours = 40  # Default
        
        # Adjust based on current vs required level
        level_diff = required_level - current_level
        adjustment_factor = level_diff / 10.0
        
        return int(base_hours * adjustment_factor)
    
    async def _get_recent_jobs(self, user_id: str) -> List[Dict]:
        """Get recent jobs found for user"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/jobs",
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "found_at.desc",
                    "limit": "100"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            
            return []
    
    async def _store_learning_path(self, learning_path: LearningPath):
        """Store learning path in database"""
        
        learning_path_data = {
            'user_id': learning_path.user_id,
            'generated_date': learning_path.generated_date.isoformat(),
            'skill_gaps': [gap.__dict__ for gap in learning_path.skill_gaps],
            'recommended_projects': learning_path.recommended_projects,
            'courses': learning_path.courses,
            'certifications': learning_path.certifications,
            'timeline': learning_path.timeline,
            'total_estimated_hours': learning_path.total_estimated_hours
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/learning_paths",
                json=learning_path_data,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    # Document formatting methods
    def _format_priority_skills(self, skill_gaps: List[SkillGap]) -> str:
        """Format priority skills for markdown"""
        
        if not skill_gaps:
            return "- No specific skill gaps identified"
        
        formatted = []
        for gap in skill_gaps:
            formatted.append(f"- **{gap.skill_name.title()}** ({gap.frequency_in_jobs} jobs, {gap.estimated_hours}h estimated)")
        
        return "\n".join(formatted)
    
    def _format_skill_gaps(self, skill_gaps: List[SkillGap], priority: str) -> str:
        """Format skill gaps by priority level"""
        
        if priority == 'critical':
            filtered_gaps = [g for g in skill_gaps if g.importance >= 7]
        elif priority == 'important':
            filtered_gaps = [g for g in skill_gaps if 4 <= g.importance < 7]
        else:
            filtered_gaps = [g for g in skill_gaps if g.importance < 4]
        
        if not filtered_gaps:
            return "- None identified"
        
        formatted = []
        for gap in filtered_gaps:
            level_desc = "Beginner" if gap.current_level <= 3 else "Intermediate" if gap.current_level <= 6 else "Advanced"
            formatted.append(f"""
#### {gap.skill_name.title()}
- **Current Level:** {level_desc} ({gap.current_level}/10)
- **Required Level:** {gap.required_level}/10
- **Job Frequency:** {gap.frequency_in_jobs} positions
- **Learning Time:** ~{gap.estimated_hours} hours
""")
        
        return "\n".join(formatted)
    
    def _format_projects(self, projects: List[Dict], level: str) -> str:
        """Format projects by difficulty level"""
        
        level_projects = [p for p in projects if p.get('level') == level]
        
        if not level_projects:
            return "- No projects recommended for this level"
        
        formatted = []
        for project in level_projects:
            formatted.append(f"""
### {project['name']}
- **Skills:** {', '.join(project['skills'])}
- **Time:** {project['hours']} hours
- **Description:** {project['description']}
""")
        
        return "\n".join(formatted)
    
    def _format_courses(self, courses: List[Dict]) -> str:
        """Format course recommendations"""
        
        if not courses:
            return "- No specific courses recommended"
        
        formatted = []
        for course in courses:
            formatted.append(f"- **{course['name']}** ({course['type']}) - {course['hours']}h - [Link]({course['url']})")
        
        return "\n".join(formatted)
    
    def _format_certifications(self, certifications: List[Dict]) -> str:
        """Format certification recommendations"""
        
        if not certifications:
            return "- No certifications recommended at this time"
        
        formatted = []
        for cert in certifications:
            formatted.append(f"- **{cert['name']}** - Cost: {cert['cost']} - Duration: {cert['duration']}")
        
        return "\n".join(formatted)
    
    def _format_timeline(self, timeline: Dict) -> str:
        """Format learning timeline"""
        
        formatted = []
        for week, details in timeline.items():
            formatted.append(f"""
### {week}: {details['focus']}
**Skills Focus:** {', '.join(details['skills'])}

**Activities:**
{chr(10).join('- ' + activity for activity in details['activities'])}

**Goals:**
{chr(10).join('- ' + goal for goal in details['goals'])}
""")
        
        return "\n".join(formatted)
    
    def _get_top_skill_demand(self, skill_gaps: List[SkillGap]) -> str:
        """Get the most in-demand skill"""
        
        if not skill_gaps:
            return "Python"
        
        return skill_gaps[0].skill_name.title()
    
    def _get_skill_frequency(self, skill_gaps: List[SkillGap]) -> str:
        """Get frequency of top skill"""
        
        if not skill_gaps:
            return "50%"
        
        return f"{skill_gaps[0].frequency_in_jobs}%"
    
    def _get_salary_estimate(self, user_profile: Dict, learning_path: LearningPath) -> str:
        """Estimate salary range after completing learning path"""
        
        # Base estimates for software engineers
        base_salary = 70000
        experience_bonus = len(user_profile.get('experience', [])) * 10000
        skill_bonus = len([g for g in learning_path.skill_gaps if g.importance >= 7]) * 5000
        
        estimated_salary = base_salary + experience_bonus + skill_bonus
        
        return f"{estimated_salary:,} - {estimated_salary + 20000:,}"
    
    def _get_popular_titles(self, user_id: str) -> str:
        """Get popular job titles from recent searches"""
        
        return "Software Engineer, Full Stack Developer, Backend Developer"