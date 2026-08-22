import os
import logging
from fastapi import HTTPException
from ultralytics import YOLO
from config import MODELS_DIR, MODEL_NAMES

logger = logging.getLogger(__name__)

_models: dict = {}

# All known model names (used for validation even if not pre-loaded)
_ALL_KNOWN_MODEL_NAMES = ["run1_baseline_best", "run2_cbam_best", "run3_cbam_cls2_best", "BaseLine", "SimAM"]


def load_all_models():
    """Load every configured YOLO model into memory at startup.

    Only models listed in MODEL_NAMES (config.py) are eagerly loaded.
    All others are lazy-loaded on first request via get_model().
    """
    for name in MODEL_NAMES:
        _load_model(name)


def _load_model(name: str) -> YOLO | None:
    """Load a single model by name into the cache. Returns None on failure."""
    path = os.path.join(MODELS_DIR, f"{name}.pt")
    if not os.path.isfile(path):
        logger.error(f"Model file not found: {path}")
        return None
    try:
        logger.info(f"Loading model: {name} from {path}")
        _models[name] = YOLO(path)
        logger.info(f"Model loaded: {name}")
        return _models[name]
    except Exception as exc:
        logger.error(f"Failed to load model {name}: {exc}")
        return None


def get_model(name: str) -> YOLO:
    """Return a loaded model by name.

    If the model hasn't been loaded yet but a .pt file exists on disk,
    it is lazy-loaded on first request (avoids startup cost for unused models).
    Raises HTTP 404 if the model file doesn't exist.
    """
    if name in _models:
        return _models[name]

    # Lazy-load: check if .pt file exists before attempting load
    model = _load_model(name)
    if model is None:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{name}' not found or failed to load. "
                   f"Known models: {_ALL_KNOWN_MODEL_NAMES}"
        )
    return model


def get_loaded_model_names() -> list[str]:
    """Return list of successfully loaded model names."""
    return list(_models.keys())
