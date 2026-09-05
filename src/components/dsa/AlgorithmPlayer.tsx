import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { m } from 'motion/react'
import { useLearning, useLessonSession } from '../../data/learningProgress'
import { useStudioMotion } from '../studio/StudioMotion'
import './algorithm-presentation.css'

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
  const session = useLessonSession()
  const { motionEnabled } = useStudioMotion()
  const animate = motionEnabled && (!session || session.stage === 'experiment')
  const { state, update } = useLearning()
  const inputs = session ? state.lessons[session.id]?.inputs : undefined
  const signature = useMemo(() => JSON.stringify({ title, code, inputs, stepCount: steps.length }), [title, code, inputs, steps.length])
  const saved = session ? state.lessons[session.id]?.trace : undefined
  const [position, setPosition] = useState(() => ({ signature, index: saved?.signature === signature ? Math.min(saved.index, steps.length - 1) : 0 }))
  const index = position.signature === signature ? position.index : 0
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(saved?.speed ?? 1)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const playerRef = useRef<HTMLElement>(null)
  const step = steps[Math.min(index, steps.length - 1)]
  const variableNames = useMemo(() => [...new Set(steps.flatMap(frame => Object.keys(frame.variables)))], [steps])

  useEffect(() => {
    setPlaying(false)
  }, [signature, session?.stage])

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === playerRef.current)
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  useEffect(() => {
    if (!playing || session?.stage !== 'experiment' || index >= steps.length - 1) {
      if (index >= steps.length - 1) setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      const next = Math.min(index + 1, steps.length - 1)
      setPosition({ signature, index: next })
      if (session) update(session.id, { trace: { signature, index: next, speed } })
      onProgress?.()
    }, 1100 / speed)
    return () => window.clearTimeout(timer)
  }, [index, onProgress, playing, speed, steps.length, signature, session, update])

  const move = (next: number) => {
    setPlaying(false)
    const bounded = Math.max(0, Math.min(next, steps.length - 1))
    setPosition({ signature, index: bounded })
    if (session) update(session.id, { trace: { signature, index: bounded, speed } })
    if (bounded !== index) onProgress?.()
  }

  const toggleFullscreen = async () => {
    if (!playerRef.current) return
    try {
      if (document.fullscreenElement === playerRef.current) await document.exitFullscreen()
      else await playerRef.current.requestFullscreen()
      setFullscreenError('')
    } catch (error) {
      console.error('Could not change trace fullscreen mode.', error)
      setFullscreenError('Fullscreen is unavailable in this browser. The trace remains usable here.')
    }
  }

  if (!step) return null

  return (
    <section className="algorithm-player stable-player" ref={playerRef} style={{ '--trace-code-lines': code.length } as CSSProperties}>
      <header className="player-header">
        <div><span className="live-dot" /> INTERACTIVE TRACE<h2>{title}</h2><p>{subtitle}</p></div>
        <div className="player-header-actions">
          <div className="player-complexity">
            <span>TIME <b>{complexity.time}</b></span>
            <span>SPACE <b>{complexity.space}</b></span>
          </div>
          <button className="fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit trace fullscreen' : 'Open trace fullscreen'} title={fullscreen ? 'Exit trace fullscreen' : 'Open trace fullscreen'}>
            <span>{fullscreen ? '↙' : '↗'}</span>{fullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}
          </button>
        </div>
      </header>
      {fullscreenError && <p role="alert">{fullscreenError}</p>}
      <div className="playback-bar" role="group" aria-label="Trace playback">
        <div className="timeline">
          <span style={{ width: `${steps.length <= 1 ? 100 : (index / (steps.length - 1)) * 100}%` }} />
        </div>
        <div className="playback-controls">
          <button onClick={() => move(0)} aria-label="Restart">↺</button>
          <button onClick={() => move(index - 1)} disabled={index === 0} aria-label="Previous step">←</button>
          <button className="play-button" aria-label={playing ? 'Pause trace' : 'Play trace'} onClick={() => {
            if (index === steps.length - 1) move(0)
            setPlaying((current) => !current)
          }}>{playing ? 'Ⅱ' : '▶'}</button>
          <button onClick={() => move(index + 1)} disabled={index === steps.length - 1} aria-label="Next step">→</button>
          <span className="step-count">{index + 1} / {steps.length}</span>
        </div>
        <label className="speed-control">SPEED
          <select aria-label="Playback speed" value={speed} onChange={(event) => {
            const nextSpeed = Number(event.target.value)
            setSpeed(nextSpeed)
            if (session) update(session.id, { trace: { signature, index, speed: nextSpeed } })
          }}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
      <div className="algorithm-controls">{controls}</div>
      <div className="player-workspace">
        <div className="scene-panel">
          <div className="scene-grid" role="region" aria-label="Algorithm diagram" tabIndex={0}>{renderScene(step)}</div>
          <div className="narration-card" role="region" aria-label="Step explanation" tabIndex={0}>
            <span>{step.phase}</span>
            <p>{step.narration}</p>
            {step.prediction && <div className="prediction-prompt"><b>Predict:</b> {step.prediction}</div>}
          </div>
        </div>
        <aside className="trace-panel">
          <div className="code-trace" role="region" aria-label="Python trace" tabIndex={0}>
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
              {variableNames.map(name => {
                const present = Object.hasOwn(step.variables, name)
                const value = step.variables[name]
                return <span className={`variable-cell ${present ? '' : 'inactive'}`} key={name}>
                  <b>{name}</b><m.code key={JSON.stringify(value)} tabIndex={present ? 0 : -1}
                    initial={animate ? { opacity: .35, y: 3 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: animate ? .22 : 0 }}>
                    {present ? value === null ? 'None' : String(value) : 'Not in this step'}
                  </m.code>
                </span>
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
