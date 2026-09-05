import { useId, useState, type ReactNode } from 'react'
import {
  architectureModel, balanceModel, bounded, cacheModel, estimateModel, idempotencyModel,
  indexModel, queueModel, raftModel, recoveryModel, replicationModel, retryModel, shardModel,
} from '../../data/hldExperimentEngine'
import './hld-experiments.css'

type ExperimentProps = { onExperiment: () => void }
type Tone = 'healthy' | 'active' | 'failure'
type Metric = { label: string; value: ReactNode; tone?: Tone }
const format = (value: number, digits = 0) => value.toLocaleString('en-US', { maximumFractionDigits: digits })

function useExperiment<T extends object>(initial: T, onExperiment: () => void): [T, (patch: Partial<T>) => void] {
  const [state, setState] = useState(initial)
  const update = (patch: Partial<T>) => {
    if (!Object.entries(patch).some(([key, value]) => state[key as keyof T] !== value)) return
    setState({ ...state, ...patch })
    onExperiment()
  }
  return [state, update]
}

function Slider({ label, value, min, max, step = 1, unit = '', help, disabled = false, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; help?: string; disabled?: boolean; onChange: (value: number) => void
}) {
  const id = useId()
  return <div className="hld-exp-control">
    <div className="hld-exp-control-heading"><label htmlFor={id}>{label}</label><output htmlFor={id}>{format(value, 1)}{unit}</output></div>
    <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
      aria-describedby={help ? `${id}-help` : undefined}
      onChange={event => onChange(bounded(Number(event.target.value), min, max, value))} />
    {help && <p id={`${id}-help`} className="hld-exp-help">{help}</p>}
  </div>
}

function Toggle({ label, checked, help, disabled = false, onChange }: { label: string; checked: boolean; help?: string; disabled?: boolean; onChange: (value: boolean) => void }) {
  const id = useId()
  return <div className="hld-exp-control">
    <label className="hld-exp-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} aria-describedby={help ? `${id}-help` : undefined}
        onChange={event => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
    {help && <p id={`${id}-help`} className="hld-exp-help">{help}</p>}
  </div>
}

function Select({ label, value, options, disabled = false, onChange }: {
  label: string; value: string | number; options: { value: string | number; label: string }[]; disabled?: boolean; onChange: (value: string) => void
}) {
  const id = useId()
  return <div className="hld-exp-control"><label htmlFor={id}>{label}</label>
    <select id={id} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
}

function Lab({ week, title, question, controls, children, assumptions }: {
  week: number; title: string; question: string; controls: ReactNode; children: ReactNode; assumptions: ReactNode
}) {
  return <section className="hld-exp" aria-label={`Week ${week} HLD experiment: ${title}`}>
    <header className="hld-exp-header">
      <span className="hld-exp-kicker">HLD / {String(week).padStart(2, '0')} <span>Interactive lab</span></span>
      <h3>{title}</h3><p>{question}</p>
    </header>
    <div className="hld-exp-workbench">
      <div className="hld-exp-controls" role="group" aria-label="Experiment controls">{controls}</div>
      <div className="hld-exp-instrument" aria-label="Experiment results">{children}</div>
    </div>
    <footer className="hld-exp-assumptions"><strong>Model, not benchmark.</strong> {assumptions}</footer>
  </section>
}

function Metrics({ items }: { items: Metric[] }) {
  return <dl className="hld-exp-metrics" aria-live="polite" aria-atomic="true">
    {items.map(item => <div key={item.label} className={`hld-exp-metric hld-exp-${item.tone ?? 'active'}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
  </dl>
}

function Insight({ children, tone = 'active' }: { children: ReactNode; tone?: Tone }) {
  return <p className={`hld-exp-insight hld-exp-${tone}`}>{children}</p>
}

function Flow({ nodes }: { nodes: { label: string; detail: string; tone?: Tone }[] }) {
  return <ol className="hld-exp-flow" aria-label="Request or event path">
    {nodes.map((node, i) => <li key={`${node.label}-${i}`} className={`hld-exp-flow-node hld-exp-${node.tone ?? 'active'}`}>
      <span className="hld-exp-node-index">{String(i + 1).padStart(2, '0')}</span><strong>{node.label}</strong><span>{node.detail}</span>
    </li>)}
  </ol>
}

function Bar({ label, value, max, detail, tone = 'healthy' }: { label: string; value: number; max: number; detail: string; tone?: Tone }) {
  return <div className={`hld-exp-bar hld-exp-${tone}`}>
    <div><span>{label}</span><strong>{detail}</strong></div>
    <div className="hld-exp-bar-track" aria-hidden="true"><span style={{ width: `${bounded(value / Math.max(1, max) * 100, 0, 100)}%` }} /></div>
  </div>
}

function TimelineChart({ values, label, unit }: { values: number[]; label: string; unit: string }) {
  const peak = Math.max(0, ...values)
  const max = Math.max(1, peak)
  const points = values.map((value, i) => `${12 + i / Math.max(1, values.length - 1) * 496},${116 - value / max * 90}`).join(' ')
  return <figure className="hld-exp-chart">
    <figcaption>{label}<span>Peak {format(peak)} {unit}</span></figcaption>
    <svg viewBox="0 0 520 142" role="img" aria-label={`${label}. ${values.length} samples. First ${format(values[0] ?? 0)}, last ${format(values.at(-1) ?? 0)}, maximum ${format(Math.max(0, ...values))} ${unit}.`}>
      <path className="hld-exp-chart-grid" d="M12 26 H508 M12 71 H508 M12 116 H508" />
      <polyline className="hld-exp-chart-line" points={points} />
      {values.length === 1 && <circle className="hld-exp-chart-dot" cx="12" cy={116 - values[0] / max * 90} r="4" />}
    </svg>
    <div className="hld-exp-chart-axis" aria-hidden="true"><span>Start</span><span>End of window</span></div>
  </figure>
}

function BalanceExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ requests: 1200, workers: 3, failed: false, shared: false }, onExperiment)
  const model = balanceModel(input)
  return <Lab week={1} title="More workers. Same bottleneck?" question="Spread the traffic, then remove a worker. Can the next worker find the same user's session?"
    controls={<>
      <Slider label="Incoming requests / second" value={input.requests} min={100} max={3000} step={100} onChange={requests => update({ requests })} />
      <Slider label="Application workers" value={input.workers} min={1} max={6} onChange={workers => update({ workers })} />
      <Toggle label="Fail the last worker" checked={input.failed} onChange={failed => update({ failed })} help="The health check removes it from round-robin routing." />
      <Toggle label="Shared session store" checked={input.shared} onChange={shared => update({ shared })} help="Otherwise the session exists only on the first worker." />
    </>}
    assumptions="Equal workers handle 300 requests/s each; the database handles 1,000 requests/s. Excess traffic is rejected, not queued. Health checks are instantaneous. The session replay starts on the first healthy worker and returns on the next. DNS, connection setup, and real tail latency are not timed.">
    <Flow nodes={[{ label: 'Client → edge', detail: 'DNS · TCP · TLS · HTTP' }, { label: 'Load balancer', detail: `Round robin · ${model.active} healthy` }, { label: 'One database', detail: '1,000 requests/s ceiling', tone: model.requests > 1000 ? 'failure' : 'healthy' }]} />
    <div className="hld-exp-bars" aria-label="Offered traffic by worker">{model.loads.map((load, i) => <Bar key={i} label={`Worker ${i + 1}${input.failed && i === input.workers - 1 ? ' · removed' : ''}`}
      value={load} max={Math.max(300, ...model.loads)} detail={`${format(load)} / 300 req/s`} tone={load > 300 ? 'failure' : load === 0 ? 'active' : 'healthy'} />)}</div>
    <Metrics items={[{ label: 'Completed', value: `${format(model.served)}/s`, tone: 'healthy' }, { label: 'Rejected', value: `${format(model.rejected)}/s`, tone: model.rejected ? 'failure' : 'healthy' },
      { label: 'Session on return', value: model.sessionFound ? 'Found' : model.active ? 'Missing' : 'No route', tone: model.sessionFound ? 'healthy' : 'failure' }]} />
    <Insight tone={model.rejected ? 'failure' : 'healthy'}><strong>{model.bottleneck}</strong> limits this deployment.
      {model.appCapacity >= 1000 ? ' Extra application capacity cannot raise the shared database ceiling.' : ' Add healthy workers until the database becomes the limiting dependency.'}
      {!input.shared && model.active > 1 ? ' Capacity is not state sharing: the second worker cannot read a local session.' : ' Session placement and throughput are separate design decisions.'}</Insight>
  </Lab>
}

function EstimateExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ users: 500000, peak: 10, slo: 0.999, badMinutes: 20 }, onExperiment)
  const model = estimateModel(input)
  return <Lab week={2} title="Size the peak. Spend the budget." question="Translate a URL shortener's daily usage into a peak workload and a monthly reliability limit."
    controls={<>
      <Slider label="Daily active users" value={input.users} min={10000} max={2000000} step={10000} onChange={users => update({ users })} />
      <Slider label="Peak / average multiplier" value={input.peak} min={1} max={20} unit="×" onChange={peak => update({ peak })} />
      <Select label="Time-based availability SLO" value={input.slo} options={[{ value: 0.99, label: '99% · two nines' }, { value: 0.999, label: '99.9% · three nines' }, { value: 0.9999, label: '99.99% · four nines' }]} onChange={slo => update({ slo: Number(slo) })} />
      <Slider label="Bad minutes this month" value={input.badMinutes} min={0} max={120} onChange={badMinutes => update({ badMinutes })} />
    </>}
    assumptions="20 requests/user/day; 10% create a 500-byte record; responses are 2 KB; mean latency is 200 ms. A 30-day time-based SLI counts fully unavailable minutes, not request errors. Five-year storage assumes constant traffic, no deletion, no indexes, and no replication.">
    <Flow nodes={[{ label: 'Daily demand', detail: `${format(input.users * 20)} requests/day` }, { label: 'Divide by 86,400', detail: `${format(model.averageQps, 1)} average QPS` }, { label: 'Size for the peak', detail: `${format(model.peakQps, 1)} peak QPS` }]} />
    <Metrics items={[{ label: 'Peak in-flight · mean', value: format(model.concurrency, 1) }, { label: 'Peak bandwidth', value: `${format(model.bandwidthMB, 2)} MB/s` },
      { label: 'Peak writes', value: `${format(model.peakWrites, 1)}/s` }, { label: 'Five-year raw storage', value: `${format(model.fiveYearGB, 1)} GB` }]} />
    <div className="hld-exp-equation">30 × 24 × 60 × (1 − {input.slo}) = <strong>{format(model.budgetMinutes, 2)} allowed bad minutes</strong></div>
    <Bar label="Monthly error budget spent" value={model.burnedPercent} max={100} detail={`${format(model.burnedPercent, 1)}%`} tone={model.remainingMinutes < 0 ? 'failure' : 'active'} />
    <Insight tone={model.remainingMinutes < 0 ? 'failure' : 'healthy'}>
      {model.remainingMinutes < 0 ? `${format(-model.remainingMinutes, 2)} minutes over budget.` : `${format(model.remainingMinutes, 2)} minutes remain.`}
      {' '}A tighter SLO shrinks the budget; it does not change the traffic estimate. Concurrency uses peak QPS × <strong>mean</strong> latency, not p99.
    </Insight>
  </Lab>
}

function IdempotencyExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ attempts: 4, spacing: 5, ttl: 30, enabled: true, conflict: false }, onExperiment)
  const model = idempotencyModel(input)
  return <Lab week={3} title="The response was lost. Retry?" question="The first create-order request succeeds but its response disappears. Replay the client's attempts."
    controls={<>
      <Slider label="Total attempts · including original" value={input.attempts} min={1} max={6} onChange={attempts => update({ attempts })} />
      <Slider label="Time between attempts" value={input.spacing} min={1} max={30} unit="s" onChange={spacing => update({ spacing })} />
      <Slider label="Idempotency record TTL" value={input.ttl} min={5} max={60} step={5} unit="s" disabled={!input.enabled} onChange={ttl => update({ ttl })} />
      <Toggle label="Persist an idempotency key" checked={input.enabled} onChange={enabled => update({ enabled })} />
      <Toggle label="Change the final retry's amount" checked={input.conflict} disabled={input.attempts === 1} onChange={conflict => update({ conflict })} help="Requires a retry. Same key, different payload: £25 instead of £20." />
    </>}
    assumptions="The key is scoped to one caller and create-order endpoint. Recording the key and effect is atomic, and the saved response is replayable. TTL starts at creation, is not extended by replay, and expires exactly at its boundary. Attempts are sequential; no real payments occur.">
    <div className="hld-exp-code">POST /orders · caller=learner · key=order-K</div>
    <div className="hld-exp-table-scroll" role="region" aria-label="Idempotency replay table" tabIndex={0}><table className="hld-exp-table">
      <caption>One intent, {input.attempts} network attempts</caption><thead><tr><th scope="col">Time</th><th scope="col">Payload</th><th scope="col">Result</th><th scope="col">Logical order</th></tr></thead>
      <tbody>{model.rows.map((row, i) => <tr key={i}><td>+{row.time}s</td><td>{row.payload}</td><td><span className={`hld-exp-status hld-exp-${row.outcome === 'replayed' ? 'healthy' : row.outcome === 'conflict' ? 'active' : i === 0 ? 'healthy' : 'failure'}`}>
        {row.outcome === 'created' ? i === 0 ? 'Created · response lost' : 'Created again' : row.outcome === 'conflict' ? '409 · payload mismatch' : 'Saved response'}</span></td><td>{row.outcome === 'conflict' ? 'No new order' : `Order ${row.order}`}</td></tr>)}</tbody>
    </table></div>
    <Metrics items={[{ label: 'Orders created', value: model.effects, tone: model.effects > 1 ? 'failure' : 'healthy' }, { label: 'Safe replays', value: model.replays, tone: 'healthy' }, { label: 'Conflicts rejected', value: model.conflicts }]} />
    <Insight tone={model.effects > 1 ? 'failure' : 'healthy'}>{!input.enabled ? 'Without a durable deduplication record, each accepted retry creates another order.' :
      model.effects > 1 ? 'The retry outlived its key. After expiry, the server treats that same key as a new operation.' :
        'The server reuses the recorded result instead of repeating the effect. A conflicting payload is rejected while the key is live.'} A POST can be retry-safe; the contract and atomic storage make it so.</Insight>
  </Lab>
}

function IndexExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ rows: 1000000, indexes: 1, matches: true }, onExperiment)
  const model = indexModel(input)
  return <Lab week={4} title="Buy a faster read. Pay on writes." question="Find one profile by email. What changes when an index exists but does not match this query?"
    controls={<>
      <Select label="Table size" value={input.rows} options={[1000, 100000, 1000000].map(value => ({ value, label: `${format(value)} profiles` }))} onChange={rows => update({ rows: Number(rows) })} />
      <Slider label="Secondary indexes" value={input.indexes} min={0} max={5} onChange={indexes => update({ indexes })} />
      <Toggle label="An index supports email equality" checked={input.matches} onChange={matches => update({ matches })} help="An index on another field cannot answer this lookup." />
    </>}
    assumptions="A unique equality lookup; 100 rows/data page; B-tree fan-out 100; 24 bytes/index entry. Indexed reads traverse ceil(log₁₀₀ rows) levels plus one data page. A scan touches the full table. Write targets are logical structures, not physical I/O; buffers, WAL, splits, and optimizer choices are excluded.">
    <div className="hld-exp-code">SELECT * FROM profiles WHERE email = ?</div>
    <Flow nodes={model.indexed ? [{ label: 'B-tree root', detail: `Fan-out 100 · ${model.treeLevels} levels` }, { label: 'Matching leaf', detail: 'One email → row pointer', tone: 'healthy' }, { label: 'Data page', detail: 'Fetch one profile', tone: 'healthy' }] :
      [{ label: 'No usable index', detail: input.indexes ? 'Existing indexes do not match' : 'No secondary indexes', tone: 'failure' }, { label: 'Full scan', detail: `${format(model.scanPages)} data pages`, tone: 'failure' }, { label: 'Matching profile', detail: 'Found after scanning' }]} />
    <Metrics items={[{ label: 'Read pages / lookup', value: format(model.readPages), tone: model.indexed ? 'healthy' : 'failure' },
      { label: 'Write targets / insert', value: model.writeTargets, tone: model.indexes > 2 ? 'active' : 'healthy' }, { label: 'Index storage', value: `${format(model.indexMB, 2)} MB` }]} />
    <div className="hld-exp-write-targets" aria-label="Every insert updates these structures"><span>Table</span>{Array.from({ length: input.indexes }, (_, i) => <span key={i}>Index {i + 1}</span>)}</div>
    <Insight>Each insert must maintain <strong>1 table + {input.indexes} indexes</strong>.
      {model.indexed ? ` This lookup falls from ${format(model.scanPages)} scan pages to ${model.readPages} page visits, but unrelated indexes add no further benefit.` :
        ' Index maintenance still happens even when this particular query cannot use those indexes.'} Select storage and indexes from access patterns, not a technology checklist.</Insight>
  </Lab>
}

function CacheExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ ttl: 60, time: 60, burst: 1000, jitter: false, coalesce: false, outage: false }, onExperiment)
  const model = cacheModel(input)
  return <Lab week={5} title="A hot cache can still stampede." question="Twenty hot keys were filled at t=0. Send one simultaneous burst before any refresh can finish."
    controls={<>
      <Slider label="Base TTL" value={input.ttl} min={10} max={120} step={5} unit="s" onChange={ttl => update({ ttl })} />
      <Slider label="Burst arrives at" value={input.time} min={0} max={150} unit="s" onChange={time => update({ time })} />
      <Slider label="Requests in the 100 ms burst" value={input.burst} min={100} max={5000} step={100} onChange={burst => update({ burst })} />
      <Toggle label="Spread expiries with ±20% jitter" checked={input.jitter} onChange={jitter => update({ jitter })} />
      <Toggle label="Coalesce requests per key" checked={input.coalesce} onChange={coalesce => update({ coalesce })} help="A single shared origin fetch serves all misses for one key." />
      <Toggle label="Cache is unavailable" checked={input.outage} onChange={outage => update({ outage })} />
    </>}
    assumptions="20 equally popular keys; all cache values come from t=0, and the source changes at t=30s. No requests or refreshes occur between fill and this burst. Origin budget is 60 reads/100 ms. Coalescing is ideal across all workers and remains available during cache failure; real coordination needs its own design.">
    <div className="hld-exp-section-label">Cache snapshot · {input.outage ? 'unreachable' : `t=${input.time}s`}</div>
    <div className="hld-exp-key-grid">{model.keys.map((key, i) => <div key={i} className={`hld-exp-key hld-exp-${key.miss ? 'failure' : key.stale ? 'active' : 'healthy'}`}>
      <strong>K{String(i + 1).padStart(2, '0')}</strong><span>{key.miss ? input.outage ? 'Offline' : 'Expired' : key.stale ? 'Stale hit' : 'Fresh hit'}</span><small>TTL {key.expires}s</small>
    </div>)}</div>
    <Metrics items={[{ label: 'Cache hit rate', value: `${format(model.hits / model.burst * 100, 1)}%`, tone: 'active' }, { label: 'Stale responses', value: format(model.staleHits), tone: model.staleHits ? 'active' : 'healthy' },
      { label: 'Origin reads / burst', value: format(model.sourceReads), tone: model.overCapacity ? 'failure' : 'healthy' }, { label: 'Reads beyond budget', value: format(model.overCapacity), tone: model.overCapacity ? 'failure' : 'healthy' }]} />
    <Insight tone={model.overCapacity ? 'failure' : 'healthy'}>{input.coalesce ? `${format(model.misses)} miss requests collapse into ${model.sourceReads} origin fetches.` :
      `${format(model.misses)} miss requests each trigger an origin fetch.`} Jitter spreads <strong>different keys</strong>; it does not stop all requests for a single expired key. A longer TTL also keeps old values visible longer.</Insight>
  </Lab>
}

function ReplicationExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ lag: 5, elapsed: 1, partition: false, readLeader: false, atomic: true }, onExperiment)
  const model = replicationModel(input)
  return <Lab week={6} title="Stale availability ≠ duplicate reservation." question="Booker A has reserved the only seat on the primary. Now replay booker B's read and reservation attempt."
    controls={<>
      <Slider label="Follower replication lag" value={input.lag} min={0} max={10} unit="s" onChange={lag => update({ lag })} />
      <Slider label="B checks availability after" value={input.elapsed} min={0} max={10} unit="s" onChange={elapsed => update({ elapsed })} />
      <Toggle label="Partition the replication link" checked={input.partition} onChange={partition => update({ partition })} help="The follower cannot receive A's update. Clients can still reach the primary." />
      <Select label="B reads availability from" value={input.readLeader ? 'primary' : 'follower'} options={[{ value: 'follower', label: 'Follower · possibly stale' }, { value: 'primary', label: 'Authoritative primary' }]} onChange={route => update({ readLeader: route === 'primary' })} />
      <Select label="Reservation write contract" value={input.atomic ? 'atomic' : 'unsafe'} options={[{ value: 'atomic', label: 'Atomic reserve-if-free at primary' }, { value: 'unsafe', label: 'Unsafe: trust read, then blind overwrite' }]} onChange={contract => update({ atomic: contract === 'atomic' })} />
    </>}
    assumptions="A's primary write is committed and asynchronously acknowledged at t=0. The follower starts with a free seat. Snapshots below are before B's write. The partition affects only replication; the primary is reachable and never fails over. This is not a CAP proof or a multi-leader protocol.">
    <div className="hld-exp-replication">
      <div className="hld-exp-replica hld-exp-healthy"><span>Authoritative primary</span><strong>Seat → A</strong><small>Atomic reservation committed at t=0</small></div>
      <div className={`hld-exp-replica-link hld-exp-${input.partition ? 'failure' : 'active'}`}><span>{input.partition ? 'Link partitioned' : `Replicate after ${input.lag}s`}</span><span aria-hidden="true">{input.partition ? '×' : '→'}</span></div>
      <div className={`hld-exp-replica hld-exp-${model.followerCaughtUp ? 'healthy' : 'active'}`}><span>Follower at t={input.elapsed}s</span><strong>{model.followerCaughtUp ? 'Seat → A' : 'Seat → free'}</strong><small>{model.followerCaughtUp ? 'A’s write has arrived' : 'Old snapshot; not write authority'}</small></div>
    </div>
    <Flow nodes={[{ label: 'A reserves', detail: 'Primary accepted · one seat', tone: 'healthy' }, { label: 'B reads', detail: model.observedFree ? 'Appears free · stale observation' : 'Already reserved', tone: model.observedFree ? 'active' : 'healthy' },
      { label: 'B tries to book', detail: !model.observedFree ? 'No write sent' : input.atomic ? 'Conditional write rejects B' : 'Blind write confirms B', tone: model.acceptedB ? 'failure' : 'healthy' }]} />
    <Metrics items={[{ label: 'Booking confirmations', value: `${model.confirmations} / 1 seat`, tone: model.acceptedB ? 'failure' : 'healthy' },
      { label: 'Primary owner after replay', value: model.primaryOwner, tone: model.acceptedB ? 'failure' : 'healthy' }]} />
    <div className="hld-exp-code">{!model.observedFree ? 'Availability returned reserved → B does not submit a write' : input.atomic ? 'UPDATE seats SET owner = B WHERE id = 1 AND owner IS NULL → 0 rows' : 'UNSAFE: if observedFree, overwrite owner without a precondition'}</div>
    <Insight tone={model.acceptedB ? 'failure' : 'healthy'}><strong>{model.bOutcome}.</strong>{model.acceptedB
      ? ' Two confirmations require the deliberately broken write contract here. Stale reads alone do not defeat an atomic primary constraint.'
      : ' A stale availability page can disappoint B, but the authoritative conditional write preserves one reservation. Fresh reads improve UX; atomic authority protects the invariant.'}</Insight>
  </Lab>
}

function ShardExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ shards: 3, virtualNodes: 4, hotPercent: 60, addNode: false, ring: true }, onExperiment)
  const model = shardModel(input)
  return <Lab week={7} title="Move fewer keys. Keep the hotspot?" question="Add a shard to a fixed key set. Compare membership movement with the load from one celebrity key."
    controls={<>
      <Slider label="Original shards" value={input.shards} min={2} max={5} onChange={shards => update({ shards })} />
      <Select label="Placement algorithm" value={input.ring ? 'ring' : 'modulo'} options={[{ value: 'ring', label: 'Consistent hash ring' }, { value: 'modulo', label: 'Hash(key) modulo shard count' }]} onChange={scheme => update({ ring: scheme === 'ring' })} />
      <Select label="Virtual nodes / shard · ring only" value={input.virtualNodes} disabled={!input.ring} options={[1, 4, 16].map(value => ({ value, label: `${value} virtual node${value === 1 ? '' : 's'}` }))} onChange={virtualNodes => update({ virtualNodes: Number(virtualNodes) })} />
      <Slider label="Traffic assigned to celebrity key" value={input.hotPercent} min={0} max={80} step={5} unit="%" onChange={hotPercent => update({ hotPercent })} />
      <Toggle label="Add one new shard" checked={input.addNode} onChange={addNode => update({ addNode })} />
    </>}
    assumptions="240 fixed keys and stable seeded hashes; total load is 1,200 requests/s, with a 400 requests/s capacity per shard. The selected hot fraction goes to key 0; remaining traffic is uniform across all keys. The ring assigns clockwise ownership. Movement is key count, not bytes, transfer time, or operational resharding cost.">
    <div className="hld-exp-section-label">{input.ring ? 'Unrolled hash ring · 0 → 2³² → wraps to 0' : 'Modulo ownership · no ring is used'}</div>
    {input.ring && <div className="hld-exp-ring" role="img" aria-label={`${model.tokens.length} virtual-node positions across the ring. Color groups indicate shard ownership.`}>
      {model.tokens.map((token, i) => <span key={i} className={`hld-exp-ring-token hld-exp-shard-${token.node}`} style={{ left: `${token.position / 4294967296 * 100}%` }} />)}
    </div>}
    {input.ring && <div className="hld-exp-ring-legend">{model.nodes.map(node => <span key={node.id}><i aria-hidden="true" className={`hld-exp-shard-${node.id}`} />Shard {node.id + 1}</span>)}</div>}
    <div className="hld-exp-bars">{model.nodes.map(node => <Bar key={node.id} label={`Shard ${node.id + 1}${node.id === model.hotOwner ? ' · celebrity' : ''}${node.id === input.shards ? ' · new' : ''}`} value={node.trafficPercent * 12} max={1200}
      detail={`${node.keys} keys · ${format(node.trafficPercent * 12)} / 400 req/s`} tone={node.trafficPercent * 12 > 400 ? 'failure' : 'healthy'} />)}</div>
    <Metrics items={[{ label: 'Keys moved on membership change', value: `${model.moved} / 240`, tone: 'active' }, { label: 'Hottest shard', value: `${format(model.maxQps)}/s`, tone: model.maxQps > 400 ? 'failure' : 'healthy' }]} />
    <Insight>{input.addNode ? input.ring ? 'Only keys whose new clockwise owner is the added node move.' : 'Changing the modulus remaps keys between old shards as well as to the new one.' : 'Enable the extra shard to compare ownership before and after membership changes.'}
      {' '}Virtual nodes can spread key ownership, but <strong>one hot key still belongs to one shard</strong>. They cannot split that key's traffic.</Insight>
  </Lab>
}

function QueueExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ arrivals: 25, consumers: 20, poisonPercent: 10, duplicates: true, deduplicate: true, dlq: true, backpressure: false, seconds: 10 }, onExperiment)
  const model = queueModel(input)
  const configure = (patch: Partial<typeof input>) => update({ ...patch, seconds: 10 })
  return <Lab week={8} title="A buffer is not infinite capacity." question="Watch useful work, poison retries, and duplicate effects compete for the same consumer slots."
    controls={<>
      <Slider label="New messages / second" value={input.arrivals} min={5} max={50} step={5} onChange={arrivals => configure({ arrivals })} />
      <Slider label="Consumer attempts / second" value={input.consumers} min={5} max={40} step={5} onChange={consumers => configure({ consumers })} />
      <Slider label="Deterministic poison-message threshold" value={input.poisonPercent} min={0} max={30} step={5} unit="%" onChange={poisonPercent => configure({ poisonPercent })} />
      <Toggle label="Duplicate every fifth message" checked={input.duplicates} onChange={duplicates => configure({ duplicates })} />
      <Toggle label="Deduplicate external side effects" checked={input.deduplicate} onChange={deduplicate => configure({ deduplicate })} />
      <Toggle label="DLQ after three failed attempts" checked={input.dlq} onChange={dlq => configure({ dlq })} />
      <Toggle label="Reject arrivals when queue reaches 80" checked={input.backpressure} onChange={backpressure => configure({ backpressure })} />
      <div className="hld-exp-actions"><button type="button" disabled={input.seconds >= 60} onClick={() => update({ seconds: Math.min(60, input.seconds + 10) })}>Run 10 more seconds</button>
        <button type="button" disabled={input.seconds === 10} onClick={() => update({ seconds: 10 })}>Replay first 10s</button></div>
      <p className="hld-exp-help">Changing configuration restarts a deterministic 10-second replay.</p>
    </>}
    assumptions="One FIFO with parallel consumer slots. Failed deliveries rejoin the tail next second; no global ordering guarantee. Seeded hashes select poison messages, so finite samples need not equal the threshold exactly. Duplicates consume slots even when effects are deduplicated. Rejected arrivals require upstream retry; they are not silently accepted.">
    <Flow nodes={[{ label: 'Producer', detail: `${input.arrivals}/s + ${input.duplicates ? '20% duplicate copies' : 'no injected copies'}` }, { label: 'Queue', detail: `${model.backlog} messages at t=${input.seconds}s`, tone: model.backlog > 80 ? 'failure' : 'active' },
      { label: 'Consumers', detail: `${model.uniqueEffects} unique effects`, tone: 'healthy' }, { label: 'Dead-letter queue', detail: `${model.deadLetters} failed deliveries isolated`, tone: model.deadLetters ? 'active' : 'healthy' }]} />
    <TimelineChart values={model.history.map(point => point.backlog)} label={`Backlog over ${input.seconds} seconds`} unit="messages" />
    <Metrics items={[{ label: 'Duplicate side effects', value: model.duplicateEffects, tone: model.duplicateEffects ? 'failure' : 'healthy' }, { label: 'Retry deliveries enqueued', value: model.retries },
      { label: 'Rejected arrivals', value: model.rejected, tone: model.rejected ? 'active' : 'healthy' }, { label: 'Duplicate effects prevented', value: model.deduplicated, tone: 'healthy' }]} />
    <Insight tone={model.duplicateEffects ? 'failure' : 'active'}>{input.dlq ? 'The DLQ stops one poison delivery after three failures, freeing future attempts for other work.' : 'Without a retry cap, poison deliveries keep consuming capacity indefinitely.'}
      {' '}{input.backpressure ? 'The bounded queue moves pressure upstream; producers must handle rejection.' : 'Buffering absorbs a burst but cannot fix a sustained capacity deficit.'} Delivery and application-effect guarantees are different.</Insight>
  </Lab>
}

function RaftExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ nodes: 5, sideA: 2, candidateA: true, acknowledgments: 3, stage: 0 }, onExperiment)
  const model = raftModel(input)
  const configure = (patch: Partial<typeof input>) => update({ ...patch, stage: 0 })
  return <Lab week={9} title="First elect. Then prove the entry." question="Predict whether the candidate can win, then separately test whether entry 5 can commit."
    controls={<>
      <Select label="Voting cluster size" value={input.nodes} options={[3, 5, 7].map(value => ({ value, label: `${value} voting nodes` }))} onChange={value => {
        const nodes = Number(value)
        configure({ nodes, sideA: Math.min(input.sideA, nodes - 1), acknowledgments: Math.min(input.acknowledgments, nodes) })
      }} />
      <Slider label="Nodes on partition side A" value={input.sideA} min={1} max={input.nodes - 1} onChange={sideA => configure({ sideA })} />
      <Select label="Candidate location" value={input.candidateA ? 'A' : 'B'} options={[{ value: 'A', label: `Side A · ${input.sideA} voters` }, { value: 'B', label: `Side B · ${input.nodes - input.sideA} voters` }]} onChange={side => configure({ candidateA: side === 'A' })} />
      <Slider label="Append acknowledgments available" value={input.acknowledgments} min={1} max={input.nodes} onChange={acknowledgments => configure({ acknowledgments })} help="Capped by reachable voters, including the leader. A vote is not an append acknowledgment." />
      <div className="hld-exp-actions">
        <button type="button" disabled={input.stage !== 0} onClick={() => update({ stage: 1 })}>1. Request votes</button>
        <button type="button" disabled={input.stage !== 1} onClick={() => update({ stage: 2 })}>2. Propose entry 5</button>
        <button type="button" disabled={input.stage === 0} onClick={() => update({ stage: 0 })}>Reset election</button>
      </div>
    </>}
    assumptions="Two fully connected components with no cross-partition traffic. Every log initially has committed entries 1–4, so the candidate is up-to-date. One election in term 8 and one new-term entry are modeled. Timing, competing candidates, log repair, snapshots, and membership reconfiguration are excluded.">
    <div className="hld-exp-partitions">{(['A', 'B'] as const).map(side => {
      const count = side === 'A' ? input.sideA : input.nodes - input.sideA
      const chosen = input.candidateA === (side === 'A')
      return <div className="hld-exp-partition" key={side}><h4>Side {side} {chosen ? '· candidate here' : '· isolated'}</h4>
        <div className="hld-exp-voters">{Array.from({ length: count }, (_, i) => {
          const entry = chosen && i < model.appended
          return <div key={i} className={`hld-exp-voter hld-exp-${entry && model.committed ? 'healthy' : chosen ? 'active' : 'neutral'}`}>
            <strong>N{(side === 'A' ? 0 : input.sideA) + i + 1}</strong>
            <span>{chosen && input.stage > 0 ? i === 0 && model.elected ? 'Leader · term 8' : 'Voted · term 8' : 'Term 7'}</span>
            <small>{entry ? model.committed ? 'Entry 5 committed' : 'Entry 5 uncommitted' : 'Log through 4'}</small>
          </div>
        })}</div></div>
    })}</div>
    <Metrics items={[{ label: 'Required majority', value: `${model.quorum} / ${input.nodes}` }, { label: 'Votes received', value: input.stage ? model.votes : 'Not requested', tone: model.elected ? 'healthy' : 'active' },
      { label: 'Entry acknowledgments', value: input.stage < 2 ? 'Not proposed' : model.appended, tone: model.committed ? 'healthy' : 'active' }, { label: 'New committed index', value: model.commitIndex, tone: model.committed ? 'healthy' : 'active' }]} />
    <Insight tone={input.stage === 2 && !model.committed ? 'failure' : 'active'}>{input.stage === 0 ? `Before running: can ${model.component} reachable voters form a majority of ${model.quorum}?` :
      !model.elected ? 'This candidate cannot win a majority. It must not act as leader or commit a write; try the other partition.' :
        input.stage === 1 ? 'Election succeeded. That does not commit entry 5: the entry itself must reach a majority.' :
          model.committed ? 'A majority stored this new-term entry. The leader can advance its commit index; unreachable nodes catch up later.' :
            'The elected leader has too few append acknowledgments. An appended entry is not yet a committed entry.'}</Insight>
  </Lab>
}

function RetryExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ layers: 3, retries: 2, latency: 200, timeout: 100, deadline: 1000, backoff: false, jitter: false, breaker: false }, onExperiment)
  const model = retryModel(input)
  return <Lab week={10} title="Every retry is somebody else's load." question="Send 100 simultaneous requests through nested retrying callers into one slow dependency."
    controls={<>
      <Slider label="Retrying layers" value={input.layers} min={1} max={3} onChange={layers => update({ layers })} />
      <Slider label="Retries per layer" value={input.retries} min={0} max={3} onChange={retries => update({ retries })} />
      <Slider label="Dependency response latency" value={input.latency} min={20} max={600} step={20} unit="ms" onChange={latency => update({ latency })} />
      <Slider label="Leaf-attempt timeout" value={input.timeout} min={20} max={400} step={20} unit="ms" onChange={timeout => update({ timeout })} />
      <Slider label="Propagated end-to-end deadline" value={input.deadline} min={100} max={3000} step={100} unit="ms" onChange={deadline => update({ deadline })} />
      <Toggle label="Exponential backoff at each layer" checked={input.backoff} onChange={backoff => update({ backoff })} />
      <Toggle label="Seeded jitter on backoff waits" checked={input.jitter} disabled={!input.backoff} onChange={jitter => update({ jitter })} help="Enable backoff to apply jitter to its waits." />
      <Toggle label="Breaker already open · use fallback" checked={input.breaker} onChange={breaker => update({ breaker })} />
    </>}
    assumptions="100 simultaneous original requests. Every dependency call has the selected fixed latency and never recovers within the window. Layers retry serially; only leaves have per-attempt timeouts, and every layer shares the deadline. Backoff starts at 50 ms, doubles, and optional jitter multiplies by 0.5–1.5. Cancellation is ideal; no server-side orphan work is counted.">
    <Flow nodes={[...Array.from({ length: input.layers }, (_, i) => ({ label: `Retry layer ${i + 1}`, detail: `Up to ${input.retries + 1} attempts` })),
      { label: 'Dependency', detail: input.breaker ? 'Open breaker → fallback' : `${input.latency} ms / call`, tone: input.breaker ? 'active' as const : input.latency > input.timeout ? 'failure' as const : 'healthy' as const }]} />
    <div className="hld-exp-equation">Without deadlines, all-failing work can reach ({input.retries} + 1)<sup>{input.layers}</sup> = <strong>{model.theoretical} calls per request</strong></div>
    <Metrics items={[{ label: 'Actual dependency attempts', value: format(model.attempts), tone: model.amplification > 1 ? 'failure' : 'healthy' }, { label: 'Actual amplification', value: `${format(model.amplification, 2)}×`, tone: model.amplification > 1 ? 'failure' : 'healthy' },
      { label: 'Dependency successes', value: `${model.successes} / 100`, tone: model.successes === 100 ? 'healthy' : 'active' }, { label: 'Fallbacks / deadline misses', value: `${model.fallbacks} / ${model.deadlineMisses}` }]} />
    <TimelineChart values={model.buckets} label="Retry attempts starting per 50 ms · excludes first wave" unit="attempts" />
    <Insight tone={model.amplification > 1 ? 'failure' : 'healthy'}>{input.breaker ? 'A previously opened breaker bypasses the dependency and serves a deliberately degraded fallback; this is not a dependency success.' :
      model.successes ? 'The dependency responds within the attempt timeout and end-to-end deadline. Successful calls do not retry.' :
        `All retries face the same slow dependency. The longest caller stops at ${format(model.longest)} ms; the deadline limits total work, while backoff and jitter change its timing.`}
      {' '}Averages conceal retry waves: the busiest retry bucket contains {model.peakRetryBucket} attempts.</Insight>
  </Lab>
}

function RecoveryExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ canary: 10, wrongPercent: 20, monitor: false, backupAge: 10, restoreMinutes: 15, isolated: true }, onExperiment)
  const model = recoveryModel(input)
  return <Lab week={11} title="All green HTTP. All wrong totals." question="A canary writes incorrect totals and returns 200 OK. Can the release gate detect it, and can a restore recover clean data?"
    controls={<>
      <Slider label="Canary share of first-window traffic" value={input.canary} min={1} max={50} unit="%" onChange={canary => update({ canary })} />
      <Slider label="Wrong data inside canary cohort" value={input.wrongPercent} min={0} max={100} step={5} unit="%" onChange={wrongPercent => update({ wrongPercent })} />
      <Toggle label="Gate on business-data correctness" checked={input.monitor} onChange={monitor => update({ monitor })} help="Roll back at ≥1% wrong totals within the canary; HTTP status alone sees no error." />
      <Slider label="Clean backup age at fault onset" value={input.backupAge} min={0} max={120} step={5} unit=" min" onChange={backupAge => update({ backupAge })} />
      <Slider label="Restore execution time" value={input.restoreMinutes} min={5} max={90} step={5} unit=" min" onChange={restoreMinutes => update({ restoreMinutes })} />
      <Select label="Recovery source" value={input.isolated ? 'backup' : 'replica'} options={[{ value: 'backup', label: 'Isolated, pre-fault snapshot' }, { value: 'replica', label: 'Live replica · copied corruption' }]} onChange={source => update({ isolated: source === 'backup' })} />
    </>}
    assumptions="First 5 minutes: 10,000 requests with the selected canary share. If the gate misses the defect, promotion sends 50,000 more requests through it over 25 minutes before manual detection. The counter includes wrong responses generated by the defective version, not subsequent reads of corrupted rows. Bad writes replicate immediately; rollback does not fix them. Snapshot age is measured before fault onset; no logs can replay newer valid writes. RPO target 15 minutes, RTO target 30 minutes from fault onset.">
    <div className="hld-exp-signal-pair"><div className="hld-exp-healthy"><span>HTTP success</span><strong>100%</strong><small>Cannot distinguish correct from wrong data</small></div>
      <div className={`hld-exp-${model.incident ? 'failure' : 'healthy'}`}><span>Canary data correctness</span><strong>{format(model.canaryCorrectPercent)}%</strong><small>{input.monitor ? 'Used by the release gate' : 'Not monitored by the release gate'}</small></div></div>
    <Flow nodes={[{ label: 't=0 · canary', detail: `${input.canary}% of traffic` }, { label: 't=5m · gate', detail: model.detected ? 'Defect detected → roll back' : 'No alert → promote', tone: model.detected ? 'healthy' : model.incident ? 'failure' : 'healthy' },
      { label: `t=${model.incident ? model.exposureMinutes : 5}m · recovery`, detail: !model.incident ? 'No defect to restore' : model.clean ? 'Restore isolated snapshot' : 'Live copy is still corrupt', tone: model.clean ? 'healthy' : 'failure' }]} />
    <Metrics items={[{ label: 'Wrong responses from defective version', value: format(model.wrongResponses), tone: model.wrongResponses ? 'failure' : 'healthy' },
      { label: 'Potential lost-write window · RPO', value: !model.incident ? 'No incident' : !model.clean ? 'No clean point' : `${model.lossWindow} / 15 min`, tone: model.rpoMet ? 'healthy' : 'failure' },
      { label: 'Time to clean recovery · RTO', value: !model.incident ? 'No incident' : !model.clean ? 'Not recovered' : `${model.recoveryMinutes} / 30 min`, tone: model.rtoMet ? 'healthy' : 'failure' }]} />
    <Insight tone={!model.clean || !model.rpoMet || !model.rtoMet ? 'failure' : 'healthy'}>{!model.incident ? 'This rollout has no modeled data defect; no restore is needed.' :
      !model.clean ? 'The live replica faithfully copied the corruption. Promoting it does not provide a clean recovery point, regardless of its freshness.' :
        `Restoring loses up to ${input.backupAge} minutes before the fault plus ${model.exposureMinutes} minutes until detection. Recovery takes detection time plus ${input.restoreMinutes} minutes of restoration.`}
      {' '}A release rollback and a data restore solve different problems.</Insight>
  </Lab>
}

function ArchitectureExperiment({ onExperiment }: ExperimentProps) {
  const [input, update] = useExperiment({ reads: 1200, workers: 3, shards: 2, cache: true, fresh: false, queue: false, regions: 1, outage: false }, onExperiment)
  const model = architectureModel(input)
  return <Lab week={12} title="Defend a complete redirect path." question="Keep 20 URL creations/s durable while serving redirects and recording click analytics. Every extra component must earn its place."
    controls={<>
      <Slider label="Redirect requests / second" value={input.reads} min={100} max={3000} step={100} onChange={reads => update({ reads })} />
      <Slider label="Workers provisioned per region" value={input.workers} min={1} max={6} onChange={workers => update({ workers })} />
      <Slider label="Logical database shards" value={input.shards} min={1} max={4} onChange={shards => update({ shards })} />
      <Toggle label="Cache destinations · 90% hits" checked={input.cache} onChange={cache => update({ cache })} />
      <Toggle label="Require freshest destination" checked={input.fresh} onChange={fresh => update({ fresh })} help="Immediate freshness bypasses the TTL cache in this design." />
      <Toggle label="Queue analytics off the critical path" checked={input.queue} onChange={queue => update({ queue })} help="URL creation still commits synchronously. Only analytics may lag." />
      <Select label="Provisioned regions" value={input.regions} options={[{ value: 1, label: 'One region' }, { value: 2, label: 'Two fully provisioned regions' }]} onChange={regions => update({ regions: Number(regions) })} />
      <Toggle label="First region is down" checked={input.outage} onChange={outage => update({ outage })} />
    </>}
    assumptions="A 60-second steady window; each worker handles 500 requests/s. Each shard offers 300 read-work units/s; a creation or analytics write costs 3 units. Capacity is evenly sharded, and canonical writes receive priority after proportional worker admission. A healthy regional copy is safely fenced/promoted before this window; failover delay and data loss are excluded. Analytics consumers are idempotent. No real cost, security, or latency guarantees are inferred.">
    <Flow nodes={[{ label: 'Clients', detail: `${input.reads} redirects/s + 20 creates/s` }, { label: 'Worker pool', detail: `${format(model.appCapacity)}/s · ${model.activeRegions} active regions`, tone: model.appCapacity ? 'healthy' : 'failure' },
      { label: input.cache ? 'Destination cache' : 'No cache', detail: input.cache && input.fresh ? 'Bypassed for freshness' : `${format(model.hitRate * 100)}% effective hit rate` },
      { label: 'Canonical database', detail: `${model.databaseUnits} read-work units/s`, tone: model.rejectedReads > 0 ? 'failure' : 'healthy' }]} />
    <div className="hld-exp-architecture-branch"><span aria-hidden="true">↳</span><div><strong>{input.queue ? 'Async analytics branch' : 'Synchronous analytics on each redirect'}</strong><p>{input.queue
      ? `${format(model.servedReads, 1)} events/s enter; ${format(model.analyticDrain, 1)} events/s drain using remaining database capacity.`
      : 'Each successful redirect must also pay for one analytics write before completing.'}</p></div></div>
    <Metrics items={[{ label: 'Redirects completed / demanded', value: `${format(model.servedReads, 1)} / ${format(input.reads)}/s`, tone: model.rejectedReads < 0.01 ? 'healthy' : 'failure' },
      { label: 'Canonical creates committed', value: `${format(model.creates, 1)} / 20/s`, tone: model.creates >= 19.99 ? 'healthy' : 'failure' },
      { label: 'Analytics backlog after 60s', value: format(model.backlog), tone: model.backlog > 0 ? 'active' : 'healthy' },
      { label: 'Destination staleness bound', value: `${model.freshnessSeconds}s`, tone: model.freshnessSeconds ? 'active' : 'healthy' }]} />
    <div className="hld-exp-equation"><strong>{model.components} provisioned component instances</strong> = workers + shard copies + optional cache/queue per region. This is an inventory, not a cost score.</div>
    <Insight tone={model.rejectedReads > 0 ? 'failure' : model.backlog > 0 ? 'active' : 'healthy'}>{model.activeRegions === 0 ? 'There is no surviving serving region. Caches and queues cannot make an unavailable application reachable.' :
      model.backlog > 0 ? 'The queue protects redirects by delaying analytics, not deleting its work. Sustained backlog still needs more drain capacity or a changed requirement.' :
        model.rejectedReads > 0 ? 'The critical path is over capacity. Find whether workers, origin reads, or synchronous analytics consume the limiting resource.' :
          'The modeled workload fits. Remove components or increase traffic to find the smallest design that still meets these requirements.'}
      {' '}URL identity remains a primary-side conditional invariant, never a cache decision.</Insight>
  </Lab>
}

const experiments = [
  BalanceExperiment, EstimateExperiment, IdempotencyExperiment, IndexExperiment,
  CacheExperiment, ReplicationExperiment, ShardExperiment, QueueExperiment,
  RaftExperiment, RetryExperiment, RecoveryExperiment, ArchitectureExperiment,
]

export default function HldExperiments({ week, onExperiment }: { week: number; onExperiment: () => void }) {
  const Experiment = Number.isInteger(week) && week >= 1 && week <= 12 ? experiments[week - 1] : undefined
  if (!Experiment) return <div className="hld-exp hld-exp-empty" role="status">Choose an HLD lesson from weeks 1–12 to open its experiment.</div>
  return <Experiment key={week} onExperiment={onExperiment} />
}
