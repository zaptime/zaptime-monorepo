module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended', //needed for prettier to work
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    quotes: [2, 'single', 'avoid-escape'],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/require-default-prop': 'off', // TODO: reenable and fix issues
    'vue/return-in-computed-property': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-self-closing': 'off',
    'vue/one-component-per-file': 'off',
    'max-len': 'off',
    'vue/max-len': [
      'error',
      {
        code: 220,
        template: 9000,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
        ignoreStrings: true,
      },
    ],

    'vue/no-mutating-props': 'off', //TODO,
    'vue/no-v-html': 'off',
    'arrow-parens': ['warn', 'always'],
    'vue/no-reserved-component-names': 'off', //todo
    'vue/multi-word-component-names': 0,
    'comma-dangle': ['warn', 'always-multiline'],
    'vue/attribute-hyphenation': 'off',
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
  },
};
