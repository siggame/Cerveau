// @ts-check
/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { resolve } = require("path");

process.env.ESLINT_PATH_TSCONFIG = resolve("./tsconfig.eslint.json");

/** @type {import("eslint").Linter.Config} */
const baseEslintConfig = {
    extends: ["jacobfischer/node"],
    ignorePatterns: ["dist/*", "docs/*", "logs/*"],
    rules: {
        "no-console": "error",

        "@typescript-eslint/no-misused-promises": [
            "error",
            {
                checksVoidReturn: false,
            },
        ],
        "@typescript-eslint/no-require-imports": "error",
        // all games expose async functions that rare use await,
        // and plenty of clients do to.
        // Because of this it is important they all have a unified interface,
        // namely returning promises, to work with.
        "@typescript-eslint/require-await": "off",
    },
};

module.exports = baseEslintConfig;
