"""
Model-related utilities and configurations for the Alzheimer's Detection system.
"""

import tensorflow as tf
from tensorflow import keras
from vit_keras import vit
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# Model configuration
MODEL_PATH = "RimanBassey_model.h5"
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
IMAGE_SIZE = (224, 224)
NUM_CLASSES = len(CLASS_NAMES)

# Model parameters
VIT_PARAMS = {
    'image_size': IMAGE_SIZE[0],
    'pretrained': True,
    'include_top': False,
    'pretrained_top': False
}

__all__ = [
    'tf',
    'keras',
    'vit',
    'np',
    'Image',
    'plt',
    'MODEL_PATH',
    'CLASS_NAMES',
    'IMAGE_SIZE',
    'NUM_CLASSES',
    'VIT_PARAMS'
] 