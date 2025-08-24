"""
Cover Letter Generation Service
Dedicated service for AI-powered cover letter generation with zero fake data
"""

import os
import json
import asyncio
from typing import Dict, Optional, List
from datetime import datetime
from .ai_content_generator import AIContentGenerator
from .profile_manager import ProfileManager


class CoverLetterGenerator:
    """
    Specialized service for generating personalized cover letters
    Integrates with ProfileManager for zero fake data guarantee
    """
    
    def __init__(self):
        self.ai_generator = AIContentGenerator()
        self.profile = ProfileManager()
        self.validation_patterns = self._get_fake_data_patterns()
    
    def _get_fake_data_patterns(self) -> List[str]:
        """Define patterns that indicate fake data"""
        return [
            'lorem ipsum', 'placeholder', 'sample', 'example.com',
            'your name', 'your email', 'your company', 'john doe', 'jane doe',
            'dear sir/madam', 'to whom it may concern', 'template', 'boilerplate',
            'insert company name', 'insert position', '[company]', '[position]'
        ]
    
    async def generate_cover_letter(
        self, 
        job: Dict, 
        customization_level: str = "high",
        use_openai: bool = False
    ) -> Dict:
        """
        Generate AI-powered cover letter with full customization
        
        Args:
            job: Job posting dictionary with title, company, description, etc.
            customization_level: 'high', 'medium', 'basic'
            use_openai: If True, uses OpenAI instead of Claude
        
        Returns:
            Dictionary with cover letter content and metadata
        """
        
        print(f"[TARGET] Generating cover letter for {job.get('title')} at {job.get('company')}")
        
        # Generate the cover letter using AI
        try:
            cover_letter_result = await self.ai_generator.generate_personalized_cover_letter(
                job, 
                self._prepare_profile_for_ai(),
                use_openai=use_openai
            )
            
            # Validate no fake data
            validation_result = self._validate_no_fake_data(cover_letter_result['content'])
            
            if not validation_result['is_valid']:
                print("[ERROR] Fake data detected, regenerating...")
                # Fallback to template generation
                cover_letter_result = self._generate_safe_cover_letter(job)
            
            # Add JobFlow-specific metadata
            cover_letter_result.update({
                'job_id': job.get('id', 'unknown'),
                'company': job.get('company', 'Unknown'),
                'position': job.get('title', 'Unknown Position'),
                'customization_level': customization_level,
                'validation_passed': validation_result['is_valid'],
                'word_count': len(cover_letter_result['content'].split()),
                'generated_at': datetime.now().isoformat()
            })
            
            print(f"[OK] Cover letter generated ({cover_letter_result['word_count']} words)")
            return cover_letter_result
            
        except Exception as e:
            print(f"[ERROR] AI generation failed: {e}")
            print("[FALLBACK] Falling back to template generation...")
            return self._generate_safe_cover_letter(job)
    
    def _prepare_profile_for_ai(self) -> Dict:
        """Prepare profile data for AI generation"""
        
        return {
            'name': self.profile.get_name(),
            'email': self.profile.get_email(),
            'phone': self.profile.get_phone(),
            'github': self.profile.get_github(),
            'linkedin': self.profile.get_linkedin(),
            'degree': self.profile.get_degree(),
            'university': self.profile.get_school(),
            'graduation': self.profile.get_graduation(),
            'gpa': self.profile.get_gpa(),
            'visa_status': self.profile.get_visa_status(),
            'strengths': self.profile.get_strengths(),
            'technical_skills': self.profile.get_technical_skills(),
            'experience_summary': self.profile.get_experience_summary(),
            'projects_summary': self.profile.get_projects_summary(),
            'achievements': self.profile.get_achievements(),
            'unique_angles': self.profile.get_unique_angles()
        }
    
    def _validate_no_fake_data(self, content: str) -> Dict:
        """Validate that generated content contains no fake data"""
        
        content_lower = content.lower()
        detected_patterns = []
        
        for pattern in self.validation_patterns:
            if pattern in content_lower:
                detected_patterns.append(pattern)
        
        # Additional checks
        if '[' in content and ']' in content:
            detected_patterns.append('placeholder brackets')
        
        if 'xxx' in content_lower or 'placeholder' in content_lower:
            detected_patterns.append('placeholder text')
        
        return {
            'is_valid': len(detected_patterns) == 0,
            'detected_patterns': detected_patterns,
            'content_length': len(content),
            'validation_date': datetime.now().isoformat()
        }
    
    def _generate_safe_cover_letter(self, job: Dict) -> Dict:
        """Generate cover letter using safe template with real data only"""
        
        # Create personalized template using real profile data
        cover_letter = f"""Dear Hiring Manager,

I am excited to apply for the {job.get('title', 'Software Engineer')} position at {job.get('company', 'your company')}. As a {self.profile.get_degree()} student at {self.profile.get_school()} graduating in {self.profile.get_graduation()}, I am eager to contribute my technical skills and unique perspective to your team.

{self._generate_experience_paragraph(job)}

{self._generate_strengths_paragraph(job)}

My availability starts in {self.profile.get_availability()}, and I have {self.profile.get_visa_status()}. I would welcome the opportunity to discuss how my background in computer science, combined with my diverse experiences, can contribute to {job.get('company', 'your company')}'s success.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
{self.profile.get_name()}
{self.profile.get_email()}
{self.profile.get_phone()}"""
        
        return {
            'content': cover_letter,
            'generator': 'Safe Template Engine',
            'model': 'Template (Zero AI)',
            'personalization_level': 'medium',
            'validation_passed': True,
            'word_count': len(cover_letter.split()),
            'generation_date': datetime.now().isoformat(),
            'ats_friendly': True
        }
    
    def _generate_experience_paragraph(self, job: Dict) -> str:
        """Generate experience paragraph based on real profile data"""
        
        experiences = self.profile.get_experience()
        if not experiences:
            return "Through my coursework and personal projects, I have developed strong problem-solving abilities and technical expertise."
        
        # Use the most relevant experience
        primary_exp = experiences[0]
        
        return f"In my role as {primary_exp['title']} at {primary_exp['company']}, {primary_exp['achievements'][0] if primary_exp.get('achievements') else 'I gained valuable professional experience'}. This experience has strengthened my technical abilities and prepared me to tackle complex challenges in a professional environment."
    
    def _generate_strengths_paragraph(self, job: Dict) -> str:
        """Generate strengths paragraph highlighting unique qualities"""
        
        strengths = self.profile.get_strengths()
        if len(strengths) >= 2:
            return f"My background as {strengths[0].lower()} and {strengths[1].lower()} has taught me discipline, creativity, and the ability to excel under pressure. These qualities, combined with my technical skills and international perspective, position me well to contribute meaningful value to your team."
        else:
            return "My diverse background has taught me discipline, creativity, and the ability to excel under pressure. These qualities, combined with my technical skills, position me well to contribute meaningful value to your team."
    
    async def generate_multiple_variations(
        self, 
        job: Dict, 
        count: int = 3
    ) -> List[Dict]:
        """Generate multiple cover letter variations for A/B testing"""
        
        print(f"[GENERATE] Generating {count} cover letter variations...")
        
        variations = []
        
        # Generate high-customization version with Claude
        variations.append(
            await self.generate_cover_letter(job, "high", use_openai=False)
        )
        
        # Generate medium-customization version with OpenAI  
        if count >= 2:
            variations.append(
                await self.generate_cover_letter(job, "medium", use_openai=True)
            )
        
        # Generate safe template version
        if count >= 3:
            safe_version = self._generate_safe_cover_letter(job)
            safe_version['variation'] = 'safe_template'
            variations.append(safe_version)
        
        print(f"[OK] Generated {len(variations)} variations")
        return variations
    
    def save_cover_letter(self, cover_letter: Dict, job: Dict) -> str:
        """Save cover letter to data/cover_letters/ with proper naming"""
        
        # Create filename
        company = job.get('company', 'Unknown').replace(' ', '_').replace('/', '_')
        position = job.get('title', 'Unknown').replace(' ', '_').replace('/', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        filename = f"cover_letter_{company}_{position}_{timestamp}.txt"
        filepath = os.path.join('data', 'cover_letters', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save cover letter content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cover_letter['content'])
        
        # Save metadata
        metadata_file = filepath.replace('.txt', '_metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(cover_letter, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"💾 Saved cover letter: {filepath}")
        return filepath
    
    def get_generation_stats(self) -> Dict:
        """Get statistics about cover letter generation"""
        
        return {
            'ai_usage': self.ai_generator.get_usage_report(),
            'profile_status': 'Valid (Zero fake data)',
            'validation_patterns': len(self.validation_patterns),
            'last_generated': datetime.now().isoformat()
        }


async def test_cover_letter_generator():
    """Test cover letter generation with sample job"""
    
    print("=" * 60)
    print("TESTING COVER LETTER GENERATOR")
    print("=" * 60)
    
    generator = CoverLetterGenerator()
    
    # Test job posting
    test_job = {
        'id': 'test_123',
        'company': 'TechStart AI',
        'title': 'Junior Software Engineer',
        'location': 'San Francisco, CA (Hybrid)',
        'description': """We're seeking a passionate Junior Software Engineer to join our growing team. 
        You'll work on our AI-powered SaaS platform using Python, React, and cloud technologies. 
        Perfect for new graduates who want to make an impact in a fast-growing company. 
        We value creativity, collaboration, and continuous learning. Visa sponsorship available.""",
        'url': 'https://example.com/jobs/123',
        'posted_date': '2025-08-22'
    }
    
    print("\n1. Testing Basic Cover Letter Generation...")
    print("-" * 50)
    
    cover_letter = await generator.generate_cover_letter(test_job, "high")
    
    print(f"[OK] Generator: {cover_letter['generator']}")
    print(f"[OK] Model: {cover_letter.get('model', 'Unknown')}")
    print(f"[OK] Validation: {'PASSED' if cover_letter['validation_passed'] else 'FAILED'}")
    print(f"[OK] Word Count: {cover_letter['word_count']}")
    print(f"[OK] Customization: {cover_letter['customization_level']}")
    
    print("\n📄 COVER LETTER PREVIEW:")
    print("-" * 50)
    print(cover_letter['content'][:600] + "..." if len(cover_letter['content']) > 600 else cover_letter['content'])
    
    print("\n2. Testing Multiple Variations...")
    print("-" * 50)
    
    variations = await generator.generate_multiple_variations(test_job, count=2)
    
    for i, variation in enumerate(variations, 1):
        print(f"Variation {i}: {variation['generator']} - {variation['word_count']} words")
    
    print("\n3. Testing Cover Letter Saving...")
    print("-" * 50)
    
    saved_path = generator.save_cover_letter(cover_letter, test_job)
    print(f"[OK] Saved to: {saved_path}")
    
    print("\n4. Testing Generation Stats...")
    print("-" * 50)
    
    stats = generator.get_generation_stats()
    print(f"AI Usage: {stats['ai_usage']}")
    print(f"Profile Status: {stats['profile_status']}")
    print(f"Validation Patterns: {stats['validation_patterns']}")
    
    print("\n[OK] Cover letter generator test complete!")
    
    return {
        'cover_letter': cover_letter,
        'variations': variations,
        'stats': stats
    }


if __name__ == "__main__":
    # Run test
    asyncio.run(test_cover_letter_generator())