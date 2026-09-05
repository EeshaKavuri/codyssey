import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react'
import { m } from 'motion/react'
import { ArrowRight, BookOpen, Boxes, Braces, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleHelp, Command, Cpu, GitBranch, Home as HomeIcon, Map, Network, Play, RotateCcw, Sparkles, Waves, type LucideIcon } from 'lucide-react'
import codysseyLogo from './assets/codyssey-logo.png'
import { dsaPatterns, type DsaProblem } from './data/dsaProblems'
import { getPatternBlueprint, getPatternTheory } from './data/dsaTheory'
import { hldLessons, lldLessons, type DesignLesson } from './data/designCurriculum'
import { resourceGroups } from './data/resources'
import { storageKeys } from './data/storage'
import { recordVisit, recordVisitorName } from './data/analytics'
import { GuidedTour, type TourStep } from './components/GuidedTour'
import { DesignFoundations } from './components/DesignFoundations'
import { parseLearningState, useLearning, type LearningTrack } from './data/learningProgress'
import { StudioAmbient, useStudioMotion } from './components/studio/StudioMotion'

const DesignExploreMore = lazy(() => import('./components/DesignExploreMore'))
const LearningWorkbench = lazy(() => import('./components/LearningWorkbench').then(module => ({ default: module.LearningWorkbench })))
const HldExperiments = lazy(() => import('./components/design/HldExperiments'))
const LldExperiments = lazy(() => import('./components/design/LldExperiments'))
const BookingWorkbench = lazy(() => import('./components/BookingWorkbench'))
const StudyHome = lazy(() => import('./components/StudyHome').then(module => ({ default: module.StudyHome })))
const VisualWorkspace = lazy(() => import('./components/dsa/VisualWorkspace').then(module => ({ default: module.VisualWorkspace })))
const DsaExperiment = lazy(() => import('./components/dsa/DsaExperiment'))

type View = 'home' | 'roadmap' | 'dsa' | 'hld' | 'lld' | 'workspace' | 'appendix' | 'booking'
type ModuleId = 'dsa' | 'hld' | 'lld'
type CompletionKey = `${number}:${ModuleId}`
type LessonNavigation = { navigationCollapsed: boolean; onToggleNavigation: () => void }
const lessonMenuStorageKey = 'codyssey-lesson-menu-collapsed'
const views: View[] = ['home', 'roadmap', 'dsa', 'hld', 'lld', 'workspace', 'appendix', 'booking']
const moduleIds: ModuleId[] = ['dsa', 'hld', 'lld']
const totalDsaQuestions = dsaPatterns.reduce((total, pattern) => total + pattern.problems.length, 0)

const roadmap = [
  { week: 1, phase: 'Foundations', hld: 'Web Requests, Scaling & Load Balancers', lld: 'Responsibilities, Coupling & SOLID', dsa: 'Complexity & Linked Lists' },
  { week: 2, phase: 'Foundations', hld: 'Requirements, Estimation & SLOs', lld: 'Objects, Invariants & Relationships', dsa: 'Arrays, Strings & Two Pointers' },
  { week: 3, phase: 'Foundations', hld: 'APIs, State & Edge Components', lld: 'Requirements, UML & Tests', dsa: 'Stacks, Queues & Monotonic Stack' },
  { week: 4, phase: 'Foundations', hld: 'Data Modeling & Storage Selection', lld: 'Refactoring & Simple Design', dsa: 'Hashing, Sliding Window & Prefix Sums' },
  { week: 5, phase: 'Distributed Systems', hld: 'Caching & CDNs', lld: 'Creational Patterns & DI', dsa: 'Trees, BSTs & Tries' },
  { week: 6, phase: 'Distributed Systems', hld: 'Replication, Consistency & CAP', lld: 'Strategy, State & Variation', dsa: 'Heaps, Sorting & Intervals' },
  { week: 7, phase: 'Distributed Systems', hld: 'Partitioning & Consistent Hashing', lld: 'Structural Boundaries & Wrappers', dsa: 'Graphs, Topological Sort & Union Find' },
  { week: 8, phase: 'Distributed Systems', hld: 'Queues & Async Workflows', lld: 'Events, Commands & Handler Chains', dsa: 'Recursion & Backtracking' },
  { week: 9, phase: 'Case Studies', hld: 'Distributed Coordination & Raft', lld: 'Domain State & Persistence', dsa: 'Binary Search & Divide and Conquer' },
  { week: 10, phase: 'Case Studies', hld: 'Resilience & Overload Control', lld: 'Concurrency-Aware Design', dsa: 'Dynamic Programming' },
  { week: 11, phase: 'Case Studies', hld: 'Observability, Deployment & Recovery', lld: 'Classic Interview Designs', dsa: 'Greedy, Bit Manipulation & Math' },
  { week: 12, phase: 'Mock Interviews', hld: 'Full SDE2 Design Interviews', lld: 'SDE2 Capstone & Review', dsa: 'Mixed Interview Set' },
]

const curriculumCoverage: Record<ModuleId, { name: string; week: number }[]> = {
  dsa: [
    { name: 'Big-O and complexity analysis', week: 1 },
    { name: 'Linked lists and pointer patterns', week: 1 },
    { name: 'Arrays and strings', week: 2 },
    { name: 'Two pointers and fast/slow pointers', week: 2 },
    { name: 'Stacks, queues and deques', week: 3 },
    { name: 'Monotonic stack and queue', week: 3 },
    { name: 'Hash maps and sets', week: 4 },
    { name: 'Sliding window and prefix sums', week: 4 },
    { name: 'Trees, BSTs and tries', week: 5 },
    { name: 'Heaps, sorting and intervals', week: 6 },
    { name: 'Graphs, BFS and DFS', week: 7 },
    { name: 'Topological sort and union find', week: 7 },
    { name: 'Recursion and backtracking', week: 8 },
    { name: 'Binary search and divide and conquer', week: 9 },
    { name: 'Dynamic programming', week: 10 },
    { name: 'Greedy, bit manipulation and math', week: 11 },
  ],
  hld: hldLessons.map(lesson => ({ name: lesson.title, week: lesson.week })),
  lld: lldLessons.map(lesson => ({ name: lesson.title, week: lesson.week })),
}

const completionKey = (week: number, module: ModuleId): CompletionKey => `${week}:${module}`
const isWeekComplete = (week: number, completed: CompletionKey[]) =>
  moduleIds.every((module) => completed.includes(completionKey(week, module)))

function Icon({ name }: { name: string }) {
  const icons: Record<string, LucideIcon> = {
    home: HomeIcon, roadmap: Map, dsa: Braces, hld: Network, lld: Boxes,
    workspace: GitBranch, booking: Cpu, appendix: BookOpen, streak: Sparkles,
    check: Check, arrow: ArrowRight, play: Play, reset: RotateCcw,
  }
  const Glyph = icons[name] ?? Command
  return <Glyph className="icon" size={21} strokeWidth={1.6} aria-hidden="true" />
}

function ExternalLinkIcon() {
  return (
    <svg className="external-link-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

function Sidebar({ view, setView, completed, selectedWeek, collapsed, toggleCollapsed }: {
  view: View
  setView: (view: View) => void
  completed: CompletionKey[]
  selectedWeek: number
  collapsed: boolean
  toggleCollapsed: () => void
}) {
  const nav: { id: View; label: string; detail: string }[] = [
    { id: 'home', label: 'Overview', detail: 'Bird’s-eye view' },
    { id: 'roadmap', label: '12-week path', detail: 'Your study map' },
    { id: 'dsa', label: 'DSA Lab', detail: `Week ${selectedWeek} · Practice` },
    { id: 'hld', label: 'System Design', detail: `Week ${selectedWeek} · HLD` },
    { id: 'lld', label: 'Object Design', detail: `Week ${selectedWeek} · LLD` },
    { id: 'workspace', label: 'Visual Workspace', detail: 'Draw and reason' },
    { id: 'booking', label: 'Living system', detail: 'One case · three lenses' },
    { id: 'appendix', label: 'Appendix', detail: 'Sources & playbooks' },
  ]
  const weekProgress = moduleIds.filter((module) => completed.includes(completionKey(selectedWeek, module))).length

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="brand" onClick={() => setView('home')} title={collapsed ? 'Codyssey overview' : undefined}>
        <img className="brand-mark" src={codysseyLogo} alt="Codyssey" />
        <span><strong>codyssey<span className="brand-dot">.</span></strong><small>LEARN BEYOND THE CODE</small></span>
      </button>
      <nav id="site-navigation" aria-label="Main navigation">
        <p className="nav-label">LEARN</p>
        {nav.map((item) => (
          <button
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => setView(item.id)}
            title={`${item.label} — ${item.detail}`}
            aria-label={item.label}
            aria-current={view === item.id ? 'page' : undefined}
          >
            {view === item.id && <m.span className="nav-active-surface" layoutId="navigation-surface" aria-hidden="true" />}
            <Icon name={item.id} />
            <span className="nav-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
            {moduleIds.includes(item.id as ModuleId) && completed.includes(completionKey(selectedWeek, item.id as ModuleId)) && <span className="nav-check">✓</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-card">
        <span className="tiny-pill">WEEK {selectedWeek}</span>
        <strong>{isWeekComplete(selectedWeek, completed) ? 'Three checkpoints cleared.' : 'Learn at your pace.'}</strong>
        <p>Experiment and explain. No calendar lock.</p>
        <div className="mini-progress"><span style={{ width: `${weekProgress * 33.33}%` }} /></div>
        <small>{weekProgress}/3 checkpoints cleared</small>
      </div>
      <button className="sidebar-collapse" onClick={toggleCollapsed} aria-expanded={!collapsed} aria-controls="site-navigation" aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
        {collapsed ? <ChevronsRight size={21} /> : <ChevronsLeft size={21} />}
      </button>
    </aside>
  )
}

function Topbar({ view, selectedWeek, setSelectedWeek, profileName, openProfile, openWalkthrough }: {
  view: View
  selectedWeek: number
  setSelectedWeek: (week: number) => void
  profileName: string
  openProfile: () => void
  openWalkthrough: () => void
}) {
  const { motionEnabled, systemReduced, followsSystem, toggleMotion } = useStudioMotion()
  const headerRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const header = headerRef.current
    const shell = header?.closest<HTMLElement>('.studio-shell')
    if (!header || !shell) return
    const updateHeight = () => shell.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`)
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])
  const titles: Record<View, string> = {
    home: 'Your next breakthrough',
    roadmap: '12-week interview path',
    dsa: 'DSA visualization lab',
    hld: 'High-level design lab',
    lld: 'Low-level design lab',
    workspace: 'Visual problem workspace',
    appendix: 'Appendix and source library',
    booking: 'One system, three lenses',
  }
  const currentWeek = roadmap[selectedWeek - 1]
  return (
    <header className="topbar" ref={headerRef}>
      <div><span className="eyebrow">WEEK {String(selectedWeek).padStart(2, '0')} · {currentWeek.phase.toUpperCase()}</span><h2>{titles[view]}</h2></div>
      <div className="topbar-actions">
        <button className="motion-toggle" onClick={toggleMotion} aria-pressed={motionEnabled} data-source={followsSystem ? 'system' : 'user'} aria-label={motionEnabled ? 'Turn ambient motion off' : 'Turn ambient motion on'} title={followsSystem && systemReduced ? 'Following your system setting. Click to enable animations for Codyssey.' : motionEnabled ? 'Turn interface animations off' : 'Turn interface animations on'}>
          <Waves size={17} aria-hidden="true" /><span>Motion</span><b>{motionEnabled ? 'On' : 'Off'}</b>
        </button>
        <button className="site-help-button" onClick={openWalkthrough} aria-label="Open website walkthrough"><CircleHelp size={17} aria-hidden="true" /><span>Guide</span></button>
        <div className="week-switcher">
          <button aria-label="Previous course week" disabled={selectedWeek === 1} onClick={() => setSelectedWeek(selectedWeek - 1)}><ChevronLeft size={15} /></button>
          <select value={selectedWeek} onChange={(event) => setSelectedWeek(Number(event.target.value))} aria-label="Select course week">
            {roadmap.map((week) => <option value={week.week} key={week.week}>Week {week.week}</option>)}
          </select>
          <button aria-label="Next course week" disabled={selectedWeek === 12} onClick={() => setSelectedWeek(selectedWeek + 1)}><ChevronRight size={15} /></button>
        </div>
        <button className="avatar" onClick={openProfile} aria-label="Open profile">{profileName ? profileName.slice(0, 2).toUpperCase() : 'YOU'}</button>
      </div>
    </header>
  )
}

function ProfilePanel({ open, close, name, saveName, completed, legacyCount, solvedProblems, exportProgress, importProgress }: {
  open: boolean
  close: () => void
  name: string
  saveName: (name: string) => void
  completed: CompletionKey[]
  legacyCount: number
  solvedProblems: string[]
  exportProgress: () => void
  importProgress: (file: File) => Promise<string>
}) {
  const [draftName, setDraftName] = useState(name)
  const [backupMessage, setBackupMessage] = useState('')
  useEffect(() => setDraftName(name), [name, open])
  if (!open) return null

  const hldDone = completed.filter((item) => item.endsWith(':hld')).length
  const lldDone = completed.filter((item) => item.endsWith(':lld')).length
  const overallDone = solvedProblems.length + hldDone + lldDone
  const overallTotal = totalDsaQuestions + 24

  return (
    <div className="profile-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section className="profile-panel" role="dialog" aria-modal="true" aria-label="Study profile">
        <div className="profile-panel-header">
          <div><span className="section-kicker">YOUR STUDY PROFILE</span><h2>{name || 'Welcome to Codyssey'}</h2></div>
          <button onClick={close} aria-label="Close profile">×</button>
        </div>

        <div className="profile-name-form">
          <label><span>DISPLAY NAME</span><input maxLength={50} value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="What should we call you?" /></label>
          <button onClick={() => saveName(draftName)} disabled={!draftName.trim()}>{name ? 'Update name' : 'Save my name'}</button>
        </div>
        <p className="name-disclosure">We'll only receive your chosen name to understand Codyssey's traffic. Your learning progress remains private on this device.</p>
        <p className="sync-status"><span className="local" /> Progress is saved automatically on this browser and device.</p>

        <div className="profile-stats">
          <article><span>DSA QUESTIONS</span><strong>{solvedProblems.length}<small> / {totalDsaQuestions}</small></strong><div><i style={{ width: `${(solvedProblems.length / totalDsaQuestions) * 100}%` }} /></div></article>
          <article><span>HLD TOPICS</span><strong>{hldDone}<small> / 12</small></strong><div><i style={{ width: `${(hldDone / 12) * 100}%` }} /></div></article>
          <article><span>LLD TOPICS</span><strong>{lldDone}<small> / 12</small></strong><div><i style={{ width: `${(lldDone / 12) * 100}%` }} /></div></article>
          <article className="overall-stat"><span>FULL SYLLABUS</span><strong>{Math.round((overallDone / overallTotal) * 100)}<small>%</small></strong><div><i style={{ width: `${(overallDone / overallTotal) * 100}%` }} /></div></article>
        </div>
        <p className="sync-status">Topic counts reflect cleared reasoning checkpoints, not interview mastery. Solved questions are self-reported.{legacyCount > 0 && ` Your ${legacyCount} earlier completion marks are preserved in backups, separately from this new evidence.`}</p>

        <div className="backup-tools">
          <div><span className="section-kicker">PROGRESS BACKUP</span><p>Export a small JSON file before clearing browser data or moving to another device.</p></div>
          <div>
            <button onClick={exportProgress}>Export progress</button>
            <label>
              Import progress
              <input type="file" accept="application/json,.json" onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void importProgress(file).then(setBackupMessage)
                event.target.value = ''
              }} />
            </label>
          </div>
        </div>
        {backupMessage && <p className="backup-message">{backupMessage}</p>}
      </section>
    </div>
  )
}

function Roadmap({ selectedWeek, setSelectedWeek, completed, setView, recommendedWeek }: {
  selectedWeek: number
  setSelectedWeek: (week: number) => void
  completed: CompletionKey[]
  setView: (view: View) => void
  recommendedWeek: number
}) {
  const [phase, setPhase] = useState('All')
  const [coverageTrack, setCoverageTrack] = useState<ModuleId>('dsa')
  const phases = ['All', 'Foundations', 'Distributed Systems', 'Case Studies', 'Mock Interviews']
  const visible = phase === 'All' ? roadmap : roadmap.filter((week) => week.phase === phase)
  return (
    <div className="page">
      <section className="page-intro compact">
        <span className="section-kicker">ZOOM OUT BEFORE YOU ZOOM IN</span>
        <h1>Your 12-week map</h1>
        <p>Each week trains the same three muscles. Pick any week at any time; “recommended” simply shows the next unfinished week in sequence.</p>
      </section>
      <div className="filter-row">
        {phases.map((item) => <button className={phase === item ? 'active' : ''} onClick={() => setPhase(item)} key={item}>{item}</button>)}
      </div>
      <div className="roadmap-list">
        {visible.map((week) => (
          <button className={`roadmap-week ${week.week === selectedWeek ? 'current' : ''} ${isWeekComplete(week.week, completed) ? 'complete' : ''}`} key={week.week} onClick={() => { setSelectedWeek(week.week); setView('home') }}>
            <div className="week-index"><span>WEEK</span><strong>{String(week.week).padStart(2, '0')}</strong></div>
            <div className="week-phase">
              <span>{week.phase}</span>
              {week.week === selectedWeek && <small>SELECTED</small>}
              {week.week === recommendedWeek && week.week !== selectedWeek && <small className="recommended">RECOMMENDED</small>}
              {isWeekComplete(week.week, completed) && <small className="done">COMPLETE ✓</small>}
            </div>
            <div className="week-topic"><span>⌘ DSA</span><strong>{week.dsa}</strong></div>
            <div className="week-topic"><span>△ HLD</span><strong>{week.hld}</strong></div>
            <div className="week-topic"><span>▦ LLD</span><strong>{week.lld}</strong></div>
          </button>
        ))}
      </div>
      <section className="coverage-section">
        <div className="section-heading">
          <div><span className="section-kicker">CURRICULUM COVERAGE</span><h2>Core interview patterns tracked explicitly</h2></div>
          <span className="muted">Freely explore any topic</span>
        </div>
        <div className="coverage-tabs">
          {moduleIds.map((module) => <button className={coverageTrack === module ? 'active' : ''} onClick={() => setCoverageTrack(module)} key={module}>{module.toUpperCase()}</button>)}
        </div>
        <div className="coverage-grid">
          {curriculumCoverage[coverageTrack].map((item) => (
            <button key={item.name} onClick={() => { setSelectedWeek(item.week); setView(coverageTrack) }}>
              <span>W{String(item.week).padStart(2, '0')}</span>
              <strong>{item.name}</strong>
              <i>{isWeekComplete(item.week, completed) ? '✓' : '→'}</i>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function Appendix() {
  return (
    <div className="page appendix-page">
      <section className="page-intro compact">
        <span className="section-kicker">APPENDIX · SOURCE TRANSPARENCY</span>
        <h1>References, tools and study playbooks</h1>
        <p>The lesson text is synthesized for this course rather than copied. These links provide deeper reading, original visualizations, and additional practice.</p>
      </section>
      <section className="appendix-stats">
        <article><strong>455</strong><span>DSA questions</span></article>
        <article><strong>60</strong><span>DSA patterns</span></article>
        <article><strong>12</strong><span>HLD modules</span></article>
        <article><strong>12</strong><span>LLD modules</span></article>
      </section>
      <div className="resource-groups">
        {resourceGroups.map((group, index) => (
          <section className={`resource-group ${group.id}`} key={group.id}>
            <div className="resource-group-heading"><span>0{index + 1}</span><div><h2>{group.title}</h2><p>{group.description}</p></div></div>
            <div className="resource-links">
              {group.resources.map((resource) => (
                <a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}>
                  <div><strong>{resource.name}</strong><p>{resource.note}</p></div><ExternalLinkIcon />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="study-playbook">
        <div><span className="section-kicker">HOW TO GET MORE VALUE</span><h2>Use retrieval, not recognition</h2></div>
        <div>
          <article><span>01</span><strong>Predict first</strong><p>Pause animations and state what should happen before pressing play.</p></article>
          <article><span>02</span><strong>Explain aloud</strong><p>Teach the concept without notes. Gaps become obvious quickly.</p></article>
          <article><span>03</span><strong>Change one constraint</strong><p>Ask what breaks if traffic, failures, or requirements change.</p></article>
          <article><span>04</span><strong>Review mistakes</strong><p>Revisit failed questions and misconceptions instead of rereading everything.</p></article>
        </div>
      </section>
    </div>
  )
}

function problemUrl(problem: DsaProblem): string {
  if (problem.url) return problem.url
  const query = encodeURIComponent(problem.title.replace(/\|?\s*\(DP[-\s]*\d+\)/gi, '').trim())
  if (problem.source === 'leetcode') return `https://leetcode.com/problemset/?search=${query}`
  if (problem.source === 'interviewbit') {
    const known: Record<string, string> = {
      'Next Smaller Element': 'https://www.interviewbit.com/problems/nearest-smaller-element/',
      'Count number of subarrays with given xor K': 'https://www.interviewbit.com/problems/subarray-with-given-xor/',
      'Maximum Sum Combination': 'https://www.interviewbit.com/problems/maximum-sum-combinations/',
    }
    return known[problem.title] ?? `https://www.google.com/search?q=site%3Ainterviewbit.com%2Fproblems%2F+${query}`
  }
  if (problem.source === 'hackerrank') return `https://www.hackerrank.com/search?term=${query}`
  if (problem.source === 'spoj') return `https://www.google.com/search?q=site%3Aspoj.com%2Fproblems%2F+${query}`
  return `https://takeuforward.org/?s=${query}`
}

function useWeekPattern(week: number) {
  const { state, update } = useLearning()
  const patterns = useMemo(() => dsaPatterns.filter((pattern) => pattern.week === week), [week])
  const selected = state.lessons[`${week}:dsa`]?.selectedPattern
  const activePattern = patterns.find(pattern => pattern.name === selected) ?? (week === 1 ? patterns.find(pattern => pattern.name === 'Linked List Fundamentals') : undefined) ?? patterns[0]
  return { patterns, activePattern, setSelectedPattern: (selectedPattern: string) => update(`${week}:dsa`, { selectedPattern }) }
}

function DsaTheoryExplorer({ week }: { week: number }) {
  const { patterns, activePattern, setSelectedPattern } = useWeekPattern(week)
  if (!activePattern) return null
  const theory = getPatternTheory(activePattern.name)
  const blueprint = getPatternBlueprint(activePattern.name)

  return <section className="dsa-theory-explorer">
    <div className="theory-explorer-heading">
      <div><span className="section-kicker">UNDERSTAND BEFORE YOU TRACE</span><h2>Build the mental model first</h2><p>Explore one pattern at a time. Experiment contains this week's worked example; Apply follows your selected pattern.</p></div>
      <label>PATTERN<select value={activePattern.name} onChange={(event) => setSelectedPattern(event.target.value)}>{patterns.map((pattern) => <option value={pattern.name} key={pattern.name}>{pattern.name}</option>)}</select></label>
    </div>
    <div className="pattern-theory">
      <div className="theory-intro">
        <span className="section-kicker">PATTERN MENTAL MODEL</span>
        <h3>What is the {activePattern.name} pattern?</h3>
        <p>{theory.idea}</p>
        <div className="pattern-invariant"><span>CORE INVARIANT</span><strong>{theory.invariant}</strong></div>
      </div>
      <details key={`${activePattern.name}:reasoning`}><summary>Recognition signals, steps, and common traps</summary><div className="theory-grid">
        <article><span>01 · RECOGNIZE IT</span><ul>{theory.recognize.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><span>02 · SOLVE IT</span><ol>{theory.steps.map((item) => <li key={item}>{item}</li>)}</ol></article>
        <article><span>03 · CHECK YOURSELF</span><p><b>Typical cost:</b> {theory.complexity}</p><ul>{theory.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div></details>
      <details key={`${activePattern.name}:blueprint`}><summary>Implementation blueprint and deeper reasoning</summary><div className="implementation-playbook">
        <article className="blueprint-code">
          <div><span>REUSABLE IMPLEMENTATION BLUEPRINT</span><b>STATE: {blueprint.state}</b></div>
          <code>{blueprint.template.map((line, index) => <span key={`${line}-${index}`}><i>{String(index + 1).padStart(2, '0')}</i>{line}</span>)}</code>
        </article>
        <article className="transfer-checklist">
          <span>ADAPT IT TO A NEW PROBLEM</span>
          <p>Before coding, answer these questions. Your answers determine how the blueprint changes.</p>
          <ol>{blueprint.adapt.map((item) => <li key={item}>{item}</li>)}</ol>
        </article>
        <article className="trace-checklist">
          <span>USE THE TRACE DELIBERATELY</span>
          <p>Use the Experiment stage as a worked example. Pause it and verify the transferable reasoning:</p>
          <ul>{blueprint.trace.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div></details>
    </div>
  </section>
}

function PracticeLibrary({ week, completedProblems, toggleProblem }: {
  week: number
  completedProblems: string[]
  toggleProblem: (key: string) => void
}) {
  const { patterns, activePattern, setSelectedPattern } = useWeekPattern(week)
  const [search, setSearch] = useState('')
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null)

  useEffect(() => {
    setSearch('')
    setExpandedProblem(null)
  }, [patterns])

  const theory = activePattern ? getPatternTheory(activePattern.name) : null
  const blueprint = activePattern ? getPatternBlueprint(activePattern.name) : null
  const visibleProblems = activePattern?.problems.filter((problem) => problem.title.toLowerCase().includes(search.toLowerCase())) ?? []
  const groups = [
    { label: 'Easy', problems: visibleProblems.filter((problem) => problem.difficulty === 'Easy' || problem.difficulty === 'Basic') },
    { label: 'Medium', problems: visibleProblems.filter((problem) => problem.difficulty === 'Medium') },
    { label: 'Hard', problems: visibleProblems.filter((problem) => problem.difficulty === 'Hard') },
  ].filter(group => group.problems.length > 0)
  const totalProblems = patterns.reduce((total, pattern) => total + pattern.problems.length, 0)
  const solvedInWeek = patterns.reduce((total, pattern) => total + pattern.problems.filter((problem) => completedProblems.includes(`${pattern.name}:${problem.source}:${problem.title}`)).length, 0)

  if (!activePattern) return null
  const recommended = activePattern.problems.find(problem => !completedProblems.includes(`${activePattern.name}:${problem.source}:${problem.title}`))

  return (
    <section className="practice-library">
      {recommended && <div className="recommended-problem"><span className="section-kicker">ONE PROBLEM TO START WITH / {activePattern.name.toUpperCase()}</span><br />
        <a href={problemUrl(recommended)} target="_blank" rel="noreferrer">{recommended.title} <ExternalLinkIcon /></a><p>State the invariant, solve it, then mark it below. The full library stays available when you need it.</p>
      </div>}
      <div className="practice-heading">
        <div><span className="section-kicker">PRACTICE THIS TOPIC</span><h2>Questions grouped by common pattern</h2><p>{totalProblems} questions from the supplied sheet · {patterns.length} reusable patterns · {solvedInWeek} solved</p></div>
        <div className="practice-progress"><strong>{totalProblems ? Math.round((solvedInWeek / totalProblems) * 100) : 0}%</strong><span>WEEK {week} PRACTICE</span></div>
      </div>
      <div className="practice-layout">
        <aside className="pattern-list">
          <span className="pattern-list-label">COMMON PATTERNS</span>
          {patterns.map((pattern) => {
            const solved = pattern.problems.filter((problem) => completedProblems.includes(`${pattern.name}:${problem.source}:${problem.title}`)).length
            return (
              <button className={activePattern.name === pattern.name ? 'active' : ''} onClick={() => setSelectedPattern(pattern.name)} key={pattern.name}>
                <span>{pattern.name}</span><small>{solved}/{pattern.problems.length}</small>
              </button>
            )
          })}
        </aside>
        <div className="problem-browser">
          <div className="problem-browser-header">
            <div><span>PATTERN</span><h3>{activePattern.name}</h3></div>
            <label><span>⌕</span><input aria-label="Search this pattern" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this pattern" /></label>
          </div>
          <div className="difficulty-columns">
            {groups.map((group) => (
              <div className={`difficulty-group ${group.label.toLowerCase()}`} key={group.label}>
                <div className="difficulty-title"><span>{group.label}</span><b>{group.problems.length}</b></div>
                <div className="problem-list">
                  {group.problems.map((problem) => {
                    const key = `${activePattern.name}:${problem.source}:${problem.title}`
                    const solved = completedProblems.includes(key)
                    const guideOpen = expandedProblem === key
                    return (
                      <div className={`problem-row ${solved ? 'solved' : ''} ${guideOpen ? 'guide-open' : ''}`} key={key}>
                        <div className="problem-row-main">
                          <button className="problem-checkbox" onClick={() => toggleProblem(key)} aria-pressed={solved} aria-label={solved ? `Mark ${problem.title} incomplete` : `Mark ${problem.title} complete`}>{solved ? '✓' : ''}</button>
                          <a href={problemUrl(problem)} target="_blank" rel="noreferrer">
                            <span><strong>{problem.title}</strong><small>{problem.source.toUpperCase()}{problem.difficulty === 'Basic' ? ' · BASIC' : ''}</small></span>
                            <ExternalLinkIcon />
                          </a>
                          <button className="problem-guide-button" onClick={() => setExpandedProblem(guideOpen ? null : key)} aria-expanded={guideOpen}>{guideOpen ? 'Close' : 'Guide'}</button>
                        </div>
                        {guideOpen && <div className="problem-guide">
                          <span>HOW TO START THIS QUESTION</span>
                          <p>Read the full prompt and constraints first. Then explain why <strong>{activePattern.name}</strong> fits before writing code.</p>
                          <ol>
                            <li>Restate the required input, output, and edge cases in your own words.</li>
                            <li>Write the invariant: {theory?.invariant}</li>
                            <li>{blueprint?.adapt[0]}</li>
                            <li>Dry-run the reusable blueprint on the smallest non-trivial example.</li>
                            <li>Code only after you can state the expected complexity: {theory?.complexity}</li>
                          </ol>
                          <p className="guide-warning"><b>Stuck?</b> Return to Understand and reveal one reasoning step, not the entire blueprint. This trains pattern recognition instead of memorization.</p>
                        </div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {!visibleProblems.length && <p className="no-problems">No matching questions. Try a shorter search.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

function DsaAnimationLab({ week, complete, completedProblems, toggleProblem, onDraw, navigationCollapsed, onToggleNavigation }: {
  week: number
  complete: () => void
  completedProblems: string[]
  toggleProblem: (key: string) => void
  onDraw: () => void
} & LessonNavigation) {
  const lessons = {
    1: { title: 'Linked lists and pointer movement', description: 'Follow references through memory and see exactly when an operation costs O(1) or O(n).', pattern: 'Pointers preserve order even when nodes are not contiguous.' },
    2: { title: 'Arrays and two-pointer invariants', description: 'Move boundaries deliberately while preserving what is already known about the processed region.', pattern: 'Each pointer divides solved and unsolved portions of the array.' },
    3: { title: 'Stacks, queues and monotonic order', description: 'Watch unresolved work enter and leave a stack while the top drives the next decision.', pattern: 'A stack remembers the most recent unresolved item.' },
    4: { title: 'Sliding windows, prefix sums and hashing', description: 'Reuse prior work instead of recalculating every substring or subarray.', pattern: 'Maintain just enough state to update the answer in constant time per step.' },
    5: { title: 'Trees, BSTs and hierarchical traversal', description: 'See how a queue exposes one tree level at a time and how array indices encode parent-child relationships.', pattern: 'Tree algorithms solve a node, then delegate the same smaller problem to its children.' },
    6: { title: 'Heaps, sorting and interval ordering', description: 'Build a priority structure one insertion at a time while preserving both shape and ordering invariants.', pattern: 'A heap guarantees only parent-child order, not a fully sorted array.' },
    7: { title: 'Graphs and frontier-based exploration', description: 'Explore connected nodes without repeated work by separating discovered, queued, and visited states.', pattern: 'The frontier contains exactly the discovered nodes whose neighbors remain unexplored.' },
    8: { title: 'Recursion and backtracking decisions', description: 'Follow the call stack as choices are made, explored, and undone when a branch cannot finish.', pattern: 'Backtracking restores the exact prior state before trying the next choice.' },
    9: { title: 'Binary search and monotonic search spaces', description: 'Watch each comparison prove that half of the remaining candidates cannot contain the answer.', pattern: 'Binary search requires a monotonic rule that safely discards one side.' },
    10: { title: 'Dynamic programming state transitions', description: 'Fill a table from known base cases and combine already-solved subproblems instead of recomputing them.', pattern: 'Every DP cell must have a precise meaning and depend only on available states.' },
    11: { title: 'Greedy choices, bits and mathematical structure', description: 'Test the earliest-finish greedy strategy and see why its local choice preserves the best future options.', pattern: 'A greedy choice is valid only when an exchange argument proves it never hurts the optimum.' },
    12: { title: 'Advanced strings and interview synthesis', description: 'Trace KMP from prefix-table construction through linear-time matching without restarting the text scan.', pattern: 'Preprocessed structure turns repeated comparisons into reusable information.' },
  } as const
  const lesson = lessons[week as keyof typeof lessons]

  return <LearningWorkbench track="dsa" week={week} title={lesson.title} goal={lesson.description} onDemonstrated={complete} onDraw={onDraw} navigationCollapsed={navigationCollapsed} onToggleNavigation={onToggleNavigation}
    understand={<DsaTheoryExplorer week={week} />}
    experiment={practise => <>
      <p className="wb-experiment-caption">Worked example: {lesson.pattern} Other patterns from this week are in Understand and Apply.</p>
      <Suspense fallback={<p role="status">Preparing the experiment…</p>}><DsaExperiment week={week} onProgress={practise} /></Suspense>
    </>}
    apply={<PracticeLibrary week={week} completedProblems={completedProblems} toggleProblem={toggleProblem} />}
    references={<div className="wb-reading"><h3>Read with a question</h3><p>What changes when the input contains duplicates, is empty, or grows 100 times larger?</p>
      {resourceGroups[0].resources.map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><strong>{resource.name} <ExternalLinkIcon /></strong><p>{resource.note}</p></a>)}
    </div>}
  />
}

function DesignModule({ module, lesson, complete, onDraw, navigationCollapsed, onToggleNavigation }: {
  module: 'hld' | 'lld'
  lesson: DesignLesson
  complete: () => void
  onDraw: () => void
} & LessonNavigation) {
  return <LearningWorkbench track={module} week={lesson.week} title={lesson.title} goal={lesson.outcome} onDemonstrated={complete} onDraw={onDraw} navigationCollapsed={navigationCollapsed} onToggleNavigation={onToggleNavigation}
    understand={<article className="wb-mental-model"><span className="section-kicker">THE IDEA BEFORE THE MACHINERY</span><h2>{lesson.mentalModel}</h2>
      <div className="wb-causal-path"><div><small>THE PRESSURE</small><p>{lesson.pressure}</p></div><span aria-hidden="true">→</span><div><small>THE DECISION</small><p>{lesson.tradeoff}</p></div></div>
      {lesson.week === 1 && <DesignFoundations track={module} />}
      <details><summary>A common trap to avoid</summary><p><s>{lesson.misconception}</s></p><p>{lesson.correction}</p></details>
      <details><summary>Vocabulary for this experiment</summary><ul>{lesson.concepts.map(concept => <li key={concept}>{concept}</li>)}</ul></details>
    </article>}
    experiment={practise => <Suspense fallback={<p role="status">Preparing the experiment…</p>}>{module === 'hld' ? <HldExperiments week={lesson.week} onExperiment={practise} /> : <LldExperiments week={lesson.week} onExperiment={practise} />}</Suspense>}
    apply={<><p className="wb-interview-prompt">{lesson.interviewPrompt}</p><Suspense fallback={<p role="status">Loading use cases…</p>}><DesignExploreMore track={module} week={lesson.week} initialTab="challenge" /></Suspense></>}
    references={<div className="wb-reading"><h3>Take a question with you</h3><p>{lesson.pressure} Which trade-off would you defend?</p>
      <Suspense fallback={<p role="status">Loading references…</p>}><DesignExploreMore track={module} week={lesson.week} initialTab="resources" /></Suspense>
      <h3>Original references</h3>{lesson.sources.map(source => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLinkIcon /></a>)}
    </div>}
  />
}

export default function App() {
  const { motionEnabled } = useStudioMotion()
  const learning = useLearning()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [view, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem(storageKeys.currentView) as View | null
    return saved && views.includes(saved) ? saved : 'home'
  })
  const [navigationPending, startNavigation] = useTransition()
  const setView = useCallback((next: View) => {
    setMobileMenuOpen(false)
    startNavigation(() => setCurrentView(next))
  }, [startNavigation])
  const [profileName, setProfileName] = useState(() => localStorage.getItem(storageKeys.profileName) ?? '')
  const [profileOpen, setProfileOpen] = useState(false)
  const [websiteWalkthroughOpen, setWebsiteWalkthroughOpen] = useState(() => localStorage.getItem(storageKeys.websiteWalkthroughSeen) !== 'true')
  const [websiteWalkthroughStep, setWebsiteWalkthroughStep] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(storageKeys.sidebarCollapsed) === 'true')
  const [lessonSidebarCollapsed, setLessonSidebarCollapsed] = useState(() => localStorage.getItem(lessonMenuStorageKey) !== 'false')
  const inLesson = moduleIds.some(module => module === view)
  const navigationCollapsed = inLesson ? lessonSidebarCollapsed : sidebarCollapsed
  const [selectedWeek, setSelectedWeekState] = useState(() => {
    const saved = Number(localStorage.getItem(storageKeys.selectedWeek))
    return Number.isInteger(saved) && saved >= 1 && saved <= 12 ? saved : 1
  })
  const [completed, setCompleted] = useState<CompletionKey[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKeys.completed) ?? '[]') as string[]
      return saved.map((item) => item.includes(':') ? item as CompletionKey : completionKey(1, item as ModuleId))
    } catch {
      return []
    }
  })
  const [solvedProblems, setSolvedProblems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.solvedProblems) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    recordVisit()
  }, [])

  useEffect(() => {
    localStorage.setItem(storageKeys.completed, JSON.stringify(completed))
    localStorage.setItem(storageKeys.selectedWeek, String(selectedWeek))
    localStorage.setItem(storageKeys.solvedProblems, JSON.stringify(solvedProblems))
    localStorage.setItem(storageKeys.profileName, profileName)
  }, [completed, profileName, selectedWeek, solvedProblems])

  useEffect(() => {
    localStorage.setItem(storageKeys.currentView, view)
  }, [view])

  const complete = useMemo(() => (week: number, module: ModuleId) => {
    const key = completionKey(week, module)
    setCompleted((current) => current.includes(key) ? current : [...current, key])
  }, [])

  const setSelectedWeek = (week: number) => {
    setMobileMenuOpen(false)
    startNavigation(() => setSelectedWeekState(Math.min(12, Math.max(1, week))))
  }
  const toggleSidebar = () => {
    if (inLesson) {
      setLessonSidebarCollapsed(current => {
        localStorage.setItem(lessonMenuStorageKey, String(!current))
        return !current
      })
      return
    }
    setSidebarCollapsed((current) => {
      localStorage.setItem(storageKeys.sidebarCollapsed, String(!current))
      return !current
    })
  }
  const toggleProblem = (key: string) => {
    setSolvedProblems((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  }
  const saveName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setProfileName(trimmed)
    recordVisitorName(trimmed)
    setProfileOpen(false)
  }
  const closeWebsiteWalkthrough = () => {
    localStorage.setItem(storageKeys.websiteWalkthroughSeen, 'true')
    setWebsiteWalkthroughOpen(false)
    setWebsiteWalkthroughStep(0)
  }
  const exportProgress = () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profileName,
      selectedWeek,
      completedModules: completed,
      solvedProblems,
      learning: learning.state,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `codyssey-${profileName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'progress'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  const importProgress = async (file: File): Promise<string> => {
    try {
      const parsed = JSON.parse(await file.text()) as Record<string, unknown>
      if (!Array.isArray(parsed.completedModules) || !Array.isArray(parsed.solvedProblems)) throw new Error('Missing progress arrays.')
      const importedModules = parsed.completedModules.filter((item): item is CompletionKey =>
        typeof item === 'string' && /^(?:[1-9]|1[0-2]):(?:dsa|hld|lld)$/.test(item))
      const importedProblems = parsed.solvedProblems.filter((item): item is string => typeof item === 'string')
      if (parsed.selectedWeek !== undefined && (typeof parsed.selectedWeek !== 'number' || !Number.isInteger(parsed.selectedWeek) || parsed.selectedWeek < 1 || parsed.selectedWeek > 12)) throw new Error('Invalid selected week.')
      const importedWeek = typeof parsed.selectedWeek === 'number' ? parsed.selectedWeek : 1
      const importedName = typeof parsed.profileName === 'string' ? parsed.profileName.trim().slice(0, 50) : ''
      const importedLearning = parsed.learning === undefined ? null : parseLearningState(parsed.learning)
      setCompleted(importedModules)
      setSolvedProblems(importedProblems)
      setSelectedWeek(importedWeek)
      if (importedName) setProfileName(importedName)
      if (importedLearning) learning.restore(importedLearning)
      return `Imported ${importedProblems.length} solved questions and ${importedModules.length} completed modules.`
    } catch {
      return 'This file is not a valid Codyssey progress backup.'
    }
  }
  const cleared = roadmap.flatMap(week => moduleIds.filter(track => learning.state.lessons[`${week.week}:${track}`]?.demonstratedAt).map(track => completionKey(week.week, track)))
  const recommendedWeek = roadmap.find((week) => !isWeekComplete(week.week, cleared))?.week ?? 12
  const openLesson = (track: LearningTrack, week: number, stage?: 'understand' | 'predict' | 'experiment' | 'explain' | 'apply') => {
    setSelectedWeek(week)
    if (stage) learning.update(`${week}:${track}`, { stage })
    setView(track)
  }
  const websiteTourSteps = useMemo<TourStep[]>(() => [
    { selector: '.session-launch .primary-button', title: 'Start with one idea', detail: 'Open a short learning loop. Predict, experiment, and explain instead of reading a whole page at once. Your place is saved.', action: () => setView('home') },
    { selector: '.living-case-teaser button', title: 'Zoom through a living system', detail: 'Follow one booking problem from requests to objects to an expiration heap. Change a condition and see what breaks.' },
    { selector: '.study-index', title: 'Explore at your own pace', detail: 'Every week and track stays open. Checkpoints measure reasoning; visits and playback clicks never count as mastery.' },
  ], [setView])
  const renderModule = (module: ModuleId) => {
    if (module === 'dsa') {
      return (
        <DsaAnimationLab
          key={`dsa:${selectedWeek}`}
          week={selectedWeek}
          complete={() => complete(selectedWeek, 'dsa')}
          completedProblems={solvedProblems}
          toggleProblem={toggleProblem}
          onDraw={() => setView('workspace')}
          navigationCollapsed={navigationCollapsed}
          onToggleNavigation={toggleSidebar}
        />
      )
    }
    if (module === 'hld' || module === 'lld') {
      const lesson = (module === 'hld' ? hldLessons : lldLessons)[selectedWeek - 1]
      return (
        <DesignModule
          key={`${module}:${selectedWeek}`}
          module={module}
          lesson={lesson}
          complete={() => complete(selectedWeek, module)}
          onDraw={() => setView('workspace')}
          navigationCollapsed={navigationCollapsed}
          onToggleNavigation={toggleSidebar}
        />
      )
    }
  }

  return (
    <div data-view={view} className={`app-shell studio-shell ${navigationCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <StudioAmbient active={view === 'home'} />
      {navigationPending && <span className="route-loading" role="status">Opening your next view...</span>}
      <Sidebar view={view} setView={setView} completed={cleared} selectedWeek={selectedWeek} collapsed={navigationCollapsed} toggleCollapsed={toggleSidebar} />
      <main>
        <Topbar view={view} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} profileName={profileName} openProfile={() => setProfileOpen(true)} openWalkthrough={() => setWebsiteWalkthroughOpen(true)} />
        <Suspense fallback={<p className="page" role="status">Opening your studio...</p>}>
        <m.div className="studio-route" key={view} initial={motionEnabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: motionEnabled ? .35 : 0 }}>
        {view === 'home' && <StudyHome topics={roadmap} selectedWeek={selectedWeek} name={profileName} onOpen={openLesson} onBooking={() => setView('booking')} onMap={() => setView('roadmap')} onProfile={() => setProfileOpen(true)} />}
        {view === 'roadmap' && <Roadmap selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} completed={cleared} setView={setView} recommendedWeek={recommendedWeek} />}
          {view === 'dsa' && renderModule('dsa')}
          {view === 'hld' && renderModule('hld')}
          {view === 'lld' && renderModule('lld')}
        {view === 'workspace' && <VisualWorkspace />}
        {view === 'appendix' && <Appendix />}
        {view === 'booking' && <BookingWorkbench />}
        </m.div>
        </Suspense>
      </main>
      <nav className="mobile-dock" aria-label="Mobile navigation">
        <button onClick={() => setView('home')} aria-current={view === 'home' ? 'page' : undefined}><HomeIcon size={19} aria-hidden="true" />Learn</button>
        <button onClick={() => setView('booking')} aria-current={view === 'booking' ? 'page' : undefined}><Cpu size={19} aria-hidden="true" />Living system</button>
        <button aria-expanded={mobileMenuOpen} aria-controls="site-navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Command size={19} aria-hidden="true" />{mobileMenuOpen ? 'Close menu' : 'More'}</button>
      </nav>
      <ProfilePanel
        open={profileOpen}
        close={() => setProfileOpen(false)}
        name={profileName}
        saveName={saveName}
        completed={cleared}
        legacyCount={completed.filter(item => !cleared.includes(item)).length}
        solvedProblems={solvedProblems}
        exportProgress={exportProgress}
        importProgress={importProgress}
      />
      <GuidedTour open={websiteWalkthroughOpen} steps={websiteTourSteps} index={websiteWalkthroughStep} setIndex={setWebsiteWalkthroughStep} close={closeWebsiteWalkthrough} label="CODYSSEY TOUR" />
    </div>
  )
}
