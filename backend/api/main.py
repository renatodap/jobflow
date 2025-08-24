"""
JobFlow SaaS API - Main FastAPI Application
Multi-user support with authentication, payments, and job automation
"""

from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.auth_service import AuthService
from services.profile_service import ProfileService
from services.job_service import JobService
from services.application_service import ApplicationService
from services.stripe_service import StripeService
from services.email_service import EmailService

# Initialize FastAPI app
app = FastAPI(
    title="JobFlow SaaS API",
    description="AI-powered job search automation platform",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jobflow.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
auth_service = AuthService()
security = HTTPBearer()

# Request/Response models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    location: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None

class ProfileDataRequest(BaseModel):
    strengths: Optional[List[str]] = None
    achievements: Optional[List[Dict]] = None
    technical_skills: Optional[Dict] = None
    education: Optional[List[Dict]] = None
    experience: Optional[List[Dict]] = None
    projects: Optional[List[Dict]] = None
    preferences: Optional[Dict] = None

class JobSearchRequest(BaseModel):
    queries: Optional[List[str]] = None
    location: Optional[str] = "San Francisco"
    max_results: Optional[int] = 20

class ApplicationGenerateRequest(BaseModel):
    job_id: str
    generate_resume: bool = True
    generate_cover_letter: bool = True
    generate_outreach: bool = False

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user data"""
    
    token = credentials.credentials
    is_valid, user_data = await auth_service.verify_token(token)
    
    if not is_valid or not user_data:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    # Check if user is approved
    if not user_data.get('approved', False):
        raise HTTPException(
            status_code=403, 
            detail="Account pending approval. Please wait for admin verification."
        )
    
    # Check subscription status
    if user_data.get('subscription_status') == 'expired':
        raise HTTPException(
            status_code=402,
            detail="Trial expired. Please subscribe to continue."
        )
    
    return user_data

# Health check
@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "JobFlow SaaS API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# Authentication endpoints
@app.post("/auth/signup")
async def signup(request: SignupRequest, background_tasks: BackgroundTasks):
    """Register a new user account"""
    
    success, response = await auth_service.signup(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        phone=request.phone,
        location=request.location
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=response.get('error', 'Signup failed'))
    
    # Send welcome email in background
    background_tasks.add_task(
        EmailService.send_welcome_email,
        request.email,
        request.full_name
    )
    
    return response

@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login with email and password"""
    
    success, response = await auth_service.login(
        email=request.email,
        password=request.password
    )
    
    if not success:
        raise HTTPException(status_code=401, detail=response.get('error', 'Login failed'))
    
    return response

@app.post("/auth/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Logout and invalidate token"""
    
    # Token is already validated by dependency
    return {"message": "Logged out successfully"}

@app.post("/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    
    success, response = await auth_service.refresh_token(refresh_token)
    
    if not success:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    return response

@app.post("/auth/reset-password")
async def reset_password(email: EmailStr):
    """Request password reset email"""
    
    success = await auth_service.reset_password_request(email)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to send reset email")
    
    return {"message": "Password reset email sent"}

# Profile endpoints
@app.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    
    profile_service = ProfileService(user['id'])
    profile = await profile_service.get_profile()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile

@app.patch("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    user: dict = Depends(get_current_user)
):
    """Update user profile"""
    
    profile_service = ProfileService(user['id'])
    success = await profile_service.update_profile(request.dict(exclude_none=True))
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    
    return {"message": "Profile updated successfully"}

@app.get("/profile/data")
async def get_profile_data(user: dict = Depends(get_current_user)):
    """Get user's detailed profile data"""
    
    profile_service = ProfileService(user['id'])
    data = await profile_service.get_profile_data()
    
    if not data:
        raise HTTPException(status_code=404, detail="Profile data not found")
    
    return data

@app.put("/profile/data")
async def update_profile_data(
    request: ProfileDataRequest,
    user: dict = Depends(get_current_user)
):
    """Update detailed profile data"""
    
    profile_service = ProfileService(user['id'])
    
    # Validate for fake data
    validation = await profile_service.validate_profile_data(request.dict(exclude_none=True))
    
    if not validation['is_valid']:
        raise HTTPException(
            status_code=400,
            detail=f"Fake data detected: {validation['errors']}"
        )
    
    success = await profile_service.update_profile_data(request.dict(exclude_none=True))
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update profile data")
    
    return {"message": "Profile data updated successfully"}

# Job search endpoints
@app.post("/jobs/search")
async def search_jobs(
    request: JobSearchRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Search for jobs based on user profile"""
    
    # Check search limit for trial users
    if user['subscription_status'] == 'trial':
        remaining = user.get('searches_remaining', 0)
        if remaining <= 0:
            raise HTTPException(
                status_code=402,
                detail="Trial search limit reached. Please subscribe to continue."
            )
    
    job_service = JobService(user['id'])
    
    # Use profile-based queries if not provided
    if not request.queries:
        profile_service = ProfileService(user['id'])
        profile_data = await profile_service.get_profile_data()
        request.queries = job_service.generate_search_queries(profile_data)
    
    # Search for jobs
    jobs = await job_service.search_jobs(
        queries=request.queries,
        location=request.location,
        max_results=request.max_results
    )
    
    # Track API usage in background
    background_tasks.add_task(
        job_service.track_search_usage,
        user['id'],
        len(request.queries),
        len(jobs)
    )
    
    return {
        "total_found": len(jobs),
        "high_score": len([j for j in jobs if j['score'] >= 80]),
        "jobs": jobs
    }

@app.get("/jobs")
async def get_jobs(
    skip: int = 0,
    limit: int = 20,
    min_score: Optional[int] = None,
    applied: Optional[bool] = None,
    user: dict = Depends(get_current_user)
):
    """Get user's saved jobs"""
    
    job_service = JobService(user['id'])
    jobs = await job_service.get_user_jobs(
        skip=skip,
        limit=limit,
        min_score=min_score,
        applied=applied
    )
    
    return jobs

@app.get("/jobs/{job_id}")
async def get_job(job_id: str, user: dict = Depends(get_current_user)):
    """Get specific job details"""
    
    job_service = JobService(user['id'])
    job = await job_service.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

# Application generation endpoints
@app.post("/applications/generate")
async def generate_application(
    request: ApplicationGenerateRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Generate application materials for a job"""
    
    app_service = ApplicationService(user['id'])
    
    # Get job details
    job_service = JobService(user['id'])
    job = await job_service.get_job(request.job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Generate materials
    materials = await app_service.generate_application_materials(
        job=job,
        generate_resume=request.generate_resume,
        generate_cover_letter=request.generate_cover_letter,
        generate_outreach=request.generate_outreach
    )
    
    # Track usage in background
    background_tasks.add_task(
        app_service.track_generation_usage,
        user['id'],
        request.job_id
    )
    
    return materials

@app.get("/applications")
async def get_applications(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get user's applications"""
    
    app_service = ApplicationService(user['id'])
    applications = await app_service.get_applications(status=status)
    
    return applications

@app.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: str,
    user: dict = Depends(get_current_user)
):
    """Update application status"""
    
    valid_statuses = ['draft', 'ready', 'applied', 'interviewing', 'rejected', 'accepted']
    
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    app_service = ApplicationService(user['id'])
    success = await app_service.update_status(application_id, status)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update status")
    
    return {"message": "Status updated successfully"}

# Subscription endpoints
@app.post("/subscription/create-checkout")
async def create_checkout_session(user: dict = Depends(get_current_user)):
    """Create Stripe checkout session for subscription"""
    
    stripe_service = StripeService()
    session = await stripe_service.create_checkout_session(
        user_id=user['id'],
        email=user['email']
    )
    
    if not session:
        raise HTTPException(status_code=400, detail="Failed to create checkout session")
    
    return {"checkout_url": session.url}

@app.post("/subscription/webhook")
async def stripe_webhook(
    request: dict,
    stripe_signature: str = Header(None)
):
    """Handle Stripe webhook events"""
    
    stripe_service = StripeService()
    success = await stripe_service.handle_webhook(
        payload=request,
        signature=stripe_signature
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Webhook processing failed")
    
    return {"status": "success"}

@app.get("/subscription/status")
async def get_subscription_status(user: dict = Depends(get_current_user)):
    """Get user's subscription status"""
    
    return {
        "status": user.get('subscription_status', 'unknown'),
        "searches_remaining": user.get('searches_remaining', 0),
        "trial_ends_at": user.get('trial_ends_at')
    }

# Admin endpoints
@app.get("/admin/pending-approvals")
async def get_pending_approvals(user: dict = Depends(get_current_user)):
    """Get users pending approval (admin only)"""
    
    # Check if user is admin (you'd implement proper admin check)
    if user['email'] not in ['admin@jobflow.ai', 'renatodapapplications@gmail.com']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pending = await auth_service.get_pending_approvals()
    
    return pending

@app.post("/admin/approve-user/{user_id}")
async def approve_user(
    user_id: str,
    user: dict = Depends(get_current_user)
):
    """Approve a user account (admin only)"""
    
    # Check if user is admin
    if user['email'] not in ['admin@jobflow.ai', 'renatodapapplications@gmail.com']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = await auth_service.approve_user(user_id, user['id'])
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to approve user")
    
    return {"message": "User approved successfully"}

# Daily automation endpoint
@app.post("/automation/daily-search")
async def run_daily_search(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Run daily automated job search"""
    
    # Only for active subscribers
    if user['subscription_status'] != 'active':
        raise HTTPException(
            status_code=402,
            detail="Daily automation requires active subscription"
        )
    
    job_service = JobService(user['id'])
    
    # Run search in background
    background_tasks.add_task(
        job_service.run_daily_automation,
        user['id'],
        user['email']
    )
    
    return {"message": "Daily search started. You'll receive an email when complete."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)