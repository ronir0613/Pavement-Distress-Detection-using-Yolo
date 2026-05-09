import { useEffect, useState } from 'react'
import client from '../api/client'

const MODEL_LABELS = {
  run1_baseline_best: 'Baseline (run1)',
  run2_cbam_best: 'CBAM (run2)',
  run3_cbam_cls2_best: 'CBAM CLS2 (run3)',
  BaseLine: 'BaseLine (Standard)',
  SimAM: 'SimAM',
}

export default function ModelSelector({ value, onChange }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/models')
      .then(({ data }) => {
        setModels(data.models || [])
      })
      .catch(() => setModels(['run1_baseline_best', 'run2_cbam_best', 'run3_cbam_cls2_best', 'BaseLine', 'SimAM']))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-2">
      <label className="section-label">Model</label>
      <div className="relative">
        <select
          id="model-selector"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="input-field appearance-none pr-9"
        >
          {models.map((m) => (
            <option key={m} value={m} className="bg-white text-slate-900">
              {MODEL_LABELS[m] || m}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
