import os
import sys

# Add the src directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.server import app

if __name__ == "__main__":
    app.run() 