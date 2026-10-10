
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

# Project paths
database_folder = Path(__file__).resolve().parent
project_folder = database_folder.parent
env_path = project_folder / "backend" / ".env"
json_path = database_folder / "sample_scholarships.json"

# Load the existing backend's MongoDB connection settings
load_dotenv(env_path)

mongodb_url = os.getenv("MONGODB_URL")

if not mongodb_url:
    raise RuntimeError(
        "MONGODB_URL is missing. Check backend/.env."
    )

# Read scholarship sample records
with open(json_path, "r", encoding="utf-8") as file:
    scholarships = json.load(file)

client = MongoClient(
    mongodb_url,
    serverSelectionTimeoutMS=30000
)

try:
    client.admin.command("ping")

    db = client["TribalScholarshipDB"]
    scholarships_collection = db["scholarships"]

    # Ensure each scholarship has a unique integer IDpython -c "from dotenv import load_dotenv; import os; from pymongo import MongoClient; load_dotenv('backend/.env', override=True); c=MongoClient(os.getenv('MONGODB_URL'), serverSelectionTimeoutMS=15000); print(c.admin.command('ping')); c.close()"
    scholarships_collection.create_index("id", unique=True)

    for scholarship in scholarships:
        scholarship_id = scholarship["id"]

        scholarships_collection.update_one(
            {"id": scholarship_id},
            {"$set": scholarship},
            upsert=True
        )

        print(
            f"Scholarship ID {scholarship_id} "
            "saved successfully."
        )

    print("Scholarship seed operation completed.")

finally:
    client.close()
