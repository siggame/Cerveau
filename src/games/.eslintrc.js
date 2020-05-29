// @ts-check
/* eslint-env node */

/** @type {import("eslint").Linter.Config} */
const gamesEslintConfig = {
    extends: ["../../.eslintrc.js"],
    rules: {
        // each GameObject file initially has unused variables, and sometimes
        // the variables will never be used, but MUST be part of the function
        // signature for the entire API to work.
        "@typescript-eslint/no-unused-vars": "off",

        // sometimes it's required to re-import a file because it was already
        // imported by Creer written code.
        "import/no-duplicates": "off",

        "@typescript-eslint/require-await": "off",
    },
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
module.exports = gamesEslintConfig;
