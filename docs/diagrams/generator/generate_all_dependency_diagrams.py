#!/usr/bin/env python3
"""
Master Dependency Diagram Generator for Magnetiq v2 Documentation
Generates all dependency-related diagrams in the correct order
"""

import subprocess
import sys
import os
from pathlib import Path

def run_generator(script_name, description):
    """Run a diagram generator script and handle errors"""
    try:
        print(f"\n📊 {description}")
        print("=" * 60)
        
        # Change to the shorts directory to run the script
        script_path = Path(__file__).parent / "shorts" / script_name
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=True, 
                              text=True, 
                              cwd=Path(__file__).parent / "shorts")
        
        if result.returncode == 0:
            print(result.stdout)
            return True
        else:
            print(f"❌ Error running {script_name}:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Exception running {script_name}: {e}")
        return False

def main():
    """Generate all dependency diagrams"""
    print("🚀 Magnetiq v2 Dependency Diagram Generation")
    print("=" * 60)
    
    generators = [
        ("feature_dependency_diagrams.py", "Feature Dependency Trees & Service Maps"),
        ("enhanced_dependency_diagrams.py", "Enhanced Model Dependencies & Data Flow"),
        ("operational_dependency_diagrams.py", "Health Checks & Deployment Dependencies"),
        ("sqlalchemy_diagrams.py", "SQLAlchemy Architecture Diagrams")
    ]
    
    success_count = 0
    total_count = len(generators)
    
    for script, description in generators:
        if run_generator(script, description):
            success_count += 1
        else:
            print(f"❌ Failed to generate diagrams from {script}")
    
    print(f"\n📈 Generation Summary")
    print("=" * 60)
    print(f"✅ Successfully generated: {success_count}/{total_count} diagram sets")
    
    if success_count == total_count:
        print("🎉 All dependency diagrams generated successfully!")
        print(f"📁 Diagrams saved to: docs/diagrams/assets/shorts/")
        return True
    else:
        print(f"⚠️  {total_count - success_count} diagram set(s) failed to generate")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)