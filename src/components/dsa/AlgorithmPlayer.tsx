import { useEffect, useRef, useState, type ReactNode } from 'react'

export type AnimationStep<State> = {
  line: number
  phase: string
  narration: string
  state: State
  variables: Record<string, string | number | boolean | null>
  prediction?: string
}

type AlgorithmPlayerProps<State> = {
  title: string
  subtitle: string
  code: string[]
  steps: AnimationStep<State>[]
  controls: ReactNode
  renderScene: (step: AnimationStep<State>) => ReactNode
  complexity: { time: string; space: string }
  onProgress?: () => void
}

export function AlgorithmPlayer<State>({
  title,
  subtitle,
  code,
  steps,
  controls,
  renderScene,
  complexity,
  onProgress,
}: AlgorithmPlayerProps<State>) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const playerRef = useRef<HTMLElement>(null)
  const step = steps[Math.min(index, steps.length - 1)]

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === playerRef.current)
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  useEffect(() => {
    if (!playing || index >= steps.length - 1) {
      if (index >= steps.length - 1) setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      setIndex((current) => Math.min(current + 1, steps.length - 1))
      onProgress?.()
    }, 1100 / speed)
    return () => window.clearTimeout(timer)
  }, [index, onProgress, playing, speed, steps.length])

  const move = (next: number) => {
    setPlaying(false)
    setIndex(Math.max(0, Math.min(next, steps.length - 1)))
    onProgress?.()
  }

  const toggleFullscreen = async () => {
    if (!playerRef.current) return
    if (document.fullscreenElement === playerRef.current) await document.exitFullscreen()
    else await playerRef.current.requestFullscreen()
  }

  if (!step) return null

  return (
    <section className="algorithm-player" ref={playerRef}>
      <header className="player-header">
        <div><span className="live-dot" /> INTERACTIVE TRACE<h2>{title}</h2><p>{subtitle}</p></div>
        <div className="player-header-actions">
          <div className="player-complexity">
            <span>TIME <b>{complexity.time}</b></span>
            <span>SPACE <b>{complexity.space}</b></span>
          </div>
          <button className="fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit focused mode' : 'Enter focused mode'} title={fullscreen ? 'Exit focused mode' : 'Focused full-screen mode'}>
            <span>{fullscreen ? '↙' : '↗'}</span>{fullscreen ? 'EXIT FOCUS' : 'FOCUS'}
          </button>
        </div>
      </header>

      <div className="algorithm-controls">{controls}</div>

      <div className="player-workspace">
        <div className="scene-panel">
          <div className="scene-grid">{renderScene(step)}</div>
          <div className="narration-card">
            <span>{step.phase}</span>
            <p>{step.narration}</p>
            {step.prediction && <div className="prediction-prompt"><b>Predict:</b> {step.prediction}</div>}
          </div>
        </div>

        <aside className="trace-panel">
          <div className="code-trace">
            <div className="trace-title"><span>PYTHON</span><b>line {step.line}</b></div>
            <code>
              {code.map((line, lineIndex) => (
                <span className={lineIndex + 1 === step.line ? 'active' : ''} key={`${line}-${lineIndex}`}>
                  <i>{String(lineIndex + 1).padStart(2, '0')}</i>{line || ' '}
                </span>
              ))}
            </code>
          </div>
          <div className="variable-watch">
            <div className="trace-title"><span>VARIABLE WATCH</span><b>{Object.keys(step.variables).length}</b></div>
            <div>
              {Object.entries(step.variables).map(([name, value]) => (
                <span key={name}><b>{name}</b><code>{value === null ? 'None' : String(value)}</code></span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="playback-bar">
        <div className="timeline">
          <span style={{ width: `${steps.length <= 1 ? 100 : (index / (steps.length - 1)) * 100}%` }} />
        </div>
        <div className="playback-controls">
          <button onClick={() => move(0)} aria-label="Restart">↺</button>
          <button onClick={() => move(index - 1)} disabled={index === 0} aria-label="Previous step">←</button>
          <button className="play-button" onClick={() => {
            if (index === steps.length - 1) setIndex(0)
            setPlaying((current) => !current)
          }}>{playing ? 'Ⅱ' : '▶'}</button>
          <button onClick={() => move(index + 1)} disabled={index === steps.length - 1} aria-label="Next step">→</button>
          <span className="step-count">{index + 1} / {steps.length}</span>
        </div>
        <label className="speed-control">SPEED
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </footer>
    </section>
  )
}
