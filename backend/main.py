
import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

load_dotenv()

app = FastAPI(title="Tribal Scholarship API")

password_hash = PasswordHash.recommended()
JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing. Check your .env file.")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer(auto_error=False)

# Connect to MongoDB using the URL stored in .env
mongodb_url = os.getenv("MONGODB_URL")

if not mongodb_url:
    raise RuntimeError(
        "MONGODB_URL is missing. Check your .env file."
    )

client = MongoClient(
    mongodb_url,
    serverSelectionTimeoutMS=5000
)

# Check the database connection
client.admin.command("ping")

db = client["TribalScholarshipDB"]
students_collection = db["students"]

# Prevent duplicate email registrations
students_collection.create_index("email", unique=True)
def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in first"
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    student = students_collection.find_one({"email": email})

    if not student:
        raise HTTPException(
            status_code=401,
            detail="Student account not found"
        )

    return student

scholarships = [
    {
        "id": 1,
        "name": "Post Matric Scholarship",
        "category": "Post Matric",
        "description": (
            "Financial assistance for eligible students "
            "studying after matriculation."
        )
    },
    {
        "id": 2,
        "name": "Pre Matric Scholarship",
        "category": "Pre Matric",
        "description": (
            "Financial assistance for eligible school students."
        )
    }
]


class StudentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class StudentLogin(BaseModel):
    email: EmailStr
    password: str

class ScholarshipApplication(BaseModel):
    scholarship_id: int

class StudentProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    state: str | None = None
    district: str | None = None
    college: str | None = None
    course: str | None = None
    study_year: int | None = None
    family_income: float | None = None
    category: str | None = None


@app.get("/")
def home():
    return {"message": "Tribal Scholarship API is running"}


@app.get("/health")
def health():
    try:
        client.admin.command("ping")
        return {
            "status": "ok",
            "database": "connected"
        }
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )


@app.get("/api/scholarships")
def get_scholarships():
    return scholarships


@app.get("/api/scholarships/{scholarship_id}")
def get_scholarship(scholarship_id: int):
    for scholarship in scholarships:
        if scholarship["id"] == scholarship_id:
            return scholarship

    raise HTTPException(
        status_code=404,
        detail="Scholarship not found"
    )


@app.post("/api/auth/register")
def register_student(student: StudentRegister):
    email = str(student.email).lower()

    if len(student.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters"
        )

    if students_collection.find_one({"email": email}):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    saved_student = {
        "name": student.name,
        "email": email,
        "password": password_hash.hash(student.password)
    }

    try:
        students_collection.insert_one(saved_student)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    return {
        "message": "Registration successful",
        "name": student.name,
        "email": email
    }


@app.post("/api/auth/login")
def login_student(student: StudentLogin):
    email = str(student.email).lower()

    saved_student = students_collection.find_one(
        {"email": email}
    )

    if not saved_student or not password_hash.verify(
        student.password,
        saved_student["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = jwt.encode(
        {
            "sub": email,
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "name": saved_student["name"],
        "email": email
    }
@app.get("/api/profile/me")
def get_my_profile(
    current_student: dict = Depends(get_current_student)
):
    return {
        "name": current_student["name"],
        "email": current_student["email"],
        "profile": current_student.get("profile", {})
    }
@app.put("/api/profile/me")
def update_my_profile(
    profile_data: StudentProfileUpdate,
    current_student: dict = Depends(get_current_student)
):
    data = profile_data.model_dump(exclude_unset=True)

    name = data.pop("name", None)

    if name is not None:
        name = name.strip()
        if not name:
            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty"
            )
        students_collection.update_one(
            {"_id": current_student["_id"]},
            {"$set": {"name": name}}
        )

    if data:
        students_collection.update_one(
            {"_id": current_student["_id"]},
            {"$set": {
                f"profile.{key}": value
                for key, value in data.items()
            }}
        )

    updated_student = students_collection.find_one(
        {"_id": current_student["_id"]}
    )

    return {
        "message": "Profile updated successfully",
        "name": updated_student["name"],
        "email": updated_student["email"],
        "profile": updated_student.get("profile", {})
    }
@app.post("/api/applications")
def submit_application(
    application: ScholarshipApplication,
    current_student: dict = Depends(get_current_student)
):
    student_email = current_student.get("email")

    if not student_email:
        raise HTTPException(
            status_code=401,
            detail="Student email not found"
        )

    scholarship = next(
        (
            item for item in scholarships
            if item["id"] == application.scholarship_id
        ),
        None
    )

    if scholarship is None:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    applications_collection = db["applications"]

    existing_application = applications_collection.find_one({
        "student_email": student_email,
        "scholarship_id": application.scholarship_id
    })

    if existing_application:
        raise HTTPException(
            status_code=409,
            detail="You have already applied for this scholarship"
        )

    application_data = {
        "student_email": student_email,
        "scholarship_id": application.scholarship_id,
        "scholarship_name": scholarship["name"],
        "status": "Submitted",
        "submitted_at": datetime.utcnow()
    }

    result = applications_collection.insert_one(application_data)

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id),
        "scholarship_name": scholarship["name"],
        "status": "Submitted"
    }