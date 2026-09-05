export type BookingPolicy = 'naive' | 'atomic'
export type BookingOwner = 'Maya' | 'Leo' | 'Nia' | 'Owen'
export type BookingSeatId = 'A7' | 'A8' | 'A9'
export type HoldPhase = 'free' | 'held' | 'confirmed' | 'expired'
export type BookingTone = 'info' | 'active' | 'verified' | 'conflict'

export interface SeatHold {
  seatId: BookingSeatId
  phase: HoldPhase
  owner: BookingOwner | null
  holdId: string | null
  expiresAt: number | null
  revision: number
}

export interface ExpiryEntry {
  seatId: BookingSeatId
  holdId: string
  expiresAt: number
  sequence: number
}

export interface BookingClaim {
  seatId: BookingSeatId
  owner: BookingOwner
  holdId: string
  expiresAt: number
  phase: Exclude<HoldPhase, 'free'> | 'released'
}

export interface ReadSnapshot {
  source: 'primary' | 'follower'
  phase: HoldPhase
  owner: BookingOwner | null
  revision: number
  at: number
}

export interface BookingEvent {
  id: number
  at: number
  lens: 'HLD' | 'LLD' | 'DSA' | 'CASE'
  tone: BookingTone
  title: string
  detail: string
}

export interface BookingState {
  policy: BookingPolicy
  now: number
  seats: Record<BookingSeatId, SeatHold>
  claims: BookingClaim[]
  heap: ExpiryEntry[]
  follower: ReadSnapshot
  reads: { Maya: ReadSnapshot | null; Leo: ReadSnapshot | null }
  replies: { Maya: 'accepted' | 'rejected' | null; Leo: 'accepted' | 'rejected' | null }
  requestStep: number
  nextHold: number
  nextEvent: number
  timeline: BookingEvent[]
  heapResult: { operation: 'peek' | 'pop'; entry: ExpiryEntry | null; detail: string } | null
}

export type BookingAction =
  | { type: 'reset'; policy?: BookingPolicy }
  | { type: 'next-request' }
  | { type: 'run-requests' }
  | { type: 'sync-follower' }
  | { type: 'advance'; seconds: number }
  | { type: 'reserve'; owner: BookingOwner; seatId?: BookingSeatId }
  | { type: 'confirm' | 'cancel'; owner: BookingOwner; holdId: string | null; seatId?: BookingSeatId }
  | { type: 'peek-expiry' }
  | { type: 'pop-expiry' }

export const HOLD_SECONDS = 6
export const BOOKING_SEATS: BookingSeatId[] = ['A7', 'A8', 'A9']

export function holdPhase(seat: SeatHold, now: number): HoldPhase {
  return seat.phase === 'held' && seat.expiresAt !== null && seat.expiresAt <= now ? 'expired' : seat.phase
}

export function liveClaims(state: BookingState, seatId: BookingSeatId): BookingClaim[] {
  return state.claims.filter((claim) => claim.seatId === seatId
    && (claim.phase === 'confirmed' || (claim.phase === 'held' && claim.expiresAt > state.now)))
}

export function bookingInvariant(state: BookingState): { ok: boolean; detail: string } {
  for (const seatId of BOOKING_SEATS) {
    const claims = liveClaims(state, seatId)
    if (claims.length > 1) {
      return { ok: false, detail: `${seatId} has ${claims.length} live promises: ${claims.map((claim) => claim.owner).join(' + ')}. One seat cannot honor both.` }
    }
    const seat = state.seats[seatId]
    const phase = holdPhase(seat, state.now)
    if (claims.some((claim) => claim.holdId !== seat.holdId || claim.owner !== seat.owner || claim.phase !== phase)
      || ((phase === 'held' || phase === 'confirmed') && claims.length !== 1)) {
      return { ok: false, detail: `${seatId}'s live promise does not match its authoritative SeatHold.` }
    }
  }
  return { ok: true, detail: 'At most one live promise per seat. Every live promise matches its authoritative owner and token.' }
}

function comesBefore(a: ExpiryEntry, b: ExpiryEntry) {
  return a.expiresAt < b.expiresAt || (a.expiresAt === b.expiresAt && a.sequence < b.sequence)
}

export function pushExpiry(heap: ExpiryEntry[], entry: ExpiryEntry): ExpiryEntry[] {
  const next = [...heap, entry]
  let index = next.length - 1
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2)
    if (!comesBefore(next[index], next[parent])) break
    ;[next[index], next[parent]] = [next[parent], next[index]]
    index = parent
  }
  return next
}

export function popExpiry(heap: ExpiryEntry[]): { entry: ExpiryEntry | null; heap: ExpiryEntry[] } {
  if (heap.length === 0) return { entry: null, heap: [] }
  const next = heap.slice()
  const entry = next[0]
  const last = next.pop()!
  if (next.length > 0) {
    next[0] = last
    let index = 0
    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let smallest = index
      if (left < next.length && comesBefore(next[left], next[smallest])) smallest = left
      if (right < next.length && comesBefore(next[right], next[smallest])) smallest = right
      if (smallest === index) break
      ;[next[index], next[smallest]] = [next[smallest], next[index]]
      index = smallest
    }
  }
  return { entry, heap: next }
}

function record(state: BookingState, lens: BookingEvent['lens'], tone: BookingTone, title: string, detail: string): BookingState {
  const event: BookingEvent = { id: state.nextEvent, at: state.now, lens, tone, title, detail }
  return { ...state, nextEvent: state.nextEvent + 1, timeline: [...state.timeline, event].slice(-80) }
}

function snapshot(seat: SeatHold, now: number, source: ReadSnapshot['source']): ReadSnapshot {
  return { source, phase: holdPhase(seat, now), owner: seat.owner, revision: seat.revision, at: now }
}

function grant(state: BookingState, seatId: BookingSeatId, owner: BookingOwner, duration = HOLD_SECONDS): BookingState {
  const holdId = `H${state.nextHold}`
  const expiresAt = state.now + duration
  const seat: SeatHold = { seatId, owner, holdId, expiresAt, phase: 'held', revision: state.seats[seatId].revision + 1 }
  return {
    ...state,
    nextHold: state.nextHold + 1,
    seats: { ...state.seats, [seatId]: seat },
    claims: [...state.claims, { seatId, owner, holdId, expiresAt, phase: 'held' }],
    heap: pushExpiry(state.heap, { seatId, holdId, expiresAt, sequence: state.nextHold }),
  }
}

export function createBookingState(policy: BookingPolicy = 'naive'): BookingState {
  const free = (seatId: BookingSeatId): SeatHold => ({ seatId, phase: 'free', owner: null, holdId: null, expiresAt: null, revision: 0 })
  let state: BookingState = {
    policy,
    now: 0,
    seats: { A7: free('A7'), A8: free('A8'), A9: free('A9') },
    claims: [],
    heap: [],
    follower: { source: 'follower', phase: 'free', owner: null, revision: 0, at: 0 },
    reads: { Maya: null, Leo: null },
    replies: { Maya: null, Leo: null },
    requestStep: 0,
    nextHold: 1,
    nextEvent: 1,
    timeline: [],
    heapResult: null,
  }
  state = grant(state, 'A8', 'Nia', 4)
  state = grant(state, 'A9', 'Owen', 9)
  return record(state, 'CASE', 'info', 'A7 is free. Two clients want it.', 'A8 / H1 and A9 / H2 are neighboring holds, expiring at t+4s and t+9s. Every lens uses this same clock and writer.')
}

function reserve(state: BookingState, owner: BookingOwner, seatId: BookingSeatId, policy: BookingPolicy, read: ReadSnapshot | null, lens: BookingEvent['lens']): BookingState {
  const seat = state.seats[seatId]
  const phase = holdPhase(seat, state.now)
  const allowed = policy === 'atomic'
    ? phase === 'free' || phase === 'expired'
    : read !== null && (read.phase === 'free' || read.phase === 'expired')
  if (!allowed) {
    return record(state, lens, 'conflict', `${owner}'s reservation refused`, policy === 'atomic'
      ? `The writer sees ${seatId} as ${phase}${seat.owner ? ` by ${seat.owner}` : ''}. Its check + update is one atomic operation; an advisory read cannot override it.`
      : 'This client did not read an available seat. The naive path only checks the earlier snapshot, not the current row.')
  }
  const next = grant(state, seatId, owner)
  const conflict = liveClaims(next, seatId).length > 1
  return record(next, lens, conflict ? 'conflict' : 'verified', `${owner} receives success · ${next.seats[seatId].holdId}`, conflict
    ? `The unchecked write replaced ${seat.owner}'s row with ${owner}'s. Both clients still have live success promises for ${seatId}; this is a lost update, not two physical seat rows.`
    : `${seatId} is held by ${owner} until t+${next.seats[seatId].expiresAt}s.${policy === 'atomic' ? ' The writer checked availability and reserved atomically.' : ' This first unchecked write happens to succeed.'}`)
}

function nextRequest(state: BookingState): BookingState {
  const step = state.requestStep
  if (step >= 4) return state
  const owner = step < 2 ? 'Maya' : 'Leo'
  let next = state
  if (step === 0 || step === 2) {
    const read = owner === 'Maya'
      ? snapshot(state.seats.A7, state.now, 'primary')
      : { ...state.follower, at: state.now }
    next = { ...state, reads: { ...state.reads, [owner]: read } }
    const stale = read.revision !== state.seats.A7.revision
    next = record(next, 'HLD', stale ? 'active' : 'info', `${owner} reads ${read.phase} · ${read.source} v${read.revision}`,
      stale
        ? `The writer is already v${state.seats.A7.revision}. Leo sees an older follower snapshot. “Free” is advisory, never a reservation.`
        : `A7 is ${read.phase} at this read. Even a fresh read does not lock the seat or make a later write safe.`)
  } else {
    const before = state.nextHold
    next = reserve(state, owner, 'A7', state.policy, state.reads[owner], 'HLD')
    next = { ...next, replies: { ...next.replies, [owner]: next.nextHold > before ? 'accepted' : 'rejected' } }
  }
  return { ...next, requestStep: step + 1 }
}

function transition(state: BookingState, action: Extract<BookingAction, { type: 'confirm' | 'cancel' }>): BookingState {
  const seatId = action.seatId ?? 'A7'
  const seat = state.seats[seatId]
  const phase = holdPhase(seat, state.now)
  const reason = phase !== 'held' ? `the hold is ${phase}, not live`
    : action.owner !== seat.owner ? `only ${seat.owner} owns this hold`
      : action.holdId !== seat.holdId ? 'the token is stale or missing'
        : null
  if (reason) {
    return record(state, 'LLD', 'conflict', `${action.type === 'confirm' ? 'Confirmation' : 'Cancellation'} rejected`, `${action.owner} cannot ${action.type} ${seatId}: ${reason}. The authoritative row is unchanged.`)
  }
  const confirming = action.type === 'confirm'
  const updated: SeatHold = confirming
    ? { ...seat, phase: 'confirmed', revision: seat.revision + 1 }
    : { seatId, phase: 'free', owner: null, holdId: null, expiresAt: null, revision: seat.revision + 1 }
  const next: BookingState = {
    ...state,
    seats: { ...state.seats, [seatId]: updated },
    claims: state.claims.map((claim) => claim.holdId === seat.holdId ? { ...claim, phase: confirming ? 'confirmed' : 'released' } : claim),
  }
  return record(next, 'LLD', 'verified', confirming ? `${seatId} confirmed for ${seat.owner}` : `${seatId} released by ${seat.owner}`,
    confirming
      ? `Owner, token and deadline matched in the same atomic transition. ${seat.holdId}'s old heap entry stays in the queue, but cannot expire a confirmed booking.`
      : `${seat.holdId} is no longer current. Its queued expiration is deliberately left behind; token matching makes lazy cleanup safe.`)
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'reset':
      return createBookingState(action.policy ?? state.policy)
    case 'next-request':
      return nextRequest(state)
    case 'run-requests': {
      let next = state
      while (next.requestStep < 4) next = nextRequest(next)
      return next
    }
    case 'sync-follower':
      return record({ ...state, follower: snapshot(state.seats.A7, state.now, 'follower') }, 'HLD', 'info', `Follower catches up to v${state.seats.A7.revision}`, 'This updates future follower reads. A snapshot already read by a client does not change.')
    case 'advance': {
      if (!Number.isSafeInteger(action.seconds) || action.seconds <= 0 || !Number.isSafeInteger(state.now + action.seconds + HOLD_SECONDS)) return state
      const next = { ...state, now: state.now + action.seconds }
      const due = state.heap.filter((entry) => entry.expiresAt <= next.now).length
      return record(next, 'CASE', 'active', `Clock advanced to t+${next.now}s`, `${due} queued expiration${due === 1 ? ' is' : 's are'} due. Deadlines already block confirmation; the DSA collector removes entries only when you step it.`)
    }
    case 'reserve':
      return reserve(state, action.owner, action.seatId ?? 'A7', 'atomic', null, 'LLD')
    case 'confirm':
    case 'cancel':
      return transition(state, action)
    case 'peek-expiry': {
      const entry = state.heap[0] ?? null
      const detail = entry
        ? `${entry.seatId} / ${entry.holdId} expires at t+${entry.expiresAt}s. ${entry.expiresAt <= state.now ? 'It is due; pop it to check the current owner token.' : `Wait ${entry.expiresAt - state.now}s before popping.`}`
        : 'The queue is empty. No expiration work remains.'
      return record({ ...state, heapResult: { operation: 'peek', entry, detail } }, 'DSA', 'info', 'Peek minimum · O(1)', detail)
    }
    case 'pop-expiry': {
      const root = state.heap[0]
      if (!root || root.expiresAt > state.now) {
        return record(state, 'DSA', 'active', 'Collector waits', root ? `The minimum is t+${root.expiresAt}s, later than this clock. No entry was removed.` : 'The heap is empty. No seat was changed.')
      }
      const { entry, heap } = popExpiry(state.heap)
      if (!entry) return state
      const seat = state.seats[entry.seatId]
      // A timer identifies one incarnation of a hold, never just a seat.
      const matches = seat.phase === 'held' && seat.holdId === entry.holdId
        && seat.expiresAt === entry.expiresAt && entry.expiresAt <= state.now
      const detail = matches
        ? `${entry.seatId} / ${entry.holdId} still matches the current held row and deadline. Marked expired; the seat can be acquired again.`
        : `${entry.seatId} / ${entry.holdId} is stale (${seat.phase === 'confirmed' ? 'booking is confirmed' : `current token is ${seat.holdId ?? 'none'}`}). Removed only the queue entry; the current reservation is untouched.`
      const next: BookingState = {
        ...state,
        heap,
        heapResult: { operation: 'pop', entry, detail },
        seats: matches ? { ...state.seats, [entry.seatId]: { ...seat, phase: 'expired', revision: seat.revision + 1 } } : state.seats,
        claims: matches ? state.claims.map((claim) => claim.holdId === entry.holdId ? { ...claim, phase: 'expired' } : claim) : state.claims,
      }
      return record(next, 'DSA', 'verified', `${matches ? 'Expired matching hold' : 'Skipped stale entry'} · ${entry.seatId} / ${entry.holdId}`, detail)
    }
  }
}

/** Dependency-free checks, callable from Node with TypeScript stripping or a test runner. */
export function runBookingModelChecks(): string[] {
  const passed: string[] = []
  const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const check = (name: string, run: () => void) => {
    try { run(); passed.push(name) } catch (error) {
      throw new Error(`Booking model check failed: ${name}`, { cause: error })
    }
  }
  const race = (policy: BookingPolicy) => bookingReducer(createBookingState(policy), { type: 'run-requests' })
  const held = () => bookingReducer(createBookingState('atomic'), { type: 'reserve', owner: 'Maya' })
  const drainDue = (state: BookingState) => {
    let next = state
    while (next.heap[0] && next.heap[0].expiresAt <= next.now) next = bookingReducer(next, { type: 'pop-expiry' })
    return next
  }

  check('naive stale-read race issues two promises and overwrites one row', () => {
    const state = race('naive')
    assert(state.reads.Leo?.revision === 0 && state.reads.Leo.phase === 'free', 'Leo must read the stale follower.')
    assert(state.replies.Maya === 'accepted' && state.replies.Leo === 'accepted', 'Both writes should acknowledge success.')
    assert(state.seats.A7.owner === 'Leo' && liveClaims(state, 'A7').length === 2 && !bookingInvariant(state).ok, 'Lost update must violate the promise invariant.')
  })
  check('atomic writer rejects conflict despite advisory free read', () => {
    const state = race('atomic')
    assert(state.reads.Leo?.phase === 'free' && state.replies.Leo === 'rejected', 'Writer must not trust the follower.')
    assert(state.seats.A7.owner === 'Maya' && liveClaims(state, 'A7').length === 1 && bookingInvariant(state).ok, 'Exactly one matching promise must survive.')
  })
  check('follower synchronization cannot revise a client snapshot', () => {
    let state = createBookingState()
    for (let i = 0; i < 3; i++) state = bookingReducer(state, { type: 'next-request' })
    state = bookingReducer(state, { type: 'sync-follower' })
    assert(state.follower.revision === 1 && state.reads.Leo?.revision === 0, 'Read snapshots must be immutable.')
    state = bookingReducer(state, { type: 'next-request' })
    assert(!bookingInvariant(state).ok, 'Catching up after the read cannot fix an unchecked write.')
  })
  check('owner and token guards reject without changing the authoritative row', () => {
    const state = held()
    const otherOwner = bookingReducer(state, { type: 'confirm', owner: 'Leo', holdId: state.seats.A7.holdId })
    const staleToken = bookingReducer(state, { type: 'confirm', owner: 'Maya', holdId: 'H0' })
    const otherCancel = bookingReducer(state, { type: 'cancel', owner: 'Leo', holdId: state.seats.A7.holdId })
    assert(otherOwner.seats === state.seats && staleToken.seats === state.seats && otherCancel.seats === state.seats, 'Rejected transitions may only append trace events.')
  })
  check('confirmation is rejected exactly at the deadline before cleanup', () => {
    const state = bookingReducer(held(), { type: 'advance', seconds: HOLD_SECONDS })
    const next = bookingReducer(state, { type: 'confirm', owner: 'Maya', holdId: state.seats.A7.holdId })
    assert(holdPhase(next.seats.A7, next.now) === 'expired' && next.seats === state.seats, 'TTL guard must not depend on the collector running.')
    assert(liveClaims(next, 'A7').length === 0 && bookingInvariant(next).ok, 'Expired promises are not live.')
  })
  check('confirmed bookings survive their old heap expiration', () => {
    let state = held()
    state = bookingReducer(state, { type: 'confirm', owner: 'Maya', holdId: state.seats.A7.holdId })
    state = drainDue(bookingReducer(state, { type: 'advance', seconds: 20 }))
    assert(state.seats.A7.phase === 'confirmed' && liveClaims(state, 'A7').length === 1 && bookingInvariant(state).ok, 'Cleanup must never expire a confirmed booking.')
    const rejected = bookingReducer(state, { type: 'reserve', owner: 'Leo' })
    assert(rejected.seats === state.seats, 'A confirmed seat cannot be reserved again.')
  })
  check('an old due token cannot release a newer live hold', () => {
    let state = held()
    const oldId = state.seats.A7.holdId
    state = bookingReducer(state, { type: 'advance', seconds: HOLD_SECONDS })
    state = bookingReducer(state, { type: 'reserve', owner: 'Leo' })
    const newSeat = state.seats.A7
    state = drainDue(state)
    assert(newSeat.holdId !== oldId && state.seats.A7 === newSeat && holdPhase(newSeat, state.now) === 'held', 'The new hold must be untouched by old expiry work.')
    assert(bookingInvariant(state).ok, 'Reacquiring a logically expired row must preserve exclusivity.')
  })
  check('cancel + reacquire preserves token identity even for equal deadlines', () => {
    let state = held()
    state = bookingReducer(state, { type: 'cancel', owner: 'Maya', holdId: state.seats.A7.holdId })
    assert(state.seats.A7.phase === 'free', 'Owner cancellation must return held to free.')
    state = bookingReducer(state, { type: 'reserve', owner: 'Leo' })
    state = bookingReducer(state, { type: 'advance', seconds: HOLD_SECONDS })
    state = bookingReducer(state, { type: 'pop-expiry' })
    const seatBeforeStalePop = state.seats.A7
    state = bookingReducer(state, { type: 'pop-expiry' })
    assert(state.seats.A7 === seatBeforeStalePop, 'Old H3 must not release H4 even when both deadlines equal 6.')
    state = bookingReducer(state, { type: 'pop-expiry' })
    assert(state.seats.A7.phase === 'expired', 'Only H4 can expire the replacement row.')
  })
  check('peek and an early pop leave heap and reservations unchanged', () => {
    const state = held()
    const peeked = bookingReducer(state, { type: 'peek-expiry' })
    const popped = bookingReducer(state, { type: 'pop-expiry' })
    assert(peeked.heap === state.heap && popped.heap === state.heap && popped.seats === state.seats, 'Collector must wait for the minimum deadline.')
  })
  check('matching expiration releases only its own seat', () => {
    const state = bookingReducer(held(), { type: 'advance', seconds: 4 })
    const next = bookingReducer(state, { type: 'pop-expiry' })
    assert(next.seats.A8.phase === 'expired' && next.seats.A7 === state.seats.A7 && next.seats.A9 === state.seats.A9, 'Root H1 belongs only to A8.')
    assert(bookingInvariant(next).ok, 'Valid cleanup must preserve the promise invariant.')
  })
  check('binary heap push/pop orders deadlines with stable token tie breaks', () => {
    let heap: ExpiryEntry[] = []
    const deadlines = [9, 4, 6, 1, 6, 12, 2, 4, 20, 0, 1, 17]
    deadlines.forEach((expiresAt, sequence) => {
      heap = pushExpiry(heap, { seatId: 'A7', holdId: `T${sequence}`, expiresAt, sequence })
      heap.forEach((entry, index) => assert(index === 0 || !comesBefore(entry, heap[Math.floor((index - 1) / 2)]), 'Heap order must hold after every push.'))
    })
    const removed: number[] = []
    while (heap.length) {
      const result = popExpiry(heap)
      assert(result.entry, 'A nonempty heap must produce a minimum.')
      removed.push(result.entry.sequence)
      heap = result.heap
      heap.forEach((entry, index) => assert(index === 0 || !comesBefore(entry, heap[Math.floor((index - 1) / 2)]), 'Heap order must hold after every pop.'))
    }
    const expected = deadlines.map((expiresAt, sequence) => ({ expiresAt, sequence })).sort((a, b) => a.expiresAt - b.expiresAt || a.sequence - b.sequence).map((entry) => entry.sequence)
    assert(JSON.stringify(removed) === JSON.stringify(expected), 'Pops must follow deadline then insertion order.')
    assert(popExpiry([]).entry === null, 'Empty pop must be safe.')
  })
  check('reducer is immutable, rejects invalid time and resets all lenses', () => {
    const initial = createBookingState()
    const serialized = JSON.stringify(initial)
    const changed = bookingReducer(initial, { type: 'run-requests' })
    assert(JSON.stringify(initial) === serialized, 'Previous state must not mutate.')
    assert(bookingReducer(initial, { type: 'advance', seconds: -1 }) === initial, 'Time cannot go backwards.')
    assert(bookingReducer(initial, { type: 'advance', seconds: NaN }) === initial, 'Time must be finite.')
    const reset = bookingReducer(changed, { type: 'reset', policy: 'atomic' })
    assert(reset.now === 0 && reset.requestStep === 0 && reset.seats.A7.phase === 'free' && reset.heap.length === 2 && reset.policy === 'atomic' && bookingInvariant(reset).ok, 'Reset must rebuild one coherent scenario.')
  })
  return passed
}
