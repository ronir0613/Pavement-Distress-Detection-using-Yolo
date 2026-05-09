import os

MODELS_DIR = os.environ.get("MODELS_DIR", "models/")
UPLOADS_DIR = os.environ.get("UPLOADS_DIR", "uploads/")
PREDICTIONS_DIR = os.environ.get("PREDICTIONS_DIR", "predictions/")
HISTORY_FILE = os.environ.get("HISTORY_FILE", "history.json")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"}
MAX_FILE_SIZE_MB = 50

MODEL_NAMES = ["run1_baseline_best", "run2_cbam_best", "run3_cbam_cls2_best", "BaseLine", "SimAM"]
DEFAULT_MODEL = "run1_baseline_best"
DEFAULT_CONFIDENCE = 0.5

CLASS_NAMES = ["Crack", "Pothole", "Surface Disintegration"]

BBOX_COLORS = {
    "Crack": (0, 0, 255),                   # Red (BGR)
    "Pothole": (0, 165, 255),               # Orange (BGR)
    "Surface Disintegration": (128, 0, 128) # Purple (BGR)
}

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
