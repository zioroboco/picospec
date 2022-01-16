let descriptors: string[] = []

function report(name: string, e?: unknown) {
  let failures = 0
  if (e instanceof Error) {
    console.error(`✗ ${[...descriptors, name].join(" > ")}\n`)
    console.error(e.stack)
    failures++
  } else {
    console.info(`✓ ${[...descriptors, name].join(" > ")}`)
  }
  if (failures) {
    console.error(`\n${failures} test${failures > 1 ? "s" : ""} failed\n`)
    process.exit(1)
  }
}

export function it(name: string, thonk: () => void) {
  try {
    thonk()
    report(name)
  } catch (e) {
    report(name, e)
  }
}

export function describe(name: string, thonk: () => void) {
  descriptors.push(name)
  thonk()
  descriptors.pop()
}
