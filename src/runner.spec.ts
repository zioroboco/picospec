import { strict as assert } from "assert"
import { describe, expect, it } from "@jest/globals"
import { runner } from "./runner"

describe(`running no tests`, () => {
  const run = runner(({ describe, it }) => {})

  it(`returns zero passes and failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 0,
      failures: 0,
    })
  })
})

describe(`running a synchronous, passing test`, () => {
  const run = runner(pico => {
    pico.it(`passes`, () => {})
  })

  it(`reports one pass and zero failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 1,
      failures: 0,
    })
  })
})

describe(`running two synchronous, passing tests`, () => {
  const run = runner(pico => {
    pico.it(`one`, () => {})
    pico.it(`two`, () => {})
  })

  it(`reports two passes and zero failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 2,
      failures: 0,
    })
  })
})

describe(`running a synchronous, failing test`, () => {
  const run = runner(pico => {
    pico.it(`fails`, () =>  assert.fail())
  })

  it(`reports zero passes and one failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 0,
      failures: 1,
    })
  })
})

describe(`running two passing and two failing tests`, () => {
  const run = runner(pico => {
    pico.it(`passes one`, () => {})
    pico.it(`passes two`, () => {})
    pico.it(`fails two`, () =>  assert.fail())
    pico.it(`fails two`, () =>  assert.fail())
  })

  it(`reports two passes and two failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 2,
      failures: 2,
    })
  })
})

describe(`running an asynchronous, passing test`, () => {
  const run = runner(pico => {
    pico.it(`passes`, async () => {})
  })

  it(`reports one pass and zero failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 1,
      failures: 0,
    })
  })
})

describe(`running an asynchronous, failing test`, () => {
  const run = runner(pico => {
    pico.it(`fails`, async () => assert.fail())
  })

  it(`reports zero passes and one failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 0,
      failures: 1,
    })
  })
})

describe(`running a mixture of passing and failing sync/async tests`, () => {
  const run = runner(pico => {
    pico.it(`passes sync`, () => {})
    pico.it(`passes async`, async () => {})
    pico.it(`fails sync`, () =>  assert.fail())
    pico.it(`fails async`, async () =>  assert.fail())
  })

  it(`reports two passes and two failures`, async () => {
    const report = await run()

    expect(report).toMatchObject({
      passes: 2,
      failures: 2,
    })
  })
})
