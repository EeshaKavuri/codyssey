import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { storageKeys } from '../../data/storage'
import { GuidedTour, type TourStep } from '../GuidedTour'

type WorkspaceMode = 'array' | 'matrix' | 'linked' | 'doubly' | 'stack' | 'queue' | 'tree' | 'heap' | 'trie' | 'graph'
type NodeTone = 'plain' | 'active' | 'done' | 'warning'
type ConnectionType = 'next' | 'prev' | 'left' | 'right' | 'child' | 'edge'
type WorkspaceNode = { id: number; value: string; x: number; y: number; tone: NodeTone }
type WorkspaceEdge = { from: number; to: number; type: ConnectionType }
type Board = { nodes: WorkspaceNode[]; edges: WorkspaceEdge[]; notes: string; approach?: string; edgeCases?: string }
type Boards = Record<WorkspaceMode, Board>

const samples: Boards = {
  array: {
    nodes: [
      { id: 1, value: '3', x: 95, y: 180, tone: 'plain' },
      { id: 2, value: '8', x: 175, y: 180, tone: 'plain' },
      { id: 3, value: '2', x: 255, y: 180, tone: 'active' },
      { id: 4, value: '9', x: 335, y: 180, tone: 'plain' },
      { id: 5, value: '5', x: 415, y: 180, tone: 'plain' },
    ],
    edges: [],
    notes: 'Example: mark pointer positions and write the invariant for the processed range.',
  },
  matrix: {
    nodes: Array.from({ length: 12 }, (_, index) => ({ id: index + 1, value: String(index + 1), x: 120 + (index % 4) * 82, y: 100 + Math.floor(index / 4) * 82, tone: index === 5 ? 'active' as const : 'plain' as const })),
    edges: [],
    notes: 'Example: mark visited cells and write the row/column movement rule.',
  },
  linked: {
    nodes: [
      { id: 1, value: '7', x: 90, y: 180, tone: 'plain' },
      { id: 2, value: '14', x: 270, y: 180, tone: 'plain' },
      { id: 3, value: '21', x: 450, y: 180, tone: 'active' },
    ],
    edges: [{ from: 1, to: 2, type: 'next' }, { from: 2, to: 3, type: 'next' }],
    notes: 'Example: reverse the list without losing the unprocessed chain.',
  },
  doubly: {
    nodes: [
      { id: 1, value: '5', x: 110, y: 180, tone: 'plain' },
      { id: 2, value: '10', x: 320, y: 180, tone: 'active' },
      { id: 3, value: '15', x: 530, y: 180, tone: 'plain' },
    ],
    edges: [
      { from: 1, to: 2, type: 'next' }, { from: 2, to: 1, type: 'prev' },
      { from: 2, to: 3, type: 'next' }, { from: 3, to: 2, type: 'prev' },
    ],
    notes: 'Example: every next link should agree with the neighboring prev link.',
  },
  stack: {
    nodes: [
      { id: 1, value: '4', x: 300, y: 340, tone: 'plain' },
      { id: 2, value: '8', x: 300, y: 270, tone: 'plain' },
      { id: 3, value: '12', x: 300, y: 200, tone: 'active' },
    ],
    edges: [],
    notes: 'Example: only the top element can be popped; newest unresolved work is processed first.',
  },
  queue: {
    nodes: [
      { id: 1, value: 'A', x: 120, y: 190, tone: 'active' },
      { id: 2, value: 'B', x: 220, y: 190, tone: 'plain' },
      { id: 3, value: 'C', x: 320, y: 190, tone: 'plain' },
      { id: 4, value: 'D', x: 420, y: 190, tone: 'plain' },
    ],
    edges: [],
    notes: 'Example: dequeue from FRONT and enqueue at REAR.',
  },
  tree: {
    nodes: [
      { id: 1, value: '8', x: 350, y: 70, tone: 'plain' },
      { id: 2, value: '4', x: 210, y: 200, tone: 'plain' },
      { id: 3, value: '12', x: 490, y: 200, tone: 'plain' },
    ],
    edges: [{ from: 1, to: 2, type: 'left' }, { from: 1, to: 3, type: 'right' }],
    notes: 'Example: state what a recursive call returns for one subtree.',
  },
  heap: {
    nodes: [
      { id: 1, value: '2', x: 350, y: 80, tone: 'done' },
      { id: 2, value: '5', x: 220, y: 205, tone: 'plain' },
      { id: 3, value: '7', x: 480, y: 205, tone: 'plain' },
      { id: 4, value: '9', x: 150, y: 330, tone: 'plain' },
      { id: 5, value: '11', x: 290, y: 330, tone: 'active' },
    ],
    edges: [],
    notes: 'Example: verify that every parent has higher priority than its children.',
  },
  trie: {
    nodes: [
      { id: 1, value: 'ROOT', x: 340, y: 70, tone: 'plain' },
      { id: 2, value: 'C', x: 220, y: 210, tone: 'plain' },
      { id: 3, value: 'D', x: 460, y: 210, tone: 'plain' },
      { id: 4, value: 'A', x: 160, y: 350, tone: 'active' },
      { id: 5, value: 'O', x: 280, y: 350, tone: 'plain' },
    ],
    edges: [{ from: 1, to: 2, type: 'child' }, { from: 1, to: 3, type: 'child' }, { from: 2, to: 4, type: 'child' }, { from: 2, to: 5, type: 'child' }],
    notes: 'Example: each root-to-node path spells a prefix; mark terminal word nodes with a state color.',
  },
  graph: {
    nodes: [
      { id: 1, value: 'A', x: 170, y: 100, tone: 'active' },
      { id: 2, value: 'B', x: 430, y: 100, tone: 'plain' },
      { id: 3, value: 'C', x: 300, y: 270, tone: 'plain' },
    ],
    edges: [{ from: 1, to: 2, type: 'edge' }, { from: 2, to: 3, type: 'edge' }, { from: 3, to: 1, type: 'edge' }],
    notes: 'Example: color the frontier, visited nodes, and unexplored nodes differently.',
  },
}

const cloneBoard = (board: Board): Board => ({
  nodes: board.nodes.map((node) => ({ ...node })),
  edges: board.edges.map((edge) => ({ ...edge })),
  notes: board.notes,
  approach: board.approach ?? '',
  edgeCases: board.edgeCases ?? '',
})

const initialBoards = (): Boards => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.visualWorkspace) ?? '') as Partial<Boards>
    return {
      array: saved.array?.nodes ? saved.array : cloneBoard(samples.array),
      matrix: saved.matrix?.nodes ? saved.matrix : cloneBoard(samples.matrix),
      linked: saved.linked?.nodes ? saved.linked : cloneBoard(samples.linked),
      doubly: saved.doubly?.nodes ? saved.doubly : cloneBoard(samples.doubly),
      stack: saved.stack?.nodes ? saved.stack : cloneBoard(samples.stack),
      queue: saved.queue?.nodes ? saved.queue : cloneBoard(samples.queue),
      tree: saved.tree?.nodes ? saved.tree : cloneBoard(samples.tree),
      heap: saved.heap?.nodes ? saved.heap : cloneBoard(samples.heap),
      trie: saved.trie?.nodes ? saved.trie : cloneBoard(samples.trie),
      graph: saved.graph?.nodes ? saved.graph : cloneBoard(samples.graph),
    }
  } catch {
    return {
      array: cloneBoard(samples.array),
      matrix: cloneBoard(samples.matrix),
      linked: cloneBoard(samples.linked),
      doubly: cloneBoard(samples.doubly),
      stack: cloneBoard(samples.stack),
      queue: cloneBoard(samples.queue),
      tree: cloneBoard(samples.tree),
      heap: cloneBoard(samples.heap),
      trie: cloneBoard(samples.trie),
      graph: cloneBoard(samples.graph),
    }
  }
}

function reaches(edges: WorkspaceEdge[], start: number, target: number): boolean {
  const stack = [start]
  const seen = new Set<number>()
  while (stack.length) {
    const node = stack.pop()!
    if (node === target) return true
    if (seen.has(node)) continue
    seen.add(node)
    edges.filter((edge) => edge.from === node && edge.type !== 'edge').forEach((edge) => stack.push(edge.to))
  }
  return false
}

function removeDoublyPair(edges: WorkspaceEdge[], edge: WorkspaceEdge) {
  if (edge.type !== 'next' && edge.type !== 'prev') return edges.filter((item) => item !== edge)
  const reciprocal = edge.type === 'next' ? 'prev' : 'next'
  return edges.filter((item) =>
    !(item.from === edge.from && item.to === edge.to && item.type === edge.type) &&
    !(item.from === edge.to && item.to === edge.from && item.type === reciprocal))
}

function rectangleBoundary(from: WorkspaceNode, toward: { x: number; y: number }, halfWidth: number, halfHeight: number) {
  const deltaX = toward.x - from.x
  const deltaY = toward.y - from.y
  if (!deltaX && !deltaY) return { x: from.x, y: from.y }
  const scale = 1 / Math.max(Math.abs(deltaX) / halfWidth, Math.abs(deltaY) / halfHeight)
  return { x: from.x + deltaX * scale, y: from.y + deltaY * scale }
}

function linkedArrowPath(from: WorkspaceNode, toward: { x: number; y: number }, type: 'next' | 'prev', halfWidth: number, targetNode?: WorkspaceNode) {
  const direction = type === 'next' ? 1 : -1
  const start = { x: from.x + direction * halfWidth, y: from.y }
  const end = targetNode ? rectangleBoundary(targetNode, from, halfWidth, 32) : toward
  if ((end.x - start.x) * direction >= 0) {
    const controlX = (start.x + end.x) / 2
    return `M ${start.x} ${start.y} C ${controlX} ${start.y}, ${controlX} ${end.y}, ${end.x} ${end.y}`
  }
  const lift = Math.min(start.y, end.y) - 75
  return `M ${start.x} ${start.y} C ${start.x + direction * 65} ${lift}, ${end.x + direction * 65} ${lift}, ${end.x} ${end.y}`
}

function treeArrowPath(from: WorkspaceNode, toward: { x: number; y: number }, type: 'left' | 'right' | 'child', targetNode?: WorkspaceNode) {
  const start = { x: from.x + (type === 'left' ? -46 : type === 'right' ? 46 : 0), y: from.y + 32 }
  const end = targetNode ? { x: targetNode.x, y: targetNode.y - 32 } : toward
  const controlY = start.y + (end.y - start.y) / 2
  return `M ${start.x} ${start.y} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${end.y}`
}

function heapPosition(index: number) {
  const level = Math.floor(Math.log2(index + 1))
  const first = 2 ** level - 1
  const offset = index - first
  const slots = 2 ** level
  return { x: 70 + ((offset + 0.5) / slots) * 560, y: 75 + level * 120 }
}

export function VisualWorkspace({ suppressWalkthrough = false }: { suppressWalkthrough?: boolean }) {
  const [mode, setMode] = useState<WorkspaceMode>('linked')
  const [boards, setBoards] = useState<Boards>(initialBoards)
  const [selected, setSelected] = useState<number | null>(1)
  const [pending, setPending] = useState<{ from: number; type: ConnectionType } | null>(null)
  const [message, setMessage] = useState('Select a node to edit it, or drag it anywhere on the canvas.')
  const [history, setHistory] = useState<{ mode: WorkspaceMode; board: Board }[]>([])
  const [walkthroughOpen, setWalkthroughOpen] = useState(() => !suppressWalkthrough && localStorage.getItem(storageKeys.workspaceWalkthroughSeen) !== 'true')
  const [walkthroughStep, setWalkthroughStep] = useState(0)
  const [drag, setDrag] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null)
  const [draftConnection, setDraftConnection] = useState<{ from: number; type: Exclude<ConnectionType, 'edge'>; x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRememberedRef = useRef(false)
  const walkthroughSnapshotRef = useRef<Boards | null>(null)
  const board = boards[mode]
  const selectedNode = board.nodes.find((node) => node.id === selected) ?? null

  useEffect(() => {
    if (walkthroughOpen) return
    localStorage.setItem(storageKeys.visualWorkspace, JSON.stringify(boards))
  }, [boards, walkthroughOpen])

  const closeWalkthrough = () => {
    if (walkthroughSnapshotRef.current) {
      setBoards(walkthroughSnapshotRef.current)
      walkthroughSnapshotRef.current = null
    }
    localStorage.setItem(storageKeys.workspaceWalkthroughSeen, 'true')
    setWalkthroughOpen(false)
    setWalkthroughStep(0)
    setPending(null)
    setDraftConnection(null)
    setMessage('Walkthrough complete. Your original workspace has been restored.')
  }

  const walkthroughBoard = (stage: number): Board => {
    const first = { id: 1, value: '7', x: 150, y: 210, tone: 'plain' as const }
    const second = { id: 2, value: '14', x: stage >= 2 ? 420 : 570, y: stage >= 2 ? 210 : 340, tone: stage >= 4 ? 'active' as const : 'plain' as const }
    return {
      nodes: stage === 0 ? [first] : [first, second],
      edges: stage >= 4 ? [{ from: 1, to: 2, type: 'next' }] : [],
      notes: 'Walkthrough demo: connect node 7 to node 14 while preserving reachability.',
      approach: '1. Select the NEXT address on node 7\n2. Move to node 14\n3. Click node 14 to save the pointer',
      edgeCases: 'What should NEXT show when it is null?',
    }
  }

  const showWalkthroughStage = useCallback((stage: number) => {
    setMode('linked')
    setSelected(stage >= 1 ? 2 : 1)
    setBoards((current) => ({ ...current, linked: walkthroughBoard(stage) }))
    if (stage === 3) {
      setSelected(1)
      setPending({ from: 1, type: 'next' })
      setDraftConnection({ from: 1, type: 'next', x: 360, y: 210 })
      setMessage('NEXT is selected. In normal use, this orange arrow follows your mouse.')
    } else {
      setPending(null)
      setDraftConnection(null)
      setMessage(stage >= 4 ? 'Connection saved: node 7 now points to node 14.' : 'This demonstration is using the real workspace canvas.')
    }
  }, [])

  const startWalkthrough = () => {
    if (!walkthroughSnapshotRef.current) {
      walkthroughSnapshotRef.current = {
        array: cloneBoard(boards.array),
        matrix: cloneBoard(boards.matrix),
        linked: cloneBoard(boards.linked),
        doubly: cloneBoard(boards.doubly),
        stack: cloneBoard(boards.stack),
        queue: cloneBoard(boards.queue),
        tree: cloneBoard(boards.tree),
        heap: cloneBoard(boards.heap),
        trie: cloneBoard(boards.trie),
        graph: cloneBoard(boards.graph),
      }
    }
    setWalkthroughStep(0)
    setWalkthroughOpen(true)
    showWalkthroughStage(0)
  }

  useEffect(() => {
    const unseen = localStorage.getItem(storageKeys.workspaceWalkthroughSeen) !== 'true'
    if (!suppressWalkthrough && unseen && !walkthroughSnapshotRef.current) startWalkthrough()
  }, [suppressWalkthrough, walkthroughOpen])

  const remember = () => setHistory((current) => [...current.slice(-39), { mode, board: cloneBoard(board) }])
  const updateBoard = (next: Board) => setBoards((current) => ({ ...current, [mode]: next }))
  const commit = (next: Board) => {
    remember()
    updateBoard(next)
  }

  const switchMode = (next: WorkspaceMode) => {
    setMode(next)
    setSelected(boards[next].nodes[0]?.id ?? null)
    setPending(null)
    setMessage(`Switched to the ${next === 'linked' ? 'linked-list' : next} workspace.`)
  }

  const addNode = () => {
    const id = Math.max(0, ...board.nodes.map((node) => node.id)) + 1
    const index = board.nodes.length
    const positions: Record<WorkspaceMode, { x: number; y: number }> = {
      array: { x: 85 + index * 80, y: 180 },
      matrix: { x: 120 + (index % 4) * 82, y: 100 + Math.floor(index / 4) * 82 },
      linked: { x: 110 + index * 180, y: 180 },
      doubly: { x: 110 + index * 210, y: 180 },
      stack: { x: 300, y: Math.min(...board.nodes.map((item) => item.y), 200) - 70 },
      queue: { x: 120 + index * 100, y: 190 },
      tree: { x: 110 + (index % 4) * 155, y: 90 + Math.floor(index / 4) * 135 },
      heap: heapPosition(index),
      trie: { x: 110 + (index % 4) * 155, y: 90 + Math.floor(index / 4) * 135 },
      graph: { x: 110 + (index % 4) * 145, y: 100 + Math.floor(index / 4) * 125 },
    }
    const node: WorkspaceNode = {
      id,
      value: mode === 'graph' ? String.fromCharCode(65 + (index % 26)) : String(index + 1),
      ...positions[mode],
      tone: 'plain',
    }
    const shiftStack = mode === 'stack' && node.y < 60
    const existingNodes = shiftStack ? board.nodes.map((item) => ({ ...item, y: item.y + 70 })) : board.nodes
    if (shiftStack) node.y = 60
    commit({ ...board, nodes: [...existingNodes, node] })
    setSelected(id)
    setMessage(`Added node ${node.value}. Drag it into position and edit its value.`)
  }

  const deleteSelected = () => {
    if (selected === null) return
    const remainingNodes = board.nodes.filter((node) => node.id !== selected)
    commit({
      ...board,
      nodes: mode === 'heap' ? remainingNodes.map((node, index) => ({ ...node, ...heapPosition(index) })) : remainingNodes,
      edges: board.edges.filter((edge) => edge.from !== selected && edge.to !== selected),
    })
    setSelected(null)
    setPending(null)
    setMessage('Deleted the node and every connection touching it.')
  }

  const completeConnection = (connection: { from: number; type: ConnectionType }, target: number) => {
    if (connection.from === target) {
      setMessage('A node cannot connect to itself in this structure.')
      return
    }
    let edges = [...board.edges]
    if (mode === 'tree' || mode === 'trie') {
      if (edges.some((edge) => edge.to === target && edge.type !== 'edge')) {
        setMessage(`That ${mode} node already has a parent. Remove its current connection first.`)
        return
      }
      const withoutSlot = mode === 'tree'
        ? edges.filter((edge) => !(edge.from === connection.from && edge.type === connection.type))
        : edges
      if (reaches(withoutSlot, target, connection.from)) {
        setMessage(`That connection would create a cycle, so the structure would no longer be a ${mode}.`)
        return
      }
      edges = withoutSlot
    }
    if (mode === 'linked') edges = edges.filter((edge) => !(edge.from === connection.from && edge.type === 'next'))
    if (mode === 'doubly' && (connection.type === 'next' || connection.type === 'prev')) {
      const reciprocal = connection.type === 'next' ? 'prev' : 'next'
      const oldSourceEdge = edges.find((edge) => edge.from === connection.from && edge.type === connection.type)
      if (oldSourceEdge) edges = removeDoublyPair(edges, oldSourceEdge)
      const oldTargetEdge = edges.find((edge) => edge.from === target && edge.type === reciprocal)
      if (oldTargetEdge) edges = removeDoublyPair(edges, oldTargetEdge)
      edges.push({ from: target, to: connection.from, type: reciprocal })
    }
    if (mode === 'trie' && edges.some((edge) => edge.from === connection.from && edge.to === target && edge.type === 'child')) {
      setMessage('That trie child is already connected.')
      setPending(null)
      return
    }
    if (mode === 'graph' && edges.some((edge) => edge.type === 'edge' && ((edge.from === connection.from && edge.to === target) || (edge.from === target && edge.to === connection.from)))) {
      setMessage('Those graph nodes are already connected.')
      setPending(null)
      return
    }
    const updatedEdges = [...edges, { from: connection.from, to: target, type: connection.type }]
    commit({ ...board, edges: updatedEdges })
    setSelected(target)
    setPending(null)
    setDraftConnection(null)
    if (mode === 'linked') {
      const incoming = updatedEdges.filter((edge) => edge.type === 'next' && edge.to === target).length
      setMessage(`Created next connection. The target now has ${incoming} incoming pointer${incoming === 1 ? '' : 's'}; shared tails and intersections are supported.`)
    } else if (mode === 'graph') {
      const connections = updatedEdges.filter((edge) => edge.type === 'edge' && (edge.from === target || edge.to === target)).length
      setMessage(`Created graph edge. This node now has degree ${connections}.`)
    } else {
      setMessage(`Created ${connection.type} connection.`)
    }
  }

  const connectTo = (target: number) => {
    if (!pending) return
    completeConnection(pending, target)
  }

  const beginGraphConnection = () => {
    if (selected === null) {
      setMessage('Select the source graph node first.')
      return
    }
    if (pending?.from === selected && pending.type === 'edge') {
      setPending(null)
      setMessage('Graph connection mode cancelled.')
      return
    }
    setPending({ from: selected, type: 'edge' })
    setMessage('Graph edge selected. Click another graph node to connect it.')
  }

  const selectNode = (id: number) => {
    if (pending) connectTo(id)
    else setSelected(id)
  }

  const updateSelected = (changes: Partial<WorkspaceNode>) => {
    if (!selectedNode) return
    commit({ ...board, nodes: board.nodes.map((node) => node.id === selectedNode.id ? { ...node, ...changes } : node) })
  }

  const removeEdge = (edgeIndex: number) => {
    const edge = board.edges[edgeIndex]
    const edges = mode === 'doubly' && edge ? removeDoublyPair(board.edges, edge) : board.edges.filter((_, index) => index !== edgeIndex)
    commit({ ...board, edges })
    setMessage('Removed the selected connection.')
  }

  const clearPointer = (nodeId: number, type: Exclude<ConnectionType, 'edge'>) => {
    const matchingEdges = board.edges.filter((edge) => edge.from === nodeId && edge.type === type)
    if (matchingEdges.length) {
      const edges = mode === 'doubly'
        ? matchingEdges.reduce((current, edge) => removeDoublyPair(current, edge), board.edges)
        : board.edges.filter((edge) => !(edge.from === nodeId && edge.type === type))
      commit({ ...board, edges })
    }
    setPending(null)
    setDraftConnection(null)
    setSelected(nodeId)
    setMessage(`Set ${type} = null. The address compartment now shows ×.`)
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    setBoards((current) => ({ ...current, [previous.mode]: cloneBoard(previous.board) }))
    setMode(previous.mode)
    setHistory((current) => current.slice(0, -1))
    setPending(null)
    setSelected(previous.board.nodes[0]?.id ?? null)
    setMessage('Undid the last workspace change.')
  }

  const reset = () => {
    commit(cloneBoard(samples[mode]))
    setSelected(samples[mode].nodes[0]?.id ?? null)
    setPending(null)
    setMessage('Restored the example board for this structure.')
  }

  const clearCanvas = () => {
    commit({ ...board, nodes: [], edges: [] })
    setSelected(null)
    setPending(null)
    setDraftConnection(null)
    setMessage('Cleared all nodes and connections. Use Undo to restore them.')
  }

  const pointerDown = (event: PointerEvent<HTMLButtonElement>, node: WorkspaceNode) => {
    if (pending) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRememberedRef.current = false
    setDrag({ id: node.id, offsetX: event.clientX - rect.left - node.x, offsetY: event.clientY - rect.top - node.y })
    setSelected(node.id)
  }

  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    if (!dragRememberedRef.current) {
      remember()
      dragRememberedRef.current = true
    }
    const halfWidth = mode === 'linked' ? 52 : mode === 'doubly' ? 70 : mode === 'tree' ? 69 : mode === 'array' || mode === 'matrix' ? 33 : 31
    const halfHeight = mode === 'linked' || mode === 'doubly' || mode === 'tree' ? 32 : mode === 'array' || mode === 'matrix' ? 33 : 31
    const x = Math.max(halfWidth, Math.min(rect.width - halfWidth, event.clientX - rect.left - drag.offsetX))
    const y = Math.max(halfHeight, Math.min(rect.height - halfHeight, event.clientY - rect.top - drag.offsetY))
    updateBoard({ ...board, nodes: board.nodes.map((node) => node.id === drag.id ? { ...node, x, y } : node) })
  }

  const toggleAddress = (node: WorkspaceNode, type: Exclude<ConnectionType, 'edge'>) => {
    if (pending?.from === node.id && pending.type === type) {
      setPending(null)
      setDraftConnection(null)
      setMessage('Connection mode cancelled. Select an address compartment when you are ready.')
      return
    }
    setSelected(node.id)
    setPending({ from: node.id, type })
    const recordWidth = mode === 'doubly' ? 70 : 52
    const startX = type === 'next' ? node.x + recordWidth : type === 'prev' ? node.x - recordWidth : node.x + (type === 'left' ? -46 : type === 'right' ? 46 : 0)
    const startY = type === 'next' || type === 'prev' ? node.y : node.y + 32
    setDraftConnection({ from: node.id, type, x: startX, y: startY })
    setMessage(`${type.toUpperCase()} is selected. Move the pointer across the canvas, then click the target node. Click this address again to cancel.`)
  }

  const moveDraftArrow = (event: PointerEvent<HTMLDivElement>) => {
    if (!pending || !draftConnection) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setDraftConnection((current) => current ? { ...current, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
  }

  const handleAddressDoubleClick = (nodeId: number, type: Exclude<ConnectionType, 'edge'>) => {
    clearPointer(nodeId, type)
  }

  const renderedEdges = useMemo(() => mode === 'heap'
    ? board.nodes.slice(1).map((node, index) => ({ from: board.nodes[Math.floor(index / 2)].id, to: node.id, type: 'child' as const }))
    : board.edges, [board, mode])
  const edgeGeometry = useMemo(() => renderedEdges.map((edge) => ({
    edge,
    from: board.nodes.find((node) => node.id === edge.from),
    to: board.nodes.find((node) => node.id === edge.to),
  })).filter((item): item is { edge: WorkspaceEdge; from: WorkspaceNode; to: WorkspaceNode } => Boolean(item.from && item.to)), [board.nodes, renderedEdges])
  const canvasWidth = Math.max(680, ...board.nodes.map((node) => node.x + 90))
  const canvasHeight = Math.max(570, ...board.nodes.map((node) => node.y + 90))
  const workspaceTourSteps = useMemo<TourStep[]>(() => [
    { selector: '.workspace-modes', title: 'Choose a data structure', detail: 'Each tab opens a structure-specific canvas with its own saved diagram and reasoning notes.', action: () => showWalkthroughStage(0) },
    { selector: '.workspace-actions', title: 'Create a new node', detail: 'Use Add node to create another node. The walkthrough has added node 14 to the real canvas as an example.', action: () => showWalkthroughStage(1) },
    { selector: '.workspace-canvas.linked .linked-value-cell', title: 'Move the complete node', detail: 'Drag from the VALUE compartment. Watch node 14 move into position; pointer compartments never move nodes.', action: () => showWalkthroughStage(2) },
    { selector: '.workspace-canvas.linked .linked-address-cell', title: 'Arm the NEXT address', detail: 'Click NEXT once. It turns orange and produces a live arrow that follows your mouse until you select or cancel it.', action: () => showWalkthroughStage(3) },
    { selector: '.workspace-canvas.linked', title: 'Click the target node', detail: 'Click node 14 to save the connection. The walkthrough has now completed 7.next = 14 on this canvas.', action: () => showWalkthroughStage(4) },
    { selector: '.workspace-inspector', title: 'Edit the selected item', detail: 'Change its value, apply a state color, remove connections, or delete the node and its attached edges.' },
    { selector: '.workspace-notes', title: 'Capture your reasoning', detail: 'Write the invariant, solution approach, pseudocode, and edge-case tests beside the diagram. These notes autosave.' },
  ], [showWalkthroughStage])

  return (
    <div className="page workspace-page">
      <section className="page-intro compact">
        <span className="section-kicker">VISUAL PROBLEM WORKSPACE</span>
        <h1>Draw the state before writing the code</h1>
        <p>Build the exact structure from a problem, move pointers and nodes, mark algorithm state, and write down the invariant you are trying to preserve. Everything is saved automatically in this browser.</p>
      </section>

      <section className={`workspace-shell ${walkthroughOpen ? 'walkthrough-demonstrating' : ''}`}>
        <header className="workspace-toolbar">
          <div className="workspace-modes">
            {([
              ['array', 'Array'],
              ['matrix', 'Matrix'],
              ['linked', 'Singly LL'],
              ['doubly', 'Doubly LL'],
              ['stack', 'Stack'],
              ['queue', 'Queue'],
              ['tree', 'Binary tree'],
              ['heap', 'Heap'],
              ['trie', 'Trie'],
              ['graph', 'Graph'],
            ] as [WorkspaceMode, string][]).map(([id, label]) => <button className={mode === id ? 'active' : ''} onClick={() => switchMode(id)} key={id}>{label}</button>)}
          </div>
          <div className="workspace-actions">
            <button className="walkthrough-button" onClick={startWalkthrough}>How to use?</button>
            <button onClick={addNode}>＋ Add {mode === 'array' ? 'cell' : 'node'}</button>
            <button onClick={undo} disabled={!history.length}>↶ Undo</button>
            <button onClick={reset}>↻ Example</button>
            <button className="clear-canvas-button" onClick={clearCanvas} disabled={!board.nodes.length}>Clear canvas</button>
          </div>
        </header>

        <div className="workspace-body">
          <aside className="workspace-inspector">
            <span className="section-kicker">SELECTED ITEM</span>
            {selectedNode ? <>
              <label>VALUE<input value={selectedNode.value} maxLength={12} onChange={(event) => updateSelected({ value: event.target.value })} /></label>
              <div className="tone-picker">
                <span>STATE COLOR</span>
                {(['plain', 'active', 'done', 'warning'] as NodeTone[]).map((tone) => <button className={`${tone} ${selectedNode.tone === tone ? 'selected' : ''}`} onClick={() => updateSelected({ tone })} aria-label={`Mark as ${tone}`} key={tone} />)}
              </div>
              {mode === 'graph' && <button className={`inspector-action ${pending?.type === 'edge' ? 'selected' : ''}`} onClick={beginGraphConnection}>Connect edge —</button>}
              <button className="delete-workspace-item" onClick={deleteSelected}>Delete selected</button>
            </> : <p>Select a node on the canvas to edit its value and connections.</p>}

            <div className="connection-list">
              <span>CONNECTIONS</span>
              {board.edges.map((edge, index) => {
                const from = board.nodes.find((node) => node.id === edge.from)?.value
                const to = board.nodes.find((node) => node.id === edge.to)?.value
                return <button onClick={() => removeEdge(index)} title="Remove connection" key={`${edge.from}-${edge.to}-${edge.type}-${index}`}><b>{from}</b><i>{edge.type}</i><b>{to}</b><em>×</em></button>
              })}
              {!board.edges.length && <small>No connections yet.</small>}
            </div>
          </aside>

          <div className="workspace-stage-wrap">
            <div className={`workspace-message ${pending ? 'connecting' : ''}`}>{pending ? 'CONNECT MODE · ' : ''}{message}</div>
            <div className={`workspace-canvas ${mode}`} style={{ width: '100%', minWidth: canvasWidth, height: canvasHeight }} onPointerMove={moveDraftArrow} ref={canvasRef}>
              <svg aria-hidden="true">
                <defs><marker id="workspace-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
                {edgeGeometry.map(({ edge, from, to }, index) => {
                  const midX = (from.x + to.x) / 2
                  const midY = (from.y + to.y) / 2
                  const recordWidth = mode === 'doubly' ? 70 : 52
                  return <g key={`${edge.from}-${edge.to}-${edge.type}-${index}`}>
                    {edge.type === 'next' || edge.type === 'prev'
                      ? <path className="linked-edge" d={linkedArrowPath(from, to, edge.type, recordWidth, to)} markerEnd="url(#workspace-arrow)" />
                      : edge.type === 'left' || edge.type === 'right' || edge.type === 'child'
                        ? <path className="tree-edge" d={treeArrowPath(from, to, edge.type, to)} markerEnd="url(#workspace-arrow)" />
                      : <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd={edge.type === 'edge' ? undefined : 'url(#workspace-arrow)'} />}
                    <text x={midX} y={midY - 8}>{edge.type === 'edge' || mode === 'heap' ? '' : edge.type.toUpperCase()}</text>
                  </g>
                })}
                {draftConnection && (() => {
                  const source = board.nodes.find((node) => node.id === draftConnection.from)
                  return source
                    ? <path className="draft-edge" d={draftConnection.type === 'next'
                      ? linkedArrowPath(source, draftConnection, 'next', mode === 'doubly' ? 70 : 52)
                      : draftConnection.type === 'prev'
                        ? linkedArrowPath(source, draftConnection, 'prev', 70)
                      : treeArrowPath(source, draftConnection, draftConnection.type)} markerEnd="url(#workspace-arrow)" />
                    : null
                })()}
              </svg>
              {board.nodes.map((node, index) => {
                const nextEdge = mode === 'linked' ? board.edges.find((edge) => edge.from === node.id && edge.type === 'next') : null
                const nextValue = nextEdge ? board.nodes.find((item) => item.id === nextEdge.to)?.value : null
                const doublyNextEdge = mode === 'doubly' ? board.edges.find((edge) => edge.from === node.id && edge.type === 'next') : null
                const prevEdge = mode === 'doubly' ? board.edges.find((edge) => edge.from === node.id && edge.type === 'prev') : null
                const doublyNextValue = doublyNextEdge ? board.nodes.find((item) => item.id === doublyNextEdge.to)?.value : null
                const prevValue = prevEdge ? board.nodes.find((item) => item.id === prevEdge.to)?.value : null
                const leftEdge = mode === 'tree' ? board.edges.find((edge) => edge.from === node.id && edge.type === 'left') : null
                const rightEdge = mode === 'tree' ? board.edges.find((edge) => edge.from === node.id && edge.type === 'right') : null
                const leftValue = leftEdge ? board.nodes.find((item) => item.id === leftEdge.to)?.value : null
                const rightValue = rightEdge ? board.nodes.find((item) => item.id === rightEdge.to)?.value : null
                const childEdges = mode === 'trie' ? board.edges.filter((edge) => edge.from === node.id && edge.type === 'child') : []
                const incomingPointers = mode === 'linked' ? board.edges.filter((edge) => edge.type === 'next' && edge.to === node.id).length : 0
                const graphDegree = mode === 'graph' ? board.edges.filter((edge) => edge.type === 'edge' && (edge.from === node.id || edge.to === node.id)).length : 0
                return <div
                  className={`workspace-node ${node.tone} ${selected === node.id ? 'selected' : ''}`}
                  style={{ left: node.x, top: node.y }}
                  data-workspace-node={node.id}
                  onClick={() => selectNode(node.id)}
                  key={node.id}
                >
                  {mode === 'linked' && incomingPointers > 0 && <span className="workspace-node-badge">{incomingPointers} IN</span>}
                  {mode === 'graph' && graphDegree > 0 && <span className="workspace-node-badge">DEG {graphDegree}</span>}
                  {mode === 'linked' ? <>
                    <button className="linked-value-cell" onPointerDown={(event) => pointerDown(event, node)} onPointerMove={pointerMove} onPointerUp={() => setDrag(null)}>
                      <strong>{node.value || '∅'}</strong><small>VALUE</small>
                    </button>
                    <button
                      className={`linked-address-cell ${nextEdge ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'next' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'next') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'next')}
                      title="Drag to another node. Double-click to set next = null."
                    >
                      <strong>{nextEdge ? `→ ${nextValue ?? `#${nextEdge.to}`}` : '×'}</strong><small>NEXT</small>
                    </button>
                  </> : mode === 'doubly' ? <>
                    <button
                      className={`doubly-address-cell prev ${prevEdge ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'prev' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'prev') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'prev')}
                    >
                      <strong>{prevEdge ? `← ${prevValue ?? `#${prevEdge.to}`}` : '×'}</strong><small>PREV</small>
                    </button>
                    <button className="doubly-value-cell" onPointerDown={(event) => pointerDown(event, node)} onPointerMove={pointerMove} onPointerUp={() => setDrag(null)}>
                      <strong>{node.value || '∅'}</strong><small>VALUE</small>
                    </button>
                    <button
                      className={`doubly-address-cell next ${doublyNextEdge ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'next' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'next') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'next')}
                    >
                      <strong>{doublyNextEdge ? `→ ${doublyNextValue ?? `#${doublyNextEdge.to}`}` : '×'}</strong><small>NEXT</small>
                    </button>
                  </> : mode === 'tree' ? <>
                    <button
                      className={`tree-address-cell left ${leftEdge ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'left' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'left') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'left')}
                      title="Drag to a left child. Double-click to set left = null."
                    >
                      <strong>{leftEdge ? `↙ ${leftValue ?? `#${leftEdge.to}`}` : '×'}</strong><small>LEFT</small>
                    </button>
                    <button className="tree-value-cell" onPointerDown={(event) => pointerDown(event, node)} onPointerMove={pointerMove} onPointerUp={() => setDrag(null)}>
                      <strong>{node.value || '∅'}</strong><small>VALUE</small>
                    </button>
                    <button
                      className={`tree-address-cell right ${rightEdge ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'right' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'right') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'right')}
                      title="Drag to a right child. Double-click to set right = null."
                    >
                      <strong>{rightEdge ? `↘ ${rightValue ?? `#${rightEdge.to}`}` : '×'}</strong><small>RIGHT</small>
                    </button>
                  </> : mode === 'trie' ? <>
                    <button className="trie-value-cell" onPointerDown={(event) => pointerDown(event, node)} onPointerMove={pointerMove} onPointerUp={() => setDrag(null)}>
                      <strong>{node.value || '∅'}</strong><small>CHAR</small>
                    </button>
                    <button
                      className={`trie-child-cell ${childEdges.length ? 'connected' : 'null'} ${pending?.from === node.id && pending.type === 'child' ? 'selected' : ''}`}
                      onClick={(event) => { event.stopPropagation(); toggleAddress(node, 'child') }}
                      onDoubleClick={() => handleAddressDoubleClick(node.id, 'child')}
                    >
                      <strong>{childEdges.length ? `＋${childEdges.length}` : '×'}</strong><small>CHILDREN</small>
                    </button>
                  </> : <button className="workspace-node-dragger" onPointerDown={(event) => pointerDown(event, node)} onPointerMove={pointerMove} onPointerUp={() => setDrag(null)}>
                    <strong>{node.value || '∅'}</strong>
                    <small>{
                      mode === 'array' ? `[${index}]`
                        : mode === 'matrix' ? `[${Math.floor(index / 4)},${index % 4}]`
                          : mode === 'stack' ? (index === board.nodes.length - 1 ? 'TOP' : `#${index}`)
                            : mode === 'queue' ? (index === 0 ? 'FRONT' : index === board.nodes.length - 1 ? 'REAR' : `#${index}`)
                              : mode === 'heap' ? `[${index}]`
                                : `#${node.id}`
                    }</small>
                  </button>}
                </div>
              })}
              {!board.nodes.length && <div className="empty-workspace"><strong>Your canvas is empty.</strong><span>Add a node to begin modelling the problem.</span></div>}
            </div>
          </div>

          <aside className="workspace-notes">
            <span className="section-kicker">REASONING PAD</span>
            <label>PROBLEM / INVARIANT<textarea value={board.notes} onChange={(event) => updateBoard({ ...board, notes: event.target.value })} placeholder="What does each pointer or state mean? What must stay true after every step?" /></label>
            <label>SOLUTION APPROACH / PSEUDOCODE<textarea value={board.approach ?? ''} onChange={(event) => updateBoard({ ...board, approach: event.target.value })} placeholder={'1. Initialize the required state\n2. Process one node or element\n3. Preserve the invariant\n4. Return the result'} /></label>
            <label>EDGE CASES / TESTS<textarea className="compact" value={board.edgeCases ?? ''} onChange={(event) => updateBoard({ ...board, edgeCases: event.target.value })} placeholder="Empty input, one element, duplicates, cycles, null pointers..." /></label>
          </aside>
        </div>
      </section>
      <GuidedTour open={walkthroughOpen} steps={workspaceTourSteps} index={walkthroughStep} setIndex={setWalkthroughStep} close={closeWalkthrough} label="WORKSPACE GUIDE" />
    </div>
  )
}
