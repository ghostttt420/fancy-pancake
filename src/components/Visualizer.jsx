import { useEffect, useRef } from 'react'

export function Visualizer({ vols, timeMode, visualizerStyle, prefersReducedMotion, analyserRef, lightningTriggerRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frameId
    let lastFrameTime = 0
    const targetFPS = prefersReducedMotion ? 30 : 60
    const frameInterval = 1000 / targetFPS

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const rainParticles = []
    for(let i=0; i<100; i++) rainParticles.push({ 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      s: Math.random() * 2 + 0.5, 
      l: Math.random() * 20 + 5 
    })
    
    const stars = []
    for(let i=0; i<150; i++) stars.push({ 
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height, 
      size: Math.random() * 1.5, 
      blinkSpeed: Math.random() * 0.05, 
      offset: Math.random() * Math.PI 
    })
    
    const clouds = []
    for(let i=0; i<5; i++) clouds.push({ 
      x: Math.random() * canvas.width, 
      y: (Math.random() * canvas.height) * 0.5, 
      speed: (Math.random() * 0.2) + 0.1, 
      size: (Math.random() * 50) + 50, 
      puffs: 5 
    })
    
    const fireParticles = []
    const sparks = []
    const smoke = []
    const birds = []
    let shootingStar = null 
    let frameCount = 0
    let audioLevel = 0

    const draw = (timestamp) => {
      // Throttle frame rate for performance
      if (timestamp - lastFrameTime < frameInterval) {
        frameId = requestAnimationFrame(draw)
        return
      }
      lastFrameTime = timestamp
      frameCount++

      let bgColor, accent, sunColor, isDay
      const hour = new Date().getHours()
      let mode
      if (hour >= 5 && hour < 12) { mode = 'morning' }
      else if (hour >= 12 && hour < 17) { mode = 'day' }
      else if (hour >= 17 && hour < 21) { mode = 'evening' }
      else { mode = 'night' }

      if (mode === 'morning') { 
        bgColor = '#0f172a'
        accent = '#38bdf8'
        sunColor = '#fcd34d'
        isDay = true
      } else if (mode === 'day') { 
        bgColor = '#1e293b'
        accent = '#a5b4fc'
        sunColor = '#fdba74'
        isDay = true
      } else if (mode === 'evening') { 
        bgColor = '#271a12'
        accent = '#fb923c'
        sunColor = '#ea580c'
        isDay = false
      } else { 
        bgColor = '#020205'
        accent = '#94a3b8'
        sunColor = '#f8fafc'
        isDay = false
      }

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Calculate audio level for reactivity (if analyser available)
      if (analyserRef?.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        // Get average of lower frequencies (more percussive)
        let sum = 0
        const count = Math.floor(dataArray.length * 0.3) // Lower 30% of frequencies
        for (let i = 0; i < count; i++) {
          sum += dataArray[i]
        }
        audioLevel = sum / (count * 255) // Normalize to 0-1
      }

      // Lightning flash effect
      if (lightningTriggerRef?.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningTriggerRef.current * 0.1})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        lightningTriggerRef.current--
      }

      // Fire visualization with audio reactivity, sparks and smoke
      if (vols.fire > 0) {
        // Calculate audio reactivity (0-1 range)
        let audioBoost = 0.3 + (audioLevel * 0.7) // Base 30% + up to 70% from audio
        
        // Spawn fire particles - audio reactive
        const spawnRate = vols.fire * 2.5 * audioBoost
        if (Math.random() < spawnRate) { 
          fireParticles.push({ 
            x: Math.random() * canvas.width,
            y: canvas.height + 20, 
            vx: (Math.random() - 0.5) * 1.0, 
            vy: (Math.random() * 5 + 3) * (0.8 + audioLevel * 0.4), // Faster when loud
            size: (Math.random() * 60 + 40) * (0.8 + audioLevel * 0.4), // Bigger when loud
            life: 1.0,
            decay: (Math.random() * 0.02 + 0.005) * (1.2 - audioLevel * 0.3) // Live longer when loud
          })
        }
        
        // Spawn sparks - small, fast, short-lived
        if (Math.random() < vols.fire * 0.3 * audioBoost) {
          sparks.push({
            x: Math.random() * canvas.width,
            y: canvas.height - Math.random() * 100,
            vx: (Math.random() - 0.5) * 8,
            vy: -(Math.random() * 10 + 5),
            size: Math.random() * 3 + 1,
            life: 1.0,
            decay: Math.random() * 0.03 + 0.02
          })
        }
        
        // Spawn smoke - slow, grey, transparent
        if (Math.random() < vols.fire * 0.5) {
          smoke.push({
            x: Math.random() * canvas.width,
            y: canvas.height - Math.random() * 50,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(Math.random() * 1 + 0.5),
            size: Math.random() * 40 + 30,
            life: 1.0,
            decay: Math.random() * 0.005 + 0.003
          })
        }

        // Draw smoke (behind fire)
        for (let i = smoke.length - 1; i >= 0; i--) {
          const p = smoke[i]
          ctx.fillStyle = `rgba(80, 80, 80, ${p.life * 0.15})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
          ctx.fill()
          
          p.y += p.vy
          p.x += p.vx + Math.sin(frameCount * 0.02 + p.y * 0.005) * 0.5
          p.size *= 1.005 // Expand slightly
          p.life -= p.decay
          
          if (p.life <= 0) smoke.splice(i, 1)
        }

        ctx.globalCompositeOperation = 'lighter'
        
        // Draw fire particles
        for (let i = fireParticles.length - 1; i >= 0; i--) {
          const p = fireParticles[i]
          let color
          if (p.life > 0.7) color = `rgba(255, 255, 100, ${p.life * 0.5})`
          else if (p.life > 0.4) color = `rgba(255, 100, 0, ${p.life * 0.4})`
          else color = `rgba(100, 0, 0, ${p.life * 0.2})`

          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
          ctx.fill()

          p.y -= p.vy
          p.x += Math.sin(frameCount * 0.05 + p.y * 0.01) * 1.5
          p.size *= 0.96
          p.life -= p.decay

          if (p.life <= 0) fireParticles.splice(i, 1)
        }
        
        // Draw sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i]
          ctx.fillStyle = `rgba(255, 200, 100, ${p.life})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
          ctx.fill()
          
          p.y += p.vy
          p.x += p.vx
          p.vy += 0.3 // Gravity
          p.life -= p.decay
          
          if (p.life <= 0) sparks.splice(i, 1)
        }
        
        ctx.globalCompositeOperation = 'source-over'
      }

      // Birds visualization
      if (vols.birds > 0 && isDay) {
        if (Math.random() < vols.birds * 0.02) {
          birds.push({
            x: -20,
            y: Math.random() * canvas.height * 0.5,
            vx: 2 + Math.random() * 2,
            vy: Math.sin(Math.random() * Math.PI) * 0.5,
            size: 3 + Math.random() * 3,
            wingPhase: Math.random() * Math.PI * 2
          })
        }
        
        ctx.fillStyle = isDay ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.3)'
        for (let i = birds.length - 1; i >= 0; i--) {
          const bird = birds[i]
          ctx.beginPath()
          const wingY = Math.sin(frameCount * 0.2 + bird.wingPhase) * 5
          ctx.moveTo(bird.x - bird.size, bird.y + wingY)
          ctx.lineTo(bird.x, bird.y)
          ctx.lineTo(bird.x + bird.size, bird.y + wingY)
          ctx.strokeStyle = ctx.fillStyle
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          bird.x += bird.vx
          bird.y += bird.vy + Math.sin(frameCount * 0.1) * 0.5
          
          if (bird.x > canvas.width + 20) birds.splice(i, 1)
        }
      }

      // Sun/Moon
      ctx.shadowBlur = 50
      ctx.shadowColor = sunColor
      ctx.fillStyle = sunColor
      ctx.beginPath()
      const sunY = mode === 'morning' ? canvas.height*0.2 : mode === 'day' ? canvas.height*0.1 : canvas.height*0.15
      ctx.arc(canvas.width * 0.8, sunY, 40, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Clouds
      if (isDay || mode === 'evening') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        clouds.forEach(c => {
          for(let j=0; j<c.puffs; j++) { 
            ctx.beginPath()
            ctx.arc(c.x + (j*30), c.y + (Math.sin(j)*10), c.size, 0, Math.PI*2)
            ctx.fill()
          }
          c.x += c.speed
          if(c.x > canvas.width + 100) c.x = -200
        })
      }

      // Stars
      if (!isDay || mode === 'evening') {
        ctx.fillStyle = 'white'
        stars.forEach(s => {
          const opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.002 + s.offset)) * 0.7
          ctx.globalAlpha = opacity
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size, 0, Math.PI*2)
          ctx.fill()
        })
        ctx.globalAlpha = 1.0
        
        if (!shootingStar && Math.random() < 0.005) {
          shootingStar = { x: Math.random()*canvas.width, y: Math.random()*(canvas.height/2), vx: 15, vy: 2, len: 0 }
        }
        if(shootingStar) {
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(shootingStar.x, shootingStar.y)
          ctx.lineTo(shootingStar.x - shootingStar.len, shootingStar.y - (shootingStar.len * 0.2))
          ctx.stroke()
          shootingStar.x += shootingStar.vx
          shootingStar.y += shootingStar.vy
          shootingStar.len += 2
          if (shootingStar.x > canvas.width + 200) shootingStar = null
        }
      }

      // Audio Visualizer
      if (analyserRef.current && visualizerStyle !== 'none') {
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteTimeDomainData(dataArray)
        
        if (visualizerStyle === 'waveform') {
          ctx.lineWidth = 2
          ctx.strokeStyle = accent
          ctx.beginPath()
          const sliceWidth = canvas.width / bufferLength
          let x = 0
          for(let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * (canvas.height/4)) + (canvas.height * 0.75)
            if(i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
            x += sliceWidth
          }
          ctx.stroke()
        } else if (visualizerStyle === 'particles') {
          analyserRef.current.getByteFrequencyData(dataArray)
          const particles = 50
          for(let i = 0; i < particles; i++) {
            const dataIndex = Math.floor(i * bufferLength / particles)
            const value = dataArray[dataIndex]
            const radius = (value / 255) * 100
            const x = (i / particles) * canvas.width
            const y = canvas.height * 0.75
            ctx.fillStyle = `rgba(${100 + value}, ${150 + value/2}, 255, 0.5)`
            ctx.beginPath()
            ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2)
            ctx.fill()
          }
        } else if (visualizerStyle === 'bars') {
          analyserRef.current.getByteFrequencyData(dataArray)
          const bars = 64
          const barWidth = canvas.width / bars
          for(let i = 0; i < bars; i++) {
            const dataIndex = Math.floor(i * bufferLength / bars)
            const value = dataArray[dataIndex]
            const height = (value / 255) * canvas.height * 0.3
            ctx.fillStyle = `hsl(${200 + (i/bars) * 60}, 70%, 60%)`
            ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height)
          }
        } else if (visualizerStyle === 'circular') {
          analyserRef.current.getByteFrequencyData(dataArray)
          const centerX = canvas.width / 2
          const centerY = canvas.height * 0.75
          const radius = 100
          const bars = 60
          
          for(let i = 0; i < bars; i++) {
            const dataIndex = Math.floor(i * bufferLength / bars)
            const value = dataArray[dataIndex]
            const barHeight = (value / 255) * 150
            const angle = (i / bars) * Math.PI * 2
            
            const x1 = centerX + Math.cos(angle) * radius
            const y1 = centerY + Math.sin(angle) * radius
            const x2 = centerX + Math.cos(angle) * (radius + barHeight)
            const y2 = centerY + Math.sin(angle) * (radius + barHeight)
            
            ctx.strokeStyle = `hsl(${180 + (value/255) * 60}, 80%, 60%)`
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }

      // Rain overlay
      ctx.strokeStyle = accent
      ctx.lineWidth = 1
      rainParticles.forEach(p => {
        const opacity = vols.rain > 0 ? vols.rain * 0.5 : 0
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x, p.y + p.l)
        ctx.stroke()
        p.y += p.s + (vols.rain * 15)
        if (p.y > canvas.height) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }
      })
      ctx.globalAlpha = 1.0

      frameId = requestAnimationFrame(draw)
    }
    
    draw()
    return () => cancelAnimationFrame(frameId)
  }, [vols, timeMode, visualizerStyle, prefersReducedMotion, analyserRef, lightningTriggerRef])

  return (
    <canvas 
      ref={canvasRef} 
      aria-label="Ambient visualizer with weather effects and audio visualization"
      role="img"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  )
}
