
import os
import hmac
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError
from pwdlib import PasswordHash

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

load_dotenv()

app = FastAPI(title="Tribal Scholarship API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET")
MONGODB_URL = os.getenv("MONGODB_URL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing from backend/.env")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL is missing from backend/.env")

if len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must contain at least 32 characters")

password_hash = PasswordHash.recommended()
security = HTTPBearer(auto_error=False)

# --------------------------------------------------
# MONGODB CONNECTION
# --------------------------------------------------

client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000,
)

client.admin.command("ping")

db = client["TribalScholarshipDB"]
students_collection = db["students"]
applications_collection = db["applications"]

students_collection.create_index("email", unique=True)

# --------------------------------------------------
# SCHOLARSHIP DATA
# --------------------------------------------------

scholarships = [
    {
        "id": 1,
        "name": "Post Matric Scholarship",
        "category": "Post Matric",
        "description": (
            "Financial assistance for eligible students "
            "studying after matriculation."
        ),
    },
    {
        "id": 2,
        "name": "Pre Matric Scholarship",
        "category": "Pre Matric",
        "description": (
            "Financial assistance for eligible school students."
        ),
    },
]

# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class StudentRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class ScholarshipApplication(BaseModel):
    scholarship_id: int


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    phone: str | None = None
    state: str | None = None
    district: str | None = None
    college: str | None = None
    course: str | None = None
    study_year: int | None = Field(default=None, ge=1, le=10)
    family_income: float | None = Field(default=None, ge=0)
    category: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str


# --------------------------------------------------
# AUTHENTICATION HELPERS
# --------------------------------------------------

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


def get_current_student(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in first",
        )

    payload = decode_access_token(credentials.credentials)

    # Do not allow an administrator token to act as a student.
    if payload.get("role", "student") != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    student = students_collection.find_one(
        {"email": email.lower()}
    )

    if not student:
        raise HTTPException(
            status_code=401,
            detail="Student account not found",
        )

    return student


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in as admin",
        )

    payload = decode_access_token(credentials.credentials)

    if (
        payload.get("role") != "admin"
        or payload.get("sub") != ADMIN_EMAIL
        or not ADMIN_EMAIL
    ):
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return payload


def create_access_token(
    email: str,
    role: str = "student",
) -> str:
    now = datetime.now(timezone.utc)

    return jwt.encode(
        {
            "sub": email,
            "role": role,
            "iat": now,
            "exp": now + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            ),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def serialize_application(application: dict) -> dict:
    return {
        "application_id": str(application["_id"]),
        "student_email": application["student_email"],
        "scholarship_id": application["scholarship_id"],
        "scholarship_name": application["scholarship_name"],
        "status": application["status"],
        "submitted_at": application.get("submitted_at"),
    }


# --------------------------------------------------
# BASIC / HEALTH ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    return {"message": "Tribal Scholarship API is running"}


@app.get("/health")
def health():
    try:
        client.admin.command("ping")
        return {
            "status": "ok",
            "database": "connected",
        }
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        )


# --------------------------------------------------
# SCHOLARSHIPS
# --------------------------------------------------

@app.get("/api/scholarships")
def get_scholarships():
    return scholarships


@app.get("/api/scholarships/{scholarship_id}")
def get_scholarship(scholarship_id: int):
    scholarship = next(
        (item for item in scholarships if item["id"] == scholarship_id),
        None,
    )

    if scholarship is None:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found",
        )

    return scholarship


# --------------------------------------------------
# STUDENT REGISTRATION
# --------------------------------------------------

@app.post("/api/auth/register")
def register_student(student: StudentRegister):
    name = student.name.strip()
    email = str(student.email).lower()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty",
        )

    if students_collection.find_one({"email": email}):
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    saved_student = {
        "name": name,
        "email": email,
        "password": password_hash.hash(student.password),
        "profile": {},
        "created_at": datetime.now(timezone.utc),
    }

    try:
        students_collection.insert_one(saved_student)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    return {
        "message": "Registration successful",
        "name": name,
        "email": email,
    }


# --------------------------------------------------
# STUDENT LOGIN
# --------------------------------------------------

@app.post("/api/auth/login")
def login_student(student: StudentLogin):
    email = str(student.email).lower()

    saved_student = students_collection.find_one(
        {"email": email}
    )

    if not saved_student or not password_hash.verify(
        student.password,
        saved_student["password"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "message": "Login successful",
        "access_token": create_access_token(email, "student"),
        "token_type": "bearer",
        "name": saved_student["name"],
        "email": email,
    }


# --------------------------------------------------
# STUDENT PROFILE
# --------------------------------------------------

@app.get("/api/profile/me")
def get_my_profile(
    current_student: dict = Depends(get_current_student),
):
    return {
        "name": current_student["name"],
        "email": current_student["email"],
        "profile": current_student.get("profile", {}),
    }


@app.put("/api/profile/me")
def update_my_profile(
    profile_data: StudentProfileUpdate,
    current_student: dict = Depends(get_current_student),
):
    data = profile_data.model_dump(exclude_unset=True)

    if "name" in data:
        name = data.pop("name")

        if name is not None:
            name = name.strip()
            if not name:
                raise HTTPException(
                    status_code=400,
                    detail="Name cannot be empty",
                )

            students_collection.update_one(
                {"_id": current_student["_id"]},
                {"$set": {"name": name}},
            )

    if data:
        updates = {
            f"profile.{key}": value
            for key, value in data.items()
        }

        students_collection.update_one(
            {"_id": current_student["_id"]},
            {"$set": updates},
        )

    updated_student = students_collection.find_one(
        {"_id": current_student["_id"]}
    )

    return {
        "message": "Profile updated successfully",
        "name": updated_student["name"],
        "email": updated_student["email"],
        "profile": updated_student.get("profile", {}),
    }


# --------------------------------------------------
# SUBMIT SCHOLARSHIP APPLICATION
# --------------------------------------------------

@app.post("/api/applications")
def submit_application(
    application: ScholarshipApplication,
    current_student: dict = Depends(get_current_student),
):
    student_email = current_student["email"]

    scholarship = next(
        (
            item for item in scholarships
            if item["id"] == application.scholarship_id
        ),
        None,
    )

    if scholarship is None:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found",
        )

    existing_application = applications_collection.find_one({
        "student_email": student_email,
        "scholarship_id": application.scholarship_id,
    })

    if existing_application:
        raise HTTPException(
            status_code=409,
            detail="You have already applied for this scholarship",
        )

    application_data = {
        "student_email": student_email,
        "scholarship_id": application.scholarship_id,
        "scholarship_name": scholarship["name"],
        "status": "Submitted",
        "submitted_at": datetime.now(timezone.utc),
    }

    try:
        result = applications_collection.insert_one(application_data)
    except PyMongoError:
        raise HTTPException(
            status_code=500,
            detail="Could not save application",
        )

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id),
        "scholarship_name": scholarship["name"],
        "status": "Submitted",
    }


# --------------------------------------------------
# STUDENT: VIEW MY APPLICATIONS
# --------------------------------------------------

@app.get("/api/applications/my")
def get_my_applications(
    current_student: dict = Depends(get_current_student),
):
    records = applications_collection.find(
        {"student_email": current_student["email"]}
    ).sort("submitted_at", -1)

    return [
        serialize_application(application)
        for application in records
    ]


# --------------------------------------------------
# ADMIN LOGIN
# --------------------------------------------------

@app.post("/api/admin/login")
def login_admin(admin: AdminLogin):
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=503,
            detail="Admin credentials are not configured on the server",
        )

    email = str(admin.email).lower()

    email_matches = hmac.compare_digest(email, ADMIN_EMAIL)
    password_matches = hmac.compare_digest(
        admin.password,
        ADMIN_PASSWORD,
    )

    if not email_matches or not password_matches:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin email or password",
        )

    return {
        "message": "Admin login successful",
        "access_token": create_access_token(email, "admin"),
        "token_type": "bearer",
    }


# --------------------------------------------------
# ADMIN: VIEW ALL APPLICATIONS
# --------------------------------------------------

@app.get("/api/admin/applications")
def get_all_admin_applications(
    admin: dict = Depends(get_current_admin),
):
    records = applications_collection.find().sort(
        "submitted_at", -1
    )

    return {
        "applications": [
            serialize_application(application)
            for application in records
        ]
    }


# --------------------------------------------------
# ADMIN: UPDATE APPLICATION STATUS
# --------------------------------------------------

@app.patch("/api/admin/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    admin: dict = Depends(get_current_admin),
):
    allowed_statuses = {
        "Submitted",
        "Under Review",
        "Approved",
        "Rejected",
    }

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    try:
        object_id = ObjectId(application_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID",
        )

    result = applications_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": status_update.status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return {
        "message": "Application status updated successfully",
        "application_id": application_id,
        "status": status_update.status,
    }
