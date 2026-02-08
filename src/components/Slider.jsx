export function Slider({ id, label, value, onChange, color, min = 0, max = 1, step = 0.01, ariaLabel }) {
  const percentage = ((value - min) / (max - min) * 100).toFixed(0)
  
  return (
    <div className="slider-group">
      <label htmlFor={id} className="slider-label" style={color ? { color } : undefined}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel || `${label} volume`}
      />
    </div>
  )
}
