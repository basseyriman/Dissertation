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
    "http://localhost:3000",
    "https://dissertation-naob.onrender.com",
    "https://dissertation-ruby.vercel.app",
    "https://dissertation-7btvsdelz-bassey-rimans-projects.vercel.app",
    "*"  # Allow all origins temporarily for debugging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Remove prefix from model route since it's already defined in the router
app.include_router(root_route)
app.include_router(model_route)  # model_route already has prefix="/model"
app.include_router(test_route)

# Add a test endpoint to verify the server is running
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}

if __name__ == "__main__":
    print(f"Starting server on port {PORT}")
    print(f"Available routes:")
    for route in app.routes:
        print(f"{route.methods} {route.path}")
    uvicorn.run("src.server:app", host="0.0.0.0", port=int(PORT))
