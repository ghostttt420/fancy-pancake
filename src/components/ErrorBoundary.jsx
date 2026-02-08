import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lofi Mixer Error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0f172a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          zIndex: 9999
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵 Something went wrong</h1>
          <p style={{ opacity: 0.7, maxWidth: '400px', lineHeight: 1.6 }}>
            The audio engine encountered an error. This might be due to browser permissions or an unsupported feature.
          </p>
          <button 
            onClick={this.handleReload}
            style={{
              marginTop: '2rem',
              padding: '12px 32px',
              fontSize: '1rem',
              background: 'white',
              color: '#0f172a',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
