import assert from 'node:assert/strict'
import test from 'node:test'
import {
  architectureModel, balanceModel, bounded, cacheModel, estimateModel, idempotencyModel,
  indexModel, queueModel, raftModel, recoveryModel, replicationModel, retryModel, shardModel,
} from './hldExperimentEngine.ts'

// Run with Node 22.6+: node --experimental-strip-types --test src\data\hldExperimentEngine.test.mjs
test('guards reject non-finite numbers and bound model inputs', () => {
  assert.equal(bounded(NaN, 1, 10), 1)
  assert.equal(bounded(Infinity, 1, 10), 1)
  assert.equal(bounded(-3, 1, 10), 1)
  assert.equal(balanceModel({ requests: 9000, workers: NaN, failed: false, shared: true }).requests, 3000)
})

test('healthy workers do not remove the database bottleneck or local-session problem', () => {
  const result = balanceModel({ requests: 1800, workers: 6, failed: false, shared: false })
  assert.equal(result.served, 1000)
  assert.equal(result.sessionFound, false)
  assert.equal(balanceModel({ requests: 100, workers: 1, failed: true, shared: true }).served, 0)
})

test('estimates use mean latency and a thirty-day time SLO', () => {
  const result = estimateModel({ users: 432000, peak: 10, slo: 0.999, badMinutes: 10 })
  assert.equal(result.averageQps, 100)
  assert.equal(result.peakQps, 1000)
  assert.equal(result.concurrency, 200)
  assert.ok(Math.abs(result.budgetMinutes - 43.2) < 1e-8)
  assert.equal(result.fiveYearGB, 788.4)
})

test('idempotency replays, rejects payload conflicts, and expires at the TTL boundary', () => {
  const input = { attempts: 3, spacing: 5, ttl: 10, enabled: true, conflict: false }
  assert.deepEqual(idempotencyModel(input).rows.map(row => row.outcome), ['created', 'replayed', 'created'])
  assert.equal(idempotencyModel({ ...input, ttl: 60, conflict: true }).conflicts, 1)
  assert.equal(idempotencyModel({ ...input, enabled: false }).effects, 3)
})

test('unmatched indexes still cost writes but do not accelerate a scan', () => {
  const result = indexModel({ rows: 1000000, indexes: 5, matches: false })
  assert.equal(result.readPages, 10000)
  assert.equal(result.writeTargets, 6)
  assert.equal(indexModel({ rows: 1000000, indexes: 1, matches: true }).readPages, 4)
})

test('expiry boundaries, stale hits, jitter, and coalescing change actual cache work', () => {
  const input = { ttl: 60, time: 60, burst: 1000, jitter: false, coalesce: false, outage: false }
  assert.equal(cacheModel(input).sourceReads, 1000)
  assert.equal(cacheModel({ ...input, coalesce: true }).sourceReads, 20)
  assert.equal(cacheModel({ ...input, time: 59 }).staleHits, 1000)
  assert.equal(cacheModel({ ...input, time: 29 }).staleHits, 0)
  const spread = cacheModel({ ...input, jitter: true })
  assert.ok(spread.misses > 0 && spread.misses < 1000)
  assert.equal(cacheModel({ ...input, time: 0, outage: true }).hits, 0)
})

test('stale follower reads never duplicate an authoritative conditional reservation', () => {
  const input = { lag: 5, elapsed: 1, partition: false, readLeader: false, atomic: true }
  assert.equal(replicationModel(input).observedFree, true)
  assert.equal(replicationModel(input).confirmations, 1)
  assert.equal(replicationModel({ ...input, atomic: false }).confirmations, 2)
  assert.equal(replicationModel({ ...input, elapsed: 5 }).observedFree, false)
  assert.equal(replicationModel({ ...input, elapsed: 10, partition: true }).observedFree, true)
  assert.equal(replicationModel({ ...input, readLeader: true, atomic: false }).confirmations, 1)
})

test('adding a ring member moves keys only to the newcomer; hot-key traffic is conserved', () => {
  const input = { shards: 3, virtualNodes: 16, hotPercent: 80, addNode: true, ring: true }
  const result = shardModel(input)
  result.after.forEach((owner, key) => assert.ok(owner === result.before[key] || owner === 3))
  assert.ok(Math.abs(result.nodes.reduce((sum, node) => sum + node.trafficPercent, 0) - 100) < 1e-8)
  assert.ok(result.nodes[result.hotOwner].trafficPercent >= 80)
  assert.equal(shardModel({ ...input, addNode: false }).moved, 0)
})

test('queue dedup protects effects; backpressure bounds backlog; poison messages reach the DLQ', () => {
  const input = { arrivals: 10, consumers: 40, poisonPercent: 0, duplicates: true, deduplicate: true, dlq: true, backpressure: false, seconds: 10 }
  assert.equal(queueModel(input).duplicateEffects, 0)
  assert.equal(queueModel({ ...input, deduplicate: false }).duplicateEffects, 20)
  const overloaded = queueModel({ ...input, arrivals: 50, consumers: 5, poisonPercent: 30, backpressure: true, seconds: 60 })
  assert.ok(overloaded.backlog <= 80)
  assert.ok(overloaded.rejected > 0)
  assert.ok(queueModel({ ...input, poisonPercent: 30, seconds: 60 }).deadLetters > 0)
})

test('Raft election and entry replication each require a majority', () => {
  const input = { nodes: 5, sideA: 2, candidateA: true, acknowledgments: 5, stage: 2 }
  assert.equal(raftModel(input).elected, false)
  assert.equal(raftModel(input).commitIndex, 4)
  assert.equal(raftModel({ ...input, candidateA: false, acknowledgments: 2 }).elected, true)
  assert.equal(raftModel({ ...input, candidateA: false, acknowledgments: 2 }).committed, false)
  assert.equal(raftModel({ ...input, candidateA: false }).commitIndex, 5)
})

test('nested retries amplify; propagated deadlines cap attempts; healthy calls do not retry', () => {
  const input = { layers: 3, retries: 2, latency: 600, timeout: 20, deadline: 3000, backoff: false, jitter: false, breaker: false }
  assert.equal(retryModel(input).amplification, 27)
  assert.equal(retryModel({ ...input, deadline: 100 }).amplification, 5)
  assert.equal(retryModel({ ...input, latency: 20 }).attempts, 100)
  assert.equal(retryModel({ ...input, breaker: true }).attempts, 0)
  assert.equal(retryModel({ ...input, breaker: true }).fallbacks, 100)
  assert.ok(retryModel({ ...input, backoff: true, jitter: true, deadline: 100 }).longest <= 100)
})

test('wrong-data monitoring contains a 200-OK release; replicas cannot restore clean data', () => {
  const input = { canary: 10, wrongPercent: 20, monitor: true, backupAge: 5, restoreMinutes: 10, isolated: true }
  const detected = recoveryModel(input)
  assert.equal(detected.wrongResponses, 200)
  assert.equal(detected.lossWindow, 10)
  assert.equal(detected.recoveryMinutes, 15)
  assert.equal(detected.rpoMet, true)
  assert.equal(recoveryModel({ ...input, monitor: false }).wrongResponses, 10200)
  assert.equal(recoveryModel({ ...input, isolated: false }).clean, false)
  assert.equal(recoveryModel({ ...input, isolated: false }).rtoMet, false)
})

test('architecture queue moves work, strict freshness bypasses cache, spare region preserves service', () => {
  const input = { reads: 1200, workers: 3, shards: 2, cache: true, fresh: false, queue: false, regions: 1, outage: false }
  const synchronous = architectureModel(input)
  const queued = architectureModel({ ...input, queue: true })
  assert.ok(queued.servedReads > synchronous.servedReads)
  assert.ok(queued.backlog > 0)
  assert.equal(queued.creates, 20)
  assert.equal(architectureModel({ ...input, fresh: true }).hitRate, 0)
  assert.equal(architectureModel({ ...input, outage: true }).servedReads, 0)
  assert.ok(architectureModel({ ...input, outage: true, regions: 2 }).servedReads > 0)
})
