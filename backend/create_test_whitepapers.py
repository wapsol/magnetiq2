#!/usr/bin/env python3

import asyncio
import sys
import os
from datetime import datetime, timezone

# Add the backend app to Python path
sys.path.append('/Users/ashant/magnetiq2/backend')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models.business import Whitepaper
from app.models.content import MediaFile
from app.models.user import AdminUser
from app.config import settings

async def create_test_whitepapers():
    """Create sample whitepapers for testing"""
    
    # Create database engine
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Get or create admin user
            result = await session.execute(select(AdminUser).limit(1))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("No admin user found. Please create an admin user first.")
                return
            
            # Check if whitepapers already exist
            result = await session.execute(select(Whitepaper))
            existing = result.scalars().all()
            
            if existing:
                print(f"Found {len(existing)} existing whitepapers. Skipping creation.")
                return
            
            # Create test whitepapers
            whitepapers_data = [
                {
                    'title': {
                        'en': 'AI-Driven ERP Transformation: A Blueprint for Sustainable Digital Integration',
                        'de': 'KI-gestützte ERP-Transformation: Ein Blueprint für nachhaltige digitale Integration'
                    },
                    'description': {
                        'en': 'This whitepaper examines how artificial intelligence is revolutionizing enterprise resource planning systems, moving beyond traditional automation to create truly intelligent business ecosystems. Based on implementations across 200+ companies, we explore how AI-enhanced ERP solutions deliver 30-60% resource efficiency gains while supporting circular economy principles.',
                        'de': 'Dieses Whitepaper untersucht, wie künstliche Intelligenz ERP-Systeme revolutioniert und über traditionelle Automatisierung hinaus wirklich intelligente Geschäftsökosysteme schafft. Basierend auf Implementierungen in über 200 Unternehmen zeigen wir, wie KI-erweiterte ERP-Lösungen 30-60% Effizienzsteigerungen ermöglichen.'
                    },
                    'slug': 'ai-driven-erp-transformation-blueprint',
                    'category': 'guide',
                    'tags': ['AI', 'ERP', 'Digital Transformation', 'Sustainability', 'Enterprise'],
                    'industry': ['Manufacturing', 'Technology', 'Finance'],
                    'featured': True,
                    'meta_title': {
                        'en': 'AI-Driven ERP Transformation Blueprint - voltAIc Systems',
                        'de': 'KI-gestützte ERP-Transformation Blueprint - voltAIc Systems'
                    },
                    'meta_description': {
                        'en': 'Learn how AI is transforming ERP systems with our comprehensive blueprint based on 200+ company implementations.',
                        'de': 'Erfahren Sie, wie KI ERP-Systeme transformiert mit unserem umfassenden Blueprint basierend auf 200+ Unternehmensimplementierungen.'
                    }
                },
                {
                    'title': {
                        'en': 'Large Language Models in Enterprise Applications: Unlocking Legacy System Potential',
                        'de': 'Große Sprachmodelle in Unternehmensanwendungen: Potenzial von Legacy-Systemen freisetzen'
                    },
                    'description': {
                        'en': 'As organizations struggle to modernize legacy ERP, CRM, and enterprise applications, Large Language Models present unprecedented opportunities. This whitepaper provides a strategic roadmap for leveraging LLMs to transform legacy systems without complete overhauls, including practical applications and implementation frameworks.',
                        'de': 'Während Organisationen kämpfen, um Legacy-ERP-, CRM- und Unternehmensanwendungen zu modernisieren, bieten große Sprachmodelle beispiellose Möglichkeiten. Dieses Whitepaper bietet eine strategische Roadmap für die Nutzung von LLMs zur Transformation von Legacy-Systemen ohne komplette Überholung.'
                    },
                    'slug': 'llm-enterprise-applications-legacy-systems',
                    'category': 'research',
                    'tags': ['LLM', 'Legacy Systems', 'Enterprise Applications', 'AI Integration', 'Modernization'],
                    'industry': ['Technology', 'Healthcare', 'Finance', 'Manufacturing'],
                    'featured': True,
                    'meta_title': {
                        'en': 'LLMs in Enterprise: Legacy System Transformation - voltAIc Systems',
                        'de': 'LLMs im Unternehmen: Legacy-System-Transformation - voltAIc Systems'
                    }
                },
                {
                    'title': {
                        'en': 'AI for Circular Economy: Intelligent Resource Optimization in Digital Business Models',
                        'de': 'KI für Kreislaufwirtschaft: Intelligente Ressourcenoptimierung in digitalen Geschäftsmodellen'
                    },
                    'description': {
                        'en': 'The intersection of artificial intelligence and circular economy principles creates powerful opportunities for sustainable business transformation. This whitepaper explores how AI technologies enable closed-loop resource management, waste reduction, and regenerative business models through machine learning applications and intelligent systems.',
                        'de': 'Die Schnittstelle zwischen künstlicher Intelligenz und Kreislaufwirtschaftsprinzipien schafft mächtige Möglichkeiten für nachhaltige Geschäftstransformation. Dieses Whitepaper erforscht, wie KI-Technologien geschlossene Ressourcenmanagementsysteme, Abfallreduzierung und regenerative Geschäftsmodelle ermöglichen.'
                    },
                    'slug': 'ai-circular-economy-resource-optimization',
                    'category': 'report',
                    'tags': ['Circular Economy', 'Sustainability', 'AI', 'Resource Optimization', 'Green Technology'],
                    'industry': ['Energy', 'Manufacturing', 'Retail'],
                    'featured': True,
                    'meta_title': {
                        'en': 'AI for Circular Economy - Resource Optimization Report - voltAIc Systems',
                        'de': 'KI für Kreislaufwirtschaft - Ressourcenoptimierung Bericht - voltAIc Systems'
                    }
                },
                {
                    'title': {
                        'en': 'Intelligent Process Engineering: AI-Powered Optimization for Enterprise Efficiency',
                        'de': 'Intelligente Prozess-Engineering: KI-gestützte Optimierung für Unternehmenseffizienz'
                    },
                    'description': {
                        'en': 'Modern enterprises require sophisticated approaches to process optimization that go beyond traditional automation. This whitepaper presents a comprehensive methodology for AI-powered process engineering that delivers measurable efficiency gains and sustainable competitive advantages, with case studies showing 30-60% improvements.',
                        'de': 'Moderne Unternehmen benötigen ausgeklügelte Ansätze zur Prozessoptimierung, die über traditionelle Automatisierung hinausgehen. Dieses Whitepaper präsentiert eine umfassende Methodologie für KI-gestütztes Prozess-Engineering mit messbaren Effizienzsteigerungen und nachhaltigen Wettbewerbsvorteilen.'
                    },
                    'slug': 'intelligent-process-engineering-ai-optimization',
                    'category': 'case-study',
                    'tags': ['Process Engineering', 'AI Optimization', 'Enterprise Efficiency', 'Automation', 'Machine Learning'],
                    'industry': ['Manufacturing', 'Technology', 'Healthcare', 'Finance'],
                    'featured': False,
                    'meta_title': {
                        'en': 'AI-Powered Process Engineering for Enterprise Efficiency - voltAIc Systems',
                        'de': 'KI-gestütztes Prozess-Engineering für Unternehmenseffizienz - voltAIc Systems'
                    }
                },
                {
                    'title': {
                        'en': 'Strategic AI Integration: From Planning to Lifecycle Management in Enterprise Transformation',
                        'de': 'Strategische KI-Integration: Von der Planung bis zum Lifecycle-Management in der Unternehmenstransformation'
                    },
                    'description': {
                        'en': 'Successful AI integration requires strategic planning that extends far beyond technology deployment. This whitepaper provides a comprehensive framework for AI transformation projects, covering strategic planning, process engineering, resource allocation, execution methodologies, and long-term lifecycle management based on 6-12 month implementation projects.',
                        'de': 'Erfolgreiche KI-Integration erfordert strategische Planung, die weit über Technologie-Deployment hinausgeht. Dieses Whitepaper bietet einen umfassenden Rahmen für KI-Transformationsprojekte, von strategischer Planung bis Lifecycle-Management basierend auf 6-12 Monaten Implementierungsprojekten.'
                    },
                    'slug': 'strategic-ai-integration-lifecycle-management',
                    'category': 'best-practices',
                    'tags': ['Strategic Planning', 'AI Integration', 'Lifecycle Management', 'Enterprise Transformation', 'Project Management'],
                    'industry': ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'],
                    'featured': False,
                    'meta_title': {
                        'en': 'Strategic AI Integration Framework - Enterprise Transformation - voltAIc Systems',
                        'de': 'Strategischer KI-Integrations-Framework - Unternehmenstransformation - voltAIc Systems'
                    }
                },
                {
                    'title': {
                        'en': 'Open Source AI Ecosystem: Building Sustainable and Scalable Enterprise AI Solutions',
                        'de': 'Open Source KI-Ökosystem: Aufbau nachhaltiger und skalierbarer Unternehmens-KI-Lösungen'
                    },
                    'description': {
                        'en': 'Open source AI technologies offer enterprises unprecedented opportunities to build sophisticated AI capabilities without vendor lock-in or prohibitive licensing costs. This whitepaper explores the strategic advantages of open source AI ecosystems, covering foundational models, development frameworks, deployment platforms, and community-driven innovation.',
                        'de': 'Open Source KI-Technologien bieten Unternehmen beispiellose Möglichkeiten, ausgeklügelte KI-Fähigkeiten ohne Vendor-Lock-in oder prohibitive Lizenzkosten aufzubauen. Dieses Whitepaper erforscht die strategischen Vorteile von Open Source KI-Ökosystemen.'
                    },
                    'slug': 'open-source-ai-ecosystem-enterprise-solutions',
                    'category': 'guide',
                    'tags': ['Open Source', 'AI Ecosystem', 'Enterprise Solutions', 'Scalability', 'Cost Optimization'],
                    'industry': ['Technology', 'Startups', 'Finance', 'Healthcare'],
                    'featured': False,
                    'meta_title': {
                        'en': 'Open Source AI Ecosystem Guide for Enterprises - voltAIc Systems',
                        'de': 'Open Source KI-Ökosystem Leitfaden für Unternehmen - voltAIc Systems'
                    }
                }
            ]
            
            # Create whitepapers
            created_count = 0
            for wp_data in whitepapers_data:
                whitepaper = Whitepaper(
                    title=wp_data['title'],
                    description=wp_data['description'],
                    slug=wp_data['slug'],
                    category=wp_data['category'],
                    tags=wp_data['tags'],
                    industry=wp_data['industry'],
                    featured=wp_data['featured'],
                    requires_registration=True,
                    lead_magnet_active=True,
                    status='published',
                    meta_title=wp_data['meta_title'],
                    meta_description=wp_data.get('meta_description', wp_data['meta_title']),
                    published_at=datetime.now(timezone.utc),
                    author_id=admin_user.id,
                    file_id=1,  # Assuming there's a media file with ID 1
                    sort_order=0,
                    download_count=0,
                    view_count=0
                )
                
                session.add(whitepaper)
                created_count += 1
            
            # Commit all changes
            await session.commit()
            print(f"✅ Successfully created {created_count} test whitepapers!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating test whitepapers: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await engine.dispose()

async def main():
    print("🚀 Creating test whitepapers...")
    await create_test_whitepapers()
    print("✨ Done!")

if __name__ == "__main__":
    asyncio.run(main())