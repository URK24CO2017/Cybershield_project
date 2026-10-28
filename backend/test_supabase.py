#!/usr/bin/env python3
"""
CyberShield - Supabase PostgreSQL Connection & Verification Script
Usage:
  DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" python backend/test_supabase.py
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seed import seed_database
from app.models.models import User, Device, AccessPolicy

def main():
    print("==================================================")
    print(" CyberShield -> Supabase PostgreSQL Verification")
    print("==================================================")
    db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    
    # Hide password in output for security
    masked_url = db_url
    if "@" in db_url and ":" in db_url:
        try:
            prefix = db_url.split("://")[0]
            user_part, rest = db_url.split("://")[1].split("@")
            user = user_part.split(":")[0]
            masked_url = f"{prefix}://{user}:****@{rest}"
        except Exception:
            masked_url = "postgresql://***:***@supabase"
            
    print(f"Target Database URL: {masked_url}")

    if "sqlite" in db_url.lower():
        print("\n[NOTE] Currently configured to SQLite. To connect to Supabase, provide:")
        print("DATABASE_URL=\"postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres\"")
        print("\nTesting local database engine...")
    else:
        print("\nConnecting to Supabase PostgreSQL cluster...")

    try:
        # Create all tables in Supabase PostgreSQL
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created/verified successfully.")

        # Seed initial lab personas, devices, and policies
        seed_database()
        print("✓ Seeded default laboratory personas and devices.")

        # Query verification
        db = SessionLocal()
        user_count = db.query(User).count()
        device_count = db.query(Device).count()
        policy_count = db.query(AccessPolicy).count()
        db.close()

        print("\nVerification Summary:")
        print(f"  • Registered Users : {user_count}")
        print(f"  • Laboratory Devices: {device_count}")
        print(f"  • Security Policies : {policy_count}")
        print("\n[SUCCESS] Supabase connection is fully operational and primed for CyberShield!")
        return 0
    except Exception as e:
        print(f"\n[ERROR] Failed to connect to database: {e}")
        print("\nTroubleshooting Tips:")
        print("1. In Supabase, navigate to Project Settings -> Database.")
        print("2. Copy the URI under Connection string (use Transaction pooler port 6543 or Session port 5432).")
        print("3. Ensure your password doesn't have unescaped special characters (use URL-encoding if needed).")
        print("4. Verify that Network Restrictions in Supabase allow connections from your IP (or 0.0.0.0/0).")
        return 1

if __name__ == "__main__":
    sys.exit(main())
