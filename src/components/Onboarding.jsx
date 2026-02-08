import { useState, useEffect } from 'react'

const steps = [
  {
    title: 'Welcome to Lofi Mixer',
    content: 'Create your perfect ambient soundscape for focus, sleep, or relaxation.',
    target: null
  },
  {
    title: 'Choose a Preset',
    content: 'Start with one of our curated presets like Focus, Sleep, or Storm.',
    target: '.preset-row'
  },
  {
    title: 'Mix Your Sounds',
    content: 'Adjust individual layers like rain, fire, beats, and chords to your liking.',
    target: '.slider-group'
  },
  {
    title: 'Set a Timer',
    content: 'Use the timer for focused work sessions or to drift off to sleep.',
    target: '.timer-section'
  },
  {
    title: 'Share Your Mix',
    content: 'Your mix settings are automatically saved in the URL. Copy and share!',
    target: null
  }
]

export function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('lofi-onboarding-complete')
    if (!hasSeenOnboarding) {
      // Delay slightly for app to render
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }
  
  const handleSkip = () => {
    handleComplete()
  }
  
  const handleComplete = () => {
    localStorage.setItem('lofi-onboarding-complete', 'true')
    setIsVisible(false)
    onComplete?.()
  }
  
  if (!isVisible) return null
  
  const step = steps[currentStep]
  
  return (
    <div 
      className="onboarding-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={handleSkip}
    >
      <div 
        className="onboarding-card"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div 
          className="onboarding-step-indicator"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
        
        <h2 
          id="onboarding-title"
          style={{
            fontSize: '1.5rem',
            marginBottom: '16px',
            fontWeight: 700
          }}
        >
          {step.title}
        </h2>
        
        <p 
          style={{
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
            marginBottom: '32px'
          }}
        >
          {step.content}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '12px 32px',
              background: 'white',
              border: 'none',
              color: '#0f172a',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
