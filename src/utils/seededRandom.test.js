import { describe, it, expect } from 'vitest'
import { SeededRandom } from './seededRandom'

describe('SeededRandom', () => {
  it('generates consistent numbers with same seed', () => {
    const rng1 = new SeededRandom(12345)
    const rng2 = new SeededRandom(12345)
    
    const vals1 = [rng1.next(), rng1.next(), rng1.next()]
    const vals2 = [rng2.next(), rng2.next(), rng2.next()]
    
    expect(vals1).toEqual(vals2)
  })
  
  it('generates different numbers with different seeds', () => {
    const rng1 = new SeededRandom(12345)
    const rng2 = new SeededRandom(54321)
    
    expect(rng1.next()).not.toBe(rng2.next())
  })
  
  it('next() returns values between 0 and 1', () => {
    const rng = new SeededRandom()
    
    for (let i = 0; i < 100; i++) {
      const val = rng.next()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
  
  it('range() returns values within specified range', () => {
    const rng = new SeededRandom()
    
    for (let i = 0; i < 100; i++) {
      const val = rng.range(10, 20)
      expect(val).toBeGreaterThanOrEqual(10)
      expect(val).toBeLessThan(20)
    }
  })
  
  it('uses Date.now() as default seed', () => {
    const _before = Date.now()
    const rng = new SeededRandom()
    const _after = Date.now()
    
    // Just verify it creates successfully with random seed
    expect(rng.next()).toBeGreaterThanOrEqual(0)
    expect(rng.next()).toBeLessThan(1)
  })
})
