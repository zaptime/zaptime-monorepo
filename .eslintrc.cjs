module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended", //needed for prettier to work
    "prettier",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/this-in-template": ["error", "never"],
    "vue/multi-word-component-names": "off",
    "vue/no-multiple-template-root": "off",
    "vue/v-on-event-hyphenation": "off",
    "vue/attribute-hyphenation": "off",
    "vue/no-v-model-argument": "off",
    "no-unused-vars": "off", // off because typescript eslint is taking care of it
    "vue/no-v-html": ["off"],
    "vue/require-default-prop": ["off"],
    "@typescript-eslint/ban-ts-comment": ["off"],
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "vue/html-self-closing": ["off"],
    "vue/block-lang": [
      "warn",
      {
        script: {
          lang: "ts",
        },
      },
    ],
  },
};
