module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      "project": "./tsconfig.json"
    },
    plugins: [
        "@typescript-eslint",
    ],
    env: {
      browser: true,
      node: true,
    },
    extends: [
      "airbnb-typescript",
      "prettier",
      "prettier/@typescript-eslint",
      "plugin:prettier/recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "rules": {
        "prettier/prettier": "error",
    }
  };