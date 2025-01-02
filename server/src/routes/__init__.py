"""
API route handlers for the Alzheimer's Detection system.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, List

from .root_route import root_route
from .model_route import model_route, F1Score, generate_attention_map, plot_attention_overlay
from .test_route import test_route

__all__ = [
    'root_route',
    'model_route',
    'test_route',
    'F1Score',
    'generate_attention_map',
    'plot_attention_overlay',
    'APIRouter',
    'File',
    'UploadFile',
    'HTTPException',
    'JSONResponse'
] 