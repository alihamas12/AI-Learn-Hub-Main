#!/usr/bin/env python3
"""
MongoDB Password URL Encoder
==============================
Automatically URL-encode passwords for MongoDB Atlas connection strings.

Usage:
    python encode_mongodb_password.py
"""

import urllib.parse
import sys

def print_header():
    print("\n" + "="*70)
    print("MongoDB Atlas Password URL Encoder".center(70))
    print("="*70 + "\n")

def encode_password(password: str) -> str:
    """URL-encode a password for use in MongoDB connection strings"""
    return urllib.parse.quote_plus(password)

def show_encoding_details(password: str, encoded: str):
    """Show which characters were encoded"""
    print("\nEncoding Details:")
    print("-" * 70)
    
    special_chars = {}
    for i, char in enumerate(password):
        encoded_char = urllib.parse.quote_plus(char)
        if encoded_char != char:
            special_chars[char] = encoded_char
    
    if special_chars:
        print("\nSpecial characters that were encoded:")
        for char, encoded in special_chars.items():
            print(f"  '{char}' → '{encoded}'")
    else:
        print("\n✓ No special characters found - password is safe to use as-is")

def build_connection_string():
    """Interactive MongoDB connection string builder"""
    print("\n" + "="*70)
    print("MongoDB Atlas Connection String Builder")
    print("="*70 + "\n")
    
    print("I'll help you build your complete connection string.\n")
    
    # Get inputs
    username = input("Enter your MongoDB username: ").strip()
    password = input("Enter your MongoDB password: ").strip()
    
    # Encode password
    encoded_password = encode_password(password)
    
    print("\n📋 Paste your cluster address from MongoDB Atlas")
    print("   (Example: cluster0.abc123.mongodb.net)")
    cluster = input("Cluster address: ").strip()
    
    database = input("Database name (default: learnhub): ").strip() or "learnhub"
    
    # Build connection strings
    mongo_url = f"mongodb+srv://{username}:{encoded_password}@{cluster}/{database}?retryWrites=true&w=majority"
    
    # Display results
    print("\n" + "="*70)
    print("✅ Your Connection String (for .env file)")
    print("="*70 + "\n")
    
    print(f"MONGO_URL={mongo_url}")
    print(f"DB_NAME={database}")
    
    print("\n" + "="*70)
    print("Password Encoding Details")
    print("="*70)
    
    print(f"\nOriginal password:  {password}")
    print(f"Encoded password:   {encoded_password}")
    
    show_encoding_details(password, encoded_password)
    
    print("\n" + "="*70)
    print("Next Steps")
    print("="*70 + "\n")
    
    print("1. Copy the MONGO_URL line above")
    print("2. Paste it into your backend/.env file")
    print("3. Replace any existing MONGO_URL line")
    print("4. Save the .env file")
    print("5. Restart your server: uvicorn server:app --reload --port 8001")
    print("6. Test with: python test_db.py")
    
    print("\n" + "="*70 + "\n")

def quick_encode():
    """Quick password encoding only"""
    print("\nEnter the password you want to URL-encode:")
    print("(This will be the password from MongoDB Atlas Database Access)\n")
    
    password = input("Password: ").strip()
    
    if not password:
        print("\n❌ Error: Password cannot be empty")
        return
    
    encoded = encode_password(password)
    
    print("\n" + "="*70)
    print("Results")
    print("="*70 + "\n")
    
    print(f"Original:  {password}")
    print(f"Encoded:   {encoded}")
    
    show_encoding_details(password, encoded)
    
    print("\n" + "="*70)
    print("\n✅ Use the encoded password in your MongoDB connection string")
    print("\n💡 Tip: Copy the encoded password and paste it in place of <password>")
    print("   in your connection string from MongoDB Atlas.\n")

def main():
    """Main function"""
    print_header()
    
    print("Choose an option:\n")
    print("1. Build complete MongoDB connection string (recommended)")
    print("2. Just encode a password")
    print("3. Exit\n")
    
    choice = input("Your choice (1-3): ").strip()
    
    if choice == "1":
        build_connection_string()
    elif choice == "2":
        quick_encode()
    elif choice == "3":
        print("\n👋 Goodbye!\n")
        sys.exit(0)
    else:
        print("\n❌ Invalid choice. Please run again and select 1, 2, or 3.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user. Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        sys.exit(1)
