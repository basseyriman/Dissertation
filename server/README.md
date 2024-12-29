# Alzheimer's Detection API

This project implements a FastAPI-based REST API that uses Vision Transformers (ViT) to detect and classify different stages of Alzheimer's disease from brain MRI scans.

## Overview

The API uses a Vision Transformer (ViT-B32) model fine-tuned on brain MRI scans to classify images into four categories:

- NonDemented
- MildDemented
- ModerateDemented
- VeryMildDemented

## Project Structure

```
├── model/
│   └── RimanBassey_model.h5    # Trained model weights
├── src/
│   ├── routes/
│   │   ├── model_route.py      # Model prediction endpoints
│   │   ├── root_route.py       # Root endpoint
│   │   └── test_route.py       # Test endpoints
│   └── server.py               # FastAPI server configuration
├── requirements.txt            # Project dependencies
└── README.md                   # This file
```

## Requirements

- Python 3.8+
- TensorFlow 2.13.0
- FastAPI
- Other dependencies listed in requirements.txt

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the API

1. Start the server:

```bash
uvicorn src.server:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

### Endpoints

#### 1. Root Endpoint

```
GET /
```

Returns basic API information.

#### 2. Model Information

```
GET /model
```

Returns information about the model version.

#### 3. Prediction Endpoint

```
POST /model/predict
```

Submit an MRI scan image for Alzheimer's classification.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: form-data with key "file" containing the image file

**Response:**

```json
{
  "file_name": "mri_scan.jpg",
  "predicted_class": "NonDemented",
  "confidence": 0.95,
  "class_probabilities": {
    "MildDemented": 0.02,
    "ModerateDemented": 0.01,
    "NonDemented": 0.95,
    "VeryMildDemented": 0.02
  }
}
```

### Interactive Documentation

FastAPI provides automatic interactive API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Technical Details

### Model Architecture

The system uses a Vision Transformer (ViT-B32) model with the following architecture:

- Base model: ViT-B32 (pretrained)
- Input size: 224x224x3
- Additional layers:
  - Dense layer (256 units, ReLU activation)
  - Dropout (0.4)
  - Output layer (4 units, Softmax activation)

### Image Processing

The API automatically handles various image formats and preprocessing:

- Resizes images to 224x224
- Handles grayscale and RGBA images
- Normalizes pixel values to [0,1]

## Error Handling

The API includes comprehensive error handling for:

- Invalid file uploads
- Image processing errors
- Model prediction errors
- Server errors

Each error returns an appropriate HTTP status code and detailed error message.

## Contributing

Please feel free to submit issues and pull requests.

## License

[Add your license information here]

```

This README provides a comprehensive overview of your project, including setup instructions, API documentation, and technical details. You may want to customize certain sections like the license information and repository URL according to your specific needs.

The documentation is structured to be both user-friendly for API consumers and informative for developers who might work on the project. The API documentation section provides clear examples of endpoints and expected responses, while the technical details section gives developers insight into the implementation.
```
