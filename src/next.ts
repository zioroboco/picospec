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
  return new Promise(async res => {
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

type DescribeDottable = {
  assert: (tests: Array<Test | Block>) => Block
}

export function describe (description: string): DescribeDottable {
  return {
    assert: (children: Array<Test | Block>) => {
      return new Promise(async res => {
        const start = Date.now()
        const results = await Promise.all(children)
        res({
          description,
          duration: Date.now() - start,
          outcome: results,
        })
      })
    },
  }
}
