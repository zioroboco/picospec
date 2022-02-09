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

describe(`a describe block of only tests`, () => {
  const block = pico.describe(`some tests`).assert([
    pico.it(`passes, yay`, () => {}),
    pico.it(`fails, boo`, () => {
      expect(true).toBe(false)
    }),
  ])

  it(`resolves accordingly`, async () => {
    await block.then(results => {
      expect(results).toMatchObject({
        "description": "some tests",
        "duration": expect.any(Number),
        "outcome": [
          {
            "description": "passes, yay",
            "duration": expect.any(Number),
            "outcome": pico.Pass,
          },
          {
            "description": "fails, boo",
            "duration": expect.any(Number),
            "outcome": expect.any(Error),
          },
        ],
      })
    })
  })
})

describe(`a deeply nested describe block`, () => {
  const block = pico.describe(`some tests`).assert([
    pico.it(`passes, yay`, () => {}),
    pico.it(`fails, boo`, () => {
      expect(true).toBe(false)
    }),
    pico.describe(`with nested tests`).assert([
      pico.it(`passes, yay`, () => {}),
      pico.it(`fails, boo`, () => {
        expect(true).toBe(false)
      }),
      pico.describe(`with even more nested tests`).assert([
        pico.it(`passes, yay`, () => {}),
        pico.it(`fails, boo`, () => {
          expect(true).toBe(false)
        }),
      ]),
    ]),
  ])

  it(`resolves accordingly`, async () => {
    await block.then(results => {
      expect(results).toMatchObject({
        description: "some tests",
        outcome: [
          { description: "passes, yay", outcome: pico.Pass },
          { description: "fails, boo", outcome: expect.any(Error) },
          {
            description: "with nested tests",
            outcome: [
              { description: "passes, yay", outcome: pico.Pass },
              { description: "fails, boo", outcome: expect.any(Error) },
              {
                description: "with even more nested tests",
                outcome: [
                  { description: "passes, yay", outcome: pico.Pass },
                  { description: "fails, boo", outcome: expect.any(Error) },
                ],
              },
            ],
          },
        ],
      })
    })
  })
})