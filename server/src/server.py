import os
import sys
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routes.root_route import root_route
from routes.model_route import model_route
from routes.test_route import test_route

load_dotenv()
PORT = os.getenv("PORT")
app = FastAPI()

origins = [
    'http://localhost:3000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Include all routes
app.include_router(root_route)
app.include_router(model_route)
app.include_router(test_route)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(PORT) if PORT else 8000)
