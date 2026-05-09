import json
import os
import shutil
import logging
from pathlib import Path
from config import UPLOADS_DIR, PREDICTIONS_DIR, HISTORY_FILE

logger = logging.getLogger(__name__)

# Ensure storage directories exist
Path(UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
Path(PREDICTIONS_DIR).mkdir(parents=True, exist_ok=True)


def save_upload(file_obj, filename: str) -> str:
    """
    Save an uploaded file to the uploads directory.
    Returns the relative path: uploads/<filename>
    """
    dest_path = os.path.join(UPLOADS_DIR, filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file_obj, f)
    logger.info(f"Upload saved: {dest_path}")
    return dest_path


def append_history(record: dict):
    """Read history.json, append new record, write back."""
    history = read_history()
    history.append(record)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)
    logger.info(f"History updated — total records: {len(history)}")


def read_history() -> list:
    """Return full history list or [] if file is missing/corrupt."""
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError) as exc:
        logger.warning(f"Could not read history.json: {exc}")
        return []
