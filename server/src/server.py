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

# Configure CORS - Allow specific origins
origins = [
    "http://localhost:3000",
    "https://dissertation-naob.onrender.com",
    "https://dissertation-ruby.vercel.app",
    "https://dissertation-7btvsdelz-bassey-rimans-projects.vercel.app",
    "https://dissertation-git-main-bassey-rimans-projects.vercel.app",
    "https://dissertation-ruby.vercel.app"
]

# Add CORS middleware with more permissive settings for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(root_route)
app.include_router(model_route)
app.include_router(test_route)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}

if __name__ == "__main__":
    # Configure uvicorn for production
    uvicorn.run(
        "src.server:app",
        host="0.0.0.0",
        port=int(PORT),
        workers=1,  # Limit workers to conserve memory
        limit_concurrency=10,  # Limit concurrent requests
        timeout_keep_alive=30  # Reduce keep-alive timeout
    )
