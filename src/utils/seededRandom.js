// =========================================================
// SEEDED RANDOM NUMBER GENERATOR
// =========================================================
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed
  }
  
  // Linear Congruential Generator
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296
    return this.seed / 4294967296
  }
  
  range(min, max) {
    return min + this.next() * (max - min)
  }
  
  int(min, max) {
    return Math.floor(this.range(min, max))
  }
  
  choice(arr) {
    return arr[this.int(0, arr.length)]
  }
}
