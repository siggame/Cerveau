// @ts-check
/* eslint-env node */

/** @type {import("eslint").Linter.Config} */
const routesEslintConfig = {
    extends: ["../../../.eslintrc.js"],
    rules: {
        "jsdoc/require-returns": [
            "warn",
            {
                exemptedBy: ["api"],
            },
        ],

        "jsdoc/check-tag-names": [
            "warn",
            {
                definedTags: [
                    "api",
                    "apiDescription",
                    "apiGroup",
                    "apiError",
                    "apiErrorExample",
                    "apiName",
                    "apiParam",
                    "apiSuccess",
                    "apiSuccessExample",
                ],
            },
        ],

        "jsdoc/check-indentation": [
            "warn",
            {
                excludeTags: ["apiSuccessExample", "apiErrorExample"],
            },
        ],
    },
};

module.exports = routesEslintConfig;
