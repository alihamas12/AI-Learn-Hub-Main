import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')

async def test_db():
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'learnhub')
        
        print(f"Connecting to database: {db_name}")
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        db = client[db_name]
        
        # Test user insertion
        test_user = {
            "id": "test123",
            "name": "Test User",
            "email": "testuser@test.com",
            "password": "hashed_password",
            "role": "student",
            "created_at": "2024-01-01T00:00:00"
        }
        
        # Check if user exists
        existing = await db.users.find_one({"email": test_user['email']})
        if existing:
            print(f"User already exists: {existing['email']}")
        else:
            await db.users.insert_one(test_user)
            print("✅ Test user created successfully!")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    asyncio.run(test_db())
