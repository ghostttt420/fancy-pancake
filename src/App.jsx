import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import './App.css'

import { ErrorBoundary } from './components/ErrorBoundary'
import { StartScreen } from './components/StartScreen'
import { Onboarding } from './components/Onboarding'
import { ScreenReaderAnnouncer } from './components/ScreenReaderAnnouncer'
import { SeededRandom } from './utils/seededRandom'
import * as Audio from './utils/audio'
import { track } from './lib/analytics'

// Lazy load heavy components for better initial load
const Visualizer = lazy(() => import('./components/Visualizer').then(m => ({ default: m.Visualizer })))
const ControlPanel = lazy(() => import('./components/ControlPanel').then(m => ({ default: m.ControlPanel })))

function App() {
  const [started, setStarted] = useState(false)
  const [timeMode] = useState('day')
  
  // Seeded randomization state
  const [seed, setSeed] = useState(() => {
    const saved = localStorage.getItem('lofi-seed')
    return saved ? parseInt(saved) : Math.floor(Math.random() * 100000)
  })
  const [useSeededRNG, setUseSeededRNG] = useState(() => {
    return localStorage.getItem('lofi-use-seed') === 'true'
  })
  
  // Visualizer style state
  const [visualizerStyle, setVisualizerStyle] = useState(() => {
    return localStorage.getItem('lofi-visualizer') || 'waveform'
  })
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerActive, setTimerActive] = useState(false)
  const [timerRemaining, setTimerRemaining] = useState(25 * 60)
  const timerIntervalRef = useRef(null)
  
  // Presets state
  const [customPresets, setCustomPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('lofi-presets')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [showPresetInput, setShowPresetInput] = useState(false)
  const [presetName, setPresetName] = useState('')
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  
  // Volume state
  const [vols, setVols] = useState(() => {
    try {
      const saved = localStorage.getItem('lofi-vols')
      const parsed = saved ? JSON.parse(saved) : {}
      return {
        rain: parsed.rain || 0,
        drone: parsed.drone || 0,
        rumble: parsed.rumble || 0,
        beats: parsed.beats || 0,
        chords: parsed.chords || 0,
        bass: parsed.bass || 0,
        vinyl: parsed.vinyl || 0,
        fire: parsed.fire || 0,
        thunder: parsed.thunder || 0,
        hiss: parsed.hiss || 0,
        tone: parsed.tone || 1,
        wind: parsed.wind || 0,
        birds: parsed.birds || 0,
        city: parsed.city || 0,
        cafe: parsed.cafe || 0,
        ocean: parsed.ocean || 0,
        crickets: parsed.crickets || 0,
        keyboard: parsed.keyboard || 0,
        clock: parsed.clock || 0,
        brown: parsed.brown || 0,
        master: parsed.master ?? 1,
      }
    } catch {
      return { rain: 0, drone: 0, rumble: 0, beats: 0, chords: 0, bass: 0, vinyl: 0, fire: 0, thunder: 0, hiss: 0, tone: 1, wind: 0, birds: 0, city: 0, cafe: 0, ocean: 0, crickets: 0, keyboard: 0, clock: 0, brown: 0, master: 1 }
    }
  })
  
  const [tempo, setTempo] = useState(() => {
    const saved = localStorage.getItem('lofi-tempo')
    return saved ? parseInt(saved) : 80
  })
  
  // Undo/Redo state
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const isUndoingRef = useRef(false)
  const MAX_HISTORY = 50
  
  // Save state to history (debounced)
  useEffect(() => {
    if (isUndoingRef.current) return
    
    const timeout = setTimeout(() => {
      const state = { vols: { ...vols }, tempo }
      
      // Remove any future history if we're in the middle
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      }
      
      // Add new state
      historyRef.current.push(state)
      
      // Limit history size
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift()
      } else {
        historyIndexRef.current++
      }
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [vols, tempo])
  
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoingRef.current = true
      historyIndexRef.current--
      const state = historyRef.current[historyIndexRef.current]
      setVols(state.vols)
      setTempo(state.tempo)
      setTimeout(() => { isUndoingRef.current = false }, 50)
    }
  }, [])
  
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoingRef.current = true
      historyIndexRef.current++
      const state = historyRef.current[historyIndexRef.current]
      setVols(state.vols)
      setTempo(state.tempo)
      setTimeout(() => { isUndoingRef.current = false }, 50)
    }
  }, [])
  
  // Add undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])
  
  // Export/Import functions
  const exportPresets = useCallback(() => {
    const data = {
      presets: customPresets,
      currentMix: { vols, tempo, seed, useSeededRNG },
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lofi-mixer-presets-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [customPresets, vols, tempo, seed, useSeededRNG])
  
  const importPresets = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.presets) {
          setCustomPresets(prev => ({ ...prev, ...data.presets }))
        }
        
        if (data.currentMix) {
          const { vols: importedVols, tempo: importedTempo } = data.currentMix
          if (importedVols) setVols(importedVols)
          if (importedTempo) setTempo(importedTempo)
        }
        
        alert('Presets imported successfully!')
      } catch (err) {
        alert('Failed to import presets. Invalid file format.')
      }
    }
    reader.readAsText(file)
  }, [])
  
  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  
  // Audio refs
  const audioCtxRef = useRef(null)
  const nodesRef = useRef({})
  const analyserRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const current16thNoteRef = useRef(0)
  const schedulerTimerRef = useRef(null)
  const barCountRef = useRef(0)
  const driftOffsetRef = useRef(0)
  const lightningTriggerRef = useRef(0)
  const rngRef = useRef(new SeededRandom())
  
  // Initialize RNG
  useEffect(() => {
    rngRef.current = useSeededRNG ? new SeededRandom(seed) : new SeededRandom(Date.now())
    localStorage.setItem('lofi-seed', seed.toString())
    localStorage.setItem('lofi-use-seed', useSeededRNG.toString())
  }, [seed, useSeededRNG])
  
  // URL State Sharing - load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    
    try {
      const params = new URLSearchParams(hash)
      const sharedVols = {}
      let hasSharedState = false
      
      // Parse volume values
      const volKeys = ['rain', 'drone', 'rumble', 'beats', 'chords', 'bass', 'vinyl', 'fire', 'thunder', 'hiss', 'tone', 'wind', 'birds', 'city', 'cafe', 'ocean', 'crickets', 'keyboard', 'clock', 'brown', 'master']
      volKeys.forEach(key => {
        const val = params.get(key)
        if (val !== null) {
          sharedVols[key] = parseFloat(val)
          hasSharedState = true
        }
      })
      
      if (hasSharedState) {
        setVols(prev => ({ ...prev, ...sharedVols }))
      }
      
      // Parse tempo
      const tempoVal = params.get('tempo')
      if (tempoVal) setTempo(parseInt(tempoVal))
      
      // Parse seed
      const seedVal = params.get('seed')
      if (seedVal) {
        setSeed(parseInt(seedVal))
        setUseSeededRNG(true)
      }
      
      // Parse visualizer
      const vizVal = params.get('viz')
      if (vizVal) setVisualizerStyle(vizVal)
      
    } catch (err) {
      console.error('Failed to parse URL state:', err)
    }
  }, [])
  
  // URL State Sharing - update URL when settings change (debounced)
  useEffect(() => {
    if (!started) return
    
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      
      // Only include non-zero values to keep URL short
      Object.entries(vols).forEach(([key, val]) => {
        if (val > 0 && val !== 1) params.set(key, val.toFixed(2))
      })
      
      if (tempo !== 80) params.set('tempo', tempo)
      if (useSeededRNG) params.set('seed', seed)
      if (visualizerStyle !== 'waveform') params.set('viz', visualizerStyle)
      
      const newHash = params.toString()
      if (newHash) {
        window.history.replaceState(null, null, '#' + newHash)
      }
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [vols, tempo, seed, useSeededRNG, visualizerStyle, started])
  
  // Debounced saves
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('lofi-vols', JSON.stringify(vols))
    }, 500)
    return () => clearTimeout(timeout)
  }, [vols])
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('lofi-visualizer', visualizerStyle)
    }, 500)
    return () => clearTimeout(timeout)
  }, [visualizerStyle])
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('lofi-tempo', tempo.toString())
    }, 500)
    return () => clearTimeout(timeout)
  }, [tempo])
  
  useEffect(() => {
    localStorage.setItem('lofi-presets', JSON.stringify(customPresets))
  }, [customPresets])
  
  // Reduced motion listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Timer effect
  useEffect(() => {
    if (timerActive && timerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [timerActive, timerRemaining])
  
  // Handle volume changes
  useEffect(() => {
    if (audioCtxRef.current) {
      Object.entries(vols).forEach(([key, val]) => {
        if (nodesRef.current[key] && key !== 'tone' && key !== 'master') {
          nodesRef.current[key].gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.1)
        }
      })
      
      if (nodesRef.current.masterFilter) {
        const minFreq = 100
        const maxFreq = 20000
        const frequency = minFreq * Math.pow(maxFreq / minFreq, vols.tone)
        nodesRef.current.masterFilter.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.1)
      }
      
      if (nodesRef.current.masterGain) {
        nodesRef.current.masterGain.gain.setTargetAtTime(vols.master, audioCtxRef.current.currentTime, 0.1)
      }
    }
  }, [vols])
  
  // Store scheduler in ref to avoid circular dependency issues
  const schedulerRef = useRef(null)
  
  // Scheduler function defined below will assign itself to this ref
  
  const getRNG = useCallback(() => {
    return useSeededRNG ? rngRef.current : { next: () => Math.random(), range: (min, max) => min + Math.random() * (max - min) }
  }, [useSeededRNG])
  
  const scheduleNote = useCallback((beatNumber, time) => {
    const rng = getRNG()
    const currentVols = vols
    const humanize = rng.range(0, 0.015)
    const humanTime = time + humanize
    const currentBar = barCountRef.current
    const patternType = Math.floor(currentBar / 4) % 8
    
    if (currentVols.thunder > 0 && rng.next() < 0.01) {
      Audio.triggerThunder(audioCtxRef.current, currentVols.thunder, nodesRef.current.mixer)
      lightningTriggerRef.current = 10
    }
    
    if (currentVols.birds > 0 && rng.next() < 0.005) {
      Audio.triggerBirdChirp(audioCtxRef.current, currentVols.birds, nodesRef.current.mixer)
    }
    
    if (currentVols.beats > 0) {
      if (patternType === 0) {
        if (beatNumber === 0 || beatNumber === 10) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 12) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber % 2 === 0) Audio.playHiHat(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
      } else if (patternType === 1) {
        if (beatNumber === 0 || beatNumber === 7 || beatNumber === 10) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 12) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber % 2 === 0) Audio.playHiHat(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
      } else if (patternType === 2) {
        if (beatNumber === 0 || beatNumber === 8) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 12) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber % 2 === 0 || beatNumber === 15) Audio.playHiHat(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
      } else if (patternType === 3) {
        if (beatNumber === 0 || beatNumber === 8) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 12) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats * 0.8, rng, nodesRef.current.mixer)
      } else if (patternType === 4) {
        if (beatNumber === 0 || beatNumber === 8) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 12) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
      } else if (patternType === 5) {
        if (beatNumber === 0 || beatNumber === 6 || beatNumber === 10) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 4 || beatNumber === 14) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber % 2 === 0) Audio.playHiHat(audioCtxRef.current, humanTime, currentVols.beats * 0.4, rng, nodesRef.current.mixer)
      } else if (patternType === 6) {
        if (beatNumber === 0 || beatNumber === 3 || beatNumber === 10) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 6 || beatNumber === 14) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber % 4 === 2) Audio.playHiHat(audioCtxRef.current, humanTime, currentVols.beats * 0.5, rng, nodesRef.current.mixer)
      } else {
        if (beatNumber === 0) Audio.playKick(audioCtxRef.current, humanTime, currentVols.beats, rng, nodesRef.current.mixer)
        if (beatNumber === 8) Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats * 0.6, rng, nodesRef.current.mixer)
      }
      if (currentBar % 4 === 3 && beatNumber > 12) {
        Audio.playSnare(audioCtxRef.current, humanTime, currentVols.beats * 0.6, rng, nodesRef.current.mixer)
      }
    }
    
    if (beatNumber === 0) {
      barCountRef.current++
      const chordIndex = barCountRef.current
      if (currentVols.chords > 0) {
        Audio.playChord(audioCtxRef.current, humanTime, currentVols.chords, chordIndex, barCountRef.current, rng, nodesRef.current.chordFilter)
      }
      if (currentVols.bass > 0) {
        Audio.playBass(audioCtxRef.current, humanTime, currentVols.bass, chordIndex, barCountRef.current, rng, nodesRef.current.mixer)
      }
    }
  }, [vols, getRNG])
  
  const scheduler = useCallback(() => {
    // RNG available if needed for scheduler-level randomization
    getRNG()
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      scheduleNote(current16thNoteRef.current, nextNoteTimeRef.current)
      const secondsPerBeat = 60.0 / tempo
      const swing = 0.03
      const isSwing = current16thNoteRef.current % 2 === 1
      nextNoteTimeRef.current += 0.25 * secondsPerBeat + (isSwing ? swing : 0)
      current16thNoteRef.current = (current16thNoteRef.current + 1) % 16
    }
    
    driftOffsetRef.current += 0.005
    const breath = Math.sin(driftOffsetRef.current)
    
    if (nodesRef.current.drone && vols.drone > 0) {
      nodesRef.current.drone.gain.setTargetAtTime(Math.max(0, vols.drone + breath * 0.05), audioCtxRef.current.currentTime, 0.1)
    }
    
    if (nodesRef.current.wind && vols.wind > 0) {
      const windBreath = Math.sin(driftOffsetRef.current * 0.5) * 0.5 + 0.5
      nodesRef.current.wind.gain.setTargetAtTime(vols.wind * windBreath, audioCtxRef.current.currentTime, 0.5)
    }
    
    if (nodesRef.current.chordFilter) {
      const newFreq = 700 + (breath * 500)
      nodesRef.current.chordFilter.frequency.setTargetAtTime(newFreq, audioCtxRef.current.currentTime, 0.1)
    }
    
    schedulerTimerRef.current = requestAnimationFrame(scheduler)
  }, [tempo, vols.drone, vols.wind, scheduleNote, getRNG])
  
  // Assign scheduler to ref for visibility API access
  schedulerRef.current = scheduler
  
  // Visibility API - pause audio processing when tab hidden
  useEffect(() => {
    if (!started || !audioCtxRef.current) return
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Suspend audio context to save CPU/battery
        if (audioCtxRef.current?.state === 'running') {
          audioCtxRef.current.suspend()
        }
        // Pause scheduler
        if (schedulerTimerRef.current) {
          cancelAnimationFrame(schedulerTimerRef.current)
          schedulerTimerRef.current = null
        }
      } else {
        // Resume audio context
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume()
        }
        // Restart scheduler using ref to avoid circular dependency
        if (!schedulerTimerRef.current && schedulerRef.current) {
          schedulerRef.current()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [started])
  
  const startEngine = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      audioCtxRef.current = ctx
      
      // Master chain
      const mixer = ctx.createGain()
      nodesRef.current.mixer = mixer
      
      const chordFilter = ctx.createBiquadFilter()
      chordFilter.type = 'lowpass'
      chordFilter.frequency.value = 600
      chordFilter.Q.value = 1
      chordFilter.connect(mixer)
      nodesRef.current.chordFilter = chordFilter
      
      const masterFilter = ctx.createBiquadFilter()
      masterFilter.type = 'lowpass'
      masterFilter.frequency.value = 20000
      masterFilter.Q.value = 0.5
      nodesRef.current.masterFilter = masterFilter
      
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -24
      compressor.knee.value = 30
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25
      
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      
      const masterGain = ctx.createGain()
      masterGain.gain.value = vols.master
      nodesRef.current.masterGain = masterGain
      
      mixer.connect(masterFilter)
      masterFilter.connect(compressor)
      compressor.connect(analyser)
      analyser.connect(masterGain)
      masterGain.connect(ctx.destination)
      
      const ambientNodes = Audio.startAmbientLayers(ctx, mixer, vols)
      Object.assign(nodesRef.current, ambientNodes)
      
      nextNoteTimeRef.current = ctx.currentTime + 0.1
      scheduler()
      setStarted(true)
    } catch (err) {
      console.error('Audio engine failed:', err)
      alert('Audio Engine Failed. Please try refreshing the page.')
    }
  }, [vols, scheduler])
  
  // Cleanup function to properly disconnect all audio nodes
  const cleanupAudio = useCallback(() => {
    // Stop scheduler
    if (schedulerTimerRef.current) {
      cancelAnimationFrame(schedulerTimerRef.current)
      schedulerTimerRef.current = null
    }
    
    // Stop and disconnect all audio nodes
    const nodes = nodesRef.current
    
    // Stop buffer sources
    Object.entries(nodes).forEach(([_key, node]) => {
      if (node && typeof node.stop === 'function') {
        try {
          node.stop()
        } catch (e) {
          // Node may already be stopped
        }
      }
      if (node && typeof node.disconnect === 'function') {
        try {
          node.disconnect()
        } catch (e) {
          // Node may already be disconnected
        }
      }
    })
    
    // Close audio context
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close()
    }
    
    // Clear refs
    nodesRef.current = {}
    audioCtxRef.current = null
    analyserRef.current = null
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])
  
  const handleVol = useCallback((type, val) => {
    const v = parseFloat(val)
    setVols(prev => {
      const newVols = { ...prev, [type]: v }
      
      // Volume normalization: calculate total perceived volume
      // to prevent clipping when many layers are active
      const ambientKeys = ['rain', 'wind', 'fire', 'thunder', 'birds', 'city', 'cafe', 'ocean', 'crickets', 'drone', 'rumble', 'vinyl', 'hiss', 'keyboard', 'clock', 'brown']
      const musicKeys = ['beats', 'chords', 'bass']
      
      const ambientSum = ambientKeys.reduce((sum, key) => sum + (newVols[key] || 0), 0)
      const musicSum = musicKeys.reduce((sum, key) => sum + (newVols[key] || 0), 0)
      
      // Apply soft limiting: if total > threshold, gently reduce master
      const totalLoad = (ambientSum * 0.3) + (musicSum * 0.7) // Music has more impact
      const threshold = 2.5
      
      if (totalLoad > threshold && type !== 'master') {
        const reduction = Math.max(0.5, 1 - (totalLoad - threshold) * 0.15)
        newVols.master = Math.min(prev.master, reduction)
      }
      
      return newVols
    })
  }, [])
  
  const startRecording = useCallback(async () => {
    if (!audioCtxRef.current || !analyserRef.current) return
    
    try {
      const dest = audioCtxRef.current.createMediaStreamDestination()
      analyserRef.current.connect(dest)
      
      mediaRecorderRef.current = new MediaRecorder(dest.stream)
      recordedChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lofi-mix-${Date.now()}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setTimeout(() => {
          if (analyserRef.current) {
            analyserRef.current.disconnect(dest)
          }
        }, 100)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingDuration(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch {
      alert('Recording not supported in this browser')
    }
  }, [])
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(recordingIntervalRef.current)
    }
  }, [isRecording])
  
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!started) return
    
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return
      
      const step = 0.1
      
      switch(e.code) {
        case 'Space': {
          e.preventDefault()
          const hasMusic = vols.beats > 0 || vols.chords > 0 || vols.bass > 0
          handleVol('beats', hasMusic ? 0 : 0.5)
          handleVol('chords', hasMusic ? 0 : 0.4)
          handleVol('bass', hasMusic ? 0 : 0.4)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          handleVol('tone', Math.min(1, vols.tone + step))
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          handleVol('tone', Math.max(0, vols.tone - step))
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          handleVol('rain', Math.max(0, vols.rain - step))
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          handleVol('rain', Math.min(1, vols.rain + step))
          break
        }
        case 'KeyR': {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (!isRecording) startRecording()
          }
          break
        }
        case 'KeyS': {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (isRecording) stopRecording()
          }
          break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [started, vols, isRecording, handleVol, startRecording, stopRecording])
  
  // Preset management
  const savePreset = useCallback(() => {
    if (!presetName.trim()) return
    setCustomPresets(prev => ({
      ...prev,
      [presetName]: { vols: { ...vols }, tempo }
    }))
    setPresetName('')
    setShowPresetInput(false)
  }, [presetName, vols, tempo])
  
  const loadPreset = useCallback((name) => {
    const preset = customPresets[name]
    if (preset) {
      if (preset.vols) {
        Object.entries(preset.vols).forEach(([key, val]) => {
          handleVol(key, val)
        })
        if (preset.tempo) setTempo(preset.tempo)
      } else {
        Object.entries(preset).forEach(([key, val]) => {
          if (key !== 'tempo') handleVol(key, val)
        })
      }
    }
  }, [customPresets, handleVol])
  
  const deletePreset = useCallback((name) => {
    setCustomPresets(prev => {
      const copy = { ...prev }
      delete copy[name]
      return copy
    })
  }, [])
  
  const applyPreset = useCallback((p) => {
    const presets = {
      focus: { rain: 0.1, drone: 0.1, beats: 0.4, chords: 0.2, bass: 0.2, vinyl: 0.1, hiss: 0.1, tone: 0.6, rumble: 0, fire: 0, thunder: 0, wind: 0, birds: 0, city: 0, cafe: 0.05, ocean: 0, crickets: 0, keyboard: 0.2, clock: 0.1, brown: 0, master: 1 },
      sleep: { rain: 0.5, drone: 0.1, beats: 0, chords: 0, bass: 0, vinyl: 0.05, hiss: 0.2, tone: 0.4, rumble: 0.4, fire: 0.2, thunder: 0.1, wind: 0.3, birds: 0, city: 0, cafe: 0, ocean: 0.4, crickets: 0.3, keyboard: 0, clock: 0.05, brown: 0.3, master: 1 },
      vibe: { rain: 0.1, drone: 0, beats: 0.6, chords: 0.5, bass: 0.5, vinyl: 0.2, hiss: 0.15, tone: 0.8, rumble: 0, fire: 0, thunder: 0, wind: 0, birds: 0, city: 0.1, cafe: 0.1, ocean: 0, crickets: 0, keyboard: 0.05, clock: 0, brown: 0, master: 1 },
      storm: { rain: 0.8, drone: 0, beats: 0, chords: 0, bass: 0, vinyl: 0, hiss: 0, tone: 0.5, rumble: 0.6, fire: 0, thunder: 0.8, wind: 0.5, birds: 0, city: 0, cafe: 0, ocean: 0.2, crickets: 0, keyboard: 0, clock: 0, brown: 0.1, master: 1 },
      nature: { rain: 0.2, drone: 0.05, beats: 0, chords: 0, bass: 0, vinyl: 0, hiss: 0.05, tone: 0.7, rumble: 0, fire: 0.1, thunder: 0, wind: 0.3, birds: 0.6, city: 0, cafe: 0, ocean: 0.3, crickets: 0.2, keyboard: 0, clock: 0, brown: 0, master: 1 },
      'cafe-study': { rain: 0, drone: 0.05, beats: 0.3, chords: 0.2, bass: 0.2, vinyl: 0.1, hiss: 0.1, tone: 0.7, rumble: 0, fire: 0, thunder: 0, wind: 0, birds: 0, city: 0.2, cafe: 0.5, ocean: 0, crickets: 0, keyboard: 0.15, clock: 0.1, brown: 0, master: 1 }
    }
    
    const tempoMap = { focus: 80, sleep: 70, vibe: 85, storm: 80, nature: 75, 'cafe-study': 82 }
    
    if (presets[p]) {
      Object.entries(presets[p]).forEach(([key, val]) => {
        handleVol(key, val)
      })
      setTempo(tempoMap[p])
    }
  }, [handleVol])
  
  // Auto-hide controls
  const [showControls, setShowControls] = useState(true)
  const hideTimerRef = useRef(null)
  
  useEffect(() => {
    if (!started) return
    
    const resetTimer = () => {
      setShowControls(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        if (started) setShowControls(false)
      }, 4000)
    }
    
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('mousedown', resetTimer)
    window.addEventListener('touchstart', resetTimer)
    window.addEventListener('keydown', resetTimer)
    
    const timer = setTimeout(() => {
      if (started) setShowControls(false)
    }, 4000)
    hideTimerRef.current = timer
    
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('mousedown', resetTimer)
      window.removeEventListener('touchstart', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [started])
  
  return (
    <ErrorBoundary>
      <div className="app">
        <ScreenReaderAnnouncer />
        <Onboarding onComplete={() => track('onboarding_complete')} />
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#0f172a' }} />}>
          <Visualizer
            vols={vols}
            timeMode={timeMode}
            visualizerStyle={visualizerStyle}
            prefersReducedMotion={prefersReducedMotion}
            analyserRef={analyserRef}
            lightningTriggerRef={lightningTriggerRef}
          />
        </Suspense>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="recording-indicator" role="status" aria-live="polite">
            <div className="rec-dot"></div>
            <span>REC {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
        
        {/* Timer display */}
        {started && timerRemaining < timerMinutes * 60 && (
          <div className="timer-display">
            {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        {!started && <StartScreen onStart={startEngine} />}
        
        {started && (
          <div className="app-container">
            <div
              className="control-box"
              style={{
                opacity: showControls ? 1 : 0,
                transition: 'opacity 0.5s ease',
                pointerEvents: showControls ? 'auto' : 'none'
              }}
            >
              <Suspense fallback={<div style={{ color: 'white', padding: 20 }}>Loading...</div>}>
                <ControlPanel
                  vols={vols}
                  handleVol={handleVol}
                  tempo={tempo}
                  setTempo={setTempo}
                  timeMode={timeMode}
                  visualizerStyle={visualizerStyle}
                  setVisualizerStyle={setVisualizerStyle}
                  useSeededRNG={useSeededRNG}
                  setUseSeededRNG={setUseSeededRNG}
                  seed={seed}
                  setSeed={setSeed}
                  customPresets={customPresets}
                  showPresetInput={showPresetInput}
                  setShowPresetInput={setShowPresetInput}
                  presetName={presetName}
                  setPresetName={setPresetName}
                  savePreset={savePreset}
                  loadPreset={loadPreset}
                  deletePreset={deletePreset}
                  applyPreset={applyPreset}
                  isRecording={isRecording}
                  toggleRecording={toggleRecording}
                  timerMinutes={timerMinutes}
                  setTimerMinutes={setTimerMinutes}
                  timerActive={timerActive}
                  setTimerActive={setTimerActive}
                  timerRemaining={timerRemaining}
                  setTimerRemaining={setTimerRemaining}
                  undo={undo}
                  redo={redo}
                  exportPresets={exportPresets}
                  importPresets={importPresets}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
