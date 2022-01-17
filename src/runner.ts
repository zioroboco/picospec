type Suite = (title: string, thunk: () => void) => void
type Test = (title: string, thunk: () => void | Promise<void>) => void

type Runner = (inner: RunnerInner) => () => Report
type RunnerInner = (api: { describe: Suite; it: Test }) => void

type Report = {
  passes: number
  failures: number
}

export const runner: Runner = function (inner) {
  const report: Report = { passes: 0, failures: 0 }
  const describe: Suite = (title, thunk) => {}

  const it: Test = async (title, thunk) => {
    try {
      await thunk()
      report.passes++
    } catch (e: unknown) {
      report.failures++
    }
  }

  return function () {
    inner({ describe, it })
    return report
  }
}
