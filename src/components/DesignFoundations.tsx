export function DesignFoundations({ track }: { track: 'hld' | 'lld' }) {
  const terms = track === 'hld' ? [
    ['Client and server', 'A client initiates requests. A server process listens on a network port and responds. One machine can run many processes.'],
    ['DNS', 'Maps a hostname to an address clients can reach. Cached answers can avoid a fresh lookup on every request.'],
    ['TCP and TLS', 'TCP transports an ordered byte stream. TLS authenticates the endpoint and encrypts the connection. Connections may be reused.'],
    ['HTTP', 'Defines the application request and response: method, path, headers, body, and status.'],
    ['Latency and throughput', 'Latency is the time one request takes. Throughput is completed requests per unit time; more throughput does not necessarily mean lower latency.'],
    ['L4 and L7', 'L4 routes transport connections using information such as IP and port. An HTTP-aware L7 proxy can route by path or headers, typically terminating TLS. Neither is universally better.'],
  ] : [
    ['Object and class', 'An object has identity, state, and behavior. A class describes a kind of object; useful design does not create a class for every noun.'],
    ['Responsibility', 'A decision or obligation owned by one cohesive component.'],
    ['Contract', 'What callers may rely on: results, side effects, errors, and invariants.'],
    ['Cohesion and coupling', 'Cohesion asks whether a component’s behavior belongs together. Coupling asks how much one component knows about another.'],
    ['Composition', 'An object delegates work to collaborators it contains instead of inheriting every behavior.'],
    ['Polymorphism', 'Different implementations safely satisfy the same expected contract.'],
  ]
  return <div className="wb-foundations">
    <details><summary>New here? Start with the foundations</summary>
      <dl>{terms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      {track === 'hld' && <p><b>A first request:</b> resolve the hostname, establish a connection, negotiate TLS for HTTPS, then send HTTP. A load balancer can distribute traffic to application workers; their databases or shared state can still be the bottleneck.</p>}
    </details>
    {track === 'lld' && <details><summary>SOLID: five questions, not five slogans</summary><dl>
      {[
        ['Single responsibility', 'How many reasons does this class have to change? Email formatting and database persistence usually change for different reasons.'],
        ['Open/closed', 'Can you add a new behavior without editing stable policy? Add a new Notifier implementation rather than another vendor-specific branch in orchestration.'],
        ['Liskov substitution', 'Can this subtype safely replace its parent? A Penguin throwing from a promised fly() operation violates that contract; model flying capability separately.'],
        ['Interface segregation', 'Is this client forced to depend on unused methods? A read-only consumer should not require a broad administrative interface.'],
        ['Dependency inversion', 'Does high-level policy depend on a stable contract, or on a concrete vendor? Inject Notifier and Repository collaborators; keep their wiring at the boundary.'],
      ].map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}
    </dl><p>These are change-management heuristics, not a demand for an interface around every class. Compare the actual change cost in Experiment.</p></details>}
  </div>
}
