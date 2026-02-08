// Type definitions for Lofi Mixer

export interface VolumeState {
  rain: number
  drone: number
  rumble: number
  beats: number
  chords: number
  bass: number
  vinyl: number
  fire: number
  thunder: number
  hiss: number
  tone: number
  wind: number
  birds: number
  city: number
  cafe: number
  ocean: number
  crickets: number
  keyboard: number
  clock: number
  brown: number
  master: number
}

export interface Preset {
  vols: VolumeState
  tempo?: number
}

export interface CustomPresets {
  [name: string]: Preset
}

export type VisualizerStyle = 'waveform' | 'particles' | 'bars' | 'circular' | 'none'

export type TimeMode = 'morning' | 'day' | 'evening' | 'night'

export interface ExportData {
  presets: CustomPresets
  currentMix?: {
    vols: VolumeState
    tempo: number
    seed: number
    useSeededRNG: boolean
  }
  version: string
}
