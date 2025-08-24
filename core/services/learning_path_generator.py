"""
Learning Path Generator - AI-powered skill gap analysis and personalized roadmaps
Analyzes job requirements vs user skills and creates actionable learning plans
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple
from profile_manager import ProfileManager


class LearningPathGenerator:
    """Generate personalized learning paths based on job requirements and user profile"""
    
    def __init__(self):
        self.profile = ProfileManager()
        self.skill_categories = {
            'programming_languages': ['python', 'java', 'javascript', 'typescript', 'c++', 'go', 'rust', 'kotlin', 'swift'],
            'web_frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'express', 'nextjs', 'nuxt'],
            'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ionic'],
            'databases': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb'],
            'cloud': ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform'],
            'ai_ml': ['tensorflow', 'pytorch', 'scikit-learn', 'opencv', 'nlp', 'computer vision'],
            'devops': ['jenkins', 'gitlab', 'github actions', 'ansible', 'chef', 'puppet'],
            'testing': ['jest', 'pytest', 'junit', 'selenium', 'cypress', 'testng'],
            'data': ['pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'airflow'],
            'soft_skills': ['leadership', 'communication', 'project management', 'agile', 'scrum']
        }
        
        self.learning_resources = {
            'programming_languages': {
                'python': [
                    {'name': 'Python Crash Course', 'provider': 'Book', 'duration': '4-6 weeks', 'cost': '$30'},
                    {'name': 'Automate the Boring Stuff', 'provider': 'Free Online', 'duration': '3-4 weeks', 'cost': 'Free'},
                    {'name': 'Python for Everybody', 'provider': 'Coursera', 'duration': '2 months', 'cost': '$49/month'}
                ],
                'typescript': [
                    {'name': 'TypeScript Handbook', 'provider': 'Official Docs', 'duration': '2 weeks', 'cost': 'Free'},
                    {'name': 'TypeScript Deep Dive', 'provider': 'Basarat', 'duration': '3 weeks', 'cost': 'Free'},
                    {'name': 'Advanced TypeScript', 'provider': 'Frontend Masters', 'duration': '1 week', 'cost': '$39/month'}
                ]
            },
            'frameworks': {
                'react': [
                    {'name': 'React Official Tutorial', 'provider': 'React.dev', 'duration': '1 week', 'cost': 'Free'},
                    {'name': 'Modern React with Redux', 'provider': 'Udemy', 'duration': '4-6 weeks', 'cost': '$85'},
                    {'name': 'React - Complete Guide', 'provider': 'Udemy', 'duration': '6-8 weeks', 'cost': '$95'}
                ],
                'nextjs': [
                    {'name': 'Next.js Learn', 'provider': 'Vercel', 'duration': '2 weeks', 'cost': 'Free'},
                    {'name': 'Next.js & React - Complete Guide', 'provider': 'Udemy', 'duration': '4 weeks', 'cost': '$85'}
                ]
            },
            'cloud': {
                'aws': [
                    {'name': 'AWS Cloud Practitioner', 'provider': 'AWS Training', 'duration': '1 month', 'cost': '$100'},
                    {'name': 'AWS Solutions Architect Associate', 'provider': 'A Cloud Guru', 'duration': '2 months', 'cost': '$49/month'}
                ],
                'docker': [
                    {'name': 'Docker Mastery', 'provider': 'Udemy', 'duration': '3 weeks', 'cost': '$85'},
                    {'name': 'Docker Official Tutorial', 'provider': 'Docker', 'duration': '1 week', 'cost': 'Free'}
                ]
            }
        }
        
    def analyze_job_requirements(self, job_description: str) -> Dict[str, Set[str]]:
        """Extract required skills from job description"""
        
        job_text = job_description.lower()
        found_skills = {}
        
        for category, skills in self.skill_categories.items():
            found_skills[category] = set()
            for skill in skills:
                # Use various patterns to detect skills
                patterns = [
                    f'\\b{skill}\\b',
                    f'{skill}[\\s,]',
                    f'experience.*{skill}',
                    f'{skill}.*experience'
                ]
                
                for pattern in patterns:
                    if re.search(pattern, job_text):
                        found_skills[category].add(skill)
                        break
        
        return found_skills
    
    def get_user_skills(self) -> Dict[str, Set[str]]:
        """Get user's current skills from profile"""
        
        user_skills = {}
        
        # Programming languages
        user_skills['programming_languages'] = set(
            lang.lower() for lang in self.profile.get_programming_languages()
        )
        
        # Frameworks  
        user_skills['web_frameworks'] = set()
        user_skills['mobile'] = set()
        for framework in self.profile.get_frameworks():
            framework_lower = framework.lower()
            # Categorize frameworks
            if framework_lower in ['react', 'angular', 'vue', 'django', 'flask', 'express', 'nextjs', 'nuxt']:
                user_skills['web_frameworks'].add(framework_lower)
            elif framework_lower in ['react native', 'flutter', 'ionic']:
                user_skills['mobile'].add(framework_lower)
        
        # AI/ML skills
        user_skills['ai_ml'] = set(
            skill.lower() for skill in self.profile.get_ai_ml_skills()
        )
        
        # Databases
        user_skills['databases'] = set(
            db.lower() for db in self.profile.get_databases()  
        )
        
        # Cloud skills
        user_skills['cloud'] = set(
            cloud.lower() for cloud in self.profile.get_cloud_skills()
        )
        
        # Initialize other categories
        for category in self.skill_categories:
            if category not in user_skills:
                user_skills[category] = set()
        
        return user_skills
    
    def identify_skill_gaps(self, required_skills: Dict[str, Set[str]], user_skills: Dict[str, Set[str]]) -> Dict[str, Set[str]]:
        """Identify skills the user needs to learn"""
        
        skill_gaps = {}
        
        for category in required_skills:
            required = required_skills[category]
            current = user_skills.get(category, set())
            gaps = required - current
            if gaps:
                skill_gaps[category] = gaps
        
        return skill_gaps
    
    def prioritize_skills(self, skill_gaps: Dict[str, Set[str]], job_description: str) -> List[Tuple[str, str, int]]:
        """Prioritize skills based on frequency in job description and category importance"""
        
        priority_weights = {
            'programming_languages': 10,
            'web_frameworks': 8,
            'databases': 7,
            'cloud': 6,
            'ai_ml': 9,
            'mobile': 5,
            'devops': 4,
            'testing': 3,
            'data': 7,
            'soft_skills': 2
        }
        
        prioritized_skills = []
        job_text = job_description.lower()
        
        for category, skills in skill_gaps.items():
            base_priority = priority_weights.get(category, 1)
            
            for skill in skills:
                # Count mentions in job description
                mention_count = len(re.findall(f'\\b{skill}\\b', job_text))
                
                # Calculate final priority
                final_priority = base_priority + (mention_count * 2)
                
                prioritized_skills.append((category, skill, final_priority))
        
        # Sort by priority (highest first)
        return sorted(prioritized_skills, key=lambda x: x[2], reverse=True)
    
    def generate_learning_roadmap(self, prioritized_skills: List[Tuple[str, str, int]]) -> Dict:
        """Generate a detailed learning roadmap with timelines and resources"""
        
        roadmap = {
            'total_skills': len(prioritized_skills),
            'estimated_timeline': '3-6 months',
            'phases': [],
            'resources': [],
            'generated_at': datetime.now().isoformat()
        }
        
        # Group skills into learning phases (4 weeks each)
        phase_1 = []  # Highest priority (first 4 weeks)
        phase_2 = []  # Medium priority (weeks 5-8)  
        phase_3 = []  # Lower priority (weeks 9-12)
        
        for i, (category, skill, priority) in enumerate(prioritized_skills):
            if i < 3 or priority >= 15:  # Top 3 or very high priority
                phase_1.append((category, skill, priority))
            elif i < 6 or priority >= 10:  # Next 3 or high priority
                phase_2.append((category, skill, priority))
            else:
                phase_3.append((category, skill, priority))
        
        # Create phase details
        phases = [
            {'name': 'Phase 1: Foundation Skills', 'duration': 'Weeks 1-4', 'skills': phase_1},
            {'name': 'Phase 2: Core Technologies', 'duration': 'Weeks 5-8', 'skills': phase_2},
            {'name': 'Phase 3: Advanced Skills', 'duration': 'Weeks 9-12', 'skills': phase_3}
        ]
        
        for phase in phases:
            if phase['skills']:  # Only include phases with skills
                phase_info = {
                    'name': phase['name'],
                    'duration': phase['duration'],
                    'skills_count': len(phase['skills']),
                    'skills': []
                }
                
                for category, skill, priority in phase['skills']:
                    skill_info = {
                        'name': skill.title(),
                        'category': category,
                        'priority': priority,
                        'estimated_time': self._estimate_learning_time(skill, category),
                        'resources': self._get_resources_for_skill(skill, category)
                    }
                    phase_info['skills'].append(skill_info)
                
                roadmap['phases'].append(phase_info)
        
        return roadmap
    
    def _estimate_learning_time(self, skill: str, category: str) -> str:
        """Estimate learning time for a skill"""
        
        time_estimates = {
            'programming_languages': '4-6 weeks',
            'web_frameworks': '3-4 weeks', 
            'databases': '2-3 weeks',
            'cloud': '3-5 weeks',
            'ai_ml': '5-8 weeks',
            'mobile': '4-6 weeks',
            'devops': '2-4 weeks',
            'testing': '1-2 weeks',
            'data': '3-5 weeks',
            'soft_skills': '2-4 weeks'
        }
        
        return time_estimates.get(category, '2-3 weeks')
    
    def _get_resources_for_skill(self, skill: str, category: str) -> List[Dict]:
        """Get learning resources for a specific skill"""
        
        # Check direct skill match
        if category in self.learning_resources:
            if skill in self.learning_resources[category]:
                return self.learning_resources[category][skill]
        
        # Check frameworks category for web frameworks
        if category == 'web_frameworks' and 'frameworks' in self.learning_resources:
            if skill in self.learning_resources['frameworks']:
                return self.learning_resources['frameworks'][skill]
        
        # Default generic resources
        return [
            {'name': f'{skill.title()} Official Documentation', 'provider': 'Official', 'duration': '1-2 weeks', 'cost': 'Free'},
            {'name': f'Learn {skill.title()}', 'provider': 'Udemy/Coursera', 'duration': '2-4 weeks', 'cost': '$50-100'},
            {'name': f'{skill.title()} Tutorial', 'provider': 'YouTube/FreeCodeCamp', 'duration': '1-2 weeks', 'cost': 'Free'}
        ]
    
    def create_learning_path_for_job(self, job: Dict) -> Dict:
        """Create complete learning path for a specific job"""
        
        job_description = job.get('description', '')
        if not job_description:
            return {'error': 'No job description provided'}
        
        # Analyze job requirements
        required_skills = self.analyze_job_requirements(job_description)
        
        # Get user's current skills
        user_skills = self.get_user_skills()
        
        # Identify skill gaps
        skill_gaps = self.identify_skill_gaps(required_skills, user_skills)
        
        if not any(skill_gaps.values()):
            return {
                'job_title': job.get('title', 'Unknown'),
                'company': job.get('company', 'Unknown'),
                'message': 'Congratulations! You already have all the required skills for this position.',
                'required_skills': sum(len(skills) for skills in required_skills.values()),
                'matching_skills': sum(len(skills) for skills in user_skills.values()),
                'generated_at': datetime.now().isoformat()
            }
        
        # Prioritize skills
        prioritized_skills = self.prioritize_skills(skill_gaps, job_description)
        
        # Generate roadmap
        roadmap = self.generate_learning_roadmap(prioritized_skills)
        
        # Add job context
        roadmap.update({
            'job_title': job.get('title', 'Unknown'),
            'company': job.get('company', 'Unknown'),
            'job_url': job.get('redirect_url', ''),
            'skill_gaps_identified': len(prioritized_skills),
            'matching_skills_count': sum(len(user_skills[cat]) for cat in user_skills if cat in required_skills),
            'required_skills_count': sum(len(required_skills[cat]) for cat in required_skills)
        })
        
        return roadmap
    
    def save_learning_path(self, learning_path: Dict, filename: str = None) -> str:
        """Save learning path to markdown file"""
        
        if not filename:
            job_title = learning_path.get('job_title', 'unknown').replace(' ', '_').lower()
            company = learning_path.get('company', 'unknown').replace(' ', '_').lower()
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"learning_path_{company}_{job_title}_{timestamp}.md"
        
        file_path = Path('data/learning_paths') / filename
        
        # Generate markdown content
        content = self._generate_markdown(learning_path)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"[OK] Learning path saved: {file_path}")
        return str(file_path)
    
    def _generate_markdown(self, learning_path: Dict) -> str:
        """Generate markdown content for learning path"""
        
        if 'message' in learning_path:
            # Already qualified case
            return f"""# Learning Path: {learning_path['job_title']} at {learning_path['company']}

## Status: Ready to Apply! 🎉

{learning_path['message']}

**Skills Analysis:**
- Required Skills: {learning_path['required_skills']}
- Your Matching Skills: {learning_path['matching_skills']}
- Skill Match Rate: 100%

**Next Steps:**
1. Review the job requirements one more time
2. Prepare for technical interviews focusing on your existing skills
3. Submit your application with confidence!

---
*Generated on {learning_path['generated_at']}*
"""
        
        # Learning path needed case
        content = f"""# Learning Path: {learning_path['job_title']} at {learning_path['company']}

**Job Application Readiness Timeline:** {learning_path.get('estimated_timeline', '3-6 months')}

## Skills Gap Analysis

**Current Status:**
- Skills to Learn: {learning_path.get('skill_gaps_identified', 0)}
- Skills You Have: {learning_path.get('matching_skills_count', 0)}
- Skills Required: {learning_path.get('required_skills_count', 0)}

"""
        
        # Add each phase
        for phase in learning_path.get('phases', []):
            content += f"## {phase['name']} ({phase['duration']})\n\n"
            content += f"**Focus:** {phase['skills_count']} key skills to master\n\n"
            
            for skill in phase['skills']:
                content += f"### {skill['name']} ({skill['category'].title()})\n"
                content += f"- **Priority Level:** {skill['priority']}/20\n"
                content += f"- **Estimated Time:** {skill['estimated_time']}\n"
                content += f"- **Resources:**\n"
                
                for resource in skill['resources']:
                    content += f"  - **{resource['name']}** ({resource['provider']}) - {resource['duration']} - {resource['cost']}\n"
                
                content += "\n"
        
        # Add action plan
        content += """## Action Plan

### Week 1-2: Setup & Foundation
- [ ] Set up learning environment and accounts
- [ ] Complete skill assessments to validate current level
- [ ] Begin Phase 1 highest priority skill

### Weekly Reviews
- [ ] Track progress on current skills
- [ ] Adjust timeline based on learning pace
- [ ] Build small projects to reinforce learning

### Monthly Milestones
- [ ] Complete each phase on schedule
- [ ] Build portfolio projects showcasing new skills
- [ ] Practice technical interview questions

## Success Metrics

**Phase Completion Criteria:**
- Comfortable explaining concepts
- Can build small project using the skill
- Pass online assessments or tutorials

**Job Application Readiness:**
- 80%+ of required skills mastered
- Portfolio demonstrates relevant experience
- Confident in technical interviews

---
"""
        
        content += f"*Learning path generated on {learning_path.get('generated_at', '')}*\n"
        content += f"*Job URL: {learning_path.get('job_url', 'N/A')}*\n"
        
        return content


async def test_learning_path_generator():
    """Test the learning path generator"""
    
    print("=" * 60)
    print("TESTING LEARNING PATH GENERATOR")
    print("=" * 60)
    
    generator = LearningPathGenerator()
    
    # Test with sample job
    sample_job = {
        'title': 'Senior Full Stack Engineer',
        'company': 'TechCorp',
        'description': '''
        We are looking for a Senior Full Stack Engineer with expertise in:
        
        - React and TypeScript for frontend development
        - Node.js and Express for backend APIs
        - PostgreSQL and Redis for data storage
        - AWS and Docker for deployment
        - Experience with GraphQL and microservices
        - Strong testing skills with Jest and Cypress
        - Knowledge of Kubernetes and CI/CD pipelines
        ''',
        'redirect_url': 'https://example.com/job/123'
    }
    
    print(f"Analyzing job: {sample_job['title']} at {sample_job['company']}")
    
    # Generate learning path
    learning_path = generator.create_learning_path_for_job(sample_job)
    
    # Save to file
    saved_path = generator.save_learning_path(learning_path)
    
    print(f"\n[OK] Learning path analysis complete!")
    print(f"[OK] Skills to learn: {learning_path.get('skill_gaps_identified', 0)}")
    print(f"[OK] Estimated timeline: {learning_path.get('estimated_timeline', 'Unknown')}")
    print(f"[OK] Saved to: {saved_path}")
    
    return learning_path


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_learning_path_generator())