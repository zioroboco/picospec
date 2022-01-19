import { Reporter, consoleReporter } from "./reporter"

type Describe = (title: string, thunk: () => void) => void
type Test = (title: string, thunk: () => void | Promise<void>) => void

export type Runner = (
  inner: (api: { describe: Describe; it: Test }) => void,
  reporter?: Reporter
) => () => Promise<Results>

export type Results = {
  passes: number
  failures: number
  tests: Array<{
    title: string
    descriptions: string[]
    error?: Error
  }>
}

export const runner: Runner = function (inner, reporter = consoleReporter) {
  reporter.init()

  let results: Results
  let descriptions: string[]

  const describe: Describe = async (title, thunk) => {
    descriptions.push(title)
    thunk()
    descriptions.pop()
  }

  const it: Test = async (title, thunk) => {
    let error: Error | undefined
    const chain = [...descriptions, title]

    results.tests.push({ title, descriptions: [...descriptions] })

    try {
      await thunk()
      results.passes++
    } catch (e: unknown) {
      error = e instanceof Error ? e : new Error(String(e))
      results.tests[results.tests.length - 1].error = error
      results.failures++
    }

    if (error) {
      reporter.fail(chain, error)
    } else {
      reporter.pass(chain)
    }
  }

  return async function () {
    results = { passes: 0, failures: 0, tests: [] }
    descriptions = []

    await inner({ describe, it })

    reporter.done(results)
    return results
  }
}
