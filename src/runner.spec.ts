import { Reporter } from "./reporter"
import { Results, Suite, runner as baseRunner } from "./runner"
import { strict as assert } from "assert"
import { describe, expect, it } from "@jest/globals"

const reporter: Reporter = {
  init: () => {},
  done: () => {},
  fail: () => {},
  pass: () => {},
}

const runner = (suite: Suite) => baseRunner(suite, reporter)

describe(`running no tests`, () => {
  const run = runner(({ describe, it }) => {})

  it(`returns zero passes and failures`, async () => {
    const results = await run()

    expect(results).toMatchObject({
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
    const results = await run()

    expect(results).toMatchObject({
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
    const results = await run()

    expect(results).toMatchObject({
      passes: 2,
      failures: 0,
    })
  })
})

describe(`running a synchronous, failing test`, () => {
  const run = runner(pico => {
    pico.it(`fails`, () => assert.fail())
  })

  it(`reports zero passes and one failures`, async () => {
    const results = await run()

    expect(results).toMatchObject({
      passes: 0,
      failures: 1,
    })
  })
})

describe(`running two passing and two failing tests`, () => {
  const run = runner(pico => {
    pico.it(`passes one`, () => {})
    pico.it(`passes two`, () => {})
    pico.it(`fails two`, () => assert.fail())
    pico.it(`fails two`, () => assert.fail())
  })

  it(`reports two passes and two failures`, async () => {
    const results = await run()

    expect(results).toMatchObject({
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
    const results = await run()

    expect(results).toMatchObject({
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
    const results = await run()

    expect(results).toMatchObject({
      passes: 0,
      failures: 1,
    })
  })
})

describe(`running a mixture of passing and failing sync/async tests`, () => {
  const run = runner(pico => {
    pico.it(`passes sync`, () => {})
    pico.it(`passes async`, async () => {})
    pico.it(`fails sync`, () => assert.fail())
    pico.it(`fails async`, async () => assert.fail())
  })

  it(`reports two passes and two failures`, async () => {
    const results = await run()

    expect(results).toMatchObject({
      passes: 2,
      failures: 2,
    })
  })
})

describe(`with nested descriptions`, () => {
  const run = runner(pico => {
    pico.it(`one`, () => {})
    pico.it(`one-errors`, () => assert.fail())
    pico.describe(`outer`, () => {
      pico.it(`two`, () => {})
      pico.it(`two-errors`, () => assert.fail())
      pico.describe(`inner`, () => {
        pico.it(`three`, () => {})
        pico.it(`three-errors`, () => assert.fail())
      })
    })
    pico.it(`four`, () => {})
    pico.it(`four-errors`, () => assert.fail())
  })

  it(`returns expected results`, async () => {
    const results = await run()

    expect(results).toMatchObject({
      passes: 4,
      failures: 4,
      tests: [
        { title: `one`, descriptions: [] },
        { title: `one-errors`, descriptions: [], error: {} },
        { title: `two`, descriptions: ["outer"] },
        { title: `two-errors`, descriptions: ["outer"], error: {} },
        { title: `three`, descriptions: ["outer", "inner"] },
        { title: `three-errors`, descriptions: ["outer", "inner"], error: {} },
        { title: `four`, descriptions: [] },
        { title: `four-errors`, descriptions: [], error: {} },
      ],
    } as Results)
  })
})

describe(`running twice`, () => {
  it(`doesn't create duplicate results`, async () => {
    const run = runner(pico => {
      pico.it(`passes`, () => {})
    })

    let results: Results
    results = await run()
    results = await run()

    expect(results.passes).toBe(1)
  })
})
