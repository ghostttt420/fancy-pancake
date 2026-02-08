
import { Slider } from './Slider'

export function ControlPanel({
  vols,
  handleVol,
  tempo,
  setTempo,
  timeMode,
  visualizerStyle,
  setVisualizerStyle,
  useSeededRNG,
  setUseSeededRNG,
  seed,
  setSeed,
  customPresets,
  showPresetInput,
  setShowPresetInput,
  presetName,
  setPresetName,
  savePreset,
  loadPreset,
  deletePreset,
  applyPreset,
  isRecording,
  toggleRecording,
  timerMinutes,
  setTimerMinutes,
  timerActive,
  setTimerActive,
  timerRemaining,
  setTimerRemaining,
  undo,
  redo,
  exportPresets,
  importPresets
}) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="control-box">
      <h1>Lofi Gen.</h1>
      <div className="subtitle">Phase: {timeMode} | {tempo} BPM</div>
      
      {/* Timer Section */}
      <div className="timer-section">
        <div className="timer-row">
          <select
            value={timerMinutes}
            onChange={(e) => {
              const mins = parseInt(e.target.value)
              setTimerMinutes(mins)
              setTimerRemaining(mins * 60)
              setTimerActive(false)
            }}
            disabled={timerActive}
            aria-label="Select timer duration"
          >
            <option value={5}>5 min</option>
            <option value={15}>15 min</option>
            <option value={25}>25 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
          <button
            className="btn-timer"
            onClick={() => setTimerActive(!timerActive)}
          >
            {timerActive ? 'Pause' : timerRemaining === 0 ? 'Finished' : 'Start'}
          </button>
          <button
            className="btn-reset"
            onClick={() => {
              setTimerActive(false)
              setTimerRemaining(timerMinutes * 60)
            }}
          >
            Reset
          </button>
        </div>
        {timerRemaining < timerMinutes * 60 && (
          <div className="timer-display-inline" role="timer" aria-label={`Time remaining: ${formatTime(timerRemaining)}`}>
            {formatTime(timerRemaining)}
          </div>
        )}
      </div>
      
      {/* Undo/Redo buttons */}
      <div className="undo-redo-row" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <button 
          className="btn-undo" 
          onClick={undo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last change"
        >
          ↶ Undo
        </button>
        <button 
          className="btn-redo" 
          onClick={redo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo last change"
        >
          ↷ Redo
        </button>
      </div>
      
      {/* Preset buttons */}
      <div className="preset-row" role="group" aria-label="Sound presets">
        <button className="btn-preset" onClick={() => applyPreset('focus')}>Focus</button>
        <button className="btn-preset" onClick={() => applyPreset('sleep')}>Sleep</button>
        <button className="btn-preset" onClick={() => applyPreset('vibe')}>Vibe</button>
        <button className="btn-preset" onClick={() => applyPreset('storm')}>Storm</button>
        <button className="btn-preset" onClick={() => applyPreset('nature')}>Nature</button>
        <button className="btn-preset" onClick={() => applyPreset('cafe-study')}>Café</button>
      </div>
      
      {/* Custom presets */}
      <div className="custom-presets">
        {Object.keys(customPresets).length > 0 && (
          <div className="preset-list" role="list" aria-label="Custom presets">
            {Object.keys(customPresets).map(name => (
              <div key={name} className="preset-item" role="listitem">
                <button className="btn-preset-small" onClick={() => loadPreset(name)}>{name}</button>
                <button 
                  className="btn-delete" 
                  onClick={() => deletePreset(name)}
                  aria-label={`Delete preset ${name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {showPresetInput ? (
          <div className="preset-input-row">
            <input
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && savePreset()}
              aria-label="Enter preset name"
            />
            <button onClick={savePreset}>Save</button>
            <button onClick={() => setShowPresetInput(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn-save-preset" onClick={() => setShowPresetInput(true)}>
            + Save Current Mix
          </button>
        )}
        
        {/* Export/Import */}
        <div className="export-import-row" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn-export" onClick={exportPresets} title="Export all presets">
            ⬇ Export
          </button>
          <label className="btn-import" style={{ cursor: 'pointer' }}>
            ⬆ Import
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  importPresets(e.target.files[0])
                  e.target.value = ''
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Sound layers */}
      <div role="region" aria-label="Ambience sounds">
        <Slider id="vol-rain" label="Rain" value={vols.rain} onChange={e => handleVol('rain', e.target.value)} />
        <Slider id="vol-wind" label="Wind" value={vols.wind} onChange={e => handleVol('wind', e.target.value)} />
        <Slider id="vol-fire" label="Fire Crackle" value={vols.fire} onChange={e => handleVol('fire', e.target.value)} />
        <Slider id="vol-thunder" label="Thunder" value={vols.thunder} onChange={e => handleVol('thunder', e.target.value)} />
        <Slider id="vol-birds" label="Birds" value={vols.birds} onChange={e => handleVol('birds', e.target.value)} />
        <Slider id="vol-city" label="City Traffic" value={vols.city} onChange={e => handleVol('city', e.target.value)} />
        <Slider id="vol-cafe" label="Café Ambience" value={vols.cafe} onChange={e => handleVol('cafe', e.target.value)} />
        <Slider id="vol-ocean" label="Ocean Waves" value={vols.ocean} onChange={e => handleVol('ocean', e.target.value)} />
        <Slider id="vol-crickets" label="Crickets" value={vols.crickets} onChange={e => handleVol('crickets', e.target.value)} />
        <Slider id="vol-keyboard" label="Keyboard Typing" value={vols.keyboard} onChange={e => handleVol('keyboard', e.target.value)} />
        <Slider id="vol-clock" label="Clock Ticking" value={vols.clock} onChange={e => handleVol('clock', e.target.value)} />
        <Slider id="vol-brown" label="Deep Brown Noise" value={vols.brown} onChange={e => handleVol('brown', e.target.value)} />
      </div>
      
      <div role="region" aria-label="Music layers">
        <Slider id="vol-beats" label="Lofi Beats" value={vols.beats} onChange={e => handleVol('beats', e.target.value)} color="#00f0ff" />
        <Slider id="vol-chords" label="Jazz Chords" value={vols.chords} onChange={e => handleVol('chords', e.target.value)} color="#f0f" />
        <Slider id="vol-bass" label="Warm Bass" value={vols.bass} onChange={e => handleVol('bass', e.target.value)} color="#ffaa00" />
      </div>
      
      <div role="region" aria-label="Texture and master controls">
        <Slider id="vol-rumble" label="Rumble & Vinyl" value={vols.rumble} onChange={e => {handleVol('rumble', e.target.value); handleVol('vinyl', e.target.value); }} />
        <Slider id="vol-hiss" label="Tape Hiss" value={vols.hiss} onChange={e => handleVol('hiss', e.target.value)} />
        <Slider id="vol-tone" label="Master Tone (Filter)" value={vols.tone} onChange={e => handleVol('tone', e.target.value)} color="#00ff00" />
        <Slider id="vol-master" label="Master Volume" value={vols.master} onChange={e => handleVol('master', e.target.value)} color="#ff6b6b" />
      </div>

      {/* Tempo Control */}
      <div className="slider-group">
        <label htmlFor="tempo-control" className="slider-label">
          <span>Tempo</span><span>{tempo} BPM</span>
        </label>
        <input
          id="tempo-control"
          type="range"
          min="60"
          max="100"
          step="1"
          value={tempo}
          onChange={e => setTempo(parseInt(e.target.value))}
          aria-label="Tempo in beats per minute"
        />
      </div>

      {/* Visualizer style selector */}
      <div className="visualizer-section">
        <label htmlFor="visualizer-select">Visualizer:</label>
        <select
          id="visualizer-select"
          value={visualizerStyle}
          onChange={(e) => setVisualizerStyle(e.target.value)}
          aria-label="Select visualizer style"
        >
          <option value="waveform">Waveform</option>
          <option value="particles">Particles</option>
          <option value="bars">Frequency Bars</option>
          <option value="circular">Circular</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Seeded RNG controls */}
      <div className="seed-section">
        <label className="seed-label" htmlFor="use-seed">
          <input
            id="use-seed"
            type="checkbox"
            checked={useSeededRNG}
            onChange={(e) => setUseSeededRNG(e.target.checked)}
          />
          Use Fixed Seed
        </label>
        {useSeededRNG && (
          <div className="seed-input-row">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              aria-label="Random seed value"
            />
            <button onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
              Random
            </button>
          </div>
        )}
      </div>

      {/* Recording controls */}
      <div className="recording-section">
        <button
          className={`btn-record ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
        </button>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="shortcuts-help">
        <details>
          <summary>Keyboard Shortcuts</summary>
          <ul>
            <li><kbd>Space</kbd> Toggle music on/off</li>
            <li><kbd>↑</kbd> <kbd>↓</kbd> Adjust tone</li>
            <li><kbd>←</kbd> <kbd>→</kbd> Adjust rain</li>
            <li><kbd>Ctrl+R</kbd> Start recording</li>
            <li><kbd>Ctrl+S</kbd> Stop recording</li>
          </ul>
        </details>
      </div>
    </div>
  )
}
