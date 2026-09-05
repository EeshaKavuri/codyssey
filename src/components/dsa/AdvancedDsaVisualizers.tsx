import { useMemo, type CSSProperties } from 'react'
import { useLessonInput, useLessonNumber } from '../../data/learningProgress'
import { AlgorithmPlayer, type AnimationStep } from './AlgorithmPlayer'

const numbers = (input: string, fallback: number[], limit = 15) => {
  const parsed = input.split(',').map((value) => value.trim()).filter(Boolean).map(Number).filter(Number.isFinite)
  return (parsed.length ? parsed : fallback).slice(0, limit)
}

type TreeState = {
  values: number[]
  active: number | null
  visited: number[]
  queue: number[]
}

function treeSteps(values: number[]): AnimationStep<TreeState>[] {
  if (!values.length) return []
  const queue = [0]
  const visited: number[] = []
  const steps: AnimationStep<TreeState>[] = [{
    line: 1,
    phase: 'INITIALIZE',
    narration: 'Breadth-first search starts by placing the root in a queue.',
    state: { values, active: null, visited: [], queue: [...queue] },
    variables: { queue: `[${values[0]}]`, visited: '[]' },
    prediction: 'Which nodes will enter the queue after the root is removed?',
  }]

  while (queue.length) {
    const index = queue.shift()!
    visited.push(index)
    steps.push({
      line: 4,
      phase: 'DEQUEUE',
      narration: `Remove ${values[index]} from the front of the queue and visit it.`,
      state: { values, active: index, visited: [...visited], queue: [...queue] },
      variables: { node: values[index], queue: `[${queue.map((item) => values[item]).join(', ')}]` },
    })
    const children = [index * 2 + 1, index * 2 + 2].filter((child) => child < values.length)
    for (const child of children) {
      queue.push(child)
      steps.push({
        line: 7,
        phase: 'ENQUEUE CHILD',
        narration: `Add child ${values[child]} to the back of the queue.`,
        state: { values, active: child, visited: [...visited], queue: [...queue] },
        variables: { child: values[child], queue: `[${queue.map((item) => values[item]).join(', ')}]` },
      })
    }
  }
  steps.push({
    line: 8,
    phase: 'COMPLETE',
    narration: `Level-order traversal: ${visited.map((index) => values[index]).join(' → ')}.`,
    state: { values, active: null, visited, queue: [] },
    variables: { order: `[${visited.map((index) => values[index]).join(', ')}]` },
  })
  return steps
}

export function TreeVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '8, 4, 12, 2, 6, 10, 14')
  const values = useMemo(() => numbers(input, [8, 4, 12, 2, 6, 10, 14]), [input])
  const steps = useMemo(() => treeSteps(values), [values])
  const code = [
    'queue = deque([root])',
    'order = []',
    'while queue:',
    '    node = queue.popleft()',
    '    order.append(node.value)',
    '    for child in node.children:',
    '        queue.append(child)',
    'return order',
  ]

  return <AlgorithmPlayer
    title="Binary tree: level-order traversal"
    subtitle="The queue preserves the frontier from left to right, one level at a time."
    code={code}
    steps={steps}
    complexity={{ time: 'O(n)', space: 'O(w)' }}
    onProgress={onProgress}
    controls={<label>TREE · LEVEL ORDER<input value={input} onChange={(event) => setInput(event.target.value)} /></label>}
    renderScene={({ state }) => <div className="tree-scene">
      <svg viewBox="0 0 640 300" aria-hidden="true">
        {state.values.map((_, index) => index > 0 && <line
          key={index}
          x1={`${treePosition(Math.floor((index - 1) / 2), state.values.length).x}`}
          y1={`${treePosition(Math.floor((index - 1) / 2), state.values.length).y}`}
          x2={`${treePosition(index, state.values.length).x}`}
          y2={`${treePosition(index, state.values.length).y}`}
        />)}
      </svg>
      {state.values.map((value, index) => {
        const position = treePosition(index, state.values.length)
        return <span
          className={`tree-node ${state.active === index ? 'active' : ''} ${state.visited.includes(index) ? 'visited' : ''}`}
          style={{ left: `${position.x / 6.4}%`, top: `${position.y / 3}%` }}
          key={`${value}-${index}`}
        >{value}<small>{index}</small></span>
      })}
      <div className="structure-queue"><b>QUEUE</b>{state.queue.map((index) => <span key={index}>{state.values[index]}</span>)}</div>
    </div>}
  />
}

function treePosition(index: number, _length: number) {
  const level = Math.floor(Math.log2(index + 1))
  const first = 2 ** level - 1
  const offset = index - first
  const slots = 2 ** level
  return { x: ((offset + 0.5) / slots) * 600 + 20, y: 38 + level * 82 }
}

type HeapState = {
  heap: number[]
  active: number | null
  parent: number | null
  settled: number[]
}

function heapSteps(values: number[]): AnimationStep<HeapState>[] {
  const heap: number[] = []
  const steps: AnimationStep<HeapState>[] = [{
    line: 1,
    phase: 'EMPTY HEAP',
    narration: 'A min-heap keeps every parent less than or equal to its children.',
    state: { heap: [], active: null, parent: null, settled: [] },
    variables: { heap: '[]' },
  }]
  for (const value of values) {
    heap.push(value)
    let index = heap.length - 1
    steps.push({
      line: 3,
      phase: 'APPEND',
      narration: `Append ${value} at the next open leaf position.`,
      state: { heap: [...heap], active: index, parent: index ? Math.floor((index - 1) / 2) : null, settled: [] },
      variables: { value, index },
      prediction: heap.length === 2 ? 'Should the new value swap with its parent?' : undefined,
    })
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      steps.push({
        line: 7,
        phase: 'COMPARE PARENT',
        narration: `Compare child ${heap[index]} with parent ${heap[parent]}.`,
        state: { heap: [...heap], active: index, parent, settled: [] },
        variables: { child: heap[index], parent: heap[parent] },
      })
      if (heap[parent] <= heap[index]) break
      ;[heap[parent], heap[index]] = [heap[index], heap[parent]]
      steps.push({
        line: 8,
        phase: 'BUBBLE UP',
        narration: 'The child is smaller, so swap it upward to restore the heap invariant.',
        state: { heap: [...heap], active: parent, parent: parent ? Math.floor((parent - 1) / 2) : null, settled: [] },
        variables: { swapped_to: parent, heap: `[${heap.join(', ')}]` },
      })
      index = parent
    }
    steps.push({
      line: 9,
      phase: 'INSERTED',
      narration: `${value} is now in a valid heap position.`,
      state: { heap: [...heap], active: index, parent: null, settled: [...Array(heap.length).keys()] },
      variables: { root: heap[0], size: heap.length },
    })
  }
  return steps
}

export function HeapVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '7, 3, 10, 1, 5, 2')
  const values = useMemo(() => numbers(input, [7, 3, 10, 1, 5, 2]), [input])
  const steps = useMemo(() => heapSteps(values), [values])
  const code = [
    'heap = []',
    'for value in values:',
    '    heap.append(value)',
    '    index = len(heap) - 1',
    '    while index > 0:',
    '        parent = (index - 1) // 2',
    '        if heap[parent] <= heap[index]: break',
    '        heap[parent], heap[index] = heap[index], heap[parent]',
    '        index = parent',
  ]
  return <AlgorithmPlayer
    title="Min-heap insertion"
    subtitle="The complete-tree shape comes from array indices; bubble-up restores ordering."
    code={code}
    steps={steps}
    complexity={{ time: 'O(n log n)', space: 'O(n)' }}
    onProgress={onProgress}
    controls={<label>INSERT VALUES<input value={input} onChange={(event) => setInput(event.target.value)} /></label>}
    renderScene={({ state }) => <div className="heap-scene">
      <div className="heap-tree">
        <svg viewBox="0 0 640 300" aria-hidden="true">
          {state.heap.map((_, index) => index > 0 && <line
            key={index}
            x1={`${treePosition(Math.floor((index - 1) / 2), state.heap.length).x}`}
            y1={`${treePosition(Math.floor((index - 1) / 2), state.heap.length).y}`}
            x2={`${treePosition(index, state.heap.length).x}`}
            y2={`${treePosition(index, state.heap.length).y}`}
          />)}
        </svg>
        {state.heap.map((value, index) => {
          const position = treePosition(index, state.heap.length)
          return <span className={`tree-node ${state.active === index ? 'active' : ''} ${state.parent === index ? 'parent' : ''}`} style={{ left: `${position.x / 6.4}%`, top: `${position.y / 3}%` }} key={`${value}-${index}`}>{value}</span>
        })}
      </div>
      <div className="heap-array"><b>ARRAY</b>{state.heap.map((value, index) => <span className={state.active === index ? 'active' : ''} key={index}>{value}<small>{index}</small></span>)}</div>
    </div>}
  />
}

type GraphState = {
  nodes: string[]
  edges: [string, string][]
  active: string | null
  visited: string[]
  queue: string[]
}

function parseEdges(input: string) {
  const edges = input.split(',').map((part) => part.trim().split(/[-:>]/).map((item) => item.trim())).filter((edge) => edge.length >= 2 && edge[0] && edge[1]) as [string, string][]
  const nodes = [...new Set(edges.flat())].slice(0, 9)
  return { nodes, edges: edges.filter(([from, to]) => nodes.includes(from) && nodes.includes(to)) }
}

function graphSteps(input: string, start: string): AnimationStep<GraphState>[] {
  const parsed = parseEdges(input)
  const nodes = parsed.nodes.length ? parsed.nodes : ['A', 'B', 'C', 'D']
  const edges = parsed.edges.length ? parsed.edges : [['A', 'B'], ['A', 'C'], ['B', 'D']] as [string, string][]
  const root = nodes.includes(start) ? start : nodes[0]
  const queue = [root]
  const seen = new Set([root])
  const visited: string[] = []
  const steps: AnimationStep<GraphState>[] = [{
    line: 2,
    phase: 'INITIALIZE',
    narration: `Mark ${root} seen when it enters the queue, preventing duplicate work.`,
    state: { nodes, edges, active: root, visited: [], queue: [...queue] },
    variables: { queue: `[${root}]`, seen: `{${root}}` },
    prediction: 'Why mark a node when enqueuing instead of when dequeuing?',
  }]

  while (queue.length) {
    const node = queue.shift()!
    visited.push(node)
    steps.push({
      line: 5,
      phase: 'VISIT',
      narration: `Dequeue and visit ${node}.`,
      state: { nodes, edges, active: node, visited: [...visited], queue: [...queue] },
      variables: { node, queue: `[${queue.join(', ')}]` },
    })
    const neighbors = [...new Set(edges.flatMap(([from, to]) => from === node ? [to] : to === node ? [from] : []))]
    for (const neighbor of neighbors) {
      if (seen.has(neighbor)) continue
      seen.add(neighbor)
      queue.push(neighbor)
      steps.push({
        line: 9,
        phase: 'DISCOVER',
        narration: `Discover ${neighbor} from ${node}, mark it seen, and enqueue it.`,
        state: { nodes, edges, active: neighbor, visited: [...visited], queue: [...queue] },
        variables: { neighbor, queue: `[${queue.join(', ')}]`, seen: `{${[...seen].join(', ')}}` },
      })
    }
  }
  steps.push({
    line: 10,
    phase: 'COMPLETE',
    narration: `BFS order: ${visited.join(' → ')}.`,
    state: { nodes, edges, active: null, visited, queue: [] },
    variables: { order: `[${visited.join(', ')}]` },
  })
  return steps
}

export function GraphVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', 'A-B, A-C, B-D, B-E, C-F, E-G')
  const [start, setStart] = useLessonInput('start', 'A')
  const steps = useMemo(() => graphSteps(input, start.trim().toUpperCase()), [input, start])
  const code = [
    'queue = deque([start])',
    'seen = {start}',
    'order = []',
    'while queue:',
    '    node = queue.popleft()',
    '    order.append(node)',
    '    for neighbor in graph[node]:',
    '        if neighbor not in seen:',
    '            seen.add(neighbor); queue.append(neighbor)',
    'return order',
  ]
  return <AlgorithmPlayer
    title="Graph breadth-first search"
    subtitle="The queue explores all nodes at distance d before distance d + 1."
    code={code}
    steps={steps}
    complexity={{ time: 'O(V + E)', space: 'O(V)' }}
    onProgress={onProgress}
    controls={<><label>UNDIRECTED EDGES<input value={input} onChange={(event) => setInput(event.target.value)} /></label><label>START<input value={start} maxLength={2} onChange={(event) => setStart(event.target.value)} /></label></>}
    renderScene={({ state }) => <GraphScene state={state} />}
  />
}

function GraphScene({ state }: { state: GraphState }) {
  const positions = state.nodes.reduce<Record<string, { x: number; y: number }>>((result, node, index) => {
    const angle = (index / state.nodes.length) * Math.PI * 2 - Math.PI / 2
    result[node] = { x: 320 + Math.cos(angle) * 205, y: 160 + Math.sin(angle) * 115 }
    return result
  }, {})
  return <div className="graph-scene">
    <svg viewBox="0 0 640 320" aria-hidden="true">
      {state.edges.map(([from, to], index) => <line key={index} x1={positions[from].x} y1={positions[from].y} x2={positions[to].x} y2={positions[to].y} />)}
    </svg>
    {state.nodes.map((node) => <span className={`graph-node ${state.active === node ? 'active' : ''} ${state.visited.includes(node) ? 'visited' : ''}`} style={{ left: `${positions[node].x / 6.4}%`, top: `${positions[node].y / 3.2}%` }} key={node}>{node}</span>)}
    <div className="structure-queue"><b>QUEUE</b>{state.queue.map((node) => <span key={node}>{node}</span>)}</div>
  </div>
}

type BacktrackState = {
  size: number
  queens: number[]
  row: number
  column: number | null
  conflicts: [number, number][]
  solutions: number
}

function nQueensSteps(size: number): AnimationStep<BacktrackState>[] {
  const queens: number[] = []
  const steps: AnimationStep<BacktrackState>[] = []
  let solutions = 0
  const safe = (row: number, column: number) => queens.every((placedColumn, placedRow) => placedColumn !== column && Math.abs(placedColumn - column) !== row - placedRow)

  const solve = (row: number) => {
    steps.push({
      line: 2,
      phase: 'ENTER ROW',
      narration: row === size ? 'Every row has a queen: record a solution.' : `Choose a safe column for row ${row}.`,
      state: { size, queens: [...queens], row, column: null, conflicts: [], solutions },
      variables: { row, queens: `[${queens.join(', ')}]`, solutions },
      prediction: row === 0 ? 'How many choices can the first row try?' : undefined,
    })
    if (row === size) {
      solutions += 1
      steps.push({ line: 3, phase: 'SOLUTION', narration: `Solution ${solutions} found. Continue searching for other valid arrangements.`, state: { size, queens: [...queens], row, column: null, conflicts: [], solutions }, variables: { solutions } })
      return
    }
    for (let column = 0; column < size; column += 1) {
      const isSafe = safe(row, column)
      steps.push({
        line: 6,
        phase: 'TRY COLUMN',
        narration: isSafe ? `(${row}, ${column}) is safe.` : `(${row}, ${column}) conflicts with an existing queen.`,
        state: { size, queens: [...queens], row, column, conflicts: isSafe ? [] : [[row, column]], solutions },
        variables: { row, column, safe: isSafe },
      })
      if (!isSafe) continue
      queens.push(column)
      steps.push({ line: 7, phase: 'PLACE', narration: `Place a queen at row ${row}, column ${column}.`, state: { size, queens: [...queens], row, column, conflicts: [], solutions }, variables: { queens: `[${queens.join(', ')}]` } })
      solve(row + 1)
      queens.pop()
      steps.push({ line: 9, phase: 'BACKTRACK', narration: `This branch is fully explored. Remove the queen from row ${row} before trying the next column.`, state: { size, queens: [...queens], row, column, conflicts: [], solutions }, variables: { queens: `[${queens.join(', ')}]` } })
    }
  }
  solve(0)
  return steps
}

export function BacktrackingVisualizer({ onProgress }: { onProgress: () => void }) {
  const [size, setSize] = useLessonNumber('size', 4)
  const steps = useMemo(() => nQueensSteps(size), [size])
  const code = [
    'def solve(row):',
    '    if row == n:',
    '        solutions.append(board.copy())',
    '        return',
    '    for column in range(n):',
    '        if is_safe(row, column):',
    '            queens.append(column)',
    '            solve(row + 1)',
    '            queens.pop()',
  ]
  return <AlgorithmPlayer
    title={`${size}-Queens backtracking`}
    subtitle="Choose, explore, undo. The partial board is the recursive state."
    code={code}
    steps={steps}
    complexity={{ time: 'O(n!)', space: 'O(n)' }}
    onProgress={onProgress}
    controls={<label>BOARD SIZE<select value={size} onChange={(event) => setSize(Number(event.target.value))}><option value={4}>4 × 4</option><option value={5}>5 × 5</option></select></label>}
    renderScene={({ state }) => <div className="queens-scene" style={{ '--board-size': state.size } as CSSProperties}>
      {[...Array(state.size * state.size).keys()].map((cell) => {
        const row = Math.floor(cell / state.size)
        const column = cell % state.size
        const queen = state.queens[row] === column
        const trying = state.row === row && state.column === column
        const conflict = state.conflicts.some(([conflictRow, conflictColumn]) => conflictRow === row && conflictColumn === column)
        return <span className={`${queen ? 'queen' : ''} ${trying ? 'trying' : ''} ${conflict ? 'conflict' : ''}`} key={cell}>{queen ? '♛' : trying ? '?' : ''}</span>
      })}
      <div className="recursion-stack"><b>CALL STACK</b>{[...Array(Math.min(state.row + 1, state.size)).keys()].map((row) => <span key={row}>solve(row={row})</span>)}</div>
    </div>}
  />
}

type SearchState = {
  values: number[]
  low: number
  high: number
  mid: number | null
  discarded: 'left' | 'right' | null
  found: boolean
}

function binarySearchSteps(values: number[], target: number | null): AnimationStep<SearchState>[] {
  const sorted = [...values].sort((a, b) => a - b)
  if (target === null) return [{
    line: 1,
    phase: 'ENTER A TARGET',
    narration: 'Binary search needs a numeric target before it can compare and discard ranges.',
    state: { values: sorted, low: 0, high: sorted.length - 1, mid: null, discarded: null, found: false },
    variables: { target: null },
  }]
  let low = 0
  let high = sorted.length - 1
  const steps: AnimationStep<SearchState>[] = [{ line: 1, phase: 'SEARCH SPACE', narration: 'The answer, if present, lies inside the inclusive [low, high] range.', state: { values: sorted, low, high, mid: null, discarded: null, found: false }, variables: { low, high, target } }]
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2)
    steps.push({ line: 3, phase: 'MIDPOINT', narration: `Check middle index ${mid}, value ${sorted[mid]}.`, state: { values: sorted, low, high, mid, discarded: null, found: sorted[mid] === target }, variables: { low, high, mid, value: sorted[mid], target }, prediction: steps.length === 1 ? 'Which half can be eliminated after one comparison?' : undefined })
    if (sorted[mid] === target) {
      steps.push({ line: 5, phase: 'FOUND', narration: `Found ${target} at index ${mid}.`, state: { values: sorted, low, high, mid, discarded: null, found: true }, variables: { return: mid } })
      return steps
    }
    if (sorted[mid] < target) {
      steps.push({ line: 7, phase: 'DISCARD LEFT', narration: `${sorted[mid]} is too small. Discard indices ${low} through ${mid}.`, state: { values: sorted, low, high, mid, discarded: 'left', found: false }, variables: { new_low: mid + 1 } })
      low = mid + 1
    } else {
      steps.push({ line: 9, phase: 'DISCARD RIGHT', narration: `${sorted[mid]} is too large. Discard indices ${mid} through ${high}.`, state: { values: sorted, low, high, mid, discarded: 'right', found: false }, variables: { new_high: mid - 1 } })
      high = mid - 1
    }
  }
  steps.push({ line: 10, phase: 'NOT FOUND', narration: 'low crossed high, so the search space is empty.', state: { values: sorted, low, high, mid: null, discarded: null, found: false }, variables: { return: -1 } })
  return steps
}

export function BinarySearchVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '3, 6, 8, 12, 14, 17, 25, 31')
  const [target, setTarget] = useLessonInput('target', '17')
  const values = useMemo(() => numbers(input, [3, 6, 8, 12, 14, 17, 25, 31]), [input])
  const targetNumber = target.trim() !== '' && Number.isFinite(Number(target)) ? Number(target) : null
  const steps = useMemo(() => binarySearchSteps(values, targetNumber), [targetNumber, values])
  const code = [
    'low, high = 0, len(values) - 1',
    'while low <= high:',
    '    mid = low + (high - low) // 2',
    '    if values[mid] == target:',
    '        return mid',
    '    if values[mid] < target:',
    '        low = mid + 1',
    '    else:',
    '        high = mid - 1',
    'return -1',
  ]
  return <AlgorithmPlayer title="Binary search" subtitle="Each comparison proves that one half cannot contain the target." code={code} steps={steps} complexity={{ time: 'O(log n)', space: 'O(1)' }} onProgress={onProgress}
    controls={<><label>SORTED VALUES<input value={input} onChange={(event) => setInput(event.target.value)} /></label><label>TARGET<input value={target} onChange={(event) => setTarget(event.target.value)} /></label></>}
    renderScene={({ state }) => <div className="binary-scene">{state.values.map((value, index) => {
      const outside = index < state.low || index > state.high
      const discarded = state.mid !== null && ((state.discarded === 'left' && index <= state.mid) || (state.discarded === 'right' && index >= state.mid))
      return <span className={`${outside || discarded ? 'discarded' : ''} ${state.mid === index ? 'mid' : ''} ${state.found && state.mid === index ? 'found' : ''}`} key={`${value}-${index}`}><strong>{value}</strong><small>{index}</small>{state.low === index && <i>LOW</i>}{state.high === index && <b>HIGH</b>}</span>
    })}</div>}
  />
}

type DpState = {
  rows: number
  columns: number
  table: number[][]
  active: [number, number] | null
}

function gridDpSteps(rows: number, columns: number): AnimationStep<DpState>[] {
  const table = Array.from({ length: rows }, () => Array(columns).fill(0))
  const steps: AnimationStep<DpState>[] = [{
    line: 1,
    phase: 'CREATE TABLE',
    narration: 'dp[row][column] stores the number of paths to that cell.',
    state: { rows, columns, table: table.map((row) => [...row]), active: null },
    variables: { rows, columns },
  }]
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (row === 0 && column === 0) {
        table[row][column] = 1
        steps.push({ line: 2, phase: 'BASE CASE', narration: 'There is one way to stand at the starting cell.', state: { rows, columns, table: table.map((line) => [...line]), active: [row, column] }, variables: { row, column, paths: 1 }, prediction: 'Where can paths into the next cell come from?' })
        continue
      }
      const above = row > 0 ? table[row - 1][column] : 0
      const left = column > 0 ? table[row][column - 1] : 0
      table[row][column] = above + left
      steps.push({
        line: 7,
        phase: 'COMBINE',
        narration: `Paths to (${row}, ${column}) = from above (${above}) + from left (${left}).`,
        state: { rows, columns, table: table.map((line) => [...line]), active: [row, column] },
        variables: { row, column, above, left, paths: above + left },
      })
    }
  }
  steps.push({ line: 8, phase: 'ANSWER', narration: `The destination has ${table[rows - 1][columns - 1]} unique paths.`, state: { rows, columns, table, active: [rows - 1, columns - 1] }, variables: { return: table[rows - 1][columns - 1] } })
  return steps
}

export function DynamicProgrammingVisualizer({ onProgress }: { onProgress: () => void }) {
  const [rows, setRows] = useLessonNumber('rows', 4)
  const [columns, setColumns] = useLessonNumber('columns', 5)
  const steps = useMemo(() => gridDpSteps(rows, columns), [columns, rows])
  const code = [
    'dp = [[0] * columns for _ in range(rows)]',
    'dp[0][0] = 1',
    'for row in range(rows):',
    '    for column in range(columns):',
    '        if row == column == 0: continue',
    '        above = dp[row - 1][column] if row else 0',
    '        dp[row][column] = above + (dp[row][column - 1] if column else 0)',
    'return dp[-1][-1]',
  ]
  return <AlgorithmPlayer title="Grid dynamic programming" subtitle="A table remembers solved subproblems so each cell is computed once." code={code} steps={steps} complexity={{ time: 'O(r × c)', space: 'O(r × c)' }} onProgress={onProgress}
    controls={<><label>ROWS<select value={rows} onChange={(event) => setRows(Number(event.target.value))}>{[3, 4, 5, 6].map((value) => <option key={value}>{value}</option>)}</select></label><label>COLUMNS<select value={columns} onChange={(event) => setColumns(Number(event.target.value))}>{[3, 4, 5, 6].map((value) => <option key={value}>{value}</option>)}</select></label></>}
    renderScene={({ state }) => <div className="dp-scene" style={{ '--dp-columns': state.columns } as CSSProperties}>{state.table.flatMap((row, rowIndex) => row.map((value, columnIndex) => <span className={state.active?.[0] === rowIndex && state.active[1] === columnIndex ? 'active' : ''} key={`${rowIndex}-${columnIndex}`}><small>{rowIndex},{columnIndex}</small><strong>{value || '·'}</strong>{rowIndex === 0 && columnIndex === 0 && <i>START</i>}{rowIndex === state.rows - 1 && columnIndex === state.columns - 1 && <b>END</b>}</span>))}</div>}
  />
}

type GreedyState = {
  intervals: [number, number][]
  active: number | null
  selected: number[]
  lastEnd: number | null
  rejected: number[]
}

function parseIntervals(input: string): [number, number][] {
  const parsed = input.split(',').map((part) => part.trim().match(/(-?\d+)\s*[-:]\s*(-?\d+)/)).filter(Boolean).map((match) => {
    const first = Number(match![1])
    const second = Number(match![2])
    return [Math.min(first, second), Math.max(first, second)] as [number, number]
  })
  return parsed.length ? parsed.slice(0, 10) : [[1, 3], [2, 5], [4, 6], [6, 8], [5, 9], [8, 10]]
}

function greedySteps(intervals: [number, number][]): AnimationStep<GreedyState>[] {
  const sorted = [...intervals].sort((left, right) => left[1] - right[1])
  const selected: number[] = []
  const rejected: number[] = []
  let lastEnd: number | null = null
  const steps: AnimationStep<GreedyState>[] = [{
    line: 1,
    phase: 'SORT',
    narration: 'Sort by finishing time. Finishing early leaves the most room for future intervals.',
    state: { intervals: sorted, active: null, selected: [], lastEnd, rejected: [] },
    variables: { order: sorted.map((interval) => interval.join('-')).join(', ') },
    prediction: 'Why not choose the interval that starts earliest?',
  }]
  sorted.forEach(([start, end], index) => {
    steps.push({ line: 4, phase: 'CONSIDER', narration: `Consider interval [${start}, ${end}].`, state: { intervals: sorted, active: index, selected: [...selected], lastEnd, rejected: [...rejected] }, variables: { start, end, last_end: lastEnd } })
    if (lastEnd === null || start >= lastEnd) {
      selected.push(index)
      lastEnd = end
      steps.push({ line: 6, phase: 'SELECT', narration: 'It does not overlap the last selected interval, so keep it.', state: { intervals: sorted, active: index, selected: [...selected], lastEnd, rejected: [...rejected] }, variables: { selected: selected.length, last_end: lastEnd } })
    } else {
      rejected.push(index)
      steps.push({ line: 8, phase: 'SKIP', narration: `It begins before ${lastEnd}, so selecting it would overlap.`, state: { intervals: sorted, active: index, selected: [...selected], lastEnd, rejected: [...rejected] }, variables: { overlap: true } })
    }
  })
  steps.push({ line: 9, phase: 'COMPLETE', narration: `Selected ${selected.length} non-overlapping intervals.`, state: { intervals: sorted, active: null, selected, lastEnd, rejected }, variables: { return: selected.length } })
  return steps
}

export function GreedyVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '1-3, 2-5, 4-6, 6-8, 5-9, 8-10')
  const intervals = useMemo(() => parseIntervals(input), [input])
  const steps = useMemo(() => greedySteps(intervals), [intervals])
  const code = [
    'intervals.sort(key=lambda item: item[1])',
    'selected = []',
    'last_end = None',
    'for start, end in intervals:',
    '    if last_end is None or start >= last_end:',
    '        selected.append((start, end))',
    '        last_end = end',
    '    else: continue',
    'return selected',
  ]
  const minimum = Math.min(...intervals.map(([start]) => start))
  const maximum = Math.max(...intervals.map(([, end]) => end))
  return <AlgorithmPlayer title="Greedy interval scheduling" subtitle="The greedy choice is justified because the earliest finish preserves maximum remaining space." code={code} steps={steps} complexity={{ time: 'O(n log n)', space: 'O(n)' }} onProgress={onProgress}
    controls={<label>INTERVALS · START-END<input value={input} onChange={(event) => setInput(event.target.value)} /></label>}
    renderScene={({ state }) => <div className="interval-scene">{state.intervals.map(([start, end], index) => <div className={`${state.active === index ? 'active' : ''} ${state.selected.includes(index) ? 'selected' : ''} ${state.rejected.includes(index) ? 'rejected' : ''}`} key={`${start}-${end}-${index}`}><span style={{ left: `${((start - minimum) / Math.max(1, maximum - minimum)) * 80}%`, width: `${((end - start) / Math.max(1, maximum - minimum)) * 80 + 8}%` }}>[{start}, {end}]</span></div>)}</div>}
  />
}

type KmpState = {
  text: string
  pattern: string
  lps: number[]
  textIndex: number
  patternIndex: number
  matched: number[]
}

function kmpSteps(text: string, pattern: string): AnimationStep<KmpState>[] {
  if (!pattern) return [{
    line: 1,
    phase: 'ENTER A PATTERN',
    narration: 'KMP requires a non-empty pattern before it can build an LPS table.',
    state: { text, pattern: '', lps: [], textIndex: -1, patternIndex: -1, matched: [] },
    variables: { pattern_length: 0 },
  }]
  const safePattern = pattern
  const lps = Array(safePattern.length).fill(0)
  const steps: AnimationStep<KmpState>[] = [{
    line: 1,
    phase: 'LPS TABLE',
    narration: 'First compute how much of the pattern can be reused after a mismatch.',
    state: { text, pattern: safePattern, lps: [...lps], textIndex: -1, patternIndex: -1, matched: [] },
    variables: { lps: `[${lps.join(', ')}]` },
  }]
  let length = 0
  for (let index = 1; index < safePattern.length;) {
    steps.push({ line: 4, phase: 'COMPARE PREFIX', narration: `Compare pattern[${index}] (${safePattern[index]}) with pattern[${length}] (${safePattern[length]}).`, state: { text, pattern: safePattern, lps: [...lps], textIndex: -1, patternIndex: index, matched: [] }, variables: { index, length }, prediction: index === 1 ? 'If they match, what prefix length should be stored?' : undefined })
    if (safePattern[index] === safePattern[length]) {
      length += 1
      lps[index] = length
      index += 1
      steps.push({ line: 6, phase: 'EXTEND PREFIX', narration: `Store prefix length ${length}.`, state: { text, pattern: safePattern, lps: [...lps], textIndex: -1, patternIndex: index - 1, matched: [] }, variables: { lps: `[${lps.join(', ')}]` } })
    } else if (length) {
      length = lps[length - 1]
      steps.push({ line: 8, phase: 'FALL BACK', narration: `Reuse the next-shorter known prefix of length ${length}.`, state: { text, pattern: safePattern, lps: [...lps], textIndex: -1, patternIndex: index, matched: [] }, variables: { length } })
    } else {
      index += 1
      steps.push({ line: 10, phase: 'NO PREFIX', narration: 'No proper prefix matches here, so keep zero.', state: { text, pattern: safePattern, lps: [...lps], textIndex: -1, patternIndex: index - 1, matched: [] }, variables: { index } })
    }
  }

  let textIndex = 0
  let patternIndex = 0
  const matched: number[] = []
  while (textIndex < text.length) {
    steps.push({ line: 13, phase: 'SEARCH COMPARE', narration: `Compare text[${textIndex}] with pattern[${patternIndex}].`, state: { text, pattern: safePattern, lps: [...lps], textIndex, patternIndex, matched: [...matched] }, variables: { textIndex, patternIndex } })
    if (text[textIndex] === safePattern[patternIndex]) {
      textIndex += 1
      patternIndex += 1
      steps.push({ line: 15, phase: 'MATCH', narration: 'Characters match; advance both indices.', state: { text, pattern: safePattern, lps: [...lps], textIndex: textIndex - 1, patternIndex: patternIndex - 1, matched: [...matched] }, variables: { textIndex, patternIndex } })
      if (patternIndex === safePattern.length) {
        matched.push(textIndex - patternIndex)
        steps.push({ line: 17, phase: 'PATTERN FOUND', narration: `Found the pattern at index ${textIndex - patternIndex}.`, state: { text, pattern: safePattern, lps: [...lps], textIndex: textIndex - 1, patternIndex: patternIndex - 1, matched: [...matched] }, variables: { match: textIndex - patternIndex } })
        patternIndex = lps[patternIndex - 1]
      }
    } else if (patternIndex) {
      patternIndex = lps[patternIndex - 1]
      steps.push({ line: 20, phase: 'REUSE PREFIX', narration: `Do not move the text index. Reuse prefix length ${patternIndex}.`, state: { text, pattern: safePattern, lps: [...lps], textIndex, patternIndex, matched: [...matched] }, variables: { patternIndex }, prediction: matched.length === 0 ? 'Why can the text index stay in place?' : undefined })
    } else {
      textIndex += 1
      steps.push({ line: 21, phase: 'ADVANCE TEXT', narration: 'No prefix is reusable, so advance the text index.', state: { text, pattern: safePattern, lps: [...lps], textIndex: textIndex - 1, patternIndex, matched: [...matched] }, variables: { textIndex } })
    }
  }
  return steps
}

export function KmpVisualizer({ onProgress }: { onProgress: () => void }) {
  const [text, setText] = useLessonInput('text', 'ABABDABACDABABCABAB')
  const [pattern, setPattern] = useLessonInput('pattern', 'ABABCABAB')
  const steps = useMemo(() => kmpSteps(text, pattern), [pattern, text])
  const code = [
    'lps = [0] * len(pattern)',
    'length, index = 0, 1',
    'while index < len(pattern):',
    '    if pattern[index] == pattern[length]:',
    '        length += 1',
    '        lps[index] = length; index += 1',
    '    elif length:',
    '        length = lps[length - 1]',
    '    else:',
    '        index += 1',
    'text_index = pattern_index = 0',
    'while text_index < len(text):',
    '    if text[text_index] == pattern[pattern_index]:',
    '        text_index += 1',
    '        pattern_index += 1',
    '        if pattern_index == len(pattern):',
    '            matches.append(text_index - pattern_index)',
    '            pattern_index = lps[pattern_index - 1]',
    '    elif pattern_index:',
    '        pattern_index = lps[pattern_index - 1]',
    '    else: text_index += 1',
  ]
  return <AlgorithmPlayer title="KMP string matching" subtitle="The LPS table prevents the text pointer from repeating comparisons already proven." code={code} steps={steps} complexity={{ time: 'O(n + m)', space: 'O(m)' }} onProgress={onProgress}
    controls={<><label>TEXT · MAX 28<input value={text} maxLength={28} onChange={(event) => setText(event.target.value.toUpperCase())} /></label><label>PATTERN · MAX 12<input value={pattern} maxLength={12} onChange={(event) => setPattern(event.target.value.toUpperCase())} /></label></>}
    renderScene={({ state }) => <div className="kmp-scene">
      <div className="string-row"><b>TEXT</b>{state.text.split('').map((char, index) => <span className={`${state.textIndex === index ? 'active' : ''} ${state.matched.some((start) => index >= start && index < start + state.pattern.length) ? 'matched' : ''}`} key={`${char}-${index}`}>{char}<small>{index}</small></span>)}</div>
      <div className="string-row pattern"><b>PATTERN</b>{state.pattern.split('').map((char, index) => <span className={state.patternIndex === index ? 'active' : ''} key={`${char}-${index}`}>{char}<small>{state.lps[index]}</small></span>)}</div>
      <div className="lps-caption">LPS values appear beneath the pattern · matches: {state.matched.length ? state.matched.join(', ') : 'none yet'}</div>
    </div>}
  />
}
