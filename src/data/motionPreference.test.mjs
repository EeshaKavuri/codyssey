import assert from 'node:assert/strict'
import test from 'node:test'
import { motionEnabledFor } from './motionPreference.ts'

test('motion follows the system until the learner explicitly chooses', () => {
  assert.equal(motionEnabledFor('system', true), false)
  assert.equal(motionEnabledFor('system', false), true)
})

test('explicit motion on overrides either system preference', () => {
  assert.equal(motionEnabledFor('on', true), true)
  assert.equal(motionEnabledFor('on', false), true)
})

test('explicit motion off overrides either system preference', () => {
  assert.equal(motionEnabledFor('off', true), false)
  assert.equal(motionEnabledFor('off', false), false)
})
