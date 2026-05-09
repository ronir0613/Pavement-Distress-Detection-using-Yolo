import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MODEL_LABELS = {
  run1_baseline_best: 'Baseline (run1)',
  run2_cbam_best: 'CBAM (run2)',
  run3_cbam_cls2_best: 'CBAM CLS2 (run3)',
  BaseLine: 'BaseLine (Standard)',
  SimAM: 'SimAM',
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/history')
      .then(({ data }) => setRecords(data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Prediction{' '}
          <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            History
          </span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          {records.length} prediction{records.length !== 1 ? 's' : ''} recorded.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No predictions yet. Run a detection to get started.</p>
          <button className="btn-primary mt-2" onClick={() => navigate('/')}>Go to Detection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {records.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setSelected(selected?.id === rec.id ? null : rec)}
              className={`glass-card p-4 text-left transition-all duration-200 group hover:border-brand-300
                ${selected?.id === rec.id ? 'border-brand-400 ring-2 ring-brand-200' : ''}`}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden rounded-xl mb-3 bg-slate-100">
                <img
                  src={`${API_URL}/${rec.annotated_image}?t=${rec.id}`}
                  alt="Annotated"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="absolute top-2 right-2 badge bg-brand-600 text-white border-0 shadow-sm">
                  {rec.total_detections} det.
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">#{rec.id}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(rec.timestamp)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{MODEL_LABELS[rec.model_used] || rec.model_used}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Conf: {Math.round(rec.confidence_threshold * 100)}%</span>
                  <span>·</span>
                  <span>{rec.inference_time_ms} ms</span>
                </div>
              </div>

              {/* Expanded detections */}
              {selected?.id === rec.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-slide-up" onClick={e => e.stopPropagation()}>
                  <p className="section-label mb-2">Detections</p>
                  {rec.detections.length === 0 && (
                    <p className="text-xs text-slate-400">No detections.</p>
                  )}
                  {rec.detections.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <span className="text-slate-700 font-medium">{d.class_name}</span>
                      <span className="text-brand-600 font-bold">{Math.round(d.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
