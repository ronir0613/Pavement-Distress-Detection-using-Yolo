import { useState } from 'react'
import UploadZone from '../components/UploadZone'
import ConfidenceSlider from '../components/ConfidenceSlider'
import client from '../api/client'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MODELS = [
  { name: 'run1_baseline_best', label: 'Baseline (run1)' },
  { name: 'run2_cbam_best',     label: 'CBAM (run2)' },
  { name: 'run3_cbam_cls2_best', label: 'CBAM CLS2 (run3)' },
  { name: 'BaseLine', label: 'BaseLine (Standard)' },
  { name: 'SimAM', label: 'SimAM' },
]

function ModelResultCard({ modelLabel, result, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 flex flex-col items-center justify-center gap-3 min-h-[360px]">
        <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-slate-400 text-sm">{modelLabel}</p>
      </div>
    )
  }
  if (!result) return null

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">{modelLabel}</h3>
        <span className="badge bg-brand-100 text-brand-700 border border-brand-200">
          {result.total_detections} det.
        </span>
      </div>
      <img
        src={`${API_URL}${result.annotated_image_url}?t=${Date.now()}`}
        alt={modelLabel}
        className="w-full rounded-xl object-contain max-h-56 bg-slate-100"
      />
      <div className="flex gap-3 text-xs">
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
          <p className="text-slate-400 mb-0.5">Inference</p>
          <p className="font-bold text-slate-800">{result.inference_time_ms} ms</p>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
          <p className="text-slate-400 mb-0.5">Top Conf.</p>
          <p className="font-bold text-emerald-600">
            {result.detections.length
              ? `${Math.round(Math.max(...result.detections.map(d => d.confidence)) * 100)}%`
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ComparisonPage() {
  const [file, setFile] = useState(null)
  const [confidence, setConfidence] = useState(0.5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  async function handleCompare() {
    if (!file) { toast.error('Please upload an image first.'); return }
    setLoading(true)
    setResults(null)
    try {
      const requests = MODELS.map(({ name }) => {
        const form = new FormData()
        form.append('file', file)
        form.append('model_name', name)
        form.append('confidence_threshold', confidence)
        return client.post('/predict', form, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then(r => r.data)
          .catch(() => null)
      })
      const res = await Promise.all(requests)
      setResults(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Model{' '}
          <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            Comparison
          </span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Compare all models side-by-side on the same image.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-[1fr_280px_auto] gap-6 items-end">
        <UploadZone onFileSelect={(f) => { setFile(f); setResults(null) }} onClear={() => setResults(null)} />
        <ConfidenceSlider value={confidence} onChange={setConfidence} />
        <button
          id="compare-all-btn"
          onClick={handleCompare}
          disabled={!file || loading}
          className="btn-primary py-3 whitespace-nowrap"
        >
          {loading ? 'Comparing…' : 'Compare All Models'}
        </button>
      </div>

      {/* Results */}
      {(loading || results) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {MODELS.map(({ name, label }, i) => (
              <ModelResultCard
                key={name}
                modelLabel={label}
                result={results?.[i]}
                loading={loading}
              />
            ))}
          </div>

          {/* Summary table */}
          {results && (
            <div className="glass-card p-5 animate-fade-in">
              <h2 className="section-label mb-4">Summary</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Model</th>
                      <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">Detections</th>
                      <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">Inference (ms)</th>
                      <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">Highest Conf.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MODELS.map(({ label }, i) => {
                      const r = results[i]
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{label}</td>
                          <td className="px-4 py-3 text-center font-bold text-brand-600">{r?.total_detections ?? '—'}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{r?.inference_time_ms ?? '—'}</td>
                          <td className="px-4 py-3 text-center text-emerald-600 font-bold">
                            {r?.detections?.length
                              ? `${Math.round(Math.max(...r.detections.map(d => d.confidence)) * 100)}%`
                              : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
