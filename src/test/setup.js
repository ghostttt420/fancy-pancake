import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Helper to create chainable audio node mock
function createAudioNodeMock(extraProps = {}) {
  const node = {
    connect: vi.fn(() => node),
    disconnect: vi.fn(),
    ...extraProps
  }
  return node
}

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'suspended'
    this.currentTime = 0
  }
  
  createGain() {
    return createAudioNodeMock({
      gain: { 
        value: 1, 
        setTargetAtTime: vi.fn(), 
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    })
  }
  
  createBiquadFilter() {
    return createAudioNodeMock({
      frequency: { value: 1000, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn() },
      Q: { value: 1 }
    })
  }
  
  createOscillator() {
    return createAudioNodeMock({
      frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      type: 'sine',
      start: vi.fn(),
      stop: vi.fn()
    })
  }
  
  createBufferSource() {
    return createAudioNodeMock({
      buffer: null,
      loop: false,
      start: vi.fn(),
      stop: vi.fn()
    })
  }
  
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(1024)
    }
  }
  
  createDynamicsCompressor() {
    return createAudioNodeMock({
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 }
    })
  }
  
  createAnalyser() {
    return createAudioNodeMock({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: vi.fn(),
      getByteFrequencyData: vi.fn()
    })
  }
  
  createMediaStreamDestination() {
    return { stream: { getTracks: () => [] } }
  }
  
  suspend() {
    this.state = 'suspended'
    return Promise.resolve()
  }
  
  resume() {
    this.state = 'running'
    return Promise.resolve()
  }
  
  decodeAudioData() {
    return Promise.resolve({})
  }
  
  close() {
    this.state = 'closed'
    return Promise.resolve()
  }
}

// Mock MediaRecorder
class MockMediaRecorder {
  constructor(stream) {
    this.stream = stream
    this.state = 'inactive'
    this.mimeType = 'audio/webm'
  }
  
  start() {
    this.state = 'recording'
  }
  
  stop() {
    this.state = 'inactive'
    if (this.onstop) this.onstop()
  }
  
  pause() {
    this.state = 'paused'
  }
  
  resume() {
    this.state = 'recording'
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock AudioContext
global.AudioContext = MockAudioContext
global.webkitAudioContext = MockAudioContext

// Mock MediaRecorder
global.MediaRecorder = MockMediaRecorder

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'blob:test')
global.URL.revokeObjectURL = vi.fn()

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

// Mock fetch for analytics
global.fetch = vi.fn(() => Promise.resolve({ ok: true }))

// Mock navigator.online
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})
