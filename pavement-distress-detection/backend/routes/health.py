from fastapi import APIRouter
from services.model_loader import get_loaded_model_names

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "models_loaded": get_loaded_model_names()
    }
