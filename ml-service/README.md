# Vivasayi Nanban — Crop Disease Detection ML Service

## Overview
This service is the AI/ML module for Vivasayi Nanban, a farmer advisory platform. Farmers send a photo of a diseased crop leaf, and this service identifies the disease and returns treatment recommendations in Tamil and English.

## Model Architecture
- **Model:** YOLOv8n-cls (YOLOv8 Nano, classification variant)
- **Framework:** Ultralytics YOLOv8
- **Input size:** 224x224 pixels
- **Parameters:** ~1.45 million
- **Training platform:** Google Colab (Tesla T4 GPU)

## Dataset
- **Crops covered:** Paddy, Tomato, Sugarcane, Groundnut
- **Classes (12 total):**
  - Paddy: Bacterial Leaf Blight, Brown Spot, Leaf Smut
  - Tomato: Early Blight, Late Blight, Leaf Mold
  - Sugarcane: Red Rot, Rust, Mosaic
  - Groundnut: Early Leaf Spot, Late Leaf Spot, Rust
- **Sources:**
  - Paddy: [Rice Leaf Disease Dataset](https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases) (Kaggle)
  - Tomato: [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) (Kaggle)
  - Sugarcane: [Sugarcane Leaf Disease Dataset](https://www.kaggle.com/datasets/nirmalsankalana/sugarcane-leaf-disease-dataset) (Kaggle)
  - Groundnut: [Groundnut Plant Leaf Data](https://www.kaggle.com/datasets/warcoder/groundnut-plant-leaf-data) (Kaggle)
- **Total images:** ~11,547 (8,596 train / 1,466 validation / 1,485 test)
- **Split ratio:** 80% train / 10% validation / 10% test

## Training Details
- **Epochs:** 30
- **Batch size:** 32
- **Augmentation:** Enabled (random flips, HSV jitter, etc.)
- **Training time:** ~32 minutes on Tesla T4 GPU

## Accuracy Metrics
- **Top-1 Accuracy:** 99.5%
- **Top-5 Accuracy:** 100%

### Known Limitation
Paddy classes have significantly fewer training images (40 per class) compared to other crops (450–1900+ per class). This class imbalance can bias predictions on real-world/unseen images, even when test-set accuracy is high. Future improvement: collect more paddy images and retrain with balanced classes.

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
  "disease": "groundnut_late_leaf_spot",
  "confidence": 0.6034,
  "crop": "groundnut",
  "recommendation_en": "Apply fungicide spray at early symptom stage for best results...",
  "recommendation_ta": "நோய் ஆரம்ப கட்டத்திலேயே பூஞ்சைக் கொல்லியை தெளிக்கவும்..."
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