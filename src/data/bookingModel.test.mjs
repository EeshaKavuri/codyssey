import assert from 'node:assert/strict'
import { test } from 'node:test'
import { runBookingModelChecks } from './bookingModel.ts'

test('booking race, authoritative writes, lifecycle guards, and expiration heap invariants', () => {
  const checks = runBookingModelChecks()
  assert.equal(checks.length, 12)
  assert.equal(new Set(checks).size, 12)
})
