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
import { execute, Suite } from "picospec"
import expect from "expect"

const suite: Suite = [
  describe(`a describe block`)
    .setup(async () => ({
      data: await Promise.resolve("blep"),
    }))
    .assert(({ data }) => [
      it(`hopefully passes`, () => {
        expect(data).toMatch("blep")
      }),
      it(`sometimes fails`, () => {
        expect(data).toMatch("blork")
      }),
      describe(`nested describe blocks`)
        .setup(async () => ({
          nested: await Promise.resolve("neato"),
        }))
        .assert(({ nested }) => [
          it(`can access data from the outer block`, () => {
            expect(nested).not.toMatch(data)
          }),
        ]),
    ]),
    .teardown(({ data }) => {
      cleanupModuleMocksOrWhatever()
    })
]

const results = await execute(suite)
```
