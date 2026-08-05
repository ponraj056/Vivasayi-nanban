from ultralytics import YOLO

def train_model():
    # Load a pre-trained YOLOv8 model
    model = YOLO('yolov8n-cls.pt')

    # Train the model on your dataset
    # Make sure you have a 'dataset' folder with 'train' and 'val' subdirectories
    results = model.train(
        data='dataset',          # Path to the dataset directory
        epochs=50,               # Number of training epochs
        imgsz=224,               # Image size
        batch=16,                # Batch size
        name='disease_model',    # Output folder name for the weights
        project='runs/classify'  # Base directory for the output
    )

    print("Training complete! Weights saved to runs/classify/disease_model/weights/best.pt")

if __name__ == '__main__':
    train_model()
