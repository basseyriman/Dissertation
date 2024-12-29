import os
import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from src.routes.root_route import app_route
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(app_route)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
