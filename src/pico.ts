const Pass = Symbol("Pass")

type Result<T> = {
  description: string
  duration: number
  outcome: T
}

type TestResult = Result<typeof Pass | Error >
type BlockResult = Result<Array<BlockResult | TestResult>>

export type Test = Promise<TestResult>
export type Block = Promise<BlockResult>
export type Suite = Array<Test | Block>

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
      console.error(result.outcome)
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
  passed: number
  failed: number
  results: Array<TestResult | BlockResult>
}

function sum (outcome: "passed" | "failed", results: Array<TestResult | BlockResult>): number {
  let n = 0
  for (const result of results) {
    if (Array.isArray(result.outcome)) {
      n += sum(outcome, result.outcome)
    } else {
      if (outcome === "passed") {
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

export async function suite (suite: Suite): Promise<Report> {
  const start = Date.now()

  const results = await Promise.all(
    suite.map(
      test =>
        new Promise<TestResult | BlockResult>(async res => {
          const result = await test
          const passed = sum("passed", [result])
          const total = count([result])
          if (result.outcome === Pass || passed === total) {
            console.info([
              green(`✔ ${result.description}`),
              Array.isArray(result.outcome) ? green(`(${passed})`) : null,
              grey(`${result.duration}ms`),
            ].filter(Boolean).join(" "))
          } else {
            console.error([
              red(`✖ ${result.description}`),
              Array.isArray(result.outcome) ? red(`(${passed}/${total})`) : null,
              grey(`${result.duration}ms`),
            ].filter(Boolean).join(" "))
          }
          res(result)
        })
    )
  )

  const report: Report = {
    duration: Date.now() - start,
    passed: sum("passed", results),
    failed: sum("failed", results),
    results,
  }

  if (!report.passed && !report.failed) {
    console.warn(yellow(`⚠ No tests found`))
  } else if (report.failed) {
    console.error(red(`${report.failed} tests failed`))
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
