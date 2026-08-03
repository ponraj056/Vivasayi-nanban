from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import tempfile
import os

from model.inference import predict_disease

app = FastAPI(title="Vivasayi Nanban - Disease Detection API")

# Allowed image types and max file size (5 MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_MB = 5


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file into memory to check size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.2f} MB). Max allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    # Save to a temporary file so the model can read it
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = predict_disease(tmp_path)
    finally:
        os.remove(tmp_path)  # clean up temp file

    return result