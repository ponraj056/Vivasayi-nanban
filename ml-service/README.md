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

### Known Limitations
1. Paddy classes have significantly fewer training images (40 per class) compared to other crops (450–1900+ per class). This class imbalance can bias predictions on real-world/unseen images, even when test-set accuracy is high.
2. The model is a pure classifier — it was never trained on "non-leaf" images (faces, random objects), so it always outputs one of its 12 known classes with some confidence, even for unrelated photos. A confidence threshold (0.70) is used to reject low-confidence predictions as "unknown," but this is a partial mitigation, not a guarantee: some non-leaf images can still receive high confidence scores, and some genuine leaf images (e.g., unfamiliar angles/varieties) can fall below the threshold. A proper fix would require training a dedicated "leaf vs. non-leaf" binary classifier on a diverse negative dataset.

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

## Local Setup
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```
Server runs at `http://127.0.0.1:8000`. Interactive API docs at `http://127.0.0.1:8000/docs`.

## Future Improvements
- Collect more paddy images and retrain with balanced classes
- Add a dedicated leaf-detection pre-filter (binary classifier: leaf vs. non-leaf) for more robust rejection of unrelated images
- Add more crops (Chilli, Maize, Cotton — candidate crops for next iteration)
- Add more disease classes per crop
- Collect real field images (current data is largely lab/studio-quality) to improve real-world accuracy

