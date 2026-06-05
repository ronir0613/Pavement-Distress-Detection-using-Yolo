# 🛣️ Pavement Distress Detection

An AI-powered web application for detecting and classifying pavement distress types — cracks, potholes, and surface disintegration — using state-of-the-art YOLO-based deep learning models.

**🚀 Live Demo:** [https://pavement-distress-detection-using-yolo-production-7554.up.railway.app/](https://pavement-distress-detection-using-yolo-production-7554.up.railway.app/)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Models](#models)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Usage](#usage)
- [Docker](#docker)
- [Contributing](#contributing)

---

## Overview

This capstone project provides a full-stack solution for automated pavement condition assessment. Users can upload road images through a web interface, select an inference model, adjust the confidence threshold, and receive annotated results with bounding boxes and classification statistics in real time.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-model Inference** | Switch between multiple trained YOLO variants |
| **Confidence Control** | Adjust detection confidence threshold via a slider |
| **Side-by-Side Comparison** | Compare two models on the same image simultaneously |
| **Detection History** | Browse and revisit past inference results |
| **Annotated Output** | Download result images with bounding boxes |
| **REST API** | Clean FastAPI endpoints for programmatic access |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+** · FastAPI · Uvicorn
- **Ultralytics YOLOv8** for inference
- **PyTorch** + **TorchVision**
- **OpenCV** (headless) · **Pillow**

### Frontend
- **React 18** (Vite)
- **Tailwind CSS v3**
- **React Router v6** · **Axios** · **React Dropzone**

---

## 📁 Project Structure

```
pavement-distress-detection/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Global constants & config
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models/              # YOLO .pt weight files (not tracked by git)
│   ├── uploads/             # Temporary uploaded images
│   ├── predictions/         # Annotated result images
│   ├── routes/
│   │   ├── predict.py       # /api/predict endpoint
│   │   ├── models.py        # /api/models endpoint
│   │   ├── history.py       # /api/history endpoint
│   │   └── health.py        # /api/health endpoint
│   └── services/
│       ├── inference.py     # Detection pipeline
│       ├── model_loader.py  # Lazy model loading / caching
│       ├── visualizer.py    # Bounding box drawing
│       └── storage.py       # File & history persistence
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/             # Axios service layer
        ├── components/      # Reusable UI components
        │   ├── UploadZone.jsx
        │   ├── ModelSelector.jsx
        │   ├── ConfidenceSlider.jsx
        │   ├── DetectionCard.jsx
        │   └── ResultsTable.jsx
        ├── hooks/           # Custom React hooks
        └── pages/
            ├── DetectionPage.jsx
            ├── ComparisonPage.jsx
            └── HistoryPage.jsx
```

---

## 🤖 Models

Model weights are **not stored in this repository** (binary files, typically > 100 MB). Place `.pt` files inside `backend/models/` before running.

| Model Key | Description |
|---|---|
| `run1_baseline_best` | YOLOv8 baseline — Run 1 |
| `run2_cbam_best` | YOLOv8 + CBAM attention — Run 2 |
| `run3_cbam_cls2_best` | YOLOv8 + CBAM (2-class variant) — Run 3 |
| `BaseLine` | Standard baseline model |
| `SimAM` | YOLOv8 + SimAM attention module |

The active model list is defined in `backend/config.py → MODEL_NAMES`.

---

## 🚀 Getting Started

### Prerequisites

- Python ≥ 3.10
- Node.js ≥ 18
- (Optional) Docker & Docker Compose

### Backend Setup

```bash
# 1. Create & activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Place model weights
#    Copy your .pt files into backend/models/

# 4. Run the development server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at **http://localhost:8000/docs**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env

# Start dev server
npm run dev
```

Frontend available at **http://localhost:5173**

---

## 🔧 Environment Variables

### `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

### Backend (optional overrides via shell environment)

| Variable | Default | Description |
|---|---|---|
| `MODELS_DIR` | `models/` | Directory containing `.pt` weight files |
| `UPLOADS_DIR` | `uploads/` | Temporary upload storage |
| `PREDICTIONS_DIR` | `predictions/` | Annotated output storage |
| `HISTORY_FILE` | `history.json` | Path to detection history log |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/models` | List available model names |
| `POST` | `/api/predict` | Run inference on an uploaded image |
| `GET` | `/api/history` | Retrieve past detection records |
| `DELETE` | `/api/history` | Clear detection history |

**POST `/api/predict` — form fields**

| Field | Type | Description |
|---|---|---|
| `file` | File | Image file (jpg, png, webp, bmp, tiff) |
| `model_name` | string | Model key from `/api/models` |
| `confidence` | float | Confidence threshold (0.0 – 1.0) |

---

## 🐳 Docker (Recommended Deployment)

A full-stack `docker-compose.yml` is provided to run both the frontend and backend together.

```bash
# 1. Place your model weights inside backend/models/

# 2. Build and start the containers in detached mode
docker-compose up -d --build

# 3. To stop the application
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is developed as part of a capstone program. All rights reserved.
