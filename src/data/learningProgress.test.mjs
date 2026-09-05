import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function loadSource(filename) {
  const module = { exports: {} }
  const compiled = ts.transpileModule(readFileSync(new URL(filename, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText
  new Function('module', 'exports', 'require', compiled)(module, module.exports, require)
  return module.exports
}
const { newLessonProgress, parseLearningState, isLessonId, lessonStatus } = loadSource('./learningProgress.tsx')
const { getLearningChecks } = loadSource('./learningChecks.ts')
const snapshot = (patch = {}, id = '1:dsa') => ({ version: 1, lessons: { [id]: { ...newLessonProgress(1000), ...patch } }, lastLesson: id })

test('all 36 lessons provide two distinct three-choice reasoning checks', () => {
  const questions = new Set()
  const answers = new Set()
  for (const track of ['dsa', 'hld', 'lld']) {
    for (let week = 1; week <= 12; week++) {
      for (const check of Object.values(getLearningChecks(track, week))) {
        assert.equal(check.options.length, 3)
        assert.equal(new Set(check.options.map(option => option.label)).size, 3)
        assert.ok(check.answer >= 0 && check.answer < 3)
        assert.ok(check.options.every(option => option.feedback.length > 20))
        assert.ok(!questions.has(check.question))
        questions.add(check.question)
        answers.add(check.answer)
      }
    }
    for (const week of [0, 13, 1.5, NaN]) assert.throws(() => getLearningChecks(track, week))
  }
  assert.equal(questions.size, 72)
  assert.equal(answers.size, 3)
})

test('progress vocabulary distinguishes exposure, practise, and evidence', () => {
  assert.equal(lessonStatus(), 'Not started')
  assert.equal(lessonStatus(newLessonProgress()), 'Started')
  assert.equal(lessonStatus({ ...newLessonProgress(), practised: true }), 'Practised')
  assert.equal(lessonStatus({ ...newLessonProgress(), practised: true, predictPassed: true, explainPassed: true, demonstratedAt: 100 }), 'Checkpoint cleared')
})

test('current backups round-trip notes, review gaps, input, trace, and stage', () => {
  const saved = snapshot({
    stage: 'explain', practised: true, notebook: 'Save next before changing the pointer.',
    selectedPattern: 'Linked List Fundamentals', mistakes: 1, nextReviewAt: 1000,
    reviewChecks: ['explain'], inputs: { input: '1, 2, 3', operation: 'insert', target: '4' },
    trace: { signature: 'same-input-trace', index: 3, speed: 1.5 },
  })
  assert.deepEqual(parseLearningState(JSON.parse(JSON.stringify(saved))), saved)
})

test('older learning snapshots without input or review metadata remain valid', () => {
  assert.deepEqual(parseLearningState(snapshot()), snapshot())
  assert.equal(parseLearningState({ ...snapshot(), lastLesson: '12:lld' }).lastLesson, null)
})

test('malformed progress and unsupported checkpoint evidence are rejected', () => {
  for (const value of [null, [], {}, { version: 2, lessons: {} }, { version: 1, lessons: [] }]) assert.throws(() => parseLearningState(value))
  for (const id of ['0:dsa', '13:hld', '1:other', '1.5:dsa']) {
    assert.equal(isLessonId(id), false)
    assert.throws(() => parseLearningState(snapshot({}, id)))
  }
  for (const patch of [
    { stage: 'mastered' }, { practised: 1 }, { startedAt: NaN }, { updatedAt: Infinity },
    { mistakes: -1 }, { mistakes: .5 }, { notebook: {} }, { nextReviewAt: 'tomorrow' },
    { demonstratedAt: 1000 }, { reviewChecks: ['other'] }, { trace: { signature: 'x', index: -1, speed: 1 } },
    { trace: { signature: 'x', index: 0, speed: 12 } }, { inputs: { operation: 'unknown' } },
  ]) assert.throws(() => parseLearningState(snapshot(patch)))
})

test('restored numeric inputs cannot exceed the supported simulator dimensions', () => {
  for (const value of [4, 5]) assert.equal(parseLearningState(snapshot({ inputs: { size: value } }, '8:dsa')).lessons['8:dsa'].inputs.size, value)
  for (const value of [3, 4, 5, 6]) assert.equal(parseLearningState(snapshot({ inputs: { rows: value, columns: value } }, '10:dsa')).lessons['10:dsa'].inputs.rows, value)
  for (const value of [-1, 0, 100000, '5']) assert.throws(() => parseLearningState(snapshot({ inputs: { size: value } }, '8:dsa')))
  assert.throws(() => parseLearningState(snapshot({ inputs: { rows: 0 } }, '10:dsa')))
})
