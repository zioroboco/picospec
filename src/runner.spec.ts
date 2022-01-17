import { describe, expect, it } from "@jest/globals"
import { runner } from "./runner"

describe(`running no tests`, () => {
  it(`returns zero passes and failures`, async () => {
    const run = runner(({ describe, it }) => {})
    const report = await run()
    expect(report).toMatchObject({
      passes: 0,
      failures: 0,
    })
  })
})
