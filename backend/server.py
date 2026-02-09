from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None
    phone: Optional[str] = None
    diseases: Optional[List[str]] = []
    created_at: str

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    times: List[str]
    instructions: Optional[str] = None

class Medication(BaseModel):
    id: str
    user_email: str
    name: str
    dosage: str
    frequency: str
    times: List[str]
    instructions: Optional[str] = None
    created_at: str

class DailyTrackerCreate(BaseModel):
    medication_id: str
    taken: bool
    taken_at: Optional[str] = None
    missed: bool = False

class DailyTracker(BaseModel):
    id: str
    user_email: str
    date: str
    medication_id: str
    medication_name: str
    scheduled_time: str
    taken: bool
    taken_at: Optional[str] = None
    missed: bool

class WaterIntakeRequest(BaseModel):
    glasses: int

class LunchRequest(BaseModel):
    eaten: bool

class WaterIntake(BaseModel):
    user_email: str
    date: str
    glasses: int

class LunchTracker(BaseModel):
    user_email: str
    date: str
    eaten: bool
    time: Optional[str] = None

class AppointmentCreate(BaseModel):
    doctor_name: str
    date: str
    time: str
    reason: Optional[str] = None
    type: str

class Appointment(BaseModel):
    id: str
    user_email: str
    doctor_name: str
    date: str
    time: str
    reason: Optional[str] = None
    type: str
    status: str
    created_at: str

class MessageCreate(BaseModel):
    doctor_name: str
    message: str

class Message(BaseModel):
    id: str
    user_email: str
    doctor_name: str
    message: str
    reply: Optional[str] = None
    created_at: str

@api_router.post("/auth/register")
async def register(user: UserRegister):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "age": user.age,
        "phone": user.phone,
        "diseases": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user.email})
    return {"token": token, "email": user.email, "name": user.name}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": credentials.email})
    return {"token": token, "email": user["email"], "name": user["name"]}

@api_router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return UserProfile(**current_user)

@api_router.put("/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {
            "name": profile.name,
            "age": profile.age,
            "phone": profile.phone,
            "diseases": profile.diseases
        }}
    )
    return {"message": "Profile updated successfully"}

@api_router.post("/medications", response_model=Medication)
async def create_medication(med: MedicationCreate, current_user: dict = Depends(get_current_user)):
    from uuid import uuid4
    med_id = str(uuid4())
    med_doc = {
        "id": med_id,
        "user_email": current_user["email"],
        "name": med.name,
        "dosage": med.dosage,
        "frequency": med.frequency,
        "times": med.times,
        "instructions": med.instructions,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.medications.insert_one(med_doc)
    return Medication(**med_doc)

@api_router.get("/medications", response_model=List[Medication])
async def get_medications(current_user: dict = Depends(get_current_user)):
    meds = await db.medications.find({"user_email": current_user["email"]}, {"_id": 0}).to_list(1000)
    return [Medication(**med) for med in meds]

@api_router.put("/medications/{med_id}")
async def update_medication(med_id: str, med: MedicationCreate, current_user: dict = Depends(get_current_user)):
    result = await db.medications.update_one(
        {"id": med_id, "user_email": current_user["email"]},
        {"$set": med.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication updated successfully"}

@api_router.delete("/medications/{med_id}")
async def delete_medication(med_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.medications.delete_one({"id": med_id, "user_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted successfully"}

@api_router.post("/tracker/medication")
async def track_medication(tracker: DailyTrackerCreate, current_user: dict = Depends(get_current_user)):
    from uuid import uuid4
    med = await db.medications.find_one({"id": tracker.medication_id, "user_email": current_user["email"]}, {"_id": 0})
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    tracker_doc = {
        "id": str(uuid4()),
        "user_email": current_user["email"],
        "date": today,
        "medication_id": tracker.medication_id,
        "medication_name": med["name"],
        "scheduled_time": tracker.taken_at or datetime.now(timezone.utc).isoformat(),
        "taken": tracker.taken,
        "taken_at": tracker.taken_at,
        "missed": tracker.missed
    }
    await db.daily_tracker.insert_one(tracker_doc)
    return {"message": "Medication tracked successfully"}

@api_router.get("/tracker/today")
async def get_today_tracker(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    trackers = await db.daily_tracker.find(
        {"user_email": current_user["email"], "date": today},
        {"_id": 0}
    ).to_list(1000)
    
    water = await db.water_intake.find_one(
        {"user_email": current_user["email"], "date": today},
        {"_id": 0}
    ) or {"glasses": 0}
    
    lunch = await db.lunch_tracker.find_one(
        {"user_email": current_user["email"], "date": today},
        {"_id": 0}
    ) or {"eaten": False}
    
    return {
        "medications": trackers,
        "water": water.get("glasses", 0),
        "lunch": lunch.get("eaten", False)
    }

@api_router.post("/tracker/water")
async def track_water(glasses: int, current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    await db.water_intake.update_one(
        {"user_email": current_user["email"], "date": today},
        {"$set": {"glasses": glasses, "date": today, "user_email": current_user["email"]}},
        upsert=True
    )
    return {"message": "Water intake tracked successfully"}

@api_router.post("/tracker/lunch")
async def track_lunch(eaten: bool, current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    time = datetime.now(timezone.utc).isoformat() if eaten else None
    await db.lunch_tracker.update_one(
        {"user_email": current_user["email"], "date": today},
        {"$set": {"eaten": eaten, "time": time, "date": today, "user_email": current_user["email"]}},
        upsert=True
    )
    return {"message": "Lunch tracked successfully"}

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appt: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    from uuid import uuid4
    appt_doc = {
        "id": str(uuid4()),
        "user_email": current_user["email"],
        "doctor_name": appt.doctor_name,
        "date": appt.date,
        "time": appt.time,
        "reason": appt.reason,
        "type": appt.type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(appt_doc)
    return Appointment(**appt_doc)

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    appts = await db.appointments.find({"user_email": current_user["email"]}, {"_id": 0}).to_list(1000)
    return [Appointment(**appt) for appt in appts]

@api_router.post("/messages", response_model=Message)
async def send_message(msg: MessageCreate, current_user: dict = Depends(get_current_user)):
    from uuid import uuid4
    msg_doc = {
        "id": str(uuid4()),
        "user_email": current_user["email"],
        "doctor_name": msg.doctor_name,
        "message": msg.message,
        "reply": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg_doc)
    return Message(**msg_doc)

@api_router.get("/messages", response_model=List[Message])
async def get_messages(current_user: dict = Depends(get_current_user)):
    msgs = await db.messages.find({"user_email": current_user["email"]}, {"_id": 0}).to_list(1000)
    return [Message(**msg) for msg in msgs]

@api_router.get("/reminders")
async def get_reminders(current_user: dict = Depends(get_current_user)):
    meds = await db.medications.find({"user_email": current_user["email"]}, {"_id": 0}).to_list(1000)
    appts = await db.appointments.find(
        {"user_email": current_user["email"], "status": "pending"},
        {"_id": 0}
    ).to_list(1000)
    
    return {
        "medications": meds,
        "appointments": appts
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()