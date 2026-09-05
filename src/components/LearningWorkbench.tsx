import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { m } from 'motion/react'
import { ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, CircleHelp, FlaskConical, Focus, MessageCircle, NotebookPen, PencilRuler, ScanEye, X } from 'lucide-react'
import { getLearningChecks, type LearningCheck } from '../data/learningChecks'
import { learningStages, lessonStatus, LessonSessionContext, useLearning, type LearningStage, type LearningTrack, type LessonId } from '../data/learningProgress'
import { useStudioMotion } from './studio/StudioMotion'

const stageIcons = { understand: BookOpen, predict: ScanEye, experiment: FlaskConical, explain: MessageCircle, apply: ArrowUpRight }
const compactStageLabels: Record<LearningStage, string> = {
  understand: 'Learn',
  predict: 'Guess',
  experiment: 'Try',
  explain: 'Tell',
  apply: 'Apply',
}

function Checkpoint({ check, onAnswer, passed }: { check: LearningCheck; onAnswer: (correct: boolean) => void; passed: boolean }) {
  const { motionEnabled } = useStudioMotion()
  const groupName = useId()
  const [choice, setChoice] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  return <div className="wb-checkpoint">
    <span className="section-kicker">{passed ? 'PREVIOUSLY CLEARED · TRY RECALLING AGAIN' : 'MAKE YOUR REASONING VISIBLE'}</span>
    <h2>{check.question}</h2>
    <fieldset disabled={submitted}><legend>Choose your answer</legend>
      {check.options.map((option, index) => <m.label key={option.label} className={choice === index ? 'selected' : ''} whileHover={motionEnabled && !submitted ? { x: 4 } : undefined}>
        <input type="radio" name={groupName} checked={choice === index} onChange={() => setChoice(index)} />
        <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
        <span>{option.label}</span>
        {choice === index && <Check className="option-check" size={17} aria-hidden="true" />}
      </m.label>)}
    </fieldset>
    {!submitted ? <button className="primary-button" disabled={choice === null} onClick={() => { if (choice !== null) { setSubmitted(true); onAnswer(choice === check.answer) } }}>Check my reasoning</button>
      : <m.div className={`wb-feedback ${choice === check.answer ? 'correct' : 'revisit'}`} role="status" initial={motionEnabled ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }}>
        <m.span className="feedback-icon" initial={motionEnabled ? { scale: .5, rotate: -20 } : false} animate={{ scale: 1, rotate: 0 }}>{choice === check.answer ? <CheckCircle2 size={26} aria-hidden="true" /> : <CircleHelp size={26} aria-hidden="true" />}</m.span>
        <strong>{choice === check.answer ? 'That reasoning holds.' : 'A useful mistake. Let’s inspect it.'}</strong>
        <p>{choice !== null && check.options[choice].feedback}</p>
        {choice !== check.answer && <p>Consider: {check.options[check.answer].feedback}</p>}
        <button onClick={() => { setChoice(null); setSubmitted(false) }}>Try again without the answer</button>
      </m.div>}
  </div>
}

export function LearningWorkbench({ track, week, title, goal, understand, experiment, apply, references, onDemonstrated, onDraw, navigationCollapsed, onToggleNavigation }: {
  track: LearningTrack
  week: number
  title: string
  goal: string
  understand: ReactNode
  experiment: (onExperiment: () => void) => ReactNode
  apply: ReactNode
  references: ReactNode
  onDemonstrated: () => void
  onDraw: () => void
  navigationCollapsed: boolean
  onToggleNavigation: () => void
}) {
  const { motionEnabled } = useStudioMotion()
  const { state, begin, update, check } = useLearning()
  const id: LessonId = `${week}:${track}`
  const progress = state.lessons[id]
  const stage = progress?.stage ?? 'understand'
  const [drawer, setDrawer] = useState<'notes' | 'references' | null>(null)
  const [tip, setTip] = useState(() => localStorage.getItem('codyssey-workbench-hint-v1') !== 'seen')
  const drawerRef = useRef<HTMLElement>(null)
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null)
  const checks = getLearningChecks(track, week)
  useEffect(() => begin(id), [begin, id])
  useEffect(() => {
    if (!drawer) return
    drawerRef.current?.focus({ preventScroll: true })
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setDrawer(null); drawerTriggerRef.current?.focus({ preventScroll: true }) }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [drawer])
  useEffect(() => {
    if (progress?.demonstratedAt) onDemonstrated()
  }, [onDemonstrated, progress?.demonstratedAt])
  const chooseStage = (next: LearningStage) => {
    update(id, { stage: next })
  }
  const activeIndex = learningStages.indexOf(stage)
  return <LessonSessionContext.Provider value={{ id, stage }}>
    <div data-track={track} className={`page workbench-page ${navigationCollapsed ? 'focused' : ''}`}>
      <header className="wb-heading">
        <div><span className="section-kicker">THE LEARNING LAB / {track.toUpperCase()} / {String(week).padStart(2, '0')}</span>
          <h1>{title}</h1><p>{goal}</p></div>
        <div className="wb-heading-tools"><span className="wb-status">{lessonStatus(progress)}</span>
          <button aria-pressed={navigationCollapsed} onClick={onToggleNavigation}><Focus size={15} aria-hidden="true" />{navigationCollapsed ? 'Show navigation' : 'Focus lesson'}</button>
        </div>
      </header>
      {tip && <div className="wb-inline-tip" role="note"><p><b>One idea at a time.</b> Predict, experiment, then explain. You can jump between stages freely; your place is saved.</p><button onClick={() => { localStorage.setItem('codyssey-workbench-hint-v1', 'seen'); setTip(false) }}>Got it</button></div>}
      <nav className="wb-stages" aria-label="Lesson stages">
        {learningStages.map((item, index) => {
          const Glyph = stageIcons[item]
          return <button key={item} aria-current={stage === item ? 'step' : undefined} onClick={() => chooseStage(item)}>
            {stage === item && <m.span className="stage-active-surface" layoutId={`${id}-active-stage`} aria-hidden="true" />}
            <span className="stage-number">0{index + 1}</span><Glyph size={17} aria-hidden="true" /><span className="stage-label" data-compact-label={compactStageLabels[item]}>{item}</span>
          </button>
        })}
      </nav>
      <div className="wb-tools"><span>WORKING AREA</span><div>
        <button onClick={onDraw}><PencilRuler size={15} aria-hidden="true" />Draw it yourself</button>
        <button aria-expanded={drawer === 'notes'} aria-controls="reasoning-drawer" onClick={event => { drawerTriggerRef.current = event.currentTarget; setDrawer(drawer === 'notes' ? null : 'notes') }}><NotebookPen size={15} aria-hidden="true" />Reasoning notes</button>
        <button aria-expanded={drawer === 'references'} aria-controls="reasoning-drawer" onClick={event => { drawerTriggerRef.current = event.currentTarget; setDrawer(drawer === 'references' ? null : 'references') }}><BookOpen size={15} aria-hidden="true" />Read deeper <ArrowUpRight size={13} aria-hidden="true" /></button>
      </div></div>
      <div className={`wb-body ${drawer ? 'drawer-open' : ''}`}>
        <div className="wb-stage-content">
          <section hidden={stage !== 'understand'} aria-label="Understand">{understand}</section>
          <section hidden={stage !== 'predict'} aria-label="Predict">
            <Checkpoint key={`${id}:predict`} check={checks.predict} passed={progress?.predictPassed ?? false} onAnswer={correct => check(id, 'predict', correct)} />
          </section>
          <section hidden={stage !== 'experiment'} aria-label="Experiment">
            {experiment(() => update(id, { practised: true }))}
          </section>
          <section hidden={stage !== 'explain'} aria-label="Explain">
            <Checkpoint key={`${id}:explain`} check={checks.explain} passed={progress?.explainPassed ?? false} onAnswer={correct => check(id, 'explain', correct)} />
            <label className="wb-explanation">Explain it in your own words <small>This note is private, saved locally, and not automatically graded.</small>
              <textarea value={progress?.notebook ?? ''} maxLength={20000} placeholder="What invariant held? What broke when the constraint changed?" onChange={event => update(id, { notebook: event.target.value })} />
            </label>
          </section>
          <section hidden={stage !== 'apply'} aria-label="Apply">
            <div className="wb-application-heading"><span className="section-kicker">TRANSFER, DON'T JUST RECOGNISE</span><h2>Try it under a new constraint</h2></div>
            {apply}
            <p className="wb-evidence-note">{progress?.demonstratedAt ? 'Checkpoint cleared: you experimented and answered both reasoning checks. This is a learning milestone, not a claim of interview mastery.' : 'Completion requires an experiment plus the Predict and Explain checks. Browsing or pressing Next does not complete a lesson.'}</p>
          </section>
        </div>
        {drawer && <m.aside ref={drawerRef} tabIndex={-1} id="reasoning-drawer" className="wb-drawer" aria-label={drawer === 'notes' ? 'Reasoning notes' : 'Deeper references'} initial={motionEnabled ? { opacity: 0, x: 14 } : false} animate={{ opacity: 1, x: 0 }}>
          <header><h2>{drawer === 'notes' ? 'Your field notes' : 'Follow the thread'}</h2><button aria-label="Close reasoning drawer" onClick={() => { setDrawer(null); drawerTriggerRef.current?.focus({ preventScroll: true }) }}><X size={18} /></button></header>
          {drawer === 'notes' ? <label>What changed your mental model?<textarea value={progress?.notebook ?? ''} maxLength={20000} onChange={event => update(id, { notebook: event.target.value })} placeholder="An invariant, a mistake, or a question to revisit..." /></label> : references}
        </m.aside>}
      </div>
      <footer className="wb-footer">
        <span>Private notes. No streak pressure. Your pace.</span>
        <div><button disabled={activeIndex === 0} onClick={() => chooseStage(learningStages[activeIndex - 1])}>Back</button>
          {activeIndex < learningStages.length - 1 ? <button className="wb-primary" onClick={() => chooseStage(learningStages[activeIndex + 1])}>Continue to {learningStages[activeIndex + 1]} <ArrowRight size={16} aria-hidden="true" /></button>
            : <button onClick={() => chooseStage('experiment')}>Return to experiment</button>}
        </div>
      </footer>
    </div>
  </LessonSessionContext.Provider>
}
