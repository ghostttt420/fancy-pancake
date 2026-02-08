import { useCallback, useRef } from 'react'
import { announce } from '../lib/announcer'

export function Slider({ id, label, value, onChange, color, min = 0, max = 1, step = 0.01, ariaLabel }) {
  const percentage = ((value - min) / (max - min) * 100).toFixed(0)
  const announceTimeoutRef = useRef(null)
  
  const handleChange = useCallback((e) => {
    onChange(e)
    
    // Debounce screen reader announcements
    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current)
    }
    
    announceTimeoutRef.current = setTimeout(() => {
      const newPercentage = Math.round(((parseFloat(e.target.value) - min) / (max - min)) * 100)
      announce(`${label} ${newPercentage}%`, 'polite')
    }, 500)
  }, [onChange, label, min, max])
  
  return (
    <div className="slider-group">
      <label htmlFor={id} className="slider-label" style={color ? { color } : undefined}>
        <span>{label}</span>
        <span aria-hidden="true">{percentage}%</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel || `${label} volume, ${percentage}%`}
        style={color ? { '--slider-color': color } : undefined}
      />
    </div>
  )
}
