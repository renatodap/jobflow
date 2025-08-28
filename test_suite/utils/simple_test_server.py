"""
Ultra-simple test server using only Python standard library
Run with: py simple_test_server.py
"""

import json
import http.server
import socketserver
import urllib.parse
from datetime import datetime
import webbrowser
import os
import sys

# Add core services to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'core', 'services'))

try:
    from advanced_ai_generator import AdvancedAIGenerator
    ADVANCED_AI_AVAILABLE = True
except ImportError:
    ADVANCED_AI_AVAILABLE = False
    print("WARNING: Advanced AI generator not available, using basic generation")

# Load Renato's profile
try:
    with open('profile.json', 'r') as f:
        RENATO_PROFILE = json.load(f)
    print("SUCCESS: Loaded Renato's profile successfully")
    
    # Initialize advanced AI generator
    if ADVANCED_AI_AVAILABLE and RENATO_PROFILE:
        AI_GENERATOR = AdvancedAIGenerator(RENATO_PROFILE)
        print("SUCCESS: Advanced AI generator initialized")
    else:
        AI_GENERATOR = None
        
except Exception as e:
    print(f"ERROR: Error loading profile.json: {e}")
    RENATO_PROFILE = None
    AI_GENERATOR = None

class JobFlowTestHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_POST(self):
        """Handle POST requests for job search"""
        
        if self.path == '/api/test-search':
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                request_data = json.loads(post_data)
                response_data = self.generate_mock_jobs(request_data)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                
                response_json = json.dumps(response_data, indent=2)
                self.wfile.write(response_json.encode('utf-8'))
                
            except Exception as e:
                self.send_error(500, f"Error processing request: {str(e)}")
                
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/test-env':
            response = {
                'status': 'OK (simple mode)',
                'profile_loaded': RENATO_PROFILE is not None,
                'mode': 'simple_server',
                'note': 'Using Python standard library only'
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
        else:
            # Serve static files
            super().do_GET()
    
    def generate_mock_jobs(self, request):
        """Generate mock job data using Renato's profile"""
        
        job_templates = [
            {
                "title": f"Software Engineer, New Grad 2026",
                "company": "Google",
                "location": request['location'] if not request.get('remoteOnly') else "Remote",
                "salary_range": f"${request['minSalary']:,} - ${request['minSalary'] + 50000:,}",
                "description": """Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information and one another. Our products need to handle information at massive scale, and extend well beyond web search. We're looking for engineers who bring fresh ideas from all areas including information retrieval, distributed computing, large-scale system design, networking and data storage, security, artificial intelligence, natural language processing, UI design and mobile; the list goes on and is growing every day.

As a software engineer, you will work on a specific project critical to Google's needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve. We need our engineers to be versatile, display leadership qualities and be enthusiastic to take on new problems across the full-stack as we continue to push technology forward.

Requirements: BS degree in Computer Science or related technical field. Programming experience in Python, Java, C++, or JavaScript. Experience with data structures and algorithms. Familiarity with software development practices including version control, testing, and code review.""",
                "score": 96,
                "url": "https://careers.google.com"
            },
            {
                "title": f"Software Engineer, AI Research - New Grad",
                "company": "OpenAI",
                "location": "San Francisco, CA",
                "salary_range": f"${request['minSalary'] + 20000:,} - ${request['minSalary'] + 70000:,}",
                "description": """We're looking for talented software engineers to join our AI research team. You'll work on foundational AI systems, safety research, and deployment of AI technologies. This role involves building large-scale machine learning infrastructure, developing novel AI architectures, and ensuring AI systems are safe and beneficial.

Key responsibilities include implementing and optimizing machine learning models, building distributed training systems, developing evaluation frameworks for AI safety, and collaborating with researchers to turn cutting-edge research into production systems.

Requirements: BS in Computer Science, Mathematics, or related field. Strong programming skills in Python and deep learning frameworks (PyTorch, TensorFlow). Experience with distributed computing, GPU programming (CUDA), machine learning fundamentals. Familiarity with reinforcement learning, natural language processing, or computer vision is a plus.""",
                "score": 94,
                "url": "https://openai.com/careers"
            },
            {
                "title": f"{request['jobTitle']} - Music Tech",
                "company": "Spotify",
                "location": "New York, NY",
                "salary_range": f"${request['minSalary'] + 10000:,} - ${request['minSalary'] + 60000:,}",
                "description": "Build the future of music technology at Spotify. Perfect for engineers with a passion for music and technology.",
                "score": 92,
                "url": "https://lifeatspotify.com"
            },
            {
                "title": f"Full Stack {request['jobTitle']}",
                "company": "Stripe",
                "location": "Remote",
                "salary_range": f"${request['minSalary'] + 15000:,} - ${request['minSalary'] + 65000:,}",
                "description": "Help build the economic infrastructure of the internet. Work with cutting-edge fintech at global scale.",
                "score": 90,
                "url": "https://stripe.com/jobs"
            },
            {
                "title": f"Computer Vision {request['jobTitle']}",
                "company": "Apple",
                "location": "Cupertino, CA",
                "salary_range": f"${request['minSalary'] + 25000:,} - ${request['minSalary'] + 75000:,}",
                "description": "Join Apple's computer vision team working on next-generation products. Your work will impact millions of users worldwide.",
                "score": 93,
                "url": "https://jobs.apple.com"
            }
        ]
        
        # Generate jobs with personalized content
        jobs = []
        for i, template in enumerate(job_templates[:request.get('maxResults', 5)]):
            
            # Use advanced AI generator if available
            if AI_GENERATOR:
                try:
                    resume_result = AI_GENERATOR.generate_optimized_resume(
                        template["description"], template["company"], template["title"]
                    )
                    cover_letter = AI_GENERATOR.generate_natural_cover_letter(
                        template["description"], template["company"], template["title"]
                    )
                    outreach = AI_GENERATOR.generate_compelling_outreach(
                        template["description"], template["company"], template["title"]
                    )
                    
                    job = {
                        "title": template["title"],
                        "company": template["company"],
                        "location": template["location"],
                        "salary": template["salary_range"],
                        "description": template["description"][:300] + "...",
                        "url": template["url"],
                        "score": template["score"],
                        "resume": resume_result["content"],
                        "coverLetter": cover_letter,
                        "coldOutreach": outreach,
                        "ats_score": resume_result.get("ats_compatibility_score", 0),
                        "keyword_match": resume_result.get("keyword_match_score", 0),
                        "matched_keywords": resume_result.get("matched_keywords", [])
                    }
                except Exception as e:
                    print(f"Error with advanced AI generation: {e}")
                    # Fallback to basic generation
                    job = self._generate_basic_job(template)
            else:
                job = self._generate_basic_job(template)
            
            jobs.append(job)
        
        # Learning paths
        learning_paths = [
            {
                "skill": "System Design for New Grads",
                "importance": "High",
                "resources": [
                    "Grokking System Design Interview",
                    "System Design Primer (GitHub)",
                    "Practice designing systems you've used"
                ],
                "timeline": "3 months before interviews"
            },
            {
                "skill": "Data Structures & Algorithms",
                "importance": "High",
                "resources": [
                    "LeetCode Premium (focus on new grad questions)",
                    "AlgoExpert or NeetCode",
                    "Daily practice - 2 problems minimum"
                ],
                "timeline": "4 months consistent practice"
            },
            {
                "skill": "Behavioral Interview Mastery",
                "importance": "Medium",
                "resources": [
                    "STAR method practice with your unique experiences",
                    "Prepare stories about tennis, music, AI projects",
                    "Mock interviews with career services"
                ],
                "timeline": "1 month intensive prep"
            }
        ]
        
        return {
            "jobs": jobs,
            "learningPaths": learning_paths,
            "stats": {
                "totalJobs": len(jobs),
                "resumesGenerated": len(jobs),
                "coverLetters": len(jobs),
                "coldOutreach": len(jobs)
            },
            "metadata": {
                "searchQuery": request['jobTitle'],
                "location": request['location'],
                "timestamp": datetime.now().isoformat(),
                "mode": "simple_server_mock_data",
                "profile": "Renato Dap - Rose-Hulman CS 2026"
            }
        }
    
    def _generate_basic_job(self, template):
        """Fallback basic job generation"""
        return {
            "title": template["title"],
            "company": template["company"],
            "location": template["location"],
            "salary": template["salary_range"],
            "description": template["description"][:300] + "...",
            "url": template["url"],
            "score": template["score"],
            "resume": self.generate_resume(template),
            "coverLetter": self.generate_cover_letter(template),
            "coldOutreach": self.generate_outreach(template),
            "ats_score": 85,
            "keyword_match": 70,
            "matched_keywords": ["Python", "JavaScript", "React"]
        }
    
    def generate_resume(self, job):
        """Generate resume using Renato's profile"""
        if not RENATO_PROFILE:
            return "Resume generation requires profile.json"
        
        p = RENATO_PROFILE
        return f"""RENATO DAP
{p['personal']['email']} | {p['personal']['phone']}
{p['personal']['linkedin']} | {p['personal']['github']}

OBJECTIVE
Seeking {job['title']} position at {job['company']} starting July 2026 after graduation.

EDUCATION
{p['education'][0]['degree']}
{p['education'][0]['school']} - Graduation: May 2026
GPA: {p['education'][0]['gpa']}
Relevant Coursework: Computer Vision, Machine Learning, Data Structures

TECHNICAL SKILLS
Languages: {', '.join(p['technical_skills']['languages'])}
Frameworks: {', '.join(p['technical_skills']['frameworks'][:4])}
AI/ML: {', '.join(p['technical_skills']['ai_ml'][:4])}
Cloud/Tools: {', '.join(p['technical_skills']['cloud'])}

KEY PROJECTS
FeelSharper - AI Fitness Platform
• {p['projects'][0]['highlights'][0]}
• {p['projects'][0]['highlights'][1]}
• Technologies: {', '.join(p['projects'][0]['technologies'][:5])}

JobFlow - AI Job Automation System  
• {p['projects'][1]['highlights'][0]}
• {p['projects'][1]['highlights'][1]}
• Technologies: {', '.join(p['projects'][1]['technologies'][:5])}

EXPERIENCE
{p['experience'][0]['title']} | {p['experience'][0]['company']}
{p['experience'][0]['duration']}
• {p['experience'][0]['achievements'][0]}
• {p['experience'][0]['achievements'][1]}

{p['experience'][1]['title']} | {p['experience'][1]['company']}
{p['experience'][1]['duration']}  
• {p['experience'][1]['achievements'][0]}
• {p['experience'][1]['achievements'][1]}

UNIQUE STRENGTHS
• {p['strengths'][0]}
• {p['strengths'][1]}
• {p['strengths'][2]}

AVAILABILITY: July 2026 | F-1 Visa (3 years OPT)"""
    
    def generate_cover_letter(self, job):
        """Generate cover letter using Renato's profile"""
        if not RENATO_PROFILE:
            return "Cover letter generation requires profile.json"
        
        p = RENATO_PROFILE
        return f"""Dear {job['company']} Hiring Team,

I am writing to express my strong interest in the {job['title']} position at {job['company']}. As a Computer Science student at Rose-Hulman graduating in May 2026, I am excited to bring my unique combination of technical skills and diverse experiences to your team.

What makes me a strong candidate:

Technical Innovation: I've built two significant AI projects from concept to working MVP:
• FeelSharper: {p['achievements'][0]['details']} 
• JobFlow: {p['achievements'][3]['details']}

Teaching & Leadership: As a Teaching Assistant at Rose-Hulman, I support 30+ students while developing automated solutions that reduced instructor workload by 60%.

Unique Background: My combination of {p['strengths'][0]}, {p['strengths'][1]}, and {p['strengths'][2]} brings a distinctive perspective to problem-solving.

International Experience: My investment banking internship in Brazil gave me business acumen and the ability to work across cultures and time zones.

I'm particularly drawn to {job['company']} because of your commitment to innovation and global impact. I believe my technical skills, creative problem-solving approach, and unique background would make me a valuable addition to your engineering team.

I would welcome the opportunity to discuss how I can contribute to {job['company']}'s continued success.

Best regards,
{p['personal']['name']}
{p['personal']['email']}
{p['personal']['phone']}
LinkedIn: {p['personal']['linkedin']}"""
    
    def generate_outreach(self, job):
        """Generate cold outreach using Renato's profile"""
        if not RENATO_PROFILE:
            return "Outreach generation requires profile.json"
        
        p = RENATO_PROFILE
        return f"""Hi [Hiring Manager],

I noticed {job['company']} is looking for a {job['title']}. As a Rose-Hulman CS student graduating in May 2026, I'd love to be considered for this role.

What makes me different:
• Built FeelSharper (AI fitness platform) and JobFlow (job automation) - shipped real products
• {p['cold_outreach']['unique_angles'][0]} - I bring discipline and competitive drive to engineering  
• {p['cold_outreach']['unique_angles'][1]} - creativity and pattern recognition skills
• {p['cold_outreach']['unique_angles'][2]} - global perspective and cross-cultural collaboration

I'd love to learn more about this role and share how my combination of technical skills and unique experiences could contribute to {job['company']}'s mission.

Would you be open to a brief conversation?

Best,
{p['personal']['name']}
{p['personal']['linkedin']}
GitHub: {p['personal']['github']}"""

def main():
    PORT = 8001
    
    print("\n" + "="*60)
    print("JobFlow Simple Test Server Starting...")
    print("="*60)
    print(f"\nProfile loaded: {RENATO_PROFILE['personal']['name'] if RENATO_PROFILE else 'Failed'}")
    print("\nInstructions:")
    print("1. Server will automatically open test_job_search.html")
    print("2. Click 'Search Jobs (Using Renato's Profile)'")
    print("3. All content uses your real profile information")
    print(f"\nServer running at: http://localhost:{PORT}")
    print("\nPress CTRL+C to stop")
    print("="*60 + "\n")
    
    # Start server
    with socketserver.TCPServer(("", PORT), JobFlowTestHandler) as httpd:
        # Try to open the HTML file automatically
        try:
            html_path = os.path.abspath("test_job_search.html")
            if os.path.exists(html_path):
                webbrowser.open(f"file:///{html_path}")
                print("OPENED: test_job_search.html in browser")
            else:
                print("WARNING: test_job_search.html not found - open it manually")
        except:
            print("WARNING: Could not auto-open browser - open test_job_search.html manually")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped. Goodbye!")

if __name__ == "__main__":
    main()