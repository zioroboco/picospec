/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
export const config = {
  moduleFileExtensions: ["ts", "js", "json"],
  modulePathIgnorePatterns: ["\\.js$"],
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  globals: {
    "ts-jest": {
      diagnostics: { ignoreCodes: [151001] },
      isolatedModules: true,
      useESM: true,
    },
  },
}

export default config
