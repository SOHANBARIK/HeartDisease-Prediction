from PIL import Image
from pdf2image import convert_from_bytes
from fastapi import UploadFile, File
# from backend.ocr_utils import extract_parameters
from ocr_utils import extract_parameters
import io
import os
import uvicorn
import numpy as np
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from openai import OpenAI
from joblib import load
from dotenv import load_dotenv
from supabase import create_client, Client 
from datetime import datetime, timedelta
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt

# 1. Load environment variables
load_dotenv()

# --- CONFIGURATION (Supabase) ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# --- CONFIGURATION (MongoDB & Auth) ---
MONGODB_URL = os.environ.get("MONGODB_URL")
SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey123") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize Clients
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Supabase Error: {e}")

mongo_client = None
db = None
users_collection = None

if MONGODB_URL:
    try:
        #Added timeouts and connect=False to handle "Idle Disconnects"
        mongo_client = MongoClient(
            MONGODB_URL, 
            serverSelectionTimeoutMS=5000, # Fail fast (5s) if connection is bad
            socketTimeoutMS=45000,         # Keep socket logic aligned with server
            connect=False                  # Lazy connection (connects on first request)
        )
        db = mongo_client["medinauts_db"] 
        users_collection = db["users"]    
        print("✅ Connected to MongoDB")
        print("✅ Mongodb Client Initialized (Lazy Connect)")
    except Exception as e:
        print(f"❌ MongoDB Init Error: {e}")

# Security Utils
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 2. Initialize FastAPI
app = FastAPI()

# 3. CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Initialize LLM Client
client = OpenAI(
    base_url=os.environ.get("BASE_URL"),
    api_key=os.environ.get("LLM_API_KEY"), 
)

# --- MODEL LOADING ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "heart_model.joblib")
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = load(MODEL_PATH)
except Exception as e:
    print(f"❌ Error loading model: {e}")


# --- DATA MODELS ---
class ChatRequest(BaseModel):
    message: str

class HeartDiseaseRequest(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

class FeedbackModel(BaseModel):
    rating: int
    message: str

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- AUTH FUNCTIONS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ✅ NEW: Helper function to verify tokens
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

# --- ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "Medinauts API is running"}

# 1. REGISTER USER
@app.post("/register")
def register(user: UserCreate):
    if users_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pw = get_password_hash(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_pw})
    return {"message": "User created successfully"}

# 2. LOGIN (Generate Token)
@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if users_collection is None:
        raise HTTPException(status_code=503, detail="Database not available")

    user = users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- CHATBOT (Using LLM) ---

# Default to LLM's
AI_MODEL_NAME = os.environ.get("AI_MODEL")

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        system_prompt = """You are the official AI assistant for Medinauts.
        Medinauts is a heart disease prediction application available at https://medinauts.vercel.app.
        Your goal is to assist users with heart health queries and explain how the prediction model works.
        Keep your answers helpful, medical, but concise. Always refer to Medinauts as 'we' or 'our platform'."""

        # ✅ LLM CALL (No extra headers needed)
        completion = client.chat.completions.create(
            model=AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
        )

        reply_content = completion.choices[0].message.content
        print(f"🤖 AI Reply: {reply_content}")

        if not reply_content:
            return {"reply": "I apologize, I'm thinking a bit slow right now. Could you ask that again?"}

        return {"reply": reply_content}

    except Exception as e:
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scan-report")
async def scan_report(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = None

        # 1. Handle PDF Files
        if file.content_type == "application/pdf" or file.filename.lower().endswith(".pdf"):
            try:
                # Convert first page of PDF to image
                pages = convert_from_bytes(contents)
                if pages:
                    image = pages[0] # Take the first page
            except Exception as e:
                print(f"❌ PDF Conversion Error: {e}")
                raise HTTPException(status_code=400, detail="Could not convert PDF. Try uploading an Image.")

        # 2. Handle Image Files (JPG, PNG)
        else:
            try:
                image = Image.open(io.BytesIO(contents)).convert("RGB")
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid image file.")

        if image is None:
             raise HTTPException(status_code=400, detail="File could not be processed.")

        # 3. Pass the valid image to your OCR utility
        extracted_values = extract_parameters(image)
        
        return {"status": "success", "data": extracted_values}

    except Exception as e:
        print(f"❌ Server Error: {e}")
        # This details exactly why it failed in your frontend response
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
# ✅ SECURED: Added 'get_current_user' dependency
def predict(input_data: HeartDiseaseRequest, current_user: str = Depends(get_current_user)):
    if not model:
        raise HTTPException(status_code=500, detail="Model file not found")
    features = [
        input_data.age, input_data.sex, input_data.cp, input_data.trestbps,
        input_data.chol, input_data.fbs, input_data.restecg, input_data.thalach,
        input_data.exang, input_data.oldpeak, input_data.slope, input_data.ca,
        input_data.thal
    ]
    try:
        prediction = model.predict([features])[0].item()
        probability = model.predict_proba([features])[0][1].item()
        return {"prediction": int(prediction), "probability": float(probability)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/feedback")
def save_feedback(feedback: FeedbackModel):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        data = { "rating": feedback.rating, "message": feedback.message }
        supabase.table("feedbacks").insert(data).execute()
        return {"status": "success", "message": "Feedback saved"}
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return {"status": "error", "message": str(e)}

# --- NEW ENDPOINT: GET USER COUNT ---
@app.get("/user-count")
def get_user_count():
    # ✅ FIX: Explicitly check against None for current pymongo versions
    if users_collection is None:
        return {"count": 0}
    
    try:
        # Get count of all users in the collection
        count = users_collection.count_documents({})
        # You can add a base number (like 50000) if you want it to look larger
        display_count = count 
        return {"count": display_count}
    except Exception as e:
        print(f"❌ Error fetching user count: {e}")
        return {"count": 0} # Fallback to your static number

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host='0.0.0.0', port=port)
