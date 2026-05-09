export default function ConfidenceSlider({ value, onChange, onCommit }) {
  const pct = Math.round(value * 100)

  const trackStyle = {
    background: `linear-gradient(to right, #254ce6 ${pct}%, #e2e8f0 ${pct}%)`,
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="section-label">Confidence Threshold</label>
        <span
          className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg
                     bg-brand-100 text-brand-700 border border-brand-200"
        >
          {pct}%
        </span>
      </div>

      <div className="relative py-2">
        <input
          id="confidence-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          style={trackStyle}
          onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
          onMouseUp={() => onCommit?.()}
          onTouchEnd={() => onCommit?.()}
          className="w-full h-2 rounded-full outline-none cursor-pointer
                     appearance-none bg-transparent
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:shadow-brand-500/30
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-brand-600
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
