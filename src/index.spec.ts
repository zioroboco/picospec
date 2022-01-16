import { it, describe } from "./index"
import { strict as assert } from "assert"

it(`one`, () => {
  assert.ok(true)
})

describe(`outer`, () => {
  it(`two`, () => {
    assert.ok(true)
  })

  it(`three`, () => {
    assert.ok(true)
  })

  describe(`inner`, () => {
    it(`four`, () => {
      assert.ok(false)
    })
  })
})
