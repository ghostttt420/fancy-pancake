// =========================================================
// AUDIO DSP HELPERS
// =========================================================

export const createPinkNoise = (ctx) => {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    output[i] *= 0.11
    b6 = white * 0.115926
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createTapeHiss = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createVinylCrackle = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    if (Math.random() > 0.999) data[i] = Math.random() * 0.5
    else data[i] = 0
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createFireSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    if(Math.random() > 0.95) data[i] = Math.random() * 0.3
    else data[i] = Math.random() * 0.02
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createWindSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    data[i] = (lastOut + (0.02 * white)) / 1.02
    lastOut = data[i]
    data[i] *= 3.5
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createCitySound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.1
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createCafeSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.05
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createOceanSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + (0.01 * white)) / 1.01
    data[i] = lastOut * 2
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createCricketsSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() > 0.9995 ? (Math.random() * 2 - 1) * 0.3 : 0
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createKeyboardSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.15 : 0
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createClockSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  const tickInterval = Math.floor(ctx.sampleRate)
  for (let i = 0; i < bufferSize; i++) {
    if (i % tickInterval === 0) {
      data[i] = 0.1
      if (i + 1 < bufferSize) data[i + 1] = 0.05
      if (i + 2 < bufferSize) data[i + 2] = 0.02
    } else {
      data[i] = 0
    }
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

export const createDeepBrownSound = (ctx) => {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + (0.02 * white)) / 1.02
    output[i] = lastOut * 3.5
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  return noise
}

// Trigger sounds
export const triggerThunder = (ctx, vol, mixerNode) => {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  const gain = ctx.createGain()
  const bufferSize = ctx.sampleRate * 1
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(mixerNode)
  const time = ctx.currentTime
  gain.gain.setValueAtTime(vol, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 2.5)
  noise.start(time)
  return true
}

export const triggerBirdChirp = (ctx, vol, mixerNode) => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(mixerNode)
  
  const now = ctx.currentTime
  const freq = 2000 + Math.random() * 1500
  
  osc.frequency.setValueAtTime(freq, now)
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.05)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.15)
  
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.1, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  
  osc.start(now)
  osc.stop(now + 0.2)
}

// Instruments
export const playKick = (ctx, time, vol, rng, mixerNode) => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(mixerNode)
  const pitchVar = rng.range(-5, 5)
  osc.frequency.setValueAtTime(150 + pitchVar, time)
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5)
  const velVar = vol * rng.range(0.9, 1.1)
  gain.gain.setValueAtTime(velVar, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)
  osc.start(time)
  osc.stop(time + 0.5)
}

export const playSnare = (ctx, time, vol, rng, mixerNode) => {
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  const gainOsc = ctx.createGain()
  osc.connect(gainOsc)
  gainOsc.connect(mixerNode)
  const bufferSize = ctx.sampleRate * 0.5
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const gainNoise = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1000
  noise.connect(filter)
  filter.connect(gainNoise)
  gainNoise.connect(mixerNode)
  const pitchVar = rng.range(-10, 10)
  osc.frequency.setValueAtTime(250 + pitchVar, time)
  const vel = vol * rng.range(0.8, 1.1)
  gainOsc.gain.setValueAtTime(vel * 0.5, time)
  gainOsc.gain.exponentialRampToValueAtTime(0.01, time + 0.2)
  gainNoise.gain.setValueAtTime(vel * 0.8, time)
  gainNoise.gain.exponentialRampToValueAtTime(0.01, time + 0.2)
  osc.start(time)
  osc.stop(time + 0.2)
  noise.start(time)
  noise.stop(time + 0.2)
}

export const playHiHat = (ctx, time, vol, rng, mixerNode) => {
  const bufferSize = ctx.sampleRate * 0.1
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const freqVar = rng.range(6000, 8000)
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = freqVar
  const gain = ctx.createGain()
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(mixerNode)
  const vel = vol * rng.range(0.5, 1.0)
  gain.gain.setValueAtTime(vel * 0.6, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05)
  noise.start(time)
  noise.stop(time + 0.05)
}

export const playChord = (ctx, time, vol, chordIndex, barCount, rng, chordFilter) => {
  const progressions = [
    [[349.23, 440.00, 523.25, 659.25], [329.63, 392.00, 493.88, 587.33], [293.66, 349.23, 440.00, 523.25], [261.63, 329.63, 392.00, 493.88]],
    [[311.13, 392.00, 466.16, 587.33], [349.23, 415.30, 523.25, 622.25], [233.08, 293.66, 349.23, 466.16], [311.13, 392.00, 466.16, 523.25]],
    [[220.00, 261.63, 329.63, 392.00], [196.00, 246.94, 293.66, 349.23], [349.23, 440.00, 523.25, 659.25], [164.81, 207.65, 246.94, 329.63]],
    [[261.63, 329.63, 392.00, 493.88], [246.94, 293.66, 369.99, 440.00], [220.00, 261.63, 329.63, 392.00], [196.00, 246.94, 293.66, 349.23]],
    [[174.61, 220.00, 261.63, 329.63], [196.00, 246.94, 293.66, 349.23], [233.08, 293.66, 349.23, 466.16], [207.65, 261.63, 311.13, 392.00]],
    [[293.66, 349.23, 440.00, 523.25], [261.63, 311.13, 392.00, 466.16], [349.23, 415.30, 523.25, 622.25], [329.63, 392.00, 493.88, 587.33]]
  ]

  const currentProgIndex = Math.floor(barCount / 8) % progressions.length
  let notes = progressions[currentProgIndex][chordIndex % 4]
  if (barCount % 4 === 3) notes = notes.map(n => n * 1.5)
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 2
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 2
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start(time)
    
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(chordFilter)
    
    const strumDelay = i * 0.05 + rng.range(0, 0.02)
    const startTime = time + strumDelay
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(vol * 0.1, startTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 2.5)
    osc.start(startTime)
    osc.stop(startTime + 3)
    lfo.stop(startTime + 3)
  })
}

export const playBass = (ctx, time, vol, chordIndex, barCount, rng, mixerNode) => {
  const roots = [87.31, 82.41, 73.42, 65.41]
  const freq = roots[chordIndex % 4]
  const pattern = Math.floor(barCount / 8) % 4
  
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  const gain = ctx.createGain()
  osc.frequency.setValueAtTime(freq, time)
  osc.connect(gain)
  gain.connect(mixerNode)
  
  if (pattern === 0) {
    if (rng.next() > 0.7) {
      osc.frequency.setValueAtTime(freq - 10, time)
      osc.frequency.linearRampToValueAtTime(freq, time + 0.1)
    }
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol * 0.6, time + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5)
  } else if (pattern === 1) {
    gain.gain.setValueAtTime(vol * 0.5, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4)
  } else if (pattern === 2) {
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol * 0.5, time + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 2.5)
  } else {
    if (rng.next() > 0.5) {
      osc.frequency.setValueAtTime(freq, time)
      osc.frequency.setValueAtTime(freq * 1.5, time + 0.5)
    }
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol * 0.55, time + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.8)
  }
  
  osc.start(time)
  osc.stop(time + 3)
}

// Start ambient layers
export const startAmbientLayers = (ctx, dest, vols) => {
  const nodes = {}
  
  const rainSrc = createPinkNoise(ctx)
  const rainGain = ctx.createGain()
  rainGain.gain.value = vols.rain
  rainSrc.connect(rainGain).connect(dest)
  rainSrc.start(0)
  nodes.rain = rainGain

  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  const hour = new Date().getHours()
  let baseFreq = hour > 18 || hour < 6 ? 55 : 110
  osc1.frequency.value = baseFreq
  osc2.frequency.value = baseFreq + 2
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 400
  const droneGain = ctx.createGain()
  droneGain.gain.value = vols.drone
  osc1.connect(droneFilter)
  osc2.connect(droneFilter)
  droneFilter.connect(droneGain).connect(dest)
  osc1.start(0)
  osc2.start(0)
  nodes.drone = droneGain

  const rumbleSrc = createPinkNoise(ctx)
  const rumbleFilter = ctx.createBiquadFilter()
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.value = 350
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.value = vols.rumble
  rumbleSrc.connect(rumbleFilter).connect(rumbleGain).connect(dest)
  rumbleSrc.start(0)
  nodes.rumble = rumbleGain

  const vinylSrc = createVinylCrackle(ctx)
  const vinylGain = ctx.createGain()
  vinylGain.gain.value = vols.vinyl
  const vinylFilter = ctx.createBiquadFilter()
  vinylFilter.type = 'highpass'
  vinylFilter.frequency.value = 2000
  vinylSrc.connect(vinylFilter).connect(vinylGain).connect(dest)
  vinylSrc.start(0)
  nodes.vinyl = vinylGain
  
  const fireSrc = createFireSound(ctx)
  const fireGain = ctx.createGain()
  fireGain.gain.value = vols.fire
  const fireFilter = ctx.createBiquadFilter()
  fireFilter.type = 'lowpass'
  fireFilter.frequency.value = 3000
  fireSrc.connect(fireFilter).connect(fireGain).connect(dest)
  fireSrc.start(0)
  nodes.fire = fireGain

  const hissSrc = createTapeHiss(ctx)
  const hissGain = ctx.createGain()
  hissGain.gain.value = vols.hiss || 0
  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = 'lowpass'
  hissFilter.frequency.value = 8000
  hissSrc.connect(hissFilter).connect(hissGain).connect(dest)
  hissSrc.start(0)
  nodes.hiss = hissGain

  const windSrc = createWindSound(ctx)
  const windGain = ctx.createGain()
  windGain.gain.value = vols.wind || 0
  const windFilter = ctx.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.value = 400
  windFilter.Q.value = 0.5
  windSrc.connect(windFilter).connect(windGain).connect(dest)
  windSrc.start(0)
  nodes.wind = windGain

  const citySrc = createCitySound(ctx)
  const cityGain = ctx.createGain()
  cityGain.gain.value = vols.city || 0
  const cityFilter = ctx.createBiquadFilter()
  cityFilter.type = 'lowpass'
  cityFilter.frequency.value = 800
  citySrc.connect(cityFilter).connect(cityGain).connect(dest)
  citySrc.start(0)
  nodes.city = cityGain

  const cafeSrc = createCafeSound(ctx)
  const cafeGain = ctx.createGain()
  cafeGain.gain.value = vols.cafe || 0
  const cafeFilter = ctx.createBiquadFilter()
  cafeFilter.type = 'lowpass'
  cafeFilter.frequency.value = 2000
  cafeSrc.connect(cafeFilter).connect(cafeGain).connect(dest)
  cafeSrc.start(0)
  nodes.cafe = cafeGain

  const oceanSrc = createOceanSound(ctx)
  const oceanGain = ctx.createGain()
  oceanGain.gain.value = vols.ocean || 0
  const oceanFilter = ctx.createBiquadFilter()
  oceanFilter.type = 'lowpass'
  oceanFilter.frequency.value = 600
  oceanFilter.Q.value = 0.5
  oceanSrc.connect(oceanFilter).connect(oceanGain).connect(dest)
  oceanSrc.start(0)
  nodes.ocean = oceanGain

  const cricketsSrc = createCricketsSound(ctx)
  const cricketsGain = ctx.createGain()
  cricketsGain.gain.value = vols.crickets || 0
  const cricketsFilter = ctx.createBiquadFilter()
  cricketsFilter.type = 'bandpass'
  cricketsFilter.frequency.value = 6000
  cricketsFilter.Q.value = 1
  cricketsSrc.connect(cricketsFilter).connect(cricketsGain).connect(dest)
  cricketsSrc.start(0)
  nodes.crickets = cricketsGain

  const keyboardSrc = createKeyboardSound(ctx)
  const keyboardGain = ctx.createGain()
  keyboardGain.gain.value = vols.keyboard || 0
  const keyboardFilter = ctx.createBiquadFilter()
  keyboardFilter.type = 'highpass'
  keyboardFilter.frequency.value = 1000
  keyboardSrc.connect(keyboardFilter).connect(keyboardGain).connect(dest)
  keyboardSrc.start(0)
  nodes.keyboard = keyboardGain

  const clockSrc = createClockSound(ctx)
  const clockGain = ctx.createGain()
  clockGain.gain.value = vols.clock || 0
  const clockFilter = ctx.createBiquadFilter()
  clockFilter.type = 'bandpass'
  clockFilter.frequency.value = 3000
  clockFilter.Q.value = 2
  clockSrc.connect(clockFilter).connect(clockGain).connect(dest)
  clockSrc.start(0)
  nodes.clock = clockGain

  const brownSrc = createDeepBrownSound(ctx)
  const brownGain = ctx.createGain()
  brownGain.gain.value = vols.brown || 0
  const brownFilter = ctx.createBiquadFilter()
  brownFilter.type = 'lowpass'
  brownFilter.frequency.value = 200
  brownSrc.connect(brownFilter).connect(brownGain).connect(dest)
  brownSrc.start(0)
  nodes.brown = brownGain

  return nodes
}
