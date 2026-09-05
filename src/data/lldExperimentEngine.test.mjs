// Run: node --experimental-strip-types --test src\data\lldExperimentEngine.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  initialResponsibilities, changeResponsibilities, initialParking, changeParking,
  initialVending, changeVending, initialRefactor, changeRefactor,
  initialConstruction, changeConstruction, initialBehavior, changeBehavior,
  initialWrappers, changeWrappers, initialAuction, changeAuction,
  initialReservation, changeReservation, initialQueue, changeQueue,
  initialSplit, changeSplit, parseMinorUnits, initialCapstone, changeCapstone, providerChecks,
} from './lldExperimentEngine.ts'

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    Object.values(value).forEach(freeze)
  }
  return value
}
function run(reducer, initial, actions) {
  return actions.reduce((state, action) => reducer(freeze(state), freeze(action)).state, initial)
}
const reserve = (client, key = `reserve-${client}`) => ({ type: 'reserve', client, key })
const quote = overrides => ({ authorized: true, order: 'auth-first', adapt: true, cents: 1250, ...overrides })
const expense = overrides => ({ type: 'expense', total: '10.00', mode: 'equal', shares: ['0', '0', '0'], currency: 'USD', ...overrides })
const refund = overrides => ({ type: 'refund', amount: 1000, key: 'refund-1', fail: false, ...overrides })

test('W1: a breaking concrete API reaches Checkout and its callers', () => {
  const next = changeResponsibilities(freeze(initialResponsibilities()), { architecture: 'concrete', pressure: 'payment' })
  assert.deepEqual(next.state.edited, ['VendorSDK', 'Checkout'])
  assert.deepEqual(next.state.reviewed, ['ReceiptUI', 'RetryJob'])
})
test('W1: stable ports contain all three modeled changes', () => {
  for (const pressure of ['payment', 'discount', 'notification']) {
    const next = changeResponsibilities(freeze(initialResponsibilities()), { architecture: 'ports', pressure })
    assert.equal(next.state.edited.includes('Checkout'), false)
    assert.equal(next.state.reviewed.includes('ReceiptUI'), false)
    assert.deepEqual(next.state.reviewed, ['CompositionRoot'])
    assert.equal(next.state.revision, 1)
  }
})
test('W2: value constructor rejects malformed and out-of-range sizes without mutation', () => {
  const state = freeze(initialParking())
  for (const size of [0, 4, 1.5, NaN, Infinity]) {
    const next = changeParking(state, { type: 'replace', size, permit: true, needsCharge: false })
    assert.equal(next.allowed, false)
    assert.equal(next.state, state)
  }
})
test('W2: size, permit and charging guards are independent', () => {
  for (const values of [
    { size: 3, permit: true, needsCharge: false },
    { size: 2, permit: false, needsCharge: false },
    { size: 2, permit: true, needsCharge: true },
  ]) {
    const state = changeParking(initialParking(), { type: 'replace', ...values }).state
    assert.equal(changeParking(freeze(state), { type: 'park' }).allowed, false)
    assert.equal(state.spot.occupant, null)
  }
})
test('W2: active allocation protects replacement and composition deletion', () => {
  const state = run(changeParking, initialParking(), [
    { type: 'replace', size: 2, permit: true, needsCharge: false }, { type: 'park' },
  ])
  assert.equal(state.spot.occupant, 'CAR-7')
  assert.equal(changeParking(state, { type: 'park' }).allowed, false)
  assert.equal(changeParking(state, { type: 'delete' }).allowed, false)
  assert.equal(changeParking(state, { type: 'replace', size: 3, permit: true, needsCharge: false }).allowed, false)
  const final = run(changeParking, state, [{ type: 'leave' }, { type: 'delete' }])
  assert.equal(final.spot, null)
  assert.equal(final.vehicle.id, 'CAR-7')
})
test('W3: idle dispense, insufficient credit, missing change and maintenance guards reject atomically', () => {
  assert.equal(changeVending(initialVending(), { type: 'dispense' }).allowed, false)
  let state = changeVending(initialVending(), { type: 'insert', cents: 100 }).state
  assert.equal(changeVending(freeze(state), { type: 'select' }).state, state)
  state = changeVending(state, { type: 'insert', cents: 100 }).state
  assert.equal(changeVending(freeze(state), { type: 'select' }).allowed, false)
  assert.equal(changeVending(state, { type: 'change' }).allowed, false)
  const cancelled = changeVending(state, { type: 'cancel' }).state
  assert.equal(cancelled.returned, 200)
  assert.equal(cancelled.credit, 0)
  assert.equal(cancelled.phase, 'Idle')
})
test('W3: cashbox, separate float, escrow and returned coins conserve money', () => {
  const state = run(changeVending, initialVending(), [
    { type: 'change' }, { type: 'insert', cents: 200 }, { type: 'select' }, { type: 'dispense' },
  ])
  assert.equal(state.stock, 1)
  assert.equal(state.dispensed, 1)
  assert.equal(state.cashbox, 200)
  assert.equal(state.float, 0)
  assert.equal(state.returned, 50)
  assert.equal(state.cashbox + state.float + state.credit + state.returned, 50 + 200)
})
test('W3: Ready locks coins, and depleted inventory cannot dispense again', () => {
  let state = run(changeVending, initialVending(), [
    { type: 'insert', cents: 100 }, { type: 'insert', cents: 50 }, { type: 'select' },
  ])
  assert.equal(state.phase, 'Ready')
  assert.equal(changeVending(state, { type: 'insert', cents: 50 }).allowed, false)
  state = run(changeVending, state, [
    { type: 'dispense' }, { type: 'insert', cents: 100 }, { type: 'insert', cents: 50 },
    { type: 'select' }, { type: 'dispense' }, { type: 'insert', cents: 200 },
  ])
  assert.equal(state.stock, 0)
  assert.equal(changeVending(state, { type: 'select' }).allowed, false)
  assert.equal(changeVending(state, { type: 'cancel' }).state.returned, 200)
})
test('W4: capture tests before extraction, enforce steps and execute characterization cases', () => {
  assert.equal(changeRefactor(initialRefactor(), 'extract-sort').allowed, false)
  let state = changeRefactor(initialRefactor(), 'test').state
  assert.equal(state.checks.length, 4)
  assert.ok(state.checks.every(c => c.pass))
  assert.equal(changeRefactor(state, 'extract-scheduler').allowed, false)
  state = run(changeRefactor, state, ['extract-sort', 'extract-scheduler'])
  assert.equal(state.stage, 'scheduler-extracted')
  assert.ok(state.checks.every(c => c.pass))
})
test('W4: an unsafe tie-breaking candidate actually fails and does not replace committed code', () => {
  const state = run(changeRefactor, initialRefactor(), ['test', 'extract-sort'])
  const next = changeRefactor(freeze(state), 'unsafe-tie')
  assert.equal(next.allowed, false)
  assert.equal(next.state.stage, 'sort-extracted')
  assert.deepEqual(next.state.checks.filter(c => !c.pass).map(c => c.name), ['Preserve insertion order for ties'])
  assert.notEqual(next.state.checks[2].actual, next.state.checks[2].expected)
  assert.equal(changeRefactor(next.state, 'extract-scheduler').allowed, true)
})
test('W5: constructor failures do not publish incomplete graphs', () => {
  const config = { environment: 'test', family: 'sandbox', credential: 'test-token', channel: 'email', timeout: 1000 }
  const initial = freeze(initialConstruction())
  assert.equal(changeConstruction(initial, { type: 'send' }).allowed, false)
  let next = changeConstruction(initial, { type: 'build', config: freeze(config) })
  assert.equal(next.allowed, true)
  const good = freeze(next.state)
  for (const patch of [{ environment: 'production' }, { credential: 'none' }, { family: 'live' }, { timeout: 0 }, { timeout: 10.5 }]) {
    next = changeConstruction(good, { type: 'build', config: { ...config, ...patch } })
    assert.equal(next.allowed, false)
    assert.equal(next.state.graph, good.graph)
    assert.equal(next.state.builds, 1)
  }
  assert.equal(changeConstruction(good, { type: 'send' }).state.sent, 1)
})
test('W5: production config creates a matching live provider family', () => {
  const next = changeConstruction(initialConstruction(), { type: 'build', config: { environment: 'production', family: 'live', credential: 'live-token', channel: 'sms', timeout: 10000 } })
  assert.equal(next.state.graph.client, 'live.smsClient')
  assert.equal(next.state.graph.signer, 'live.Signer')
})
test('W6: strategy calculation is independent of lifecycle permission', () => {
  const initial = freeze(initialBehavior())
  const hourly = changeBehavior(initial, { type: 'quote', strategy: 'hourly', hours: 10 }).state
  const weekend = changeBehavior(initial, { type: 'quote', strategy: 'weekend', hours: 10 }).state
  assert.equal(hourly.quote, 2000)
  assert.equal(weekend.quote, 600)
  assert.equal(weekend.document, 'Draft')
  assert.equal(changeBehavior(weekend, { type: 'publish' }).allowed, false)
  assert.equal(changeBehavior(weekend, { type: 'quote', strategy: 'hourly', hours: 0 }).allowed, false)
})
test('W6: guarded lifecycle supports review, withdrawal, editing and terminal publication', () => {
  let state = changeBehavior(initialBehavior(), { type: 'submit' }).state
  assert.equal(changeBehavior(state, { type: 'edit' }).allowed, false)
  state = run(changeBehavior, state, [{ type: 'withdraw' }, { type: 'edit' }, { type: 'submit' }, { type: 'publish' }])
  assert.equal(state.document, 'Published')
  assert.equal(state.revision, 2)
  assert.equal(changeBehavior(state, { type: 'withdraw' }).allowed, false)
})
test('W7: cache short-circuit actually bypasses an inner auth proxy', () => {
  const warm = changeWrappers(initialWrappers(), quote({})).state
  assert.equal(warm.calls, 1)
  assert.equal(warm.lastQuote, 1375)
  const unsafe = changeWrappers(freeze(warm), quote({ authorized: false, order: 'cache-first' }))
  assert.equal(unsafe.allowed, false)
  assert.equal(unsafe.state.leaked, true)
  assert.equal(unsafe.state.lastQuote, 1375)
  assert.equal(unsafe.state.calls, 1)
  assert.equal(unsafe.trace.some(t => t.startsWith('Authorization')), false)
  const safe = changeWrappers(warm, quote({ authorized: false }))
  assert.equal(safe.state.lastQuote, null)
  assert.equal(safe.state.leaked, false)
  assert.ok(safe.trace.includes('Authorization → deny'))
})
test('W7: raw units fail the contract and never enter the cache', () => {
  const next = changeWrappers(freeze(initialWrappers()), quote({ adapt: false }))
  assert.equal(next.allowed, false)
  assert.equal(next.state.cache, null)
  assert.equal(next.state.calls, 1)
  assert.match(next.why, /Unit contract failed/)
})
test('W7: correct decimal translation never creates a false rounding failure', () => {
  for (let cents = 1; cents <= 10000; cents++) {
    const next = changeWrappers(initialWrappers(), quote({ cents }))
    assert.equal(next.allowed, true, `quote ${cents}¢`)
    assert.equal(next.state.lastQuote, Math.floor((cents * 110 + 50) / 100))
  }
})
test('W8: queueing emits no event; synchronous observer failure does not roll back or skip audit', () => {
  let state = run(changeAuction, initialAuction(), [
    { type: 'subscribe', audit: true, notify: true, failNotify: true },
    { type: 'queue', amount: 1200 },
  ])
  assert.equal(state.bid, 1000)
  assert.equal(state.audits, 0)
  const next = changeAuction(freeze(state), { type: 'execute' })
  assert.equal(next.allowed, true)
  assert.equal(next.warning, true)
  assert.equal(next.state.bid, 1200)
  assert.equal(next.state.failures, 1)
  assert.equal(next.state.audits, 1)
  assert.equal(next.state.notifications, 0)
  assert.ok(next.trace.indexOf('NotifyObserver → throws; catch and record failure') < next.trace.indexOf('AuditObserver → appended'))
})
test('W8: stale queued commands are consumed without executing side effects', () => {
  const state = run(changeAuction, initialAuction(), [
    { type: 'queue', amount: 1200 }, { type: 'queue', amount: 1400 }, { type: 'execute' },
  ])
  const rejected = changeAuction(freeze(state), { type: 'execute' })
  assert.equal(rejected.allowed, false)
  assert.equal(rejected.state.bid, 1200)
  assert.equal(rejected.state.queue.length, 0)
  assert.equal(rejected.state.audits, 1)
})
test('W8: undo restores its own write but rejects an intervening write', () => {
  const state = run(changeAuction, initialAuction(), [{ type: 'queue', amount: 1200 }, { type: 'execute' }])
  const undone = changeAuction(freeze(state), { type: 'undo' })
  assert.equal(undone.state.bid, 1000)
  assert.equal(undone.state.version, 2)
  assert.equal(undone.state.undo, null)
  assert.equal(undone.state.notifications, 2)
  const external = changeAuction(state, { type: 'external' }).state
  const rejected = changeAuction(freeze(external), { type: 'undo' })
  assert.equal(rejected.allowed, false)
  assert.equal(rejected.state, external)
})
test('W8: unsubscribed observers do not see future events', () => {
  const state = run(changeAuction, initialAuction(), [
    { type: 'subscribe', audit: false, notify: false, failNotify: true }, { type: 'external' },
  ])
  assert.equal(state.bid, 1100)
  assert.equal(state.notifications + state.failures + state.audits, 0)
})
test('W9: interleaved read/read/write/write permits exactly one reservation', () => {
  const state = run(changeReservation, initialReservation(), [
    { type: 'read', client: 'A' }, { type: 'read', client: 'B' }, reserve('A'),
  ])
  const rejected = changeReservation(freeze(state), reserve('B'))
  assert.equal(rejected.allowed, false)
  assert.equal(rejected.state, state)
  assert.match(rejected.why, /Optimistic conflict/)
  assert.equal(state.seat.owner, 'A')
  assert.equal(state.seat.version, 2)
  const fresh = changeReservation(state, { type: 'read', client: 'B' }).state
  assert.match(changeReservation(fresh, reserve('B')).why, /already owned/)
})
test('W9: receipt replay is no second write and keys are payload-bound', () => {
  const state = run(changeReservation, initialReservation(), [{ type: 'read', client: 'A' }, reserve('A', 'r-1')])
  const replay = changeReservation(freeze(state), reserve('A', 'r-1'))
  assert.equal(replay.allowed, true)
  assert.equal(replay.state, state)
  assert.equal(changeReservation(state, reserve('B', 'r-1')).allowed, false)
  const released = run(changeReservation, state, [{ type: 'read', client: 'A' }, { type: 'release', client: 'A' }])
  const staleReplay = changeReservation(released, reserve('A', 'r-1'))
  assert.equal(staleReplay.allowed, true)
  assert.equal(staleReplay.state.seat.owner, null)
  assert.equal(staleReplay.state.seat.version, 3)
})
test('W9: release guards owner/version and receipt lookup excludes prototype keys', () => {
  let state = initialReservation()
  assert.equal(changeReservation(state, reserve('A')).allowed, false)
  state = run(changeReservation, state, [{ type: 'read', client: 'A' }, reserve('A', 'constructor')])
  assert.equal(state.seat.owner, 'A')
  assert.equal(Object.hasOwn(state.receipts, 'constructor'), true)
  assert.equal(changeReservation(state, { type: 'release', client: 'A' }).allowed, false)
  state = changeReservation(state, { type: 'read', client: 'B' }).state
  assert.equal(changeReservation(state, { type: 'release', client: 'B' }).allowed, false)
})
test('W10: deterministic unsafe interleaving breaks the bounded-queue invariant', () => {
  const state = run(changeQueue, initialQueue(), [
    { type: 'mode', locked: false }, { type: 'step', producer: 'P' }, { type: 'step', producer: 'Q' }, { type: 'step', producer: 'P' },
  ])
  const overflow = changeQueue(freeze(state), { type: 'step', producer: 'Q' })
  assert.equal(overflow.allowed, false)
  assert.deepEqual(overflow.state.items, ['P1', 'Q2'])
  assert.equal(changeQueue(overflow.state, { type: 'mode', locked: true }).allowed, false)
  assert.deepEqual(changeQueue(overflow.state, { type: 'consume' }).state.items, ['Q2'])
})
test('W10: mutex spans both steps, blocking producers and consumers until release', () => {
  const checked = changeQueue(initialQueue(), { type: 'step', producer: 'P' }).state
  assert.equal(checked.owner, 'P')
  assert.equal(changeQueue(freeze(checked), { type: 'step', producer: 'Q' }).state, checked)
  assert.equal(changeQueue(checked, { type: 'consume' }).state, checked)
  assert.equal(changeQueue(checked, { type: 'mode', locked: false }).allowed, false)
  const written = changeQueue(checked, { type: 'step', producer: 'P' }).state
  assert.equal(written.owner, null)
  assert.equal(written.items.length, 1)
  const full = changeQueue(written, { type: 'step', producer: 'Q' })
  assert.equal(full.warning, true)
  assert.equal(full.state.owner, null)
  const final = run(changeQueue, written, [{ type: 'consume' }, { type: 'step', producer: 'Q' }, { type: 'step', producer: 'Q' }])
  assert.deepEqual(final.items, ['Q2'])
})
test('W10: all protected six-step producer schedules preserve capacity', () => {
  const actors = [{ type: 'step', producer: 'P' }, { type: 'step', producer: 'Q' }, { type: 'consume' }]
  let states = [initialQueue()]
  for (let depth = 0; depth < 6; depth++) {
    states = states.flatMap(state => actors.map(action => changeQueue(freeze(state), action).state))
    assert.ok(states.every(state => state.items.length <= 1))
  }
})
test('W11: decimal parser rejects precision loss and malformed money', () => {
  assert.equal(parseMinorUnits('0.01'), 1)
  assert.equal(parseMinorUnits('10.1'), 1010)
  assert.equal(parseMinorUnits('33.33'), 3333)
  for (const input of ['-1', '1.001', '1e2', 'NaN', '', '0x10', '10000000.01']) assert.equal(parseMinorUnits(input), null)
})
test('W11: equal and percentage allocation conserve even a single cent', () => {
  assert.deepEqual(changeSplit(initialSplit(), expense({})).state.lastSplit, [334, 333, 333])
  const percentage = changeSplit(initialSplit(), expense({ mode: 'percent', shares: ['33.33', '33.33', '33.34'] })).state
  assert.deepEqual(percentage.lastSplit, [333, 333, 334])
  assert.equal(percentage.balances.reduce((a, b) => a + b, 0), 0)
  const oneCent = changeSplit(initialSplit(), expense({ total: '0.01', mode: 'percent', shares: ['33.33', '33.33', '33.34'] })).state
  assert.deepEqual(oneCent.lastSplit, [0, 0, 1])
  assert.deepEqual(oneCent.balances, [1, 0, -1])
})
test('W11: exact shares, percentages and currency validate before ledger mutation', () => {
  const state = freeze(initialSplit())
  for (const overrides of [
    { mode: 'exact', shares: ['3.33', '3.33', '3.33'] },
    { mode: 'percent', shares: ['33.33', '33.33', '33.33'] },
    { mode: 'percent', shares: ['-1', '50', '51'] },
    { currency: 'EUR' }, { total: '0' }, { total: '0.001' },
  ]) {
    const next = changeSplit(state, expense(overrides))
    assert.equal(next.allowed, false)
    assert.equal(next.state, state)
  }
  assert.deepEqual(changeSplit(state, expense({ mode: 'exact', shares: ['2', '3', '5'] })).state.balances, [800, -300, -500])
})
test('W11: settlements are balanced and cannot overpay or be applied twice', () => {
  const state = changeSplit(initialSplit(), expense({})).state
  const action = { type: 'settle', member: 1, amount: '3.33', currency: 'USD' }
  const next = changeSplit(freeze(state), action)
  assert.equal(next.allowed, true)
  assert.deepEqual(next.state.balances, [333, 0, -333])
  assert.equal(changeSplit(freeze(next.state), action).allowed, false)
  assert.equal(changeSplit(state, { ...action, amount: '3.34' }).allowed, false)
})
test('W11: percentages conserve totals across deterministic rounding cases', () => {
  for (let cents = 1; cents <= 1000; cents++) {
    const next = changeSplit(initialSplit(), expense({ total: (cents / 100).toFixed(2), mode: 'percent', shares: ['12.34', '56.78', '30.88'] }))
    assert.equal(next.allowed, true)
    assert.equal(next.state.lastSplit.reduce((a, b) => a + b, 0), cents)
    assert.equal(next.state.balances.reduce((a, b) => a + b, 0), 0)
    assert.ok(next.state.lastSplit.every(Number.isInteger))
  }
})
test('W12: old provider and adapted v2 pass real checks; raw v2 fails and cannot deploy', () => {
  assert.ok(providerChecks('legacy').every(c => c.pass))
  assert.ok(providerChecks('adapter-v2').every(c => c.pass))
  assert.ok(providerChecks('raw-v2').some(c => !c.pass))
  const initial = freeze(initialCapstone())
  const rejected = changeCapstone(initial, { type: 'deploy', candidate: 'raw-v2' })
  assert.equal(rejected.allowed, false)
  assert.equal(rejected.state.deployed, 'legacy')
  assert.equal(rejected.state.ledger, initial.ledger)
  const reviewed = changeCapstone(initial, { type: 'review', candidate: 'adapter-v2' })
  assert.equal(reviewed.allowed, true)
  assert.equal(reviewed.state.deployed, 'legacy')
})
test('W12: deployment changes only the binding; retries survive provider swaps', () => {
  const first = changeCapstone(initialCapstone(), refund({})).state
  const deployed = changeCapstone(freeze(first), { type: 'deploy', candidate: 'adapter-v2' }).state
  assert.equal(deployed.deployed, 'adapter-v2')
  assert.equal(deployed.ledger, first.ledger)
  const replay = changeCapstone(deployed, refund({})).state
  assert.equal(replay.ledger.calls, 1)
  assert.equal(replay.ledger.refunded, 1000)
  assert.deepEqual(replay.last, first.last)
  const newRefund = changeCapstone(replay, refund({ key: 'refund-2', amount: 1500 })).state
  assert.equal(newRefund.ledger.refunded, 2500)
  assert.match(newRefund.last.refundId, /new-refund/)
})
test('W12: partial-refund bounds, payload conflicts and explicit provider failure are guarded', () => {
  const first = changeCapstone(initialCapstone(), refund({})).state
  const changedPayload = changeCapstone(freeze(first), refund({ amount: 500 }))
  assert.equal(changedPayload.allowed, false)
  assert.equal(changedPayload.state.last.error, 'key-conflict')
  const tooMuch = changeCapstone(first, refund({ key: 'refund-2', amount: 9500 }))
  assert.equal(tooMuch.state.last.error, 'over-refund')
  assert.equal(tooMuch.state.ledger, first.ledger)
  const failed = changeCapstone(first, refund({ key: 'refund-fail', fail: true }))
  assert.equal(failed.allowed, false)
  assert.equal(failed.state.ledger.refunded, 1000)
  assert.equal(failed.state.ledger.calls, 2)
  assert.equal(Object.hasOwn(failed.state.ledger.receipts, 'refund-fail'), false)
  const retried = changeCapstone(failed.state, refund({ key: 'refund-fail' }))
  assert.equal(retried.allowed, true)
  assert.equal(retried.state.ledger.refunded, 2000)
})
