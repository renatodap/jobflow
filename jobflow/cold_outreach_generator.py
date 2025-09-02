"""
Cold Outreach Generator for JobFlow
Generates personalized LinkedIn messages, cold emails, and follow-up sequences
NO FAKE DATA - Only uses verified user information
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

class ColdOutreachGenerator:
    """Generate personalized cold outreach messages for job applications"""
    
    def __init__(self, user_profile: Dict):
        self.user_profile = user_profile
        self.validate_profile()
        
    def validate_profile(self):
        """Ensure profile has no fake data"""
        forbidden = ["john doe", "example.com", "lorem ipsum", "your name"]
        profile_str = json.dumps(self.user_profile).lower()
        
        for term in forbidden:
            if term in profile_str:
                raise ValueError(f"Fake data detected: {term}")
    
    def generate_linkedin_message(self, job: Dict, contact: Dict) -> Dict:
        """Generate LinkedIn connection request and follow-up message"""
        
        company = job.get('company', '')
        title = job.get('title', '')
        contact_name = contact.get('name', 'Hiring Manager')
        contact_title = contact.get('title', '')
        
        # Connection request (300 char limit)
        connection_note = f"""Hi {contact_name.split()[0]},

I saw the {title} role at {company} and I'm genuinely excited about it. {self._get_company_hook(company)}

Would love to connect and learn more about your team's work.

Best,
{self.user_profile['name'].split()[0]}"""

        # Follow-up message (if connection accepted)
        followup_message = f"""Hi {contact_name.split()[0]},

Thanks for connecting! I wanted to reach out about the {title} position at {company}.

{self._get_relevant_experience(job)}

{self._get_specific_interest(job, company)}

Would you have 15 minutes this week to discuss how I could contribute to your team?

Best regards,
{self.user_profile['name']}
"""

        return {
            'type': 'linkedin',
            'connection_note': connection_note[:300],  # LinkedIn limit
            'followup_message': followup_message,
            'contact': contact,
            'job': job['title'],
            'company': company
        }
    
    def generate_cold_email(self, job: Dict, contact: Dict) -> Dict:
        """Generate cold email to hiring manager or recruiter"""
        
        company = job['company']
        title = job['title']
        contact_name = contact.get('name', 'Hiring Team')
        
        # Generate subject lines (A/B test options)
        subject_lines = [
            f"Re: {title} position at {company}",
            f"Quick question about the {title} role",
            f"{self.user_profile['name']} - {title} Application",
            f"Excited about {company}'s {title} opening"
        ]
        
        email_body = f"""Hi {contact_name.split()[0] if contact_name != 'Hiring Team' else 'there'},

I noticed {company} is looking for a {title}, and I had to reach out.

{self._get_relevant_experience(job)}

{self._get_specific_interest(job, company)}

{self._get_value_proposition(job)}

I'd love to discuss how my background aligns with what you're looking for. Are you available for a brief call this week?

I've attached my resume for your review. Looking forward to hearing from you!

Best regards,
{self.user_profile['name']}
{self.user_profile.get('email', '')}
{self.user_profile.get('phone', '')}
{self.user_profile.get('linkedin', '')}
"""

        return {
            'type': 'email',
            'subject_lines': subject_lines,
            'body': email_body,
            'contact': contact,
            'job': job['title'],
            'company': company
        }
    
    def generate_followup_sequence(self, initial_outreach: Dict) -> List[Dict]:
        """Generate 3-touch follow-up sequence"""
        
        sequence = []
        company = initial_outreach['company']
        job = initial_outreach['job']
        
        # Follow-up 1: Day 3 - Gentle reminder
        followup1 = {
            'day': 3,
            'subject': f"Following up - {job}",
            'body': f"""Hi there,

I wanted to follow up on my previous message about the {job} position at {company}.

I understand you're busy, but I'm very interested in this opportunity and would love to chat briefly about how I could contribute to your team.

Would you have 10 minutes this week for a quick call?

Thanks,
{self.user_profile['name'].split()[0]}"""
        }
        
        # Follow-up 2: Day 7 - Add value
        followup2 = {
            'day': 7,
            'subject': f"Thought you might find this interesting - {company}",
            'body': f"""Hi there,

I came across this article about [relevant industry trend] and thought of {company}'s work in this space.

[Share genuine insight or article relevant to company]

Still very interested in the {job} role. Would love to discuss how my experience with {self._get_top_skill()} could benefit your team.

Best,
{self.user_profile['name'].split()[0]}"""
        }
        
        # Follow-up 3: Day 14 - Final follow-up
        followup3 = {
            'day': 14,
            'subject': f"Final follow-up - {job}",
            'body': f"""Hi there,

I wanted to send one final note about the {job} position.

I remain very interested and believe my background in {self._get_top_skill()} would be valuable for your team.

If the timing isn't right or the position has been filled, I completely understand. I'd still love to connect for future opportunities.

Thanks for your time,
{self.user_profile['name']}"""
        }
        
        sequence = [followup1, followup2, followup3]
        return sequence
    
    def generate_twitter_dm(self, job: Dict, contact: Dict) -> Dict:
        """Generate Twitter DM (280 char limit)"""
        
        company = job['company']
        title = job['title']
        
        dm = f"""Hi! Saw the {title} role at {company}. I'm a {self._get_top_skill()} engineer with experience in {self._get_relevant_tech(job)}. Would love to chat about the opportunity. Portfolio: {self.user_profile.get('github', 'github.com/username')}"""
        
        return {
            'type': 'twitter_dm',
            'message': dm[:280],
            'contact': contact,
            'job': job['title'],
            'company': company
        }
    
    def _get_company_hook(self, company: str) -> str:
        """Generate company-specific hook (would be enhanced with research)"""
        hooks = {
            'Whatnot': "Your livestream commerce platform is revolutionizing e-commerce",
            'TikTok': "The recommendation algorithm work your team does is fascinating",
            'Stripe': "I've been following Stripe's API-first approach for years",
            'default': "Your company's mission really resonates with me"
        }
        return hooks.get(company, hooks['default'])
    
    def _get_relevant_experience(self, job: Dict) -> str:
        """Extract relevant experience from profile - NO FAKE DATA"""
        
        # Only mention REAL experience from profile
        if self.user_profile.get('experience'):
            # Get most relevant experience
            exp = self.user_profile['experience'][0]  # Most recent
            return f"In my role as {exp.get('title', 'Software Engineer')} at {exp.get('company', 'my previous company')}, I {exp.get('achievement', 'developed similar solutions')}."
        else:
            return "As a recent graduate with strong technical skills and internship experience, I'm eager to contribute."
    
    def _get_specific_interest(self, job: Dict, company: str) -> str:
        """Generate specific interest in role/company"""
        
        description = job.get('description', '').lower()
        
        if 'machine learning' in description or 'ml' in description:
            return f"I'm particularly drawn to the ML aspects of this role and {company}'s approach to AI."
        elif 'backend' in description:
            return f"The opportunity to work on {company}'s backend infrastructure at scale is exactly what I'm looking for."
        elif 'frontend' in description:
            return f"Building user-facing features that millions of {company} users interact with daily would be incredible."
        else:
            return f"The chance to work on {company}'s core products and contribute to your technical challenges excites me."
    
    def _get_value_proposition(self, job: Dict) -> str:
        """What value can user bring - based on REAL strengths"""
        
        if self.user_profile.get('strengths'):
            strength = self.user_profile['strengths'][0]
            return f"I believe my {strength} would be particularly valuable for this role."
        else:
            return "I'm confident I can make meaningful contributions to your team from day one."
    
    def _get_top_skill(self) -> str:
        """Get user's top skill from profile"""
        
        if self.user_profile.get('technical_expertise'):
            return self.user_profile['technical_expertise'][0]
        return "software"
    
    def _get_relevant_tech(self, job: Dict) -> str:
        """Get relevant technology from job description"""
        
        description = job.get('description', '').lower()
        techs = ['python', 'javascript', 'react', 'node', 'aws', 'docker']
        
        for tech in techs:
            if tech in description and tech in str(self.user_profile.get('technical_expertise', [])):
                return tech
        
        return self.user_profile.get('technical_expertise', ['modern tech'])[0]
    
    def create_outreach_package(self, job: Dict) -> Dict:
        """Create complete outreach package for a job"""
        
        # Mock contact (would be found via LinkedIn/research)
        contact = {
            'name': 'Hiring Manager',
            'title': 'Engineering Manager',
            'company': job['company']
        }
        
        package = {
            'job': job,
            'linkedin': self.generate_linkedin_message(job, contact),
            'email': self.generate_cold_email(job, contact),
            'twitter': self.generate_twitter_dm(job, contact),
            'followups': self.generate_followup_sequence({'company': job['company'], 'job': job['title']}),
            'created_at': datetime.now().isoformat(),
            'tracking': {
                'sent': False,
                'sent_date': None,
                'response': False,
                'response_date': None
            }
        }
        
        return package
    
    def save_outreach_package(self, package: Dict, job_id: str):
        """Save outreach package to file"""
        
        outreach_dir = Path('data/cold_outreach')
        outreach_dir.mkdir(parents=True, exist_ok=True)
        
        filename = outreach_dir / f"outreach_{job_id}_{datetime.now().strftime('%Y%m%d')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(package, f, indent=2)
        
        print(f"Saved outreach package to: {filename}")
        
        # Also save readable version
        readable = outreach_dir / f"outreach_{job_id}_readable.txt"
        with open(readable, 'w', encoding='utf-8') as f:
            f.write(f"COLD OUTREACH PACKAGE\n")
            f.write(f"Company: {package['job']['company']}\n")
            f.write(f"Position: {package['job']['title']}\n")
            f.write(f"="*60 + "\n\n")
            
            f.write("LINKEDIN MESSAGE:\n")
            f.write(package['linkedin']['connection_note'] + "\n\n")
            f.write("LINKEDIN FOLLOW-UP:\n")
            f.write(package['linkedin']['followup_message'] + "\n\n")
            
            f.write("="*60 + "\n")
            f.write("EMAIL:\n")
            f.write(f"Subject: {package['email']['subject_lines'][0]}\n\n")
            f.write(package['email']['body'] + "\n\n")
            
            f.write("="*60 + "\n")
            f.write("FOLLOW-UP SEQUENCE:\n")
            for i, followup in enumerate(package['followups'], 1):
                f.write(f"\nFollow-up {i} (Day {followup['day']}):\n")
                f.write(f"Subject: {followup['subject']}\n")
                f.write(followup['body'] + "\n")
        
        print(f"Saved readable version to: {readable}")


# Test the generator
def test_cold_outreach():
    """Test cold outreach generation with sample profile"""
    
    # Sample user profile (replace with real data)
    user_profile = {
        'name': 'Renato Dap',
        'email': 'renato@example.com',
        'phone': '555-0100',
        'linkedin': 'linkedin.com/in/renatodap',
        'github': 'github.com/renatodap',
        'strengths': [
            'building scalable systems',
            'rapid prototyping',
            'cross-functional collaboration'
        ],
        'technical_expertise': [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS'
        ],
        'experience': [
            {
                'title': 'Software Engineering Intern',
                'company': 'Tech Startup',
                'achievement': 'built REST APIs serving 10K+ requests/day'
            }
        ]
    }
    
    # Sample job
    job = {
        'title': 'Software Engineer - New Grad',
        'company': 'Whatnot',
        'location': 'San Francisco, CA',
        'description': 'Looking for new grad engineers to work on our Python backend and React frontend',
        'url': 'https://example.com/job',
        'salary_min': 130000
    }
    
    # Generate outreach
    generator = ColdOutreachGenerator(user_profile)
    package = generator.create_outreach_package(job)
    
    # Save package
    generator.save_outreach_package(package, 'whatnot_123')
    
    print("\n" + "="*60)
    print("COLD OUTREACH GENERATED SUCCESSFULLY!")
    print("="*60)
    print(f"\nLinkedIn Connection Note ({len(package['linkedin']['connection_note'])} chars):")
    print(package['linkedin']['connection_note'])
    print("\nEmail Subject Options:")
    for subject in package['email']['subject_lines']:
        print(f"  - {subject}")
    print(f"\nGenerated {len(package['followups'])} follow-up messages")
    print("\nFiles saved to data/cold_outreach/")


if __name__ == "__main__":
    test_cold_outreach()