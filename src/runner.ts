import { inspect } from "util"

type Suite = (title: string, thunk: () => void) => void
type Test = (title: string, thunk: () => void | Promise<void>) => void

type Runner = (inner: RunnerInner) => () => Report
type RunnerInner = (api: { describe: Suite; it: Test }) => void

export type Report = {
  passes: number
  failures: number
  tests: Array<{
    title: string
    descriptions: string[]
    error?: Error
  }>
}

export const runner: Runner = function (inner) {
  const report: Report = { passes: 0, failures: 0, tests: [] }
  const descriptions: string[] = []

  const describe: Suite = async (title, thunk) => {
    descriptions.push(title)
    thunk()
    descriptions.pop()
  }

  const it: Test = async (title, thunk) => {
    try {
      report.tests.push({ title, descriptions: [...descriptions] })
      await thunk()
      report.passes++
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(inspect(e))
      report.tests[report.tests.length - 1].error = error
      report.failures++
    }
  }

  return function () {
    inner({ describe, it })
    return report
  }
}
