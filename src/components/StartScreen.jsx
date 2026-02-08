export function StartScreen({ onStart }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="start-title">
      <div className="start-content">
        <h1 id="start-title" className="start-title">Sonic Sanctuary</h1>
        <p className="start-subtitle">Procedural Lofi Generator</p>
        <button 
          className="btn-start" 
          onClick={onStart}
          aria-label="Start the lofi music generator"
        >
          Start Lofi Station
        </button>
      </div>
    </div>
  )
}
