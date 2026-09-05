import { useId, useState, type ReactNode } from 'react'
import {
  changeResponsibilities, initialResponsibilities, changeParking, initialParking,
  changeVending, initialVending, changeRefactor, initialRefactor,
  changeConstruction, initialConstruction, changeBehavior, initialBehavior,
  changeWrappers, initialWrappers, changeAuction, initialAuction,
  changeReservation, initialReservation, changeQueue, initialQueue,
  changeSplit, initialSplit, changeCapstone, initialCapstone,
  type ExperimentResult, type ExperimentCheck, type ResponsibilityState, type ParkingState,
  type VendingState, type RefactorState, type ConstructionState, type BehaviorState,
  type WrapperState, type AuctionState, type ReservationState, type QueueState,
  type SplitState, type CapstoneState, type Architecture, type ChangePressure,
  type NotificationConfig, type ProviderCandidate,
} from '../../data/lldExperimentEngine'
import './lld-experiments.css'

type ObjectView = { name: string; value: string; note?: string; keys?: string[] }
type Observation = Omit<ExperimentResult<unknown>, 'state'> & { before: ObjectView[]; after: ObjectView[] }
type NotebookLab = { objects: ObjectView[]; observation: Observation | null; reset: () => void }
type LessonProps = { onExperiment: () => void }

function useExperiment<S, A>(
  create: () => S,
  transition: (state: S, action: A) => ExperimentResult<S>,
  inspect: (state: S) => ObjectView[],
  onExperiment: () => void,
) {
  const [state, setState] = useState(create)
  const [observation, setObservation] = useState<Observation | null>(null)
  const run = (action: A) => {
    const next = transition(state, action)
    setObservation({ ...next, before: inspect(state), after: inspect(next.state) })
    setState(next.state)
    // A tested action (including a rejected hypothesis) is exploration, never mastery.
    onExperiment()
  }
  const reset = () => { setState(create()); setObservation(null) }
  return { state, run, objects: inspect(state), observation, reset }
}

function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return <label className="lld-exp-field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="lld-exp-toggle"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span>{label}</span></label>
}

function Action({ children, onClick, subtle = false }: { children: ReactNode; onClick: () => void; subtle?: boolean }) {
  return <button type="button" className={subtle ? 'lld-exp-action lld-exp-action-secondary' : 'lld-exp-action'} onClick={onClick}>{children}</button>
}

function Checks({ checks }: { checks: ExperimentCheck[] }) {
  if (!checks.length) return <p className="lld-exp-muted">No contract checks run yet. Execute a candidate to inspect actual outputs.</p>
  return <div className="lld-exp-checks" aria-label="Executable contract test results">{checks.map(test => <details key={test.name} className={`lld-exp-check ${test.pass ? 'lld-exp-pass' : 'lld-exp-illegal'}`}>
    <summary><span aria-hidden="true">{test.pass ? '✓' : '×'}</span> {test.name}<span>{test.pass ? 'PASS' : 'FAIL'}</span></summary>
    <dl><dt>Expected</dt><dd><code>{test.expected}</code></dd><dt>Actual</dt><dd><code>{test.actual}</code></dd></dl>
  </details>)}</div>
}

function Notebook({ number, title, question, tryThis, lab, children, code, extra }: {
  number: number; title: string; question: string; tryThis: string; lab: NotebookLab; children: ReactNode; code: string; extra?: ReactNode
}) {
  const id = useId()
  const observation = lab.observation
  const status = !observation ? 'current' : !observation.allowed ? observation.warning ? 'current' : 'illegal' : observation.warning ? 'current' : 'pass'
  const statusLabel = !observation ? 'Ready to experiment' : !observation.allowed ? observation.warning ? 'Waiting / guarded' : 'Rejected / illegal' : observation.warning ? 'Accepted · caveat' : 'Accepted / pass'
  const before = observation?.before ?? lab.objects
  const after = observation?.after ?? lab.objects
  const objects = [...new Set([...after.map(object => object.name), ...before.map(object => object.name)])]
  return <section className="lld-exp" aria-labelledby={`${id}-title`}>
    <header className="lld-exp-heading">
      <div><span className="lld-exp-eyebrow">LLD LAB / {String(number).padStart(2, '0')} · RUN IT, THEN EXPLAIN IT</span><h3 id={`${id}-title`}>{title}</h3></div>
      <button type="button" className="lld-exp-reset" onClick={lab.reset}>Reset model</button>
    </header>
    <p className="lld-exp-question">{question}</p>
    <div className="lld-exp-layout">
      <div className="lld-exp-controls">
        <p className="lld-exp-try"><strong>Try this</strong>{tryThis}</p>
        {children}
        <details className="lld-exp-pseudocode"><summary>Read the core rule · pseudocode</summary><pre tabIndex={0}><code>{code}</code></pre></details>
      </div>
      <div className="lld-exp-workspace">
        <div className={`lld-exp-outcome lld-exp-${status}`} role="status" aria-live="polite" aria-atomic="true">
          <strong>{statusLabel}</strong>
          <p>{observation?.why ?? 'Predict a result, then run an action. The inspector records the actual before / after state and the rule that decided it.'}</p>
        </div>
        <div className="lld-exp-inspector-label"><span>Object state</span><span>{observation ? 'Before → after latest action' : 'Initial snapshot'}</span></div>
        <div className="lld-exp-object-grid">
          {objects.map(name => {
            const prior = before.find(object => object.name === name)
            const next = after.find(object => object.name === name)
            const keys = next?.keys ?? prior?.keys ?? [name]
            const affected = observation?.affected.some(key => keys.includes(key))
            const changed = prior?.value !== next?.value
            return <article key={name} className={`lld-exp-object ${affected ? `lld-exp-object-${status}` : ''}`}>
              <header><h4>{name}</h4>{affected && <span className="lld-exp-object-tag">{changed ? 'changed' : observation?.allowed ? 'checked' : 'guarded'}</span>}</header>
              {observation && <div className="lld-exp-value lld-exp-before"><span>BEFORE</span><code>{prior?.value ?? 'not constructed'}</code></div>}
              <div className="lld-exp-value"><span>{observation ? 'AFTER' : 'NOW'}</span><code>{next?.value ?? 'removed'}</code></div>
              {(next?.note ?? prior?.note) && <p>{next?.note ?? prior?.note}</p>}
              {affected && <small className="lld-exp-object-rule">{changed ? observation?.allowed ? 'Updated by this action.' : 'Visible effects of the rejected attempt are shown.' : 'No value changed.'} {observation?.why}</small>}
            </article>
          })}
        </div>
        {!!observation?.trace.length && <details className="lld-exp-trace" open><summary>Call sequence · {observation.trace.length} steps</summary><ol>{observation.trace.map((entry, i) => <li key={`${i}-${entry}`}><code>{entry}</code></li>)}</ol></details>}
        {extra}
      </div>
    </div>
    <footer className="lld-exp-footnote">Deterministic local model · no network or real money · actions record exploration, not mastery.</footer>
  </section>
}

function inspectResponsibilities(s: ResponsibilityState): ObjectView[] {
  const source = s.pressure === 'payment' ? 'VendorSDK' : s.pressure === 'discount' ? s.architecture === 'ports' ? 'DiscountPolicy' : 'PricingRules' : 'MailSDK'
  return [
    { name: 'Checkout', value: `${s.architecture === 'ports' ? 'depends on ports' : 'depends on concrete APIs'}\n${s.edited.includes('Checkout') ? `source edited · run ${s.revision}` : 'source unchanged'}`, note: 'Orchestrates a purchase; policy variation need not change orchestration.' },
    { name: 'Implementation sources', value: s.edited.length ? s.edited.join('\n') : 'no change applied', keys: [source, 'PaymentAdapter', 'DiscountPolicy', 'EmailAdapter'], note: 'These source edits follow the explicitly modeled change, not a measured repository diff.' },
    { name: 'Caller review scope', value: s.reviewed.length ? s.reviewed.join('\n') : 'none yet', keys: ['ReceiptUI', 'RetryJob', 'CompositionRoot'], note: 'Reverse-import reachability suggests review, not necessarily source edits or bugs.' },
    { name: 'CompositionRoot', value: s.architecture === 'ports' ? 'injects adapter + policy + notifier\nport signatures remain unchanged' : 'Checkout constructs dependencies', note: 'DIP separates high-level callers from concrete implementations.' },
  ]
}

function Responsibilities({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialResponsibilities, changeResponsibilities, inspectResponsibilities, onExperiment)
  const [architecture, setArchitecture] = useState<Architecture>('concrete')
  const [pressure, setPressure] = useState<ChangePressure>('payment')
  return <Notebook number={1} title="Follow a change through the object graph" question="If a provider API changes but the checkout contract does not, who really needs to change?"
    tryThis="Apply a payment change with concrete dependencies. Apply the same change through stable ports; compare edits with review scope."
    lab={lab} code={'Checkout(PaymentPort, PricingPort, NotificationPort)\nchanged = concrete sources needing edits\nreview = reverseImportClosure(changed) − changed\n// Stable ports do not import their implementations.'}
    extra={<details className="lld-exp-trace"><summary>Inspect modeled import edges</summary><pre tabIndex={0}><code>{lab.state.edges.map(([from, to]) => `${from} → ${to}`).join('\n')}</code></pre></details>}>
    <Field label="Dependency design"><select value={architecture} onChange={e => setArchitecture(e.target.value as Architecture)}><option value="concrete">Concrete dependencies</option><option value="ports">Responsibilities behind ports</option></select></Field>
    <Field label="Incoming change"><select value={pressure} onChange={e => setPressure(e.target.value as ChangePressure)}><option value="payment">Payment vendor renames its API</option><option value="discount">Discount calculation changes</option><option value="notification">Email SDK changes its payload</option></select></Field>
    <Action onClick={() => lab.run({ architecture, pressure })}>Apply change & trace callers</Action>
    <p className="lld-exp-note">Assumption: the public port contract remains compatible. A breaking port change would propagate to callers too. Indirection is useful at a real source of change—not everywhere.</p>
  </Notebook>
}

function inspectParking(s: ParkingState): ObjectView[] {
  return [
    { name: 'CAR-7', value: `id = ${s.vehicle.id}\nsize = ${s.vehicle.size}\npermit = ${s.vehicle.permit}\nrequires charge = ${s.vehicle.needsCharge}`, note: 'Entity identity survives value replacement and spot deletion.' },
    { name: 'P-17', value: s.spot ? `size ≤ ${s.spot.maxSize}\naccessible = ${s.spot.accessible}\ncharger = ${s.spot.charger}\nallocation = ${s.spot.occupant ?? 'none'}` : 'deleted', note: 'Spot composes its 0..1 allocation; the allocation only references a vehicle.' },
  ]
}
function Objects({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialParking, changeParking, inspectParking, onExperiment)
  const [size, setSize] = useState('2')
  const [permit, setPermit] = useState(false)
  const [needsCharge, setNeedsCharge] = useState(false)
  return <Notebook number={2} title="Identity is not a bag of mutable fields" question="Can a vehicle change without becoming a different entity—or breaking its active parking allocation?"
    tryThis="Park without a permit, then add one and park. While parked, try size 3 or remove the permit. Finally leave and delete the spot."
    lab={lab} code={'Size.create(n): require integer 1 ≤ n ≤ 3\nSpot.park(car): require empty AND fits(car)\nVehicle.replace(values):\n  require activeAllocation?.stillAccepts(values)\n  keep id; replace immutable values'}>
    <Field label="Vehicle size (1 compact / 2 standard / 3 van)" help="Enter 0 to test the value-object constructor."><input type="number" value={size} onChange={e => setSize(e.target.value)} /></Field>
    <Toggle label="Has accessibility permit" checked={permit} onChange={setPermit} />
    <Toggle label="Needs an EV charger" checked={needsCharge} onChange={setNeedsCharge} />
    <Action onClick={() => lab.run({ type: 'replace', size: Number(size), permit, needsCharge })}>Replace vehicle values</Action>
    <div className="lld-exp-actions"><Action onClick={() => lab.run({ type: 'park' })}>Park CAR-7</Action><Action subtle onClick={() => lab.run({ type: 'leave' })}>Leave spot</Action><Action subtle onClick={() => lab.run({ type: 'delete' })}>Delete P-17</Action></div>
    <p className="lld-exp-note">This spot is standard-size, permit-only, and has no charger. Compatibility belongs at the allocation boundary, not in UI-only validation.</p>
  </Notebook>
}

function inspectVending(s: VendingState): ObjectView[] {
  return [
    { name: 'Machine', value: `state = ${s.phase}`, note: 'Idle → Collecting → Ready → Idle. Cancel returns to Idle.' },
    { name: 'CoinEscrow', value: `${s.credit}¢ refundable`, note: 'Original coins can be returned on cancellation.' },
    { name: 'Inventory', value: `${s.stock} products\nprice = 150¢`, note: 'Selection checks stock; only dispense consumes it.' },
    { name: 'ChangeFloat', value: `${s.float}¢ in 50¢ coins`, note: 'This model keeps change coins separate from accepted escrow.' },
    { name: 'Cashbox', value: `${s.cashbox}¢ accepted coins\nsales revenue = ${s.dispensed * 150}¢`, note: 'Cashbox counts gross inserted coins; the float funds change.' },
    { name: 'Customer', value: `${s.dispensed} products received\n${s.returned}¢ returned`, note: 'Returned money includes both refunds and purchase change.' },
  ]
}
function Vending({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialVending, changeVending, inspectVending, onExperiment)
  return <Notebook number={3} title="Make the sequence obey the state machine" question="Does a happy-looking sequence still work when stock or change is missing?"
    tryThis="Insert 200¢ and select: change is missing. Cancel, load change, then retry. After two sales, try buying a depleted product."
    lab={lab} code={'select(): require stock > 0\n  require credit ≥ price AND float ≥ credit − price\n  state = Ready\ndispense(): require state == Ready\n  atomically move escrow; pay change; stock−−\ncancel(): refund escrow; state = Idle'}>
    <div className="lld-exp-state-strip" aria-label="Vending lifecycle">{(['Idle', 'Collecting', 'Ready'] as const).map(phase => <span key={phase} className={lab.state.phase === phase ? 'lld-exp-state-active' : ''}>{phase}</span>)}</div>
    <div className="lld-exp-actions">{[50, 100, 200].map(cents => <Action key={cents} onClick={() => lab.run({ type: 'insert', cents })}>Insert {cents}¢</Action>)}</div>
    <div className="lld-exp-actions"><Action onClick={() => lab.run({ type: 'select' })}>Select product</Action><Action onClick={() => lab.run({ type: 'dispense' })}>Dispense</Action><Action subtle onClick={() => lab.run({ type: 'cancel' })}>Cancel / refund</Action></div>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">Maintenance · only in Idle</span><div className="lld-exp-actions"><Action subtle onClick={() => lab.run({ type: 'change' })}>Load 50¢ change</Action><Action subtle onClick={() => lab.run({ type: 'restock' })}>Restock one</Action></div></div>
  </Notebook>
}

function inspectRefactor(s: RefactorState): ObjectView[] {
  return [
    { name: 'TaskManager', value: `committed = ${s.stage}`, note: 'A rejected candidate never replaces the committed implementation.' },
    { name: 'PriorityOrder', value: s.stage === 'legacy' ? 'sorting inline' : 'extracted stable comparator', note: 'Equal-priority tasks preserve insertion order.' },
    { name: 'Scheduler', value: s.stage === 'scheduler-extracted' ? 'recurrence calculation extracted' : 'recurrence calculation inline', note: 'Next due day = due day + repeat interval.' },
    { name: 'CharacterizationSuite', value: `baseline = ${s.characterized ? 'captured' : 'missing'}\ncandidate = ${s.candidate}\n${s.checks.filter(c => c.pass).length}/${s.checks.length} checks pass`, note: 'Results below are computed by running real candidate functions.' },
  ]
}
function Refactoring({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialRefactor, changeRefactor, inspectRefactor, onExperiment)
  return <Notebook number={4} title="Earn each safe refactoring step" question="Can you improve the task manager without quietly changing its tie-breaking behavior?"
    tryThis="Try extracting before capturing tests. Then run the baseline, extract sorting, inject an unsafe tie-break, and inspect its failing case."
    lab={lab} code={'baseline = golden cases of existing outputs\ncandidate = one small extraction\nif every(case.output(candidate) == case.expected):\n  commit(candidate)\nelse:\n  discard candidate; keep previous implementation'}
    extra={<Checks checks={lab.state.checks} />}>
    <div className="lld-exp-actions lld-exp-actions-stack"><Action onClick={() => lab.run('test')}>1. Run characterization tests</Action><Action onClick={() => lab.run('extract-sort')}>2. Extract priority ordering</Action><Action onClick={() => lab.run('extract-scheduler')}>3. Extract recurring scheduler</Action><Action subtle onClick={() => lab.run('unsafe-tie')}>Try alphabetical tie-breaking</Action></div>
    <p className="lld-exp-note">The last option looks tidy but changes stable insertion ordering. A behavior change may be valid product work; it is not a behavior-preserving refactor.</p>
  </Notebook>
}

function inspectConstruction(s: ConstructionState): ObjectView[] {
  return [
    { name: 'CompositionRoot', value: s.graph ? `published build ${s.graph.build}\n${s.graph.config.environment} · ${s.graph.config.timeout}ms` : 'nothing published', note: 'Validate and assemble before exposing a new graph.' },
    { name: 'ProviderClient', value: s.graph?.client ?? 'not constructed', note: 'One compatible client and signer family is selected centrally.' },
    { name: 'Signer', value: s.graph?.signer ?? 'not constructed', note: 'Fixture credentials only; never enter real secrets.' },
    { name: 'NotificationService', value: `injected = ${Boolean(s.graph)}\nlocal deliveries = ${s.sent}`, note: 'Business behavior depends on the injected client, not configuration switches.' },
  ]
}
function Construction({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialConstruction, changeConstruction, inspectConstruction, onExperiment)
  const [environment, setEnvironment] = useState<NotificationConfig['environment']>('test')
  const [family, setFamily] = useState<NotificationConfig['family']>('sandbox')
  const [credential, setCredential] = useState<NotificationConfig['credential']>('none')
  const [channel, setChannel] = useState<NotificationConfig['channel']>('email')
  const [timeout, setTimeoutValue] = useState('1000')
  return <Notebook number={5} title="Build a graph that cannot be half valid" question="Who should decide which provider client and signer are compatible?"
    tryThis="Build without credentials. Add test-token, build and send. Switch only the environment to production and rebuild: the existing graph must survive."
    lab={lab} code={'config = Builder.validate(allFields)\nfamily = AbstractFactory.for(config)\nclient, signer = family.createMatchedPair()\nservice = new NotificationService(client, signer)\nCompositionRoot.publish(service) // only after success'}>
    <div className="lld-exp-form-grid">
      <Field label="Environment"><select value={environment} onChange={e => setEnvironment(e.target.value as NotificationConfig['environment'])}><option value="test">Test</option><option value="production">Production</option></select></Field>
      <Field label="Provider family"><select value={family} onChange={e => setFamily(e.target.value as NotificationConfig['family'])}><option value="sandbox">Sandbox</option><option value="live">Live</option></select></Field>
      <Field label="Credential fixture"><select value={credential} onChange={e => setCredential(e.target.value as NotificationConfig['credential'])}><option value="none">None</option><option value="test-token">test-token</option><option value="live-token">live-token</option></select></Field>
      <Field label="Notification channel"><select value={channel} onChange={e => setChannel(e.target.value as NotificationConfig['channel'])}><option value="email">Email</option><option value="sms">SMS</option></select></Field>
    </div>
    <Field label="Client timeout (ms)"><input type="number" value={timeout} onChange={e => setTimeoutValue(e.target.value)} /></Field>
    <div className="lld-exp-actions"><Action onClick={() => lab.run({ type: 'build', config: { environment, family, credential, channel, timeout: Number(timeout) } })}>Validate & build graph</Action><Action subtle onClick={() => lab.run({ type: 'send' })}>Send local notification</Action></div>
  </Notebook>
}

function inspectBehavior(s: BehaviorState): ObjectView[] {
  return [
    { name: 'PricingPolicy', value: `${s.strategy}\n${s.hours}h → ${s.quote}¢`, note: 'Hourly: 200¢/h. Weekend: 150¢/h, capped at 600¢ for 1–24h.' },
    { name: 'Document', value: `${s.document}\nrevision = ${s.revision}`, note: 'Draft permits edits; Review permits withdraw/publish; Published is terminal in this model.' },
  ]
}
function Behaviors({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialBehavior, changeBehavior, inspectBehavior, onExperiment)
  const [strategy, setStrategy] = useState<BehaviorState['strategy']>('hourly')
  const [hours, setHours] = useState('4')
  return <Notebook number={6} title="Swap the algorithm—not the lifecycle" question="Why can a caller choose weekend pricing but not simply choose Published?"
    tryThis="Quote four hours under both strategies. Publish a Draft to hit a guard, submit it, then try editing while under Review."
    lab={lab} code={'quote = selectedPricingStrategy.quote(hours)\n// This does not transition Document.\nDraft.edit() → revision + 1\nDraft.submit() → Review\nReview.withdraw() → Draft\nReview.publish() → Published'}>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">Strategy · caller chooses how</span>
      <Field label="Pricing algorithm"><select value={strategy} onChange={e => setStrategy(e.target.value as BehaviorState['strategy'])}><option value="hourly">Hourly · 200¢/h</option><option value="weekend">Weekend · 150¢/h, cap 600¢</option></select></Field>
      <Field label="Parking hours (1–24)"><input type="number" value={hours} onChange={e => setHours(e.target.value)} /></Field>
      <Action onClick={() => lab.run({ type: 'quote', strategy, hours: Number(hours) })}>Select strategy & quote</Action>
    </div>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">State · guards decide what</span>
      <div className="lld-exp-state-strip">{['Draft', 'Review', 'Published'].map(state => <span key={state} className={lab.state.document === state ? 'lld-exp-state-active' : ''}>{state}</span>)}</div>
      <div className="lld-exp-actions"><Action subtle onClick={() => lab.run({ type: 'edit' })}>Edit</Action><Action onClick={() => lab.run({ type: 'submit' })}>Submit</Action><Action subtle onClick={() => lab.run({ type: 'withdraw' })}>Withdraw</Action><Action onClick={() => lab.run({ type: 'publish' })}>Publish</Action></div>
    </div>
  </Notebook>
}

function inspectWrappers(s: WrapperState): ObjectView[] {
  return [
    { name: 'WrapperChain', value: s.chain, note: 'Calls travel left to right; a short-circuit skips every inner wrapper.' },
    { name: 'QuoteCache', value: s.cache ? `key = ${s.cache.key}\naccount AC-7 quote = ${s.cache.cents}¢` : 'empty', note: 'Synthetic account-scoped data. Quotes are cached, never payment side effects.' },
    { name: 'QuotePort', value: `last response = ${s.lastQuote === null ? 'none' : `${s.lastQuote}¢`}\nunauthorized response = ${s.leaked}`, note: 'Caller speaks integer cents; the vendor speaks major currency units.' },
    { name: 'VendorClient', value: `${s.calls} local calls`, note: 'Vendor estimate adds a 10% fee. Cache hits do not call the vendor.' },
  ]
}
function Wrappers({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialWrappers, changeWrappers, inspectWrappers, onExperiment)
  const [order, setOrder] = useState<'auth-first' | 'cache-first'>('auth-first')
  const [authorized, setAuthorized] = useState(true)
  const [adapt, setAdapt] = useState(true)
  const [cents, setCents] = useState('1250')
  return <Notebook number={7} title="X-ray a wrapper chain" question="Can the same wrappers become incorrect just by changing their order?"
    tryThis="Warm the cache while authorized. Revoke authorization and try cache-first. Then move auth outside the cache. Disable unit translation to expose a second boundary bug."
    lab={lab} code={'safe = Log(Auth(Cache(Adapter(Vendor))))\nunsafe = Log(Cache(Auth(Adapter(Vendor))))\nCache.hit → returns without calling inner wrappers\nAdapter.quote(cents):\n  return round(Vendor.quote(cents / 100) * 100)'}>
    <Field label="Wrapper order"><select value={order} onChange={e => setOrder(e.target.value as typeof order)}><option value="auth-first">Auth → Cache → Adapter</option><option value="cache-first">Cache → Auth → Adapter</option></select></Field>
    <Field label="Account quote amount (cents)"><input type="number" value={cents} onChange={e => setCents(e.target.value)} /></Field>
    <Toggle label="Caller is authorized for account AC-7" checked={authorized} onChange={setAuthorized} />
    <Toggle label="Adapter translates cents ↔ major units" checked={adapt} onChange={setAdapt} />
    <Action onClick={() => lab.run({ order, authorized, adapt, cents: Number(cents) })}>Run through composed wrappers</Action>
    <p className="lld-exp-note">The postcondition monitor flags an unauthorized cache response—it does not pretend the wrapper prevented it. Logging runs around both hits and failures.</p>
  </Notebook>
}

function inspectAuction(s: AuctionState): ObjectView[] {
  return [
    { name: 'Auction', value: `highest bid = ${s.bid}¢\nversion = ${s.version}`, note: 'A bid must exceed the current bid at the expected version.' },
    { name: 'CommandQueue', value: s.queue.length ? s.queue.map(c => `#${c.id}: ${c.amount}¢ @v${c.expectedVersion}`).join('\n') : 'empty', note: 'Commands capture intent now and validate again when executed.' },
    { name: 'UndoCommand', value: s.undo ? `restore ${s.undo.previous}¢\nonly if bid = ${s.undo.next}¢\nand version = ${s.undo.version}` : 'no undo record', note: 'Only the most recent locally executed command is undoable in this model.' },
    { name: 'Observers', value: `audit ${s.audit ? 'ON' : 'OFF'}: ${s.audits} events\nnotify ${s.notify ? 'ON' : 'OFF'}: ${s.notifications} delivered\nnotify failures = ${s.failures}\nfail fixture = ${s.failNotify}`, note: 'Notification runs before audit, synchronously. Per-handler failures are isolated.' },
  ]
}
function Commands({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialAuction, changeAuction, inspectAuction, onExperiment)
  const [amount, setAmount] = useState('1200')
  const [audit, setAudit] = useState(true)
  const [notify, setNotify] = useState(true)
  const [failNotify, setFailNotify] = useState(false)
  return <Notebook number={8} title="Separate intent, facts and compensation" question="If an observer throws, did the bid fail? And can undo erase a later writer?"
    tryThis="Enable notification failure, apply subscriptions, queue and execute a bid. Audit still runs. Add an external bid and try undoing the earlier command."
    lab={lab} code={'command.execute(): validate expectedVersion, bid\n  commit auction; remember undo precondition\n  for each subscriber: try onEvent() catch recordFailure\nundo(): require currentVersion == appliedVersion\n  restore previous bid; emit BidUndone\n// A compensating event cannot unsend a notification.'}>
    <Field label="Queued bid amount (cents)"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
    <div className="lld-exp-actions"><Action onClick={() => lab.run({ type: 'queue', amount: Number(amount) })}>Queue bid command</Action><Action onClick={() => lab.run({ type: 'execute' })}>Execute queue head</Action><Action subtle onClick={() => lab.run({ type: 'undo' })}>Undo last local bid</Action><Action subtle onClick={() => lab.run({ type: 'external' })}>External writer +100¢</Action></div>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">Synchronous subscribers</span>
      <Toggle label="Audit observer subscribed" checked={audit} onChange={setAudit} />
      <Toggle label="Notification observer subscribed" checked={notify} onChange={setNotify} />
      <Toggle label="Notification handler throws" checked={failNotify} onChange={setFailNotify} />
      <Action subtle onClick={() => lab.run({ type: 'subscribe', audit, notify, failNotify })}>Apply subscription policy</Action>
    </div>
  </Notebook>
}

function inspectReservation(s: ReservationState): ObjectView[] {
  return [
    { name: 'Seat A-12', value: `owner = ${s.seat.owner ?? 'available'}\nversion = ${s.seat.version}`, note: 'The repository commits seat ownership and the receipt in one transaction.' },
    ...(['A', 'B'] as const).map(client => ({ name: `Client ${client}`, value: s.snapshots[client] ? `snapshot v${s.snapshots[client]?.version}\nowner = ${s.snapshots[client]?.owner ?? 'available'}` : 'not loaded', note: 'A detached read is not a lock or a promise of future availability.' })),
    { name: 'IdempotencyStore', value: Object.entries(s.receipts).map(([key, receipt]) => `${key}: ${receipt.client} succeeded @v${receipt.version}`).join('\n') || 'empty', note: 'Same key + same payload replays the original outcome; a new intent needs a new key.' },
  ]
}
function Reservations({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialReservation, changeReservation, inspectReservation, onExperiment)
  const [keyA, setKeyA] = useState('reserve-A')
  const [keyB, setKeyB] = useState('reserve-B')
  return <Notebook number={9} title="Race two detached reservation snapshots" question="Both clients read ‘available’. Which write is allowed to commit?"
    tryThis="Read A, read B, reserve A, then reserve B. Reload B and try again: stale-version conflict becomes a domain ‘already owned’ rejection."
    lab={lab} code={'transaction:\n  if receipt(key): replay only matching payload\n  UPDATE Seat SET owner=client, version=version+1\n    WHERE owner IS NULL AND version=expected\n  require affectedRows == 1\n  save receipt; commit'}>
    {(['A', 'B'] as const).map(client => <div className="lld-exp-control-group" key={client}><span className="lld-exp-group-label">Client {client} · independent snapshot</span>
      <Field label={`Client ${client} request key`}><input value={client === 'A' ? keyA : keyB} onChange={e => client === 'A' ? setKeyA(e.target.value) : setKeyB(e.target.value)} maxLength={24} /></Field>
      <div className="lld-exp-actions"><Action subtle onClick={() => lab.run({ type: 'read', client })}>Read {client}</Action><Action onClick={() => lab.run({ type: 'reserve', client, key: client === 'A' ? keyA : keyB })}>Reserve {client}</Action><Action subtle onClick={() => lab.run({ type: 'release', client })}>Release {client}</Action></div>
    </div>)}
    <p className="lld-exp-note">Replaying A’s key returns its original success, not a fresh reservation. To release, reload A’s latest version first. Receipts deliberately outlive a release.</p>
  </Notebook>
}

function inspectQueue(s: QueueState): ObjectView[] {
  return [
    { name: 'BoundedQueue', value: `[${s.items.join(', ')}]\nsize = ${s.items.length} / capacity 1\ninvariant = ${s.items.length <= 1 ? 'HOLDS' : 'BROKEN'}`, note: 'The enqueue is the linearization point; a separate atomic size() is insufficient.' },
    { name: 'Mutex', value: `mode = ${s.locked ? 'protected' : 'unsafe'}\nowner = ${s.owner ?? 'none'}`, note: 'Ownership spans capacity check AND enqueue. A condition wait releases ownership.' },
    ...(['P', 'Q'] as const).map(id => ({ name: `Producer ${id}`, value: `phase = ${s.producers[id].phase}\nsaved size = ${s.producers[id].observed ?? 'not read'}`, note: 'Step once to check; step again to act on that observation.' })),
  ]
}
function Concurrency({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialQueue, changeQueue, inspectQueue, onExperiment)
  return <Notebook number={10} title="Find the missing critical section" question="Can two individually atomic queue operations still violate capacity?"
    tryThis="Use unsafe mode. Step P, Q, P, Q: both checks see room, then two items occupy one slot. Reset and repeat with a mutex; Q must wait."
    lab={lab} code={'mutex.lock()\nwhile queue.size == capacity:\n  notFull.wait(mutex) // releases; reacquires before retry\nqueue.push(item)       // linearization point\nmutex.unlock()\n// Locking only push() leaves a check-then-act race.'}>
    <div className="lld-exp-actions"><Action subtle onClick={() => lab.run({ type: 'mode', locked: false })}>Use unsafe check + push</Action><Action onClick={() => lab.run({ type: 'mode', locked: true })}>Protect whole operation</Action></div>
    <div className="lld-exp-thread-grid">{(['P', 'Q'] as const).map(producer => <div className="lld-exp-thread" key={producer}><strong>Producer {producer}</strong><span>{lab.state.producers[producer].phase === 'checked' ? 'next: enqueue' : 'next: check capacity'}</span><Action onClick={() => lab.run({ type: 'step', producer })}>Step {producer}</Action></div>)}</div>
    <Action subtle onClick={() => lab.run({ type: 'consume' })}>Consumer: remove head</Action>
    <p className="lld-exp-note">You are the scheduler: no real threads or timing luck. Waiting returns control to you; choose another actor, then retry the waiting operation.</p>
  </Notebook>
}

const dollars = (cents: number) => `${cents < 0 ? '−' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`
function inspectSplit(s: SplitState): ObjectView[] {
  return [
    { name: 'Expense', value: `posted = ${s.expenses}\nlast total = ${dollars(s.total)}\nshares = ${s.lastSplit?.map(dollars).join(' + ') ?? 'none'}`, note: 'Ada is the payer. Each expense is validated before any ledger entry is posted.' },
    ...(['Ada', 'Ben', 'Cora'] as const).map((name, i) => ({ name, value: `${dollars(s.balances[i])} USD net\n${s.balances[i] > 0 ? 'is owed' : s.balances[i] < 0 ? 'owes' : 'settled'}`, note: 'Positive is credit; negative is debt. All three balances must sum to zero.' })),
  ]
}
function Splitwise({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialSplit, changeSplit, inspectSplit, onExperiment)
  const [total, setTotal] = useState('10.00')
  const [mode, setMode] = useState<'equal' | 'exact' | 'percent'>('equal')
  const [shares, setShares] = useState<[string, string, string]>(['33.33', '33.33', '33.34'])
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD')
  const [member, setMember] = useState<1 | 2>(1)
  const [settlement, setSettlement] = useState('3.33')
  return <Notebook number={11} title="Make every cent belong somewhere" question="Where does the remainder cent go—and what must be rejected before posting?"
    tryThis="Split $10 equally. Then try percentages totaling 99.99%, or an EUR expense in this USD ledger. Settle Ben’s exact debt, then try settling it twice."
    lab={lab} code={'Money = parseDecimalToIntegerCents(input)\nrequire currency == ledger.currency\nrequire sum(exactShares) == total\nrequire sum(percentBasisPoints) == 10_000\nallocate remainder deterministically\npost: payer += total; each member -= share\nassert sum(netBalances) == 0'}>
    <div className="lld-exp-form-grid"><Field label="Expense amount"><input inputMode="decimal" value={total} onChange={e => setTotal(e.target.value)} /></Field>
      <Field label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value as typeof currency)}><option value="USD">USD ledger</option><option value="EUR">EUR · test mismatch</option></select></Field>
    </div>
    <Field label="Split policy"><select value={mode} onChange={e => setMode(e.target.value as typeof mode)}><option value="equal">Equal · deterministic remainder</option><option value="exact">Exact amounts</option><option value="percent">Percentages</option></select></Field>
    {mode !== 'equal' && <div className="lld-exp-shares">{['Ada', 'Ben', 'Cora'].map((name, index) => <Field key={name} label={`${name} ${mode === 'percent' ? '%' : 'amount'}`}><input inputMode="decimal" value={shares[index]} onChange={e => setShares(shares.map((share, i) => i === index ? e.target.value : share) as typeof shares)} /></Field>)}</div>}
    <Action onClick={() => lab.run({ type: 'expense', total, mode, shares, currency })}>Validate & post expense</Action>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">Record a settlement to Ada</span>
      <div className="lld-exp-form-grid"><Field label="Member paying Ada"><select value={member} onChange={e => setMember(Number(e.target.value) as 1 | 2)}><option value={1}>Ben</option><option value={2}>Cora</option></select></Field>
        <Field label="Settlement amount"><input inputMode="decimal" value={settlement} onChange={e => setSettlement(e.target.value)} /></Field></div>
      <Action subtle onClick={() => lab.run({ type: 'settle', member, amount: settlement, currency })}>Validate & record settlement</Action>
    </div>
  </Notebook>
}

function inspectCapstone(s: CapstoneState): ObjectView[] {
  return [
    { name: 'RefundService', value: `deployed = ${s.deployed}\nbinding changes = ${s.deployments}`, note: 'Callers retain the v1 RefundResult contract; no caller source is migrated.' },
    { name: 'PaymentPort', value: 'refund(paymentId, integerCents, requestKey)\n→ {ok, refundId, refundedMinor} | typed error', note: 'Backward compatibility includes money units and errors, not only method names.' },
    { name: 'ProviderAdapter', value: `${s.ledger.calls} observed provider attempts\nlast = ${s.last ? JSON.stringify(s.last) : 'none'}`, note: 'v2 expects major units and returns state/reference/money. The adapter translates both directions.' },
    { name: 'RefundLedger', value: `charged = 10000¢\nrefunded = ${s.ledger.refunded}¢\nremaining = ${10000 - s.ledger.refunded}¢\nreceipts = ${Object.keys(s.ledger.receipts).length}`, note: 'Money and successful idempotency receipts survive a provider binding change.' },
    { name: 'FitnessSuite', value: `candidate = ${s.candidate ?? 'not reviewed'}\n${s.checks.filter(c => c.pass).length}/${s.checks.length} checks pass`, note: 'Candidate checks use isolated fixture ledgers, not this active refund ledger.' },
  ]
}
function Capstone({ onExperiment }: LessonProps) {
  const lab = useExperiment(initialCapstone, changeCapstone, inspectCapstone, onExperiment)
  const [candidate, setCandidate] = useState<ProviderCandidate>('raw-v2')
  const [amount, setAmount] = useState('1000')
  const [key, setKey] = useState('refund-1')
  const [fail, setFail] = useState(false)
  return <Notebook number={12} title="Evolve a provider without breaking callers" question="Will a provider swap preserve partial refunds, retry safety, and the old caller’s error contract?"
    tryThis="Try deploying raw v2. Inspect failed contracts, choose the v2 adapter and deploy. Refund once, replay its key, then inject a provider failure using a new key."
    lab={lab} code={'candidate = new ProviderV2Adapter(v2)\nrequire existingCallerContractTests(candidate).allPass\npublish PaymentPort binding // preserve ledger\nrefund(key, cents): replay same successful request\n  require refunded + cents ≤ charged\n  map cents ↔ major units; map errors\n  commit money + receipt only after success'}
    extra={<Checks checks={lab.state.checks} />}>
    <Field label="Candidate implementation"><select value={candidate} onChange={e => setCandidate(e.target.value as ProviderCandidate)}><option value="raw-v2">Provider v2 · raw, incompatible</option><option value="adapter-v2">Provider v2 · compatibility adapter</option><option value="legacy">Existing v1 provider</option></select></Field>
    <div className="lld-exp-actions"><Action subtle onClick={() => lab.run({ type: 'review', candidate })}>Run six contract checks</Action><Action onClick={() => lab.run({ type: 'deploy', candidate })}>Gate & deploy candidate</Action></div>
    <div className="lld-exp-control-group"><span className="lld-exp-group-label">Existing caller · fixed $100 payment</span>
      <Field label="Partial refund (integer cents)"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
      <Field label="Refund request key"><input value={key} maxLength={24} onChange={e => setKey(e.target.value)} /></Field>
      <Toggle label="Inject explicit provider rejection" checked={fail} onChange={setFail} />
      <Action onClick={() => lab.run({ type: 'refund', amount: Number(amount), key, fail })}>Call existing refund API</Action>
    </div>
    <p className="lld-exp-note">Scope: one payment, one currency, synchronous explicit provider success/failure. Timeout ambiguity and migration of provider-owned payment IDs need reconciliation and routing policies beyond this local fixture.</p>
  </Notebook>
}

const lessons = [Responsibilities, Objects, Vending, Refactoring, Construction, Behaviors, Wrappers, Commands, Reservations, Concurrency, Splitwise, Capstone]

/** Running a hypothesis is exploration; this component never awards lesson mastery. */
export default function LldExperiments({ week, onExperiment }: { week: number; onExperiment: () => void }) {
  const Lesson = Number.isInteger(week) ? lessons[week - 1] : undefined
  if (!Lesson) return <section className="lld-exp"><p>Choose an LLD week from 1–12 to open its experiment.</p></section>
  return <Lesson key={week} onExperiment={onExperiment} />
}
