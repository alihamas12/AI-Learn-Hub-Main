"""
MongoDB Connection String Fixer
================================
This script helps you fix the "bad auth" error by showing you exactly
what your .env file should look like.

IMPORTANT: Follow these steps IN ORDER
"""

import urllib.parse
import os
from pathlib import Path

print("\n" + "="*70)
print("MongoDB Atlas 'bad auth' Error - Step-by-Step Fix")
print("="*70 + "\n")

print("The 'bad auth' error means your password has special characters")
print("that need to be URL-encoded in the connection string.\n")

print("="*70)
print("STEP 1: Get Your MongoDB Atlas Credentials")
print("="*70 + "\n")

print("1. Go to: https://cloud.mongodb.com")
print("2. Click 'Database Access' in the left sidebar")
print("3. Find your database user")
print("   (NOT your Atlas account login!)")
print("\n")

print("If you don't remember the password:")
print("   - Click 'Edit' next to your user")
print("   - Click 'Edit Password'")
print("   - Click 'Autogenerate Secure Password' (recommended)")
print("   - Click 'Copy' to copy the password")
print("   - Click 'Update User'")
print("\n")

input("Press Enter when you have your username and password ready...")

print("\n" + "="*70)
print("STEP 2: Enter Your Credentials")
print("="*70 + "\n")

username = input("MongoDB Username: ").strip()
password = input("MongoDB Password: ").strip()

if not username or not password:
    print("\n❌ Error: Username and password cannot be empty!")
    print("Run this script again and enter valid credentials.\n")
    exit(1)

# Encode the password
encoded_password = urllib.parse.quote_plus(password)

print("\n" + "="*70)
print("STEP 3: Get Your Cluster Address")
print("="*70 + "\n")

print("1. In MongoDB Atlas, click 'Database' in the left sidebar")
print("2. Click 'Connect' on your cluster")
print("3. Select 'Connect your application'")
print("4. You'll see a connection string like:")
print("   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/...")
print("\n")
print("Copy just the cluster address part (the part after '@' and before '/')")
print("Example: cluster0.abc123.mongodb.net\n")

cluster = input("Cluster Address: ").strip()

if not cluster:
    print("\n❌ Error: Cluster address cannot be empty!")
    exit(1)

database = "learnhub"

# Build the connection string
mongo_url = f"mongodb+srv://{username}:{encoded_password}@{cluster}/{database}?retryWrites=true&w=majority"

print("\n" + "="*70)
print("✅ SUCCESS! Here's Your Fixed Connection String")
print("="*70 + "\n")

print("Copy these TWO lines:\n")
print("-" * 70)
print(f"MONGO_URL={mongo_url}")
print(f"DB_NAME={database}")
print("-" * 70)

print("\n" + "="*70)
print("STEP 4: Update Your .env File")
print("="*70 + "\n")

env_path = Path(__file__).parent / '.env'
print(f"1. Open this file: {env_path}")
print("2. Find the line that starts with 'MONGO_URL='")
print("3. REPLACE it with the MONGO_URL line above")
print("4. Make sure DB_NAME=learnhub exists too")
print("5. SAVE the file")
print("\n")

print("Your .env file should have these lines:")
print("-" * 70)
print(f"MONGO_URL={mongo_url}")
print(f"DB_NAME={database}")
print("JWT_SECRET=your-secret-key")
print("CORS_ORIGINS=http://localhost:3000")
print("-" * 70)

print("\n" + "="*70)
print("STEP 5: Verify the Encoding")
print("="*70 + "\n")

if password != encoded_password:
    print("✓ Your password WAS encoded (it had special characters)")
    print(f"  Original:  {password}")
    print(f"  Encoded:   {encoded_password}")
    print("\n  Special characters that were encoded:")
    
    special_chars = {}
    for char in password:
        if urllib.parse.quote_plus(char) != char:
            special_chars[char] = urllib.parse.quote_plus(char)
    
    for char, encoded in special_chars.items():
        print(f"    '{char}' → '{encoded}'")
else:
    print("ℹ Your password had NO special characters")
    print("  It's safe to use as-is, but I included it in the connection string anyway.")

print("\n" + "="*70)
print("STEP 6: Restart Your Server")
print("="*70 + "\n")

print("After saving the .env file:")
print("\n1. Stop the uvicorn server (if running):")
print("   Press Ctrl+C in the terminal running uvicorn")
print("\n2. Test the database connection:")
print("   python test_db.py")
print("\n3. If successful, start the server:")
print("   uvicorn server:app --reload --port 8001")
print("\n")

print("="*70)
print("Expected Success Output")
print("="*70 + "\n")

print("When you run: python test_db.py")
print("You should see:")
print("-" * 70)
print("Connecting to database: learnhub")
print("✅ MongoDB connection successful!")
print("-" * 70)

print("\n" + "="*70)
print("🎯 IMPORTANT: One More Thing!")
print("="*70 + "\n")

print("Make sure your IP address is whitelisted in MongoDB Atlas:")
print("\n1. Go to MongoDB Atlas")
print("2. Click 'Network Access' in the left sidebar")
print("3. Check if your IP is listed")
print("4. If not, click 'Add IP Address'")
print("5. For testing, you can add: 0.0.0.0/0 (allows all IPs)")
print("   Warning: Only use 0.0.0.0/0 for development!")
print("\n")

print("="*70)
print("\n✅ Setup complete! Now update your .env file and test.\n")
