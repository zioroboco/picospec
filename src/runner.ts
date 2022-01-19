import { Reporter, consoleReporter } from "./reporter"

type Describe = (title: string, thunk: () => void) => void
type Test = (title: string, thunk: () => void | Promise<void>) => void

export type Suite = (api: { describe: Describe; it: Test }) => void

export type Results = {
  passes: number
  failures: number
  tests: Array<{
    title: string
    descriptions: string[]
    error?: Error
  }>
}

type Runner = (suite: Suite, reporter?: Reporter) => () => Promise<Results>

export const runner: Runner = function (suite, reporter = consoleReporter) {
  reporter.init()

  let results: Results
  let stack: string[]

  const describe: Describe = (title, thunk) => {
    stack.push(title)
    thunk()
    stack.pop()
  }

  const it: Test = async (title, thunk) => {
    const descriptions = [...stack]
    let error: Error | undefined

    const sequence = results.tests.length
    results.tests.push({ title, descriptions })

    try {
      await thunk()
      results.passes++
    } catch (e: unknown) {
      error = e instanceof Error ? e : new Error(String(e))
      results.tests[sequence].error = error
      results.failures++
    }

    if (error) {
      reporter.fail({ title, descriptions, error })
    } else {
      reporter.pass({ title, descriptions })
    }
  }

  return async function () {
    results = { passes: 0, failures: 0, tests: [] }
    stack = []

    await suite({ describe, it })

    reporter.done({ results })
    return results
  }
}
