import type { Results } from "./runner"

export type Reporter = {
  start: () => void
  done: (results: Results) => void,
  fail: (chain: string[], error: Error) => void,
  pass: (chain: string[]) => void,
}

export const consoleReporter: Reporter = {
  start: () => {
    console.info("") // blank line
  },
  done: results => {
    if (results.failures) {
      console.error(
        red(`${results.passes} passing, ${results.failures} failing`)
      )
    } else {
      console.info(
        green(`\n${results.passes} passing`)
      )
    }
  },
  fail: (chain, error) => {
    console.error(
      [red(`✖ ${chain.join(" > ")}`), error.stack]
        .filter(Boolean)
        .join("\n\n") + "\n"
    )
  },
  pass: chain => {
    console.info(
      green(`✔ ${chain.join(" > ")}`)
    )
  },
}

const red = function (str: string) {
  return `\x1b[31m${str}\x1b[0m`
}

const green = function (str: string) {
  return `\x1b[32m${str}\x1b[0m`
}
