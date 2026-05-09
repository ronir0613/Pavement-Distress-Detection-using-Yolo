from fastapi import APIRouter, HTTPException
from services.storage import read_history

router = APIRouter()


@router.get("/history")
def get_history():
    """Return all history records, newest first."""
    records = read_history()
    records_sorted = sorted(records, key=lambda r: r.get("timestamp", ""), reverse=True)
    return records_sorted


@router.get("/history/{prediction_id}")
def get_history_record(prediction_id: str):
    """Return a single history record by prediction_id."""
    records = read_history()
    for record in records:
        if record.get("id") == prediction_id:
            return record
    raise HTTPException(status_code=404, detail=f"Prediction '{prediction_id}' not found.")
