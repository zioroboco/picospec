import type { Results } from "./runner"

export type Reporter = {
  init: () => void
  pass: (args: { title: string, descriptions: string[] }) => void,
  fail: (args: { title: string, descriptions: string[], error: Error }) => void,
  done: (args: { results: Results }) => void,
}

export const consoleReporter: Reporter = {
  init: () => {
    console.info("") // blank line
  },

  pass: ({ title, descriptions }) => {
    console.info(
      green(`✔ ${[...descriptions, title].join(" > ")}`)
    )
  },

  fail: ({ title, descriptions, error }) => {
    console.error(
      [red(`✖ ${[...descriptions, title].join(" > ")}`), error.stack]
        .filter(Boolean)
        .join("\n\n") + "\n"
    )
  },

  done: ({ results }) => {
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
}

const red = function (str: string) {
  return `\x1b[31m${str}\x1b[0m`
}

const green = function (str: string) {
  return `\x1b[32m${str}\x1b[0m`
}
