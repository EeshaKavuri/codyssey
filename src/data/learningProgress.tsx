import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type LearningTrack = 'dsa' | 'hld' | 'lld'
export type LessonId = `${number}:${LearningTrack}`
export const learningStages = ['understand', 'predict', 'experiment', 'explain', 'apply'] as const
export type LearningStage = typeof learningStages[number]
export type LessonProgress = {
  stage: LearningStage
  startedAt: number
  updatedAt: number
  practised: boolean
  predictPassed: boolean
  explainPassed: boolean
  mistakes: number
  nextReviewAt: number | null
  demonstratedAt: number | null
  notebook: string
  reviewChecks?: ('predict' | 'explain')[]
  selectedPattern?: string
  trace?: { signature: string; index: number; speed: number }
  inputs?: Record<string, string | number>
}
export type LearningState = {
  version: 1
  lessons: Partial<Record<LessonId, LessonProgress>>
  lastLesson: LessonId | null
}

const key = 'codyssey-learning-workbench-v1'
const emptyState = (): LearningState => ({ version: 1, lessons: {}, lastLesson: null })
export function isLessonId(value: unknown): value is LessonId {
  return typeof value === 'string' && /^(?:[1-9]|1[0-2]):(?:dsa|hld|lld)$/.test(value)
}
export function newLessonProgress(now = Date.now()): LessonProgress {
  return { stage: 'understand', startedAt: now, updatedAt: now, practised: false, predictPassed: false, explainPassed: false, mistakes: 0, nextReviewAt: null, demonstratedAt: null, notebook: '' }
}
export function parseLearningState(value: unknown): LearningState {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('lessons' in value) || !value.lessons || typeof value.lessons !== 'object' || Array.isArray(value.lessons)) throw new Error('Invalid learning backup.')
  const lessons: LearningState['lessons'] = {}
  for (const [id, entry] of Object.entries(value.lessons)) {
    if (!isLessonId(id) || !entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid lesson in learning backup.')
    const p = entry as Record<string, unknown>
    const stage = learningStages.find(stage => stage === p.stage)
    if (!stage || typeof p.startedAt !== 'number' || !Number.isFinite(p.startedAt) || typeof p.updatedAt !== 'number' || !Number.isFinite(p.updatedAt)
      || typeof p.practised !== 'boolean' || typeof p.predictPassed !== 'boolean' || typeof p.explainPassed !== 'boolean'
      || typeof p.mistakes !== 'number' || !Number.isInteger(p.mistakes) || p.mistakes < 0 || typeof p.notebook !== 'string'
      || !(p.nextReviewAt === null || typeof p.nextReviewAt === 'number' && Number.isFinite(p.nextReviewAt))
      || !(p.demonstratedAt === null || typeof p.demonstratedAt === 'number' && Number.isFinite(p.demonstratedAt))) throw new Error('Invalid lesson progress.')
    if (p.demonstratedAt !== null && !(p.practised && p.predictPassed && p.explainPassed)) throw new Error('Checkpoint evidence is incomplete.')
    lessons[id] = { stage, startedAt: p.startedAt, updatedAt: p.updatedAt, practised: p.practised, predictPassed: p.predictPassed, explainPassed: p.explainPassed, mistakes: p.mistakes, nextReviewAt: p.nextReviewAt, demonstratedAt: p.demonstratedAt, notebook: p.notebook.slice(0, 20000) }
    if (p.reviewChecks !== undefined) {
      if (!Array.isArray(p.reviewChecks) || !p.reviewChecks.every(item => item === 'predict' || item === 'explain')) throw new Error('Invalid review checks.')
      lessons[id]!.reviewChecks = p.reviewChecks
    }
    if (typeof p.selectedPattern === 'string') lessons[id]!.selectedPattern = p.selectedPattern
    if (p.inputs !== undefined) {
      if (!p.inputs || typeof p.inputs !== 'object' || Array.isArray(p.inputs)) throw new Error('Invalid experiment inputs.')
      const inputs: Record<string, string | number> = {}
      for (const [name, input] of Object.entries(p.inputs)) {
        if (typeof input !== 'string' && typeof input !== 'number') throw new Error('Invalid experiment input.')
        if (['size', 'rows', 'columns'].includes(name) && typeof input !== 'number') throw new Error('Experiment dimensions must be numbers.')
        if (typeof input === 'number') {
          const allowed = id === '8:dsa' && name === 'size' ? [4, 5] : id === '10:dsa' && ['rows', 'columns'].includes(name) ? [3, 4, 5, 6] : []
          if (!allowed.includes(input)) throw new Error('Experiment dimensions are outside the supported range.')
        }
        if (name === 'operation') {
          const allowed: Record<string, string[]> = { '1:dsa': ['search', 'insert', 'remove'], '2:dsa': ['pair', 'zeros'], '3:dsa': ['brackets', 'greater'], '4:dsa': ['window', 'prefix'] }
          if (typeof input !== 'string' || !allowed[id]?.includes(input)) throw new Error('Unknown trace operation.')
        }
        inputs[name] = input
      }
      lessons[id]!.inputs = inputs
    }
    if (p.trace !== undefined) {
      if (!p.trace || typeof p.trace !== 'object' || !('signature' in p.trace) || typeof p.trace.signature !== 'string' || !('index' in p.trace) || typeof p.trace.index !== 'number' || !Number.isInteger(p.trace.index) || p.trace.index < 0 || !('speed' in p.trace) || typeof p.trace.speed !== 'number' || ![0.5, 1, 1.5, 2].includes(p.trace.speed)) throw new Error('Invalid saved trace.')
      lessons[id]!.trace = { signature: p.trace.signature, index: p.trace.index, speed: p.trace.speed }
    }
  }
  return { version: 1, lessons, lastLesson: 'lastLesson' in value && isLessonId(value.lastLesson) && lessons[value.lastLesson] ? value.lastLesson : null }
}
export function lessonStatus(progress?: LessonProgress) {
  return progress?.demonstratedAt ? 'Checkpoint cleared' : progress?.practised ? 'Practised' : progress ? 'Started' : 'Not started'
}

type LearningContextValue = {
  state: LearningState
  begin: (id: LessonId) => void
  update: (id: LessonId, patch: Partial<LessonProgress>) => void
  updateInput: (id: LessonId, name: string, value: string | number) => void
  check: (id: LessonId, kind: 'predict' | 'explain', correct: boolean) => void
  restore: (state: LearningState) => void
  storageError: string
}
const LearningContext = createContext<LearningContextValue | null>(null)

export function LearningProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return { state: saved ? parseLearningState(JSON.parse(saved)) : emptyState(), error: '' }
    } catch (error) {
      console.error('Could not load Codyssey learning progress.', error)
      return { state: emptyState(), error: 'Your existing learning save could not be read and has been left unchanged. New work is in memory only. Export it before leaving, or import a valid backup from Profile.' }
    }
  })
  const [storageError, setStorageError] = useState(initial.error)
  const [savingBlocked, setSavingBlocked] = useState(Boolean(initial.error))
  const [state, setState] = useState<LearningState>(initial.state)
  useEffect(() => {
    if (savingBlocked) return
    try {
      localStorage.setItem(key, JSON.stringify(state))
      setStorageError('')
    } catch (error) {
      console.error('Could not save Codyssey learning progress.', error)
      setStorageError('This browser could not save your learning session. Export your progress before leaving.')
    }
  }, [state, savingBlocked])
  const begin = useCallback((id: LessonId) => {
    setState(current => current.lastLesson === id && current.lessons[id] ? current : { ...current, lastLesson: id, lessons: { ...current.lessons, [id]: current.lessons[id] ?? newLessonProgress() } })
  }, [])
  const update = useCallback((id: LessonId, patch: Partial<LessonProgress>) => {
    setState(current => {
      const before = current.lessons[id] ?? newLessonProgress()
      if (Object.entries(patch).every(([name, value]) => before[name as keyof LessonProgress] === value)) return current
      const next = { ...before, ...patch, updatedAt: Date.now() }
      if (next.practised && next.predictPassed && next.explainPassed && !next.reviewChecks?.length && !next.demonstratedAt) {
        next.demonstratedAt = Date.now()
        next.nextReviewAt = Date.now() + 86400000
      }
      return { ...current, lastLesson: id, lessons: { ...current.lessons, [id]: next } }
    })
  }, [])
  const check = useCallback((id: LessonId, kind: 'predict' | 'explain', correct: boolean) => {
    setState(current => {
      const before = current.lessons[id] ?? newLessonProgress()
      const pending = new Set(before.reviewChecks ?? [])
      if (correct) pending.delete(kind)
      else pending.add(kind)
      const next = { ...before, reviewChecks: [...pending], [kind === 'predict' ? 'predictPassed' : 'explainPassed']: correct || before[kind === 'predict' ? 'predictPassed' : 'explainPassed'], mistakes: before.mistakes + (correct ? 0 : 1), updatedAt: Date.now(), nextReviewAt: pending.size ? Date.now() : Date.now() + 86400000 }
      if (next.practised && next.predictPassed && next.explainPassed && !pending.size && !next.demonstratedAt) next.demonstratedAt = Date.now()
      return { ...current, lastLesson: id, lessons: { ...current.lessons, [id]: next } }
    })
  }, [])
  const updateInput = useCallback((id: LessonId, name: string, value: string | number) => {
    setState(current => {
      const before = current.lessons[id] ?? newLessonProgress()
      if (before.inputs?.[name] === value) return current
      return { ...current, lastLesson: id, lessons: { ...current.lessons, [id]: { ...before, inputs: { ...before.inputs, [name]: value }, updatedAt: Date.now() } } }
    })
  }, [])
  const restore = useCallback((snapshot: LearningState) => { setState(snapshot); setSavingBlocked(false) }, [])
  return <LearningContext.Provider value={{ state, begin, update, updateInput, check, restore, storageError }}>
    {storageError && <p className="storage-warning" role="alert">{storageError}</p>}
    {children}
  </LearningContext.Provider>
}
export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) throw new Error('LearningProvider is required.')
  return context
}

export const LessonSessionContext = createContext<{ id: LessonId; stage: LearningStage } | null>(null)
export function useLessonSession() {
  return useContext(LessonSessionContext)
}

function useSavedInput(name: string) {
  const session = useLessonSession()
  const { state, updateInput } = useLearning()
  if (!session) throw new Error('A lesson session is required for trace inputs.')
  const saved = state.lessons[session.id]?.inputs?.[name]
  return [saved, (value: string | number) => updateInput(session.id, name, value)] as const
}
export function useLessonInput(name: string, initial: string): [string, (value: string) => void] {
  const [saved, setValue] = useSavedInput(name)
  return [typeof saved === 'string' ? saved : initial, setValue]
}
export function useLessonNumber(name: string, initial: number): [number, (value: number) => void] {
  const [saved, setValue] = useSavedInput(name)
  return [typeof saved === 'number' ? saved : initial, setValue]
}
