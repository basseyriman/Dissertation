"""
Alzheimer's Detection API using Vision Transformers.
This package contains the FastAPI server and routes for the Alzheimer's detection system.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import root_route, model_route, test_route
from .model import MODEL_PATH, CLASS_NAMES

__version__ = "1.0.0"

__all__ = [
    'FastAPI',
    'CORSMiddleware',
    'root_route',
    'model_route',
    'test_route',
    'MODEL_PATH',
    'CLASS_NAMES',
    '__version__'
] 