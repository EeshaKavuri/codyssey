import { useMemo, type CSSProperties } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLessonInput } from '../../data/learningProgress'
import { AlgorithmPlayer, type AnimationStep } from './AlgorithmPlayer'
import { useStudioMotion } from '../studio/StudioMotion'

const parseNumbers = (input: string, fallback: number[]) => {
  const values = input.split(',').map((value) => Number(value.trim())).filter(Number.isFinite)
  return values.length ? values.slice(0, 12) : fallback
}

type LinkedState = { values: number[]; current: number | null; previous: number | null; head: number | null; found: boolean }

function linkedListSteps(values: number[], target: number, operation: string): AnimationStep<LinkedState>[] {
  const base = { values, current: null, previous: null, head: values[0] ?? null, found: false }
  if (operation === 'insert') {
    return [
      { line: 1, phase: 'START', narration: `The current head is ${values[0] ?? 'None'}.`, state: base, variables: { head: values[0] ?? null, value: target }, prediction: 'Which pointer must the new node store?' },
      { line: 2, phase: 'ALLOCATE', narration: `Create a new node containing ${target}.`, state: base, variables: { new_node: target, head: values[0] ?? null } },
      { line: 3, phase: 'LINK', narration: `new_node.next points to the old head (${values[0] ?? 'None'}).`, state: { ...base, previous: 0 }, variables: { 'new_node.next': values[0] ?? null } },
      { line: 4, phase: 'MOVE HEAD', narration: `Move head to the new node. The insertion is complete without traversal.`, state: { values: [target, ...values], current: 0, previous: null, head: target, found: true }, variables: { head: target }, },
    ]
  }
  if (operation === 'remove') {
    return [
      { line: 1, phase: 'START', narration: `Head currently references ${values[0] ?? 'None'}.`, state: base, variables: { head: values[0] ?? null } },
      { line: 2, phase: 'EMPTY CHECK', narration: values.length ? 'The list is not empty, so removal can continue.' : 'The list is empty. Return immediately.', state: base, variables: { 'head is None': !values.length } },
      { line: 4, phase: 'SAVE NEXT', narration: `Read head.next before changing head.`, state: { ...base, current: 0 }, variables: { 'head.next': values[1] ?? null } },
      { line: 5, phase: 'MOVE HEAD', narration: 'The second node becomes the new head. The old node is no longer reachable.', state: { values: values.slice(1), current: null, previous: null, head: values[1] ?? null, found: true }, variables: { head: values[1] ?? null } },
    ]
  }
  const steps: AnimationStep<LinkedState>[] = [
    { line: 1, phase: 'INITIALIZE', narration: 'Begin traversal at the head node.', state: { ...base, current: values.length ? 0 : null }, variables: { current: values[0] ?? null, target } },
  ]
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    steps.push({
      line: 4,
      phase: 'COMPARE',
      narration: `Compare current.value (${value}) with target (${target}).`,
      state: { ...base, current: index, previous: index > 0 ? index - 1 : null, found: value === target },
      variables: { current: value, target, equal: value === target },
      prediction: index === 0 ? 'If these values differ, where will current move?' : undefined,
    })
    if (value === target) {
      steps.push({ line: 4, phase: 'FOUND', narration: `The values match. Return index ${index}.`, state: { ...base, current: index, previous: index > 0 ? index - 1 : null, found: true }, variables: { return: index } })
      return steps
    }
    steps.push({ line: 5, phase: 'ADVANCE', narration: 'Follow the next pointer to the following node.', state: { ...base, current: index + 1 < values.length ? index + 1 : null, previous: index, found: false }, variables: { current: values[index + 1] ?? null } })
  }
  steps.push({ line: 6, phase: 'NOT FOUND', narration: 'current reached None, so the target is not present.', state: { ...base, current: null, previous: values.length - 1, found: false }, variables: { return: -1 } })
  return steps
}

export function LinkedListVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '7, 14, 21, 28')
  const [target, setTarget] = useLessonInput('target', '21')
  const [operation, setOperation] = useLessonInput('operation', 'search')
  const values = useMemo(() => parseNumbers(input, [7, 14, 21, 28]), [input])
  const number = Number(target) || 0
  const steps = useMemo(() => linkedListSteps(values, number, operation), [number, operation, values])
  const code = operation === 'insert'
    ? ['def insert_head(head, value):', '    new_node = Node(value)', '    new_node.next = head', '    return new_node']
    : operation === 'remove'
      ? ['def remove_head(head):', '    if head is None:', '        return None', '    next_node = head.next', '    return next_node']
      : ['def search(head, target):', '    current = head', '    while current:', '        if current.value == target: return True', '        current = current.next', '    return False']

  return <AlgorithmPlayer
    title="Linked-list pointer trace"
    subtitle="Watch references move through non-contiguous nodes."
    code={code}
    steps={steps}
    complexity={{ time: operation === 'search' ? 'O(n)' : 'O(1)', space: 'O(1)' }}
    onProgress={onProgress}
    controls={<>
      <label>OPERATION<select value={operation} onChange={(event) => setOperation(event.target.value)}><option value="search">Search</option><option value="insert">Insert head</option><option value="remove">Remove head</option></select></label>
      <label>LIST<input value={input} onChange={(event) => setInput(event.target.value)} /></label>
      {operation !== 'remove' && <label>{operation === 'search' ? 'TARGET' : 'VALUE'}<input value={target} onChange={(event) => setTarget(event.target.value)} /></label>}
    </>}
    renderScene={({ state }) => <div className="linked-scene">
      {state.values.map((value, index) => <div className="visual-node-wrap" key={`${value}-${index}`}>
        {index === 0 && <span className="scene-label head">HEAD</span>}
        {state.current === index && <span className="scene-label current">CURRENT</span>}
        {state.previous === index && <span className="scene-label previous">PREV</span>}
        <div className={`visual-node ${state.current === index ? 'active' : ''} ${state.found && state.current === index ? 'success' : ''}`}><strong>{value}</strong><i>next</i></div>
        <span className="visual-arrow">{index === state.values.length - 1 ? '→ ∅' : '→'}</span>
      </div>)}
    </div>}
  />
}

type ArrayState = { values: number[]; left: number | null; right: number | null; write: number | null; read: number | null; found: boolean }

function arraySteps(values: number[], target: number, operation: string): AnimationStep<ArrayState>[] {
  if (operation === 'zeros') {
    const working = [...values]
    const steps: AnimationStep<ArrayState>[] = [{ line: 1, phase: 'INITIALIZE', narration: 'write marks the next position for a non-zero value.', state: { values: [...working], left: null, right: null, write: 0, read: null, found: false }, variables: { write: 0 } }]
    let write = 0
    values.forEach((value, read) => {
      steps.push({ line: 3, phase: 'READ', narration: `Inspect values[${read}] = ${value}.`, state: { values: [...working], left: null, right: null, write, read, found: false }, variables: { read, write, value }, prediction: read === 0 ? 'Will write advance for a zero?' : undefined })
      if (value !== 0) {
        ;[working[write], working[read]] = [working[read], working[write]]
        steps.push({ line: 5, phase: 'SWAP', narration: `Move ${value} to index ${write}.`, state: { values: [...working], left: null, right: null, write, read, found: false }, variables: { read, write } })
        write += 1
      }
    })
    steps.push({ line: 7, phase: 'COMPLETE', narration: 'All non-zero values preserve their relative order; zeros are at the end.', state: { values: [...working], left: null, right: null, write, read: null, found: true }, variables: { write } })
    return steps
  }
  const sorted = [...values].sort((a, b) => a - b)
  let left = 0
  let right = sorted.length - 1
  const steps: AnimationStep<ArrayState>[] = [{ line: 1, phase: 'SORT', narration: 'Sort the array so pointer movement has meaning.', state: { values: sorted, left, right, write: null, read: null, found: false }, variables: { left, right, target } }]
  while (left < right) {
    const sum = sorted[left] + sorted[right]
    steps.push({ line: 4, phase: 'COMPARE', narration: `${sorted[left]} + ${sorted[right]} = ${sum}.`, state: { values: sorted, left, right, write: null, read: null, found: sum === target }, variables: { left, right, sum, target }, prediction: steps.length === 1 ? 'If the sum is too small, which pointer should move?' : undefined })
    if (sum === target) {
      steps.push({ line: 5, phase: 'FOUND', narration: `Pair found: ${sorted[left]} and ${sorted[right]}.`, state: { values: sorted, left, right, write: null, read: null, found: true }, variables: { return: `[${sorted[left]}, ${sorted[right]}]` } })
      return steps
    }
    if (sum < target) {
      left += 1
      steps.push({ line: 7, phase: 'MOVE LEFT', narration: 'The sum is too small. Move left rightward to increase it.', state: { values: sorted, left, right, write: null, read: null, found: false }, variables: { left, right } })
    } else {
      right -= 1
      steps.push({ line: 9, phase: 'MOVE RIGHT', narration: 'The sum is too large. Move right leftward to decrease it.', state: { values: sorted, left, right, write: null, read: null, found: false }, variables: { left, right } })
    }
  }
  steps.push({ line: 10, phase: 'NOT FOUND', narration: 'The pointers met without finding a pair.', state: { values: sorted, left, right, write: null, read: null, found: false }, variables: { return: 'None' } })
  return steps
}

export function ArrayVisualizer({ onProgress }: { onProgress: () => void }) {
  const [input, setInput] = useLessonInput('input', '0, 7, 0, 3, 9, 2')
  const [target, setTarget] = useLessonInput('target', '10')
  const [operation, setOperation] = useLessonInput('operation', 'pair')
  const values = useMemo(() => parseNumbers(input, [0, 7, 0, 3, 9, 2]), [input])
  const steps = useMemo(() => arraySteps(values, Number(target) || 0, operation), [operation, target, values])
  const code = operation === 'pair'
    ? ['values.sort()', 'left, right = 0, len(values) - 1', 'while left < right:', '    total = values[left] + values[right]', '    if total == target: return left, right', '    if total < target:', '        left += 1', '    else:', '        right -= 1', 'return None']
    : ['write = 0', 'for read in range(len(values)):', '    if values[read] != 0:', '        values[write], values[read] = (', '            values[read], values[write]', '        )', '        write += 1']
  return <AlgorithmPlayer title={operation === 'pair' ? 'Two pointers: pair sum' : 'Two pointers: move zeros'} subtitle="Pointer positions encode what has already been processed." code={code} steps={steps} complexity={{ time: operation === 'pair' ? 'O(n log n)' : 'O(n)', space: 'O(1)' }} onProgress={onProgress}
    controls={<><label>PATTERN<select value={operation} onChange={(event) => setOperation(event.target.value)}><option value="pair">Pair sum</option><option value="zeros">Move zeros</option></select></label><label>ARRAY<input value={input} onChange={(event) => setInput(event.target.value)} /></label>{operation === 'pair' && <label>TARGET<input value={target} onChange={(event) => setTarget(event.target.value)} /></label>}</>}
    renderScene={({ state }) => <div className="array-scene">{state.values.map((value, index) => <div className={`array-bar ${state.left === index || state.right === index || state.read === index || state.write === index ? 'active' : ''} ${state.found && (state.left === index || state.right === index) ? 'success' : ''}`} style={{ height: `${52 + Math.abs(value) * 5}px` }} key={index}><strong>{value}</strong><small>{index}</small>{state.left === index && <span>L</span>}{state.right === index && <span>R</span>}{state.read === index && <span>READ</span>}{state.write === index && <i>WRITE</i>}</div>)}</div>}
  />
}

type StackState = { input: string[]; index: number | null; stack: string[]; output: (number | null)[]; activeStack: number | null; valid: boolean }

function stackSteps(input: string, operation: string): AnimationStep<StackState>[] {
  if (operation === 'brackets') {
    const chars = input.replace(/[^()[\]{}]/g, '').split('')
    const stack: string[] = []
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
    const steps: AnimationStep<StackState>[] = [{ line: 1, phase: 'INITIALIZE', narration: 'The stack stores opening brackets that still need a match.', state: { input: chars, index: null, stack: [], output: [], activeStack: null, valid: true }, variables: { stack: '[]' } }]
    for (let index = 0; index < chars.length; index += 1) {
      const char = chars[index]
      steps.push({ line: 3, phase: 'READ', narration: `Read ${char} at index ${index}.`, state: { input: chars, index, stack: [...stack], output: [], activeStack: null, valid: true }, variables: { index, char, stack: `[${stack.join(', ')}]` } })
      if ('([{'.includes(char)) {
        stack.push(char)
        steps.push({ line: 4, phase: 'PUSH', narration: `${char} opens a group, so push it.`, state: { input: chars, index, stack: [...stack], output: [], activeStack: stack.length - 1, valid: true }, variables: { stack: `[${stack.join(', ')}]` }, prediction: index === 0 ? 'What must happen when the matching closing bracket appears?' : undefined })
      } else if (stack.at(-1) === pairs[char]) {
        stack.pop()
        steps.push({ line: 8, phase: 'POP', narration: `${char} matches the top opening bracket, so pop it.`, state: { input: chars, index, stack: [...stack], output: [], activeStack: stack.length - 1, valid: true }, variables: { stack: `[${stack.join(', ')}]` } })
      } else {
        steps.push({ line: 7, phase: 'MISMATCH', narration: `${char} cannot match the current stack top.`, state: { input: chars, index, stack: [...stack], output: [], activeStack: stack.length - 1, valid: false }, variables: { return: false } })
        return steps
      }
    }
    steps.push({ line: 9, phase: stack.length ? 'UNMATCHED' : 'VALID', narration: stack.length ? 'Opening brackets remain unmatched.' : 'The stack is empty, so every bracket matched.', state: { input: chars, index: null, stack, output: [], activeStack: null, valid: !stack.length }, variables: { return: !stack.length } })
    return steps
  }
  const values = parseNumbers(input, [2, 1, 2, 4, 3])
  const stack: number[] = []
  const output: (number | null)[] = Array(values.length).fill(null)
  const steps: AnimationStep<StackState>[] = [{ line: 1, phase: 'INITIALIZE', narration: 'The stack stores indices whose next greater value is still unknown.', state: { input: values.map(String), index: null, stack: [], output: [...output], activeStack: null, valid: true }, variables: { stack: '[]' } }]
  values.forEach((value, index) => {
    steps.push({ line: 3, phase: 'READ', narration: `Process ${value} at index ${index}.`, state: { input: values.map(String), index, stack: stack.map(String), output: [...output], activeStack: null, valid: true }, variables: { index, value } })
    while (stack.length && values[stack.at(-1)!] < value) {
      const resolved = stack.pop()!
      output[resolved] = value
      steps.push({ line: 5, phase: 'RESOLVE', narration: `${value} is the first greater value to the right of ${values[resolved]}.`, state: { input: values.map(String), index, stack: stack.map(String), output: [...output], activeStack: stack.length - 1, valid: true }, variables: { resolved_index: resolved, next_greater: value }, prediction: output.filter(Boolean).length === 1 ? 'Can a smaller value below the top be resolved first?' : undefined })
    }
    stack.push(index)
    steps.push({ line: 7, phase: 'PUSH INDEX', narration: `Push index ${index}; its answer is not known yet.`, state: { input: values.map(String), index, stack: stack.map(String), output: [...output], activeStack: stack.length - 1, valid: true }, variables: { stack: `[${stack.join(', ')}]` } })
  })
  steps.push({ line: 8, phase: 'COMPLETE', narration: 'Unresolved positions have no greater value to their right.', state: { input: values.map(String), index: null, stack: stack.map(String), output, activeStack: null, valid: true }, variables: { output: `[${output.map((value) => value ?? -1).join(', ')}]` } })
  return steps
}

export function StackVisualizer({ onProgress }: { onProgress: () => void }) {
  const { motionEnabled } = useStudioMotion()
  const [operation, setOperation] = useLessonInput('operation', 'brackets')
  const [input, setInput] = useLessonInput('input', '({[]})')
  const steps = useMemo(() => stackSteps(input, operation), [input, operation])
  const stackHeight = useMemo(() => Math.max(245, steps.reduce((depth, frame) => Math.max(depth, frame.state.stack.length), 0) * 45 + 68), [steps])
  const code = operation === 'brackets'
    ? ['stack = []', 'for char in text:', '    if char in "([{":', '        stack.append(char)', '    else:', '        if not stack or stack[-1] != pairs[char]:', '            return False', '        stack.pop()', 'return not stack']
    : ['stack = []', 'answer = [-1] * len(values)', 'for i, value in enumerate(values):', '    while stack and values[stack[-1]] < value:', '        previous = stack.pop()', '        answer[previous] = value', '    stack.append(i)', 'return answer']
  return <AlgorithmPlayer title={operation === 'brackets' ? 'Stack: balanced brackets' : 'Monotonic stack: next greater'} subtitle="The top of the stack represents the next unresolved decision." code={code} steps={steps} complexity={{ time: 'O(n)', space: 'O(n)' }} onProgress={onProgress}
    controls={<><label>PATTERN<select value={operation} onChange={(event) => { setOperation(event.target.value); setInput(event.target.value === 'brackets' ? '({[]})' : '2, 1, 2, 4, 3') }}><option value="brackets">Balanced brackets</option><option value="greater">Next greater</option></select></label><label>INPUT<input value={input} onChange={(event) => setInput(event.target.value)} /></label></>}
    renderScene={({ state }) => <div className="stack-scene">
      <div className="stream-row">{state.input.map((value, index) => <span className={state.index === index ? 'active' : ''} key={index}>{value}<small>{state.output[index] !== undefined && state.output.length ? state.output[index] ?? '−' : index}</small></span>)}</div>
      <div className="stack-container" style={{ height: stackHeight }}>
        <span>TOP</span>
        <AnimatePresence initial={false} mode="popLayout">
          {state.stack.map((value, depth) => ({ value, depth })).reverse().map(({ value, depth }) =>
            <m.b className={depth === state.stack.length - 1 ? 'active' : ''} key={`${depth}:${value}`} layout="position"
              initial={motionEnabled ? { opacity: 0, y: -24, scale: .94 } : false} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: motionEnabled ? -24 : 0, scale: motionEnabled ? .94 : 1 }} transition={{ duration: motionEnabled ? .28 : 0, ease: [.22, 1, .36, 1] }}>
              {value}
            </m.b>)}
        </AnimatePresence>
        {!state.stack.length && <em className="stack-empty">empty</em>}
        <i>STACK</i>
      </div>
    </div>}
  />
}

type WindowState = { chars: string[]; left: number; right: number; best: number; counts: Record<string, number>; prefix: number[]; matches: number }

function windowSteps(input: string, target: number, operation: string): AnimationStep<WindowState>[] {
  if (operation === 'prefix') {
    const values = parseNumbers(input, [1, 2, 3, -2, 2])
    const counts: Record<string, number> = { '0': 1 }
    const prefix: number[] = []
    let total = 0
    let matches = 0
    const steps: AnimationStep<WindowState>[] = [{ line: 1, phase: 'INITIALIZE', narration: 'A previous prefix of current − target identifies a subarray with the target sum.', state: { chars: values.map(String), left: 0, right: -1, best: 0, counts: { ...counts }, prefix: [], matches }, variables: { prefix: 0, matches: 0 } }]
    values.forEach((value, right) => {
      total += value
      prefix.push(total)
      steps.push({ line: 4, phase: 'ADD', narration: `Prefix sum through index ${right} becomes ${total}.`, state: { chars: values.map(String), left: 0, right, best: 0, counts: { ...counts }, prefix: [...prefix], matches }, variables: { value, prefix: total, needed: total - target } })
      matches += counts[String(total - target)] ?? 0
      steps.push({ line: 5, phase: 'LOOKUP', narration: `Look for previous prefix ${total - target}. Found ${counts[String(total - target)] ?? 0}.`, state: { chars: values.map(String), left: 0, right, best: 0, counts: { ...counts }, prefix: [...prefix], matches }, variables: { needed: total - target, matches }, prediction: right === 0 ? 'Why is prefix 0 stored before processing the array?' : undefined })
      counts[String(total)] = (counts[String(total)] ?? 0) + 1
      steps.push({ line: 6, phase: 'STORE', narration: `Record prefix ${total} for future subarrays.`, state: { chars: values.map(String), left: 0, right, best: 0, counts: { ...counts }, prefix: [...prefix], matches }, variables: { counts: JSON.stringify(counts), matches } })
    })
    steps.push({ line: 7, phase: 'COMPLETE', narration: `There are ${matches} subarrays whose sum equals ${target}.`, state: { chars: values.map(String), left: 0, right: values.length - 1, best: 0, counts, prefix, matches }, variables: { return: matches } })
    return steps
  }
  const chars = input.replace(/\s/g, '').split('')
  const counts: Record<string, number> = {}
  let left = 0
  let best = 0
  const steps: AnimationStep<WindowState>[] = [{ line: 1, phase: 'INITIALIZE', narration: 'The window contains unique characters only.', state: { chars, left, right: -1, best, counts: {}, prefix: [], matches: 0 }, variables: { left, best } }]
  chars.forEach((char, right) => {
    counts[char] = (counts[char] ?? 0) + 1
    steps.push({ line: 4, phase: 'EXPAND', narration: `Include ${char} by moving the right boundary.`, state: { chars, left, right, best, counts: { ...counts }, prefix: [], matches: 0 }, variables: { left, right, char, count: counts[char] } })
    while (counts[char] > 1) {
      const removed = chars[left]
      counts[removed] -= 1
      left += 1
      steps.push({ line: 6, phase: 'SHRINK', narration: `${char} is duplicated. Remove ${removed} from the left.`, state: { chars, left, right, best, counts: { ...counts }, prefix: [], matches: 0 }, variables: { left, right, removed }, prediction: right === 2 ? 'When is it safe to stop shrinking?' : undefined })
    }
    best = Math.max(best, right - left + 1)
    steps.push({ line: 8, phase: 'MEASURE', narration: `The valid window length is ${right - left + 1}; best is ${best}.`, state: { chars, left, right, best, counts: { ...counts }, prefix: [], matches: 0 }, variables: { window: chars.slice(left, right + 1).join(''), best } })
  })
  return steps
}

export function WindowVisualizer({ onProgress }: { onProgress: () => void }) {
  const [operation, setOperation] = useLessonInput('operation', 'window')
  const [input, setInput] = useLessonInput('input', 'abcabcbb')
  const [target, setTarget] = useLessonInput('target', '5')
  const steps = useMemo(() => windowSteps(input, Number(target) || 0, operation), [input, operation, target])
  const code = operation === 'window'
    ? ['left = 0', 'counts = {}', 'for right, char in enumerate(text):', '    counts[char] = counts.get(char, 0) + 1', '    while counts[char] > 1:', '        counts[text[left]] -= 1', '        left += 1', '    best = max(best, right - left + 1)']
    : ['counts = {0: 1}', 'prefix = matches = 0', 'for value in values:', '    prefix += value', '    matches += counts.get(prefix - target, 0)', '    counts[prefix] = counts.get(prefix, 0) + 1', 'return matches']
  return <AlgorithmPlayer title={operation === 'window' ? 'Sliding window: longest unique substring' : 'Prefix sum: subarray count'} subtitle="Reuse information from the previous step instead of recomputing every range." code={code} steps={steps} complexity={{ time: 'O(n)', space: 'O(k)' }} onProgress={onProgress}
    controls={<><label>PATTERN<select value={operation} onChange={(event) => { setOperation(event.target.value); setInput(event.target.value === 'window' ? 'abcabcbb' : '1, 2, 3, -2, 2') }}><option value="window">Sliding window</option><option value="prefix">Prefix sum + hash map</option></select></label><label>INPUT<input value={input} onChange={(event) => setInput(event.target.value)} /></label>{operation === 'prefix' && <label>TARGET<input value={target} onChange={(event) => setTarget(event.target.value)} /></label>}</>}
    renderScene={({ state }) => <div className="window-scene"><div className="window-array">{state.chars.map((char, index) => <span className={index >= state.left && index <= state.right ? 'inside' : ''} key={`${char}-${index}`}><strong>{char}</strong><small>{state.prefix[index] !== undefined ? `Σ${state.prefix[index]}` : index}</small></span>)}</div><div className="window-bracket" style={{ '--window-left': state.left, '--window-size': Math.max(0, state.right - state.left + 1), '--total-cells': state.chars.length } as CSSProperties}><i /><span>{operation === 'window' ? `window · best ${state.best}` : `matches · ${state.matches}`}</span></div><div className="hash-table">{Object.entries(state.counts).map(([key, value]) => <span key={key}><b>{key}</b><i>{value}</i></span>)}</div></div>}
  />
}
