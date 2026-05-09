import uuid
import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from config import (
    ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB,
    UPLOADS_DIR, PREDICTIONS_DIR,
    DEFAULT_MODEL, DEFAULT_CONFIDENCE
)
from services import inference, visualizer, storage

router = APIRouter()
logger = logging.getLogger(__name__)

MB = 1024 * 1024


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = Form(DEFAULT_MODEL),
    confidence_threshold: float = Form(DEFAULT_CONFIDENCE),
):
    # --- Validate extension ---
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}"
        )

    # --- Validate file size ---
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * MB:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit."
        )

    # --- Generate unique ID ---
    prediction_id = str(uuid.uuid4())[:8]
    upload_filename = f"{prediction_id}_original{ext}"
    output_filename = f"{prediction_id}_output.jpg"

    upload_path = os.path.join(UPLOADS_DIR, upload_filename)
    output_path = os.path.join(PREDICTIONS_DIR, output_filename)

    # --- Save uploaded file ---
    import io
    storage.save_upload(io.BytesIO(contents), upload_filename)

    # --- Run inference ---
    try:
        result = inference.run_inference(upload_path, model_name, confidence_threshold)
    except Exception as exc:
        logger.error(f"Inference failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(exc)}")

    # --- Draw bounding boxes ---
    try:
        visualizer.draw_and_save(upload_path, result["detections"], output_path)
    except Exception as exc:
        logger.error(f"Visualization failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Visualization error: {str(exc)}")

    # --- Build & persist history record ---
    from datetime import datetime, timezone
    record = {
        "id": prediction_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_used": model_name,
        "confidence_threshold": confidence_threshold,
        "original_image": f"uploads/{upload_filename}",
        "annotated_image": f"predictions/{output_filename}",
        "inference_time_ms": result["inference_time_ms"],
        "total_detections": result["total_detections"],
        "detections": result["detections"],
    }
    storage.append_history(record)

    return JSONResponse(content={
        "prediction_id": prediction_id,
        "model_used": model_name,
        "confidence_threshold": confidence_threshold,
        "inference_time_ms": result["inference_time_ms"],
        "total_detections": result["total_detections"],
        "annotated_image_url": f"/predictions/{output_filename}",
        "original_image_url": f"/uploads/{upload_filename}",
        "detections": result["detections"],
    })
