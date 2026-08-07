# Vivasayi Nanban — Crop Disease Detection ML Service

## Overview
This service is the AI/ML module for Vivasayi Nanban, a farmer advisory platform. Farmers send a photo of a diseased crop leaf, and this service identifies the disease and returns treatment recommendations in Tamil and English.

## Model Architecture
- **Model:** YOLOv8n-cls (YOLOv8 Nano, classification variant)
- **Framework:** Ultralytics YOLOv8
- **Input size:** 224x224 pixels
- **Parameters:** ~1.4 million
- **Training platform:** Google Colab (Tesla T4 GPU)

## Dataset
- **Crops covered:** Paddy, Tomato
- **Classes (6 total):**
  - Paddy: Bacterial Leaf Blight, Brown Spot, Leaf Smut
  - Tomato: Early Blight, Late Blight, Leaf Mold
- **Sources:**
  - Paddy: [Rice Leaf Disease Dataset](https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases) (Kaggle)
  - Tomato: [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) (Kaggle)
- **Total images:** 3,981 (3,184 train / 397 validation / 400 test)
- **Split ratio:** 80% train / 10% validation / 10% test

## Training Details
- **Epochs:** 30
- **Batch size:** 32
- **Augmentation:** Enabled (random flips, HSV jitter, etc.)

## Accuracy Metrics
- **Top-1 Accuracy:** 99.2%
- **Top-5 Accuracy:** 100%
- **Training time:** ~10.5 minutes on Tesla T4 GPU

### Known Limitation
Paddy classes have significantly fewer training images (40 per class) compared to tomato classes (900–1900 per class). This class imbalance can bias predictions toward tomato classes on real-world/unseen images, even when test-set accuracy is high. Future improvement: collect more paddy images and retrain with balanced classes.

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{"status": "ok"}
```

### `POST /predict`
Accepts an image file and returns disease prediction with treatment recommendations.

**Request:** `multipart/form-data` with a `file` field (image: .jpg, .jpeg, .png, .webp, max 5MB)

**Response:**
```json
{
  "disease": "tomato_late_blight",
  "confidence": 0.9979,
  "crop": "tomato",
  "recommendation_en": "Apply fungicide with Metalaxyl or Copper oxychloride immediately...",
  "recommendation_ta": "உடனடியாக மெட்டாலாக்சில் அல்லது காப்பர்..."
}
```

## Tech Stack
- **API Framework:** FastAPI
- **Server:** Uvicorn
- **ML Framework:** Ultralytics YOLOv8 (PyTorch backend)
- **Deployment:** Render.com (free tier)

## Deployment
- **Platform:** Render.com
- **Live URL:** https://vivasayi-nanban.onrender.com
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `cd app && uvicorn main:app --host 0.0.0.0 --port $PORT`

**Note:** Free tier instances sleep after 15 minutes of inactivity. The first request after sleep may take 50+ seconds to respond while the instance wakes up.

## Project Structure