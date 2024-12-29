import io
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from rich.pretty import pprint
import tensorflow as tf
import numpy as np
from PIL import Image
from vit_keras import vit

model_route = APIRouter(prefix="/model", tags=["model"])


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

            # Load weights
            MODEL.load_weights('./model/RimanBassey_model.h5')
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise e


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

            # Get probabilities and make prediction
            class_probabilities = prediction[0].tolist()
            prediction_results = {
                class_name: float(prob)
                for class_name, prob in zip(CLASS_NAMES, class_probabilities)
            }

            predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
            confidence = float(np.max(prediction[0]))

            return {
                "file_name": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "class_probabilities": prediction_results
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
