import os
import sys
from pathlib import Path

# Get the absolute path of the current file
current_file = Path(__file__).resolve()

# Get the parent directory
project_root = current_file.parent

# Add the project root to the Python path
sys.path.insert(0, str(project_root))

from src.server import app

# This is used by gunicorn
application = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("wsgi:application", host="0.0.0.0", port=int(os.getenv("PORT", "8000"))) 