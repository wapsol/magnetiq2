#!/usr/bin/env python3
"""
Script to create test webinar data
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.models.business import Webinar

async def create_test_webinar():
    """Create a test webinar"""
    
    # Use the same database URL pattern as the app
    DATABASE_URL = "sqlite+aiosqlite:////Users/ashant/magnetiq2/data/magnetiq.db"
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create a test webinar
        webinar = Webinar(
            title={
                "en": "AI Implementation Workshop: From Strategy to Execution",
                "de": "KI-Implementierungs-Workshop: Von der Strategie zur Umsetzung"
            },
            description={
                "en": "Join our comprehensive workshop on implementing AI in your organization. Learn practical strategies, avoid common pitfalls, and discover how to measure ROI from your AI investments.",
                "de": "Nehmen Sie an unserem umfassenden Workshop zur KI-Implementierung in Ihrem Unternehmen teil. Lernen Sie praktische Strategien kennen, vermeiden Sie häufige Fallstricke und entdecken Sie, wie Sie den ROI Ihrer KI-Investitionen messen können."
            },
            slug="ai-implementation-workshop-2024",
            scheduled_at=datetime.utcnow() + timedelta(days=14),  # 2 weeks from now
            duration_minutes=120,  # 2 hours
            timezone="UTC",
            max_participants=100,
            meeting_url="https://meet.voltaic.systems/ai-workshop-2024",
            presenter_name="Dr. Sarah Chen",
            presenter_bio={
                "en": "Dr. Sarah Chen is a leading AI strategist with over 15 years of experience helping Fortune 500 companies implement artificial intelligence solutions. She holds a PhD in Computer Science from MIT and has published numerous papers on practical AI implementation.",
                "de": "Dr. Sarah Chen ist eine führende KI-Strategin mit über 15 Jahren Erfahrung bei der Unterstützung von Fortune-500-Unternehmen bei der Implementierung von Lösungen für künstliche Intelligenz. Sie hat einen Doktortitel in Informatik vom MIT und hat zahlreiche Artikel über praktische KI-Implementierung veröffentlicht."
            },
            registration_enabled=True,
            registration_deadline=datetime.utcnow() + timedelta(days=13),  # 1 day before webinar
            status="scheduled"
        )
        
        session.add(webinar)
        await session.commit()
        await session.refresh(webinar)
        
        print(f"✅ Created test webinar with ID: {webinar.id}")
        print(f"   Title: {webinar.title['en']}")
        print(f"   Slug: {webinar.slug}")
        print(f"   Scheduled: {webinar.scheduled_at}")
        
        # Create another webinar with a simple numeric slug for testing
        webinar2 = Webinar(
            title={
                "en": "Data Management Best Practices",
                "de": "Best Practices für Datenmanagement"
            },
            description={
                "en": "Learn how to effectively manage your organization's data assets for maximum value and compliance.",
                "de": "Erfahren Sie, wie Sie die Datenanlagen Ihres Unternehmens effektiv verwalten, um maximalen Wert und Compliance zu gewährleisten."
            },
            slug="webinar-2",  # Simple slug that matches our route pattern
            scheduled_at=datetime.utcnow() + timedelta(days=21),  # 3 weeks from now
            duration_minutes=90,
            timezone="UTC",
            max_participants=50,
            meeting_url="https://meet.voltaic.systems/data-management-2024",
            presenter_name="Marcus Johnson",
            presenter_bio={
                "en": "Marcus Johnson is a data management expert with 12 years of experience in enterprise data architecture and governance.",
                "de": "Marcus Johnson ist ein Datenmanagement-Experte mit 12 Jahren Erfahrung in der Unternehmensdatenarchitektur und -governance."
            },
            registration_enabled=True,
            registration_deadline=datetime.utcnow() + timedelta(days=20),
            status="scheduled"
        )
        
        session.add(webinar2)
        await session.commit()
        await session.refresh(webinar2)
        
        print(f"✅ Created second test webinar with ID: {webinar2.id}")
        print(f"   Title: {webinar2.title['en']}")
        print(f"   Slug: {webinar2.slug}")
        print(f"   Scheduled: {webinar2.scheduled_at}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_test_webinar())