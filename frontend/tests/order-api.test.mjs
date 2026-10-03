import assert from 'node:assert/strict'
import { test } from 'node:test'
import { orderStatus, orderDate, orderError } from '../lib/order-api.ts'

test('pending pickup stays distinct from completion and failure explains retry', () => {
  assert.equal(orderStatus('Pending'), 'Menunggu pickup')
  assert.equal(orderStatus('Completed'), 'Selesai')
  assert.equal(orderStatus('Unknown'), 'Unknown')
  assert.match(orderError(new Error('Pickup code is invalid.')), /Kode pickup salah/)
  assert.match(orderError(new Error('Pickup was already verified.')), /sudah diverifikasi/)
  assert.match(orderDate('2026-10-03T00:00:00Z'), /07[.:]00.*WIB/)
})
