import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config import UPLOADS_DIR, PREDICTIONS_DIR, CORS_ORIGINS
from services.model_loader import load_all_models
from routes import predict, history, models, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Ensure directories exist before mounting
Path(UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
Path(PREDICTIONS_DIR).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — loading models...")
    load_all_models()
    logger.info("All models loaded. API ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Pavement Distress Detection API",
    description="AI-powered detection of Cracks, Potholes, and Surface Disintegration using YOLO.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static file mounts ---
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/predictions", StaticFiles(directory=PREDICTIONS_DIR), name="predictions")

# --- Routers ---
app.include_router(predict.router)
app.include_router(history.router)
app.include_router(models.router)
app.include_router(health.router)


@app.get("/")
def root():
    return {"message": "Pavement Distress Detection API is running. Visit /docs for Swagger UI."}
