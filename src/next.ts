export const Pass = Symbol("Pass")

export type TestResult = typeof Pass | Error
export type BlockResult = Array<BlockResult | TestResult>

export type Test = Promise<TestResult>
export type Block = Promise<BlockResult>
export type Suite = Promise<BlockResult>
