const Pass = Symbol("Pass")

type Result<T> = {
  description: string
  duration: number
  outcome: T
}

type TestResult = Result<typeof Pass | Error >
type BlockResult = Result<Array<BlockResult | TestResult>>

type Test = Promise<TestResult>
type Block = Promise<BlockResult>

type Thunk = () => void | Promise<void>

export async function it (description: string, thunk: Thunk): Test {
  return new Promise(async res => {
    const result = { description } as TestResult
    const start = Date.now()
    try {
      await thunk()
      result.outcome = Pass
    } catch (e: unknown) {
      result.outcome = e instanceof Error ? e : new Error(String(e))
      console.info(result.outcome)
    }
    result.duration = Date.now() - start
    res(result)
  })
}

function assert <V> (description: string, setup: () => V | Promise<V>) {
  return (run: (variables: V) => Array<Test | Block>): Block => {
    return new Promise(async res => {
      const start = Date.now()
      const results = await Promise.all(run(await setup()))
      res({
        description,
        duration: Date.now() - start,
        outcome: results,
      })
    })
  }
}

function setup (description: string) {
  return <V = {}>(fn: () => V | Promise<V>) => ({
    assert: assert<V>(description, fn),
  })
}

export function describe (description: string) {
  return {
    setup: setup(description),
    assert: assert(description, () => ({})),
  }
}

type Report = {
  duration: number
  passes: number
  failures: number
  results: Array<TestResult | BlockResult>
}

function sum (outcome: "passes" | "failures", results: Array<TestResult | BlockResult>): number {
  let n = 0
  for (const result of results) {
    if (Array.isArray(result.outcome)) {
      n += sum(outcome, result.outcome)
    } else {
      if (outcome === "passes") {
        n += result.outcome === Pass ? 1 : 0
      } else {
        n += result.outcome !== Pass ? 1 : 0
      }
    }
  }
  return n
}

function count (results: Array<TestResult | BlockResult>): number {
  let n = 0
  for (const result of results) {
    if (Array.isArray(result.outcome)) {
      n += count(result.outcome)
    } else {
      n += 1
    }
  }
  return n
}

export async function suite (suite: Array<Block | Test>): Promise<Report> {
  const start = Date.now()

  const results = await Promise.all(
    suite.map(
      test =>
        new Promise<TestResult | BlockResult>(async res => {
          const result = await test
          const passes = sum("passes", [result])
          const total = count([result])
          if (result.outcome === Pass || passes === total) {
            console.info([
              green(`✔ ${result.description}`),
              Array.isArray(result.outcome) ? green(`(${passes})`) : null,
              grey(`${result.duration}ms`),
            ].filter(Boolean).join(" "))
          } else {
            console.info([
              red(`✖ ${result.description}`),
              Array.isArray(result.outcome) ? red(`(${passes}/${total})`) : null,
              grey(`${result.duration}ms`),
            ].filter(Boolean).join(" "))
          }
          res(result)
        })
    )
  )

  const report: Report = {
    duration: Date.now() - start,
    passes: sum("passes", results),
    failures: sum("failures", results),
    results,
  }

  if (!report.passes && !report.failures) {
    console.info(yellow(`⚠ No tests found`))
  } else if (report.failures) {
    console.info(red(`${report.failures} tests failed`))
  } else {
    console.info(green(`All tests passed`))
  }

  return report
}

const red = function (str: string) {
  return `\x1b[31m${str}\x1b[0m`
}

const yellow = function (str: string) {
  return `\x1b[33m${str}\x1b[0m`
}

const green = function (str: string) {
  return `\x1b[32m${str}\x1b[0m`
}

const grey = function (str: string) {
  return `\x1b[90m${str}\x1b[0m`
}
