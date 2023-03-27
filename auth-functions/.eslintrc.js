module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    // disable max-len
    "max-len": 0,
    // disable no-explicit-any
    "@typescript-eslint/no-explicit-any": 0,
    // disable no non-null assertion
    "@typescript-eslint/no-non-null-assertion": 0,
    // disable @typescript-eslint/no-var-requires
    "@typescript-eslint/no-var-requires": 0,
  },
};
