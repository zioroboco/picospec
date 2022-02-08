export const Pass = Symbol("Pass")

type Result<T> = {
  description: string
  duration: number
  outcome: T
}

export type TestResult = Result<typeof Pass | Error >
export type BlockResult = Result<Array<BlockResult | TestResult>>

export type Test = Promise<TestResult>
export type Block = Promise<BlockResult>
export type Suite = Promise<BlockResult>

export type Thunk = () => void | Promise<void>

export async function it (description: string, thunk: Thunk): Test {
  return new Promise(async (res, _) => {
    const result = { description } as TestResult
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
