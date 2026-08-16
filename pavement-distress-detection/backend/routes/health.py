from fastapi import APIRouter
from services.model_loader import get_loaded_model_names

router = APIRouter()


@router.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {
        "status": "ok",
        "models_loaded": get_loaded_model_names()
    }
