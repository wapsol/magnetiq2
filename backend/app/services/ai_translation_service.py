from typing import Dict, List, Optional, Any, Tuple
import openai
import asyncio
import json
import re
from datetime import datetime
from sqlalchemy.orm import Session

from ..models.translation import TranslationMemory
from ..config import settings


class AITranslationService:
    def __init__(self, db: Session, api_key: Optional[str] = None):
        self.db = db
        self.api_key = api_key or getattr(settings, 'OPENAI_API_KEY', None)
        if self.api_key:
            openai.api_key = self.api_key
        self.supported_languages = ['en', 'de']
        self.max_tokens = 2000
        self.temperature = 0.1  # Low temperature for consistency
    
    async def translate_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        context: Optional[str] = None,
        domain: str = 'business'
    ) -> Dict[str, Any]:
        """Translate text using AI with context awareness and translation memory"""
        
        if not self.api_key:
            return {
                'error': 'AI translation service not configured',
                'success': False
            }
        
        # Validate languages
        if source_language not in self.supported_languages or target_language not in self.supported_languages:
            return {
                'error': f'Unsupported language pair: {source_language}->{target_language}',
                'success': False
            }
        
        # Check translation memory first
        memory_match = await self.find_translation_memory_match(
            text, source_language, target_language
        )
        
        if memory_match and memory_match['similarity'] > 0.95:
            return {
                'translated_text': memory_match['translation'],
                'confidence': memory_match['similarity'],
                'method': 'translation_memory',
                'cached': True,
                'success': True
            }
        
        try:
            # Prepare prompts
            system_prompt = self.build_system_prompt(
                source_language, target_language, domain, context
            )
            
            user_prompt = self.build_user_prompt(text, context)
            
            # Make API call to OpenAI
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            # Clean up the translation (remove quotes if wrapped)
            translated_text = self.clean_translation_output(translated_text)
            
            # Validate translation quality
            quality_issues = await self.validate_translation_quality(
                text, translated_text, source_language, target_language
            )
            
            confidence = self.calculate_confidence_score(quality_issues, response)
            
            # Store in translation memory for future use
            await self.store_translation_memory(
                source_text=text,
                translated_text=translated_text,
                source_language=source_language,
                target_language=target_language,
                context=context,
                quality_score=confidence,
                domain=domain
            )
            
            return {
                'translated_text': translated_text,
                'confidence': confidence,
                'method': 'ai_translation',
                'model': 'gpt-4',
                'tokens_used': response.usage.total_tokens,
                'quality_issues': quality_issues,
                'cached': False,
                'success': True
            }
        
        except Exception as e:
            return {
                'error': str(e),
                'method': 'ai_translation',
                'success': False
            }
    
    def build_system_prompt(
        self,
        source_lang: str,
        target_lang: str,
        domain: str,
        context: Optional[str]
    ) -> str:
        """Build context-aware system prompt for AI translation"""
        
        lang_names = {'en': 'English', 'de': 'German'}
        
        prompt = f"""You are a professional translator specializing in {lang_names[source_lang]} to {lang_names[target_lang]} translation.

Domain expertise: Business technology, AI/ML, digital transformation, consulting services, web applications.

Key principles:
1. Accuracy: Preserve exact meaning and technical precision
2. Naturalness: Use native {lang_names[target_lang]} expressions and idioms  
3. Consistency: Maintain consistent terminology throughout
4. Cultural adaptation: Adjust cultural references appropriately
5. Professional tone: Match the business/professional tone of the source

Special considerations for German:
- Use appropriate formal address (Sie) for business contexts
- Follow German capitalization rules (nouns are capitalized)
- Use compound words appropriately 
- Consider DACH region preferences (Germany, Austria, Switzerland)
- Maintain technical precision for AI/data terms

Always preserve exactly:
- HTML tags and attributes (e.g., <div class="...">)
- Placeholder variables (e.g., {{name}}, {variable}, %s)
- URLs, email addresses, and links
- Brand names: "voltAIc Systems" (keep exact capitalization)
- Technical terms where established (API, JSON, etc.)
- Markdown formatting (*bold*, **emphasis**, etc.)

Return ONLY the translated text without explanations or quotes."""
        
        if context:
            prompt += f"\n\nAdditional context for this translation: {context}"
        
        return prompt
    
    def build_user_prompt(self, text: str, context: Optional[str]) -> str:
        """Build user prompt with text to translate"""
        
        prompt = f"Translate this text:\n\n{text}"
        
        if context:
            prompt += f"\n\nContext: {context}"
        
        return prompt
    
    def clean_translation_output(self, text: str) -> str:
        """Clean and normalize translation output"""
        # Remove surrounding quotes if present
        text = text.strip()
        if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
            text = text[1:-1]
        
        # Remove common prefixes that AI might add
        prefixes_to_remove = [
            "Translation: ",
            "Translated text: ",
            "German: ",
            "English: ",
            "Here is the translation: "
        ]
        
        for prefix in prefixes_to_remove:
            if text.startswith(prefix):
                text = text[len(prefix):]
                break
        
        return text.strip()
    
    async def validate_translation_quality(
        self,
        source_text: str,
        translated_text: str,
        source_language: str,
        target_language: str
    ) -> List[Dict[str, Any]]:
        """Validate translation quality and identify issues"""
        
        issues = []
        
        # Length variance check
        length_ratio = len(translated_text) / len(source_text) if len(source_text) > 0 else 1
        if length_ratio > 2.0 or length_ratio < 0.3:
            issues.append({
                'type': 'length_variance',
                'severity': 'warning',
                'message': f'Translation length varies by {abs(1-length_ratio)*100:.1f}%',
                'ratio': length_ratio
            })
        
        # Placeholder consistency
        source_placeholders = self.extract_placeholders(source_text)
        target_placeholders = self.extract_placeholders(translated_text)
        
        if source_placeholders != target_placeholders:
            issues.append({
                'type': 'placeholder_mismatch',
                'severity': 'error',
                'message': 'Placeholders do not match between source and translation',
                'source_placeholders': list(source_placeholders),
                'target_placeholders': list(target_placeholders)
            })
        
        # HTML tag consistency
        source_tags = self.extract_html_tags(source_text)
        target_tags = self.extract_html_tags(translated_text)
        
        if source_tags != target_tags:
            issues.append({
                'type': 'html_tag_mismatch',
                'severity': 'error',
                'message': 'HTML tags do not match between source and translation',
                'source_tags': list(source_tags),
                'target_tags': list(target_tags)
            })
        
        # Language-specific checks
        if target_language == 'de':
            issues.extend(await self.check_german_specific_rules(translated_text))
        
        return issues
    
    def extract_placeholders(self, text: str) -> set:
        """Extract placeholders from text"""
        patterns = [
            r'\{\{[^}]+\}\}',  # {{variable}}
            r'\{[^}]+\}',      # {variable}
            r'%[sd]',           # %s, %d
            r'%\([^)]+\)[sd]'   # %(variable)s
        ]
        
        placeholders = set()
        for pattern in patterns:
            placeholders.update(re.findall(pattern, text))
        
        return placeholders
    
    def extract_html_tags(self, text: str) -> set:
        """Extract HTML tags from text"""
        return set(re.findall(r'<[^>]+>', text))
    
    async def check_german_specific_rules(self, text: str) -> List[Dict[str, Any]]:
        """Check German-specific translation rules"""
        issues = []
        
        # Check for proper Sie usage in business context
        informal_patterns = [r'\bdu\b', r'\bdich\b', r'\bdir\b', r'\bdein']
        for pattern in informal_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                issues.append({
                    'type': 'informal_address',
                    'severity': 'warning',
                    'message': 'Consider using formal address (Sie) for business contexts',
                    'pattern': pattern
                })
                break
        
        return issues
    
    def calculate_confidence_score(
        self,
        quality_issues: List[Dict],
        api_response
    ) -> float:
        """Calculate confidence score based on quality issues and API response"""
        
        base_score = 0.85  # Base score for AI translation
        
        # Reduce score for quality issues
        for issue in quality_issues:
            if issue['severity'] == 'error':
                base_score -= 0.15
            elif issue['severity'] == 'warning':
                base_score -= 0.05
        
        # Consider API response quality indicators
        if hasattr(api_response, 'usage'):
            # Lower confidence for very short responses
            if api_response.usage.completion_tokens < 5:
                base_score -= 0.1
        
        return max(0.1, min(1.0, base_score))
    
    async def find_translation_memory_match(
        self,
        text: str,
        source_language: str,
        target_language: str,
        threshold: float = 0.85
    ) -> Optional[Dict[str, Any]]:
        """Find similar translation in translation memory"""
        
        # Simple exact match for now - in production, use fuzzy matching
        memory_entry = self.db.query(TranslationMemory).filter(
            TranslationMemory.source_text == text,
            TranslationMemory.source_language == source_language,
            TranslationMemory.target_language == target_language
        ).first()
        
        if memory_entry:
            # Update usage statistics
            memory_entry.usage_count += 1
            memory_entry.last_used = datetime.now()
            self.db.commit()
            
            return {
                'translation': memory_entry.translated_text,
                'similarity': 1.0,  # Exact match
                'quality_score': float(memory_entry.quality_score or 0.8),
                'usage_count': memory_entry.usage_count
            }
        
        return None
    
    async def store_translation_memory(
        self,
        source_text: str,
        translated_text: str,
        source_language: str,
        target_language: str,
        context: Optional[str] = None,
        quality_score: float = 0.8,
        domain: str = 'business'
    ):
        """Store translation in translation memory"""
        
        # Check if entry already exists
        existing = self.db.query(TranslationMemory).filter(
            TranslationMemory.source_text == source_text,
            TranslationMemory.source_language == source_language,
            TranslationMemory.target_language == target_language
        ).first()
        
        if existing:
            # Update existing entry with better quality score
            if quality_score > (existing.quality_score or 0):
                existing.translated_text = translated_text
                existing.quality_score = quality_score
                existing.context = context
                existing.domain = domain
        else:
            # Create new entry
            memory_entry = TranslationMemory(
                source_text=source_text,
                translated_text=translated_text,
                source_language=source_language,
                target_language=target_language,
                context=context,
                quality_score=quality_score,
                domain=domain,
                usage_count=0
            )
            self.db.add(memory_entry)
        
        self.db.commit()
    
    async def batch_translate(
        self,
        texts: List[Dict[str, str]],
        source_language: str,
        target_language: str,
        context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Translate multiple texts efficiently"""
        
        results = []
        
        # Process texts in batches to avoid API limits
        batch_size = 5
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_tasks = []
            
            for text_item in batch:
                task = self.translate_text(
                    text_item['text'],
                    source_language,
                    target_language,
                    context=context or text_item.get('context'),
                    domain=text_item.get('domain', 'business')
                )
                batch_tasks.append(task)
            
            # Execute batch concurrently
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    results.append({
                        'id': texts[i + j].get('id'),
                        'error': str(result),
                        'success': False
                    })
                else:
                    result['id'] = texts[i + j].get('id')
                    results.append(result)
            
            # Small delay to avoid rate limiting
            if i + batch_size < len(texts):
                await asyncio.sleep(1)
        
        return results