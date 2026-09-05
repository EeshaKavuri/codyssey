import { useId, useReducer, useRef, useState, type Dispatch, type KeyboardEvent } from 'react'
import {
  BOOKING_SEATS,
  HOLD_SECONDS,
  bookingInvariant,
  bookingReducer,
  createBookingState,
  holdPhase,
  liveClaims,
  type BookingAction,
  type BookingOwner,
  type BookingState,
  type HoldPhase,
} from '../data/bookingModel'
import './booking-workbench.css'

export interface BookingWorkbenchProps {
  onPractice?: () => void
}

type Lens = 'hld' | 'lld' | 'dsa'
type LensProps = { state: BookingState; dispatch: Dispatch<BookingAction>; uid: string }
const lenses: { id: Lens; label: string; name: string; question: string }[] = [
  { id: 'hld', label: 'HLD', name: 'The race', question: 'Where does truth live?' },
  { id: 'lld', label: 'LLD', name: 'The contract', question: 'Who may change this hold?' },
  { id: 'dsa', label: 'DSA', name: 'The cleanup', question: 'Which expiration comes next?' },
]
const requests = ['Maya reads primary', 'Maya requests A7', 'Leo reads follower', 'Leo requests A7']

function ArrowMarker({ id }: { id: string }) {
  return <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
}

function HldDiagram({ state, uid }: Pick<LensProps, 'state' | 'uid'>) {
  const seat = state.seats.A7
  const phase = holdPhase(seat, state.now)
  const broken = !bookingInvariant(state).ok
  const stale = state.follower.revision !== seat.revision
  return <div className="booking-diagram-scroll" role="region" aria-label="Booking architecture diagram; scroll horizontally on small screens" tabIndex={0}>
    <svg className="booking-diagram booking-hld-diagram" viewBox="0 0 828 350" role="img" aria-labelledby={`${uid}-architecture-title ${uid}-architecture-desc`}>
      <title id={`${uid}-architecture-title`}>Two clients, one authoritative seat</title>
      <desc id={`${uid}-architecture-desc`}>Maya reads the primary. Leo reads an advisory follower. Both send reservations to the booking service. The primary currently has A7 {phase}{seat.owner ? ` for ${seat.owner}` : ''} at revision {seat.revision}. The follower shows {state.follower.phase} at revision {state.follower.revision}. {state.policy === 'atomic' ? 'The writer checks and reserves atomically.' : 'The service trusts an earlier read and writes without a guard.'}</desc>
      <ArrowMarker id={`${uid}-hld-arrow`} />
      <g className="booking-edges" markerEnd={`url(#${uid}-hld-arrow)`}>
        <path className={state.requestStep > 0 && state.requestStep < 3 ? 'is-active' : ''} d="M188 81 H246 V148 H300" />
        <path className={state.requestStep > 2 ? 'is-active' : ''} d="M188 258 H246 V194 H300" />
        <path className={state.requestStep === 2 || state.requestStep === 4 ? 'is-active' : ''} d="M500 148 H555 V95 H611" />
        <path className="is-advisory" d="M500 194 H555 V264 H611" />
        <path className="is-advisory" d="M705 154 V216" />
      </g>
      <text className="booking-svg-label" x="534" y="78">write</text>
      <text className="booking-svg-label" x="527" y="287">read</text>
      <text className="booking-svg-label" x="717" y="187">{stale ? 'lag' : 'sync'}</text>
      {(['Maya', 'Leo'] as const).map((owner, index) => {
        const y = index === 0 ? 36 : 213
        const read = state.reads[owner]
        const reply = state.replies[owner]
        return <g key={owner} className={`booking-svg-node ${reply === 'rejected' || (reply === 'accepted' && broken) ? 'is-conflict' : reply === 'accepted' ? 'is-verified' : ''}`}>
          <rect x="28" y={y} width="160" height="96" rx="5" />
          <text className="booking-svg-title" x="44" y={y + 28}>{owner}</text>
          <text x="44" y={y + 52}>{read ? `${read.phase} · ${read.source} v${read.revision}` : 'has not read yet'}</text>
          <text className="booking-svg-status" x="44" y={y + 77}>{reply === 'accepted' ? '✓ success reply' : reply === 'rejected' ? '× conflict refused' : '— no reply yet'}</text>
        </g>
      })}
      <g className={`booking-svg-node booking-service-node ${state.policy === 'atomic' ? 'is-verified' : 'is-active'}`}>
        <rect x="300" y="116" width="200" height="110" rx="5" />
        <text className="booking-svg-title" x="318" y="147">Booking service</text>
        <text x="318" y="176">{state.policy === 'atomic' ? 'check + reserve' : 'trust earlier read'}</text>
        <text x="318" y="201">{state.policy === 'atomic' ? 'one atomic operation' : 'then overwrite row'}</text>
      </g>
      <g className={`booking-svg-node ${broken ? 'is-conflict' : 'is-authority'}`}>
        <rect x="611" y="36" width="188" height="118" rx="5" />
        <text className="booking-svg-title" x="627" y="66">Primary / writer</text>
        <text x="627" y="93">A7 · {phase}</text>
        <text x="627" y="117">{seat.owner ? `${seat.owner} / ${seat.holdId}` : 'no owner or token'}</text>
        <text className="booking-svg-label" x="627" y="139">authoritative · v{seat.revision}</text>
      </g>
      <g className={`booking-svg-node ${stale ? 'is-active' : ''}`}>
        <rect x="611" y="216" width="188" height="96" rx="5" />
        <text className="booking-svg-title" x="627" y="245">Follower / replica</text>
        <text x="627" y="271">A7 · {state.follower.phase} · v{state.follower.revision}</text>
        <text className="booking-svg-label" x="627" y="295">{stale ? 'stale · advisory only' : 'advisory, even when fresh'}</text>
      </g>
      <text className="booking-svg-label" x="29" y="337">Same seat. Separate reads. A success reply is a promise.</text>
    </svg>
  </div>
}

function HldLens({ state, dispatch, uid, prediction, setPrediction, revealed, setRevealed }: LensProps & {
  prediction: string; setPrediction: (value: string) => void; revealed: boolean; setRevealed: (value: boolean) => void
}) {
  const descriptions = [
    state.reads.Maya ? `${state.reads.Maya.phase} · v${state.reads.Maya.revision}` : 'authoritative read',
    state.replies.Maya ?? 'write happens later',
    state.reads.Leo ? `${state.reads.Leo.phase} · v${state.reads.Leo.revision}` : 'advisory snapshot',
    state.replies.Leo ?? 'same seat, another client',
  ]
  return <div className="booking-lens-layout">
    <div className="booking-canvas">
      <div className="booking-canvas-heading"><span className="booking-kicker">01 / SYSTEM BOUNDARY</span><h3>A read is not a reservation.</h3><p>Step the requests. The follower does not catch up until you explicitly sync it.</p></div>
      <div className="booking-canvas-actions">
        <button type="button" className="booking-button booking-button-primary" disabled={state.requestStep >= 4} onClick={() => dispatch({ type: 'next-request' })}>{state.requestStep < 4 ? `Next: ${requests[state.requestStep]}` : 'All four requests delivered'}<span aria-hidden="true">→</span></button>
        <button type="button" className="booking-button" disabled={state.requestStep >= 4} onClick={() => dispatch({ type: 'run-requests' })}>Run remaining</button>
      </div>
      <HldDiagram state={state} uid={uid} />
      <ol className="booking-request-strip" aria-label="Request sequence">
        {requests.map((request, index) => <li key={request} className={index < state.requestStep ? 'is-done' : index === state.requestStep ? 'is-current' : ''} aria-current={index === state.requestStep ? 'step' : undefined}>
          <span className="booking-step-number">{index + 1}</span><div><strong>{request}</strong><small>{descriptions[index]}</small></div>
        </li>)}
      </ol>
      <p className="booking-canvas-note">Reads and writes are separate events, even at the same logical time. Edits in LLD and DSA affect this replay too.</p>
    </div>
    <aside className="booking-inspector" aria-label="System design controls">
      <fieldset className="booking-policy">
        <legend>Choose the write contract</legend>
        <label className={state.policy === 'naive' ? 'is-selected' : ''}><input type="radio" name={`${uid}-policy`} value="naive" checked={state.policy === 'naive'} onChange={() => dispatch({ type: 'reset', policy: 'naive' })} /><span><strong>Naive read → write</strong><small>Trust the earlier snapshot</small></span></label>
        <label className={state.policy === 'atomic' ? 'is-selected' : ''}><input type="radio" name={`${uid}-policy`} value="atomic" checked={state.policy === 'atomic'} onChange={() => dispatch({ type: 'reset', policy: 'atomic' })} /><span><strong>Atomic reservation</strong><small>Check availability at the writer</small></span></label>
      </fieldset>
      <p className="booking-small">Changing the contract starts a fresh replay across all three lenses.</p>
      <button type="button" className="booking-button booking-button-wide" onClick={() => dispatch({ type: 'sync-follower' })}>Sync follower to writer</button>
      <p className="booking-small">A sync changes future reads, not a snapshot Leo already received.</p>
      <div className="booking-prediction">
        <fieldset>
          <legend>Make a prediction <span>optional</span></legend>
          <p>A follower says “free”. What makes a reservation safe?</p>
          <label><input type="radio" name={`${uid}-prediction`} checked={prediction === 'follower'} onChange={() => { setPrediction('follower'); setRevealed(false) }} />Trust that free read</label>
          <label><input type="radio" name={`${uid}-prediction`} checked={prediction === 'atomic'} onChange={() => { setPrediction('atomic'); setRevealed(false) }} />Check + reserve atomically</label>
        </fieldset>
        <button type="button" className="booking-text-button" onClick={() => setRevealed(!revealed)} aria-expanded={revealed} aria-controls={`${uid}-answer`}>{revealed ? 'Hide explanation' : 'Reveal explanation'} <span aria-hidden="true">↗</span></button>
        {revealed && <p id={`${uid}-answer`} className="booking-answer" role="status"><strong>{prediction === 'atomic' ? 'Exactly. ' : prediction ? 'Not quite. ' : 'The writer decides. '}</strong>A follower read is advisory. The availability check and reservation must be indivisible at the authoritative writer. A fresh read alone still has a read–write race.</p>}
      </div>
    </aside>
  </div>
}

function LifecycleDiagram({ phase, uid }: { phase: HoldPhase; uid: string }) {
  const nodes: { phase: HoldPhase; x: number; y: number; caption: string }[] = [
    { phase: 'free', x: 40, y: 118, caption: 'no current owner' },
    { phase: 'held', x: 312, y: 118, caption: 'owner + deadline' },
    { phase: 'confirmed', x: 623, y: 35, caption: 'no longer expires' },
    { phase: 'expired', x: 623, y: 229, caption: 'deadline reached' },
  ]
  return <div className="booking-diagram-scroll" role="region" aria-label="SeatHold lifecycle diagram; scroll horizontally on small screens" tabIndex={0}>
    <svg className="booking-diagram" viewBox="0 0 828 350" role="img" aria-labelledby={`${uid}-lifecycle-title ${uid}-lifecycle-desc`}>
      <title id={`${uid}-lifecycle-title`}>SeatHold lifecycle: current state is {phase}</title>
      <desc id={`${uid}-lifecycle-desc`}>Free becomes held on reservation. Only the current owner and token may confirm a live hold. A deadline makes held become expired. The owner may cancel a live hold back to free. An expired seat can be reserved again with a new token. Confirmed is terminal in this simulation.</desc>
      <ArrowMarker id={`${uid}-lld-arrow`} />
      <g className="booking-edges" markerEnd={`url(#${uid}-lld-arrow)`}>
        <path d="M180 150 H312" />
        <path d="M452 140 H535 V67 H623" />
        <path d="M452 163 H563 V253 H623" />
        <path d="M312 168 H250 V250 H110 V182" />
        <path className="is-advisory" d="M623 279 H504 V205 H412 V182" />
      </g>
      <text className="booking-svg-label" x="202" y="135">reserve · 6s</text>
      <text className="booking-svg-label" x="429" y="48">confirm · guarded</text>
      <text className="booking-svg-label" x="586" y="201">clock ≥ deadline</text>
      <text className="booking-svg-label" x="76" y="279">cancel · owner + token</text>
      <text className="booking-svg-label" x="461" y="317">reserve again · new token</text>
      {nodes.map((node) => <g key={node.phase} className={`booking-svg-node ${phase === node.phase ? node.phase === 'confirmed' ? 'is-verified is-current' : 'is-active is-current' : ''}`}>
        <rect x={node.x} y={node.y} width={node.phase === 'confirmed' || node.phase === 'expired' ? 150 : 140} height="64" rx="5" />
        <text className="booking-svg-title" x={node.x + 15} y={node.y + 27}>{node.phase}{phase === node.phase ? ' •' : ''}</text>
        <text className="booking-svg-label" x={node.x + 15} y={node.y + 49}>{node.caption}</text>
      </g>)}
    </svg>
  </div>
}

function LldLens({ state, dispatch, uid, actor, setActor }: LensProps & { actor: BookingOwner; setActor: (owner: BookingOwner) => void }) {
  const seat = state.seats.A7
  const phase = holdPhase(seat, state.now)
  return <div className="booking-lens-layout">
    <div className="booking-canvas">
      <div className="booking-canvas-heading"><span className="booking-kicker">02 / OBJECT BOUNDARY</span><h3>The hold owns its transition rules.</h3><p>One SeatHold, not two client beliefs. Its owner, token and deadline are part of the contract.</p></div>
      <LifecycleDiagram phase={phase} uid={uid} />
      <div className="booking-object">
        <div className="booking-object-heading"><span>SeatHold</span><strong>A7</strong><span className={`booking-state-label is-${phase}`}>{phase}</span></div>
        <dl className="booking-object-fields">
          <div><dt>{phase === 'expired' ? 'Previous owner' : 'Owner'}</dt><dd>{seat.owner ?? 'none'}</dd></div>
          <div><dt>Hold token</dt><dd>{seat.holdId ?? 'none'}</dd></div>
          <div><dt>Deadline</dt><dd>{phase === 'confirmed' ? 'not expiring' : seat.expiresAt === null ? 'none' : `t+${seat.expiresAt}s`}</dd></div>
          <div><dt>Row revision</dt><dd>v{seat.revision}</dd></div>
        </dl>
        {phase === 'expired' && seat.phase === 'held' && <p className="booking-object-note">Logically expired; the row still says held until cleanup. Guards use the deadline now, not the collector’s schedule.</p>}
      </div>
      <p className="booking-canvas-note">Each guarded transition is atomic at the same writer. Confirmed bookings are terminal here; refunds and cancellation of confirmed bookings are outside this case.</p>
    </div>
    <aside className="booking-inspector" aria-label="SeatHold actions">
      <label className="booking-field-label" htmlFor={`${uid}-actor`}>Act as</label>
      <select id={`${uid}-actor`} value={actor} onChange={(event) => setActor(event.target.value as BookingOwner)}>
        <option value="Maya">Maya</option><option value="Leo">Leo</option>
      </select>
      <p className="booking-small">Target: A7 / {seat.holdId ?? 'no token'}. Try another identity against this token to test the owner guard.</p>
      <div className="booking-action-stack">
        <button type="button" className="booking-button booking-button-primary" onClick={() => dispatch({ type: 'reserve', owner: actor })}>Reserve A7 · {HOLD_SECONDS}s</button>
        <button type="button" className="booking-button" onClick={() => dispatch({ type: 'confirm', owner: actor, holdId: seat.holdId })}>Confirm as {actor}</button>
        <button type="button" className="booking-button" onClick={() => dispatch({ type: 'cancel', owner: actor, holdId: seat.holdId })}>Cancel hold as {actor}</button>
      </div>
      <p className="booking-small">These object actions always use the guarded writer, even when the HLD replay uses naive writes.</p>
      <div className="booking-rule">
        <h4>Before confirm or cancel</h4>
        <pre><code>{'state == held\nowner == actor\ntoken == currentToken\nclock < expiresAt'}</code></pre>
        <p>All checks and the transition happen together. Rejection adds evidence, not a state change.</p>
      </div>
      <div className="booking-try"><span className="booking-kicker">TRY THIS</span><p>Reserve as Maya. Try confirming as Leo. Then advance beyond the deadline and try Maya again.</p></div>
    </aside>
  </div>
}

function HeapDiagram({ state, uid }: Pick<LensProps, 'state' | 'uid'>) {
  const visible = state.heap.slice(0, 7)
  const position = (index: number) => {
    const level = Math.floor(Math.log2(index + 1))
    return { x: 828 * (index - (2 ** level - 1) + 0.5) / 2 ** level, y: 54 + level * 98 }
  }
  return <>
    <div className="booking-diagram-scroll" role="region" aria-label="Expiration min-heap diagram; scroll horizontally on small screens" tabIndex={0}>
      <svg className="booking-diagram booking-heap-diagram" viewBox="0 0 828 304" role="img" aria-labelledby={`${uid}-heap-title ${uid}-heap-desc`}>
        <title id={`${uid}-heap-title`}>Actual expiration min-heap, {state.heap.length} entries</title>
        <desc id={`${uid}-heap-desc`}>{state.heap.length ? `Root is ${state.heap[0].seatId}, ${state.heap[0].holdId}, due at t+${state.heap[0].expiresAt} seconds. Parents expire no later than their children. The backing array below lists every entry.` : 'The heap is empty.'}</desc>
        <g className="booking-edges">{visible.map((entry, index) => {
          if (index === 0) return null
          const parent = position(Math.floor((index - 1) / 2))
          const child = position(index)
          return <path key={entry.holdId} d={`M${parent.x} ${parent.y + 28} L${child.x} ${child.y - 28}`} />
        })}</g>
        {visible.map((entry, index) => {
          const pos = position(index)
          const due = entry.expiresAt <= state.now
          return <g key={entry.holdId} className={`booking-svg-node booking-heap-node ${due ? 'is-active' : ''} ${index === 0 ? 'is-current' : ''}`}>
            <rect x={pos.x - 67} y={pos.y - 29} width="134" height="58" rx="5" />
            <text className="booking-svg-title" textAnchor="middle" x={pos.x} y={pos.y - 3}>t+{entry.expiresAt}s {due ? '· due' : ''}</text>
            <text textAnchor="middle" x={pos.x} y={pos.y + 18}>{entry.seatId} / {entry.holdId}</text>
            <text className="booking-svg-index" textAnchor="end" x={pos.x - 76} y={pos.y + 4}>[{index}]</text>
          </g>
        })}
        {!visible.length && <g><text className="booking-svg-title" x="414" y="132" textAnchor="middle">Nothing left to expire.</text><text x="414" y="160" textAnchor="middle">Reserve a new hold in LLD, or reset the case.</text></g>}
      </svg>
    </div>
    <div className="booking-heap-array">
      <h4>Backing array <span>heap order ≠ sorted order{state.heap.length > 7 ? ` · tree shows top 7 of ${state.heap.length}` : ''}</span></h4>
      {state.heap.length ? <ol aria-label="All heap entries in backing array order; scroll horizontally to inspect more" tabIndex={0}>
        {state.heap.map((entry, index) => <li key={entry.holdId} className={entry.expiresAt <= state.now ? 'is-due' : ''}><small>index {index}</small><strong>t+{entry.expiresAt}s</strong><span>{entry.seatId} / {entry.holdId}</span></li>)}
      </ol> : <p className="booking-small">Empty array []</p>}
    </div>
  </>
}

function DsaLens({ state, dispatch, uid, changeLens }: LensProps & { changeLens: (lens: Lens) => void }) {
  const root = state.heap[0]
  const due = root && root.expiresAt <= state.now
  return <div className="booking-lens-layout">
    <div className="booking-canvas">
      <div className="booking-canvas-heading"><span className="booking-kicker">03 / ALGORITHM BOUNDARY</span><h3>Expire the hold, not just the seat.</h3><p>Earliest deadline at the root. Equal deadlines use insertion order. Stale timer entries are expected.</p></div>
      <HeapDiagram state={state} uid={uid} />
      <div className="booking-table-scroll" role="region" aria-label="Authoritative seat table; scroll horizontally on small screens" tabIndex={0}>
        <table className="booking-seat-table">
          <caption>The same authoritative rows · logical state at t+{state.now}s</caption>
          <thead><tr><th scope="col">Seat</th><th scope="col">Owner / token</th><th scope="col">State</th><th scope="col">Deadline</th></tr></thead>
          <tbody>{BOOKING_SEATS.map((seatId) => {
            const seat = state.seats[seatId]
            const phase = holdPhase(seat, state.now)
            return <tr key={seatId} className={seatId === 'A7' ? 'is-focus-seat' : ''}><th scope="row">{seatId}{seatId === 'A7' && <small>our seat</small>}</th><td>{seat.owner ? `${seat.owner} / ${seat.holdId}` : 'none'}{phase === 'expired' && <small>previous hold</small>}</td><td><span className={`booking-state-label is-${phase}`}>{phase}</span></td><td>{phase === 'confirmed' ? 'not expiring' : seat.expiresAt === null ? '—' : `t+${seat.expiresAt}s`}</td></tr>
          })}</tbody>
        </table>
      </div>
    </div>
    <aside className="booking-inspector" aria-label="Heap collector controls">
      <span className="booking-kicker">EXPIRATION WORKER</span><h4>One entry at a time.</h4>
      <p className="booking-small">The clock is t+{state.now}s. {root ? `The next deadline is t+${root.expiresAt}s.` : 'The queue is empty.'}</p>
      <div className="booking-action-stack">
        <button type="button" className="booking-button" disabled={!root} onClick={() => dispatch({ type: 'peek-expiry' })}>1 · Peek minimum <span>O(1)</span></button>
        <button type="button" className="booking-button booking-button-primary" disabled={!due} onClick={() => dispatch({ type: 'pop-expiry' })}>2 · Pop one due entry <span>O(log n)</span></button>
        {root && !due && <button type="button" className="booking-text-button" onClick={() => dispatch({ type: 'advance', seconds: root.expiresAt - state.now })}>Advance clock to t+{root.expiresAt}s →</button>}
      </div>
      {state.heapResult && <div className="booking-heap-receipt"><span className="booking-kicker">LAST {state.heapResult.operation.toUpperCase()}</span><p>{state.heapResult.detail}</p></div>}
      <div className="booking-rule"><h4>The stale-entry guard</h4><pre><code>{'entry = heap.peek()\nif entry.due > clock: wait\nheap.pop()\nif row.token == entry.token\n  && row.state == held\n  && row.deadline == entry.due:\n    expire(row)'}</code></pre><p>The guard and update are atomic. An old token cannot expire a new hold or a confirmed booking.</p></div>
      <div className="booking-try"><span className="booking-kicker">TRY THIS</span><p>In LLD, cancel and reserve again, or confirm A7. Then pop its old entry here.</p><button type="button" className="booking-text-button" onClick={() => changeLens('lld')}>Inspect A7 in LLD →</button></div>
    </aside>
  </div>
}

export default function BookingWorkbench({ onPractice }: BookingWorkbenchProps = {}) {
  const [state, dispatch] = useReducer(bookingReducer, undefined, () => createBookingState())
  const [lens, setLens] = useState<Lens>('hld')
  const [actor, setActor] = useState<BookingOwner>('Maya')
  const [prediction, setPrediction] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [fullTrace, setFullTrace] = useState(false)
  const uid = `booking-${useId().replace(/:/g, '')}`
  const tabRefs = useRef<Partial<Record<Lens, HTMLButtonElement | null>>>({})
  const seat = state.seats.A7
  const phase = holdPhase(seat, state.now)
  const invariant = bookingInvariant(state)
  const claims = liveClaims(state, 'A7')
  const latest = state.timeline[state.timeline.length - 1]
  const changeLens = (next: Lens) => { setLens(next); tabRefs.current[next]?.focus({ preventScroll: true }) }
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, current: Lens) => {
    const index = lenses.findIndex((item) => item.id === current)
    const next = event.key === 'ArrowRight' ? (index + 1) % lenses.length
      : event.key === 'ArrowLeft' ? (index + lenses.length - 1) % lenses.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? lenses.length - 1 : -1
    if (next >= 0) { event.preventDefault(); changeLens(lenses[next].id) }
  }
  const reset = () => { dispatch({ type: 'reset' }); setActor('Maya'); setPrediction(''); setRevealed(false); setFullTrace(false) }
  return <section className="booking-workbench" aria-labelledby={`${uid}-title`}>
    <header className="booking-header">
      <div><span className="booking-kicker">ONE INCIDENT · THREE LENSES</span><h2 id={`${uid}-title`}>Two people booked<br className="booking-title-break" /> the same seat. <em>Why?</em></h2><p>Follow one reservation from system boundary to object rule to algorithm. Change the lens, not the evidence.</p></div>
      <div className="booking-case-mark" aria-hidden="true"><svg viewBox="0 0 80 90"><path d="M20 50V19Q20 12 27 12H53Q60 12 60 19V50M14 40V66H66V40M24 66V78M56 66V78M14 54H66" /><text x="40" y="39" textAnchor="middle">A7</text></svg><span>CASE 001</span></div>
    </header>
    <div className="booking-shared-bar">
      <div className="booking-live-seat"><span className="booking-seat-id">A7</span><div><strong>{phase === 'free' ? 'Available' : phase === 'expired' ? 'Hold expired' : `${phase === 'confirmed' ? 'Confirmed' : 'Held'} for ${seat.owner}`}</strong><small>{seat.holdId ?? 'No current token'} · writer v{seat.revision}</small></div></div>
      <div className="booking-clock"><span><small>LOGICAL CLOCK</small><strong>t+{state.now}<small>s</small></strong></span><button type="button" className="booking-button" onClick={() => dispatch({ type: 'advance', seconds: 1 })} aria-label="Advance shared logical clock by one second">+1s</button><button type="button" className="booking-button" onClick={() => dispatch({ type: 'advance', seconds: 5 })} aria-label="Advance shared logical clock by five seconds">+5s</button></div>
      <button type="button" className="booking-text-button booking-reset" onClick={reset}>↺ Reset case</button>
    </div>
    <div className={`booking-invariant ${invariant.ok ? 'is-verified' : 'is-conflict'}`}>
      <span className="booking-invariant-icon" aria-hidden="true">{invariant.ok ? '✓' : '!'}</span><div><strong>{invariant.ok ? 'Invariant verified' : 'Invariant broken'}</strong><p>{invariant.detail}</p></div><span className="booking-promise-count">{claims.length} live A7 promise{claims.length === 1 ? '' : 's'}</span>
    </div>
    <div className="booking-tabs" role="tablist" aria-label="Lenses on the same booking scenario">
      {lenses.map((item) => <button type="button" role="tab" key={item.id} id={`${uid}-tab-${item.id}`} aria-controls={`${uid}-panel-${item.id}`} aria-selected={lens === item.id} tabIndex={lens === item.id ? 0 : -1} ref={(node) => { tabRefs.current[item.id] = node }} onKeyDown={(event) => handleTabKey(event, item.id)} onClick={() => setLens(item.id)}>
        <span className="booking-lens-abbr">{item.label}</span><span><strong>{item.name}</strong><small>{item.question}</small></span>
      </button>)}
    </div>
    {lenses.map((item) => <div key={item.id} id={`${uid}-panel-${item.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${item.id}`} hidden={lens !== item.id} tabIndex={0} className="booking-tabpanel">
      {lens === item.id && (item.id === 'hld'
        ? <HldLens state={state} dispatch={dispatch} uid={uid} prediction={prediction} setPrediction={setPrediction} revealed={revealed} setRevealed={setRevealed} />
        : item.id === 'lld'
          ? <LldLens state={state} dispatch={dispatch} uid={uid} actor={actor} setActor={setActor} />
          : <DsaLens state={state} dispatch={dispatch} uid={uid} changeLens={changeLens} />)}
    </div>)}
    <div className={`booking-latest is-${latest.tone}`} role="status" aria-live="polite" aria-atomic="true"><span className="booking-kicker">LATEST EVENT · {latest.lens} · t+{latest.at}s</span><strong>{latest.title}</strong><p>{latest.detail}</p></div>
    <section className="booking-trace" aria-labelledby={`${uid}-trace-title`}>
      <div className="booking-trace-heading"><div><span className="booking-kicker">THE EVIDENCE</span><h3 id={`${uid}-trace-title`}>One shared timeline.</h3></div><button type="button" className="booking-text-button" onClick={() => setFullTrace(!fullTrace)} aria-expanded={fullTrace} aria-controls={`${uid}-trace`}>{fullTrace ? 'Show recent events' : `Show full trace (${state.timeline.length})`}</button></div>
      <ol id={`${uid}-trace`} className="booking-events" aria-label="Booking events in execution order">
        {(fullTrace ? state.timeline : state.timeline.slice(-5)).map((event) => <li key={event.id} className={`is-${event.tone}`}><span className="booking-event-number" aria-label={`Event ${event.id}`}>{String(event.id).padStart(2, '0')}</span><span className="booking-event-meta">t+{event.at}s<small>{event.lens}</small></span><div><strong>{event.title}</strong><p>{event.detail}</p></div></li>)}
      </ol>
      {state.nextEvent > 81 && <p className="booking-small">Keeping the latest 80 events. Reset to replay from the beginning.</p>}
    </section>
    <footer className="booking-footer"><p><strong>The connection:</strong> HLD chooses the authority. LLD protects the transition. DSA schedules cleanup without bypassing either.</p>{onPractice && <button type="button" className="booking-button" onClick={onPractice}>Take it into practice <span aria-hidden="true">→</span></button>}</footer>
  </section>
}
