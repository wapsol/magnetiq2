from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
import json
import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..config import settings
from ..models.consultant import Consultant

logger = logging.getLogger(__name__)


class AIProfileGenerationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.api_key = settings.openai_api_key
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4-turbo-preview"
        self.temperature = 0.7  # Creative but consistent

    async def generate_consultant_profile(self, consultant: Consultant) -> Dict[str, Any]:
        """Generate comprehensive AI-powered consultant profile"""
        
        if not self.client:
            return {
                'success': False,
                'error': 'AI profile generation not configured - missing OpenAI API key'
            }
        
        try:
            # Build context from LinkedIn data
            context = self._build_consultant_context(consultant)
            logger.info(f"Generating AI profile for consultant {consultant.id} ({consultant.full_name})")
            
            # Generate profile components sequentially to avoid rate limits
            summary_result = await self._generate_professional_summary(context)
            if isinstance(summary_result, Exception):
                raise summary_result
                
            skills_result = await self._generate_skills_assessment(context)
            if isinstance(skills_result, Exception):
                raise skills_result
                
            positioning_result = await self._generate_market_positioning(context)
            if isinstance(positioning_result, Exception):
                raise positioning_result
                
            keywords_result = await self._generate_keywords(context)
            if isinstance(keywords_result, Exception):
                raise keywords_result
            
            logger.info(f"AI profile generated successfully for consultant {consultant.id}")
            
            return {
                'success': True,
                'ai_content': {
                    'summary': summary_result,
                    'skills_assessment': skills_result,
                    'market_positioning': positioning_result,
                    'keywords': keywords_result
                },
                'generation_metadata': {
                    'model_used': self.model,
                    'generated_at': datetime.utcnow().isoformat(),
                    'context_quality': self._assess_context_quality(context)
                }
            }
            
        except Exception as e:
            logger.error(f"AI profile generation error for consultant {consultant.id}: {e}")
            return {
                'success': False,
                'error': f'AI profile generation error: {str(e)}'
            }

    def _build_consultant_context(self, consultant: Consultant) -> Dict[str, Any]:
        """Build context for AI profile generation"""
        
        context = {
            'basic_info': {
                'name': f"{consultant.first_name} {consultant.last_name}",
                'headline': consultant.headline or '',
                'location': consultant.location or '',
                'industry': consultant.industry or '',
                'years_experience': consultant.years_experience
            },
            'linkedin_data': consultant.linkedin_data or {},
            'specializations': consultant.specializations or [],
            'languages': consultant.languages_spoken or ['English'],
            'rate_range': f"{consultant.hourly_rate} {consultant.currency}" if consultant.hourly_rate else None,
            'performance_metrics': {
                'total_projects': consultant.total_projects,
                'completed_projects': consultant.completed_projects,
                'success_rate': consultant.success_rate,
                'average_rating': float(consultant.average_rating) if consultant.average_rating else None,
                'response_rate': float(consultant.response_rate) if consultant.response_rate else None
            }
        }
        
        return context

    def _assess_context_quality(self, context: Dict[str, Any]) -> str:
        """Assess the quality of available context data for AI generation"""
        
        score = 0
        max_score = 10
        
        # Basic info completeness
        if context['basic_info']['headline']:
            score += 2
        if context['basic_info']['industry']:
            score += 1
        if context['basic_info']['years_experience']:
            score += 1
        if context['specializations']:
            score += 1
            
        # LinkedIn data richness
        if context['linkedin_data']:
            score += 2
            
        # Performance data
        if context['performance_metrics']['total_projects'] > 0:
            score += 2
        if context['performance_metrics']['average_rating']:
            score += 1
            
        if score >= 8:
            return 'excellent'
        elif score >= 6:
            return 'good'
        elif score >= 4:
            return 'moderate'
        else:
            return 'limited'

    async def _generate_professional_summary(self, context: Dict[str, Any]) -> str:
        """Generate professional summary with voltAIc branding"""
        
        system_prompt = """You are a professional copywriter specializing in consultant profiles for voltAIc Systems, a premium AI-driven consulting marketplace.

Create compelling professional summaries that:
1. Highlight unique value proposition and expertise
2. Emphasize AI/digital transformation experience where relevant
3. Use confident, professional tone
4. Include measurable achievements when possible
5. Reflect voltAIc's premium positioning
6. Are 150-200 words in length
7. End with a call to action about collaboration

Brand voice: Professional, innovative, results-focused, premium."""

        user_prompt = f"""Create a professional summary for this consultant:

Name: {context['basic_info']['name']}
Headline: {context['basic_info']['headline']}
Industry: {context['basic_info']['industry']}
Location: {context['basic_info']['location']}
Experience: {context['basic_info']['years_experience']} years
Specializations: {', '.join(context['specializations'])}

LinkedIn Data Context:
{json.dumps(context['linkedin_data'], indent=2) if context['linkedin_data'] else 'No additional LinkedIn data available'}

Create a compelling professional summary that positions this consultant as a premium expert on the voltAIc platform."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Professional summary generation failed: {e}")
            return f"Professional consultant with expertise in {context['basic_info']['industry']} and {context['basic_info']['years_experience']} years of experience."

    async def _generate_skills_assessment(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered skills assessment"""
        
        system_prompt = """You are an AI skills assessment expert for voltAIc Systems consultant marketplace.

Analyze consultant profiles and generate skills assessments in this JSON format:
{
  "core_competencies": [
    {"skill": "Skill Name", "proficiency": "Expert|Advanced|Intermediate|Beginner", "confidence": 0.95}
  ],
  "technical_skills": [
    {"category": "Category", "skills": ["skill1", "skill2"], "level": "Expert"}
  ],
  "industry_expertise": [
    {"industry": "Industry", "depth": "Deep|Moderate|Basic", "years": 5}
  ],
  "soft_skills": [
    {"skill": "Communication", "strength": "High|Medium|Low"}
  ],
  "ai_readiness": {
    "score": 85,
    "reasoning": "Strong background in digital transformation..."
  }
}

Base assessments on provided information, inferring reasonable skill levels from experience and industry context."""

        user_prompt = f"""Assess skills for this consultant:

Profile: {context['basic_info']['name']}
Industry: {context['basic_info']['industry']}
Headline: {context['basic_info']['headline']}
Experience: {context['basic_info']['years_experience']} years
Specializations: {context['specializations']}

Additional Context:
{json.dumps(context['linkedin_data'], indent=2) if context['linkedin_data'] else 'Limited additional data'}

Generate a comprehensive skills assessment focusing on AI/digital transformation readiness and consulting capabilities."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for structured data
                max_tokens=800
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                logger.warning(f"Skills assessment JSON parsing failed, using fallback")
                # Fallback to basic assessment
                return {
                    "core_competencies": [
                        {"skill": context['basic_info']['industry'] or "Business Consulting", "proficiency": "Advanced", "confidence": 0.8}
                    ],
                    "industry_expertise": [
                        {"industry": context['basic_info']['industry'] or "General Business", "depth": "Deep", "years": context['basic_info']['years_experience'] or 5}
                    ],
                    "ai_readiness": {"score": 70, "reasoning": "Industry experience suggests good adaptation potential"}
                }
            
        except Exception as e:
            logger.error(f"Skills assessment generation failed: {e}")
            return {"error": f"Skills assessment failed: {str(e)}"}

    async def _generate_market_positioning(self, context: Dict[str, Any]) -> str:
        """Generate market positioning strategy"""
        
        system_prompt = """You are a market positioning strategist for voltAIc Systems premium consulting marketplace.

Create market positioning statements that:
1. Differentiate consultants from competitors
2. Highlight unique value proposition
3. Position for premium pricing
4. Emphasize AI/digital transformation alignment
5. Create urgency and exclusivity
6. Are 100-150 words

Focus on what makes this consultant uniquely valuable in today's AI-driven business landscape."""

        user_prompt = f"""Create market positioning for:

Consultant: {context['basic_info']['name']}
Industry: {context['basic_info']['industry']}
Experience: {context['basic_info']['years_experience']} years
Specializations: {context['specializations']}
Rate: {context['rate_range'] or 'Premium pricing'}

Position this consultant as a premium expert who delivers exceptional ROI through AI-enhanced solutions."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=250
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Market positioning generation failed: {e}")
            return f"Premium {context['basic_info']['industry'] or 'business'} consultant with proven track record in digital transformation and business optimization."

    async def _generate_keywords(self, context: Dict[str, Any]) -> List[str]:
        """Generate SEO and discovery keywords"""
        
        system_prompt = """You are an SEO expert specializing in consultant discovery optimization.

Generate 15-20 relevant keywords for consultant profiles that improve discoverability:
- Industry-specific terms
- Skill-based keywords
- Technology keywords
- Business outcome keywords
- AI/digital transformation terms
- Geographic relevance

Return as a simple JSON array of strings."""

        user_prompt = f"""Generate keywords for:

Industry: {context['basic_info']['industry']}
Specializations: {context['specializations']}
Location: {context['basic_info']['location']}
Experience level: {context['basic_info']['years_experience']} years

Focus on terms that potential clients would search for when looking for this type of consultant."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content.strip()
            
            try:
                keywords = json.loads(content)
                if isinstance(keywords, list) and keywords:
                    return keywords
                else:
                    raise ValueError("Invalid keywords format")
            except (json.JSONDecodeError, ValueError):
                logger.warning(f"Keywords JSON parsing failed, using fallback")
                # Fallback to basic keywords
                basic_keywords = [
                    'consultant',
                    'digital transformation',
                    'business optimization',
                    'ai strategy'
                ]
                if context['basic_info']['industry']:
                    basic_keywords.append(context['basic_info']['industry'].lower())
                if context['specializations']:
                    basic_keywords.extend([spec.lower() for spec in context['specializations'][:5]])
                return basic_keywords
            
        except Exception as e:
            logger.error(f"Keywords generation failed: {e}")
            return ['consultant', 'business expert', context['basic_info']['industry'].lower() if context['basic_info']['industry'] else 'general']

    async def generate_profile_variations(
        self,
        consultant: Consultant,
        variation_count: int = 3
    ) -> Dict[str, Any]:
        """Generate multiple profile variations for A/B testing"""
        
        if not self.api_key:
            return {
                'success': False,
                'error': 'AI service not configured'
            }
        
        try:
            context = self._build_consultant_context(consultant)
            variations = []
            
            # Generate different tones/styles
            styles = [
                "professional and authoritative",
                "approachable and collaborative", 
                "innovative and forward-thinking"
            ]
            
            for i, style in enumerate(styles[:variation_count]):
                variation = await self._generate_styled_summary(context, style)
                variations.append({
                    'id': i + 1,
                    'style': style,
                    'summary': variation
                })
            
            return {
                'success': True,
                'variations': variations
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Variation generation failed: {str(e)}'
            }

    async def _generate_styled_summary(self, context: Dict[str, Any], style: str) -> str:
        """Generate summary with specific style/tone"""
        
        system_prompt = f"""You are a copywriter creating consultant profiles with a {style} tone.

Create a 150-word professional summary that embodies this style while maintaining voltAIc's premium brand positioning."""

        user_prompt = f"""Create a {style} summary for:

Name: {context['basic_info']['name']}
Industry: {context['basic_info']['industry']}
Experience: {context['basic_info']['years_experience']} years
Specializations: {context['specializations']}"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=250
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Styled summary generation failed: {e}")
            return f"Professional {context['basic_info']['industry'] or 'business'} consultant with {context['basic_info']['years_experience'] or 5} years of experience."
    
    async def batch_generate_profiles(
        self,
        consultant_ids: List[str],
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """Generate AI profiles for multiple consultants in batch"""
        
        if not self.client:
            return {
                'success': False,
                'error': 'AI profile generation not configured'
            }
        
        results = []
        successful_count = 0
        failed_count = 0
        
        for consultant_id in consultant_ids:
            try:
                # Get consultant
                result = await self.db.execute(
                    select(Consultant).where(Consultant.id == consultant_id)
                )
                consultant = result.scalar_one_or_none()
                
                if not consultant:
                    results.append({
                        'consultant_id': consultant_id,
                        'success': False,
                        'error': 'Consultant not found'
                    })
                    failed_count += 1
                    continue
                
                # Skip if profile already exists and not forcing regeneration
                if consultant.ai_summary and not force_regenerate:
                    results.append({
                        'consultant_id': consultant_id,
                        'success': True,
                        'message': 'Profile already exists, skipped',
                        'skipped': True
                    })
                    successful_count += 1
                    continue
                
                # Generate AI profile
                generation_result = await self.generate_consultant_profile(consultant)
                
                if generation_result['success']:
                    # Update consultant with generated content
                    ai_content = generation_result['ai_content']
                    consultant.ai_summary = ai_content['summary']
                    consultant.ai_skills_assessment = ai_content['skills_assessment']
                    consultant.ai_market_positioning = ai_content['market_positioning']
                    consultant.ai_generated_keywords = ai_content['keywords']
                    consultant.updated_at = datetime.utcnow()
                    
                    results.append({
                        'consultant_id': consultant_id,
                        'success': True,
                        'message': 'AI profile generated successfully'
                    })
                    successful_count += 1
                else:
                    results.append({
                        'consultant_id': consultant_id,
                        'success': False,
                        'error': generation_result['error']
                    })
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Batch generation failed for consultant {consultant_id}: {e}")
                results.append({
                    'consultant_id': consultant_id,
                    'success': False,
                    'error': str(e)
                })
                failed_count += 1
        
        # Commit all changes
        try:
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Batch profile generation commit failed: {e}")
            return {
                'success': False,
                'error': 'Failed to save generated profiles'
            }
        
        return {
            'success': True,
            'results': results,
            'summary': {
                'total_processed': len(consultant_ids),
                'successful': successful_count,
                'failed': failed_count,
                'success_rate': (successful_count / len(consultant_ids)) * 100 if consultant_ids else 0
            }
        }