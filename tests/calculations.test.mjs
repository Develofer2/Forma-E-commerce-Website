import test from "node:test"
import assert from "node:assert/strict"
import { totals, money } from "../src/lib/format.ts"

test("an empty bag has no shipping fee", () => {
  assert.deepEqual(totals([]), { subtotal: 0, shipping: 0, total: 0 })
})
test("quantities are included in the order subtotal", () => {
  assert.deepEqual(totals([{ quantity: 2, product: { price: 24 } }]), {
    subtotal: 48,
    shipping: 8,
    total: 56,
  })
})
test("free shipping starts at exactly $100", () => {
  assert.deepEqual(totals([{ quantity: 2, product: { price: 50 } }]), {
    subtotal: 100,
    shipping: 0,
    total: 100,
  })
})
test("price calculations use integer cents", () => {
  assert.equal(
    totals([{ quantity: 3, product: { price: 19.99 } }]).subtotal,
    59.97,
  )
})
test("multiple products share one shipping charge", () => {
  assert.deepEqual(
    totals([
      { quantity: 1, product: { price: 24 } },
      { quantity: 1, product: { price: 48 } },
    ]),
    { subtotal: 72, shipping: 8, total: 80 },
  )
})
test("money has a consistent USD display", () => {
  assert.equal(money(48), "$48.00")
})
