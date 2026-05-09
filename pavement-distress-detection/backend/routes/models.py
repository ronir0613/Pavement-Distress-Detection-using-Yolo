import os
from fastapi import APIRouter
from config import MODELS_DIR

router = APIRouter()


@router.get("/models")
def list_models():
    """Return model names by scanning the models/ directory for .pt files."""
    try:
        files = os.listdir(MODELS_DIR)
        model_names = [
            os.path.splitext(f)[0]
            for f in files
            if f.endswith(".pt")
        ]
        return {"models": sorted(model_names)}
    except FileNotFoundError:
        return {"models": []}
