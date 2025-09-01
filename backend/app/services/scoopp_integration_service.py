from typing import Dict, Any, List, Optional
import httpx
import json
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import logging

from ..config import settings
from ..models.consultant import Consultant

logger = logging.getLogger(__name__)


class ScooppIntegrationService:
    """
    Integration service for Scoopp LinkedIn data scraping
    
    Note: This is a template implementation. Actual Scoopp integration
    would require proper API credentials and endpoint documentation.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.api_key = getattr(settings, 'scoopp_api_key', None)
        self.base_url = getattr(settings, 'scoopp_base_url', 'https://api.scoopp.ai')
        self.timeout = 30
        
    async def scrape_linkedin_profile(self, linkedin_url: str) -> Dict[str, Any]:
        """
        Scrape LinkedIn profile using Scoopp API
        
        Args:
            linkedin_url: LinkedIn profile URL to scrape
            
        Returns:
            Dict containing profile data or error information
        """
        
        if not self.api_key:
            return {
                'success': False,
                'error': 'Scoopp API not configured - missing API key',
                'fallback_data': await self._generate_fallback_data(linkedin_url)
            }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                payload = {
                    'url': linkedin_url,
                    'extract_data': [
                        'basic_info',
                        'experience',
                        'education', 
                        'skills',
                        'recommendations',
                        'certifications',
                        'projects',
                        'languages',
                        'volunteer_experience'
                    ],
                    'format': 'structured'
                }
                
                response = await client.post(
                    f"{self.base_url}/linkedin/profile",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return await self._process_scoopp_response(data)
                elif response.status_code == 429:
                    # Rate limited
                    return {
                        'success': False,
                        'error': 'Rate limited - please try again later',
                        'retry_after': response.headers.get('Retry-After', '300')
                    }
                else:
                    return {
                        'success': False,
                        'error': f'Scoopp API error: {response.status_code}',
                        'fallback_data': await self._generate_fallback_data(linkedin_url)
                    }
                    
        except httpx.TimeoutException:
            return {
                'success': False,
                'error': 'Scoopp API timeout',
                'fallback_data': await self._generate_fallback_data(linkedin_url)
            }
        except Exception as e:
            logger.error(f"Scoopp integration error: {e}")
            return {
                'success': False,
                'error': f'Integration error: {str(e)}',
                'fallback_data': await self._generate_fallback_data(linkedin_url)
            }
    
    async def _process_scoopp_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process and normalize Scoopp API response"""
        
        try:
            # Extract structured data from Scoopp response
            profile_data = data.get('profile', {})
            
            processed_data = {
                'success': True,
                'source': 'scoopp',
                'scraped_at': datetime.utcnow().isoformat(),
                'profile_data': {
                    # Basic information
                    'full_name': profile_data.get('name', ''),
                    'headline': profile_data.get('headline', ''),
                    'location': profile_data.get('location', ''),
                    'summary': profile_data.get('summary', ''),
                    'profile_image_url': profile_data.get('profile_image', ''),
                    'connections_count': profile_data.get('connections', 0),
                    'followers_count': profile_data.get('followers', 0),
                    
                    # Professional experience
                    'experience': self._normalize_experience(profile_data.get('experience', [])),
                    'education': self._normalize_education(profile_data.get('education', [])),
                    'skills': profile_data.get('skills', []),
                    'certifications': profile_data.get('certifications', []),
                    'languages': profile_data.get('languages', []),
                    'projects': profile_data.get('projects', []),
                    'volunteer_work': profile_data.get('volunteer_experience', []),
                    
                    # Social proof
                    'recommendations': profile_data.get('recommendations', []),
                    'endorsements': profile_data.get('endorsements', {}),
                    
                    # Metadata
                    'last_activity': profile_data.get('last_activity'),
                    'industry': profile_data.get('industry'),
                    'company': profile_data.get('current_company', {}).get('name'),
                    'job_title': profile_data.get('current_position', {}).get('title')
                },
                'raw_data': data  # Store raw response for debugging
            }
            
            # Calculate derived metrics
            processed_data['derived_metrics'] = await self._calculate_profile_metrics(
                processed_data['profile_data']
            )
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing Scoopp response: {e}")
            return {
                'success': False,
                'error': f'Response processing error: {str(e)}',
                'raw_data': data
            }
    
    def _normalize_experience(self, experience_data: List[Dict]) -> List[Dict]:
        """Normalize experience data to consistent format"""
        
        normalized = []
        for exp in experience_data:
            normalized.append({
                'company': exp.get('company', ''),
                'title': exp.get('title', ''),
                'duration': exp.get('duration', ''),
                'start_date': exp.get('start_date', ''),
                'end_date': exp.get('end_date', ''),
                'is_current': exp.get('is_current', False),
                'description': exp.get('description', ''),
                'location': exp.get('location', ''),
                'industry': exp.get('industry', '')
            })
        
        return normalized
    
    def _normalize_education(self, education_data: List[Dict]) -> List[Dict]:
        """Normalize education data to consistent format"""
        
        normalized = []
        for edu in education_data:
            normalized.append({
                'institution': edu.get('school', ''),
                'degree': edu.get('degree', ''),
                'field_of_study': edu.get('field_of_study', ''),
                'start_year': edu.get('start_year'),
                'end_year': edu.get('end_year'),
                'description': edu.get('description', ''),
                'activities': edu.get('activities', [])
            })
        
        return normalized
    
    async def _calculate_profile_metrics(self, profile_data: Dict) -> Dict[str, Any]:
        """Calculate derived metrics from profile data"""
        
        metrics = {}
        
        try:
            # Experience metrics
            experience = profile_data.get('experience', [])
            metrics['total_experience_years'] = len(experience)
            metrics['has_leadership_experience'] = any(
                'lead' in exp.get('title', '').lower() or 
                'manager' in exp.get('title', '').lower() or
                'director' in exp.get('title', '').lower()
                for exp in experience
            )
            
            # Skills assessment
            skills = profile_data.get('skills', [])
            ai_related_skills = [
                'artificial intelligence', 'machine learning', 'deep learning',
                'ai', 'ml', 'data science', 'python', 'tensorflow', 'pytorch'
            ]
            metrics['ai_skill_count'] = sum(
                1 for skill in skills 
                if any(ai_term in skill.lower() for ai_term in ai_related_skills)
            )
            
            # Network strength
            metrics['network_strength'] = min(
                profile_data.get('connections_count', 0) / 500, 1.0
            )  # Normalized to 0-1 scale
            
            # Profile completeness score
            completeness_factors = [
                bool(profile_data.get('headline')),
                bool(profile_data.get('summary')),
                len(experience) > 0,
                len(profile_data.get('education', [])) > 0,
                len(skills) > 5,
                bool(profile_data.get('profile_image_url')),
                len(profile_data.get('recommendations', [])) > 0
            ]
            metrics['profile_completeness'] = sum(completeness_factors) / len(completeness_factors)
            
            # Industry focus
            industries = [exp.get('industry', '') for exp in experience if exp.get('industry')]
            if industries:
                # Find most common industry
                industry_counts = {}
                for industry in industries:
                    industry_counts[industry] = industry_counts.get(industry, 0) + 1
                metrics['primary_industry'] = max(industry_counts.items(), key=lambda x: x[1])[0]
                metrics['industry_consistency'] = max(industry_counts.values()) / len(industries)
            
        except Exception as e:
            logger.error(f"Error calculating profile metrics: {e}")
            metrics['calculation_error'] = str(e)
        
        return metrics
    
    async def _generate_fallback_data(self, linkedin_url: str) -> Dict[str, Any]:
        """Generate minimal fallback data when Scoopp is not available"""
        
        # Extract basic info from LinkedIn URL
        username = linkedin_url.split('/in/')[-1].rstrip('/')
        
        return {
            'source': 'fallback',
            'linkedin_url': linkedin_url,
            'username': username,
            'profile_data': {
                'full_name': username.replace('-', ' ').title(),
                'headline': 'Professional Consultant',
                'location': 'Location not available',
                'summary': 'Profile summary will be generated after LinkedIn OAuth',
                'experience': [],
                'education': [],
                'skills': [],
                'connections_count': 0
            },
            'derived_metrics': {
                'profile_completeness': 0.1,
                'ai_skill_count': 0,
                'network_strength': 0.0,
                'total_experience_years': 0
            },
            'note': 'This is fallback data - complete profile will be available after LinkedIn OAuth'
        }
    
    async def enrich_consultant_profile(self, consultant_id: str) -> Dict[str, Any]:
        """Enrich existing consultant profile with Scoopp data"""
        
        try:
            # Get consultant
            result = await self.db.execute(
                select(Consultant).where(Consultant.id == consultant_id)
            )
            consultant = result.scalar_one_or_none()
            
            if not consultant:
                return {
                    'success': False,
                    'error': 'Consultant not found'
                }
            
            if not consultant.linkedin_url:
                return {
                    'success': False,
                    'error': 'No LinkedIn URL found for consultant'
                }
            
            # Scrape fresh data from LinkedIn
            scrape_result = await self.scrape_linkedin_profile(consultant.linkedin_url)
            
            if not scrape_result['success']:
                return scrape_result
            
            # Update consultant with enriched data
            profile_data = scrape_result['profile_data']
            derived_metrics = scrape_result.get('derived_metrics', {})
            
            # Update basic info if not already set
            if not consultant.headline and profile_data.get('headline'):
                consultant.headline = profile_data['headline']
            
            if not consultant.location and profile_data.get('location'):
                consultant.location = profile_data['location']
            
            # Update professional info
            if profile_data.get('industry'):
                consultant.industry = profile_data['industry']
            
            if derived_metrics.get('total_experience_years'):
                consultant.years_experience = derived_metrics['total_experience_years']
            
            # Update skills and specializations
            if profile_data.get('skills'):
                consultant.specializations = profile_data['skills'][:10]  # Top 10 skills
            
            # Store raw scraped data
            consultant.linkedin_data = {
                'scraped_at': datetime.utcnow().isoformat(),
                'source': scrape_result['source'],
                'profile_data': profile_data,
                'derived_metrics': derived_metrics
            }
            
            consultant.updated_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(consultant)
            
            logger.info(f"Consultant {consultant_id} profile enriched successfully via {scrape_result['source']}")
            
            return {
                'success': True,
                'message': 'Consultant profile enriched successfully',
                'enrichment_data': {
                    'source': scrape_result['source'],
                    'fields_updated': ['headline', 'location', 'industry', 'specializations'],
                    'profile_completeness': derived_metrics.get('profile_completeness', 0),
                    'ai_skill_count': derived_metrics.get('ai_skill_count', 0)
                }
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Profile enrichment error for consultant {consultant_id}: {e}")
            return {
                'success': False,
                'error': f'Profile enrichment failed: {str(e)}'
            }
    
    async def batch_enrich_consultants(self, consultant_ids: List[str]) -> Dict[str, Any]:
        """Batch enrich multiple consultant profiles"""
        
        results = {
            'success': True,
            'enriched': [],
            'failed': [],
            'total_processed': len(consultant_ids)
        }
        
        for consultant_id in consultant_ids:
            try:
                result = await self.enrich_consultant_profile(consultant_id)
                
                if result['success']:
                    results['enriched'].append({
                        'consultant_id': consultant_id,
                        'enrichment_data': result.get('enrichment_data', {})
                    })
                else:
                    results['failed'].append({
                        'consultant_id': consultant_id,
                        'error': result['error']
                    })
                
                # Add delay to respect rate limits
                await asyncio.sleep(2)
                
            except Exception as e:
                results['failed'].append({
                    'consultant_id': consultant_id,
                    'error': str(e)
                })
        
        results['success_rate'] = len(results['enriched']) / results['total_processed']
        
        return results
    
    async def get_enrichment_statistics(self) -> Dict[str, Any]:
        """Get statistics about profile enrichment status"""
        
        try:
            # Total consultants
            result = await self.db.execute(select(func.count(Consultant.id)))
            total_consultants = result.scalar()
            
            # Enriched consultants (have linkedin_data)
            result = await self.db.execute(
                select(func.count(Consultant.id)).where(
                    Consultant.linkedin_data.isnot(None)
                )
            )
            enriched_consultants = result.scalar()
            
            # Consultants with Scoopp data (this would need proper JSON querying in production)
            result = await self.db.execute(
                select(func.count(Consultant.id)).where(
                    Consultant.linkedin_data.contains('"source": "scoopp"')
                )
            )
            scoopp_enriched = result.scalar()
            
            # Recent enrichments (simplified - would need proper date filtering in production)
            result = await self.db.execute(
                select(func.count(Consultant.id)).where(
                    Consultant.linkedin_data.contains('"scraped_at"')
                )
            )
            recent_enrichments = result.scalar()
            
            return {
                'total_consultants': total_consultants or 0,
                'enriched_consultants': enriched_consultants or 0,
                'enrichment_rate': (enriched_consultants / total_consultants * 100) if total_consultants > 0 else 0,
                'scoopp_enriched': scoopp_enriched or 0,
                'recent_enrichments_7d': recent_enrichments or 0,
                'api_configured': bool(self.api_key),
                'service_status': 'configured' if self.api_key else 'not_configured'
            }
            
        except Exception as e:
            logger.error(f"Enrichment statistics error: {e}")
            return {
                'error': str(e),
                'api_configured': bool(self.api_key),
                'service_status': 'error'
            }