type Descriptor = (name: string, thunk: () => void) => void
type Test = (name: string, thunk: () => void | Promise<void>) => void

type Runner = (inner: RunnerInner) => () => Promise<Report>
type RunnerInner = (api: { describe: Descriptor; it: Test }) => void

type Report = {
  passes: number
  failures: number
}

export const runner: Runner = function (inner) {
  const report: Report = { passes: 0, failures: 0 }
  return async function () {
    return report
  }
}
