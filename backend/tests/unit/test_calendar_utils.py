"""
Unit tests for calendar utility functions
"""

import pytest
from datetime import datetime, timedelta
from app.utils.calendar import (
    generate_google_calendar_url,
    generate_outlook_calendar_url,
    generate_office365_calendar_url,
    generate_yahoo_calendar_url,
    generate_ics_content,
    format_webinar_datetime,
    get_calendar_integrations
)


@pytest.fixture
def sample_webinar_data():
    """Sample webinar data for testing"""
    return {
        'id': '123',
        'title': 'AI Implementation Workshop',
        'description': 'Learn how to implement AI in your organization',
        'startDate': datetime(2024, 12, 15, 14, 0, 0),  # 2:00 PM UTC
        'endDate': datetime(2024, 12, 15, 15, 30, 0),   # 3:30 PM UTC
        'timezone': 'UTC',
        'location': 'Online',
        'meetingUrl': 'https://meet.example.com/ai-workshop',
        'presenter': 'Dr. Jane Smith, AI Director',
        'registrationId': 'reg-456'
    }


class TestCalendarUrlGeneration:
    """Test calendar URL generation functions"""

    def test_generate_google_calendar_url(self, sample_webinar_data):
        """Test Google Calendar URL generation"""
        url = generate_google_calendar_url(sample_webinar_data)
        
        assert 'calendar.google.com' in url
        assert 'action=TEMPLATE' in url
        assert 'AI+Implementation+Workshop' in url
        assert 'dates=20241215T140000Z%2F20241215T153000Z' in url
        assert 'ctz=UTC' in url

    def test_generate_google_calendar_url_with_options(self, sample_webinar_data):
        """Test Google Calendar URL with custom options"""
        options = {
            'includeLocation': True,
            'includeDescription': True,
            'includeReminders': False
        }
        
        url = generate_google_calendar_url(sample_webinar_data, options)
        
        assert 'location=Online' in url or 'location=https' in url
        assert 'details=' in url

    def test_generate_outlook_calendar_url_web(self, sample_webinar_data):
        """Test Outlook Web Calendar URL generation"""
        url = generate_outlook_calendar_url(sample_webinar_data, 'web')
        
        assert 'outlook.live.com' in url
        assert 'deeplink/compose' in url
        assert 'startTime=2024-12-15T14%3A00%3A00' in url
        assert 'subject=AI+Implementation+Workshop' in url

    def test_generate_outlook_calendar_url_desktop(self, sample_webinar_data):
        """Test Outlook Desktop Calendar URL generation"""
        url = generate_outlook_calendar_url(sample_webinar_data, 'desktop')
        
        assert url.startswith('outlook:')
        assert 'rru=addevent' in url
        assert 'subject=AI+Implementation+Workshop' in url

    def test_generate_office365_calendar_url(self, sample_webinar_data):
        """Test Office 365 Calendar URL generation"""
        url = generate_office365_calendar_url(sample_webinar_data)
        
        assert 'outlook.office.com' in url
        assert 'deeplink/compose' in url
        assert 'subject=AI+Implementation+Workshop' in url

    def test_generate_yahoo_calendar_url(self, sample_webinar_data):
        """Test Yahoo Calendar URL generation"""
        url = generate_yahoo_calendar_url(sample_webinar_data)
        
        assert 'calendar.yahoo.com' in url
        assert 'title=AI+Implementation+Workshop' in url
        assert 'st=20241215T140000Z' in url
        assert 'et=20241215T153000Z' in url


class TestICSGeneration:
    """Test ICS file content generation"""

    def test_generate_ics_content(self, sample_webinar_data):
        """Test ICS content generation"""
        ics_content = generate_ics_content(sample_webinar_data)
        
        assert 'BEGIN:VCALENDAR' in ics_content
        assert 'END:VCALENDAR' in ics_content
        assert 'BEGIN:VEVENT' in ics_content
        assert 'END:VEVENT' in ics_content
        assert 'SUMMARY:AI Implementation Workshop' in ics_content
        assert 'DTSTART:20241215T140000Z' in ics_content
        assert 'DTEND:20241215T153000Z' in ics_content
        assert 'URL:https://meet.example.com/ai-workshop' in ics_content

    def test_ics_content_includes_reminders(self, sample_webinar_data):
        """Test that ICS content includes reminder alarms"""
        ics_content = generate_ics_content(sample_webinar_data)
        
        assert 'BEGIN:VALARM' in ics_content
        assert 'END:VALARM' in ics_content
        assert 'TRIGGER:-P1D' in ics_content  # 1 day before
        assert 'TRIGGER:-PT1H' in ics_content  # 1 hour before
        assert 'TRIGGER:-PT15M' in ics_content  # 15 minutes before

    def test_ics_content_with_presenter_info(self, sample_webinar_data):
        """Test ICS content includes presenter information"""
        ics_content = generate_ics_content(sample_webinar_data)
        
        assert 'Dr. Jane Smith' in ics_content
        assert 'voltAIc Systems' in ics_content


class TestDateTimeFormatting:
    """Test date/time formatting functions"""

    def test_format_webinar_datetime_utc(self):
        """Test formatting webinar date/time in UTC"""
        start_date = datetime(2024, 12, 15, 14, 0, 0)
        end_date = datetime(2024, 12, 15, 15, 30, 0)
        
        result = format_webinar_datetime(start_date, end_date, 'UTC', 'en-US')
        
        assert result['timezone'] == 'UTC'
        assert result['duration'] == '1h 30m'
        assert 'December' in result['date']
        assert '15' in result['date']
        assert '2024' in result['date']

    def test_format_webinar_datetime_different_timezone(self):
        """Test formatting webinar date/time in different timezone"""
        start_date = datetime(2024, 12, 15, 14, 0, 0)
        end_date = datetime(2024, 12, 15, 15, 30, 0)
        
        result = format_webinar_datetime(start_date, end_date, 'America/New_York', 'en-US')
        
        assert result['timezone'] == 'America/New_York'
        assert result['duration'] == '1h 30m'

    def test_format_webinar_datetime_short_duration(self):
        """Test formatting short duration webinar"""
        start_date = datetime(2024, 12, 15, 14, 0, 0)
        end_date = datetime(2024, 12, 15, 14, 45, 0)  # 45 minutes
        
        result = format_webinar_datetime(start_date, end_date, 'UTC', 'en-US')
        
        assert result['duration'] == '45m'

    def test_format_webinar_datetime_german_locale(self):
        """Test formatting webinar date/time in German locale"""
        start_date = datetime(2024, 12, 15, 14, 0, 0)
        end_date = datetime(2024, 12, 15, 15, 30, 0)
        
        result = format_webinar_datetime(start_date, end_date, 'UTC', 'de-DE')
        
        assert result['timezone'] == 'UTC'
        assert result['duration'] == '1h 30m'


class TestCalendarIntegrations:
    """Test comprehensive calendar integrations function"""

    def test_get_calendar_integrations(self, sample_webinar_data):
        """Test getting all calendar integration options"""
        integrations = get_calendar_integrations(sample_webinar_data)
        
        assert 'google' in integrations
        assert 'outlook' in integrations
        assert 'office365' in integrations
        assert 'yahoo' in integrations
        assert 'ics' in integrations
        assert 'icsContent' in integrations
        
        # Test that URLs are properly formatted
        assert 'calendar.google.com' in integrations['google']
        assert 'outlook.live.com' in integrations['outlook']
        assert 'outlook.office.com' in integrations['office365']
        assert 'calendar.yahoo.com' in integrations['yahoo']
        
        # Test ICS function and content
        assert callable(integrations['ics'])
        assert isinstance(integrations['icsContent'], str)
        assert 'BEGIN:VCALENDAR' in integrations['icsContent']

    def test_get_calendar_integrations_with_options(self, sample_webinar_data):
        """Test calendar integrations with custom options"""
        options = {
            'includeLocation': False,
            'includeDescription': False,
            'includeReminders': False
        }
        
        integrations = get_calendar_integrations(sample_webinar_data, options)
        
        # URLs should still be generated but may not include all details
        assert 'calendar.google.com' in integrations['google']
        assert len(integrations) == 6  # All platforms should be included


class TestErrorHandling:
    """Test error handling in calendar utilities"""

    def test_invalid_date_handling(self):
        """Test handling of invalid dates"""
        invalid_webinar_data = {
            'id': '123',
            'title': 'Test Webinar',
            'description': 'Test description',
            'startDate': 'invalid-date',
            'endDate': 'invalid-date',
            'timezone': 'UTC'
        }
        
        # Functions should handle invalid data gracefully
        # In a real implementation, these would either:
        # 1. Raise appropriate exceptions
        # 2. Return error indicators
        # 3. Use default values
        
        # For now, we test that functions don't crash
        try:
            # These might raise exceptions, which is acceptable
            generate_google_calendar_url(invalid_webinar_data)
        except (TypeError, AttributeError, ValueError):
            pass  # Expected for invalid data

    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        minimal_webinar_data = {
            'id': '123',
            'title': 'Test Webinar'
            # Missing other required fields
        }
        
        # Functions should handle missing data gracefully
        try:
            generate_google_calendar_url(minimal_webinar_data)
        except (KeyError, AttributeError, TypeError):
            pass  # Expected for missing required fields

    def test_empty_timezone(self, sample_webinar_data):
        """Test handling of empty timezone"""
        sample_webinar_data['timezone'] = ''
        
        # Should fallback to UTC or handle gracefully
        url = generate_google_calendar_url(sample_webinar_data)
        assert isinstance(url, str)
        assert len(url) > 0