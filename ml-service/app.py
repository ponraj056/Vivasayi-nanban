from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI(title="Vivasayi Nanban - Disease Detection ML Service")

# Load your custom trained weights (placeholder for now)
try:
    model = YOLO('runs/classify/disease_model/weights/best.pt')
except FileNotFoundError:
    print("Warning: Custom weights not found. Falling back to pre-trained model.")
    model = YOLO('yolov8n-cls.pt')

@app.post("/detect")
async def detect_disease(file: UploadFile = File(...)):
    try:
        # Read the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Run YOLOv8 inference
        results = model(image)
        
        # Parse results (YOLO classification format)
        names = results[0].names
        top_prob_index = results[0].probs.top1
        confidence = float(results[0].probs.top1conf)
        disease_name = names[top_prob_index]
        
        # Hardcode some recommendations based on class name
        recommendation = "Consult an agricultural expert for specific treatment."
        if "blight" in disease_name.lower():
            recommendation = "Apply fungicide spray. Ensure proper field drainage."
        elif "healthy" in disease_name.lower():
            recommendation = "Plant looks healthy! Maintain current practices."
            
        return JSONResponse({
            "success": True,
            "result": {
                "disease": disease_name,
                "confidence": confidence,
                "recommendation": recommendation
            }
        })
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
