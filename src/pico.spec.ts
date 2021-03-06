import * as pico from "./pico"
import { describe, expect, it, jest } from "@jest/globals"

describe(`an individual passing test`, () => {
  const test = pico.it(`passes, yay`, () => {})

  it(`resolves to a pass`, async () => {
    await test.then(({ outcome }) => {
      expect(outcome).not.toBeInstanceOf(Error)
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
  const block = pico.describe(`some tests`).assert(() => [
    pico.it(`passes, yay`, () => {}),
    pico.it(`fails, boo`, () => {
      expect(true).toBe(false)
    }),
  ])

  it(`resolves accordingly`, async () => {
    await block.then(results => {
      expect(results).toMatchObject({
        description: "some tests",
        duration: expect.any(Number),
        outcome: [
          {
            description: "passes, yay",
            duration: expect.any(Number),
            outcome: expect.any(Symbol),
          },
          {
            description: "fails, boo",
            duration: expect.any(Number),
            outcome: expect.any(Error),
          },
        ],
      })
    })
  })
})

describe(`a deeply nested describe block`, () => {
  const block = pico.describe(`some tests`).assert(() => [
    pico.it(`passes, yay`, () => {}),
    pico.it(`fails, boo`, () => {
      expect(true).toBe(false)
    }),
    pico.describe(`with nested tests`).assert(() => [
      pico.it(`passes, yay`, () => {}),
      pico.it(`fails, boo`, () => {
        expect(true).toBe(false)
      }),
      pico.describe(`with even more nested tests`).assert(() => [
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
          { description: "passes, yay", outcome: expect.any(Symbol) },
          { description: "fails, boo", outcome: expect.any(Error) },
          {
            description: "with nested tests",
            outcome: [
              { description: "passes, yay", outcome: expect.any(Symbol) },
              { description: "fails, boo", outcome: expect.any(Error) },
              {
                description: "with even more nested tests",
                outcome: [
                  { description: "passes, yay", outcome: expect.any(Symbol) },
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

describe(`a describe block with setup function`, () => {
  const block = pico
    .describe(`some tests`)
    .setup(async () => ({
      thing: await Promise.resolve("expected"),
    }))
    .assert(({ thing }) => [
      pico.it(`passes, yay`, () => {
        expect(thing).toBe("expected")
      }),
      pico.it(`fails, boo`, () => {
        expect(thing).toBe("something else")
      }),
    ])

  it(`resolves accordingly`, async () => {
    await block.then(results => {
      expect(results).toMatchObject({
        description: "some tests",
        outcome: [
          {
            description: "passes, yay",
            outcome: expect.any(Symbol),
          },
          {
            description: "fails, boo",
            outcome: expect.any(Error),
          },
        ],
      })
    })
  })
})

describe(`a describe block with no setup function`, () => {
  const block = pico.describe(`no setup`).assert(variables => [
    pico.it(`passes an empty object`, () => {
      expect(variables).toMatchInlineSnapshot(`Object {}`)
    }),
  ])

  it(`resolves accordingly`, async () => {
    await block.then(results => {
      expect(results).toMatchObject({
        description: "no setup",
        outcome: [
          {
            description: "passes an empty object",
            outcome: expect.any(Symbol),
          },
        ],
      })
    })
  })
})

describe(`reporting on a suite of tests`, () => {
  const suite = [
    pico.describe(`some tests`).assert(() => [
      pico.it(`passes, yay`, () => {}),
      pico.it(`fails, boo`, () => {
        expect(true).toBe(false)
      }),
      pico.describe(`with nested tests`).assert(() => [
        pico.it(`passes, yay`, () => {}),
        pico.it(`fails, boo`, () => {
          expect(true).toBe(false)
        }),
        pico.describe(`with even more nested tests`).assert(() => [
          pico.it(`passes, yay`, () => {}),
          pico.it(`fails, boo`, () => {
            expect(true).toBe(false)
          }),
        ]),
      ]),
    ]),
  ]

  it("returns the expected report", async () => {
    const { results } = await pico.run(suite)
    expect(results).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          descriptions: ["some tests", "passes, yay"],
          outcome: expect.any(Symbol),
        }),
        expect.objectContaining({
          descriptions: ["some tests", "fails, boo"],
          outcome: expect.any(Error),
        }),
        expect.objectContaining({
          descriptions: ["some tests", "with nested tests", "passes, yay"],
          outcome: expect.any(Symbol),
        }),
        expect.objectContaining({
          descriptions: ["some tests", "with nested tests", "fails, boo"],
          outcome: expect.any(Error),
        }),
      ])
    )
  })
})
