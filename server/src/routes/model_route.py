import io
import os
import base64
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from rich.pretty import pprint
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit
import matplotlib.pyplot as plt

model_route = APIRouter(prefix="/model", tags=["model"])

# Get the absolute path to the model file
CURRENT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = CURRENT_DIR.parent.parent
MODEL_PATH = os.path.join(PROJECT_ROOT, "model", "RimanBassey_model.h5")

# Defining custom F1 Score metric
class F1Score(tf.keras.metrics.Metric):
    def __init__(self, name="f1_score", **kwargs):
        super(F1Score, self).__init__(name=name, **kwargs)
        self.precision = tf.keras.metrics.Precision()
        self.recall = tf.keras.metrics.Recall()

    def update_state(self, y_true, y_pred, sample_weight=None):
        self.precision.update_state(y_true, y_pred, sample_weight)
        self.recall.update_state(y_true, y_pred, sample_weight)

    def result(self):
        precision = self.precision.result()
        recall = self.recall.result()
        return 2 * ((precision * recall) / (precision + recall + tf.keras.backend.epsilon()))

    def reset_state(self):
        self.precision.reset_state()
        self.recall.reset_state()


# Global variables
MODEL = None
CLASS_NAMES = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]


def load_model_if_needed():
    global MODEL
    if MODEL is None:
        print("Loading model for the first time...")
        print(f"Looking for model at: {MODEL_PATH}")
        try:
            # Create base model
            vit_model = vit.vit_b32(
                image_size=224,
                pretrained=True,
                include_top=False,
                pretrained_top=False
            )
            vit_model.trainable = False

            # Create model architecture
            inputs = tf.keras.layers.Input(shape=(224, 224, 3))
            x = vit_model(inputs, training=False)
            x = tf.keras.layers.Dense(256, activation='relu',
                                      kernel_regularizer=tf.keras.regularizers.L2(0.01))(x)
            x = tf.keras.layers.Dropout(0.4)(x)
            outputs = tf.keras.layers.Dense(4, activation='softmax')(x)

            MODEL = tf.keras.Model(inputs, outputs)

            # Check if model file exists
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            # Load weights
            MODEL.load_weights(MODEL_PATH)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Directory contents: {os.listdir(os.getcwd())}")
            raise e


def generate_attention_map(image_array):
    global MODEL
    try:
        # Extract ViT sub-model
        vit_model = MODEL.get_layer("vit-b32")

        # Get the last encoder block
        last_encoder = vit_model.get_layer("Transformer/encoderblock_11")
        print("Found last encoder block")

        # Create intermediate model for attention extraction - directly access output[1] for attention weights
        intermediate_model = tf.keras.Model(inputs=vit_model.input, outputs=last_encoder.output[1])

        # Get attention output
        attention_output = intermediate_model(image_array)
        print(f"Attention output shape: {attention_output.shape}")

        # Average attention weights across heads
        attention_avg = tf.reduce_mean(attention_output, axis=1).numpy()[0]
        print(f"Averaged attention shape: {attention_avg.shape}")

        # Get class token attention (skip first token)
        class_token_attention = attention_avg[0, 1:]
        print(f"Class token attention shape: {class_token_attention.shape}")

        # Calculate grid size (should be 7x7 based on the warning message)
        grid_size = int(np.sqrt(len(class_token_attention)))
        print(f"Grid size: {grid_size}")

        # Reshape to grid
        attention_grid = class_token_attention.reshape(grid_size, grid_size)

        # Normalize attention map
        attention_normalized = (attention_grid - np.min(attention_grid)) / (
                np.max(attention_grid) - np.min(attention_grid) + 1e-8)

        # Resize attention map to match image size
        attention_resized = tf.image.resize(attention_normalized[..., np.newaxis], (224, 224)).numpy()

        return attention_resized

    except Exception as e:
        print(f"Error generating attention map: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None


def plot_attention_overlay(image_array, attention_map):
    try:
        if attention_map is None:
            # If attention map generation failed, return only the original image
            plt.figure(figsize=(5, 5))
            plt.imshow(image_array)
            plt.title("Original Image (Attention Map Unavailable)")
            plt.axis("off")
        else:
            plt.figure(figsize=(10, 5))

            # Plot original image
            plt.subplot(1, 2, 1)
            plt.imshow(image_array)
            plt.title("Original Image")
            plt.axis("off")

            # Plot image with attention overlay
            plt.subplot(1, 2, 2)
            plt.imshow(image_array)
            plt.imshow(attention_map.squeeze(), cmap="jet", alpha=0.5)
            plt.title("Attention Map Overlay")
            plt.axis("off")

        # Save plot to bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        buf.seek(0)

        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return img_str
    except Exception as e:
        print(f"Error plotting attention overlay: {str(e)}")
        return None


@model_route.get('/')
async def get_model():
    return {
        "Model": "Vision Transformers!",
        "Version": "1.0.0",
    }


@model_route.post('/predict')
async def predict_model(file: UploadFile):
    try:
        print('File received')
        pprint(file)

        # Validate file exists
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        try:
            file_content = await file.read()
            img = Image.open(io.BytesIO(file_content))
        except Exception as e:
            print(f"Error reading image file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error reading image file: {str(e)}")

        try:
            img = img.resize((224, 224))
            img_array = np.array(img)

            # Ensure image has 3 channels
            if len(img_array.shape) == 2:  # If grayscale
                img_array = np.stack((img_array,) * 3, axis=-1)
            elif img_array.shape[-1] == 4:  # If RGBA
                img_array = img_array[:, :, :3]

            # Store original image array for visualization
            original_img_array = img_array.copy()

            # Normalize and add batch dimension
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            print(f"Input shape: {img_array.shape}")  # Debug print

        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            print(f"Original image shape: {np.array(img).shape}")  # Debug print
            raise HTTPException(status_code=500, detail=f"Error preprocessing image: {str(e)}")

        try:
            # Load or get the model
            load_model_if_needed()

            print("Making prediction...")
            with tf.device('/CPU:0'):
                prediction = MODEL.predict(img_array, batch_size=1)
            print("Prediction completed")

            # Generate attention map
            print("Generating attention map...")
            attention_map = generate_attention_map(img_array)
            print(f"Attention map present: {attention_map is not None}")

            # Create visualization
            visualization = plot_attention_overlay(original_img_array, attention_map)
            print(f"Visualization generated: {visualization is not None}")

            # Get probabilities and make prediction
            class_probabilities = prediction[0].tolist()
            prediction_results = {
                class_name: float(prob)
                for class_name, prob in zip(CLASS_NAMES, class_probabilities)
            }

            predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
            confidence = float(np.max(prediction[0]))

            print(type(visualization))
            print(visualization)

            return {
                "file_name": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "class_probabilities": prediction_results,
                "attention_map_visualization": visualization if visualization else None
            }

        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error during prediction: {str(e)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
