import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Audio from './audio'

describe('Audio Utils', () => {
  let mockCtx
  
  beforeEach(() => {
    mockCtx = new (global.AudioContext)()
  })
  
  describe('createPinkNoise', () => {
    it('creates a buffer source', () => {
      const noise = Audio.createPinkNoise(mockCtx)
      expect(noise).toBeDefined()
      expect(noise.buffer).toBeDefined()
      expect(noise.loop).toBe(true)
    })
  })
  
  describe('createVinylCrackle', () => {
    it('creates vinyl crackle buffer', () => {
      const crackle = Audio.createVinylCrackle(mockCtx)
      expect(crackle).toBeDefined()
      expect(crackle.buffer).toBeDefined()
    })
  })
  
  describe('createWindSound', () => {
    it('creates wind sound buffer', () => {
      const wind = Audio.createWindSound(mockCtx)
      expect(wind).toBeDefined()
      expect(wind.buffer).toBeDefined()
    })
  })
  
  describe('playKick', () => {
    it('creates kick drum sound', () => {
      const mockRng = { range: vi.fn().mockReturnValue(0) }
      const mockMixer = { connect: vi.fn() }
      
      expect(() => {
        Audio.playKick(mockCtx, 0, 0.5, mockRng, mockMixer)
      }).not.toThrow()
    })
  })
  
  describe('playSnare', () => {
    it('creates snare sound', () => {
      const mockRng = { range: vi.fn().mockReturnValue(0) }
      const mockMixer = { connect: vi.fn() }
      
      expect(() => {
        Audio.playSnare(mockCtx, 0, 0.5, mockRng, mockMixer)
      }).not.toThrow()
    })
  })
  
  describe('playHiHat', () => {
    it('creates hi-hat sound', () => {
      const mockRng = { range: vi.fn().mockReturnValue(6000) }
      const mockMixer = { connect: vi.fn() }
      
      expect(() => {
        Audio.playHiHat(mockCtx, 0, 0.5, mockRng, mockMixer)
      }).not.toThrow()
    })
  })
  
  describe('playChord', () => {
    it('creates chord sound', () => {
      const mockRng = { range: vi.fn().mockReturnValue(0) }
      const mockChordFilter = { connect: vi.fn() }
      
      expect(() => {
        Audio.playChord(mockCtx, 0, 0.5, 0, 0, mockRng, mockChordFilter)
      }).not.toThrow()
    })
  })
  
  describe('playBass', () => {
    it('creates bass sound', () => {
      const mockRng = { next: vi.fn().mockReturnValue(0) }
      const mockMixer = { connect: vi.fn() }
      
      expect(() => {
        Audio.playBass(mockCtx, 0, 0.5, 0, 0, mockRng, mockMixer)
      }).not.toThrow()
    })
  })
  
  describe('triggerThunder', () => {
    it('triggers thunder sound', () => {
      const mockMixer = { connect: vi.fn() }
      
      const result = Audio.triggerThunder(mockCtx, 0.5, mockMixer)
      expect(result).toBe(true)
    })
  })
  
  describe('triggerBirdChirp', () => {
    it('triggers bird chirp', () => {
      const mockMixer = { connect: vi.fn() }
      
      expect(() => {
        Audio.triggerBirdChirp(mockCtx, 0.5, mockMixer)
      }).not.toThrow()
    })
  })
  
  describe('startAmbientLayers', () => {
    it('starts all ambient sound layers', () => {
      const mockDest = { connect: vi.fn() }
      const vols = {
        rain: 0.5,
        drone: 0.3,
        rumble: 0.2,
        vinyl: 0.1,
        fire: 0.4,
        hiss: 0.2,
        wind: 0.3,
        city: 0.1,
        cafe: 0.1,
        ocean: 0.2,
        crickets: 0.1,
        keyboard: 0.1,
        clock: 0.05,
        brown: 0.2
      }
      
      const nodes = Audio.startAmbientLayers(mockCtx, mockDest, vols)
      
      expect(nodes).toBeDefined()
      expect(nodes.rain).toBeDefined()
      expect(nodes.drone).toBeDefined()
      expect(nodes.rumble).toBeDefined()
      expect(nodes.vinyl).toBeDefined()
      expect(nodes.fire).toBeDefined()
    })
  })
})
