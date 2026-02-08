import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { initSentry } from './lib/sentry'
import { initAnalytics } from './lib/analytics'

// Initialize error tracking and analytics (only in production)
initSentry()
initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
