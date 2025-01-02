import os
import sys
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import routes
from src.routes.root_route import root_route
from src.routes.model_route import model_route
from src.routes.test_route import test_route

load_dotenv()
PORT = os.getenv("PORT", "8000")  # Default to 8000 if PORT not set
app = FastAPI(
    title="Alzheimer's Detection API",
    description="API for detecting Alzheimer's disease from brain MRI scans using Vision Transformers",
    version="1.0.0"
)

# Configure CORS
origins = [
    'http://localhost:3000',
    'https://alzheimers-detection.onrender.com',  # Add your production frontend URL
    'https://dissertation-px71qeu86-bassey-rimans-projects.vercel.app/'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Include all routes
app.include_router(root_route, prefix="", tags=["root"])
app.include_router(model_route, prefix="/model", tags=["model"])
app.include_router(test_route, prefix="/test", tags=["test"])

if __name__ == "__main__":
    uvicorn.run("src.server:app", host="0.0.0.0", port=int(PORT))
