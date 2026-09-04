import type { DesignTrack } from './designCurriculum'

type ExplorationResource = {
  label: string
  url: string
  note: string
  level: 'START HERE' | 'DEEP DIVE' | 'REAL WORLD'
}

export type DesignExploration = {
  examples: { title: string; detail: string }[]
  resources: ExplorationResource[]
  challenge: { scenario: string; prompts: string[] }
}

const explorations: Record<DesignTrack, DesignExploration[]> = {
  hld: [
    {
      examples: [
        { title: 'Flash-sale storefront', detail: 'Stateless application workers scale out behind an L7 balancer while inventory remains a shared consistency bottleneck.' },
        { title: 'Regional API service', detail: 'Health checks remove unhealthy instances, but DNS, databases, and downstream services still define availability.' },
      ],
      resources: [
        { label: 'MDN · Overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', note: 'Follow the protocol-level journey of a browser request.', level: 'START HERE' },
        { label: 'Cloudflare · What is load balancing?', url: 'https://www.cloudflare.com/learning/performance/what-is-load-balancing/', note: 'Compare balancing methods, health checks, and failover.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Traffic grows 20×, but 30% of requests depend on server-local sessions.', prompts: ['What prevents safe horizontal scaling?', 'Where would you move session state, and what new failure mode appears?'] },
    },
    {
      examples: [
        { title: 'Launch-day traffic', detail: 'Peak QPS and concurrency, not daily averages, determine whether workers and connection pools survive a burst.' },
        { title: 'Checkout reliability', detail: 'A 99.9% monthly SLO creates an explicit error budget for risky releases and incidents.' },
      ],
      resources: [
        { label: 'Google SRE · Service level objectives', url: 'https://sre.google/sre-book/service-level-objectives/', note: 'Connect SLIs, SLOs, user expectations, and error budgets.', level: 'DEEP DIVE' },
        { label: 'AWS · Reliability Pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html', note: 'See practical reliability design principles and review questions.', level: 'REAL WORLD' },
      ],
      challenge: { scenario: 'The product promises 99.99% availability and p99 latency below 200 ms.', prompts: ['How much monthly downtime is allowed?', 'Which dependency must have a stricter target than the overall service?'] },
    },
    {
      examples: [
        { title: 'Payment creation', detail: 'An idempotency key makes a retried POST return the original logical result instead of charging twice.' },
        { title: 'Public mobile API', detail: 'Cursor pagination and version-compatible response evolution protect clients with slow release cycles.' },
      ],
      resources: [
        { label: 'Stripe · Idempotent requests', url: 'https://docs.stripe.com/api/idempotent_requests', note: 'Study a production contract for safely retrying writes.', level: 'REAL WORLD' },
        { label: 'Microsoft · Web API design', url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', note: 'Review resource modeling, pagination, versioning, and async operations.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'A client times out after submitting an order and retries from another device.', prompts: ['What defines the idempotency-key scope and lifetime?', 'What response should a duplicate request receive?'] },
    },
    {
      examples: [
        { title: 'Product catalog', detail: 'Document storage can fit flexible product attributes while search indexes serve text and faceted queries.' },
        { title: 'Bank transfer ledger', detail: 'Relational constraints and transactions protect balances and audit history.' },
      ],
      resources: [
        { label: 'PostgreSQL · Introduction to indexes', url: 'https://www.postgresql.org/docs/current/indexes-intro.html', note: 'Understand why indexes speed reads and increase write work.', level: 'DEEP DIVE' },
        { label: 'AWS · Purpose-built databases', url: 'https://aws.amazon.com/products/databases/', note: 'Compare database categories by access pattern rather than fashion.', level: 'START HERE' },
      ],
      challenge: { scenario: 'A social feed needs user timelines, post lookup, search, and analytics.', prompts: ['Which access patterns belong in separate stores or indexes?', 'Which data is authoritative and which is derived?'] },
    },
    {
      examples: [
        { title: 'Celebrity profile', detail: 'A hot key can overload one cache shard even when the overall hit rate looks healthy.' },
        { title: 'Global image delivery', detail: 'A CDN moves immutable content near users while origin invalidation controls freshness.' },
      ],
      resources: [
        { label: 'AWS Builders’ Library · Caching', url: 'https://aws.amazon.com/builders-library/caching-challenges-and-strategies/', note: 'Learn when caches help, fail, and amplify outages.', level: 'REAL WORLD' },
        { label: 'Cloudflare · What is a CDN?', url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/', note: 'Build intuition for edge caching, origins, and latency.', level: 'START HERE' },
      ],
      challenge: { scenario: 'A popular key expires every hour and causes a database spike.', prompts: ['Would you use jitter, request coalescing, refresh-ahead, or all three?', 'How does the system behave if the cache disappears entirely?'] },
    },
    {
      examples: [
        { title: 'Profile read after update', detail: 'Leader writes plus follower reads can violate read-your-write unless requests are routed deliberately.' },
        { title: 'Shopping-cart replicas', detail: 'Availability may be preferred during a partition if cart conflicts can be merged later.' },
      ],
      resources: [
        { label: 'Jepsen · Consistency models', url: 'https://jepsen.io/consistency', note: 'Explore consistency guarantees and the anomalies they prevent.', level: 'DEEP DIVE' },
        { label: 'Azure Cosmos DB · Consistency levels', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels', note: 'See concrete guarantees between strong and eventual consistency.', level: 'REAL WORLD' },
      ],
      challenge: { scenario: 'A ticket platform serves stale seat availability from replicas.', prompts: ['Which reads may be stale?', 'Where must a strongly consistent decision occur to prevent double booking?'] },
    },
    {
      examples: [
        { title: 'Chat history', detail: 'Partitioning by conversation keeps message order local but a celebrity room can become a hot partition.' },
        { title: 'Distributed cache ring', detail: 'Virtual nodes reduce movement during membership changes but do not fix workload skew.' },
      ],
      resources: [
        { label: 'Amazon Dynamo paper', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf', note: 'Read the original production motivation for consistent hashing and availability.', level: 'DEEP DIVE' },
        { label: 'System Design Primer · Sharding', url: 'https://github.com/donnemartin/system-design-primer#sharding', note: 'Compare shard strategies, trade-offs, and failure cases.', level: 'START HERE' },
      ],
      challenge: { scenario: 'One tenant produces 40% of all writes despite hash-based sharding.', prompts: ['Why did hashing not prevent the hotspot?', 'How could the partition key or routing strategy change?'] },
    },
    {
      examples: [
        { title: 'Order notifications', detail: 'An outbox atomically records the order and pending event, then a relay publishes it safely.' },
        { title: 'Video processing', detail: 'A queue absorbs upload bursts while consumer groups scale expensive transcoding independently.' },
      ],
      resources: [
        { label: 'Apache Kafka · Design', url: 'https://kafka.apache.org/documentation/#design', note: 'Understand logs, partitions, ordering, consumers, and delivery behavior.', level: 'DEEP DIVE' },
        { label: 'AWS · Transactional outbox', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html', note: 'Prevent database changes and emitted events from disagreeing.', level: 'REAL WORLD' },
      ],
      challenge: { scenario: 'A consumer charges a card and crashes before acknowledging the message.', prompts: ['What happens when the message is delivered again?', 'Where must idempotency or deduplication live?'] },
    },
    {
      examples: [
        { title: 'Configuration service', detail: 'Consensus keeps one ordered configuration history while a majority remains connected.' },
        { title: 'Metadata leader election', detail: 'A new leader must prove it has sufficiently current committed state, not merely win a race.' },
      ],
      resources: [
        { label: 'The Secret Lives of Data · Raft', url: 'https://thesecretlivesofdata.com/raft/', note: 'Interactively watch elections and replicated-log commits.', level: 'START HERE' },
        { label: 'Raft · Paper and resources', url: 'https://raft.github.io/', note: 'Move from intuition to the protocol’s safety rules.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'A five-node cluster splits into groups of three and two.', prompts: ['Which side may elect a leader and commit?', 'What happens when the partition heals?'] },
    },
    {
      examples: [
        { title: 'Checkout dependency failure', detail: 'A short deadline and fallback prevent recommendations from consuming every checkout worker.' },
        { title: 'Retry storm', detail: 'Exponential backoff with jitter spreads retries while a retry budget limits amplification.' },
      ],
      resources: [
        { label: 'AWS Builders’ Library · Timeouts and retries', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', note: 'Production guidance for deadlines, retry placement, backoff, and jitter.', level: 'REAL WORLD' },
        { label: 'Google SRE · Cascading failures', url: 'https://sre.google/sre-book/addressing-cascading-failures/', note: 'Understand overload, queue growth, load shedding, and recovery.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Three service layers each retry a failed dependency three times.', prompts: ['How many downstream attempts can one request create?', 'At which layer should retries live, and why?'] },
    },
    {
      examples: [
        { title: 'Canary deployment', detail: 'Golden signals split by version reveal a regression before the rollout reaches every user.' },
        { title: 'Regional data loss', detail: 'Backups, replication, RPO, RTO, and tested restore procedures solve different problems.' },
      ],
      resources: [
        { label: 'OpenTelemetry · Observability primer', url: 'https://opentelemetry.io/docs/concepts/observability-primer/', note: 'Connect traces, metrics, logs, context, and user-visible behavior.', level: 'START HERE' },
        { label: 'AWS · Disaster recovery options', url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html', note: 'Compare backup/restore, pilot light, warm standby, and active-active.', level: 'REAL WORLD' },
      ],
      challenge: { scenario: 'A deployment returns HTTP 200 with incorrect prices for 2% of users.', prompts: ['Which signal detects this when error rate stays flat?', 'How would you stop, diagnose, and safely roll back?'] },
    },
    {
      examples: [
        { title: 'URL shortener evolution', detail: 'Begin with one write path and indexed redirects, then add cache, sharding, analytics, and abuse controls only under pressure.' },
        { title: 'Real-time chat', detail: 'Connections, presence, ordering, offline delivery, fan-out, and regional failure each create separate design decisions.' },
      ],
      resources: [
        { label: 'System Design Primer · Interview method', url: 'https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question', note: 'Use a repeatable structure for a complete design conversation.', level: 'START HERE' },
        { label: 'Google SRE Workbook', url: 'https://sre.google/workbook/table-of-contents/', note: 'Apply reliability practices through concrete production exercises.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Halfway through your design, traffic rises 100× and one region fails.', prompts: ['Which assumption changes first?', 'What do you deliberately avoid redesigning until a requirement demands it?'] },
    },
  ],
  lld: [
    {
      examples: [
        { title: 'Checkout service', detail: 'Pricing, persistence, payment, and notification change for different reasons and deserve explicit boundaries.' },
        { title: 'Export pipeline', detail: 'Depending on a storage interface lets business policy survive a vendor or file-format change.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · SOLID', url: 'https://refactoring.guru/design-patterns/solid-principles', note: 'Review each principle through change pressure and examples.', level: 'START HERE' },
        { label: 'Martin Fowler · Dependency Injection', url: 'https://martinfowler.com/articles/injection.html', note: 'Understand inversion of control, construction, and dependency boundaries.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Checkout gains a second payment provider and SMS receipts.', prompts: ['Which existing class should not change?', 'Which variation deserves an interface now rather than later?'] },
    },
    {
      examples: [
        { title: 'Money value object', detail: 'Amount and currency move together and equality depends on value rather than identity.' },
        { title: 'Parking allocation', detail: 'A policy object can vary spot selection without forcing ParkingLot subclasses.' },
      ],
      resources: [
        { label: 'Martin Fowler · Value Object', url: 'https://martinfowler.com/bliki/ValueObject.html', note: 'Learn immutability, equality, and domain-focused values.', level: 'DEEP DIVE' },
        { label: 'Martin Fowler · Anemic Domain Model', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html', note: 'Consider where behavior and invariants should live.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Parking spots gain charging capability and temporary accessibility restrictions.', prompts: ['Which concepts are entities, values, or policies?', 'Where is the allocation invariant protected?'] },
    },
    {
      examples: [
        { title: 'Vending purchase sequence', detail: 'A sequence diagram exposes collaboration while a state model prevents dispense-before-payment.' },
        { title: 'Elevator lifecycle', detail: 'Explicit states and guarded transitions make illegal door and motion combinations visible.' },
      ],
      resources: [
        { label: 'PlantUML · Class diagrams', url: 'https://plantuml.com/class-diagram', note: 'Practice relationships, multiplicity, interfaces, and packages.', level: 'START HERE' },
        { label: 'PlantUML · Sequence diagrams', url: 'https://plantuml.com/sequence-diagram', note: 'Trace one use case across objects before finalizing classes.', level: 'START HERE' },
      ],
      challenge: { scenario: 'A vending machine must cancel safely after payment but before dispensing.', prompts: ['Which state owns the refund transition?', 'What preconditions and postconditions must the tests assert?'] },
    },
    {
      examples: [
        { title: 'Long task method', detail: 'Characterization tests freeze behavior before extracting scheduling and sorting responsibilities.' },
        { title: 'Repeated conditionals', detail: 'A changing policy may justify Strategy; stable local branching may remain clearer as a switch.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · Refactoring catalog', url: 'https://refactoring.guru/refactoring/techniques', note: 'Choose small behavior-preserving transformations by smell.', level: 'START HERE' },
        { label: 'Martin Fowler · Refactoring', url: 'https://martinfowler.com/books/refactoring.html', note: 'Explore the discipline and sequencing behind safe design improvement.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'A task manager’s 200-line method gains recurring tasks.', prompts: ['Which tests must exist before editing?', 'What is the smallest useful extraction sequence?'] },
    },
    {
      examples: [
        { title: 'Notification provider factory', detail: 'Environment and channel determine a coordinated client, credentials, and retry policy.' },
        { title: 'Immutable request builder', detail: 'A builder makes optional configuration readable while validating the final object once.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · Creational patterns', url: 'https://refactoring.guru/design-patterns/creational-patterns', note: 'Compare construction patterns by intent and trade-off.', level: 'START HERE' },
        { label: 'Martin Fowler · Inversion of Control', url: 'https://martinfowler.com/articles/injection.html', note: 'See how composition roots assemble dependencies without hiding them.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Providers require related clients and credentials that vary by region.', prompts: ['Would Factory Method or Abstract Factory express the variation?', 'Where should object graph assembly occur?'] },
    },
    {
      examples: [
        { title: 'Dynamic pricing', detail: 'Strategy swaps independent pricing algorithms without changing the parking session lifecycle.' },
        { title: 'Document workflow', detail: 'State controls which operations are legal in Draft, Review, Published, and Archived.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · Strategy', url: 'https://refactoring.guru/design-patterns/strategy', note: 'Model interchangeable algorithms and their client context.', level: 'START HERE' },
        { label: 'Refactoring.Guru · State', url: 'https://refactoring.guru/design-patterns/state', note: 'Compare lifecycle-dependent behavior with Strategy.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Elevator scheduling varies by mode while doors and motion follow guarded states.', prompts: ['Which behavior is Strategy and which is State?', 'Where should transition validation live?'] },
    },
    {
      examples: [
        { title: 'Payment API adapter', detail: 'A stable domain interface translates vendor-specific requests, responses, and errors.' },
        { title: 'Cached repository proxy', detail: 'Access control, caching, and lazy loading wrap the same repository contract for different reasons.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · Adapter', url: 'https://refactoring.guru/design-patterns/adapter', note: 'Translate an incompatible external contract at the boundary.', level: 'START HERE' },
        { label: 'Refactoring.Guru · Decorator', url: 'https://refactoring.guru/design-patterns/decorator', note: 'Understand composable behavior and wrapper ordering.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'A vendor changes its API while calls also need auth, caching, and logging.', prompts: ['Which concern is Adapter, Decorator, Facade, or Proxy?', 'How will tests reveal wrapper-order bugs?'] },
    },
    {
      examples: [
        { title: 'Auction events', detail: 'Observers react to a bid while the auction remains unaware of email, audit, and analytics details.' },
        { title: 'Editor undo', detail: 'Commands capture requests and prior state so operations can be queued, logged, and reversed.' },
      ],
      resources: [
        { label: 'Refactoring.Guru · Observer', url: 'https://refactoring.guru/design-patterns/observer', note: 'Study subscription ownership, notification flow, and coupling.', level: 'START HERE' },
        { label: 'Refactoring.Guru · Command', url: 'https://refactoring.guru/design-patterns/command', note: 'Turn requests into values that support queues, history, and undo.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'A bid requires fraud checks, persistence, notifications, and optional undo.', prompts: ['Which steps form a handler chain or command?', 'What happens when one synchronous observer fails?'] },
    },
    {
      examples: [
        { title: 'Seat reservation', detail: 'Optimistic locking permits parallel reads but rejects a stale version at the transaction boundary.' },
        { title: 'Money transfer', detail: 'A domain operation and repository transaction must preserve the debit-credit invariant together.' },
      ],
      resources: [
        { label: 'Martin Fowler · Repository', url: 'https://martinfowler.com/eaaCatalog/repository.html', note: 'Separate domain collection semantics from persistence access.', level: 'DEEP DIVE' },
        { label: 'Martin Fowler · Optimistic Offline Lock', url: 'https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html', note: 'Detect conflicting updates without holding long database locks.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Two users reserve the final seat from stale screens.', prompts: ['What is the transaction and consistency boundary?', 'How is the conflict represented to the caller?'] },
    },
    {
      examples: [
        { title: 'Bounded blocking queue', detail: 'One lock and conditions protect capacity, ordering, and wait-notify behavior as one invariant.' },
        { title: 'Concurrent LRU cache', detail: 'Map and linked-list updates must share a linearization point or the structures diverge.' },
      ],
      resources: [
        { label: 'Python · threading', url: 'https://docs.python.org/3/library/threading.html', note: 'Review locks, conditions, semaphores, and thread lifecycle.', level: 'START HERE' },
        { label: 'Java · Concurrency tutorial', url: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/', note: 'Explore interference, visibility, synchronization, and liveness.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'An LRU cache adds TTL expiry while reads and writes run concurrently.', prompts: ['Which state must change atomically?', 'What lock ordering prevents deadlock?'] },
    },
    {
      examples: [
        { title: 'Splitwise', detail: 'Expense validation, split policies, balances, and settlement each reveal different responsibilities.' },
        { title: 'ATM', detail: 'State, cash inventory, account boundaries, hardware failures, and idempotency shape more than the class list.' },
      ],
      resources: [
        { label: 'Awesome Low-Level Design · Problems', url: 'https://github.com/ashishps1/awesome-low-level-design', note: 'Work through classic designs and compare responsibility choices.', level: 'START HERE' },
        { label: 'Refactoring.Guru · Design patterns', url: 'https://refactoring.guru/design-patterns', note: 'Use patterns only after identifying the pressure they resolve.', level: 'DEEP DIVE' },
      ],
      challenge: { scenario: 'Splitwise adds percentages, unequal shares, currencies, and simplified settlement.', prompts: ['Which rules belong to split policies versus Expense?', 'What invariant must every split preserve?'] },
    },
    {
      examples: [
        { title: 'Booking evolution', detail: 'Package boundaries isolate payment, inventory, pricing, and notification changes while workflows coordinate them.' },
        { title: 'Design review', detail: 'A strong review explains rejected alternatives, migration, failure behavior, observability, and tests.' },
      ],
      resources: [
        { label: 'Martin Fowler · Software architecture', url: 'https://martinfowler.com/architecture/', note: 'Explore boundaries, evolution, coupling, and architectural decisions.', level: 'DEEP DIVE' },
        { label: 'Google Testing Blog', url: 'https://testing.googleblog.com/', note: 'Study maintainability, testability, and production engineering lessons.', level: 'REAL WORLD' },
      ],
      challenge: { scenario: 'Booking adds partial refunds, dynamic pricing, and a second payment provider.', prompts: ['Which packages and contracts change?', 'How would you migrate without breaking existing callers?'] },
    },
  ],
}

export function getDesignExploration(track: DesignTrack, week: number) {
  return explorations[track][week - 1]
}
