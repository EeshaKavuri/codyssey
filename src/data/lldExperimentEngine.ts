/** Small deterministic models, not network clients or production concurrency primitives. */
export type ExperimentResult<S> = {
  state: S
  allowed: boolean
  why: string
  affected: string[]
  trace: string[]
  warning?: boolean
}

export type ExperimentCheck = { name: string; expected: string; actual: string; pass: boolean }

function result<S>(state: S, allowed: boolean, why: string, affected: string[], trace: string[] = [], warning = false): ExperimentResult<S> {
  return { state, allowed, why, affected, trace, warning }
}

function check(name: string, expected: unknown, actual: unknown): ExperimentCheck {
  return { name, expected: JSON.stringify(expected), actual: JSON.stringify(actual), pass: JSON.stringify(expected) === JSON.stringify(actual) }
}

const whole = (n: number, min: number, max: number) => Number.isSafeInteger(n) && n >= min && n <= max

// 1. Import edges point from a caller to the dependency it knows about.
export type Architecture = 'concrete' | 'ports'
export type ChangePressure = 'payment' | 'discount' | 'notification'
export type ResponsibilityState = {
  architecture: Architecture
  pressure: ChangePressure
  revision: number
  edited: string[]
  reviewed: string[]
  edges: [string, string][]
}

function responsibilityEdges(architecture: Architecture): [string, string][] {
  const callers: [string, string][] = [['ReceiptUI', 'Checkout'], ['RetryJob', 'Checkout']]
  return architecture === 'concrete'
    ? [...callers, ['Checkout', 'VendorSDK'], ['Checkout', 'PricingRules'], ['Checkout', 'MailSDK']]
    : [...callers, ['Checkout', 'PaymentPort'], ['Checkout', 'PricingPort'], ['Checkout', 'NotificationPort'],
      ['PaymentAdapter', 'PaymentPort'], ['PaymentAdapter', 'VendorSDK'], ['DiscountPolicy', 'PricingPort'],
      ['EmailAdapter', 'NotificationPort'], ['EmailAdapter', 'MailSDK'], ['CompositionRoot', 'PaymentAdapter'],
      ['CompositionRoot', 'DiscountPolicy'], ['CompositionRoot', 'EmailAdapter'], ['CompositionRoot', 'Checkout']]
}

export const initialResponsibilities = (): ResponsibilityState => ({
  architecture: 'concrete', pressure: 'payment', revision: 0, edited: [], reviewed: [], edges: responsibilityEdges('concrete'),
})

export function changeResponsibilities(state: ResponsibilityState, action: { architecture: Architecture; pressure: ChangePressure }): ExperimentResult<ResponsibilityState> {
  const roots = { payment: 'VendorSDK', discount: 'PricingRules', notification: 'MailSDK' }
  const implementations = { payment: 'PaymentAdapter', discount: 'DiscountPolicy', notification: 'EmailAdapter' }
  const edges = responsibilityEdges(action.architecture)
  const edited = action.architecture === 'concrete'
    ? [roots[action.pressure], 'Checkout']
    : action.pressure === 'discount' ? ['DiscountPolicy'] : [roots[action.pressure], implementations[action.pressure]]
  const reached = new Set(edited)
  let changed = true
  while (changed) {
    changed = false
    for (const [caller, dependency] of edges) {
      if (reached.has(dependency) && !reached.has(caller)) {
        reached.add(caller)
        changed = true
      }
    }
  }
  const reviewed = [...reached].filter(name => !edited.includes(name))
  return result({ ...action, revision: state.revision + 1, edited, reviewed, edges }, true,
    action.architecture === 'ports'
      ? 'The port contract stays stable. Only the concrete implementation changes; composition wiring is reviewed. Checkout does not import the adapter.'
      : 'The changed concrete API or policy is embedded in Checkout. Edit those sources and review callers reached through its import edges.',
    [...reached], [`change ${action.pressure}`, `edit: ${edited.join(', ')}`, `reverse-import traversal: ${reviewed.join(', ') || 'none'}`])
}

// 2. Vehicle identity is stable; size is an immutable, validated value.
export type Vehicle = { id: string; size: number; permit: boolean; needsCharge: boolean }
export type ParkingState = {
  vehicle: Vehicle
  spot: { id: string; maxSize: number; accessible: boolean; charger: boolean; occupant: string | null } | null
}
export type ParkingAction = { type: 'replace'; size: number; permit: boolean; needsCharge: boolean } | { type: 'park' | 'leave' | 'delete' }
export const initialParking = (): ParkingState => ({
  vehicle: { id: 'CAR-7', size: 2, permit: false, needsCharge: false },
  spot: { id: 'P-17', maxSize: 2, accessible: true, charger: false, occupant: null },
})

function parkingViolation(vehicle: Vehicle, spot: NonNullable<ParkingState['spot']>): string | null {
  if (vehicle.size > spot.maxSize) return `Size ${vehicle.size} exceeds P-17 capacity ${spot.maxSize}.`
  if (spot.accessible && !vehicle.permit) return 'P-17 is reserved for permit holders; CAR-7 has no permit.'
  if (vehicle.needsCharge && !spot.charger) return 'CAR-7 requires charging, but P-17 has no charger.'
  return null
}

export function changeParking(state: ParkingState, action: ParkingAction): ExperimentResult<ParkingState> {
  if (action.type === 'replace') {
    if (!whole(action.size, 1, 3)) return result(state, false, 'Size must be an integer from 1 (compact) to 3 (van); no invalid value object is constructed.', ['CAR-7'])
    const vehicle = { id: state.vehicle.id, size: action.size, permit: action.permit, needsCharge: action.needsCharge }
    const violation = state.spot?.occupant ? parkingViolation(vehicle, state.spot) : null
    if (violation) return result(state, false, `Replacement rejected while parked. ${violation}`, ['CAR-7', 'P-17'])
    return result({ ...state, vehicle }, true,
      `Replaced the vehicle values; entity identity is still CAR-7. Size value equality with the old value: ${vehicle.size === state.vehicle.size}.`,
      ['CAR-7'], ['Vehicle.replaceValues()', 'Size.create(): validate range', 'recheck active allocation', 'commit replacement'])
  }
  if (!state.spot) return result(state, false, 'P-17 no longer exists. The independent CAR-7 entity still exists; reset to restore the spot.', ['P-17', 'CAR-7'])
  if (action.type === 'park') {
    const violation = state.spot.occupant ? 'P-17 already has an allocation; multiplicity is 0..1.' : parkingViolation(state.vehicle, state.spot)
    if (violation) return result(state, false, violation, ['CAR-7', 'P-17'], ['AllocationService.park()', 'Spot.canAccept(vehicle) → false', 'no write'])
    return result({ ...state, spot: { ...state.spot, occupant: state.vehicle.id } }, true,
      'Size, permit and charging requirements all hold. The spot owns an allocation referring to CAR-7, not the vehicle lifecycle.',
      ['P-17'], ['validate all guards', 'create Allocation(CAR-7)', 'attach to P-17'])
  }
  if (action.type === 'leave') {
    if (!state.spot.occupant) return result(state, false, 'There is no allocation to release.', ['P-17'])
    return result({ ...state, spot: { ...state.spot, occupant: null } }, true, 'The allocation ends. CAR-7 and P-17 keep their identities.', ['P-17'])
  }
  if (state.spot.occupant) return result(state, false, 'An occupied spot cannot be deleted. Release its allocation first.', ['P-17'])
  return result({ ...state, spot: null }, true, 'P-17 is deleted; CAR-7 survives because it is associated, not composition-owned.', ['P-17', 'CAR-7'])
}

// 3. Coin escrow and a separate change float make refunds and change explicit.
export type VendingState = { phase: 'Idle' | 'Collecting' | 'Ready'; credit: number; stock: number; float: number; cashbox: number; dispensed: number; returned: number }
export type VendingAction = { type: 'insert'; cents: number } | { type: 'select' | 'dispense' | 'cancel' | 'change' | 'restock' }
export const initialVending = (): VendingState => ({ phase: 'Idle', credit: 0, stock: 2, float: 0, cashbox: 0, dispensed: 0, returned: 0 })

export function changeVending(state: VendingState, action: VendingAction): ExperimentResult<VendingState> {
  if (action.type === 'insert') {
    if (![50, 100, 200].includes(action.cents) || state.credit + action.cents > 1000) return result(state, false, 'Accept only 50¢, 100¢ or 200¢ coins, up to 1,000¢ escrow.', ['CoinEscrow'])
    if (state.phase === 'Ready') return result(state, false, 'Selection is locked in Ready. Dispense or cancel before adding coins.', ['Machine', 'CoinEscrow'])
    return result({ ...state, credit: state.credit + action.cents, phase: 'Collecting' }, true,
      'The coin stays in refundable escrow, not in the change float.', ['Machine', 'CoinEscrow'], ['Customer → insertCoin', 'CoinEscrow → accept', 'Machine → Collecting'])
  }
  if (action.type === 'change' || action.type === 'restock') {
    if (state.phase !== 'Idle') return result(state, false, 'Maintenance requires Idle: no customer funds or selected purchase may be in flight.', ['Machine', 'Inventory', 'ChangeFloat'])
    const next = action.type === 'change' ? { ...state, float: state.float + 50 } : { ...state, stock: state.stock + 1 }
    return result(next, true, action.type === 'change' ? 'Loaded one 50¢ change coin.' : 'Loaded one product.', [action.type === 'change' ? 'ChangeFloat' : 'Inventory'])
  }
  if (action.type === 'cancel') {
    if (!state.credit) return result(state, false, 'Nothing to refund in Idle.', ['CoinEscrow'])
    return result({ ...state, credit: 0, phase: 'Idle', returned: state.returned + state.credit }, true,
      `Returned all ${state.credit}¢ from escrow. Inventory, revenue and change float are unchanged.`,
      ['Machine', 'CoinEscrow', 'Customer'], ['Customer → cancel', 'CoinEscrow → refund original coins', 'Machine → Idle'])
  }
  if (action.type === 'select') {
    const violation = state.phase === 'Ready' ? 'Already selected. Dispense or cancel.'
      : state.stock === 0 ? 'Product depleted: Inventory.available() is false.'
        : state.credit < 150 ? `Price is 150¢; escrow is short by ${150 - state.credit}¢.`
          : state.credit - 150 > state.float ? `Need ${state.credit - 150}¢ change; the separate float contains only ${state.float}¢.` : null
    if (violation) return result(state, false, violation, ['Machine', 'Inventory', 'CoinEscrow', 'ChangeFloat'], ['Customer → select', 'Machine → check preconditions', 'reject; retain refundable escrow'])
    return result({ ...state, phase: 'Ready' }, true, 'Stock, price and exact change guards pass. Ready authorizes dispense; nothing is sold yet.',
      ['Machine'], ['Customer → select', 'Inventory → available', 'ChangeFloat → canMakeChange', 'Machine → Ready'])
  }
  if (state.phase !== 'Ready') return result(state, false, 'Dispense requires Ready. Insert coins and select a product first.', ['Machine', 'Inventory'])
  const change = state.credit - 150
  return result({ ...state, phase: 'Idle', credit: 0, stock: state.stock - 1, float: state.float - change, cashbox: state.cashbox + state.credit, dispensed: state.dispensed + 1, returned: state.returned + change },
    true, `Committed one purchase: stock −1, revenue +150¢. All ${state.credit}¢ escrow moves to the cashbox and the separate float pays ${change}¢ change; net takings are 150¢.`,
    ['Machine', 'Inventory', 'CoinEscrow', 'ChangeFloat', 'Customer', 'Cashbox'],
    ['Machine → dispense [Ready]', 'Inventory → remove 1', `ChangeFloat → return ${change}¢`, 'CoinEscrow → settle', 'Machine → Idle'])
}

// 4. These are executable characterization cases, including stable-sort ties.
type PlannedTask = { id: string; priority: number; due: number; repeat?: number }
export type RefactorStage = 'legacy' | 'sort-extracted' | 'scheduler-extracted'
export type RefactorState = { stage: RefactorStage; characterized: boolean; checks: ExperimentCheck[]; candidate: string }
export type RefactorAction = 'test' | 'extract-sort' | 'extract-scheduler' | 'unsafe-tie'
const taskCases: { name: string; tasks: PlannedTask[]; expected: string[] }[] = [
  { name: 'Empty backlog', tasks: [], expected: [] },
  { name: 'Priority ordering', tasks: [{ id: 'A', priority: 1, due: 2 }, { id: 'B', priority: 3, due: 1 }], expected: ['B@1 → -', 'A@2 → -'] },
  { name: 'Preserve insertion order for ties', tasks: [{ id: 'B', priority: 2, due: 5 }, { id: 'A', priority: 2, due: 3 }], expected: ['B@5 → -', 'A@3 → -'] },
  { name: 'Recurring task retains next due date', tasks: [{ id: 'R', priority: 1, due: 5, repeat: 7 }], expected: ['R@5 → 12'] },
]

function priorityOrder(tasks: PlannedTask[]) { return [...tasks].sort((a, b) => b.priority - a.priority) }
function scheduleTask(task: PlannedTask) { return `${task.id}@${task.due} → ${task.repeat === undefined ? '-' : task.due + task.repeat}` }
function taskPlan(tasks: PlannedTask[], stage: RefactorStage | 'unsafe-tie'): string[] {
  if (stage === 'legacy') {
    return [...tasks].sort((a, b) => b.priority - a.priority).map(t => `${t.id}@${t.due} → ${t.repeat === undefined ? '-' : t.due + t.repeat}`)
  }
  const ordered = stage === 'unsafe-tie'
    ? [...tasks].sort((a, b) => b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    : priorityOrder(tasks)
  return stage === 'sort-extracted'
    ? ordered.map(t => `${t.id}@${t.due} → ${t.repeat === undefined ? '-' : t.due + t.repeat}`)
    : ordered.map(scheduleTask)
}

export const initialRefactor = (): RefactorState => ({ stage: 'legacy', characterized: false, checks: [], candidate: 'none' })
export function changeRefactor(state: RefactorState, action: RefactorAction): ExperimentResult<RefactorState> {
  if (action !== 'test' && !state.characterized) return result(state, false, 'Capture the existing behavior first. A refactor without a baseline has no safety gate.', ['TaskManager', 'CharacterizationSuite'])
  if (action === 'extract-sort' && state.stage !== 'legacy') return result(state, false, 'Sorting has already been extracted.', ['TaskManager', 'PriorityOrder'])
  if (action === 'extract-scheduler' && state.stage !== 'sort-extracted') return result(state, false, 'Extract sorting first, then change one responsibility at a time.', ['TaskManager', 'Scheduler'])
  const candidate = action === 'test' ? state.stage : action === 'extract-sort' ? 'sort-extracted' : action === 'extract-scheduler' ? 'scheduler-extracted' : 'unsafe-tie'
  const checks = taskCases.map(c => check(c.name, c.expected, taskPlan(c.tasks, candidate)))
  const passed = checks.every(c => c.pass)
  const stage = passed && candidate !== 'unsafe-tie' ? candidate : state.stage
  return result({ stage, characterized: state.characterized || passed, checks, candidate }, passed,
    passed ? `${checks.length} actual cases pass. ${action === 'test' ? 'Baseline captured; extraction is now permitted.' : 'The candidate is promoted; externally visible outputs are preserved.'}`
      : 'The candidate changes equal-priority task order. The test gate rejects it and keeps the previously committed implementation.',
    ['TaskManager', 'PriorityOrder', 'Scheduler', 'CharacterizationSuite'], [`build candidate: ${candidate}`, 'run golden input/output cases', passed ? 'commit candidate' : 'discard candidate; retain source stage'])
}

// 5. An abstract factory assembles a compatible client/signer family atomically.
export type NotificationConfig = { environment: 'test' | 'production'; family: 'sandbox' | 'live'; credential: 'none' | 'test-token' | 'live-token'; channel: 'email' | 'sms'; timeout: number }
export type ConstructionState = { graph: { config: NotificationConfig; build: number; client: string; signer: string } | null; builds: number; sent: number }
export type ConstructionAction = { type: 'build'; config: NotificationConfig } | { type: 'send' }
export const initialConstruction = (): ConstructionState => ({ graph: null, builds: 0, sent: 0 })
export function changeConstruction(state: ConstructionState, action: ConstructionAction): ExperimentResult<ConstructionState> {
  if (action.type === 'send') {
    if (!state.graph) return result(state, false, 'NotificationService cannot send until all constructor invariants pass and a complete graph is published.', ['NotificationService'])
    return result({ ...state, sent: state.sent + 1 }, true,
      `Locally dispatched ${state.graph.config.channel} through build ${state.graph.build}. No network request is made.`,
      ['NotificationService', 'ProviderClient'], ['NotificationService → client.send', `${state.graph.signer} → sign`, `${state.graph.client} → local receipt`])
  }
  const c = action.config
  const requiredFamily = c.environment === 'test' ? 'sandbox' : 'live'
  const requiredToken = c.family === 'sandbox' ? 'test-token' : 'live-token'
  const violation = c.family !== requiredFamily ? `${c.environment} requires the ${requiredFamily} provider family.`
    : c.credential !== requiredToken ? `${c.family} client and signer require the ${requiredToken} fixture.`
      : !whole(c.timeout, 100, 10000) ? 'Timeout must be a whole number from 100 to 10,000 ms.' : null
  if (violation) return result(state, false, `${violation} The previous graph remains intact; no partially initialized service escapes.`, ['CompositionRoot', 'ProviderClient', 'Signer'])
  const graph = { config: { ...c }, build: state.builds + 1, client: `${c.family}.${c.channel}Client`, signer: `${c.family}.Signer` }
  return result({ ...state, graph, builds: state.builds + 1 }, true, 'Validated the full configuration, constructed a matched family, then injected it into NotificationService.',
    ['CompositionRoot', 'ProviderClient', 'Signer', 'NotificationService'], ['Builder.validate()', 'ProviderFactory.createClient + createSigner', 'new NotificationService(client, signer)', 'publish graph'])
}

// 6. Choosing an algorithm is independent from advancing a guarded lifecycle.
export type BehaviorState = { strategy: 'hourly' | 'weekend'; hours: number; quote: number; document: 'Draft' | 'Review' | 'Published'; revision: number }
export type BehaviorAction = { type: 'quote'; strategy: BehaviorState['strategy']; hours: number } | { type: 'edit' | 'submit' | 'withdraw' | 'publish' }
export const initialBehavior = (): BehaviorState => ({ strategy: 'hourly', hours: 2, quote: 400, document: 'Draft', revision: 1 })
export function changeBehavior(state: BehaviorState, action: BehaviorAction): ExperimentResult<BehaviorState> {
  if (action.type === 'quote') {
    if (!whole(action.hours, 1, 24)) return result(state, false, 'A quote requires 1–24 whole hours; no lifecycle transition occurs.', ['PricingPolicy'])
    const quote = action.strategy === 'hourly' ? action.hours * 200 : Math.min(action.hours * 150, 600)
    return result({ ...state, strategy: action.strategy, hours: action.hours, quote }, true,
      `${action.strategy} computes ${quote}¢ for ${action.hours}h. Choosing an algorithm does not grant permission to publish a document.`,
      ['PricingPolicy'], [`Context → ${action.strategy}.quote(${action.hours})`, `return ${quote}¢`, `Document remains ${state.document}`])
  }
  const permitted = action.type === 'edit' ? state.document === 'Draft'
    : action.type === 'submit' ? state.document === 'Draft'
      : action.type === 'withdraw' || action.type === 'publish' ? state.document === 'Review' : false
  if (!permitted) return result(state, false, `${action.type} is not permitted in ${state.document}. Lifecycle guards, not caller preference, control this behavior.`, ['Document'])
  const document = action.type === 'submit' ? 'Review' : action.type === 'publish' ? 'Published' : 'Draft'
  return result({ ...state, document, revision: state.revision + (action.type === 'edit' ? 1 : 0) }, true,
    action.type === 'edit' ? 'Draft accepts an edit and increments its revision.' : `${state.document} → ${document}; the pricing strategy remains ${state.strategy}.`,
    ['Document'], [`Document.${action.type}()`, `guard ${state.document}: allowed`, `state → ${document}`])
}

// 7. Real wrapper composition: a cache outside authorization can bypass the guard.
export type WrapperState = { cache: { key: string; cents: number } | null; calls: number; lastQuote: number | null; leaked: boolean; chain: string }
export type WrapperAction = { authorized: boolean; order: 'auth-first' | 'cache-first'; adapt: boolean; cents: number }
export const initialWrappers = (): WrapperState => ({ cache: null, calls: 0, lastQuote: null, leaked: false, chain: 'not assembled' })
export function changeWrappers(state: WrapperState, action: WrapperAction): ExperimentResult<WrapperState> {
  if (!whole(action.cents, 1, 1000000)) return result(state, false, 'QuotePort accepts 1–1,000,000 integer cents.', ['QuotePort'])
  const trace: string[] = []
  let cache = state.cache
  let calls = state.calls
  const key = `${action.cents}:${action.adapt}`
  type Quote = () => number
  const provider: Quote = () => {
    const major = action.adapt ? action.cents / 100 : action.cents
    trace.push(`Adapter → Vendor.quote(${major} major units)`)
    calls += 1
    const vendorCents = Math.round(major * 100)
    const quoted = Math.floor((vendorCents * 110 + 50) / 100)
    const expected = Math.floor((action.cents * 110 + 50) / 100)
    trace.push(`Vendor → ${quoted}¢ including 10% fee`)
    if (quoted !== expected) throw new Error(`Unit contract failed: expected ${expected}¢ but got ${quoted}¢. Raw cents were interpreted as major units.`)
    return quoted
  }
  const withCache = (next: Quote): Quote => () => {
    if (cache?.key === key) {
      trace.push('Cache hit → return; inner wrappers do not run')
      return cache.cents
    }
    trace.push('Cache miss → delegate')
    const cents = next()
    cache = { key, cents }
    return cents
  }
  const withAuthorization = (next: Quote): Quote => () => {
    trace.push(`Authorization → ${action.authorized ? 'allow' : 'deny'}`)
    if (!action.authorized) throw new Error('Authorization rejected the request before returning account-scoped quote data.')
    return next()
  }
  const chain = action.order === 'auth-first' ? 'Log → Auth → Cache → Adapter → Vendor' : 'Log → Cache → Auth → Adapter → Vendor'
  const call = action.order === 'auth-first' ? withAuthorization(withCache(provider)) : withCache(withAuthorization(provider))
  trace.push('Log → request')
  try {
    const cents = call()
    const leaked = !action.authorized
    trace.push(`Log → response ${cents}¢`)
    return result({ cache, calls, lastQuote: cents, leaked, chain }, !leaked,
      leaked ? 'Illegal outcome: the outer cache returned account data without calling Authorization. Auth must wrap cache hits as well as misses.'
        : `Returned ${cents}¢. The adapter translates units; the cache decorates behavior; the authorization proxy controls access.`,
      ['WrapperChain', 'QuoteCache', 'QuotePort', 'VendorClient'], trace)
  } catch (error) {
    trace.push('Log → failure')
    return result({ cache, calls, lastQuote: null, leaked: false, chain }, false,
      error instanceof Error ? error.message : 'Quote failed.', ['WrapperChain', 'QuoteCache', 'QuotePort', 'VendorClient'], trace)
  }
}

// 8. Observer failures are isolated after commit; undo is a version-guarded command.
type BidCommand = { id: number; amount: number; expectedVersion: number }
export type AuctionState = {
  bid: number; version: number; nextId: number; queue: BidCommand[]
  undo: { previous: number; next: number; version: number } | null
  audit: boolean; notify: boolean; failNotify: boolean
  audits: number; notifications: number; failures: number
}
export type AuctionAction = { type: 'subscribe'; audit: boolean; notify: boolean; failNotify: boolean } | { type: 'queue'; amount: number } | { type: 'execute' | 'undo' | 'external' }
export const initialAuction = (): AuctionState => ({ bid: 1000, version: 0, nextId: 1, queue: [], undo: null, audit: true, notify: true, failNotify: false, audits: 0, notifications: 0, failures: 0 })
function auctionEvent(state: AuctionState, event: string, trace: string[]): AuctionState {
  const next = { ...state }
  trace.push(`Auction → ${event} [synchronous]`)
  if (next.notify) {
    if (next.failNotify) { next.failures += 1; trace.push('NotifyObserver → throws; catch and record failure') }
    else { next.notifications += 1; trace.push('NotifyObserver → delivered') }
  }
  if (next.audit) { next.audits += 1; trace.push('AuditObserver → appended') }
  trace.push('Publisher returns after subscribed handlers finish')
  return next
}
export function changeAuction(state: AuctionState, action: AuctionAction): ExperimentResult<AuctionState> {
  if (action.type === 'subscribe') return result({ ...state, audit: action.audit, notify: action.notify, failNotify: action.failNotify }, true,
    'Updated explicit subscriptions and the local failure fixture. Unsubscribed observers receive no later events.', ['Observers'])
  if (action.type === 'queue') {
    if (!whole(action.amount, 1, 1000000) || state.queue.length >= 3) return result(state, false, 'Use a positive whole-cent bid. This demo queue holds at most three commands.', ['CommandQueue'])
    const command = { id: state.nextId, amount: action.amount, expectedVersion: state.version }
    return result({ ...state, nextId: state.nextId + 1, queue: [...state.queue, command] }, true,
      `Queued command #${command.id} against version ${command.expectedVersion}; queueing is not execution and emits no event.`, ['CommandQueue'])
  }
  const trace: string[] = []
  let next: AuctionState
  let event: string
  if (action.type === 'execute') {
    const command = state.queue[0]
    if (!command) return result(state, false, 'No queued command to execute.', ['CommandQueue'])
    const consumed = { ...state, queue: state.queue.slice(1) }
    trace.push(`Dispatcher → BidCommand#${command.id}.execute()`)
    if (command.expectedVersion !== state.version || command.amount <= state.bid) return result(consumed, false,
      command.expectedVersion !== state.version ? `Stale command expects v${command.expectedVersion}, current v${state.version}. It is removed, not blindly retried.`
        : `Bid ${command.amount}¢ must exceed ${state.bid}¢. Rejected command is removed; no event is emitted.`,
      ['Auction', 'CommandQueue'], [...trace, 'precondition rejected'])
    next = { ...consumed, bid: command.amount, version: state.version + 1, undo: { previous: state.bid, next: command.amount, version: state.version + 1 } }
    event = 'BidAccepted'
  } else if (action.type === 'undo') {
    if (!state.undo) return result(state, false, 'There is no locally executed command to undo.', ['UndoCommand'])
    if (state.version !== state.undo.version || state.bid !== state.undo.next) return result(state, false,
      'Undo rejected: an intervening write changed the auction. Restoring an old snapshot would erase somebody else’s bid.', ['Auction', 'UndoCommand'])
    next = { ...state, bid: state.undo.previous, version: state.version + 1, undo: null }
    event = 'BidUndone'
    trace.push('UndoCommand → compare version and current bid')
  } else {
    next = { ...state, bid: state.bid + 100, version: state.version + 1 }
    event = 'ExternalBidAccepted'
    trace.push('Another writer → commit +100¢; local undo record is not rewritten')
  }
  trace.push(`Auction → commit ${next.bid}¢ at v${next.version}`)
  next = auctionEvent(next, event, trace)
  const failed = next.failures > state.failures
  return result(next, true, failed ? 'Auction state committed. A synchronous notification failed, but audit still ran if subscribed; this policy records failure rather than rolling back the bid.'
    : 'The command committed before synchronous observers ran. Undo emits a compensating event; it cannot unsend earlier notifications.',
  ['Auction', 'CommandQueue', 'UndoCommand', 'Observers'], trace, failed)
}

// 9. Compare-and-swap and receipt insertion represent one repository transaction.
export type ClientId = 'A' | 'B'
export type ReservationState = {
  seat: { owner: ClientId | null; version: number }
  snapshots: Record<ClientId, { owner: ClientId | null; version: number } | null>
  receipts: Record<string, { client: ClientId; version: number }>
}
export type ReservationAction = { type: 'read'; client: ClientId } | { type: 'release'; client: ClientId } | { type: 'reserve'; client: ClientId; key: string }
export const initialReservation = (): ReservationState => ({ seat: { owner: null, version: 1 }, snapshots: { A: null, B: null }, receipts: {} })
export function changeReservation(state: ReservationState, action: ReservationAction): ExperimentResult<ReservationState> {
  const affected = [`Client ${action.client}`, 'Seat A-12', 'IdempotencyStore']
  if (action.type === 'read') return result({ ...state, snapshots: { ...state.snapshots, [action.client]: { ...state.seat } } }, true,
    `Client ${action.client} loaded v${state.seat.version}. This snapshot can become stale immediately.`, affected, ['Repository.get(A-12)', 'return detached snapshot'])
  if (action.type === 'reserve') {
    const key = action.key.trim()
    if (!/^[a-zA-Z0-9-]{1,24}$/.test(key)) return result(state, false, 'Use a 1–24 character request key containing letters, digits or hyphens.', affected)
    const receipt = Object.hasOwn(state.receipts, key) ? state.receipts[key] : undefined
    if (receipt) return result(state, receipt.client === action.client,
      receipt.client === action.client ? `Replayed the original success receipt at v${receipt.version}; no second write, even if the seat has since changed.`
        : 'This key already belongs to a different request payload. Do not reuse it across clients.', affected, ['IdempotencyStore.lookup(key)', 'return stored outcome or payload mismatch'])
  }
  const snapshot = state.snapshots[action.client]
  if (!snapshot) return result(state, false, 'Read a snapshot before attempting a conditional write.', affected)
  if (snapshot.version !== state.seat.version) return result(state, false,
    `Optimistic conflict: expected v${snapshot.version}, stored v${state.seat.version}. Zero rows updated. Reload and re-evaluate; do not just change the version number.`,
    affected, [`UPDATE Seat WHERE version = ${snapshot.version}`, 'affected rows = 0', 'rollback'])
  if (action.type === 'release') {
    if (state.seat.owner !== action.client) return result(state, false, 'Only the current owner can release this seat.', affected)
    return result({ ...state, seat: { owner: null, version: state.seat.version + 1 } }, true,
      'The owner released the seat with a matching version. Old snapshots and success receipts are not rewritten.', affected)
  }
  if (state.seat.owner) return result(state, false, `Seat A-12 is already owned by ${state.seat.owner}; a fresh version does not make it available.`, affected)
  const version = state.seat.version + 1
  return result({ ...state, seat: { owner: action.client, version }, receipts: { ...state.receipts, [action.key.trim()]: { client: action.client, version } } },
    true, `Client ${action.client} atomically reserved A-12 at v${version} and recorded its request receipt. Other detached snapshots stay stale.`,
    affected, ['BEGIN transaction', `UPDATE Seat SET owner=${action.client}, version=${version} WHERE owner IS NULL AND version=${snapshot.version}`, 'INSERT request receipt', 'COMMIT'])
}

// 10. Each producer step exposes one check-then-act boundary.
export type ProducerId = 'P' | 'Q'
export type QueueState = { locked: boolean; owner: ProducerId | null; items: string[]; nextItem: number; producers: Record<ProducerId, { phase: 'idle' | 'checked'; observed: number | null }> }
export type QueueAction = { type: 'mode'; locked: boolean } | { type: 'step'; producer: ProducerId } | { type: 'consume' }
export const initialQueue = (): QueueState => ({ locked: true, owner: null, items: [], nextItem: 1, producers: { P: { phase: 'idle', observed: null }, Q: { phase: 'idle', observed: null } } })
export function changeQueue(state: QueueState, action: QueueAction): ExperimentResult<QueueState> {
  if (action.type === 'mode') {
    if (state.producers.P.phase !== 'idle' || state.producers.Q.phase !== 'idle') return result(state, false,
      'Do not change the synchronization policy inside an in-flight operation. Finish both producers or reset.', ['Mutex', 'Producer P', 'Producer Q'])
    if (action.locked && state.items.length > 1) return result(state, false,
      'Enabling a mutex cannot repair an already overfull queue. Consume the extra item or reset before enabling the protected policy.', ['Mutex', 'BoundedQueue'])
    return result({ ...state, locked: action.locked }, true, action.locked ? 'One mutex now protects both capacity check and enqueue.' : 'Unsafe mode: individual pushes remain atomic, but check + push is not.', ['Mutex'], [], !action.locked)
  }
  if (action.type === 'consume') {
    if (state.owner) return result(state, false, `Consumer waits: ${state.owner} owns the mutex. It cannot modify the protected queue.`, ['Mutex', 'BoundedQueue'], [], true)
    if (!state.items.length) return result(state, false, 'Queue empty: consumer waits without holding the mutex.', ['BoundedQueue'], [], true)
    return result({ ...state, items: state.items.slice(1) }, true, `Removed ${state.items[0]} in FIFO order. Capacity is now available; a waiting producer may try again.`,
      ['BoundedQueue'], ['Consumer → acquire if enabled', 'dequeue (linearization point)', 'signal notFull', 'release'])
  }
  const id = action.producer
  const worker = state.producers[id]
  if (state.locked && state.owner && state.owner !== id) return result(state, false, `${id} waits; ${state.owner} still owns the check-and-enqueue critical section.`, ['Mutex', `Producer ${id}`], [`${id} → lock.acquire(): blocked`], true)
  if (worker.phase === 'idle') {
    if (state.items.length >= 1) return result(state, false, 'Capacity is 1 and the queue is full. A condition wait releases the mutex; a consumer must free space before retry.', ['BoundedQueue', `Producer ${id}`, 'Mutex'], [`${id} → check size`, 'notFull wait; release mutex'], true)
    return result({ ...state, owner: state.locked ? id : null, producers: { ...state.producers, [id]: { phase: 'checked', observed: state.items.length } } },
      true, `${id} observed size ${state.items.length} < 1. ${state.locked ? 'It retains the mutex until its next step enqueues.' : 'It has no lock; this observation can be invalidated by another producer.'}`,
      ['Mutex', `Producer ${id}`], [`${id} → ${state.locked ? 'acquire mutex' : 'no lock'}`, `${id} → check capacity`, 'pause before enqueue'], !state.locked)
  }
  const items = [...state.items, `${id}${state.nextItem}`]
  const next = { ...state, items, nextItem: state.nextItem + 1, owner: null, producers: { ...state.producers, [id]: { phase: 'idle' as const, observed: null } } }
  const valid = items.length <= 1
  return result(next, valid,
    valid ? `${id} enqueued at the linearization point, then released the lock if held.`
      : `Invariant broken: size is ${items.length} > capacity 1. ${id} trusted its earlier observation; an atomic push did not make check + push atomic.`,
    ['BoundedQueue', 'Mutex', `Producer ${id}`], [`${id} → enqueue using saved capacity check`, `size = ${items.length}`, 'release mutex if held'])
}

// 11. Decimal strings are parsed to integer minor units; no floating-point balances.
export function parseMinorUnits(value: string): number | null {
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(value.trim())) return null
  const [wholePart, fraction = ''] = value.trim().split('.')
  const amount = Number(wholePart) * 100 + Number(fraction.padEnd(2, '0'))
  return whole(amount, 0, 1000000000) ? amount : null
}
export type SplitState = { balances: [number, number, number]; expenses: number; lastSplit: [number, number, number] | null; total: number }
export type SplitAction = { type: 'expense'; total: string; mode: 'equal' | 'exact' | 'percent'; shares: [string, string, string]; currency: 'USD' | 'EUR' }
  | { type: 'settle'; member: 1 | 2; amount: string; currency: 'USD' | 'EUR' }
export const initialSplit = (): SplitState => ({ balances: [0, 0, 0], expenses: 0, lastSplit: null, total: 0 })
export function changeSplit(state: SplitState, action: SplitAction): ExperimentResult<SplitState> {
  const affected = ['Expense', 'Ada', 'Ben', 'Cora']
  if (action.currency !== 'USD') return result(state, false, 'This ledger is USD. EUR requires a separate ledger or an explicit FX policy; never add different currencies.', affected)
  if (action.type === 'settle') {
    const amount = parseMinorUnits(action.amount)
    if (amount === null || amount <= 0) return result(state, false, 'Settlement needs a positive amount with at most two decimal places.', affected)
    if (amount > -state.balances[action.member] || amount > state.balances[0]) return result(state, false, 'Settlement exceeds this member’s debt or Ada’s credit. No balances changed.', affected)
    const balances = [...state.balances] as SplitState['balances']
    balances[action.member] += amount
    balances[0] -= amount
    return result({ ...state, balances }, true, 'Transferred debt to zero by equal and opposite entries. This records a settlement; it does not send money.', affected, [`debtor +${amount}¢`, `Ada −${amount}¢`, 'sum(balances) = 0'])
  }
  const total = parseMinorUnits(action.total)
  if (total === null || total <= 0) return result(state, false, 'Total must be positive money with at most two decimal places (maximum $10,000,000).', ['Expense'])
  let split: number[]
  if (action.mode === 'equal') {
    split = [0, 1, 2].map(i => Math.floor(total / 3) + (i < total % 3 ? 1 : 0))
  } else {
    const parsed = action.shares.map(parseMinorUnits)
    if (parsed.some(n => n === null)) return result(state, false, 'All shares must be nonnegative decimal values with at most two places.', affected)
    const shares = parsed as number[]
    const required = action.mode === 'exact' ? total : 10000
    if (shares.reduce((a, b) => a + b, 0) !== required) return result(state, false,
      action.mode === 'exact' ? 'Exact shares must sum to the expense total, down to the cent.' : 'Percentages must sum to exactly 100.00% (10,000 basis points).', affected)
    if (action.mode === 'exact') split = shares
    else {
      split = shares.map(n => Math.floor(total * n / 10000))
      const remainder = total - split.reduce((a, b) => a + b, 0)
      const order = shares.map((n, index) => ({ index, remainder: total * n % 10000 })).sort((a, b) => b.remainder - a.remainder || a.index - b.index)
      for (let i = 0; i < remainder; i++) split[order[i].index] += 1
    }
  }
  const balances = state.balances.map((balance, i) => balance + (i === 0 ? total : 0) - split[i]) as SplitState['balances']
  if (balances.some(balance => !Number.isSafeInteger(balance))) return result(state, false, 'Ledger would exceed safe integer precision; no expense posted.', affected)
  return result({ balances, expenses: state.expenses + 1, total, lastSplit: split as SplitState['lastSplit'] }, true,
    `Posted ${total}¢: shares ${split.join(' + ')} = ${total}¢; net balances sum to zero. ${action.mode === 'percent' ? 'Remainder cents follow largest fractional remainder, then member order.' : action.mode === 'equal' ? 'Remainder cents follow Ada, Ben, Cora order.' : 'Exact shares need no rounding.'}`,
    affected, ['Money.parse → integer cents', 'SplitPolicy.validate', 'compute and allocate remainder', 'Ledger.post atomically'])
}

// 12. Candidate providers run through the existing caller contract before deployment.
export type ProviderCandidate = 'legacy' | 'raw-v2' | 'adapter-v2'
type RefundResponse = { ok: true; refundId: string; refundedMinor: number } | { ok: false; error: 'provider-failed' | 'invalid-amount' | 'over-refund' | 'key-conflict' | 'incompatible' }
type RefundLedger = { refunded: number; calls: number; receipts: Record<string, { amount: number; result: RefundResponse }> }
export type CapstoneState = { deployed: ProviderCandidate; candidate: ProviderCandidate | null; checks: ExperimentCheck[]; deployments: number; ledger: RefundLedger; last: RefundResponse | null }
export type CapstoneAction = { type: 'review' | 'deploy'; candidate: ProviderCandidate } | { type: 'refund'; amount: number; key: string; fail: boolean }
export const initialCapstone = (): CapstoneState => ({ deployed: 'legacy', candidate: null, checks: [], deployments: 0, ledger: { refunded: 0, calls: 0, receipts: {} }, last: null })

function providerFixture(candidate: ProviderCandidate, amount: number, fail: boolean): { sentMinor: number; response: unknown } {
  if (candidate === 'legacy') return { sentMinor: amount, response: fail ? { ok: false, error: 'provider-failed' } : { ok: true, refundId: 'old-refund', refundedMinor: amount } }
  const majorUnits = candidate === 'adapter-v2' ? amount / 100 : amount
  const vendor = fail ? { state: 'FAILED', reference: null, money: majorUnits } : { state: 'DONE', reference: 'new-refund', money: majorUnits }
  const response = candidate === 'raw-v2' ? vendor : vendor.state === 'DONE'
    ? { ok: true, refundId: vendor.reference, refundedMinor: Math.round(vendor.money * 100) }
    : { ok: false, error: 'provider-failed' }
  return { sentMinor: Math.round(majorUnits * 100), response }
}

function refund(ledger: RefundLedger, candidate: ProviderCandidate, amount: number, key: string, fail: boolean): { ledger: RefundLedger; response: RefundResponse } {
  const reject = (error: Extract<RefundResponse, { ok: false }>['error']) => ({ ledger, response: { ok: false as const, error } })
  if (!whole(amount, 1, 10000) || !/^[a-zA-Z0-9-]{1,24}$/.test(key)) return reject('invalid-amount')
  const previous = Object.hasOwn(ledger.receipts, key) ? ledger.receipts[key] : undefined
  if (previous) return previous.amount === amount ? { ledger, response: previous.result } : reject('key-conflict')
  if (ledger.refunded + amount > 10000) return reject('over-refund')
  const call = providerFixture(candidate, amount, fail)
  const response = call.response as Partial<RefundResponse>
  const afterCall = { ...ledger, calls: ledger.calls + 1 }
  if (response.ok === false && 'error' in response && response.error === 'provider-failed') return { ledger: afterCall, response: { ok: false, error: 'provider-failed' } }
  if (!(response.ok === true && 'refundedMinor' in response && response.refundedMinor === amount && 'refundId' in response && typeof response.refundId === 'string') || call.sentMinor !== amount) {
    return { ledger: afterCall, response: { ok: false, error: 'incompatible' } }
  }
  const accepted: RefundResponse = { ok: true, refundId: `${response.refundId}-${ledger.calls + 1}`, refundedMinor: amount }
  return { ledger: { ...afterCall, refunded: ledger.refunded + amount, receipts: { ...ledger.receipts, [key]: { amount, result: accepted } } }, response: accepted }
}

export function providerChecks(candidate: ProviderCandidate): ExperimentCheck[] {
  const empty: RefundLedger = { refunded: 0, calls: 0, receipts: {} }
  const normal = providerFixture(candidate, 1000, false)
  const failed = providerFixture(candidate, 1000, true)
  const first = refund(empty, candidate, 1000, 'r-1', false)
  const replay = refund(first.ledger, candidate, 1000, 'r-1', false)
  const tooMuch = refund(first.ledger, candidate, 9500, 'r-2', false)
  const failure = refund(empty, candidate, 1000, 'r-fail', true)
  const body = normal.response as Partial<Extract<RefundResponse, { ok: true }>>
  return [
    check('Provider receives exactly $10.00', 1000, normal.sentMinor),
    check('Existing caller gets the v1 success shape', { ok: true, amount: 1000, idType: 'string' }, { ok: body.ok, amount: body.refundedMinor, idType: typeof body.refundId }),
    check('Provider failure uses the v1 error contract', { ok: false, error: 'provider-failed' }, failed.response),
    check('Retry keeps one external effect', { refunded: 1000, calls: 1, sameReceipt: true }, { refunded: replay.ledger.refunded, calls: replay.ledger.calls, sameReceipt: JSON.stringify(first.response) === JSON.stringify(replay.response) }),
    check('Partial-refund limit is guarded', { ok: false, error: 'over-refund' }, tooMuch.response),
    check('Provider failure leaves money unchanged', { refunded: 0, error: 'provider-failed' }, { refunded: failure.ledger.refunded, error: failure.response.ok ? null : failure.response.error }),
  ]
}

export function changeCapstone(state: CapstoneState, action: CapstoneAction): ExperimentResult<CapstoneState> {
  if (action.type === 'refund') {
    const applied = refund(state.ledger, state.deployed, action.amount, action.key.trim(), action.fail)
    const replay = applied.ledger === state.ledger && applied.response.ok
    return result({ ...state, ledger: applied.ledger, last: applied.response }, applied.response.ok,
      applied.response.ok ? replay ? 'Returned the saved refund receipt. No additional provider call or money movement.'
        : `Refunded ${action.amount}¢ through ${state.deployed}; ${10000 - applied.ledger.refunded}¢ remains refundable.`
        : `Refund rejected: ${applied.response.error}. ${applied.response.error === 'provider-failed' ? 'Provider attempt is observable; money and receipts are unchanged. Failures are not cached, so the same key may retry.' : 'No refund committed.'}`,
      ['RefundService', 'PaymentPort', 'ProviderAdapter', 'RefundLedger'],
      ['RefundService → validate + lookup key', `PaymentPort → ${state.deployed}`, applied.response.ok ? 'commit or replay receipt' : 'typed failure; preserve monetary invariant'])
  }
  const checks = providerChecks(action.candidate)
  const passed = checks.every(c => c.pass)
  const deploy = action.type === 'deploy' && passed
  return result({ ...state, candidate: action.candidate, checks, deployed: deploy ? action.candidate : state.deployed, deployments: state.deployments + (deploy ? 1 : 0) }, passed,
    passed ? deploy ? 'All compatibility checks passed. Switched the composition binding; existing callers and refund history remain unchanged.'
      : 'Candidate passes the existing caller, money-unit, failure, idempotency and partial-refund checks. Review alone does not deploy.'
      : 'Compatibility gate failed. Provider v2 exposes major units and a different response schema; the deployed provider is unchanged.',
    ['FitnessSuite', 'PaymentPort', 'ProviderAdapter', 'RefundService'],
    ['assemble isolated candidate fixture', 'execute six contract cases', deploy ? 'publish binding only' : 'keep current binding'])
}
