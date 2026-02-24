import asyncio
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')

async def fix_account():
    print("Connecting to MongoDB...")
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'learnhub')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("\n=== USERS ===")
    users = await db.users.find({}).to_list(1000)
    for u in users:
        print(f"User: {u.get('name')} | Email: {u.get('email')} | ID: {u.get('id')} | Role: {u.get('role')}")
        
        # Force update to admin
        await db.users.update_one({"id": u['id']}, {"$set": {"role": "admin"}})
        print(f" -> Promoted {u.get('email')} to ADMIN")

    print("\n=== INSTRUCTORS ===")
    instructors = await db.instructors.find({}).to_list(1000)
    for i in instructors:
        print(f"Instructor ID: {i.get('id')} | User ID: {i.get('user_id')} | Status: {i.get('verification_status')}")
        
    if not instructors:
        print("❌ NO INSTRUCTORS FOUND!")
        if users:
            print("Creating instructor for first user...")
            u = users[0]
            new_instructor = {
                "id": str(uuid.uuid4()),
                "user_id": u['id'],
                "bio": "Auto-generated",
                "verification_status": "approved",
                "earnings": 0.0,
                # Add status for consistency if needed by frontend models? 
                # Model says verification_status only.
            }
            await db.instructors.insert_one(new_instructor)
            print("✅ Created new instructor record.")

    client.close()

if __name__ == "__main__":
    asyncio.run(fix_account())
