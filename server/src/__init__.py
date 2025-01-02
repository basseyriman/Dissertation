"""
Alzheimer's Detection API using Vision Transformers.
This package contains the FastAPI server and routes for the Alzheimer's detection system.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

__version__ = "1.0.0"

__all__ = [
    'FastAPI',
    'CORSMiddleware',
    '__version__'
] 