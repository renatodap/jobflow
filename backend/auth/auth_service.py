"""
Authentication Service for JobFlow SaaS
Handles user registration, login, and session management with Supabase
"""

import os
import json
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import httpx
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    """Manages authentication with Supabase"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase credentials not configured")
        
        self.auth_url = f"{self.supabase_url}/auth/v1"
        self.api_url = f"{self.supabase_url}/rest/v1"
        
    async def signup(
        self, 
        email: str, 
        password: str, 
        full_name: str,
        phone: Optional[str] = None,
        location: Optional[str] = None
    ) -> Tuple[bool, Dict]:
        """
        Register a new user with email and password
        Returns (success, response_data)
        """
        
        async with httpx.AsyncClient() as client:
            # 1. Create auth user
            auth_response = await client.post(
                f"{self.auth_url}/signup",
                json={
                    "email": email,
                    "password": password,
                    "data": {
                        "full_name": full_name,
                        "phone": phone,
                        "location": location
                    }
                },
                headers={
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
            )
            
            if auth_response.status_code != 200:
                return False, {
                    "error": "Failed to create account",
                    "details": auth_response.json()
                }
            
            auth_data = auth_response.json()
            user_id = auth_data['user']['id']
            
            # 2. Create profile record
            profile_response = await client.post(
                f"{self.api_url}/profiles",
                json={
                    "id": user_id,
                    "email": email,
                    "full_name": full_name,
                    "phone": phone,
                    "location": location,
                    "subscription_status": "trial",
                    "trial_ends_at": (datetime.now() + timedelta(days=3)).isoformat(),
                    "searches_remaining": 5,
                    "approved": False  # Require admin approval
                },
                headers={
                    "apikey": self.supabase_service_key,
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.supabase_service_key}"
                }
            )
            
            if profile_response.status_code not in [200, 201]:
                # Rollback auth user if profile creation fails
                await self._delete_auth_user(user_id)
                return False, {
                    "error": "Failed to create profile",
                    "details": profile_response.json()
                }
            
            # 3. Create empty profile_data record
            await client.post(
                f"{self.api_url}/profile_data",
                json={
                    "user_id": user_id,
                    "strengths": [],
                    "achievements": [],
                    "technical_skills": {},
                    "education": [],
                    "experience": [],
                    "projects": []
                },
                headers={
                    "apikey": self.supabase_service_key,
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.supabase_service_key}"
                }
            )
            
            return True, {
                "user_id": user_id,
                "email": email,
                "message": "Account created successfully. Please check your email to verify.",
                "trial_ends_at": (datetime.now() + timedelta(days=3)).isoformat(),
                "searches_remaining": 5
            }
    
    async def login(self, email: str, password: str) -> Tuple[bool, Dict]:
        """
        Authenticate user with email and password
        Returns (success, response_data)
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                json={
                    "email": email,
                    "password": password,
                    "grant_type": "password"
                },
                headers={
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                return False, {
                    "error": "Invalid credentials",
                    "details": response.json()
                }
            
            data = response.json()
            user_id = data['user']['id']
            
            # Check subscription status
            profile = await self._get_profile(user_id)
            
            if not profile:
                return False, {"error": "Profile not found"}
            
            # Check if approved
            if not profile.get('approved'):
                return False, {
                    "error": "Account pending approval",
                    "message": "Your account is being reviewed. You'll receive an email once approved."
                }
            
            # Check trial status
            subscription_status = await self._check_subscription_status(user_id)
            
            return True, {
                "access_token": data['access_token'],
                "refresh_token": data['refresh_token'],
                "user": {
                    "id": user_id,
                    "email": data['user']['email'],
                    "subscription_status": subscription_status,
                    "searches_remaining": profile.get('searches_remaining', 0)
                }
            }
    
    async def logout(self, access_token: str) -> bool:
        """Logout user and invalidate token"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/logout",
                headers={
                    "apikey": self.supabase_anon_key,
                    "Authorization": f"Bearer {access_token}"
                }
            )
            
            return response.status_code == 204
    
    async def verify_token(self, access_token: str) -> Tuple[bool, Optional[Dict]]:
        """
        Verify JWT token and return user data
        Returns (is_valid, user_data)
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.auth_url}/user",
                headers={
                    "apikey": self.supabase_anon_key,
                    "Authorization": f"Bearer {access_token}"
                }
            )
            
            if response.status_code != 200:
                return False, None
            
            user_data = response.json()
            
            # Get additional profile data
            profile = await self._get_profile(user_data['id'])
            
            if profile:
                user_data['subscription_status'] = profile.get('subscription_status')
                user_data['searches_remaining'] = profile.get('searches_remaining')
                user_data['approved'] = profile.get('approved')
            
            return True, user_data
    
    async def refresh_token(self, refresh_token: str) -> Tuple[bool, Optional[Dict]]:
        """Refresh access token using refresh token"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token",
                json={
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                },
                headers={
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                return False, None
            
            return True, response.json()
    
    async def reset_password_request(self, email: str) -> bool:
        """Send password reset email"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/recover",
                json={"email": email},
                headers={
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code == 200
    
    async def update_password(self, access_token: str, new_password: str) -> bool:
        """Update user password (requires valid token)"""
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.auth_url}/user",
                json={"password": new_password},
                headers={
                    "apikey": self.supabase_anon_key,
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code == 200
    
    async def _get_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile from database"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/profiles",
                params={"id": f"eq.{user_id}"},
                headers={
                    "apikey": self.supabase_service_key,
                    "Authorization": f"Bearer {self.supabase_service_key}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
            
            return None
    
    async def _check_subscription_status(self, user_id: str) -> str:
        """Check and update subscription status"""
        
        profile = await self._get_profile(user_id)
        
        if not profile:
            return "unknown"
        
        status = profile.get('subscription_status', 'trial')
        trial_ends = profile.get('trial_ends_at')
        
        # Check if trial expired
        if status == 'trial' and trial_ends:
            trial_end_date = datetime.fromisoformat(trial_ends.replace('Z', '+00:00'))
            if trial_end_date < datetime.now(trial_end_date.tzinfo):
                # Update status to expired
                await self._update_subscription_status(user_id, 'expired')
                return 'expired'
        
        return status
    
    async def _update_subscription_status(self, user_id: str, status: str):
        """Update user subscription status"""
        
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.api_url}/profiles",
                params={"id": f"eq.{user_id}"},
                json={"subscription_status": status},
                headers={
                    "apikey": self.supabase_service_key,
                    "Authorization": f"Bearer {self.supabase_service_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def _delete_auth_user(self, user_id: str):
        """Delete auth user (for rollback)"""
        
        async with httpx.AsyncClient() as client:
            await client.delete(
                f"{self.auth_url}/admin/users/{user_id}",
                headers={
                    "apikey": self.supabase_service_key,
                    "Authorization": f"Bearer {self.supabase_service_key}"
                }
            )
    
    async def approve_user(self, user_id: str, admin_id: str) -> bool:
        """Approve user account (admin only)"""
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.api_url}/profiles",
                params={"id": f"eq.{user_id}"},
                json={
                    "approved": True,
                    "approved_at": datetime.now().isoformat(),
                    "approved_by": admin_id
                },
                headers={
                    "apikey": self.supabase_service_key,
                    "Authorization": f"Bearer {self.supabase_service_key}",
                    "Content-Type": "application/json"
                }
            )
            
            return response.status_code in [200, 204]
    
    async def get_pending_approvals(self) -> list:
        """Get list of users pending approval"""
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/profiles",
                params={
                    "approved": "eq.false",
                    "order": "created_at.desc"
                },
                headers={
                    "apikey": self.supabase_service_key,
                    "Authorization": f"Bearer {self.supabase_service_key}"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            
            return []