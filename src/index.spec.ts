import { it, describe, expect, jest } from "@jest/globals"

import * as pico from "./index"
import { strict as assert } from "assert"

describe(pico.it.name, () => {
  it(`reports the test name`, () => {
    const consoleMock = jest.spyOn(console, "info")

    pico.it(`test`, () => {
      assert.ok(true)
    })

    expect(consoleMock).toHaveBeenCalledWith(expect.stringMatching(`test`))
  })
})

describe(pico.describe.name, () => {
  it(`reports a description`, () => {
    const consoleMock = jest.spyOn(console, "info")

    pico.describe(`description`, () => {
      pico.it(`test`, () => {
        assert.ok(true)
      })
    })

    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringMatching(`description > test`)
    )
  })

  it(`reports multiple descriptions`, () => {
    const consoleMock = jest.spyOn(console, "info")

    pico.describe(`outer`, () => {
      pico.describe(`inner`, () => {
        pico.it(`test`, () => {
          assert.ok(true)
        })
      })
    })

    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringMatching(`outer > inner > test`)
    )
  })
})
