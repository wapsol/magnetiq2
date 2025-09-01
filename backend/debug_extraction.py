#!/usr/bin/env python3
"""Debug script to identify the exact line causing the find() error"""

import asyncio
import httpx
from bs4 import BeautifulSoup

async def debug_extraction():
    url = "https://o18-1.voltaic.systems/"
    
    try:
        # Step 1: Download the page
        print("1. Downloading page...")
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            if response.status_code != 200:
                print(f"Failed to download: {response.status_code}")
                return
            
            html_content = response.text
            print(f"   Downloaded {len(html_content)} characters")
            
        # Step 2: Parse HTML
        print("2. Parsing HTML...")
        soup = BeautifulSoup(html_content, 'html.parser')
        print(f"   Parsed successfully")
        
        # Step 3: Test each extraction method individually
        print("3. Testing _extract_title...")
        try:
            from app.services.content_extraction_service import ContentExtractionService
            service = ContentExtractionService()
            title = service._extract_title(soup)
            print(f"   Title extraction passed: '{title}'")
        except Exception as e:
            import traceback
            print(f"   Title extraction failed: {e}")
            traceback.print_exc()
            
        print("4. Testing _extract_meta_description...")
        try:
            description = service._extract_meta_description(soup)
            print(f"   Meta description extraction passed: '{description}'")
        except Exception as e:
            import traceback
            print(f"   Meta description extraction failed: {e}")
            traceback.print_exc()
            
        print("5. Testing _clean_soup...")
        try:
            # Remove script and style tags
            for tag in soup(['script', 'style', 'noscript']):
                tag.decompose()
            print("   Script/style removal passed")
            
            # Remove comments
            from bs4 import Comment
            for comment in soup.find_all(string=Comment):
                comment.extract()
            print("   Comment removal passed")
        except Exception as e:
            print(f"   Clean soup failed: {e}")
            
        print("6. Testing _find_main_content...")
        try:
            main_selectors = [
                'main', 'article', '[role="main"]', '.main-content',
                '.content', '.post-content', '.entry-content', '#content', '#main'
            ]
            
            for selector in main_selectors:
                element = soup.select_one(selector)
                if element:
                    print(f"   Found main content with selector: {selector}")
                    break
            else:
                print("   No main content selectors found, trying fallback...")
                candidates = soup.find_all(['div', 'section'], recursive=True)
                print(f"   Found {len(candidates)} candidate elements")
                
        except Exception as e:
            print(f"   Find main content failed: {e}")
            
        print("7. Testing image extraction...")
        try:
            img_tags = soup.find_all('img')
            print(f"   Found {len(img_tags)} images")
        except Exception as e:
            print(f"   Image extraction failed: {e}")
            
        print("✅ All extraction steps completed successfully!")
        
    except Exception as e:
        import traceback
        print(f"❌ Error in debug extraction: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_extraction())