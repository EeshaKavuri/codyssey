import { useEffect, useState, type CSSProperties } from 'react'
import { getPatternFamily, type PatternFamily } from '../../data/dsaTheory'
import './dsa-concept-visual.css'

type StructureKind = 'linked' | 'array' | 'matrix' | 'stack' | 'hash' | 'tree' | 'heap' | 'intervals' | 'graph' | 'recursion' | 'search' | 'table' | 'bits' | 'string'
type Operation = { id: string; label: string; time: string; note: string }
type StructureGuide = { kind: StructureKind; title: string; description: string; operations: Operation[] }

const op = (id: string, label: string, time: string, note: string): Operation => ({ id, label, time, note })

const guides: Record<PatternFamily, StructureGuide> = {
  linkedList: {
    kind: 'linked', title: 'Linked-list anatomy', description: 'Each node stores a value and a reference. Head starts the chain; tail is the final node whose next reference is null.',
    operations: [
      op('access', 'Access or search', 'O(n)', 'Follow next references from head until the target is found.'),
      op('insert-head', 'Insert at head', 'O(1)', 'Point the new node at the old head, then move head.'),
      op('insert-tail', 'Insert at tail', 'O(1) / O(n)', 'O(1) with a maintained tail pointer; otherwise traverse from head.'),
      op('delete-head', 'Delete head', 'O(1)', 'Move head to head.next.'),
      op('delete-node', 'Delete known node', 'O(1)', 'Rewire the previous node; locating that node still costs O(n).'),
    ],
  },
  fastSlow: {
    kind: 'linked', title: 'Fast and slow pointers', description: 'Two references move through the same chain at different speeds or with a fixed gap.',
    operations: [op('middle', 'Find middle', 'O(n)', 'Slow moves once while fast moves twice.'), op('cycle', 'Detect cycle', 'O(n)', 'A meeting proves a cycle using O(1) space.'), op('nth', 'Nth from end', 'O(n)', 'Keep a fixed n-node gap between pointers.')],
  },
  fundamentals: {
    kind: 'array', title: 'Sequence and index model', description: 'Start by making positions, boundaries, and the processed region visible.',
    operations: [op('access', 'Indexed access', 'O(1)', 'Read a known position directly.'), op('scan', 'Linear scan', 'O(n)', 'Visit every item once.'), op('copy', 'Build result', 'O(n)', 'A separate output usually needs linear space.')],
  },
  array: {
    kind: 'array', title: 'Array anatomy', description: 'Contiguous indexed cells make random access cheap but shifting elements expensive.',
    operations: [op('access', 'Access by index', 'O(1)', 'Jump directly to one cell.'), op('search', 'Search unsorted', 'O(n)', 'Inspect cells until the value appears.'), op('append', 'Append', 'O(1) amortized', 'Occasional resizing copies the backing array.'), op('insert', 'Insert or delete middle', 'O(n)', 'Shift the suffix to preserve contiguous order.')],
  },
  kadane: {
    kind: 'array', title: 'Running-state scan', description: 'At each cell, choose whether the best segment ending here restarts or extends.',
    operations: [op('scan', 'Maximum subarray', 'O(n)', 'Each element updates current and global best once.'), op('space', 'Auxiliary state', 'O(1)', 'Only running totals and optional boundaries are required.')],
  },
  matrix: {
    kind: 'matrix', title: 'Matrix coordinates', description: 'Rows, columns, neighbors, and shrinking boundaries define every movement.',
    operations: [op('cell', 'Access cell', 'O(1)', 'Use row and column coordinates.'), op('traverse', 'Traverse matrix', 'O(r × c)', 'Visit each cell once.'), op('search', 'Ordered search', 'O(r + c)', 'Discard a row or column after each comparison when ordering permits.')],
  },
  string: {
    kind: 'string', title: 'String as indexed characters', description: 'Character positions behave like an array, while immutable updates usually require a new result.',
    operations: [op('access', 'Access character', 'O(1)', 'Read a known index.'), op('scan', 'Scan or validate', 'O(n)', 'Compare or transform each character.'), op('build', 'Build output', 'O(n)', 'Use a buffer instead of repeated immutable concatenation.')],
  },
  twoPointers: {
    kind: 'array', title: 'Two-pointer search space', description: 'Left and right boundaries eliminate impossible candidates without enumerating every pair.',
    operations: [op('scan', 'Two-pointer scan', 'O(n)', 'Each pointer moves in only one direction.'), op('sort', 'Sort then scan', 'O(n log n)', 'Sorting dominates when ordered input is not provided.'), op('space', 'Extra space', 'O(1)', 'Pointer state is constant when sorting may mutate the input.')],
  },
  stack: {
    kind: 'stack', title: 'Stack and queue anatomy', description: 'A stack exposes the newest item; a queue exposes the oldest item.',
    operations: [op('push', 'Stack push / pop', 'O(1)', 'Only the top changes.'), op('queue', 'Queue enqueue / dequeue', 'O(1)', 'Use front and rear references or a deque.'), op('peek', 'Peek', 'O(1)', 'Read the exposed end without removing it.'), op('search', 'Search', 'O(n)', 'The structure provides no indexed lookup guarantee.')],
  },
  monotonic: {
    kind: 'stack', title: 'Monotonic stack', description: 'The stack keeps candidates ordered; dominated entries leave permanently.',
    operations: [op('process', 'Whole scan', 'O(n)', 'Every item is pushed and popped at most once.'), op('push', 'Push', 'O(1) amortized', 'Pop dominated items before adding the new candidate.'), op('space', 'Worst-case space', 'O(n)', 'All values may remain unresolved.')],
  },
  hashing: {
    kind: 'hash', title: 'Hash table buckets', description: 'A hash maps a key to a bucket so membership and counts avoid repeated scans.',
    operations: [op('lookup', 'Lookup', 'O(1) average', 'Hash the key and inspect its bucket.'), op('insert', 'Insert or update', 'O(1) average', 'Resize occasionally when the load factor grows.'), op('delete', 'Delete', 'O(1) average', 'Locate the key in its bucket.'), op('worst', 'Collision worst case', 'O(n)', 'Many keys can collapse into one bucket.')],
  },
  prefix: {
    kind: 'array', title: 'Prefix-state timeline', description: 'Each prefix stores the aggregate before a boundary, turning a range into a difference.',
    operations: [op('build', 'Build prefixes', 'O(n)', 'Accumulate once from left to right.'), op('query', 'Range query', 'O(1)', 'Subtract two stored prefix values.'), op('count', 'Count target ranges', 'O(n)', 'Combine a running prefix with a frequency map.')],
  },
  slidingWindow: {
    kind: 'array', title: 'Sliding window boundaries', description: 'The active range expands and contracts while its state is updated incrementally.',
    operations: [op('variable', 'Variable window', 'O(n)', 'Each boundary advances at most n times.'), op('fixed', 'Fixed window', 'O(n)', 'Add one item and remove one item per step.'), op('space', 'Window state', 'O(k)', 'Counts may grow with the distinct values inside the window.')],
  },
  trie: {
    kind: 'tree', title: 'Trie prefix paths', description: 'Every edge represents a character or bit; shared prefixes reuse the same path.',
    operations: [op('insert', 'Insert key', 'O(L)', 'Create or follow one node per symbol.'), op('search', 'Search key', 'O(L)', 'Walk the complete key and verify the terminal marker.'), op('prefix', 'Prefix query', 'O(P)', 'Stop after the prefix length.'), op('space', 'Storage', 'O(total symbols)', 'Shared prefixes reduce duplicate paths.')],
  },
  tree: {
    kind: 'tree', title: 'Tree anatomy', description: 'Root, parent, child, leaf, depth, and subtree boundaries make recursive work visible.',
    operations: [op('traverse', 'Traversal', 'O(n)', 'Visit every node once.'), op('search', 'BST search', 'O(log n) average', 'Worst case is O(n) when the tree becomes skewed.'), op('insert', 'BST insert', 'O(log n) average', 'Follow one root-to-leaf path.'), op('delete', 'BST delete', 'O(log n) average', 'Find the node, then repair zero, one, or two-child cases.')],
  },
  heap: {
    kind: 'heap', title: 'Heap tree and array', description: 'A complete tree is stored in an array; only parent-child priority is guaranteed.',
    operations: [op('peek', 'Peek min or max', 'O(1)', 'The root stores the highest-priority item.'), op('insert', 'Insert', 'O(log n)', 'Append then bubble upward.'), op('remove', 'Remove root', 'O(log n)', 'Move the last item to root and bubble down.'), op('build', 'Build heap', 'O(n)', 'Bottom-up heapify is linear.')],
  },
  intervals: {
    kind: 'intervals', title: 'Intervals on a timeline', description: 'Sorting exposes overlap, compatibility, and the active boundary.',
    operations: [op('sort', 'Sort intervals', 'O(n log n)', 'Choose start or finish according to the goal.'), op('merge', 'Merge scan', 'O(n)', 'Compare each interval with the active merged interval.'), op('insert', 'Insert interval', 'O(n)', 'Scan, merge overlaps, and preserve order.')],
  },
  sorting: {
    kind: 'array', title: 'Sorted and unsorted regions', description: 'The invariant separates values already in final order from work that remains.',
    operations: [op('merge', 'Merge sort', 'O(n log n)', 'Stable with O(n) auxiliary space.'), op('quick', 'Quick sort', 'O(n log n) average', 'Worst case O(n²); usually in-place.'), op('count', 'Counting sort', 'O(n + k)', 'Useful when the value range k is manageable.')],
  },
  graph: {
    kind: 'graph', title: 'Graph and frontier', description: 'Vertices connect through edges; a frontier separates discovered work from completed work.',
    operations: [op('bfs', 'BFS or DFS', 'O(V + E)', 'Visit each vertex and edge once.'), op('add-edge', 'Add edge', 'O(1)', 'Append to an adjacency list.'), op('lookup', 'Check adjacency', 'O(degree)', 'A set can trade space for average O(1) membership.')],
  },
  topo: {
    kind: 'graph', title: 'Dependency graph', description: 'Zero-indegree nodes are the work whose prerequisites are already satisfied.',
    operations: [op('order', 'Topological order', 'O(V + E)', 'Process each node and decrement each edge once.'), op('cycle', 'Cycle detection', 'O(V + E)', 'A short output or DFS back-edge proves a cycle.')],
  },
  shortestPath: {
    kind: 'graph', title: 'Weighted graph distances', description: 'Relaxation replaces a distance only when a cheaper route is proven.',
    operations: [op('bfs', 'Unweighted shortest path', 'O(V + E)', 'BFS explores by distance layers.'), op('dijkstra', 'Dijkstra', 'O((V + E) log V)', 'Requires non-negative weights with a heap.'), op('bellman', 'Bellman–Ford', 'O(VE)', 'Handles negative edges and detects negative cycles.')],
  },
  unionFind: {
    kind: 'graph', title: 'Disjoint-set forest', description: 'Each component resolves to one representative; path compression flattens repeated lookups.',
    operations: [op('find', 'Find', 'O(α(n)) amortized', 'Follow parents and compress the path.'), op('union', 'Union', 'O(α(n)) amortized', 'Attach the smaller tree to the larger root.'), op('connected', 'Connectivity check', 'O(α(n))', 'Compare representatives.')],
  },
  backtracking: {
    kind: 'recursion', title: 'Decision tree', description: 'Choose, explore, and undo while pruning branches that cannot produce a valid answer.',
    operations: [op('explore', 'Explore states', 'Exponential', 'The branching factor and depth determine the search size.'), op('prune', 'Constraint check', 'Problem-dependent', 'Earlier rejection can remove entire subtrees.'), op('space', 'Call stack', 'O(depth)', 'Plus storage for produced answers.')],
  },
  recursion: {
    kind: 'recursion', title: 'Recursive call stack', description: 'Each frame owns a smaller problem and waits for its child result.',
    operations: [op('calls', 'Total work', 'Calls × work/call', 'Count every generated frame.'), op('space', 'Stack space', 'O(max depth)', 'Only simultaneously active calls occupy the stack.'), op('memo', 'Memoized recursion', 'O(states × transition)', 'Cache repeated states.')],
  },
  subsets: {
    kind: 'recursion', title: 'Take / skip tree', description: 'Each input item creates a decision level with include and exclude branches.',
    operations: [op('generate', 'Generate subsets', 'O(2ⁿ)', 'There are two choices for each item.'), op('copy', 'Output cost', 'O(n · 2ⁿ)', 'Copying each completed subset costs up to n.'), op('space', 'Working depth', 'O(n)', 'Excluding the returned output.')],
  },
  binarySearch: {
    kind: 'search', title: 'Binary-search boundaries', description: 'Low, mid, and high contain every still-possible answer.',
    operations: [op('search', 'Exact search', 'O(log n)', 'Discard half after every comparison.'), op('boundary', 'First or last valid', 'O(log n)', 'Keep the successful half containing the boundary.'), op('answer', 'Binary search on answer', 'O(log range × check)', 'The feasibility predicate must be monotonic.')],
  },
  dp: {
    kind: 'table', title: 'Dynamic-programming states', description: 'Each cell has one precise meaning and reads only already-solved dependencies.',
    operations: [op('time', 'Time', 'states × transitions', 'Count distinct states and choices per state.'), op('space', 'Table space', 'O(states)', 'May compress when only earlier layers are required.'), op('reconstruct', 'Reconstruct answer', 'O(path length)', 'Store decisions or walk backward through the table.')],
  },
  greedy: {
    kind: 'intervals', title: 'Greedy choice sequence', description: 'Commit to one local choice only when an exchange argument preserves optimality.',
    operations: [op('sort', 'Sort candidates', 'O(n log n)', 'Often exposes the correct local choice.'), op('scan', 'Greedy scan', 'O(n)', 'Accept or reject each candidate once.'), op('space', 'Extra state', 'O(1) to O(n)', 'Depends on whether the chosen result must be stored.')],
  },
  bit: {
    kind: 'bits', title: 'Bit positions and masks', description: 'Each bit independently represents a flag, parity, subset choice, or power of two.',
    operations: [op('test', 'Test, set, clear bit', 'O(1)', 'Use masks with AND, OR, and NOT.'), op('xor', 'XOR accumulation', 'O(n)', 'Equal values cancel across one pass.'), op('subsets', 'Enumerate masks', 'O(2ⁿ)', 'One mask represents one subset.')],
  },
  math: {
    kind: 'bits', title: 'Numeric reduction', description: 'Replace simulation with divisibility, gcd, prime, modular, or combinatorial structure.',
    operations: [op('gcd', 'Euclidean gcd', 'O(log n)', 'Repeated remainders shrink quickly.'), op('sieve', 'Prime sieve', 'O(n log log n)', 'Mark multiples once per prime.'), op('power', 'Fast power', 'O(log exponent)', 'Square the base while halving the exponent.')],
  },
  stringMatching: {
    kind: 'string', title: 'Text, pattern, and prefix reuse', description: 'Preprocessing records how much matched work survives a mismatch.',
    operations: [op('preprocess', 'Build prefix table', 'O(m)', 'Compute reusable borders for the pattern.'), op('search', 'KMP search', 'O(n + m)', 'The text pointer never moves backward.'), op('space', 'Prefix storage', 'O(m)', 'Store one fallback length per pattern position.')],
  },
  palindrome: {
    kind: 'string', title: 'Mirrored boundaries', description: 'A confirmed palindrome expands symmetrically around an odd or even center.',
    operations: [op('validate', 'Validate palindrome', 'O(n)', 'Compare mirrored ends once.'), op('expand', 'All center expansions', 'O(n²)', 'Expand around every odd and even center.'), op('manacher', 'Manacher', 'O(n)', 'Reuse the rightmost known palindrome radius.')],
  },
}

function StructureDiagram({ kind }: { kind: StructureKind }) {
  if (kind === 'linked') return <div className="concept-linked" aria-label="Linked list with head, connected nodes, tail, and null">
    {[7, 14, 21].map((value, index) => <div className="concept-linked-item" key={value}>
      {index === 0 && <span className="concept-marker concept-head">HEAD</span>}
      <div className="concept-node"><strong>{value}</strong><span>next</span></div>
      <i aria-hidden="true">{index === 2 ? '→ null' : '→'}</i>
      {index === 2 && <span className="concept-marker concept-tail">TAIL</span>}
    </div>)}
  </div>
  if (kind === 'stack') return <div className="concept-stack" aria-label="Stack with top, push, and pop directions"><span>TOP</span>{['C', 'B', 'A'].map(value => <b key={value}>{value}</b>)}<i>push ↓ · pop ↑</i></div>
  if (kind === 'hash') return <div className="concept-hash" aria-label="Hash table buckets">{[['ada', '3'], ['linus', '8'], ['grace', '5']].map(([key, value], index) => <div key={key}><span>{index}</span><b>{key}</b><i>→</i><strong>{value}</strong></div>)}</div>
  if (kind === 'matrix' || kind === 'table') return <div className={`concept-grid ${kind}`} aria-label={kind === 'table' ? 'Dynamic programming table' : 'Matrix coordinates'}>{Array.from({ length: 12 }, (_, index) => <span className={[1, 5, 9, 10].includes(index) ? 'active' : ''} key={index}>{kind === 'table' ? index : `${Math.floor(index / 4)},${index % 4}`}</span>)}</div>
  if (kind === 'tree' || kind === 'heap') return <div className={`concept-tree ${kind}`} aria-label={kind === 'heap' ? 'Heap represented as a tree and array' : 'Rooted tree with parent and child nodes'}>
    <svg viewBox="0 0 420 190" role="img"><line x1="210" y1="38" x2="105" y2="105" /><line x1="210" y1="38" x2="315" y2="105" /><line x1="105" y1="105" x2="55" y2="165" /><line x1="105" y1="105" x2="155" y2="165" /><line x1="315" y1="105" x2="265" y2="165" /><line x1="315" y1="105" x2="365" y2="165" /></svg>
    {[['ROOT', 50, 11], ['L', 25, 45], ['R', 75, 45], ['LEAF', 12, 78], ['LEAF', 38, 78], ['LEAF', 62, 78], ['LEAF', 88, 78]].map(([label, left, top]) => <span style={{ left: `${left}%`, top: `${top}%` }} key={`${label}-${left}`}>{kind === 'heap' && label === 'ROOT' ? '1' : label}</span>)}
  </div>
  if (kind === 'graph') return <div className="concept-graph" aria-label="Graph vertices, edges, and exploration frontier">
    <svg viewBox="0 0 420 190" role="img"><path d="M70 95 L170 40 L260 88 L355 42 M170 40 L190 155 L260 88 L340 155 M70 95 L190 155" /></svg>
    {[['A', 16, 48], ['B', 40, 18], ['C', 62, 45], ['D', 86, 18], ['E', 45, 80], ['F', 82, 80]].map(([label, left, top], index) => <span className={index < 3 ? 'active' : ''} style={{ left: `${left}%`, top: `${top}%` }} key={label}>{label}</span>)}
  </div>
  if (kind === 'recursion') return <div className="concept-recursion" aria-label="Recursive call stack and decision branches"><div><span>solve(3)</span><span>solve(2)</span><span>solve(1)</span><span>base</span></div><strong>choose</strong><i>→ explore → undo</i></div>
  if (kind === 'intervals') return <div className="concept-intervals" aria-label="Intervals arranged on a timeline"><i /><span style={{ '--start': 4, '--length': 34 } as CSSProperties}>A</span><span style={{ '--start': 28, '--length': 31 } as CSSProperties}>B</span><span className="active" style={{ '--start': 62, '--length': 28 } as CSSProperties}>C</span></div>
  if (kind === 'bits') return <div className="concept-bits" aria-label="Binary value and bit mask"><span>VALUE</span>{'101101'.split('').map((bit, index) => <b className={bit === '1' ? 'active' : ''} key={index}>{bit}<small>{5 - index}</small></b>)}<i>mask · shift · xor</i></div>
  if (kind === 'string') return <div className="concept-string" aria-label="Indexed text and pattern">{'CODYSSEY'.split('').map((char, index) => <span className={index >= 2 && index <= 5 ? 'active' : ''} key={index}>{char}<small>{index}</small></span>)}<i>← mirrored / matched range →</i></div>
  if (kind === 'search') return <div className="concept-array concept-search" aria-label="Binary search with low, mid, and high pointers">{[3, 8, 12, 19, 24, 31, 42].map((value, index) => <span className={index === 3 ? 'active' : ''} key={value}><b>{value}</b><small>{index === 0 ? 'LOW' : index === 3 ? 'MID' : index === 6 ? 'HIGH' : index}</small></span>)}</div>
  return <div className="concept-array" aria-label="Indexed sequence with active processing boundaries">{[4, 8, 15, 16, 23, 42].map((value, index) => <span className={index === 1 || index === 4 ? 'active' : ''} key={value}><b>{value}</b><small>{index}</small></span>)}</div>
}

export function DsaConceptVisual({ pattern }: { pattern: string }) {
  const family = getPatternFamily(pattern)
  const guide = guides[family]
  const [selected, setSelected] = useState(guide.operations[0].id)
  useEffect(() => setSelected(guide.operations[0].id), [guide])
  const active = guide.operations.find(operation => operation.id === selected) ?? guide.operations[0]

  return <section className="dsa-concept-visual" aria-label={`${guide.title} visual guide`}>
    <header>
      <div><span>STRUCTURE & OPERATIONS</span><h3>{guide.title}</h3><p>{guide.description}</p></div>
      <strong>{active.time}</strong>
    </header>
    <div className="concept-visual-layout">
      <figure><StructureDiagram kind={guide.kind} /><figcaption><b>{active.label}</b><span>{active.note}</span></figcaption></figure>
      <div className="concept-operation-grid" role="list" aria-label="Operation complexity">
        {guide.operations.map(operation => <button type="button" role="listitem" aria-pressed={operation.id === active.id} onClick={() => setSelected(operation.id)} key={operation.id}>
          <span>{operation.label}</span><strong>{operation.time}</strong><small>{operation.note}</small>
        </button>)}
      </div>
    </div>
  </section>
}
