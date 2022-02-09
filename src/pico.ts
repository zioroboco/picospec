const Pass = Symbol("Pass")

type TestOutcome = typeof Pass | Error
type BlockOutcome = Array<Result<BlockOutcome> | Result<TestOutcome>>

type Result<T = TestOutcome | BlockOutcome> = {
  description: string
  duration: number
  outcome: T
}

type Test = Promise<Result<TestOutcome>>
type Block = Promise<Result<BlockOutcome>>

type Thunk = () => void | Promise<void>

export async function it (description: string, thunk: Thunk): Test {
  return new Promise(async res => {
    const result = { description } as Result<TestOutcome>
    const start = Date.now()
    try {
      await thunk()
      result.outcome = Pass
    } catch (e: unknown) {
      result.outcome = e instanceof Error ? e : new Error(String(e))
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
  results: Result[]
}

function count (where: (r: Result) => boolean, results: Result[]): number {
  let n = 0
  for (const result of results) {
    if (Array.isArray(result.outcome)) {
      n += count(where, result.outcome)
    } else {
      if (where(result)) {
        n += 1
      }
    }
  }
  return n
}

const countPassing = (results: Result[]) =>
  count(r => r.outcome === Pass, results)

const countFailing = (results: Result[]) =>
  count(r => r.outcome !== Pass, results)

const countTotal = (results: Result[]) =>
  count(r => !Array.isArray(r.outcome), results)

function consoleLogger (result: Result, level = 0): void {
  const passing = countPassing([result])
  const total = countTotal([result])
  const format = (desc: string) =>
    [
      "  ".repeat(level),
      result.outcome === Pass || passing === total
        ? green("✔ " + desc)
        : red("✖ " + desc),
      " ",
      Array.isArray(result.outcome)
        ? passing === total
          ? green(`(${passing})`)
          : red(`(${passing}/${total})`)
        : grey(`${result.duration}ms`),
    ].join("")

  console.info(format(result.description))
  if (result.outcome instanceof Error) {
    console.error()
    console.error(result.outcome.stack ?? result.outcome.message)
    console.error()
  }

  if (Array.isArray(result.outcome)) {
    for (const sub of result.outcome) {
      consoleLogger(sub, level + 1)
    }
  }
}

type Logger = (result: Result) => void

type Settings = {
  log?: boolean
  logger?: Logger
}

export async function suite (suite: Array<Block | Test>, settings?: Settings): Promise<Report> {
  let { log, logger } = {
    log: true,
    logger: consoleLogger,
    ...settings,
  }

  const start = Date.now()

  const results = await Promise.all(
    suite.map(
      test =>
        new Promise<Result>(async res => {
          const result = await test
          if (log) logger(result)
          res(result)
        })
    )
  )

  return {
    duration: Date.now() - start,
    passes: countPassing(results),
    failures: countFailing(results),
    results,
  }
}

function red (str: string) {
  return `\x1b[31m${str}\x1b[0m`
}

function green (str: string) {
  return `\x1b[32m${str}\x1b[0m`
}

function grey (str: string) {
  return `\x1b[90m${str}\x1b[0m`
}
