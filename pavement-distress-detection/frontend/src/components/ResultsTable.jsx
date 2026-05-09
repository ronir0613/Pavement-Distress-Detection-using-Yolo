function confidenceColor(conf) {
  if (conf >= 0.7) return 'text-emerald-600'
  if (conf >= 0.5) return 'text-amber-600'
  return 'text-red-600'
}

export default function ResultsTable({ detections = [], inferenceTime, totalDetections }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Summary row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200">
          <span className="text-brand-700 font-bold text-lg">{totalDetections ?? 0}</span>
          <span className="text-brand-500 text-xs">detection{totalDetections !== 1 ? 's' : ''}</span>
        </div>
        {inferenceTime != null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-slate-800 font-bold">{inferenceTime}</span>
            <span className="text-slate-400 text-xs">ms</span>
          </div>
        )}
      </div>

      {/* Table */}
      {detections.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">#</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Class</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Confidence</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Bounding Box</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {detections.map((det, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{det.class_name}</td>
                  <td className={`px-4 py-2.5 font-bold ${confidenceColor(det.confidence)}`}>
                    {Math.round(det.confidence * 100)}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    [{det.bbox?.[0]}, {det.bbox?.[1]}] → [{det.bbox?.[2]}, {det.bbox?.[3]}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">No detections above threshold.</p>
      )}
    </div>
  )
}
