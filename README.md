<header>
  <div align="center">
    <h1>
      <p>🐜</p>
      <p>picospec</p>
    </h1>
    <p>A test framework for ants</p>
    <a href="https://www.npmjs.com/package/picospec">
      <img src="https://img.shields.io/npm/v/picospec?style=flat-square">
    </a>
  </div>
  <br/>
</header>

Picospec is a vanishingly tiny test framework (including test definitions, runners and reporting) focusing exclusively on its programmatic API. It provides no CLI / test discovery / parallelism mechanisms whatsoever. If you're looking for a test framework for any half-way normal purpose, _this probably isn't it_.

It is being used to define and run task pre- and post-execution tests in the [zioroboco/begat](https://github.com/zioroboco/begat) project generator / maintenance toolkit. Maybe it will be useful again some day...

```ts
import * as assert from "assert"
import { runner } from "picospec"

const run = runner(({ describe, it }) => {
  describe(`arithmetic`, () => {
    it(`sums two numbers`, async () => {
      assert.equal(await Promise.resolve(1 + 1), 2)
    })
  })
})

run().then(report => {
  ...
})
```
