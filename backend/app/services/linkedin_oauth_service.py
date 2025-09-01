from typing import Optional, Dict, Any
import httpx
import json
from urllib.parse import urlencode
import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..config import settings
from ..models.consultant import Consultant, ConsultantStatus, KYCStatus


class LinkedInOAuthService:
    def __init__(self, db: Session):
        self.db = db
        self.client_id = settings.linkedin_client_id
        self.client_secret = settings.linkedin_client_secret
        self.redirect_uri = settings.linkedin_redirect_uri
        self.scope = "r_liteprofile r_emailaddress"
        
        # LinkedIn API endpoints
        self.auth_url = "https://www.linkedin.com/oauth/v2/authorization"
        self.token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        self.profile_url = "https://api.linkedin.com/v2/people/~"
        self.email_url = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))"

    def generate_auth_url(self, state: Optional[str] = None) -> Dict[str, str]:
        """Generate LinkedIn OAuth authorization URL"""
        
        if not self.client_id:
            raise ValueError("LinkedIn OAuth not configured - missing CLIENT_ID")
        
        if not state:
            state = secrets.token_urlsafe(32)
        
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': self.scope,
            'state': state
        }
        
        auth_url = f"{self.auth_url}?{urlencode(params)}"
        
        return {
            'auth_url': auth_url,
            'state': state
        }

    async def exchange_code_for_token(self, code: str, state: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        
        if not self.client_id or not self.client_secret:
            return {
                'error': 'LinkedIn OAuth not configured',
                'success': False
            }
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.token_url,
                    data=data,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
                
                if response.status_code != 200:
                    return {
                        'error': f'Token exchange failed: {response.text}',
                        'success': False
                    }
                
                token_data = response.json()
                
                return {
                    'access_token': token_data.get('access_token'),
                    'expires_in': token_data.get('expires_in'),
                    'success': True
                }
                
        except Exception as e:
            return {
                'error': f'Token exchange error: {str(e)}',
                'success': False
            }

    async def get_linkedin_profile(self, access_token: str) -> Dict[str, Any]:
        """Get LinkedIn profile data using access token"""
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                # Get profile information
                profile_response = await client.get(
                    f"{self.profile_url}?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,location,industry)",
                    headers=headers
                )
                
                if profile_response.status_code != 200:
                    return {
                        'error': f'Profile fetch failed: {profile_response.text}',
                        'success': False
                    }
                
                # Get email information
                email_response = await client.get(
                    self.email_url,
                    headers=headers
                )
                
                if email_response.status_code != 200:
                    return {
                        'error': f'Email fetch failed: {email_response.text}',
                        'success': False
                    }
                
                profile_data = profile_response.json()
                email_data = email_response.json()
                
                # Extract email
                email = None
                if email_data.get('elements'):
                    email = email_data['elements'][0]['handle~']['emailAddress']
                
                # Extract profile picture
                profile_picture = None
                if profile_data.get('profilePicture') and profile_data['profilePicture'].get('displayImage~'):
                    elements = profile_data['profilePicture']['displayImage~'].get('elements', [])
                    if elements:
                        # Get the largest image
                        largest = max(elements, key=lambda x: x.get('data', {}).get('com.linkedin.digitalmedia.mediaartifact.StillImage', {}).get('storageSize', 0))
                        profile_picture = largest.get('identifiers', [{}])[0].get('identifier')
                
                return {
                    'success': True,
                    'profile_data': {
                        'linkedin_id': profile_data.get('id'),
                        'email': email,
                        'first_name': profile_data.get('firstName', {}).get('localized', {}).get('en_US', ''),
                        'last_name': profile_data.get('lastName', {}).get('localized', {}).get('en_US', ''),
                        'headline': profile_data.get('headline', {}).get('localized', {}).get('en_US', ''),
                        'location': profile_data.get('location', {}).get('country', {}).get('localized', {}).get('en_US', ''),
                        'industry': profile_data.get('industry'),
                        'profile_picture_url': profile_picture,
                        'raw_data': profile_data
                    }
                }
                
        except Exception as e:
            return {
                'error': f'Profile fetch error: {str(e)}',
                'success': False
            }

    async def create_or_update_consultant(
        self,
        linkedin_profile: Dict[str, Any],
        linkedin_url: str
    ) -> Dict[str, Any]:
        """Create or update consultant from LinkedIn profile data"""
        
        try:
            profile_data = linkedin_profile['profile_data']
            
            # Check if consultant already exists
            existing_consultant = self.db.query(Consultant).filter(
                Consultant.linkedin_id == profile_data['linkedin_id']
            ).first()
            
            if existing_consultant:
                # Update existing consultant
                existing_consultant.email = profile_data['email']
                existing_consultant.first_name = profile_data['first_name']
                existing_consultant.last_name = profile_data['last_name']
                existing_consultant.headline = profile_data['headline']
                existing_consultant.location = profile_data['location']
                existing_consultant.industry = profile_data['industry']
                existing_consultant.profile_picture_url = profile_data['profile_picture_url']
                existing_consultant.linkedin_data = profile_data['raw_data']
                existing_consultant.updated_at = datetime.utcnow()
                
                self.db.commit()
                
                return {
                    'success': True,
                    'consultant_id': existing_consultant.id,
                    'is_new': False,
                    'message': 'Consultant profile updated'
                }
            
            else:
                # Create new consultant
                new_consultant = Consultant(
                    linkedin_url=linkedin_url,
                    linkedin_id=profile_data['linkedin_id'],
                    linkedin_data=profile_data['raw_data'],
                    email=profile_data['email'],
                    first_name=profile_data['first_name'],
                    last_name=profile_data['last_name'],
                    profile_picture_url=profile_data['profile_picture_url'],
                    headline=profile_data['headline'],
                    location=profile_data['location'],
                    industry=profile_data['industry'],
                    status=ConsultantStatus.PENDING,
                    kyc_status=KYCStatus.NOT_STARTED
                )
                
                self.db.add(new_consultant)
                self.db.commit()
                self.db.refresh(new_consultant)
                
                return {
                    'success': True,
                    'consultant_id': new_consultant.id,
                    'is_new': True,
                    'message': 'New consultant profile created'
                }
                
        except Exception as e:
            self.db.rollback()
            return {
                'error': f'Consultant creation error: {str(e)}',
                'success': False
            }

    async def complete_linkedin_signup(
        self,
        code: str,
        state: str,
        linkedin_url: str
    ) -> Dict[str, Any]:
        """Complete the full LinkedIn signup process"""
        
        # Exchange code for token
        token_result = await self.exchange_code_for_token(code, state)
        if not token_result['success']:
            return token_result
        
        # Get LinkedIn profile
        profile_result = await self.get_linkedin_profile(token_result['access_token'])
        if not profile_result['success']:
            return profile_result
        
        # Create or update consultant
        consultant_result = await self.create_or_update_consultant(
            profile_result,
            linkedin_url
        )
        
        if consultant_result['success']:
            consultant_result['profile_data'] = profile_result['profile_data']
        
        return consultant_result