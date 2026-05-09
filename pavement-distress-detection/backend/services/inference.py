import time
import logging
import numpy as np
import cv2
from PIL import Image

from config import CLASS_NAMES
from services.model_loader import get_model

logger = logging.getLogger(__name__)


def _load_image_as_bgr(image_path: str) -> np.ndarray:
    """
    Load any image (jpg, png, webp, tiff, bmp, rgba, etc.) using Pillow,
    convert to a standard 3-channel BGR numpy array for OpenCV / YOLO.
    """
    with Image.open(image_path) as pil_img:
        # Convert palette / RGBA / L / other modes -> RGB
        pil_img = pil_img.convert("RGB")
        arr = np.array(pil_img, dtype=np.uint8)
    # PIL gives RGB, OpenCV expects BGR
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


def run_inference(image_path: str, model_name: str, confidence_threshold: float) -> dict:
    """
    Run YOLO inference on a given image and return structured results.
    Supports any image format and any dimension.

    Returns:
        {
            "detections": [...],
            "inference_time_ms": int,
            "total_detections": int
        }
    """
    model = get_model(model_name)

    # --- Load with PIL so any format / colour-mode works ---
    bgr_img = _load_image_as_bgr(image_path)
    h, w = bgr_img.shape[:2]
    logger.info(f"Image native size: {w}x{h}")

    # Do NOT pass a custom imgsz — letting YOLO use the image's native
    # resolution avoids letterboxing/padding that shifts box coordinates.
    # We read xyxyn (normalised 0-1) and scale back ourselves so the
    # coordinates are always guaranteed to be in the original image space.
    start = time.time()
    results = model.predict(
        source=bgr_img,
        conf=confidence_threshold,
        verbose=False,
    )
    inference_time_ms = int((time.time() - start) * 1000)

    detections = []
    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            class_id = int(box.cls[0])
            class_name = (
                CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES)
                else f"class_{class_id}"
            )
            confidence = round(float(box.conf[0]), 2)

            # xyxyn = normalised coords (0-1) relative to the original image.
            # Multiplying by actual w/h gives pixel coords in original space.
            xn1, yn1, xn2, yn2 = box.xyxyn[0].tolist()
            bbox = [
                int(xn1 * w),
                int(yn1 * h),
                int(xn2 * w),
                int(yn2 * h),
            ]

            detections.append({
                "class_name": class_name,
                "confidence": confidence,
                "bbox": bbox,
            })

    return {
        "detections": detections,
        "inference_time_ms": inference_time_ms,
        "total_detections": len(detections),
    }
