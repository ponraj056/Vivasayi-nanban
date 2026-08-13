from ultralytics import YOLO
from pathlib import Path
import json

MODEL_PATH = Path(__file__).parent / "yolov8_disease.pt"
model = YOLO(str(MODEL_PATH))

RECOMMENDATIONS_PATH = Path(__file__).parent.parent / "data" / "recommendations.json"
with open(RECOMMENDATIONS_PATH, "r", encoding="utf-8-sig") as f:
    RECOMMENDATIONS = json.load(f)

CONFIDENCE_THRESHOLD = 0.70


def predict_disease(image_path: str) -> dict:
    results = model.predict(source=image_path, verbose=False)
    result = results[0]

    top1_index = result.probs.top1
    confidence = float(result.probs.top1conf)
    class_name = result.names[top1_index]

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "disease": "unknown",
            "confidence": round(confidence, 4),
            "crop": "unknown",
            "recommendation_en": "This does not appear to be a recognizable crop leaf image. Please upload a clear, close-up photo of a paddy, tomato, sugarcane, or groundnut leaf.",
            "recommendation_ta": "இது ஒரு அடையாளம் காணக்கூடிய பயிர் இலை படமாக தெரியவில்லை. நெல், தக்காளி, கரும்பு அல்லது நிலக்கடலை இலையின் தெளிவான, நெருக்கமான புகைப்படத்தை பதிவேற்றவும்."
        }

    if "healthy" in class_name.lower():
        crop_name = class_name.split("_")[0]
        return {
            "disease": "healthy",
            "confidence": round(confidence, 4),
            "crop": crop_name,
            "recommendation_en": "Good news! This plant appears healthy with no visible disease symptoms. Continue your current care practices.",
            "recommendation_ta": "நல்ல செய்தி! இந்த செடி ஆரோக்கியமாக இருக்கிறது, நோய் அறிகுறிகள் எதுவும் இல்லை. தற்போதைய பராமரிப்பு முறைகளை தொடரவும்."
        }

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