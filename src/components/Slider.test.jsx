import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders with label', () => {
    render(<Slider id="test" label="Test Label" value={0.5} onChange={vi.fn()} />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })
  
  it('displays correct value percentage', () => {
    render(<Slider id="test" label="Volume" value={0.75} onChange={vi.fn()} />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
  
  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Slider id="test" label="Volume" value={0.5} onChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '0.8' } })
    
    expect(handleChange).toHaveBeenCalled()
  })
  
  it('applies custom color when provided', () => {
    const { container } = render(
      <Slider id="test" label="Volume" value={0.5} onChange={vi.fn()} color="#ff0000" />
    )
    
    const slider = container.querySelector('input[type="range"]')
    expect(slider).toHaveStyle({ '--slider-color': '#ff0000' })
  })
})
