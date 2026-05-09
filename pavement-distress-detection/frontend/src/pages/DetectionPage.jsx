import { useState, useRef } from 'react'
import { usePrediction } from '../hooks/usePrediction'
import UploadZone from '../components/UploadZone'
import ModelSelector from '../components/ModelSelector'
import ConfidenceSlider from '../components/ConfidenceSlider'
import ResultsTable from '../components/ResultsTable'
import DetectionCard from '../components/DetectionCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DetectionPage() {
  const [file, setFile] = useState(null)
  const [model, setModel] = useState('run1_baseline_best')
  const [confidence, setConfidence] = useState(0.5)
  const { loading, result, runPrediction, clearResult } = usePrediction()
  const hasFile = useRef(false)

  function handleFileSelect(f) {
    setFile(f)
    hasFile.current = true
    clearResult()
  }

  async function handleDetect() {
    if (!file) return
    await runPrediction(file, model, confidence)
  }

  async function handleSliderCommit() {
    if (file && result) {
      await runPrediction(file, model, confidence)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Pavement{' '}
          <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            Distress Detection
          </span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Upload a road image and run AI inference to detect Cracks, Potholes, and Surface Disintegration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* ── Left column: Controls ── */}
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-5">
            <UploadZone onFileSelect={handleFileSelect} onClear={clearResult} />
            <ModelSelector value={model} onChange={setModel} />
            <ConfidenceSlider value={confidence} onChange={setConfidence} onCommit={handleSliderCommit} />

            <button
              id="run-detection-btn"
              onClick={handleDetect}
              disabled={!file || loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Detection
                </>
              )}
            </button>
          </div>

          {/* Detection cards */}
          {result?.detections?.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h2 className="section-label">Detections</h2>
              {result.detections.map((det, i) => (
                <DetectionCard key={i} {...det} index={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right column: Output ── */}
        <div className="space-y-5">
          <div className="glass-card p-5 relative min-h-[320px] flex flex-col">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Running inference…</p>
              </div>
            )}

            {result ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-600">Annotated Output</h2>
                  <a
                    href={`${API_URL}${result.annotated_image_url}`}
                    download={`pavescan_${result.prediction_id}.jpg`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                </div>

                <img
                  src={`${API_URL}${result.annotated_image_url}?t=${Date.now()}`}
                  alt="Annotated pavement"
                  className="w-full rounded-xl object-contain max-h-[420px] bg-slate-100 animate-fade-in"
                />

                <div className="mt-5">
                  <ResultsTable
                    detections={result.detections}
                    inferenceTime={result.inference_time_ms}
                    totalDetections={result.total_detections}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm-3 0h.008v.008H13.5V12zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">Upload an image and run detection to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
