import { Reporter, defaultReporter } from "./reporter"
import { inspect } from "util"

type Suite = (title: string, thunk: () => void) => void
type Test = (title: string, thunk: () => void | Promise<void>) => void

export type Runner = (inner: RunnerInner, reporter?: Reporter) => () => Promise<Results>
type RunnerInner = (api: { describe: Suite; it: Test }) => void

export type Results = {
  passes: number
  failures: number
  tests: Array<{
    title: string
    descriptions: string[]
    error?: Error
  }>
}

export const runner: Runner = function (inner, reporter = defaultReporter) {
  reporter.start()

  const results: Results = { passes: 0, failures: 0, tests: [] }
  const descriptions: string[] = []

  const describe: Suite = async (title, thunk) => {
    descriptions.push(title)
    thunk()
    descriptions.pop()
  }

  const it: Test = async (title, thunk) => {
    let error: Error | undefined
    let chain: string[] = []

    try {
      chain = [...descriptions, title]
      results.tests.push({ title, descriptions: [...descriptions] })
      await thunk()
      results.passes++
    } catch (e: unknown) {
      error = e instanceof Error ? e : new Error(inspect(e))
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
    await inner({ describe, it })
    reporter.done(results)
    return results
  }
}
