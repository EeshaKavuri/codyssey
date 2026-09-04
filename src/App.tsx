import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import codysseyLogo from './assets/codyssey-logo.png'
import { dsaPatterns, type DsaProblem } from './data/dsaProblems'
import { getPatternBlueprint, getPatternTheory } from './data/dsaTheory'
import { hldLessons, lldLessons, type DesignLesson } from './data/designCurriculum'
import { resourceGroups } from './data/resources'
import { storageKeys } from './data/storage'
import { recordVisit, recordVisitorName } from './data/analytics'
import { ArrayVisualizer, LinkedListVisualizer, StackVisualizer, WindowVisualizer } from './components/dsa/DsaVisualizers'
import {
  BacktrackingVisualizer,
  BinarySearchVisualizer,
  DynamicProgrammingVisualizer,
  GraphVisualizer,
  GreedyVisualizer,
  HeapVisualizer,
  KmpVisualizer,
  TreeVisualizer,
} from './components/dsa/AdvancedDsaVisualizers'
import { VisualWorkspace } from './components/dsa/VisualWorkspace'
import { GuidedTour, type TourStep } from './components/GuidedTour'

const DesignExploreMore = lazy(() => import('./components/DesignExploreMore'))

type View = 'home' | 'roadmap' | 'dsa' | 'hld' | 'lld' | 'workspace' | 'appendix'
type ModuleId = 'dsa' | 'hld' | 'lld'
type CompletionKey = `${number}:${ModuleId}`
const views: View[] = ['home', 'roadmap', 'dsa', 'hld', 'lld', 'workspace', 'appendix']
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
type RoadmapWeek = (typeof roadmap)[number]

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
  hld: [
    { name: 'Requirements, estimation and bottlenecks', week: 1 },
    { name: 'Scaling and load balancing', week: 1 },
    { name: 'SQL, NoSQL, indexes and data modeling', week: 2 },
    { name: 'Replication, partitioning and sharding', week: 2 },
    { name: 'Caching strategies and CDNs', week: 3 },
    { name: 'Queues, pub/sub and event streaming', week: 4 },
    { name: 'REST, gRPC, GraphQL and real-time protocols', week: 5 },
    { name: 'CAP, PACELC and consistency models', week: 6 },
    { name: 'Rate limits, retries and circuit breakers', week: 6 },
    { name: 'Consistent hashing and storage engines', week: 7 },
    { name: 'Sagas, transactions and microservices', week: 8 },
    { name: 'Service discovery and API gateways', week: 8 },
    { name: 'Security, payments and idempotency', week: 11 },
    { name: 'SLOs, observability and failure recovery', week: 12 },
  ],
  lld: [
    { name: 'OOP, UML and SOLID', week: 1 },
    { name: 'Creational design patterns', week: 2 },
    { name: 'Structural design patterns', week: 3 },
    { name: 'Behavioral design patterns', week: 4 },
    { name: 'Thread safety, locks and concurrency', week: 5 },
    { name: 'Schema design, normalization and ORM', week: 6 },
    { name: 'API contracts, pagination and versioning', week: 7 },
    { name: 'Layered and clean architecture', week: 8 },
    { name: 'Domain modeling and state machines', week: 9 },
    { name: 'Classic machine and workflow designs', week: 10 },
    { name: 'Inventory, checkout and consistency rules', week: 11 },
    { name: 'Extensibility, testability and code review', week: 12 },
  ],
}

const completionKey = (week: number, module: ModuleId): CompletionKey => `${week}:${module}`
const isWeekComplete = (week: number, completed: CompletionKey[]) =>
  moduleIds.every((module) => completed.includes(completionKey(week, module)))

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: '⌂',
    roadmap: '◇',
    dsa: '⌘',
    hld: '△',
    lld: '▦',
    workspace: '✣',
    appendix: '≡',
    streak: '✦',
    check: '✓',
    arrow: '→',
    play: '▶',
    reset: '↻',
  }
  return <span className="icon" aria-hidden="true">{icons[name]}</span>
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
    { id: 'appendix', label: 'Appendix', detail: 'Sources & playbooks' },
  ]
  const weekProgress = moduleIds.filter((module) => completed.includes(completionKey(selectedWeek, module))).length

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="brand" onClick={() => setView('home')} title={collapsed ? 'Codyssey overview' : undefined}>
        <img className="brand-mark" src={codysseyLogo} alt="Codyssey" />
        <span><strong>Codyssey</strong><small>INTERVIEW STUDIO</small></span>
      </button>
      <nav>
        <p className="nav-label">LEARN</p>
        {nav.map((item) => (
          <button
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => setView(item.id)}
            title={collapsed ? `${item.label} — ${item.detail}` : undefined}
            aria-label={collapsed ? item.label : undefined}
          >
            <Icon name={item.id} />
            <span><strong>{item.label}</strong><small>{item.detail}</small></span>
            {moduleIds.includes(item.id as ModuleId) && completed.includes(completionKey(selectedWeek, item.id as ModuleId)) && <span className="nav-check">✓</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-card">
        <span className="tiny-pill">WEEK {selectedWeek}</span>
        <strong>{isWeekComplete(selectedWeek, completed) ? 'Week complete!' : 'Learn at your pace.'}</strong>
        <p>No calendar lock. Finish the three modules when you are ready.</p>
        <div className="mini-progress"><span style={{ width: `${weekProgress * 33.33}%` }} /></div>
        <small>{weekProgress}/3 modules complete</small>
      </div>
      <button className="sidebar-collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
        <span>{collapsed ? '»' : '«'}</span>
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
  const titles: Record<View, string> = {
    home: 'Your learning cockpit',
    roadmap: '12-week interview path',
    dsa: 'DSA visualization lab',
    hld: 'High-level design lab',
    lld: 'Low-level design lab',
    workspace: 'Visual problem workspace',
    appendix: 'Appendix and source library',
  }
  const currentWeek = roadmap[selectedWeek - 1]
  return (
    <header className="topbar">
      <div><span className="eyebrow">WEEK {String(selectedWeek).padStart(2, '0')} · {currentWeek.phase.toUpperCase()}</span><h2>{titles[view]}</h2></div>
      <div className="topbar-actions">
        <button className="site-help-button" onClick={openWalkthrough} aria-label="Open website walkthrough"><span>How to use?</span></button>
        <div className="week-switcher">
          <button disabled={selectedWeek === 1} onClick={() => setSelectedWeek(selectedWeek - 1)}>←</button>
          <select value={selectedWeek} onChange={(event) => setSelectedWeek(Number(event.target.value))} aria-label="Select course week">
            {roadmap.map((week) => <option value={week.week} key={week.week}>Week {week.week}</option>)}
          </select>
          <button disabled={selectedWeek === 12} onClick={() => setSelectedWeek(selectedWeek + 1)}>→</button>
        </div>
        <button className="avatar" onClick={openProfile} aria-label="Open profile">{profileName ? profileName.slice(0, 2).toUpperCase() : 'YOU'}</button>
      </div>
    </header>
  )
}

function ProfilePanel({ open, close, name, saveName, completed, solvedProblems, exportProgress, importProgress }: {
  open: boolean
  close: () => void
  name: string
  saveName: (name: string) => void
  completed: CompletionKey[]
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

function Home({ setView, completed, week, recommendedWeek, setSelectedWeek }: {
  setView: (view: View) => void
  completed: CompletionKey[]
  week: RoadmapWeek
  recommendedWeek: number
  setSelectedWeek: (week: number) => void
}) {
  const weekCompletedModules = moduleIds.filter((module) => completed.includes(completionKey(week.week, module)))
  const percent = Math.round((weekCompletedModules.length / 3) * 100)
  const modules = [
    { id: 'dsa' as View, tag: 'DSA', title: week.dsa, text: week.week === 1 ? 'Walk pointers one hop at a time. Insert, delete, search, and challenge the O(1) insertion myth.' : 'Recognize the pattern, state its invariant, trace an example, and practise the Python implementation.', color: 'mint', time: '35 min' },
    { id: 'hld' as View, tag: 'HLD', title: week.hld, text: week.week === 1 ? 'Send live requests through Layer 4 and Layer 7 load balancers and compare their decisions.' : 'Start from requirements, estimate scale, draw the request path, and defend the important trade-offs.', color: 'violet', time: '45 min' },
    { id: 'lld' as View, tag: 'LLD', title: week.lld, text: week.week === 1 ? 'Refactor a Python notification service and learn what each principle protects you from.' : 'Identify responsibilities, model contracts, and test whether the design survives a new requirement.', color: 'orange', time: '45 min' },
  ]
  const weekDone = isWeekComplete(week.week, completed)
  return (
    <div className="page home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="section-kicker">{week.week === recommendedWeek ? 'RECOMMENDED NEXT' : 'SELF-PACED COURSE'} · WEEK {week.week}</span>
          <h1>{weekDone ? 'Week complete.' : 'See the system.'}<br /><em>{weekDone ? 'Choose what’s next.' : 'Then'}</em> {weekDone ? '' : 'see the details.'}</h1>
          <p>{weekDone ? 'You finished all three learning tracks for this week. Review anything now, or continue whenever you are ready.' : 'There are no dates or deadlines. Study the three modules in any order; your recommended next week advances when all three are complete.'}</p>
          {weekDone && week.week < 12
            ? <button className="primary-button" onClick={() => setSelectedWeek(week.week + 1)}>Go to Week {week.week + 1} <Icon name="arrow" /></button>
            : <button className="primary-button" onClick={() => setView('dsa')}>{percent ? 'Continue' : 'Start'} Week {week.week} <Icon name="arrow" /></button>}
        </div>
        <div className="orbit-visual" aria-label={`${percent}% of Week ${week.week} completed`}>
          <div className="orbit orbit-one"><span>DSA</span></div>
          <div className="orbit orbit-two"><span>HLD</span></div>
          <div className="orbit orbit-three"><span>LLD</span></div>
          <div className="orbit-core"><strong>{percent}%</strong><small>WEEK {week.week}</small></div>
        </div>
      </section>

      <section>
        <div className="section-heading"><div><span className="section-kicker">TODAY’S PATH</span><h2>Three lenses. One engineering brain.</h2></div><span className="muted">About 2 hours</span></div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <button className={`module-card ${module.color}`} key={module.id} onClick={() => setView(module.id)}>
              <div className="module-top"><span className="module-number">0{index + 1}</span><span className="tiny-pill">{module.tag}</span></div>
              <div className="module-art">
                {index === 0 && <><i className="node">7</i><b /><i className="node">14</i><b /><i className="node">21</i></>}
                {index === 1 && <><i className="client-dot" /><b className="flow-line" /><i className="lb-box">LB</i><b className="split-line" /><i className="server-dot" /><i className="server-dot second" /></>}
                {index === 2 && <><i className="class-box">Service</i><b className="class-line" /><i className="class-box lower">Notifier</i></>}
              </div>
              <span className="card-meta">{module.time} · INTERACTIVE</span>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
              <span className="card-link">{completed.includes(completionKey(week.week, module.id as ModuleId)) ? 'Review lesson' : 'Enter lab'} <Icon name="arrow" /></span>
            </button>
          ))}
        </div>
      </section>

      {week.week === 1 && (
        <section className="design-levels">
          <div className="section-heading">
            <div><span className="section-kicker">FOUNDATION · KNOW THE BOUNDARY</span><h2>HLD vs. LLD: same product, different zoom level</h2></div>
          </div>
          <div className="design-level-diagram">
            <article className="hld-level">
              <span className="level-badge">HLD · SYSTEM VIEW</span>
              <h3>Which major parts exist, and how do they communicate?</h3>
              <div className="level-visual"><i>Client</i><b>→</b><i>API</i><b>→</b><i>Service</i><b>→</b><i>DB</i></div>
              <dl>
                <div><dt>Focus</dt><dd>Scale, reliability, data flow, infrastructure</dd></div>
                <div><dt>Output</dt><dd>Architecture diagram, APIs, storage and trade-offs</dd></div>
                <div><dt>Example</dt><dd>How should a notification system handle 1M events/min?</dd></div>
              </dl>
            </article>
            <div className="zoom-bridge"><span>ZOOM IN</span><b>→</b><small>HLD defines the service boundary.<br />LLD designs inside that boundary.</small></div>
            <article className="lld-level">
              <span className="level-badge">LLD · CODE VIEW</span>
              <h3>Which objects collaborate, and how can behavior change safely?</h3>
              <div className="level-visual classes"><i>Service</i><b>uses</b><i>Notifier</i><b>←</b><i>Email</i></div>
              <dl>
                <div><dt>Focus</dt><dd>Classes, interfaces, responsibilities and patterns</dd></div>
                <div><dt>Output</dt><dd>UML, object relationships, methods and working code</dd></div>
                <div><dt>Example</dt><dd>How can email, SMS and push share one notification flow?</dd></div>
              </dl>
            </article>
          </div>
          <p className="design-rule"><strong>Important:</strong> HLD and LLD are not competing answers. A strong interview solution keeps them connected without mixing their levels of detail.</p>
        </section>
      )}

      <section className="mentor-note">
        <div className="mentor-avatar">M</div>
        <div><span className="section-kicker">MENTOR’S NOTE</span><h3>The interview pattern to practise this week</h3><p><strong>Clarify → model → identify the bottleneck → compare trade-offs → choose.</strong> This pattern works for a linked-list operation, a class design, and a distributed architecture.</p></div>
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
          <span className="muted">We can merge your MAANG/FAANG list here</span>
        </div>
        <div className="coverage-tabs">
          {moduleIds.map((module) => <button className={coverageTrack === module ? 'active' : ''} onClick={() => setCoverageTrack(module)} key={module}>{module.toUpperCase()}</button>)}
        </div>
        <div className="coverage-grid">
          {curriculumCoverage[coverageTrack].map((item) => (
            <button key={item.name} onClick={() => { setSelectedWeek(item.week); setView('home') }}>
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

function LessonHeader({ tag, title, description, step, week = 1 }: { tag: string; title: string; description: string; step: string; week?: number }) {
  return (
    <section className="lesson-header">
      <div><span className="section-kicker">{tag} · WEEK {week}</span><h1>{title}</h1><p>{description}</p></div>
      <div className="lesson-step"><span>LESSON</span><strong>{step}</strong></div>
    </section>
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

function DsaTheoryExplorer({ week }: { week: number }) {
  const patterns = useMemo(() => dsaPatterns.filter((pattern) => pattern.week === week), [week])
  const [selectedPattern, setSelectedPattern] = useState(patterns[0]?.name ?? '')

  useEffect(() => {
    setSelectedPattern(patterns[0]?.name ?? '')
  }, [patterns])

  const activePattern = patterns.find((pattern) => pattern.name === selectedPattern) ?? patterns[0]
  if (!activePattern) return null
  const theory = getPatternTheory(activePattern.name)
  const blueprint = getPatternBlueprint(activePattern.name)

  return <section className="dsa-theory-explorer">
    <div className="theory-explorer-heading">
      <div><span className="section-kicker">UNDERSTAND BEFORE YOU TRACE</span><h2>Build the mental model first</h2><p>Select a pattern from this week, understand its invariant, and then use the interactive trace to see that reasoning execute.</p></div>
      <label>PATTERN<select value={activePattern.name} onChange={(event) => setSelectedPattern(event.target.value)}>{patterns.map((pattern) => <option value={pattern.name} key={pattern.name}>{pattern.name}</option>)}</select></label>
    </div>
    <div className="pattern-theory">
      <div className="theory-intro">
        <span className="section-kicker">PATTERN MENTAL MODEL</span>
        <h3>What is the {activePattern.name} pattern?</h3>
        <p>{theory.idea}</p>
        <div className="pattern-invariant"><span>CORE INVARIANT</span><strong>{theory.invariant}</strong></div>
      </div>
      <div className="theory-grid">
        <article><span>01 · RECOGNIZE IT</span><ul>{theory.recognize.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><span>02 · SOLVE IT</span><ol>{theory.steps.map((item) => <li key={item}>{item}</li>)}</ol></article>
        <article><span>03 · CHECK YOURSELF</span><p><b>Typical cost:</b> {theory.complexity}</p><ul>{theory.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
      <div className="implementation-playbook">
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
          <p>The animation below is a worked example. Pause it and verify the transferable reasoning:</p>
          <ul>{blueprint.trace.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </div>
  </section>
}

function PracticeLibrary({ week, completedProblems, toggleProblem }: {
  week: number
  completedProblems: string[]
  toggleProblem: (key: string) => void
}) {
  const patterns = useMemo(() => dsaPatterns.filter((pattern) => pattern.week === week), [week])
  const [selectedPattern, setSelectedPattern] = useState(patterns[0]?.name ?? '')
  const [search, setSearch] = useState('')
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null)

  useEffect(() => {
    setSelectedPattern(patterns[0]?.name ?? '')
    setSearch('')
    setExpandedProblem(null)
  }, [patterns])

  const activePattern = patterns.find((pattern) => pattern.name === selectedPattern) ?? patterns[0]
  const theory = activePattern ? getPatternTheory(activePattern.name) : null
  const blueprint = activePattern ? getPatternBlueprint(activePattern.name) : null
  const visibleProblems = activePattern?.problems.filter((problem) => problem.title.toLowerCase().includes(search.toLowerCase())) ?? []
  const groups = [
    { label: 'Easy', problems: visibleProblems.filter((problem) => problem.difficulty === 'Easy' || problem.difficulty === 'Basic') },
    { label: 'Medium', problems: visibleProblems.filter((problem) => problem.difficulty === 'Medium') },
    { label: 'Hard', problems: visibleProblems.filter((problem) => problem.difficulty === 'Hard') },
  ]
  const totalProblems = patterns.reduce((total, pattern) => total + pattern.problems.length, 0)
  const solvedInWeek = patterns.reduce((total, pattern) => total + pattern.problems.filter((problem) => completedProblems.includes(`${pattern.name}:${problem.source}:${problem.title}`)).length, 0)

  if (!activePattern) return null

  return (
    <section className="practice-library">
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
            <label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this pattern" /></label>
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
                          <button className="problem-checkbox" onClick={() => toggleProblem(key)} aria-label={solved ? `Mark ${problem.title} incomplete` : `Mark ${problem.title} complete`}>{solved ? '✓' : ''}</button>
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
                          <p className="guide-warning"><b>Stuck?</b> Reveal one step from “Solve it” above, not the entire solution. This trains pattern recognition instead of memorization.</p>
                        </div>}
                      </div>
                    )
                  })}
                  {!group.problems.length && <p className="no-problems">No {group.label.toLowerCase()} questions in this pattern.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DsaAnimationLab({ week, complete, completedProblems, toggleProblem }: {
  week: number
  complete: () => void
  completedProblems: string[]
  toggleProblem: (key: string) => void
}) {
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

  return (
    <div className="page lesson-page">
      <LessonHeader tag="DSA VISUAL LAB" title={lesson.title} description={lesson.description} step="01 / 03" week={week} />
      <section className="concept-strip">
        <div><span className="concept-icon">▶</span><p><small>LEARN BY DOING</small><strong>Edit the input, predict the next step,<br />then control the trace yourself.</strong></p></div>
        <div className="versus">VS</div>
        <div><span className="array-cells"><i>01</i><i>02</i><i>03</i></span><p><small>CORE INVARIANT</small><strong>{lesson.pattern}</strong></p></div>
      </section>

      <DsaTheoryExplorer week={week} />

      {week === 1 && <LinkedListVisualizer onProgress={complete} />}
      {week === 2 && <ArrayVisualizer onProgress={complete} />}
      {week === 3 && <StackVisualizer onProgress={complete} />}
      {week === 4 && <WindowVisualizer onProgress={complete} />}
      {week === 5 && <TreeVisualizer onProgress={complete} />}
      {week === 6 && <HeapVisualizer onProgress={complete} />}
      {week === 7 && <GraphVisualizer onProgress={complete} />}
      {week === 8 && <BacktrackingVisualizer onProgress={complete} />}
      {week === 9 && <BinarySearchVisualizer onProgress={complete} />}
      {week === 10 && <DynamicProgrammingVisualizer onProgress={complete} />}
      {week === 11 && <GreedyVisualizer onProgress={complete} />}
      {week === 12 && <KmpVisualizer onProgress={complete} />}

      <section className="insight-grid">
        <article className="insight-card">
          <span className="section-kicker">ACTIVE-LEARNING LOOP</span>
          <h3>Predict → step → explain → change the input.</h3>
          <p>Do not only watch the animation. Before pressing next, state which line executes, which variables change, and why the invariant remains true.</p>
        </article>
        <article className="complexity-card">
          <div><span>CONTROL</span><span>USE IT FOR</span></div>
          <div><strong>Previous / next</strong><b className="good">Reasoning</b></div>
          <div><strong>Custom input</strong><b className="good">Edge cases</b></div>
          <div><strong>Variable watch</strong><b className="good">Tracing</b></div>
          <div><strong>Python highlight</strong><b className="good">Code map</b></div>
        </article>
      </section>
      <PracticeLibrary week={week} completedProblems={completedProblems} toggleProblem={toggleProblem} />
    </div>
  )
}

type Server = { id: number; connections: number; color: string }

function HldLab({ complete }: { complete: () => void }) {
  const [layer, setLayer] = useState<'L4' | 'L7'>('L4')
  const [strategy, setStrategy] = useState<'round-robin' | 'least-connections'>('round-robin')
  const [servers, setServers] = useState<Server[]>([
    { id: 1, connections: 2, color: '#6ee7b7' },
    { id: 2, connections: 1, color: '#a78bfa' },
    { id: 3, connections: 3, color: '#fb923c' },
  ])
  const [lastServer, setLastServer] = useState<number | null>(null)
  const [roundRobinIndex, setRoundRobinIndex] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [log, setLog] = useState('Ready. Send a request to see the routing decision.')
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  const sendRequest = () => {
    const targetIndex = strategy === 'round-robin'
      ? roundRobinIndex
      : servers.reduce((best, server, index, all) => server.connections < all[best].connections ? index : best, 0)
    const target = servers[targetIndex]
    setLastServer(target.id)
    setRequestCount((count) => count + 1)
    setServers((current) => current.map((server, index) => index === targetIndex ? { ...server, connections: server.connections + 1 } : server))
    if (strategy === 'round-robin') setRoundRobinIndex((targetIndex + 1) % servers.length)
    setLog(layer === 'L4'
      ? `L4 reads IP + TCP port, then routes connection #${requestCount + 1} to Server ${target.id}.`
      : `L7 inspects HTTP path /api/profile, then routes request #${requestCount + 1} to Server ${target.id}.`)
    complete()
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setLastServer(null), 1100)
  }

  const drain = (id: number) => {
    setServers((current) => current.map((server) => server.id === id ? { ...server, connections: Math.max(0, server.connections - 1) } : server))
  }

  return (
    <div className="page lesson-page">
      <LessonHeader tag="HLD LAB" title="How traffic finds a healthy server" description="A load balancer is a traffic decision point. Change what it can see, and you change what decisions it can make." step="02 / 03" />
      <section className="zero-to-one">
        <div className="zero-heading"><span className="section-kicker">START FROM ZERO · SIX IDEAS BEFORE LOAD BALANCERS</span><h2>First understand what is being balanced</h2></div>
        <div className="foundation-grid">
          {[
            ['Client', 'A program that initiates a request—such as a browser or mobile app.'],
            ['Server', 'A running process listening on a network port and responding to requests.'],
            ['DNS', 'Translates a hostname such as shop.example.com into an address clients can reach.'],
            ['TCP + TLS', 'TCP carries an ordered byte stream; TLS authenticates and encrypts the connection.'],
            ['HTTP', 'Defines application-level requests and responses: method, path, headers, body and status.'],
            ['Latency + throughput', 'Latency is time per request; throughput is completed requests per unit time.'],
          ].map(([term, meaning], index) => <article key={term}><span>0{index + 1}</span><h3>{term}</h3><p>{meaning}</p></article>)}
        </div>
        <div className="url-anatomy">
          <span>URL ANATOMY</span>
          <code><b>https</b>://<i>shop.example.com</i>:<em>443</em>/<strong>products/42</strong>?<u>currency=INR</u>#reviews</code>
          <small>scheme · hostname · port · path · query · fragment (the fragment is normally not sent to the server)</small>
        </div>
      </section>
      <section className="birds-eye">
        <span className="section-kicker">BIRD’S-EYE VIEW</span>
        <div className="request-journey">
          {['Client', 'DNS', 'Load balancer', 'Application', 'Database'].map((item, index) => (
            <div className="journey-step" key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 4 && <i>→</i>}</div>
          ))}
        </div>
        <p>The load balancer sits between a stable public endpoint and a changing pool of private servers.</p>
      </section>

      <section className="lab-card">
        <div className="sim-header">
          <div><span className="live-dot" /> TRAFFIC SIMULATOR</div>
          <div className="segmented">
            <button className={layer === 'L4' ? 'active' : ''} onClick={() => setLayer('L4')}>Layer 4</button>
            <button className={layer === 'L7' ? 'active' : ''} onClick={() => setLayer('L7')}>Layer 7</button>
          </div>
          <select value={strategy} onChange={(event) => setStrategy(event.target.value as typeof strategy)}>
            <option value="round-robin">Round robin</option>
            <option value="least-connections">Least connections</option>
          </select>
          <button className="primary-button small" onClick={sendRequest}><Icon name="play" /> Send request</button>
        </div>
        <div className="architecture-stage">
          <div className="arch-column client-column">
            <span className="arch-label">INTERNET</span>
            <div className={`client-card ${lastServer ? 'sending' : ''}`}><i>◉</i><strong>Client</strong><small>{layer === 'L4' ? 'TCP :443' : 'GET /api/profile'}</small></div>
          </div>
          <div className="traffic-pipe"><span className={lastServer ? 'packet moving' : 'packet'}>{requestCount || 'REQ'}</span><i>→</i></div>
          <div className="arch-column">
            <span className="arch-label">EDGE</span>
            <div className="load-balancer">
              <span>{layer}</span><strong>Load Balancer</strong>
              <small>{layer === 'L4' ? 'Sees IP, port, protocol' : 'Sees headers, path, cookies'}</small>
              <div className="lb-pulse" />
            </div>
          </div>
          <div className="fanout"><i /><i /><i /></div>
          <div className="server-stack">
            <span className="arch-label">SERVER POOL</span>
            {servers.map((server) => (
              <button className={`server-card ${lastServer === server.id ? 'receiving' : ''}`} key={server.id} onClick={() => drain(server.id)}>
                <i style={{ background: server.color }} /><span><strong>Server {server.id}</strong><small>{server.connections} active connection{server.connections === 1 ? '' : 's'}</small></span><b>{server.connections}</b>
              </button>
            ))}
            <small className="tap-hint">Click a server to finish one connection</small>
          </div>
        </div>
        <div className="execution-bar"><span>ROUTING DECISION</span><code>{log}</code></div>
      </section>

      <section className="compare-section">
        <div className="section-heading"><div><span className="section-kicker">INTERVIEW COMPARISON</span><h2>Layer 4 vs. Layer 7</h2></div></div>
        <div className="comparison-table">
          <div className="comparison-head"><span>QUESTION</span><strong>LAYER 4</strong><strong>LAYER 7</strong></div>
          <div><span>What does it inspect?</span><p>IP address, TCP/UDP port</p><p>HTTP method, path, headers, cookies</p></div>
          <div><span>Core strength</span><p>Fast, protocol-agnostic, lower overhead</p><p>Content-aware, flexible routing</p></div>
          <div><span>Example decision</span><p>“Send this TCP connection to server 2.”</p><p>“Send /images to image-service.”</p></div>
          <div><span>Trade-off</span><p>Cannot make HTTP-aware decisions</p><p>More CPU work; usually terminates TLS</p></div>
        </div>
        <div className="pattern-callout"><strong>Interview pattern</strong><span>Do not say one is “better.” State the routing requirement, then choose the lowest layer that can satisfy it.</span></div>
      </section>
    </div>
  )
}

const solidPrinciples = [
  { key: 'S', name: 'Single Responsibility', question: 'How many reasons does this class have to change?', summary: 'Keep each class focused on one responsibility.', risk: 'Changes to email formatting can break database logic.' },
  { key: 'O', name: 'Open / Closed', question: 'Can I add behavior without editing stable code?', summary: 'Extend behavior through abstractions.', risk: 'Every new channel adds another if/elif branch.' },
  { key: 'L', name: 'Liskov Substitution', question: 'Can every subtype safely replace its base type?', summary: 'Subtypes must honor the parent contract.', risk: 'A subtype that throws for a promised operation surprises callers.' },
  { key: 'I', name: 'Interface Segregation', question: 'Is a client forced to depend on methods it never uses?', summary: 'Prefer small, role-specific contracts.', risk: 'Implementations gain fake or empty methods.' },
  { key: 'D', name: 'Dependency Inversion', question: 'Does policy depend on details, or on an abstraction?', summary: 'High-level policy should depend on interfaces.', risk: 'Business logic becomes welded to one vendor or framework.' },
]

const beforeCode = `class NotificationService:
    def notify(self, user, message, channel):
        if channel == "email":
            smtp = SMTPClient()
            smtp.send(user.email, message)
        elif channel == "sms":
            twilio = TwilioClient()
            twilio.send(user.phone, message)

        Database.save_notification(user.id, message)`

const afterCode = `from typing import Protocol

class Notifier(Protocol):
    def send(self, recipient: str, message: str) -> None: ...

class NotificationService:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier

    def notify(self, recipient: str, message: str) -> None:
        self.notifier.send(recipient, message)

# Extend with EmailNotifier, SmsNotifier, or PushNotifier
# without modifying NotificationService.`

function CodeBlock({ code }: { code: string }) {
  return <pre><code>{code.split('\n').map((line, index) => <span key={index}><b>{String(index + 1).padStart(2, '0')}</b>{line || ' '}</span>)}</code></pre>
}

function LldLab({ complete }: { complete: () => void }) {
  const [selected, setSelected] = useState(0)
  const [refactored, setRefactored] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const principle = solidPrinciples[selected]
  const chooseAnswer = (choice: string) => {
    setAnswer(choice)
    complete()
  }
  return (
    <div className="page lesson-page">
      <LessonHeader tag="LLD LAB" title="SOLID without memorizing slogans" description="SOLID is a set of change-management heuristics. Each principle asks a different question about how future requirements affect your code." step="03 / 03" />
      <section className="zero-to-one lld-foundations">
        <div className="zero-heading"><span className="section-kicker">START FROM ZERO · BEFORE SOLID</span><h2>Design decides where behavior and change should live</h2><p>An object has identity, state and behavior. A class defines a kind of object. Good LLD is not “create a class for every noun”; it assigns responsibilities while protecting rules.</p></div>
        <div className="foundation-grid">
          {[
            ['Responsibility', 'A decision or obligation owned by one cohesive component.'],
            ['Contract', 'What callers may rely on: results, side effects, errors and invariants.'],
            ['Cohesion', 'How strongly the behavior inside one component belongs together.'],
            ['Coupling', 'How much one component knows about or depends on another.'],
            ['Composition', 'An object delegates work to collaborating objects it contains.'],
            ['Polymorphism', 'Different implementations safely satisfy the same expected contract.'],
          ].map(([term, meaning], index) => <article key={term}><span>0{index + 1}</span><h3>{term}</h3><p>{meaning}</p></article>)}
        </div>
        <div className="design-equation"><span>THE GOAL</span><strong>High cohesion</strong><b>+</b><strong>Intentional, low coupling</strong><b>+</b><strong>Protected invariants</strong></div>
      </section>
      <section className="solid-map">
        {solidPrinciples.map((item, index) => (
          <button className={selected === index ? 'active' : ''} onClick={() => setSelected(index)} key={item.key}>
            <span>{item.key}</span><strong>{item.name}</strong><small>{item.summary}</small>
          </button>
        ))}
      </section>

      <section className="principle-focus">
        <div className="principle-letter">{principle.key}</div>
        <div><span className="section-kicker">THE QUESTION TO ASK</span><h2>{principle.question}</h2><p>{principle.risk}</p></div>
      </section>

      <section className="code-workbench">
        <div className="code-header">
          <div><span className="live-dot" /> PYTHON REFACTOR LAB</div>
          <div className="segmented">
            <button className={!refactored ? 'active' : ''} onClick={() => setRefactored(false)}>Before</button>
            <button className={refactored ? 'active' : ''} onClick={() => { setRefactored(true); complete() }}>After</button>
          </div>
        </div>
        <div className="code-layout">
          <CodeBlock code={refactored ? afterCode : beforeCode} />
          <aside className={`review-panel ${refactored ? 'success' : ''}`}>
            <span className="review-icon">{refactored ? '✓' : '!'}</span>
            <span className="section-kicker">{refactored ? 'WHAT IMPROVED' : 'DESIGN SMELLS'}</span>
            {refactored ? (
              <ul>
                <li>NotificationService owns orchestration only.</li>
                <li>It depends on the Notifier contract, not SMTP.</li>
                <li>New channels extend the system without editing policy.</li>
              </ul>
            ) : (
              <ul>
                <li>Creates infrastructure clients directly.</li>
                <li>Channel selection grows with every new type.</li>
                <li>Sending and persistence have different reasons to change.</li>
              </ul>
            )}
            <button onClick={() => { setRefactored(!refactored); complete() }}>{refactored ? 'Show original' : 'Apply refactor'} <Icon name="arrow" /></button>
          </aside>
        </div>
      </section>

      <section className="quiz-card">
        <div><span className="section-kicker">CHECK YOUR MODEL</span><h2>A Bird base class promises fly(). Penguin throws an exception. Which principle is broken?</h2></div>
        <div className="quiz-options">
          {['Single Responsibility', 'Liskov Substitution', 'Interface Segregation'].map((choice) => (
            <button className={answer === choice ? (choice === 'Liskov Substitution' ? 'correct' : 'wrong') : ''} onClick={() => chooseAnswer(choice)} key={choice}>
              <span>{choice}</span>{answer === choice && <b>{choice === 'Liskov Substitution' ? 'Correct ✓' : 'Try again'}</b>}
            </button>
          ))}
        </div>
        {answer && <p className="quiz-explanation">{answer === 'Liskov Substitution' ? 'Correct. Code expecting a Bird cannot safely use a Penguin, so the subtype violates the base contract. Model FlyingBird separately.' : 'Not quite. Focus on whether the subtype can safely replace its parent.'}</p>}
      </section>
    </div>
  )
}

const moduleGuides: Record<ModuleId, {
  label: string
  framing: string
  steps: { title: string; detail: string }[]
  interviewPattern: string
}> = {
  dsa: {
    label: 'DSA PRACTICE',
    framing: 'Do not begin with code. First identify the shape of the input, the operation that repeats, and the invariant that must stay true.',
    steps: [
      { title: 'Recognize', detail: 'Name the data structure or reusable problem pattern and explain why it fits.' },
      { title: 'Trace', detail: 'Walk through a small example by hand and state the invariant after every step.' },
      { title: 'Implement', detail: 'Write the Python solution, then test empty, single-item, duplicate, and boundary inputs.' },
    ],
    interviewPattern: 'Brute force → bottleneck → invariant → optimized approach → complexity → edge cases.',
  },
  hld: {
    label: 'SYSTEM DESIGN',
    framing: 'Architecture follows requirements. Clarify scale and reliability before choosing databases, queues, caches, or service boundaries.',
    steps: [
      { title: 'Frame', detail: 'Clarify functional requirements, non-functional goals, constraints, and what is out of scope.' },
      { title: 'Draw', detail: 'Follow one request end-to-end through APIs, services, storage, and asynchronous paths.' },
      { title: 'Stress', detail: 'Find the bottleneck, inject a failure, and compare at least two realistic trade-offs.' },
    ],
    interviewPattern: 'Requirements → estimates → APIs/data model → high-level design → bottleneck deep dive → failures.',
  },
  lld: {
    label: 'OBJECT DESIGN',
    framing: 'Start from behavior and responsibilities, not a list of classes. The design is good when a likely new requirement has a clear home.',
    steps: [
      { title: 'Discover', detail: 'Extract actors, use cases, rules, state transitions, and important constraints.' },
      { title: 'Model', detail: 'Assign responsibilities, define contracts, and choose composition unless inheritance expresses a true is-a relationship.' },
      { title: 'Change', detail: 'Add one realistic requirement and observe which classes or interfaces need modification.' },
    ],
    interviewPattern: 'Use cases → objects/responsibilities → relationships → key flows → extensibility test → code.',
  },
}

function DesignModule({ module, lesson, completed, complete, setView, setSelectedWeek }: {
  module: 'hld' | 'lld'
  lesson: DesignLesson
  completed: boolean
  complete: () => void
  setView: (view: View) => void
  setSelectedWeek: (week: number) => void
}) {
  const [activeLens, setActiveLens] = useState<'model' | 'break' | 'interview'>('model')
  const nextModule = module === 'hld' ? 'lld' : null
  const finishAndContinue = () => {
    complete()
    if (nextModule) setView(nextModule)
    else if (lesson.week < 12) {
      setSelectedWeek(lesson.week + 1)
      setView('home')
    } else setView('roadmap')
  }
  const lensContent = {
    model: { label: 'MENTAL MODEL', title: lesson.mentalModel, detail: lesson.outcome },
    break: { label: module === 'hld' ? 'FAILURE PRESSURE' : 'CHANGE PRESSURE', title: lesson.pressure, detail: lesson.tradeoff },
    interview: { label: 'INTERVIEW PROMPT', title: lesson.interviewPrompt, detail: 'Answer by clarifying assumptions, drawing the smallest correct model, and then applying the stated pressure.' },
  }

  return (
    <div className="page lesson-page">
      <LessonHeader tag={module === 'hld' ? 'HLD · SYSTEM DESIGN' : 'LLD · OBJECT DESIGN'} title={lesson.title} description={lesson.outcome} step={`${module === 'hld' ? '02' : '03'} / 03`} week={lesson.week} />
      <section className="beginner-path">
        <div><span className="section-kicker">START HERE · NO PRIOR SYSTEM DESIGN REQUIRED</span><h2>Need → simplest model → breaking point → new component → trade-off</h2><p>Do not memorize architecture diagrams or pattern names. Each lesson explains why an idea becomes necessary and what new problems it introduces.</p></div>
        <span className={`completion-stamp ${completed ? 'done' : ''}`}>{completed ? '✓ DONE' : `WEEK ${lesson.week}`}</span>
      </section>

      <section className="concept-canvas">
        <div className="concept-canvas-heading"><span className="section-kicker">VOCABULARY MAP</span><h2>Terms you should be able to explain simply</h2></div>
        <div className="concept-cloud">{lesson.concepts.map((concept, index) => <span style={{ animationDelay: `${index * 45}ms` }} key={concept}>{concept}</span>)}</div>
      </section>

      <section className="learning-lens">
        <div className="lens-tabs">
          <button className={activeLens === 'model' ? 'active' : ''} onClick={() => setActiveLens('model')}>01 · Understand</button>
          <button className={activeLens === 'break' ? 'active' : ''} onClick={() => setActiveLens('break')}>02 · Apply pressure</button>
          <button className={activeLens === 'interview' ? 'active' : ''} onClick={() => setActiveLens('interview')}>03 · Explain</button>
        </div>
        <div className="lens-stage">
          <div className={`lens-orb ${module}`}><span>{activeLens === 'model' ? '◎' : activeLens === 'break' ? '⚡' : '?'}</span></div>
          <div><span className="section-kicker">{lensContent[activeLens].label}</span><h2>{lensContent[activeLens].title}</h2><p>{lensContent[activeLens].detail}</p></div>
        </div>
      </section>

      <section className="misconception-panel">
        <article><span>COMMON MISCONCEPTION</span><h3>{lesson.misconception}</h3></article>
        <b>→</b>
        <article><span>MORE ACCURATE MODEL</span><h3>{lesson.correction}</h3></article>
      </section>

      <section className="design-practice-card">
        <div><span className="section-kicker">INTERACTIVE IDEA</span><h2>{lesson.visual}</h2><p>Before revealing an outcome, predict what changes in latency, coupling, consistency, availability, or code-change blast radius.</p></div>
        <div className="tradeoff-card"><span>TRADE-OFF TO DEFEND</span><strong>{lesson.tradeoff}</strong></div>
      </section>

      <section className="source-shelf">
        <div><span className="section-kicker">SOURCE SHELF</span><h2>Continue with the original references</h2></div>
        <div>{lesson.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLinkIcon /></a>)}</div>
      </section>

      <Suspense fallback={<section className="explore-more-loading">Loading deeper examples…</section>}>
        <DesignExploreMore track={module} week={lesson.week} />
      </Suspense>

      <div className="module-actions">
        <button className="secondary-button" onClick={() => setView('roadmap')}>View course map</button>
        <button className="primary-button" onClick={finishAndContinue}>{completed ? 'Continue reviewing' : 'Mark complete & continue'} <Icon name="arrow" /></button>
      </div>
    </div>
  )
}

function SelfPacedModule({ module, week, completed, complete, setView, setSelectedWeek, solvedProblems, toggleProblem }: {
  module: ModuleId
  week: RoadmapWeek
  completed: boolean
  complete: () => void
  setView: (view: View) => void
  setSelectedWeek: (week: number) => void
  solvedProblems: string[]
  toggleProblem: (key: string) => void
}) {
  const guide = moduleGuides[module]
  const topic = week[module]
  const nextModule = moduleIds[moduleIds.indexOf(module) + 1]

  const finishAndContinue = () => {
    complete()
    if (nextModule) {
      setView(nextModule)
    } else if (week.week < 12) {
      setSelectedWeek(week.week + 1)
      setView('home')
    } else {
      setView('roadmap')
    }
  }

  return (
    <div className="page lesson-page">
      <LessonHeader
        tag={guide.label}
        title={topic}
        description={guide.framing}
        step={`${moduleIds.indexOf(module) + 1} / 03`}
        week={week.week}
      />
      <section className="self-paced-banner">
        <div>
          <span className="section-kicker">SELF-PACED · NO DATE LOCK</span>
          <h2>{completed ? 'Completed — revisit whenever you like.' : 'Work through this module in one sitting or several.'}</h2>
          <p>Your progress stays on this device. Mark the module complete only after you can explain the topic without reading notes.</p>
        </div>
        <span className={`completion-stamp ${completed ? 'done' : ''}`}>{completed ? '✓ DONE' : `WEEK ${week.week}`}</span>
      </section>

      <section className="study-sequence">
        {guide.steps.map((step, index) => (
          <article key={step.title}>
            <span>0{index + 1}</span>
            <div><small>{index === 0 ? 'BIRD’S-EYE VIEW' : index === 1 ? 'BUILD INTUITION' : 'INTERVIEW DEPTH'}</small><h3>{step.title}</h3><p>{step.detail}</p></div>
          </article>
        ))}
      </section>

      <section className="module-topic-card">
        <div>
          <span className="section-kicker">THIS WEEK’S TOPIC</span>
          <h2>{topic}</h2>
          <p>Use the sequence above with your preferred reference material. The important outcome is being able to teach the concept, defend trade-offs, and handle a changed requirement.</p>
        </div>
        <div className="interview-pattern-box"><span>REUSABLE ANSWER PATTERN</span><strong>{guide.interviewPattern}</strong></div>
      </section>
      {module === 'dsa' && <PracticeLibrary week={week.week} completedProblems={solvedProblems} toggleProblem={toggleProblem} />}

      <div className="module-actions">
        <button className="secondary-button" onClick={() => setView('roadmap')}>View course map</button>
        <button className="primary-button" onClick={finishAndContinue}>
          {completed ? (nextModule ? `Review next module` : week.week < 12 ? `Go to Week ${week.week + 1}` : 'View completed course') : (nextModule ? 'Mark complete & continue' : week.week < 12 ? `Complete Week ${week.week} & continue` : 'Complete the course')}
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem(storageKeys.currentView) as View | null
    return saved && views.includes(saved) ? saved : 'home'
  })
  const [profileName, setProfileName] = useState(() => localStorage.getItem(storageKeys.profileName) ?? '')
  const [profileOpen, setProfileOpen] = useState(false)
  const [websiteWalkthroughOpen, setWebsiteWalkthroughOpen] = useState(() => localStorage.getItem(storageKeys.websiteWalkthroughSeen) !== 'true')
  const [websiteWalkthroughStep, setWebsiteWalkthroughStep] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(storageKeys.sidebarCollapsed) === 'true')
  const [selectedWeek, setSelectedWeekState] = useState(() => {
    const saved = Number(localStorage.getItem(storageKeys.selectedWeek))
    return saved >= 1 && saved <= 12 ? saved : 1
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
    if (!profileName && !websiteWalkthroughOpen) setProfileOpen(true)
  }, [profileName, websiteWalkthroughOpen])

  useEffect(() => {
    localStorage.setItem(storageKeys.completed, JSON.stringify(completed))
    localStorage.setItem(storageKeys.selectedWeek, String(selectedWeek))
    localStorage.setItem(storageKeys.solvedProblems, JSON.stringify(solvedProblems))
    localStorage.setItem(storageKeys.profileName, profileName)
  }, [completed, profileName, selectedWeek, solvedProblems])

  useEffect(() => {
    localStorage.setItem(storageKeys.currentView, view)
  }, [view])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedWeek, view])

  const complete = useMemo(() => (week: number, module: ModuleId) => {
    const key = completionKey(week, module)
    setCompleted((current) => current.includes(key) ? current : [...current, key])
  }, [])

  const setSelectedWeek = (week: number) => {
    setSelectedWeekState(Math.min(12, Math.max(1, week)))
  }
  const toggleSidebar = () => {
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
      version: 1,
      exportedAt: new Date().toISOString(),
      profileName,
      selectedWeek,
      completedModules: completed,
      solvedProblems,
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
      const importedWeek = typeof parsed.selectedWeek === 'number' && parsed.selectedWeek >= 1 && parsed.selectedWeek <= 12 ? parsed.selectedWeek : 1
      const importedName = typeof parsed.profileName === 'string' ? parsed.profileName.trim().slice(0, 50) : ''
      setCompleted(importedModules)
      setSolvedProblems(importedProblems)
      setSelectedWeek(importedWeek)
      if (importedName) setProfileName(importedName)
      return `Imported ${importedProblems.length} solved questions and ${importedModules.length} completed modules.`
    } catch {
      return 'This file is not a valid Codyssey progress backup.'
    }
  }
  const recommendedWeek = roadmap.find((week) => !isWeekComplete(week.week, completed))?.week ?? 12
  const currentWeek = roadmap[selectedWeek - 1]
  const websiteTourSteps = useMemo<TourStep[]>(() => [
    { selector: '.hero-copy h1', title: 'Your learning cockpit', detail: 'Start here to see the selected week, overall direction, completion status, and the three learning tracks.', action: () => setView('home') },
    { selector: '.roadmap-week.current', title: 'Move through all 12 weeks', detail: 'The roadmap lets you inspect every week and jump directly to any topic. The schedule is recommended, never locked.', action: () => setView('roadmap') },
    { selector: '.theory-explorer-heading h2', title: 'Understand the pattern first', detail: 'Choose a pattern and learn its recognition signals, invariant, implementation blueprint, adaptation questions, and common mistakes.', action: () => setView('dsa') },
    { selector: '.player-header-actions', title: 'Control the algorithm trace', detail: 'Edit inputs, predict the next state, step through Python, inspect variables, change speed, or enter Focus mode.', action: () => setView('dsa') },
    { selector: '.practice-heading h2', title: 'Apply the pattern to questions', detail: 'Practise by difficulty. Open a title for the original problem, use Guide when stuck, and check it off only after solving.', action: () => setView('dsa') },
    { selector: '.lesson-step', title: 'Learn system design from first principles', detail: 'HLD builds scale, reliability, and distributed-systems reasoning from beginner mental models to full interviews.', action: () => setView('hld') },
    { selector: '.lesson-header h1', title: 'Translate requirements into objects', detail: 'LLD develops responsibilities, SOLID reasoning, design patterns, extensibility, and implementation judgement.', action: () => setView('lld') },
    { selector: '.workspace-actions', title: 'Draw the problem state', detail: 'Visual Workspace lets you build real data structures, connect pointers, mark state, and write the invariant beside the canvas.', action: () => setView('workspace') },
    { selector: '.avatar', title: 'Protect your progress', detail: 'Open your profile to view coverage and export or import progress. Your study data stays in this browser.' },
    { selector: '.appendix-stats', title: 'Explore the source library', detail: 'The Appendix contains the original practice material, design references, engineering blogs, and visual-learning resources.', action: () => setView('appendix') },
  ], [])
  const renderModule = (module: ModuleId) => {
    if (module === 'dsa') {
      return (
        <DsaAnimationLab
          week={selectedWeek}
          complete={() => complete(selectedWeek, 'dsa')}
          completedProblems={solvedProblems}
          toggleProblem={toggleProblem}
        />
      )
    }
    if (selectedWeek === 1) {
      if (module === 'hld') return <HldLab complete={() => complete(1, 'hld')} />
      return <LldLab complete={() => complete(1, 'lld')} />
    }
    if (module === 'hld' || module === 'lld') {
      const lesson = (module === 'hld' ? hldLessons : lldLessons)[selectedWeek - 1]
      return (
        <DesignModule
          module={module}
          lesson={lesson}
          completed={completed.includes(completionKey(selectedWeek, module))}
          complete={() => complete(selectedWeek, module)}
          setView={setView}
          setSelectedWeek={setSelectedWeek}
        />
      )
    }
    return (
      <SelfPacedModule
        module={module}
        week={currentWeek}
        completed={completed.includes(completionKey(selectedWeek, module))}
        complete={() => complete(selectedWeek, module)}
        setView={setView}
        setSelectedWeek={setSelectedWeek}
        solvedProblems={solvedProblems}
        toggleProblem={toggleProblem}
      />
    )
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar view={view} setView={setView} completed={completed} selectedWeek={selectedWeek} collapsed={sidebarCollapsed} toggleCollapsed={toggleSidebar} />
      <main>
        <Topbar view={view} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} profileName={profileName} openProfile={() => setProfileOpen(true)} openWalkthrough={() => setWebsiteWalkthroughOpen(true)} />
        {view === 'home' && <Home setView={setView} completed={completed} week={currentWeek} recommendedWeek={recommendedWeek} setSelectedWeek={setSelectedWeek} />}
        {view === 'roadmap' && <Roadmap selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} completed={completed} setView={setView} recommendedWeek={recommendedWeek} />}
        {view === 'dsa' && renderModule('dsa')}
        {view === 'hld' && renderModule('hld')}
        {view === 'lld' && renderModule('lld')}
        {view === 'workspace' && <VisualWorkspace suppressWalkthrough={websiteWalkthroughOpen} />}
        {view === 'appendix' && <Appendix />}
      </main>
      <ProfilePanel
        open={profileOpen}
        close={() => setProfileOpen(false)}
        name={profileName}
        saveName={saveName}
        completed={completed}
        solvedProblems={solvedProblems}
        exportProgress={exportProgress}
        importProgress={importProgress}
      />
      <GuidedTour open={websiteWalkthroughOpen} steps={websiteTourSteps} index={websiteWalkthroughStep} setIndex={setWebsiteWalkthroughStep} close={closeWebsiteWalkthrough} label="CODYSSEY TOUR" />
    </div>
  )
}
