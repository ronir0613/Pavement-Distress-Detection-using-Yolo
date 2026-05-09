import logging
from fastapi import HTTPException
from ultralytics import YOLO
from config import MODELS_DIR, MODEL_NAMES

logger = logging.getLogger(__name__)

_models: dict = {}


def load_all_models():
    """Load every configured YOLO model into memory at startup."""
    for name in MODEL_NAMES:
        path = f"{MODELS_DIR}{name}.pt"
        try:
            logger.info(f"Loading model: {name} from {path}")
            _models[name] = YOLO(path)
            logger.info(f"Model loaded: {name}")
        except Exception as exc:
            logger.error(f"Failed to load model {name}: {exc}")


def get_model(name: str) -> YOLO:
    """Return a loaded model by name, or raise 404."""
    if name not in _models:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{name}' not found. Available: {list(_models.keys())}"
        )
    return _models[name]


def get_loaded_model_names() -> list[str]:
    """Return list of successfully loaded model names."""
    return list(_models.keys())
