from typing import Dict, Any, List, Optional
import openai
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from ..config import settings
from ..models.consultant import Consultant


class AIProfileGenerationService:
    def __init__(self, db: Session):
        self.db = db
        self.api_key = settings.openai_api_key
        if self.api_key:
            openai.api_key = self.api_key
        self.model = "gpt-4"
        self.temperature = 0.7  # Creative but consistent

    async def generate_consultant_profile(self, consultant: Consultant) -> Dict[str, Any]:
        """Generate comprehensive AI-powered consultant profile"""
        
        if not self.api_key:
            return {
                'success': False,
                'error': 'AI profile generation not configured - missing OpenAI API key'
            }
        
        try:
            # Build context from LinkedIn data
            context = self._build_consultant_context(consultant)
            
            # Generate profile components
            tasks = [
                self._generate_professional_summary(context),
                self._generate_skills_assessment(context),
                self._generate_market_positioning(context),
                self._generate_keywords(context)
            ]
            
            # Execute all tasks
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            summary_result, skills_result, positioning_result, keywords_result = results
            
            # Check for errors
            if any(isinstance(result, Exception) for result in results):
                return {
                    'success': False,
                    'error': 'AI profile generation failed'
                }
            
            return {
                'success': True,
                'ai_content': {
                    'summary': summary_result,
                    'skills_assessment': skills_result,
                    'market_positioning': positioning_result,
                    'keywords': keywords_result
                },
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'AI profile generation error: {str(e)}'
            }

    def _build_consultant_context(self, consultant: Consultant) -> Dict[str, Any]:
        """Build context for AI profile generation"""
        
        context = {
            'basic_info': {
                'name': f"{consultant.first_name} {consultant.last_name}",
                'headline': consultant.headline,
                'location': consultant.location,
                'industry': consultant.industry,
                'years_experience': consultant.years_experience
            },
            'linkedin_data': consultant.linkedin_data or {},
            'specializations': consultant.specializations or [],
            'languages': consultant.languages_spoken or ['English'],
            'rate_range': f"{consultant.hourly_rate} {consultant.currency}" if consultant.hourly_rate else None
        }
        
        return context

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
            response = await openai.ChatCompletion.acreate(
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
            response = await openai.ChatCompletion.acreate(
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
                # Fallback to basic assessment
                return {
                    "core_competencies": [
                        {"skill": context['basic_info']['industry'], "proficiency": "Advanced", "confidence": 0.8}
                    ],
                    "ai_readiness": {"score": 70, "reasoning": "Industry experience suggests good adaptation potential"}
                }
            
        except Exception as e:
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
            response = await openai.ChatCompletion.acreate(
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
            return f"Premium {context['basic_info']['industry']} consultant with proven track record in digital transformation and business optimization."

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
            response = await openai.ChatCompletion.acreate(
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
                return json.loads(content)
            except json.JSONDecodeError:
                # Fallback to basic keywords
                basic_keywords = [
                    context['basic_info']['industry'].lower(),
                    'consultant',
                    'digital transformation',
                    'business optimization',
                    'ai strategy'
                ]
                if context['specializations']:
                    basic_keywords.extend([spec.lower() for spec in context['specializations'][:5]])
                return basic_keywords
            
        except Exception as e:
            return ['consultant', 'business expert', context['basic_info']['industry'].lower()]

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
            response = await openai.ChatCompletion.acreate(
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
            return f"Professional {context['basic_info']['industry']} consultant with {context['basic_info']['years_experience']} years of experience."