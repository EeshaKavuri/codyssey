/** Small, deterministic teaching models. Units and excluded behavior are exposed in each lab. */
export function bounded(value: number, min: number, max: number, fallback = min): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function integer(value: number, min: number, max: number): number {
  return Math.round(bounded(value, min, max))
}

export function balanceModel(input: { requests: number; workers: number; failed: boolean; shared: boolean }) {
  const requests = integer(input.requests, 100, 3000)
  const workers = integer(input.workers, 1, 6)
  const active = workers - Number(input.failed)
  const appCapacity = active * 300
  const served = Math.min(requests, appCapacity, 1000)
  return {
    requests, workers, active, appCapacity, served,
    rejected: requests - served,
    loads: Array.from({ length: workers }, (_, i) => input.failed && i === workers - 1 ? 0 : requests / Math.max(1, active)),
    sessionFound: active > 0 && (input.shared || active === 1),
    bottleneck: active === 0 ? 'No healthy workers' : appCapacity < 1000 ? 'Application pool' : 'Shared database',
  }
}

export function estimateModel(input: { users: number; peak: number; slo: number; badMinutes: number }) {
  const dailyRequests = integer(input.users, 10000, 2000000) * 20
  const averageQps = dailyRequests / 86400
  const peakQps = averageQps * bounded(input.peak, 1, 20)
  const slo = bounded(input.slo, 0.99, 0.9999, 0.999)
  const budgetMinutes = 30 * 24 * 60 * (1 - slo)
  const badMinutes = bounded(input.badMinutes, 0, 120)
  return {
    averageQps, peakQps,
    concurrency: peakQps * 0.2,
    bandwidthMB: peakQps * 2000 / 1e6,
    peakWrites: peakQps * 0.1,
    fiveYearGB: dailyRequests * 0.1 * 500 * 365 * 5 / 1e9,
    budgetMinutes, badMinutes,
    remainingMinutes: budgetMinutes - badMinutes,
    burnedPercent: badMinutes / budgetMinutes * 100,
  }
}

export function idempotencyModel(input: { attempts: number; spacing: number; ttl: number; enabled: boolean; conflict: boolean }) {
  const attempts = integer(input.attempts, 1, 6)
  const spacing = integer(input.spacing, 1, 30)
  const ttl = integer(input.ttl, 5, 60)
  let effects = 0
  let record: { expires: number; payload: string; order: number } | undefined
  const rows = Array.from({ length: attempts }, (_, i) => {
    const time = i * spacing
    const payload = input.conflict && i === attempts - 1 && i > 0 ? '£25' : '£20'
    if (record && time >= record.expires) record = undefined
    if (input.enabled && record) {
      return { time, payload, order: record.order, outcome: record.payload === payload ? 'replayed' as const : 'conflict' as const }
    }
    effects += 1
    if (input.enabled) record = { expires: time + ttl, payload, order: effects }
    return { time, payload, order: effects, outcome: 'created' as const }
  })
  return {
    rows, effects,
    replays: rows.filter(row => row.outcome === 'replayed').length,
    conflicts: rows.filter(row => row.outcome === 'conflict').length,
  }
}

export function indexModel(input: { rows: number; indexes: number; matches: boolean }) {
  const rows = integer(input.rows, 1000, 1000000)
  const indexes = integer(input.indexes, 0, 5)
  const indexed = indexes > 0 && input.matches
  const scanPages = Math.ceil(rows / 100)
  const treeLevels = Math.max(1, Math.ceil(Math.log(rows) / Math.log(100)))
  return {
    rows, indexes, indexed, scanPages, treeLevels,
    readPages: indexed ? treeLevels + 1 : scanPages,
    writeTargets: indexes + 1,
    indexMB: rows * indexes * 24 / 1e6,
  }
}

export function cacheModel(input: { ttl: number; time: number; burst: number; jitter: boolean; coalesce: boolean; outage: boolean }) {
  const ttl = integer(input.ttl, 10, 120)
  const time = integer(input.time, 0, 150)
  const burst = integer(input.burst, 100, 5000)
  const keys = Array.from({ length: 20 }, (_, i) => {
    const expires = ttl + (input.jitter ? Math.round(ttl * 0.4 * (i / 19 - 0.5)) : 0)
    const requests = Math.floor(burst / 20) + Number(i < burst % 20)
    const miss = input.outage || time >= expires
    return { expires, requests, miss, stale: !miss && time >= 30 }
  })
  const misses = keys.reduce((sum, key) => sum + (key.miss ? key.requests : 0), 0)
  const sourceReads = input.coalesce ? keys.filter(key => key.miss).length : misses
  return {
    keys, burst, misses, sourceReads,
    hits: burst - misses,
    staleHits: keys.reduce((sum, key) => sum + (key.stale ? key.requests : 0), 0),
    overCapacity: Math.max(0, sourceReads - 60),
  }
}

export function replicationModel(input: { lag: number; elapsed: number; partition: boolean; readLeader: boolean; atomic: boolean }) {
  const lag = bounded(input.lag, 0, 10)
  const elapsed = bounded(input.elapsed, 0, 10)
  const followerCaughtUp = !input.partition && elapsed >= lag
  const observedFree = !input.readLeader && !followerCaughtUp
  // A already holds the primary's seat. A stale read is not a second successful conditional write.
  const acceptedB = observedFree && !input.atomic
  return {
    followerCaughtUp, observedFree, acceptedB,
    confirmations: acceptedB ? 2 : 1,
    primaryOwner: acceptedB ? 'B (blind overwrite)' : 'A',
    bOutcome: !observedFree ? 'B sees reserved; no write attempted' : input.atomic
      ? 'Primary rejects B: seat is already reserved'
      : 'Unsafe handler confirms B without checking the primary',
  }
}

function hash(value: string): number {
  let result = 2166136261
  for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619)
  result ^= result >>> 16
  result = Math.imul(result, 0x85ebca6b)
  result ^= result >>> 13
  result = Math.imul(result, 0xc2b2ae35)
  return (result ^ (result >>> 16)) >>> 0
}

export function shardModel(input: { shards: number; virtualNodes: number; hotPercent: number; addNode: boolean; ring: boolean }) {
  const baseCount = integer(input.shards, 2, 5)
  const count = baseCount + Number(input.addNode)
  const virtualNodes = integer(input.virtualNodes, 1, 16)
  const hotPercent = bounded(input.hotPercent, 0, 80)
  const ringFor = (size: number) => Array.from({ length: size * virtualNodes }, (_, i) => ({
    node: Math.floor(i / virtualNodes),
    position: hash(`node-${Math.floor(i / virtualNodes)}-v-${i % virtualNodes}`),
  })).sort((a, b) => a.position - b.position || a.node - b.node)
  const beforeRing = ringFor(baseCount)
  const afterRing = ringFor(count)
  const owner = (key: number, size: number, ring: typeof beforeRing) => {
    const position = hash(`key-${key}`)
    return input.ring ? (ring.find(token => token.position >= position) ?? ring[0]).node : position % size
  }
  const before = Array.from({ length: 240 }, (_, key) => owner(key, baseCount, beforeRing))
  const after = Array.from({ length: 240 }, (_, key) => owner(key, count, afterRing))
  const nodes = Array.from({ length: count }, (_, id) => ({ id, keys: 0, trafficPercent: 0 }))
  after.forEach((node, key) => {
    nodes[node].keys += 1
    nodes[node].trafficPercent += (100 - hotPercent) / 240 + (key === 0 ? hotPercent : 0)
  })
  return {
    before, after, nodes, tokens: afterRing,
    moved: before.filter((node, i) => node !== after[i]).length,
    hotOwner: after[0],
    maxQps: Math.max(...nodes.map(node => node.trafficPercent * 12)),
  }
}

export function queueModel(input: { arrivals: number; consumers: number; poisonPercent: number; duplicates: boolean; deduplicate: boolean; dlq: boolean; backpressure: boolean; seconds: number }) {
  const arrivals = integer(input.arrivals, 5, 50)
  const consumers = integer(input.consumers, 5, 40)
  const poisonPercent = integer(input.poisonPercent, 0, 30)
  const seconds = integer(input.seconds, 1, 60)
  type Message = { id: number; attempts: number; poison: boolean }
  const queue: Message[] = []
  const completed = new Set<number>()
  let nextId = 0
  let effects = 0
  let retries = 0
  let deadLetters = 0
  let rejected = 0
  let deduplicated = 0
  const history: { second: number; backlog: number; effects: number }[] = []
  for (let second = 1; second <= seconds; second += 1) {
    for (let i = 0; i < arrivals; i += 1) {
      const message = { id: nextId, attempts: 0, poison: hash(`message-${nextId}`) % 100 < poisonPercent }
      nextId += 1
      const copies = input.duplicates && message.id % 5 === 0 ? 2 : 1
      for (let copy = 0; copy < copies; copy += 1) {
        if (input.backpressure && queue.length >= 80) rejected += 1
        else queue.push({ ...message })
      }
    }
    const retryLater: Message[] = []
    const slots = Math.min(consumers, queue.length)
    for (let slot = 0; slot < slots; slot += 1) {
      const message = queue.shift()!
      if (message.poison) {
        message.attempts += 1
        if (input.dlq && message.attempts >= 3) deadLetters += 1
        else { retries += 1; retryLater.push(message) }
      } else if (input.deduplicate && completed.has(message.id)) {
        deduplicated += 1
      } else {
        effects += 1
        completed.add(message.id)
      }
    }
    queue.push(...retryLater)
    history.push({ second, backlog: queue.length, effects })
  }
  return {
    history, effects, retries, deadLetters, rejected, deduplicated,
    uniqueEffects: completed.size,
    duplicateEffects: effects - completed.size,
    backlog: queue.length,
  }
}

export function raftModel(input: { nodes: number; sideA: number; candidateA: boolean; acknowledgments: number; stage: number }) {
  const nodes = integer(input.nodes, 3, 7)
  const sideA = integer(input.sideA, 1, nodes)
  const component = input.candidateA ? sideA : nodes - sideA
  const quorum = Math.floor(nodes / 2) + 1
  const stage = integer(input.stage, 0, 2)
  const elected = stage >= 1 && component >= quorum
  const appended = elected && stage >= 2 ? integer(input.acknowledgments, 1, component) : 0
  const committed = appended >= quorum
  return { nodes, sideA, component, quorum, elected, appended, committed, votes: stage >= 1 ? component : 0, commitIndex: committed ? 5 : 4 }
}

export function retryModel(input: { layers: number; retries: number; latency: number; timeout: number; deadline: number; backoff: boolean; jitter: boolean; breaker: boolean }) {
  const layers = integer(input.layers, 1, 3)
  const retries = integer(input.retries, 0, 3)
  const latency = integer(input.latency, 20, 600)
  const timeout = integer(input.timeout, 20, 400)
  const deadline = integer(input.deadline, 100, 3000)
  const buckets: number[] = Array.from({ length: Math.ceil(deadline / 50) }, () => 0)
  let attempts = 0
  let successes = 0
  let deadlineMisses = 0
  let longest = 0
  const sample: { start: number; end: number; success: boolean }[] = []
  if (!input.breaker) {
    for (let caller = 0; caller < 100; caller += 1) {
      let clock = 0
      let callerAttempts = 0
      const execute = (layer: number): boolean => {
        for (let attempt = 0; attempt <= retries && clock < deadline; attempt += 1) {
          let success: boolean
          if (layer === layers) {
            const start = clock
            const remaining = deadline - clock
            success = latency <= timeout && latency <= remaining
            clock += Math.min(latency, timeout, remaining)
            attempts += 1
            callerAttempts += 1
            if (callerAttempts > 1) buckets[Math.floor(start / 50)] += 1
            if (caller === 0) sample.push({ start, end: clock, success })
          } else {
            success = execute(layer + 1)
          }
          if (success) return true
          if (input.backoff && attempt < retries && clock < deadline) {
            const factor = input.jitter ? 0.5 + hash(`${caller}-${layer}-${attempt}-${callerAttempts}`) / 4294967296 : 1
            clock = Math.min(deadline, clock + 50 * 2 ** attempt * factor)
          }
        }
        return false
      }
      if (execute(1)) successes += 1
      else if (clock >= deadline) deadlineMisses += 1
      longest = Math.max(longest, clock)
    }
  }
  return {
    attempts, successes, deadlineMisses, longest, buckets, sample,
    amplification: attempts / 100,
    theoretical: (retries + 1) ** layers,
    peakRetryBucket: Math.max(0, ...buckets),
    fallbacks: input.breaker ? 100 : 0,
  }
}

export function recoveryModel(input: { canary: number; wrongPercent: number; monitor: boolean; backupAge: number; restoreMinutes: number; isolated: boolean }) {
  const canary = bounded(input.canary, 1, 50)
  const wrongPercent = bounded(input.wrongPercent, 0, 100)
  const detected = input.monitor && wrongPercent >= 1
  const incident = wrongPercent > 0
  const exposureMinutes = detected ? 5 : 30
  const canaryWrong = 10000 * canary / 100 * wrongPercent / 100
  const wrongResponses = canaryWrong + (detected ? 0 : 50000 * wrongPercent / 100)
  const lossWindow = incident ? bounded(input.backupAge, 0, 120) + exposureMinutes : 0
  const recoveryMinutes = incident ? exposureMinutes + bounded(input.restoreMinutes, 5, 90) : 0
  const clean = !incident || input.isolated
  return {
    detected, incident, exposureMinutes, canaryWrong, wrongResponses, lossWindow, recoveryMinutes, clean,
    canaryCorrectPercent: 100 - wrongPercent,
    rpoMet: clean && lossWindow <= 15,
    rtoMet: clean && recoveryMinutes <= 30,
  }
}

export function architectureModel(input: { reads: number; workers: number; shards: number; cache: boolean; fresh: boolean; queue: boolean; regions: number; outage: boolean }) {
  const reads = integer(input.reads, 100, 3000)
  const workers = integer(input.workers, 1, 6)
  const shards = integer(input.shards, 1, 4)
  const regions = integer(input.regions, 1, 2)
  const activeRegions = regions - Number(input.outage)
  const appCapacity = activeRegions * workers * 500
  const admittedFraction = Math.min(1, appCapacity / (reads + 20))
  const databaseUnits = activeRegions > 0 ? shards * 300 : 0
  const creates = Math.min(20 * admittedFraction, databaseUnits / 3)
  const hitRate = input.cache && !input.fresh ? 0.9 : 0
  const readUnits = 1 - hitRate + (input.queue ? 0 : 3)
  const servedReads = Math.min(reads * admittedFraction, Math.max(0, databaseUnits - creates * 3) / readUnits)
  const originReads = servedReads * (1 - hitRate)
  const analyticDrain = input.queue
    ? Math.min(servedReads, Math.max(0, databaseUnits - creates * 3 - originReads) / 3)
    : servedReads
  return {
    reads, activeRegions, appCapacity, databaseUnits, creates, hitRate, servedReads, originReads, analyticDrain,
    rejectedReads: reads - servedReads,
    backlog: Math.max(0, (servedReads - analyticDrain) * 60),
    freshnessSeconds: hitRate > 0 ? 60 : 0,
    components: regions * (workers + shards + Number(input.cache) + Number(input.queue)),
  }
}
