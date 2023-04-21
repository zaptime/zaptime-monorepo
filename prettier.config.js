// prettier.config.js
module.exports = {
  plugins: [require('prettier-plugin-tailwindcss')],
  tailwindConfig: './packages/vue3/tailwind.config.js',
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',
  singleAttributePerLine: true,
};
