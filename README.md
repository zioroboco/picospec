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

Picospec is a vanishingly tiny test framework (including test definitions, running and reporting) focusing exclusively on its programmatic API. It provides no CLI / test discovery / parallelism mechanisms whatsoever. If you're looking for a test framework for any half-way normal purpose, _this probably isn't it_.

```ts
import { describe, it, suite } from "picospec"
import expect from "expect"

const run = () => suite([
  it(`can include sync tests`, () => {
    expect(true).toBeTruthy()
  }),

  it(`can include async tests`, async () => {
    expect(await Promise.resolve(true)).toBeTruthy()
  }),

  it(`might sometimes fail!`, () => {
    expect(false).toBeTruthy()
  }),

  describe(`collections of tests`)
    .setup(() => ({
      // will be available as an argument below
      myVariable: "blep",
    }))

    .assert(({ myVariable }) => [
      it(`can use the prepared variables`, () => {
        expect(myVariable).toBeTruthy()
      }),

      describe(`nested collections`)
        .setup(async () => ({
          // variables can also be defined async
          myAsyncVariable: await Promise.resolve("mlep"),
        }))

        .assert(({ myAsyncVariable }) => [
          it(`can still use variables from the outer scope`, () => {
            expect(myAsyncVariable).not.toMatch(myVariable)
          }),

          it(`might also fail all the way in here...`, () => {
            expect(myAsyncVariable).toMatch(myVariable)
          }),
        ]),
    ]),
])

run().then(report => {
  // ...
})
```

