import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from routes.root_route import app_route

load_dotenv()

app = FastAPI()
app.include_router(app_route)

PORT = int(os.getenv("PORT", "8001"))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True) 