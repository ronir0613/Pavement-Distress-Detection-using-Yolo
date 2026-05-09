# Design Document — Pavement Distress Detection System

> **Version:** 1.0  
> **Last Updated:** May 2026  
> **Status:** Active Development

---

## 1. Project Overview

### 1.1 Purpose

The Pavement Distress Detection System is a capstone web application that leverages deep learning to automatically identify and classify road surface defects from uploaded images. The system targets road maintenance engineers, municipal inspectors, and transportation researchers who need rapid, consistent condition assessments without manual visual inspection.

### 1.2 Goals

- Automate the detection of **cracks**, **potholes**, and **surface disintegration** in road images
- Provide a clean, responsive web interface accessible without specialist ML knowledge
- Support multiple model variants for benchmarking and research comparison
- Maintain a persistent detection history for audit and trend analysis

### 1.3 Non-Goals

- Real-time video stream processing (future scope)
- Mobile native app (a React Native prototype exists separately)
- User authentication or multi-tenant support in the current version

---

## 2. System Architecture

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser Client                         │
│   React 18  ·  Vite  ·  Tailwind CSS  ·  React Router v6      │
│                                                                  │
│   Pages: Detection · Comparison · History                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / REST (JSON + multipart)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                            │
│   Routes: /predict  /models  /history  /health                  │
│                                                                  │
│   Services                                                       │
│   ├── model_loader.py   (lazy load + in-memory cache)           │
│   ├── inference.py      (YOLO forward pass + coord mapping)     │
│   ├── visualizer.py     (OpenCV bounding box rendering)         │
│   └── storage.py        (file I/O + history.json persistence)   │
└──────────────┬──────────────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │   File System  │
       │  models/  *.pt │  ← YOLO weights (git-ignored)
       │  uploads/      │  ← raw incoming images
       │  predictions/  │  ← annotated output images
       │  history.json  │  ← detection log
       └────────────────┘
```

### 2.2 Data Flow — Single Image Detection

```
User uploads image
      │
      ▼
POST /api/predict (multipart/form-data)
      │  model_name, confidence, file
      ▼
storage.save_upload()       → writes to uploads/
      │
      ▼
model_loader.get_model()    → loads .pt if not cached; returns YOLO instance
      │
      ▼
inference.run_detection()   → YOLO forward pass; raw box coordinates
      │
      ▼
visualizer.draw_boxes()     → OpenCV annotated image → writes to predictions/
      │
      ▼
storage.save_history()      → appends entry to history.json
      │
      ▼
JSON response               → detections[], annotated_image_url, stats
      │
      ▼
React updates DetectionCard + ResultsTable
```

---

## 3. Backend Design

### 3.1 Technology Choices

| Choice | Rationale |
|---|---|
| **FastAPI** | Async-native, automatic OpenAPI docs, minimal boilerplate |
| **Ultralytics YOLOv8** | Best-in-class detection accuracy; supports custom `.pt` weights |
| **OpenCV (headless)** | Efficient image I/O and annotation; no GUI deps needed on server |
| **Pillow** | Fallback image handling and format conversion |

### 3.2 Model Loading Strategy

Models are loaded **lazily** on first request and **cached in memory** for subsequent calls. This avoids the multi-second startup cost on every inference while keeping initial server boot fast.

```python
# Conceptual model cache
_cache: dict[str, YOLO] = {}

def get_model(name: str) -> YOLO:
    if name not in _cache:
        _cache[name] = YOLO(f"models/{name}.pt")
    return _cache[name]
```

### 3.3 Inference Pipeline

1. **Resize/Pad** — Image is passed directly to YOLO; the model handles internal letterboxing
2. **Forward Pass** — YOLO returns boxes in (x1, y1, x2, y2) pixel coordinates relative to the **processed** tensor
3. **Coordinate Mapping** — Coordinates are remapped back to original image dimensions to prevent bounding-box drift on non-square inputs
4. **Confidence Filtering** — Detections below the user-supplied threshold are discarded
5. **NMS** — Applied internally by Ultralytics

### 3.4 Detection Classes

| Class ID | Label | Annotation Color (BGR) |
|---|---|---|
| 0 | Crack | `(0, 0, 255)` — Red |
| 1 | Pothole | `(0, 165, 255)` — Orange |
| 2 | Surface Disintegration | `(128, 0, 128)` — Purple |

### 3.5 History Persistence

Detection records are stored as a flat JSON array in `history.json`. Each record contains:

```json
{
  "id": "uuid-v4",
  "timestamp": "ISO-8601",
  "model": "run2_cbam_best",
  "confidence_threshold": 0.5,
  "original_filename": "road_sample.jpg",
  "upload_path": "uploads/<uuid>.jpg",
  "prediction_path": "predictions/<uuid>_pred.jpg",
  "detections": [
    { "class": "Crack", "confidence": 0.87, "bbox": [x1, y1, x2, y2] }
  ],
  "summary": { "Crack": 3, "Pothole": 1, "Surface Disintegration": 0 }
}
```

> **Note:** `history.json` is git-ignored to avoid committing binary-path references and large diffs.

---

## 4. Frontend Design

### 4.1 Technology Choices

| Choice | Rationale |
|---|---|
| **React 18 + Vite** | Fast HMR, modern JSX transform, minimal config |
| **Tailwind CSS v3** | Utility-first; rapid iteration on custom designs |
| **React Router v6** | Declarative routing; nested layout support |
| **Axios** | Interceptors for base URL; cleaner than native `fetch` for file uploads |
| **React Dropzone** | Accessible drag-and-drop file input |
| **React Hot Toast** | Non-intrusive toast notifications |

### 4.2 Page Inventory

| Route | Component | Purpose |
|---|---|---|
| `/` | `DetectionPage` | Upload image, choose model, view annotated result |
| `/compare` | `ComparisonPage` | Run two models side-by-side on the same image |
| `/history` | `HistoryPage` | Browse past detections; view/download results |

### 4.3 Component Hierarchy

```
App
├── Navbar (global navigation)
├── Routes
│   ├── / → DetectionPage
│   │   ├── UploadZone
│   │   ├── ModelSelector
│   │   ├── ConfidenceSlider
│   │   └── DetectionCard
│   │       └── ResultsTable
│   ├── /compare → ComparisonPage
│   │   ├── UploadZone (shared)
│   │   ├── ModelSelector × 2
│   │   └── DetectionCard × 2
│   └── /history → HistoryPage
│       └── HistoryTable (list of past records)
└── Toaster (global notifications)
```

### 4.4 API Service Layer

All HTTP calls are centralised in `src/api/`. This makes it trivial to swap base URLs, add auth headers, or mock responses in tests.

```
src/api/
├── index.js        # Axios instance with VITE_API_BASE_URL
├── predict.js      # detectImage(file, model, confidence)
├── models.js       # fetchModels()
└── history.js      # fetchHistory(), deleteHistory()
```

### 4.5 UI / Visual Design

#### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary | `#2563EB` (blue-600) | Buttons, active states |
| Surface | `#FFFFFF` | Card backgrounds |
| Background | `#F8FAFC` | Page background |
| Text Primary | `#0F172A` | Body text |
| Text Secondary | `#64748B` | Labels, captions |
| Crack | `#EF4444` | Detection badge — Crack |
| Pothole | `#F97316` | Detection badge — Pothole |
| Surface Dis. | `#A855F7` | Detection badge — Surface Disintegration |

#### Typography

- **Font Family:** Inter (Google Fonts)
- **Headings:** `font-semibold`, sizes `text-2xl` → `text-base`
- **Body:** `text-sm` / `text-base`, `font-normal`

#### Layout

- Max content width: `1280px`, centered
- Responsive breakpoints: `sm` (640 px) · `md` (768 px) · `lg` (1024 px)
- Two-column comparison layout collapses to single column on `< md`

---

## 5. Model Architecture Overview

### 5.1 Baseline (YOLOv8)

Standard YOLOv8 detection head trained on the custom pavement distress dataset. Serves as the performance and speed baseline.

### 5.2 CBAM Variants (run2, run3)

YOLOv8 backbone augmented with **Convolutional Block Attention Module (CBAM)** — a lightweight channel + spatial attention mechanism injected after selected convolutional stages to improve localization of small, thin cracks.

- `run2_cbam_best` — 3-class (Crack, Pothole, Surface Disintegration)
- `run3_cbam_cls2_best` — 2-class variant (Crack, Pothole)

### 5.3 SimAM Variant

YOLOv8 backbone augmented with **Simple, Parameter-Free Attention Module (SimAM)** — a 3D attention module that assigns importance weights without additional learnable parameters.

### 5.4 Dataset

| Split | Size |
|---|---|
| Train | ~70% |
| Validation | ~15% |
| Test | ~15% |

Classes are manually annotated in YOLO format (normalized `xywh` bounding boxes).

---

## 6. Deployment

### 6.1 Local Development

```
Terminal 1: cd backend && uvicorn main:app --reload
Terminal 2: cd frontend && npm run dev
```

### 6.2 Docker (Backend)

The `backend/Dockerfile` packages the FastAPI server. Model weights must be mounted as a volume at runtime (see [README — Docker](README.md#docker)).

### 6.3 Future: Production Considerations

- Serve annotated images via a CDN / object storage (S3) rather than local disk
- Replace `history.json` with a proper database (SQLite → PostgreSQL)
- Add authentication (JWT) if the tool is deployed publicly
- Scale inference with a task queue (Celery + Redis) for concurrent users

---

## 7. Known Issues & Limitations

| Issue | Status | Notes |
|---|---|---|
| Bounding box drift on non-square images | **Fixed** | Coordinate remapping from processed → original dims |
| history.json grows unbounded | Open | Add pagination + archival strategy |
| Model weights not versioned | Open | Evaluate Git LFS or DVC |
| No input validation on file type (client-side) | Partial | Backend rejects unsupported extensions |
| Single-process model cache (not thread-safe under heavy load) | Low priority | Acceptable for single-user / research use |

---

## 8. Future Roadmap

- [ ] Real-time video inference via WebSocket streaming
- [ ] Export detection report as PDF
- [ ] Map integration — pin detections to GPS coordinates
- [ ] Automated retraining pipeline with newly uploaded images
- [ ] Role-based access (Admin / Viewer) with JWT auth
- [ ] Progressive Web App (PWA) support for offline use

---

*Document maintained by the capstone development team.*
