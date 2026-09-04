export type DesignTrack = 'hld' | 'lld'

export type DesignLesson = {
  week: number
  title: string
  outcome: string
  concepts: string[]
  mentalModel: string
  misconception: string
  correction: string
  pressure: string
  tradeoff: string
  interviewPrompt: string
  visual: string
  sources: { label: string; url: string }[]
}

export const hldLessons: DesignLesson[] = [
  {
    week: 1,
    title: 'From one URL to multiple servers',
    outcome: 'Trace a web request, locate latency and failure points, and explain when L4 or L7 load balancing is appropriate.',
    concepts: ['Client and server', 'URL and DNS', 'TCP, TLS and HTTP', 'Latency vs throughput', 'Vertical vs horizontal scaling', 'Stateless workers', 'Health checks', 'L4 vs L7'],
    mentalModel: 'A request is a parcel crossing checkpoints. Every checkpoint takes time, has limited capacity, and can fail.',
    misconception: 'Adding more servers automatically makes an application scalable.',
    correction: 'Traffic must be distributed, shared state must move out of individual workers, and dependencies can remain bottlenecks.',
    pressure: 'One application server reaches high CPU and p99 latency during a traffic spike.',
    tradeoff: 'Scale up for operational simplicity; scale out for more capacity and failure isolation, accepting distributed-system complexity.',
    interviewPrompt: 'What happens after a user presses Enter, and where would you place a load balancer?',
    visual: 'Animate DNS → connection → TLS → HTTP → application → database, then overload and remove backend servers.',
    sources: [
      { label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
      { label: 'System Design 101', url: 'https://github.com/ByteByteGoHq/system-design-101' },
    ],
  },
  {
    week: 2,
    title: 'Requirements, estimation and reliability targets',
    outcome: 'Turn vague product requests into scoped requirements, rough capacity numbers, and user-centered reliability goals.',
    concepts: ['Functional requirements', 'Non-functional requirements', 'QPS and concurrency', 'Peak vs average load', 'Storage and bandwidth', 'p50/p95/p99', 'SLI, SLO and SLA', 'Error budgets'],
    mentalModel: 'Estimates are architectural guardrails, not predictions to three decimal places.',
    misconception: 'Daily average traffic is sufficient for sizing a production system.',
    correction: 'Peak traffic, burstiness, skew, headroom, and tail latency often determine the design.',
    pressure: 'A product expected 100 requests/second on average but receives a 20× launch spike.',
    tradeoff: 'Higher reliability targets reduce allowed downtime but increase cost and operational complexity.',
    interviewPrompt: 'Estimate five-year storage and peak write QPS for a URL shortener.',
    visual: 'Workload sliders recalculate QPS, concurrency, bandwidth, storage, and monthly error budget.',
    sources: [
      { label: 'Google SRE: SLOs', url: 'https://sre.google/sre-book/service-level-objectives/' },
      { label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
  },
  {
    week: 3,
    title: 'APIs, state and edge components',
    outcome: 'Design retry-safe API contracts and distinguish load balancers, reverse proxies, gateways, CDNs, sessions and tokens.',
    concepts: ['REST and RPC', 'Idempotency', 'Pagination', 'Versioning', 'Authentication vs authorization', 'Sessions and tokens', 'Reverse proxy', 'API gateway and CDN'],
    mentalModel: 'An API is a contract whose timeout, retry, and evolution behavior matters as much as its happy path.',
    misconception: 'POST requests can never be idempotent.',
    correction: 'An idempotency key can make repeated create attempts return the same logical result within a defined scope.',
    pressure: 'A payment succeeds, the response times out, and the client retries.',
    tradeoff: 'Central gateways simplify cross-cutting policy but add latency, coupling, and another failure domain.',
    interviewPrompt: 'Design a create-order API that remains safe after client retries.',
    visual: 'Replay duplicate requests with idempotency disabled and enabled.',
    sources: [
      { label: 'System Design 101', url: 'https://github.com/ByteByteGoHq/system-design-101' },
      { label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
  },
  {
    week: 4,
    title: 'Data modeling and storage selection',
    outcome: 'Choose storage from access patterns and invariants, then identify indexes, transaction boundaries, and scaling costs.',
    concepts: ['Access patterns', 'SQL and NoSQL', 'Key-value and document stores', 'Wide-column storage', 'Object storage', 'Indexes', 'Transactions', 'Normalization and denormalization'],
    mentalModel: 'The database is selected for the questions and guarantees the product needs—not by popularity.',
    misconception: 'NoSQL means schema-free and automatically scalable.',
    correction: 'Every system has a schema; some enforce it in storage while others shift validation and migration work to applications.',
    pressure: 'A profile lookup scans millions of rows and writes slow down after adding many indexes.',
    tradeoff: 'Indexes accelerate selected reads while consuming storage and adding write amplification.',
    interviewPrompt: 'Model URL mappings and click analytics, including keys and indexes.',
    visual: 'Animate a full scan versus an indexed tree lookup and display write cost as indexes are added.',
    sources: [{ label: 'System Design Primer: Databases', url: 'https://github.com/donnemartin/system-design-primer#database' }],
  },
  {
    week: 5,
    title: 'Caching and content delivery networks',
    outcome: 'Select a cache strategy, reason about freshness, and protect the source of truth from stampedes and hot keys.',
    concepts: ['Cache-aside', 'Read-through', 'Write-through', 'Write-behind', 'TTL and eviction', 'Invalidation', 'Cache stampede', 'Hot keys and CDN'],
    mentalModel: 'A cache is a bounded, fallible copy. It is fast precisely because it is not the source of truth.',
    misconception: 'A high cache hit rate guarantees a healthy system.',
    correction: 'A small miss rate can still overload the database at large scale, especially during synchronized expiry or cache failure.',
    pressure: 'A celebrity key expires and thousands of requests hit the database simultaneously.',
    tradeoff: 'Long TTLs improve hit rate and latency while increasing staleness risk.',
    interviewPrompt: 'Cache a frequently viewed profile while preserving read-your-write behavior.',
    visual: 'Control TTL, hit rate, jitter, request coalescing, and cache failure while watching database load.',
    sources: [
      { label: 'System Design Primer: Cache', url: 'https://github.com/donnemartin/system-design-primer#cache' },
      { label: 'Netflix Tech Blog', url: 'https://netflixtechblog.com/' },
    ],
  },
  {
    week: 6,
    title: 'Replication, consistency, CAP and PACELC',
    outcome: 'Explain replica lag and consistency guarantees without misusing CAP.',
    concepts: ['Leader and followers', 'Synchronous vs asynchronous replication', 'Replica lag', 'Read-after-write', 'Quorums', 'Network partitions', 'CAP', 'PACELC'],
    mentalModel: 'Copies create capacity and availability opportunities, but they also create an agreement problem.',
    misconception: 'CAP means every distributed system permanently chooses only two of consistency, availability, and partition tolerance.',
    correction: 'CAP constrains behavior during a network partition; normal-operation latency and consistency trade-offs remain, which PACELC highlights.',
    pressure: 'A user updates a profile and immediately reads stale data from a follower.',
    tradeoff: 'Synchronous replication improves acknowledged-write durability and freshness but increases write latency and can reduce availability.',
    interviewPrompt: 'Which ticket-booking operations require strong consistency, and where is staleness acceptable?',
    visual: 'Adjust replica lag, partition links, quorum size, and read routing to observe anomalies.',
    sources: [{ label: 'System Design 101: CAP', url: 'https://github.com/ByteByteGoHq/system-design-101' }],
  },
  {
    week: 7,
    title: 'Partitioning and consistent hashing',
    outcome: 'Choose a shard key, recognize hotspots, and explain what consistent hashing does—and does not—solve.',
    concepts: ['Range sharding', 'Hash sharding', 'Directory sharding', 'Shard keys', 'Resharding', 'Consistent hashing', 'Virtual nodes', 'Hot partitions'],
    mentalModel: 'Partitioning moves the capacity boundary while turning local operations into distributed operations.',
    misconception: 'Consistent hashing guarantees even real-world load.',
    correction: 'It limits key movement when membership changes; skewed keys and workloads can still create hotspots.',
    pressure: 'One celebrity account receives most traffic even though user IDs are evenly distributed.',
    tradeoff: 'Range partitioning supports scans but risks sequential hotspots; hashing balances keys but scatters range queries.',
    interviewPrompt: 'Choose a shard key for chat messages and explain how you would reshard.',
    visual: 'Move nodes around a hash ring and show key movement, virtual nodes, and workload heat.',
    sources: [{ label: 'System Design Primer: Sharding', url: 'https://github.com/donnemartin/system-design-primer#sharding' }],
  },
  {
    week: 8,
    title: 'Queues, pub/sub and asynchronous workflows',
    outcome: 'Use asynchronous messaging deliberately, including ordering, retries, deduplication, backpressure and dead-letter handling.',
    concepts: ['Queues and pub/sub', 'Streams', 'Consumer groups', 'Ordering scope', 'At-least-once delivery', 'Backpressure', 'Dead-letter queues', 'Outbox pattern'],
    mentalModel: 'A queue trades immediate completion for temporal decoupling, buffering, and independent scaling.',
    misconception: 'Exactly-once messaging removes the need for idempotent application logic.',
    correction: 'Delivery guarantees are scoped; external side effects still require deduplication or idempotency.',
    pressure: 'A poison message retries forever while consumers fall behind.',
    tradeoff: 'Ordering simplifies reasoning but limits parallel consumption and throughput.',
    interviewPrompt: 'Design reliable notification delivery after an order is created.',
    visual: 'Change producer and consumer rates, inject duplicates, and toggle retry, DLQ and idempotency behavior.',
    sources: [{ label: 'System Design Primer: Asynchronism', url: 'https://github.com/donnemartin/system-design-primer#asynchronism' }],
  },
  {
    week: 9,
    title: 'Distributed coordination and Raft',
    outcome: 'Build intuition for leader election, quorum, replicated logs, and consensus under minority failures.',
    concepts: ['Failure detection', 'Leader election', 'Terms and votes', 'Quorum', 'Replicated log', 'Commit index', 'Safety', 'Availability under failures'],
    mentalModel: 'Consensus creates one agreed command order despite delayed messages and minority failures.',
    misconception: 'Leader election alone is consensus.',
    correction: 'Consensus also requires safe agreement and replication of committed values or log entries.',
    pressure: 'A five-node cluster loses its leader and two network links.',
    tradeoff: 'More voting nodes tolerate more failures but increase quorum communication and operational cost.',
    interviewPrompt: 'Why can five Raft nodes tolerate two failures but not three?',
    visual: 'Pause before elections and log commits so the learner predicts the next state.',
    sources: [
      { label: 'The Secret Lives of Data: Raft', url: 'http://thesecretlivesofdata.com/raft/' },
      { label: 'Raft official site', url: 'https://raft.github.io/' },
    ],
  },
  {
    week: 10,
    title: 'Resilience and overload control',
    outcome: 'Prevent retries and slow dependencies from causing cascading failure.',
    concepts: ['Timeouts and deadlines', 'Retry budgets', 'Exponential backoff', 'Jitter', 'Circuit breakers', 'Bulkheads', 'Rate limiting', 'Load shedding and degradation'],
    mentalModel: 'Retries are additional traffic. Protect useful work before maximizing accepted work.',
    misconception: 'Retries always increase availability.',
    correction: 'Unbounded or synchronized retries amplify overload and can prevent a recovering dependency from stabilizing.',
    pressure: 'Checkout waits on a failing recommendation service while every caller retries.',
    tradeoff: 'Early rejection sacrifices some requests to preserve latency and availability for higher-value traffic.',
    interviewPrompt: 'Stop one degraded dependency from taking down checkout.',
    visual: 'Inject latency and failures, then toggle timeout, backoff, jitter, breaker and load shedding.',
    sources: [
      { label: 'Google SRE: Cascading Failures', url: 'https://sre.google/sre-book/addressing-cascading-failures/' },
      { label: 'Netflix Tech Blog', url: 'https://netflixtechblog.com/' },
    ],
  },
  {
    week: 11,
    title: 'Observability, deployment and disaster readiness',
    outcome: 'Measure user impact, trace failures, deploy safely, and define recovery objectives.',
    concepts: ['Logs, metrics and traces', 'Golden signals', 'Correlation IDs', 'Alerts', 'Canary deployment', 'Rollback', 'Failure domains', 'RTO, RPO and restore tests'],
    mentalModel: 'Observability explains internal behavior; reliability is proven by detecting, containing, and recovering from failure.',
    misconception: 'Replicas eliminate the need for backups.',
    correction: 'Replication can copy corruption or deletion; backups must be isolated and restoration must be tested.',
    pressure: 'A rollout returns valid HTTP 200 responses containing incorrect data.',
    tradeoff: 'More telemetry improves diagnosis but increases cost, cardinality risk, and privacy responsibility.',
    interviewPrompt: 'Instrument and safely deploy a feed service across availability zones.',
    visual: 'Explore a request trace, golden-signal dashboard, zone outage, canary and rollback timeline.',
    sources: [
      { label: 'Google SRE: Monitoring', url: 'https://sre.google/sre-book/monitoring-distributed-systems/' },
      { label: 'Uber Engineering', url: 'https://www.uber.com/blog/engineering/' },
    ],
  },
  {
    week: 12,
    title: 'Full SDE2 system-design interviews',
    outcome: 'Lead a complete design discussion from requirements through evolution, failure analysis, security and cost.',
    concepts: ['Clarification', 'Capacity estimates', 'API and data model', 'Read/write paths', 'Bottleneck deep dive', 'Reliability', 'Security and abuse', 'Cost and evolution'],
    mentalModel: 'Build the smallest design that meets stated requirements, then evolve it under explicit pressure.',
    misconception: 'Naming many technologies demonstrates design depth.',
    correction: 'Depth comes from connecting requirements to choices, quantifying pressure, and defending trade-offs and failure behavior.',
    pressure: 'The interviewer adds a 100× traffic increase, regional outage, duplicate events, and a stricter consistency requirement.',
    tradeoff: 'Every additional component buys a capability while adding cost, latency, ownership and failure modes.',
    interviewPrompt: 'Design a URL shortener, chat system, notification platform, feed, or ride-dispatch service in 45 minutes.',
    visual: 'Timed architecture canvas with requirement checks, traffic simulation, failure injection and replay.',
    sources: [
      { label: 'System Design Primer: Interview Method', url: 'https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question' },
      { label: 'PaperDraw', url: 'https://paperdraw.dev/' },
    ],
  },
]

export const lldLessons: DesignLesson[] = [
  {
    week: 1, title: 'Responsibilities, coupling and SOLID', outcome: 'Identify responsibilities and dependencies, then use SOLID as change-management heuristics rather than slogans.', concepts: ['Objects and classes', 'Responsibilities', 'Cohesion and coupling', 'Contracts', 'SRP', 'OCP', 'LSP', 'ISP', 'DIP'], mentalModel: 'Object design decides who knows what, who does what, and what should change together.', misconception: 'SRP means every class should contain only one method.', correction: 'A responsibility is a coherent reason or actor driving change; several methods may serve one responsibility.', pressure: 'Checkout gains a new payment provider, discount policy and notification channel.', tradeoff: 'Abstractions reduce coupling around volatile behavior but add indirection and should not be speculative.', interviewPrompt: 'Refactor a checkout class that calculates, persists, charges and emails.', visual: 'Animate the change blast radius before and after responsibilities are separated.', sources: [{ label: 'Refactoring.Guru', url: 'https://refactoring.guru/design-patterns' }],
  },
  {
    week: 2, title: 'Modeling objects and relationships', outcome: 'Model entities, value objects and services while protecting invariants and selecting relationships deliberately.', concepts: ['Entity and value object', 'Encapsulation', 'Invariant', 'Association', 'Aggregation', 'Composition', 'Inheritance', 'Polymorphism'], mentalModel: 'Model stable behavior and rules—not every noun in the requirements.', misconception: 'Inheritance is the default way to reuse code.', correction: 'Use inheritance for a genuine substitutable is-a relationship; use composition when behavior varies independently.', pressure: 'Parking spots gain size restrictions, accessibility rules and electric charging.', tradeoff: 'Rich domain objects protect rules but can become difficult to persist if boundaries are unclear.', interviewPrompt: 'Model a parking lot and decide who owns allocation behavior.', visual: 'Drag relationships onto a class diagram and simulate object lifecycle deletion.', sources: [{ label: 'Awesome Low-Level Design', url: 'https://github.com/ashishps1/awesome-low-level-design' }],
  },
  {
    week: 3, title: 'Requirements, UML and tests', outcome: 'Convert use cases into class, sequence and state views backed by explicit invariants and tests.', concepts: ['Use cases', 'Preconditions', 'Postconditions', 'Class diagrams', 'Sequence diagrams', 'State machines', 'Multiplicity', 'Contract tests'], mentalModel: 'Each diagram answers a different question; none of them is the design by itself.', misconception: 'A detailed class diagram proves the design works.', correction: 'Walking a use case and testing state transitions exposes missing collaboration and illegal states.', pressure: 'A vending machine must support cancellation, insufficient change and product depletion.', tradeoff: 'More modeling improves shared understanding but can delay feedback if diagrams are not tested against scenarios.', interviewPrompt: 'Draw the purchase sequence and enumerate illegal vending-machine states.', visual: 'Synchronize a sequence diagram with a live object-state inspector.', sources: [{ label: 'Awesome Low-Level Design', url: 'https://github.com/ashishps1/awesome-low-level-design' }],
  },
  {
    week: 4, title: 'Refactoring and simple design', outcome: 'Recognize code smells and perform the cheapest behavior-preserving refactoring.', concepts: ['KISS, DRY and YAGNI', 'Long method', 'Feature envy', 'Shotgun surgery', 'Extract class', 'Introduce parameter object', 'Replace conditionals', 'Characterization tests'], mentalModel: 'A smell is a signal to investigate, not an automatic command to refactor.', misconception: 'Any repeated syntax violates DRY.', correction: 'DRY targets duplicated knowledge; coincidentally similar code may evolve for different reasons.', pressure: 'A task manager adds recurring tasks and multiple sorting policies.', tradeoff: 'Refactoring improves changeability but carries migration and regression risk without tests.', interviewPrompt: 'Explain the safest sequence for untangling a large task-management method.', visual: 'Show dependency and test coverage changes after each small refactoring.', sources: [{ label: 'Refactoring.Guru: Refactoring', url: 'https://refactoring.guru/refactoring' }],
  },
  {
    week: 5, title: 'Creational patterns and dependency assembly', outcome: 'Separate object construction from business policy using factories, builders and dependency injection only when justified.', concepts: ['Simple Factory', 'Factory Method', 'Abstract Factory', 'Builder', 'Dependency injection', 'Composition root', 'Constructor invariants'], mentalModel: 'Construction decisions should not leak throughout business logic.', misconception: 'Every object should be created by a factory.', correction: 'Direct construction is simplest; factories help when selection, lifecycle or coordinated construction genuinely varies.', pressure: 'Notification providers differ by environment and require related credentials and clients.', tradeoff: 'Factories centralize variation but can hide dependencies or create unnecessary abstraction.', interviewPrompt: 'Choose between a constructor, Factory Method, Abstract Factory and Builder.', visual: 'Switch deployment configuration and animate the resulting object graph.', sources: [{ label: 'Refactoring.Guru: Creational Patterns', url: 'https://refactoring.guru/design-patterns/creational-patterns' }],
  },
  {
    week: 6, title: 'Strategy, State and behavioral variation', outcome: 'Distinguish interchangeable algorithms from lifecycle-dependent behavior.', concepts: ['Strategy', 'State', 'Template Method', 'Policy objects', 'Finite-state machines', 'Guards and transitions'], mentalModel: 'Strategy changes how work is done; State changes what an object may do now and how it transitions.', misconception: 'Any switch statement must be replaced with polymorphism.', correction: 'Small stable switches can be clearer; extract polymorphism when variants change independently or switches repeat.', pressure: 'Parking pricing gains weekend policies while document behavior changes across workflow states.', tradeoff: 'Polymorphism improves extension but spreads behavior across types and can obscure simple flow.', interviewPrompt: 'Decide whether elevator scheduling needs Strategy, State, or both.', visual: 'Hot-swap pricing strategies and step through a guarded state machine.', sources: [{ label: 'Refactoring.Guru: Behavioral Patterns', url: 'https://refactoring.guru/design-patterns/behavioral-patterns' }],
  },
  {
    week: 7, title: 'Structural boundaries and wrappers', outcome: 'Choose Adapter, Facade, Decorator, Composite or Proxy from intent rather than structural similarity.', concepts: ['Adapter', 'Facade', 'Decorator', 'Proxy', 'Composite', 'Wrapper delegation', 'External boundaries'], mentalModel: 'Wrappers may translate, simplify, add behavior, control access, or represent trees—the intent distinguishes the pattern.', misconception: 'Decorator and Proxy are interchangeable because both wrap an object.', correction: 'Decorator adds composable behavior; Proxy controls access or lifecycle while preserving the subject interface.', pressure: 'A payment vendor changes its API and storage access needs logging, caching and authorization.', tradeoff: 'Wrappers isolate change but deep chains can make execution order and debugging difficult.', interviewPrompt: 'Explain Adapter vs Facade and Decorator vs Proxy with one example each.', visual: 'X-ray a wrapper chain and highlight which layer transforms each request.', sources: [{ label: 'Refactoring.Guru: Structural Patterns', url: 'https://refactoring.guru/design-patterns/structural-patterns' }],
  },
  {
    week: 8, title: 'Events, commands and handler chains', outcome: 'Decouple producers, senders and handlers while preserving traceability and lifecycle safety.', concepts: ['Observer', 'Command', 'Chain of Responsibility', 'Mediator', 'Synchronous events', 'Subscriptions', 'Undo and queues'], mentalModel: 'Observer decouples a fact from reactions; Command turns a request into an object that can be queued, logged or undone.', misconception: 'Observer automatically makes a system asynchronous.', correction: 'Observers may run synchronously in the same call stack; delivery semantics must be designed explicitly.', pressure: 'An auction adds fraud checks, audit, notifications, queued bids and admin undo.', tradeoff: 'Event decoupling improves extension but weakens obvious control flow and requires ownership of subscriptions and failures.', interviewPrompt: 'Choose between Command, Strategy and Observer for a bid-processing workflow.', visual: 'Trace an event across subscribers and inspect a configurable handler chain.', sources: [{ label: 'Refactoring.Guru: Observer', url: 'https://refactoring.guru/design-patterns/observer' }],
  },
  {
    week: 9, title: 'Domain state and persistence boundaries', outcome: 'Keep business rules independent from storage while making transaction and idempotency assumptions explicit.', concepts: ['Repository', 'Domain service', 'Transaction boundary', 'Optimistic locking', 'Pessimistic locking', 'Idempotency', 'Error modeling'], mentalModel: 'Persistence is a boundary; domain rules still need an explicit consistency strategy.', misconception: 'A Repository makes database concerns disappear.', correction: 'It isolates access policy, but callers must still understand transaction scope, conflicts, retries and failure semantics.', pressure: 'Two users attempt to reserve the same seat at the same time.', tradeoff: 'Pessimistic locking prevents conflicts early but reduces concurrency; optimistic locking favors concurrency and retries conflicts.', interviewPrompt: 'Design a seat hold and explain its consistency boundary.', visual: 'Interleave two reservation sequences and toggle optimistic or pessimistic locking.', sources: [{ label: 'Awesome Low-Level Design', url: 'https://github.com/ashishps1/awesome-low-level-design' }],
  },
  {
    week: 10, title: 'Concurrency-aware object design', outcome: 'Protect multi-step invariants and explain race conditions, atomicity, lock ownership and deadlock prevention.', concepts: ['Race condition', 'Critical section', 'Mutex and semaphore', 'Condition variable', 'Deadlock', 'Lock ordering', 'Immutability', 'Thread safety'], mentalModel: 'If an invariant spans multiple reads and writes, the design needs an atomicity strategy.', misconception: 'A thread-safe collection makes every compound operation thread-safe.', correction: 'Check-then-act sequences can still race unless the complete invariant is protected atomically.', pressure: 'An LRU cache becomes concurrent and entries also expire by TTL.', tradeoff: 'Coarse locks simplify correctness but reduce concurrency; fine locks improve parallelism while increasing reasoning complexity.', interviewPrompt: 'Identify the protected state and linearization point in a bounded queue.', visual: 'Interleave threads and build a lock-order graph that reveals deadlock.', sources: [{ label: 'Awesome Low-Level Design: Concurrency', url: 'https://github.com/ashishps1/awesome-low-level-design' }],
  },
  {
    week: 11, title: 'Classic interview designs', outcome: 'Lead complete object-design exercises without pattern dumping.', concepts: ['Requirement scoping', 'Responsibility assignment', 'Core flows', 'State transitions', 'Policy variation', 'Error paths', 'Test strategy', 'Trade-offs'], mentalModel: 'Derive abstractions from current use cases and named changes—not imagined universality.', misconception: 'Using more GoF patterns earns a better LLD score.', correction: 'Patterns are useful only when they resolve a real design pressure clearly and economically.', pressure: 'Splitwise adds unequal splits, percentages, settlement simplification and multiple currencies.', tradeoff: 'A flexible domain model improves extension while increasing validation and invariant complexity.', interviewPrompt: 'Design Splitwise, an elevator, ATM, logging framework or chess clock in 45 minutes.', visual: 'Timed whiteboard with requirement, invariant and extensibility checks.', sources: [{ label: 'Awesome Low-Level Design: Problems', url: 'https://github.com/ashishps1/awesome-low-level-design' }],
  },
  {
    week: 12, title: 'SDE2 capstone and design review', outcome: 'Defend package boundaries, concurrency, failure behavior, migration and deliberately omitted abstractions.', concepts: ['Package boundaries', 'Dependency direction', 'Backward compatibility', 'Observability', 'Migration', 'Fitness checks', 'Design review', 'Trade-off log'], mentalModel: 'SDE2 design includes evolution and operational failure—not merely a class diagram.', misconception: 'A design is finished when the happy-path code works.', correction: 'A production-ready design also explains illegal states, concurrency, errors, observability and safe change.', pressure: 'Booking adds a second payment provider, partial refunds, dynamic pricing and high-contention seat holds.', tradeoff: 'Backward compatibility slows redesign but enables independent and safer evolution.', interviewPrompt: 'Present a booking-system capstone and respond to a critical design review.', visual: 'Display dependency cycles and a heat map showing the blast radius of each new requirement.', sources: [{ label: 'Refactoring.Guru', url: 'https://refactoring.guru/' }],
  },
]
