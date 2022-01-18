import expect from "expect"
import { runner } from "../dist"

const run = runner(({ describe, it }) => {
  describe(`sync`, () => {
    it(`passes`, () => {})
    it(`fails`, () => {
      expect(true).toBe(false)
    })
  })

  describe(`async`, () => {
    it(`passes`, async () => {})
    it(`fails`, async () => {
      expect({ blep: true }).toMatchObject({ blep: false })
    })
  })

  describe(`deeply`, () => {
    describe(`nested`, () => {
      it(`passes`, async () => {})
      it(`fails`, async () => {
        expect("something").toMatch(/pattern/)
      })
    })
  })
})

run().then(results => {
  if (results.failures) {
    process.exit(1)
  }
})
