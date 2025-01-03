import os
import sys
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import routes
from src.routes.root_route import root_route
from src.routes.model_route import model_route
from src.routes.test_route import test_route

load_dotenv()
PORT = os.getenv("PORT", "8000")

# Initialize FastAPI with custom error handling
app = FastAPI(
    title="Alzheimer's Detection API",
    description="API for detecting Alzheimer's disease from brain MRI scans using Vision Transformers",
    version="1.0.0"
)

# Configure CORS with all necessary headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Error handler for connection reset errors
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
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
    # Configure uvicorn with proper settings
    uvicorn.run(
        "src.server:app",
        host="0.0.0.0",
        port=int(PORT),
        workers=1,
        limit_concurrency=10,
        timeout_keep_alive=30,
        forwarded_allow_ips="*",
        proxy_headers=True,
        server_header=False
    )
