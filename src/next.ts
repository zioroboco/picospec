export const Pass = Symbol("Pass")

export type TestResult = typeof Pass | Error
export type BlockResult = Array<BlockResult | TestResult>

export type Test = Promise<TestResult>
export type Block = Promise<BlockResult>
export type Suite = Promise<BlockResult>

export type Thunk = () => void | Promise<void>

export async function it (description: string, thunk: Thunk): Test {
  return new Promise(async (resolve, reject) => {
    try {
      await thunk()
      resolve(Pass)
    } catch (error) {
      reject(error)
    }
  })
}
