from ultralytics import YOLO
from pathlib import Path
import json

# Load the trained model once when the server starts
MODEL_PATH = Path(__file__).parent / "yolov8_disease.pt"
model = YOLO(str(MODEL_PATH))

# Load recommendations lookup
RECOMMENDATIONS_PATH = Path(__file__).parent.parent / "data" / "recommendations.json"
with open(RECOMMENDATIONS_PATH, "r", encoding="utf-8-sig") as f:    RECOMMENDATIONS = json.load(f)


def predict_disease(image_path: str) -> dict:
    """
    Takes a path to an image file, runs it through the YOLOv8 model,
    and returns disease, confidence, crop, and Tamil/English recommendations.
    """
    results = model.predict(source=image_path, verbose=False)
    result = results[0]

    # Get the class with highest confidence
    top1_index = result.probs.top1
    confidence = float(result.probs.top1conf)
    class_name = result.names[top1_index]  # e.g. "paddy_bacterial_blight"

    # Look up crop + recommendations for this disease class
    info = RECOMMENDATIONS.get(class_name, {
        "crop": "unknown",
        "recommendation_en": "No recommendation available for this disease yet.",
        "recommendation_ta": "இந்த நோய்க்கான பரிந்துரை இன்னும் இல்லை."
    })

    return {
        "disease": class_name,
        "confidence": round(confidence, 4),
        "crop": info["crop"],
        "recommendation_en": info["recommendation_en"],
        "recommendation_ta": info["recommendation_ta"]
    }