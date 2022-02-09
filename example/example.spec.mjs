import { describe, it, suite } from "../dist/pico"
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
  if (report.failures) {
    process.exit(1)
  }
})
