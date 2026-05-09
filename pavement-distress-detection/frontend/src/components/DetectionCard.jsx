const CLASS_COLORS = {
  Crack:                  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    dot: 'bg-red-500' },
  Pothole:                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
  'Surface Disintegration':{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' },
}

function confidenceBadge(conf) {
  if (conf >= 0.7) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (conf >= 0.5) return 'bg-amber-50  text-amber-700  border-amber-200'
  return                   'bg-red-50    text-red-700    border-red-200'
}

export default function DetectionCard({ class_name, confidence, bbox, index }) {
  const colors = CLASS_COLORS[class_name] || {
    bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400',
  }
  const [x1, y1, x2, y2] = bbox || [0, 0, 0, 0]

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} animate-slide-up`}>
      {/* Index bubble */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${colors.dot}`}>
        {index}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Class name + confidence */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${colors.text}`}>{class_name}</span>
          <span className={`badge border ${confidenceBadge(confidence)}`}>
            {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* BBox */}
        <p className="text-[11px] text-slate-400 font-mono">
          [{x1}, {y1}] → [{x2}, {y2}]
        </p>
      </div>
    </div>
  )
}
