import { useEffect, useId, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  CreditCard,
  Database,
  Fingerprint,
  GitBranch,
  Layers3,
  Monitor,
  Network,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import './learning-constellation.css'

type Track = 'dsa' | 'hld' | 'lld'

type LearningConstellationProps = {
  activeTrack: Track
  onTrackChange: (track: Track) => void
  onOpen: (track: Track) => void
  motionEnabled: boolean
}

type Point = [number, number]
type Wire = { id: string; points: Point[] }
type Frame = {
  active: string
  title: string
  detail: string
  code: string
  route?: Point[]
  wires?: string[]
}

const tracks: { id: Track; label: string; icon: LucideIcon }[] = [
  { id: 'dsa', label: 'Algorithms', icon: GitBranch },
  { id: 'hld', label: 'Systems', icon: Network },
  { id: 'lld', label: 'Objects', icon: Layers3 },
]

const listValues = [4, 11, 23, 38]
const listPoints: Point[] = [[67, 124], [209, 124], [351, 124], [493, 124]]
const listWires: Wire[] = listPoints.slice(1).map((point, index) => ({
  id: `next-${index}`,
  points: [listPoints[index], point],
}))

const servicePoints: Record<string, Point> = {
  client: [78, 70],
  gateway: [280, 70],
  cache: [482, 70],
  service: [280, 175],
  store: [482, 175],
}
const serviceWires: Wire[] = [
  { id: 'ingress', points: [servicePoints.client, servicePoints.gateway] },
  { id: 'cache', points: [servicePoints.gateway, servicePoints.cache] },
  { id: 'service', points: [servicePoints.gateway, servicePoints.service] },
  { id: 'store', points: [servicePoints.service, servicePoints.store] },
]

const objectPoints: Record<string, Point> = {
  caller: [84, 125],
  contract: [280, 125],
  card: [476, 65],
  wallet: [476, 175],
}
const objectWires: Wire[] = [
  { id: 'contract', points: [objectPoints.caller, objectPoints.contract] },
  { id: 'card', points: [objectPoints.contract, [387, 125], [387, 65], objectPoints.card] },
  { id: 'wallet', points: [objectPoints.contract, [387, 125], [387, 175], objectPoints.wallet] },
]

function pathFor(points: Point[]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)

  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return visible
}

function listFrames(target: number): Frame[] {
  const targetIndex = listValues.indexOf(target)
  return [
    {
      active: 'node-0',
      title: `Find ${target}. Follow the pointers.`,
      detail: 'A linked-list search, one node at a time.',
      code: `find(head, ${target})`,
    },
    ...listValues.slice(0, targetIndex + 1).map((value, index) => ({
      active: `node-${index}`,
      title: value === target ? `${value} found. Return this node.` : `${String(value).padStart(2, '0')} is not ${target}. Keep looking.`,
      detail: value === target ? 'The value matches. No need to visit the remaining nodes.' : 'Compare the current value, then follow its next pointer.',
      code: value === target ? 'return current' : `current.value === ${target} // false`,
      route: index > 0 ? [listPoints[index - 1], listPoints[index]] : undefined,
      wires: index > 0 ? [`next-${index - 1}`] : [],
    })),
  ]
}

function serviceFrames(cacheHit: boolean): Frame[] {
  const { client, gateway, cache, service, store } = servicePoints
  const frames: Frame[] = [
    {
      active: 'client',
      title: 'One request. Two possible paths.',
      detail: 'Choose a cache response, then send a read request.',
      code: 'GET /notes/23',
    },
    {
      active: 'gateway',
      title: 'The gateway receives the read.',
      detail: 'A single request enters this simplified service topology.',
      code: 'gateway → GET /notes/23',
      route: [client, gateway],
      wires: ['ingress'],
    },
    {
      active: 'cache',
      title: cacheHit ? 'Cache hit. The note is here.' : 'Cache miss. Take the longer path.',
      detail: cacheHit ? 'The selected preview has a cached copy of note 23.' : 'The selected preview has no cached copy of note 23.',
      code: cacheHit ? 'cache.get(23) → note' : 'cache.get(23) → null',
      route: [gateway, cache],
      wires: ['cache'],
    },
  ]

  return cacheHit ? [...frames,
    {
      active: 'gateway',
      title: 'Return the cached note.',
      detail: 'The gateway can answer without contacting storage.',
      code: 'cache → gateway',
      route: [cache, gateway],
      wires: ['cache'],
    },
    {
      active: 'client',
      title: 'Read complete. Storage untouched.',
      detail: 'The cached note returns to the client along the read path.',
      code: 'response → { id: 23 }',
      route: [gateway, client],
      wires: ['ingress'],
    },
  ] : [...frames,
    {
      active: 'service',
      title: 'Ask the note service.',
      detail: 'On a miss, the gateway passes the read to the service.',
      code: 'gateway → notes.find(23)',
      route: [cache, gateway, service],
      wires: ['cache', 'service'],
    },
    {
      active: 'store',
      title: 'Read the note from storage.',
      detail: 'The service looks up the requested note in its data store.',
      code: 'store.findById(23)',
      route: [service, store],
      wires: ['store'],
    },
    {
      active: 'service',
      title: 'Storage returns the note.',
      detail: 'The service now has a value to send back.',
      code: 'store → { id: 23 }',
      route: [store, service],
      wires: ['store'],
    },
    {
      active: 'client',
      title: 'Read complete. Storage was needed.',
      detail: 'The note returns through the gateway to the client.',
      code: 'response → { id: 23 }',
      route: [service, gateway, client],
      wires: ['service', 'ingress'],
    },
  ]
}

function objectFrames(adapter: 'card' | 'wallet'): Frame[] {
  const { caller, contract } = objectPoints
  const implementation = objectPoints[adapter]
  const name = adapter === 'card' ? 'CardPayment' : 'WalletPayment'
  const corner: Point = [387, implementation[1]]
  return [
    {
      active: 'contract',
      title: 'Same contract. Different behaviour.',
      detail: 'Swap the adapter, then follow an example method call.',
      code: 'checkout = new Checkout(payment)',
    },
    {
      active: 'caller',
      title: 'Checkout starts a payment call.',
      detail: 'The caller depends on a contract, not a concrete adapter.',
      code: 'checkout.pay(amount)',
    },
    {
      active: 'contract',
      title: 'PaymentPort defines the promise.',
      detail: 'A contract, not a runtime hop. Both adapters implement pay.',
      code: 'pay(amount): Receipt',
      route: [caller, contract],
      wires: ['contract'],
    },
    {
      active: adapter,
      title: `${name} handles the call.`,
      detail: 'The selected implementation supplies the behaviour.',
      code: `${name}.pay(amount)`,
      route: [contract, [387, 125], corner, implementation],
      wires: [adapter],
    },
    {
      active: 'caller',
      title: 'Example receipt. Unchanged caller.',
      detail: 'Swap adapters without changing Checkout. No real payment is made.',
      code: 'return { type: "receipt" }',
      route: [implementation, corner, [387, 125], contract, caller],
      wires: [adapter, 'contract'],
    },
  ]
}

function SignalWires({ id, wires, frame, frames, step, animate, title, description }: {
  id: string
  wires: Wire[]
  frame: Frame
  frames: Frame[]
  step: number
  animate: boolean
  title: string
  description: string
}) {
  const visited = new Set(frames.slice(1, step + 1).flatMap(item => item.wires ?? []))
  const route = frame.route
  const duration = .48

  return <svg className="lc-wires" viewBox="0 0 560 250" preserveAspectRatio="none" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>{title}</title>
    <desc id={`${id}-description`}>{description}</desc>
    <defs>
      <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="600" height="290">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <linearGradient id={`${id}-signal`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="560" y2="250">
        <stop offset="0%" stopColor="var(--lc-accent)" stopOpacity=".35" />
        <stop offset="100%" stopColor="var(--lc-accent)" />
      </linearGradient>
    </defs>
    {wires.map(wire => <g key={wire.id}>
      <path className="lc-wire-shadow" d={pathFor(wire.points)} vectorEffect="non-scaling-stroke" />
      <path className={`lc-wire ${visited.has(wire.id) ? 'is-visited' : ''}`} d={pathFor(wire.points)} vectorEffect="non-scaling-stroke" />
      {wire.points.slice(1, -1).map(([cx, cy], index) => <circle key={index} className="lc-wire-junction" cx={cx} cy={cy} r="3" />)}
    </g>)}
    {route && <g key={step}>
      <motion.path
        className="lc-signal-glow"
        d={pathFor(route)}
        filter={`url(#${id}-glow)`}
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: .7 }}
        transition={{ duration: animate ? duration : 0 }}
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        className="lc-signal"
        d={pathFor(route)}
        stroke={`url(#${id}-signal)`}
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: animate ? duration : 0, ease: 'linear' }}
        vectorEffect="non-scaling-stroke"
      />
    </g>}
  </svg>
}

function DiagramNode({ point, eyebrow, label, sublabel, icon: Icon, active, visited, dimmed, success, children }: {
  point: Point
  eyebrow: string
  label: string
  sublabel: string
  icon?: LucideIcon
  active: boolean
  visited?: boolean
  dimmed?: boolean
  success?: boolean
  children?: React.ReactNode
}) {
  const style: CSSProperties = { left: `${point[0] / 5.6}%`, top: `${point[1] / 2.5}%` }
  return <div
    className={`lc-node ${active ? 'is-active' : ''} ${visited ? 'is-visited' : ''} ${dimmed ? 'is-dimmed' : ''} ${success ? 'is-success' : ''}`}
    style={style}
  >
    <span className="lc-node-eyebrow">{eyebrow}</span>
    <span className="lc-node-face">
      {Icon && <Icon className="lc-node-icon" size={18} strokeWidth={1.5} aria-hidden="true" />}
      <strong>{label}</strong>
      <span className="lc-node-sub">{success ? <><Check size={10} aria-hidden="true" /> found</> : sublabel}</span>
    </span>
    <span className="lc-node-port" aria-hidden="true" />
    {children}
  </div>
}

function TraceScene({ track, onOpen, animate, visible }: {
  track: Track
  onOpen: (track: Track) => void
  animate: boolean
  visible: boolean
}) {
  const id = useId()
  const [target, setTarget] = useState(23)
  const [cacheHit, setCacheHit] = useState(false)
  const [adapter, setAdapter] = useState<'card' | 'wallet'>('card')
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const frames = track === 'dsa' ? listFrames(target) : track === 'hld' ? serviceFrames(cacheHit) : objectFrames(adapter)
  const lastStep = frames.length - 1
  const frame = frames[Math.min(step, lastStep)]
  const complete = step === lastStep
  const visitedNodes = new Set(frames.slice(1, step).map(item => item.active))
  const route = frame.route
  const animateNow = animate && visible

  useEffect(() => {
    if (!running) return
    if (!animate) {
      setStep(lastStep)
      setRunning(false)
      return
    }
    if (!visible) return
    const timeout = window.setTimeout(() => {
      if (document.hidden) return
      if (step >= lastStep) {
        setRunning(false)
      } else {
        setStep(current => current + 1)
      }
    }, step === lastStep ? 420 : 780)
    return () => window.clearTimeout(timeout)
  }, [running, step, lastStep, animate, visible])

  function reset() {
    setRunning(false)
    setStep(0)
  }

  function run() {
    if (track === 'dsa') {
      setStep(current => current >= lastStep ? 1 : current + 1)
      return
    }
    if (!animate) {
      setStep(lastStep)
      return
    }
    setStep(1)
    setRunning(true)
  }

  const actionLabel = track === 'dsa'
    ? complete ? 'Trace again' : 'Advance trace'
    : track === 'hld'
      ? running ? 'Routing request' : complete ? 'Route again' : 'Route request'
      : running ? 'Invoking contract' : complete ? 'Invoke again' : 'Invoke contract'
  const ActionIcon = track === 'dsa' ? ChevronRight : track === 'hld' ? Send : Play
  const title = track === 'dsa' ? 'The pointer trail' : track === 'hld' ? 'The request route' : 'The contract bridge'
  const description = track === 'dsa'
    ? `Linked list: 4 points to 11, 11 points to 23, 23 points to 38, and 38 points to null. Searching for ${target}. ${frame.title}`
    : track === 'hld'
      ? `Simplified read topology: client to gateway, gateway to cache or note service, note service to store. Cache ${cacheHit ? 'hit' : 'miss'} selected. ${frame.title}`
      : `Illustrative collaboration: Checkout uses PaymentPort, implemented by CardPayment or WalletPayment. The interface is a contract, not a separate runtime object. ${adapter === 'card' ? 'CardPayment' : 'WalletPayment'} selected. ${frame.title}`

  return <div className={`lc-trace lc-trace--${track}`}>
    <div className="lc-configuration">
      <span className="lc-config-label">{track === 'dsa' ? 'FIND VALUE' : track === 'hld' ? 'CACHE RESPONSE' : 'PAYMENT ADAPTER'}</span>
      <div className="lc-options" role="group" aria-label={track === 'dsa' ? 'Search target' : track === 'hld' ? 'Simulated cache response' : 'Example payment adapter'}>
        {track === 'dsa' && [11, 23, 38].map(value => <button key={value} type="button" aria-pressed={target === value} onClick={() => { reset(); setTarget(value) }}>{value}</button>)}
        {track === 'hld' && [false, true].map(value => <button key={String(value)} type="button" aria-pressed={cacheHit === value} onClick={() => { reset(); setCacheHit(value) }}>{value ? 'Hit' : 'Miss'}</button>)}
        {track === 'lld' && (['card', 'wallet'] as const).map(value => <button key={value} type="button" aria-pressed={adapter === value} onClick={() => { reset(); setAdapter(value) }}>{value === 'card' ? 'Card' : 'Wallet'}</button>)}
      </div>
      <span className="lc-config-hint"><Fingerprint size={13} aria-hidden="true" /> Try a different path</span>
    </div>

    <div className="lc-board">
      <div className="lc-board-grid" aria-hidden="true" />
      <div className="lc-board-cross lc-board-cross--one" aria-hidden="true">+</div>
      <div className="lc-board-cross lc-board-cross--two" aria-hidden="true">+</div>
      <div className="lc-board-label"><span className="lc-mini-square" />{track === 'dsa' ? 'LINKED LIST / LINEAR SEARCH' : track === 'hld' ? 'READ PATH / SERVICE TOPOLOGY' : 'OBJECTS / DEPENDENCY INVERSION'}</div>
      <div className="lc-board-coordinate" aria-hidden="true">FIG. 0{track === 'dsa' ? '1' : track === 'hld' ? '2' : '3'}</div>

      <SignalWires
        id={id}
        wires={track === 'dsa' ? listWires : track === 'hld' ? serviceWires : objectWires}
        frame={frame}
        frames={frames}
        step={step}
        animate={animateNow}
        title={title}
        description={description}
      />

      {route && animateNow && <motion.span
        key={`packet-${step}`}
        className="lc-packet"
        aria-hidden="true"
        initial={{ left: `${route[0][0] / 5.6}%`, top: `${route[0][1] / 2.5}%`, opacity: 1 }}
        animate={{
          left: route.map(point => `${point[0] / 5.6}%`),
          top: route.map(point => `${point[1] / 2.5}%`),
          opacity: [1, 1, 0],
        }}
        transition={{ duration: .48, ease: 'linear' }}
      />}

      {track === 'dsa' && <>
        <motion.div
          className="lc-pointer"
          initial={false}
          animate={{ left: `${listPoints[Math.max(0, step - 1)][0] / 5.6}%` }}
          transition={{ duration: animateNow ? .4 : 0, ease: [.22, 1, .36, 1] }}
          aria-hidden="true"
        ><span>{complete ? 'MATCH' : step === 0 ? 'HEAD' : 'CURRENT'}</span><i /></motion.div>
        {listValues.map((value, index) => <DiagramNode
          key={value}
          point={listPoints[index]}
          eyebrow={`NODE 0${index + 1}`}
          label={String(value).padStart(2, '0')}
          sublabel={index === listValues.length - 1 ? 'next: null' : 'next →'}
          active={frame.active === `node-${index}`}
          visited={visitedNodes.has(`node-${index}`)}
          success={complete && value === target}
        />)}
        <div className="lc-list-annotations" aria-hidden="true"><span>head</span><span>One pointer. One next step.</span><span>null ∎</span></div>
      </>}

      {track === 'hld' && <>
        <DiagramNode point={servicePoints.client} eyebrow="ORIGIN" label="Client" sublabel={complete ? 'note received' : 'GET /notes/23'} icon={Monitor} active={frame.active === 'client'} visited={visitedNodes.has('client')} />
        <DiagramNode point={servicePoints.gateway} eyebrow="ENTRY" label="Gateway" sublabel="route the read" icon={Network} active={frame.active === 'gateway'} visited={visitedNodes.has('gateway')} />
        <DiagramNode point={servicePoints.cache} eyebrow="LOOKUP" label="Cache" sublabel={step >= 2 ? cacheHit ? 'HIT · has note' : 'MISS · empty' : 'check the key'} icon={Zap} active={frame.active === 'cache'} visited={visitedNodes.has('cache')} />
        <DiagramNode point={servicePoints.service} eyebrow="LOGIC" label="Notes" sublabel="read service" icon={Code2} active={frame.active === 'service'} visited={visitedNodes.has('service')} dimmed={cacheHit} />
        <DiagramNode point={servicePoints.store} eyebrow="PERSISTENCE" label="Store" sublabel={complete && cacheHit ? 'not contacted' : 'note / 23'} icon={Database} active={frame.active === 'store'} visited={visitedNodes.has('store')} dimmed={cacheHit} />
        <span className="lc-route-note">{cacheHit ? 'HIT → SHORT PATH' : 'MISS → STORAGE PATH'}</span>
      </>}

      {track === 'lld' && <>
        <DiagramNode point={objectPoints.caller} eyebrow="CALLER" label="Checkout" sublabel={complete ? 'example receipt' : 'pay(amount)'} icon={Code2} active={frame.active === 'caller'} visited={visitedNodes.has('caller')} />
        <DiagramNode point={objectPoints.contract} eyebrow="«INTERFACE»" label="PaymentPort" sublabel="pay(): Receipt" icon={ShieldCheck} active={frame.active === 'contract'} visited={visitedNodes.has('contract')} />
        <DiagramNode point={objectPoints.card} eyebrow="ADAPTER A" label="Card" sublabel={adapter === 'card' ? 'selected' : 'swappable'} icon={CreditCard} active={frame.active === 'card'} visited={visitedNodes.has('card')} dimmed={adapter !== 'card'} />
        <DiagramNode point={objectPoints.wallet} eyebrow="ADAPTER B" label="Wallet" sublabel={adapter === 'wallet' ? 'selected' : 'swappable'} icon={Wallet} active={frame.active === 'wallet'} visited={visitedNodes.has('wallet')} dimmed={adapter !== 'wallet'} />
        <span className="lc-contract-note">ONE CONTRACT<br /><strong>TWO IMPLEMENTATIONS</strong></span>
      </>}

      <div className="lc-board-footer"><span>ILLUSTRATIVE {track === 'dsa' ? 'TRACE' : track === 'hld' ? 'TOPOLOGY' : 'COLLABORATION'}</span><span>NOT TO SCALE</span></div>
    </div>

    <div className="lc-readout">
      <div className="lc-readout-marker" aria-hidden="true">{complete ? <Check size={16} /> : <span>{String(step).padStart(2, '0')}</span>}</div>
      <div className="lc-readout-copy" role="status" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${step}-${target}-${cacheHit}-${adapter}`}
            initial={animateNow ? { opacity: 0, y: 5 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: animateNow ? -4 : 0 }}
            transition={{ duration: animateNow ? .13 : 0 }}
          ><strong>{frame.title}</strong><p>{frame.detail}</p></motion.div>
        </AnimatePresence>
      </div>
    </div>

    <div className="lc-console" aria-hidden="true"><span>›</span><code>{frame.code}</code><span className="lc-console-state">{running ? 'TRACING' : complete ? 'RETURNED' : 'READY'}</span></div>

    <div className="lc-actions">
      <button className="lc-run" type="button" onClick={run} disabled={running}><ActionIcon size={15} aria-hidden="true" /><span>{actionLabel}</span></button>
      <button className="lc-reset" type="button" onClick={reset} disabled={step === 0 && !running} aria-label="Reset the preview" title="Reset preview"><RotateCcw size={16} aria-hidden="true" /></button>
      <button className="lc-open" type="button" onClick={() => onOpen(track)}>Open lab <ArrowUpRight size={15} aria-hidden="true" /></button>
    </div>
  </div>
}

export default function LearningConstellation({ activeTrack, onTrackChange, onOpen, motionEnabled }: LearningConstellationProps) {
  const visible = usePageVisible()
  const animate = motionEnabled

  return <section className={`learning-constellation learning-constellation--${activeTrack}`} data-motion={animate && visible ? 'on' : 'off'} aria-label="Interactive concept preview">
    <div className="lc-topline"><span><span className="lc-status-light" aria-hidden="true" /> THE CONCEPT OBSERVATORY</span><span className="lc-preview-label">PLAYABLE PREVIEW <ArrowRight size={10} aria-hidden="true" /></span></div>
    <div className="lc-track-selector" role="group" aria-label="Preview learning track">
      {tracks.map(({ id, label, icon: Icon }, index) => <button type="button" key={id} aria-pressed={activeTrack === id} onClick={() => onTrackChange(id)}>
        <span className="lc-track-number" aria-hidden="true">0{index + 1}</span>
        <Icon size={15} aria-hidden="true" />
        <span className="lc-track-name">{label}</span>
        <span className="lc-track-code">{id.toUpperCase()}</span>
      </button>)}
    </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTrack}
        initial={animate && visible ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: animate && visible ? -5 : 0 }}
        transition={{ duration: animate && visible ? .16 : 0 }}
      ><TraceScene track={activeTrack} onOpen={onOpen} animate={animate} visible={visible} /></motion.div>
    </AnimatePresence>
  </section>
}
