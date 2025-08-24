"""
Advanced AI Service for JobFlow
Interview preparation, salary negotiation, and career coaching features
"""

import os
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import openai
from anthropic import Anthropic
import httpx
from dotenv import load_dotenv

load_dotenv()

class AdvancedAIService:
    """Advanced AI features for premium users"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
    async def generate_interview_prep(
        self,
        user_id: str,
        job: Dict,
        interview_type: str = "technical"
    ) -> Dict:
        """
        Generate comprehensive interview preparation materials
        
        Args:
            user_id: User ID
            job: Job details
            interview_type: technical, behavioral, or case
        
        Returns:
            Interview prep package with questions, answers, and tips
        """
        
        # Get user profile for personalization
        profile = await self._get_user_profile(user_id)
        
        # Generate interview questions
        questions = await self._generate_interview_questions(
            job=job,
            profile=profile,
            interview_type=interview_type
        )
        
        # Generate sample answers
        answers = await self._generate_sample_answers(
            questions=questions,
            profile=profile,
            job=job
        )
        
        # Generate interview tips
        tips = await self._generate_interview_tips(
            job=job,
            company=job.get('company'),
            interview_type=interview_type
        )
        
        # Company research
        company_research = await self._research_company(
            company=job.get('company'),
            role=job.get('title')
        )
        
        # Create comprehensive prep package
        prep_package = {
            'job_title': job.get('title'),
            'company': job.get('company'),
            'interview_type': interview_type,
            'questions': questions,
            'sample_answers': answers,
            'tips': tips,
            'company_research': company_research,
            'estimated_prep_time': '2-4 hours',
            'confidence_builders': self._get_confidence_builders(interview_type),
            'red_flags_to_avoid': self._get_red_flags(interview_type),
            'generated_at': datetime.now().isoformat()
        }
        
        # Track usage
        await self._track_ai_usage(user_id, 'interview_prep', tokens_used=2000)
        
        return prep_package
    
    async def _generate_interview_questions(
        self,
        job: Dict,
        profile: Dict,
        interview_type: str
    ) -> List[Dict]:
        """Generate likely interview questions"""
        
        prompt = f"""Generate 15 likely interview questions for a {job.get('title')} position at {job.get('company')}.
        
        Interview Type: {interview_type}
        Job Description: {job.get('description', 'N/A')}
        
        Candidate Background:
        - Experience: {profile.get('experience_years', 'Entry-level')} years
        - Skills: {', '.join(profile.get('skills', [])[:10])}
        - Education: {profile.get('education', 'Bachelor\'s degree')}
        
        For each question, provide:
        1. The question
        2. Why it's asked
        3. Difficulty level (Easy/Medium/Hard)
        4. Category (Technical/Behavioral/Situational)
        
        Format as JSON array."""
        
        response = await self.anthropic_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        try:
            questions = json.loads(response.content[0].text)
        except:
            # Fallback to default questions
            questions = self._get_default_questions(interview_type)
        
        return questions
    
    async def _generate_sample_answers(
        self,
        questions: List[Dict],
        profile: Dict,
        job: Dict
    ) -> List[Dict]:
        """Generate personalized sample answers using STAR method"""
        
        sample_answers = []
        
        for question in questions[:10]:  # Top 10 questions
            prompt = f"""Generate a strong answer to this interview question using the STAR method.
            
            Question: {question.get('question')}
            Role: {job.get('title')}
            
            Use this background:
            - Projects: {profile.get('projects', [])}
            - Experience: {profile.get('experience', [])}
            - Achievements: {profile.get('achievements', [])}
            
            Structure the answer with:
            1. Situation (context)
            2. Task (what needed to be done)
            3. Action (what you did)
            4. Result (outcome and impact)
            
            Keep it under 200 words and make it specific."""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300
            )
            
            sample_answers.append({
                'question': question.get('question'),
                'answer': response.choices[0].message.content,
                'method': 'STAR',
                'word_count': len(response.choices[0].message.content.split())
            })
        
        return sample_answers
    
    async def negotiate_salary(
        self,
        user_id: str,
        job: Dict,
        initial_offer: float,
        market_data: Optional[Dict] = None
    ) -> Dict:
        """
        Generate salary negotiation strategy and scripts
        
        Args:
            user_id: User ID
            job: Job details
            initial_offer: Initial salary offer
            market_data: Optional market salary data
        
        Returns:
            Negotiation strategy with scripts and tactics
        """
        
        # Get user profile
        profile = await self._get_user_profile(user_id)
        
        # Research market rates if not provided
        if not market_data:
            market_data = await self._research_salary_data(
                title=job.get('title'),
                location=job.get('location'),
                experience=profile.get('experience_years', 0)
            )
        
        # Calculate negotiation range
        negotiation_range = self._calculate_negotiation_range(
            initial_offer=initial_offer,
            market_data=market_data,
            profile=profile
        )
        
        # Generate negotiation scripts
        scripts = await self._generate_negotiation_scripts(
            initial_offer=initial_offer,
            target_salary=negotiation_range['target'],
            job=job,
            profile=profile
        )
        
        # Create negotiation package
        negotiation_package = {
            'initial_offer': initial_offer,
            'market_analysis': market_data,
            'recommended_range': negotiation_range,
            'negotiation_scripts': scripts,
            'tactics': self._get_negotiation_tactics(),
            'timing_advice': self._get_timing_advice(),
            'non_salary_benefits': self._suggest_benefits_to_negotiate(),
            'red_lines': self._identify_red_lines(initial_offer, market_data),
            'confidence_score': self._calculate_negotiation_confidence(
                initial_offer,
                market_data,
                profile
            ),
            'generated_at': datetime.now().isoformat()
        }
        
        # Track usage
        await self._track_ai_usage(user_id, 'salary_negotiation', tokens_used=1500)
        
        return negotiation_package
    
    async def _generate_negotiation_scripts(
        self,
        initial_offer: float,
        target_salary: float,
        job: Dict,
        profile: Dict
    ) -> Dict:
        """Generate negotiation conversation scripts"""
        
        prompt = f"""Generate professional salary negotiation scripts.
        
        Context:
        - Role: {job.get('title')}
        - Company: {job.get('company')}
        - Initial offer: ${initial_offer:,.0f}
        - Target: ${target_salary:,.0f}
        - Experience: {profile.get('experience_years', 0)} years
        
        Create scripts for:
        1. Initial counter-offer email
        2. Phone negotiation talking points
        3. Handling objections
        4. Final acceptance email
        
        Be professional, confident, and data-driven."""
        
        response = await self.anthropic_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            'email_templates': self._parse_email_templates(response.content[0].text),
            'talking_points': self._parse_talking_points(response.content[0].text),
            'objection_handlers': self._get_objection_handlers(),
            'power_phrases': [
                "Based on my research and experience...",
                "I'm confident I can deliver exceptional value...",
                "Considering the market rate and my unique qualifications...",
                "I'm excited about this opportunity and want to ensure...",
                "My combination of skills in X and Y positions me to..."
            ]
        }
    
    async def career_path_analysis(
        self,
        user_id: str,
        target_role: Optional[str] = None,
        years_ahead: int = 5
    ) -> Dict:
        """
        Analyze career progression paths and provide recommendations
        
        Args:
            user_id: User ID
            target_role: Optional target role to aim for
            years_ahead: Years to project ahead (default 5)
        
        Returns:
            Career path analysis with milestones and recommendations
        """
        
        profile = await self._get_user_profile(user_id)
        current_role = profile.get('current_role', 'Software Engineer')
        
        # Generate career paths
        paths = await self._generate_career_paths(
            current_role=current_role,
            target_role=target_role,
            profile=profile,
            years=years_ahead
        )
        
        # Identify skill gaps for each path
        skill_gaps = {}
        for path in paths:
            skill_gaps[path['name']] = await self._identify_skill_gaps(
                current_skills=profile.get('skills', []),
                required_skills=path['required_skills']
            )
        
        # Generate action plans
        action_plans = await self._generate_action_plans(
            paths=paths,
            skill_gaps=skill_gaps,
            timeline_years=years_ahead
        )
        
        # Market demand analysis
        market_analysis = await self._analyze_market_demand(
            roles=[p['end_role'] for p in paths],
            location=profile.get('location', 'United States')
        )
        
        return {
            'current_position': current_role,
            'years_projected': years_ahead,
            'career_paths': paths,
            'skill_gaps': skill_gaps,
            'action_plans': action_plans,
            'market_analysis': market_analysis,
            'recommended_path': self._recommend_best_path(paths, market_analysis, profile),
            'milestone_timeline': self._create_milestone_timeline(paths[0], years_ahead),
            'generated_at': datetime.now().isoformat()
        }
    
    async def generate_linkedin_optimization(
        self,
        user_id: str,
        target_roles: List[str]
    ) -> Dict:
        """
        Generate LinkedIn profile optimization recommendations
        
        Args:
            user_id: User ID
            target_roles: List of target job roles
        
        Returns:
            LinkedIn optimization package
        """
        
        profile = await self._get_user_profile(user_id)
        
        # Generate optimized headline
        headline = await self._generate_linkedin_headline(
            profile=profile,
            target_roles=target_roles
        )
        
        # Generate about section
        about_section = await self._generate_linkedin_about(
            profile=profile,
            target_roles=target_roles
        )
        
        # Generate skill recommendations
        skill_recommendations = self._recommend_linkedin_skills(
            current_skills=profile.get('skills', []),
            target_roles=target_roles
        )
        
        # Generate keyword optimization
        keywords = self._extract_keywords_for_roles(target_roles)
        
        return {
            'optimized_headline': headline,
            'about_section': about_section,
            'skill_recommendations': skill_recommendations,
            'keywords_to_include': keywords,
            'profile_tips': [
                "Add a professional photo with good lighting",
                "Include 5+ skills with endorsements",
                "Write detailed experience descriptions with metrics",
                "Add relevant certifications and courses",
                "Engage with content in your field weekly",
                "Customize your LinkedIn URL",
                "Add media samples to showcase work"
            ],
            'connection_strategy': self._get_connection_strategy(target_roles),
            'content_ideas': self._generate_content_ideas(profile, target_roles),
            'generated_at': datetime.now().isoformat()
        }
    
    async def analyze_job_market_trends(
        self,
        user_id: str,
        skills: List[str],
        location: str = "United States"
    ) -> Dict:
        """
        Analyze job market trends for user's skills
        
        Args:
            user_id: User ID
            skills: List of skills to analyze
            location: Geographic location
        
        Returns:
            Market trends analysis
        """
        
        trends = {
            'skills_demand': {},
            'salary_trends': {},
            'growth_projections': {},
            'emerging_technologies': [],
            'declining_technologies': [],
            'recommendations': []
        }
        
        # Analyze each skill
        for skill in skills[:10]:  # Top 10 skills
            demand = self._calculate_skill_demand(skill, location)
            trends['skills_demand'][skill] = demand
            
            salary = self._get_skill_salary_data(skill, location)
            trends['salary_trends'][skill] = salary
        
        # Identify trending technologies
        trends['emerging_technologies'] = [
            {'name': 'AI/ML Engineering', 'growth': '+45%', 'avg_salary': '$165,000'},
            {'name': 'Cloud Architecture', 'growth': '+38%', 'avg_salary': '$155,000'},
            {'name': 'DevOps/SRE', 'growth': '+35%', 'avg_salary': '$145,000'},
            {'name': 'Blockchain', 'growth': '+33%', 'avg_salary': '$150,000'},
            {'name': 'Cybersecurity', 'growth': '+31%', 'avg_salary': '$140,000'}
        ]
        
        # Generate recommendations
        trends['recommendations'] = await self._generate_market_recommendations(
            skills=skills,
            trends=trends,
            location=location
        )
        
        # Track usage
        await self._track_ai_usage(user_id, 'market_analysis', tokens_used=500)
        
        return trends
    
    # Helper methods
    
    async def _get_user_profile(self, user_id: str) -> Dict:
        """Get user profile from database"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/profile_data",
                params={"user_id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else {}
            
            return {}
    
    async def _track_ai_usage(self, user_id: str, feature: str, tokens_used: int):
        """Track AI feature usage for billing"""
        
        cost = (tokens_used / 1000) * 0.03  # Approximate cost per 1K tokens
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/api_usage",
                json={
                    "user_id": user_id,
                    "api_name": "advanced_ai",
                    "endpoint": feature,
                    "tokens_used": tokens_used,
                    "cost_usd": cost
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    def _calculate_negotiation_range(
        self,
        initial_offer: float,
        market_data: Dict,
        profile: Dict
    ) -> Dict:
        """Calculate optimal negotiation range"""
        
        market_median = market_data.get('median', initial_offer)
        market_75th = market_data.get('percentile_75', initial_offer * 1.15)
        
        # Adjust based on profile strength
        profile_multiplier = 1.0
        if profile.get('experience_years', 0) > 5:
            profile_multiplier += 0.1
        if len(profile.get('skills', [])) > 15:
            profile_multiplier += 0.05
        if profile.get('education_level') == 'Masters':
            profile_multiplier += 0.05
        
        return {
            'minimum': max(initial_offer, market_median * 0.95),
            'target': market_median * profile_multiplier,
            'stretch': market_75th * profile_multiplier,
            'walk_away': market_median * 0.85
        }
    
    def _get_negotiation_tactics(self) -> List[Dict]:
        """Get proven negotiation tactics"""
        
        return [
            {
                'tactic': 'Anchor High',
                'description': 'Start with a number 15-20% above your target',
                'when_to_use': 'In your first counter-offer'
            },
            {
                'tactic': 'Multiple Options',
                'description': 'Provide 2-3 compensation packages for them to choose',
                'when_to_use': 'When they seem stuck on a number'
            },
            {
                'tactic': 'Non-Salary Trade-offs',
                'description': 'Negotiate signing bonus, equity, PTO, remote work',
                'when_to_use': 'When salary is capped'
            },
            {
                'tactic': 'Competition Leverage',
                'description': 'Mention other opportunities without ultimatums',
                'when_to_use': 'When you have multiple offers'
            },
            {
                'tactic': 'Future Value',
                'description': 'Emphasize the value you will bring',
                'when_to_use': 'Throughout the negotiation'
            }
        ]
    
    def _get_confidence_builders(self, interview_type: str) -> List[str]:
        """Get confidence building tips"""
        
        base_tips = [
            "Practice answers out loud 3-5 times",
            "Record yourself and review body language",
            "Prepare 5 thoughtful questions to ask",
            "Research recent company news and initiatives",
            "Plan your outfit the night before",
            "Do a power pose for 2 minutes before",
            "Arrive 15 minutes early to settle in"
        ]
        
        if interview_type == 'technical':
            base_tips.extend([
                "Review fundamental concepts the night before",
                "Solve 2-3 practice problems in the morning",
                "Bring a notebook for whiteboarding"
            ])
        
        return base_tips
    
    def _get_red_flags(self, interview_type: str) -> List[str]:
        """Get interview red flags to avoid"""
        
        return [
            "Speaking negatively about past employers",
            "Appearing unprepared or disinterested",
            "Focusing only on salary and benefits",
            "Interrupting or talking over interviewers",
            "Giving vague, non-specific answers",
            "Not asking any questions at the end",
            "Checking phone during interview",
            "Arriving late without notice",
            "Lying or exaggerating experience",
            "Being inflexible about requirements"
        ]
    
    def _get_default_questions(self, interview_type: str) -> List[Dict]:
        """Get default interview questions as fallback"""
        
        if interview_type == 'technical':
            return [
                {'question': 'Describe your experience with our tech stack', 'difficulty': 'Medium'},
                {'question': 'Walk me through a challenging bug you solved', 'difficulty': 'Medium'},
                {'question': 'How do you approach system design?', 'difficulty': 'Hard'},
                {'question': 'Explain a complex technical concept simply', 'difficulty': 'Medium'},
                {'question': 'How do you stay updated with technology?', 'difficulty': 'Easy'}
            ]
        elif interview_type == 'behavioral':
            return [
                {'question': 'Tell me about yourself', 'difficulty': 'Easy'},
                {'question': 'Why are you interested in this role?', 'difficulty': 'Easy'},
                {'question': 'Describe a time you faced conflict at work', 'difficulty': 'Medium'},
                {'question': 'What is your greatest weakness?', 'difficulty': 'Medium'},
                {'question': 'Where do you see yourself in 5 years?', 'difficulty': 'Medium'}
            ]
        else:
            return [
                {'question': 'Why do you want to work here?', 'difficulty': 'Easy'},
                {'question': 'What makes you unique?', 'difficulty': 'Medium'},
                {'question': 'How do you handle pressure?', 'difficulty': 'Medium'}
            ]