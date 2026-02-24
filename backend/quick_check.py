"""
Quick Environment Check for LearnHub Backend
==============================================
A fast script to verify essential environment setup.
"""

import sys
import os
from pathlib import Path

def quick_check():
    print("\n" + "="*60)
    print("LearnHub Backend - Quick Environment Check")
    print("="*60 + "\n")
    
    errors = []
    warnings = []
    
    # 1. Check Python version
    print("1. Python Version:", sys.version.split()[0])
    if sys.version_info < (3, 10):
        warnings.append("Python 3.10+ recommended")
    
    # 2. Check virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    print(f"2. Virtual Environment: {'✓ Active' if in_venv else '✗ Not active'}")
    if not in_venv:
        warnings.append("Not running in virtual environment")
    
    # 3. Check critical imports
    print("\n3. Critical Package Imports:")
    critical_imports = {
        'fastapi': 'FastAPI',
        'motor': 'Motor (MongoDB)',
        'dotenv': 'python-dotenv',
        'jose': 'python-jose (JWT)',
        'passlib': 'Passlib',
        'pydantic': 'Pydantic',
        'uvicorn': 'Uvicorn'
    }
    
    for module, name in critical_imports.items():
        try:
            __import__(module)
            print(f"   ✓ {name}")
        except ImportError:
            print(f"   ✗ {name}")
            errors.append(f"{name} not installed")
    
    # 4. Check .env file
    print("\n4. Configuration Files:")
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    
    if env_file.exists():
        print(f"   ✓ .env file found")
        
        # Load and check for required variables
        from dotenv import load_dotenv
        load_dotenv(env_file)
        
        required_vars = ['MONGO_URL', 'JWT_SECRET', 'DB_NAME']
        print("\n5. Required Environment Variables:")
        
        for var in required_vars:
            value = os.environ.get(var)
            if value:
                print(f"   ✓ {var} is set")
            else:
                print(f"   ✗ {var} is NOT set")
                errors.append(f"{var} not set in .env")
    else:
        print(f"   ✗ .env file NOT found at: {env_file}")
        errors.append(".env file missing")
    
    # Summary
    print("\n" + "="*60)
    if not errors and not warnings:
        print("✓ ALL CHECKS PASSED - Environment is ready!")
        print("\nStart the server with:")
        print("   uvicorn server:app --reload --port 8001")
    else:
        if errors:
            print(f"✗ ERRORS FOUND ({len(errors)}):")
            for err in errors:
                print(f"   - {err}")
        if warnings:
            print(f"\n⚠ WARNINGS ({len(warnings)}):")
            for warn in warnings:
                print(f"   - {warn}")
        
        print("\nFIX STEPS:")
        if any("not installed" in e for e in errors):
            print("   1. pip install -r requirements.txt")
        if ".env file missing" in errors:
            print("   2. Create .env file (see backend_env_template.txt)")
        if any("not set" in e for e in errors):
            print("   3. Add missing variables to .env file")
    
    print("="*60 + "\n")
    
    return len(errors) == 0

if __name__ == "__main__":
    success = quick_check()
    sys.exit(0 if success else 1)
