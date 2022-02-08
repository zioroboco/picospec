import * as pico from "./next"
import { describe, expect, it } from "@jest/globals"

describe(`an individual passing test`, () => {
  const test = pico.it(`passes`, () => {})

  it(`resolves to a pass`, async () => {
    expect(await test).toBe(pico.Pass)
  })
})
