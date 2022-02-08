import * as pico from "./next"
import { describe, expect, it } from "@jest/globals"

describe(`an individual passing test`, () => {
  const test = pico.it(`passes, yay`, () => {})

  it(`resolves to a pass`, async () => {
    await test.then(({ outcome }) => {
      expect(outcome).toBe(pico.Pass)
    })
  })
})

describe(`an individual failing test`, () => {
  const test = pico.it(`fails, boo`, () => {
    expect(true).toBe(false)
  })

  it(`resolves to an error`, async () => {
    await test.then(({ outcome }) => {
      expect(outcome).toBeInstanceOf(Error)
    })
  })
})
