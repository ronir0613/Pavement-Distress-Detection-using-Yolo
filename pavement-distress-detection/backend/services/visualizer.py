import cv2
import numpy as np
import logging
from PIL import Image
from config import BBOX_COLORS

logger = logging.getLogger(__name__)


def _load_as_bgr(image_path: str) -> np.ndarray:
    """Load any image format via Pillow and return as BGR numpy array."""
    with Image.open(image_path) as pil_img:
        pil_img = pil_img.convert("RGB")
        arr = np.array(pil_img, dtype=np.uint8)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


def draw_and_save(image_path: str, detections: list, output_path: str):
    """
    Draw bounding boxes with semi-transparent overlays on the image and save.
    Label format: "Crack 87%"
    """
    image = _load_as_bgr(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    overlay = image.copy()

    for det in detections:
        class_name = det["class_name"]
        confidence = det["confidence"]
        x1, y1, x2, y2 = det["bbox"]

        color = BBOX_COLORS.get(class_name, (255, 255, 255))

        # 40% opacity filled rectangle
        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)

    # Blend overlay with original (40% opacity)
    image = cv2.addWeighted(overlay, 0.4, image, 0.6, 0)

    for det in detections:
        class_name = det["class_name"]
        confidence = det["confidence"]
        x1, y1, x2, y2 = det["bbox"]

        color = BBOX_COLORS.get(class_name, (255, 255, 255))
        label = f"{class_name} {int(confidence * 100)}%"

        # Draw solid border rectangle
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Calculate label background size
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness = 1
        (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)

        pad = 5
        label_y1 = max(y1 - text_h - pad * 2, 0)
        label_y2 = label_y1 + text_h + pad * 2
        label_x2 = x1 + text_w + pad * 2

        # Draw pill-style label background
        cv2.rectangle(image, (x1, label_y1), (label_x2, label_y2), color, -1)

        # Draw white label text
        cv2.putText(
            image,
            label,
            (x1 + pad, label_y2 - pad),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
            cv2.LINE_AA,
        )

    cv2.imwrite(output_path, image)
    logger.info(f"Annotated image saved: {output_path}")
