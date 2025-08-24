"""
Mobile App API Endpoints for JobFlow
Optimized for React Native applications
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
from ..auth.auth_service import AuthService, get_current_user
from ..services.job_search_service import JobSearchService
from ..services.ai_service import AIService
from ..services.notification_service import NotificationService

router = APIRouter(prefix="/api/mobile", tags=["mobile"])

# Initialize services
auth_service = AuthService()
job_service = JobSearchService()
ai_service = AIService()
notification_service = NotificationService()

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get mobile dashboard summary - optimized for mobile screens
    """
    
    user_id = current_user['id']
    
    # Get key metrics for mobile dashboard
    today = datetime.now().date()
    week_ago = today - timedelta(days=7)
    
    summary = {
        'user': {
            'name': current_user.get('full_name', 'User'),
            'subscription_status': current_user.get('subscription_status', 'trial'),
            'searches_remaining': current_user.get('searches_remaining', 0),
            'profile_completion': await calculate_profile_completion(user_id)
        },
        'stats': {
            'jobs_found_today': await job_service.count_jobs_today(user_id),
            'applications_this_week': await count_applications_this_week(user_id),
            'interviews_scheduled': await count_interviews_scheduled(user_id),
            'response_rate': await calculate_response_rate(user_id)
        },
        'quick_actions': [
            {
                'id': 'search_jobs',
                'title': 'Find New Jobs',
                'icon': 'search',
                'color': '#3B82F6',
                'enabled': current_user.get('searches_remaining', 0) > 0
            },
            {
                'id': 'generate_materials',
                'title': 'Generate Materials',
                'icon': 'document',
                'color': '#10B981',
                'enabled': True
            },
            {
                'id': 'track_applications',
                'title': 'Track Applications',
                'icon': 'chart',
                'color': '#F59E0B',
                'enabled': True
            }
        ],
        'recent_jobs': await get_recent_jobs_mobile(user_id, limit=5),
        'notifications': await get_unread_notifications(user_id, limit=3)
    }
    
    return summary

@router.get("/jobs/mobile")
async def get_jobs_mobile(
    current_user: Dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    filters: Optional[str] = Query(None)
):
    """
    Get jobs optimized for mobile display
    """
    
    user_id = current_user['id']
    
    # Parse mobile filters
    filter_dict = {}
    if filters:
        try:
            filter_dict = json.loads(filters)
        except json.JSONDecodeError:
            pass
    
    # Get jobs with mobile-optimized fields
    jobs = await job_service.get_jobs_mobile(
        user_id=user_id,
        page=page,
        limit=limit,
        filters=filter_dict
    )
    
    # Format for mobile consumption
    mobile_jobs = []
    for job in jobs:
        mobile_job = {
            'id': job['id'],
            'title': job['title'],
            'company': job['company'],
            'location': job['location'],
            'salary_range': job.get('salary_range', 'Not specified'),
            'job_type': job.get('job_type', 'Full-time'),
            'score': job['score'],
            'posted_date': job['posted_date'],
            'applied': job.get('applied', False),
            'application_status': job.get('application_status'),
            'logo_url': job.get('company_logo'),
            'tags': job.get('skills', [])[:3],  # Limit tags for mobile
            'is_remote': 'remote' in job.get('location', '').lower(),
            'urgency': 'high' if job['score'] >= 85 else 'medium' if job['score'] >= 70 else 'low'
        }
        mobile_jobs.append(mobile_job)
    
    return {
        'jobs': mobile_jobs,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': await job_service.count_jobs(user_id, filter_dict),
            'has_more': len(mobile_jobs) == limit
        }
    }

@router.post("/jobs/{job_id}/generate-kit")
async def generate_application_kit_mobile(
    job_id: str,
    current_user: Dict = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Generate complete application kit for mobile
    Returns kit ID for status tracking
    """
    
    user_id = current_user['id']
    
    # Validate job exists and belongs to user
    job = await job_service.get_job_by_id(job_id, user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Start generation process in background
    kit_id = f"kit_{job_id}_{int(datetime.now().timestamp())}"
    
    background_tasks.add_task(
        generate_application_kit_background,
        kit_id=kit_id,
        job=job,
        user_id=user_id
    )
    
    return {
        'kit_id': kit_id,
        'status': 'generating',
        'estimated_time': 30,  # seconds
        'job_title': job['title'],
        'company': job['company']
    }

@router.get("/application-kit/{kit_id}/status")
async def get_kit_status(
    kit_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Check application kit generation status
    """
    
    # Check kit status in cache/database
    status = await get_kit_generation_status(kit_id, current_user['id'])
    
    if not status:
        raise HTTPException(status_code=404, detail="Kit not found")
    
    return status

@router.get("/application-kit/{kit_id}")
async def get_application_kit(
    kit_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get completed application kit
    """
    
    kit = await get_completed_kit(kit_id, current_user['id'])
    
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found or not ready")
    
    return {
        'kit_id': kit_id,
        'job': kit['job'],
        'materials': {
            'resume': {
                'content': kit['resume'],
                'format': 'text',
                'ats_score': kit.get('ats_score', 95)
            },
            'cover_letter': {
                'content': kit['cover_letter'],
                'format': 'text',
                'personalization_score': kit.get('personalization_score', 90)
            },
            'linkedin_message': {
                'content': kit['linkedin_message'],
                'format': 'text',
                'character_count': len(kit['linkedin_message'])
            }
        },
        'checklist': [
            {'task': 'Review resume for accuracy', 'completed': False},
            {'task': 'Customize cover letter greeting', 'completed': False},
            {'task': 'Find hiring manager on LinkedIn', 'completed': False},
            {'task': 'Submit application', 'completed': False},
            {'task': 'Send LinkedIn message', 'completed': False},
            {'task': 'Set follow-up reminder', 'completed': False}
        ],
        'tips': [
            'Apply within 24-48 hours of job posting for best visibility',
            'Follow up with hiring manager 5-7 days after applying',
            'Customize the first paragraph of your cover letter'
        ]
    }

@router.post("/applications/{job_id}/track")
async def track_application_mobile(
    job_id: str,
    application_data: Dict,
    current_user: Dict = Depends(get_current_user)
):
    """
    Track job application submission from mobile
    """
    
    user_id = current_user['id']
    
    # Record application in database
    application_record = {
        'job_id': job_id,
        'user_id': user_id,
        'applied_date': datetime.now(),
        'application_method': application_data.get('method', 'company_website'),
        'status': 'applied',
        'notes': application_data.get('notes', ''),
        'materials_used': application_data.get('materials_used', [])
    }
    
    await job_service.track_application(application_record)
    
    # Send confirmation notification
    await notification_service.send_application_confirmation(
        user_id=user_id,
        job_title=application_data.get('job_title'),
        company=application_data.get('company')
    )
    
    return {
        'success': True,
        'application_id': application_record.get('id'),
        'next_steps': [
            'Follow up in 1 week if no response',
            'Connect with hiring manager on LinkedIn',
            'Prepare for potential screening call'
        ],
        'tracking_enabled': True
    }

@router.get("/applications/pipeline")
async def get_application_pipeline_mobile(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get application pipeline optimized for mobile Kanban view
    """
    
    user_id = current_user['id']
    
    pipeline = await job_service.get_application_pipeline(user_id)
    
    # Format for mobile Kanban board
    mobile_pipeline = {
        'applied': {
            'title': 'Applied',
            'count': len(pipeline.get('applied', [])),
            'color': '#3B82F6',
            'applications': [format_app_for_mobile(app) for app in pipeline.get('applied', [])]
        },
        'screening': {
            'title': 'Screening',
            'count': len(pipeline.get('screening', [])),
            'color': '#F59E0B',
            'applications': [format_app_for_mobile(app) for app in pipeline.get('screening', [])]
        },
        'interview': {
            'title': 'Interview',
            'count': len(pipeline.get('interview', [])),
            'color': '#10B981',
            'applications': [format_app_for_mobile(app) for app in pipeline.get('interview', [])]
        },
        'offer': {
            'title': 'Offer',
            'count': len(pipeline.get('offer', [])),
            'color': '#8B5CF6',
            'applications': [format_app_for_mobile(app) for app in pipeline.get('offer', [])]
        }
    }
    
    return mobile_pipeline

@router.get("/notifications/mobile")
async def get_mobile_notifications(
    current_user: Dict = Depends(get_current_user),
    limit: int = Query(20, le=50)
):
    """
    Get notifications optimized for mobile
    """
    
    user_id = current_user['id']
    
    notifications = await notification_service.get_user_notifications(
        user_id=user_id,
        limit=limit
    )
    
    # Format for mobile consumption
    mobile_notifications = []
    for notif in notifications:
        mobile_notif = {
            'id': notif['id'],
            'title': notif['title'],
            'message': notif['message'],
            'type': notif['type'],  # job_match, application_update, interview_reminder
            'timestamp': notif['created_at'],
            'read': notif.get('read', False),
            'action': notif.get('action_data'),  # For deep linking
            'priority': notif.get('priority', 'normal'),
            'icon': get_notification_icon(notif['type'])
        }
        mobile_notifications.append(mobile_notif)
    
    return {
        'notifications': mobile_notifications,
        'unread_count': sum(1 for n in mobile_notifications if not n['read'])
    }

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Mark notification as read
    """
    
    await notification_service.mark_as_read(
        notification_id=notification_id,
        user_id=current_user['id']
    )
    
    return {'success': True}

@router.get("/settings/mobile")
async def get_mobile_settings(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get user settings optimized for mobile interface
    """
    
    user_id = current_user['id']
    settings = await auth_service.get_user_settings(user_id)
    
    mobile_settings = {
        'profile': {
            'name': current_user.get('full_name'),
            'email': current_user.get('email'),
            'phone': current_user.get('phone'),
            'location': current_user.get('location'),
            'avatar_url': current_user.get('avatar_url')
        },
        'preferences': {
            'job_types': settings.get('preferred_job_types', []),
            'salary_range': settings.get('salary_range', {}),
            'remote_only': settings.get('remote_only', False),
            'locations': settings.get('preferred_locations', [])
        },
        'notifications': {
            'email_alerts': settings.get('email_alerts', True),
            'push_notifications': settings.get('push_notifications', True),
            'daily_digest': settings.get('daily_digest', True),
            'interview_reminders': settings.get('interview_reminders', True)
        },
        'subscription': {
            'plan': current_user.get('subscription_status', 'trial'),
            'searches_remaining': current_user.get('searches_remaining', 0),
            'renewal_date': current_user.get('subscription_end_date'),
            'can_upgrade': current_user.get('subscription_status') != 'active'
        }
    }
    
    return mobile_settings

# Helper functions
async def calculate_profile_completion(user_id: str) -> int:
    """Calculate profile completion percentage"""
    # Implementation for profile completion calculation
    return 85  # Placeholder

async def count_applications_this_week(user_id: str) -> int:
    """Count applications in the last 7 days"""
    # Implementation for counting applications
    return 12  # Placeholder

async def count_interviews_scheduled(user_id: str) -> int:
    """Count upcoming interviews"""
    # Implementation for counting interviews
    return 3  # Placeholder

async def calculate_response_rate(user_id: str) -> float:
    """Calculate application response rate"""
    # Implementation for response rate calculation
    return 15.5  # Placeholder

async def get_recent_jobs_mobile(user_id: str, limit: int) -> List[Dict]:
    """Get recent jobs formatted for mobile"""
    # Implementation for recent jobs
    return []  # Placeholder

async def get_unread_notifications(user_id: str, limit: int) -> List[Dict]:
    """Get unread notifications"""
    # Implementation for notifications
    return []  # Placeholder

async def generate_application_kit_background(kit_id: str, job: Dict, user_id: str):
    """Background task for generating application kit"""
    # Implementation for kit generation
    pass

async def get_kit_generation_status(kit_id: str, user_id: str) -> Optional[Dict]:
    """Get kit generation status"""
    # Implementation for status checking
    return None

async def get_completed_kit(kit_id: str, user_id: str) -> Optional[Dict]:
    """Get completed application kit"""
    # Implementation for getting completed kit
    return None

def format_app_for_mobile(app: Dict) -> Dict:
    """Format application for mobile Kanban display"""
    return {
        'id': app['id'],
        'company': app['company'],
        'title': app['job_title'],
        'applied_date': app['applied_date'],
        'status': app['status'],
        'logo_url': app.get('company_logo'),
        'days_since_applied': (datetime.now() - app['applied_date']).days
    }

def get_notification_icon(notification_type: str) -> str:
    """Get icon for notification type"""
    icons = {
        'job_match': 'briefcase',
        'application_update': 'mail',
        'interview_reminder': 'calendar',
        'system': 'bell'
    }
    return icons.get(notification_type, 'bell')