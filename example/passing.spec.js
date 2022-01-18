import { runner } from "../dist"

const run = runner(({ describe, it }) => {
  describe(`sync`, () => {
    it(`one`, () => {})
    it(`two`, () => {})
  })

  describe(`async`, () => {
    it(`one`, async () => {})
    it(`two`, async () => {})
  })

  describe(`deeply`, () => {
    describe(`nested`, () => {
      it(`one`, async () => {})
      it(`two`, async () => {})
    })
  })
})

run().then(results => {
  if (results.failures) {
    process.exit(1)
  }
})
