module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: {
      js: 'espree',
      jsx: 'espree',

      ts: '@typescript-eslint/parser',
      tsx: '@typescript-eslint/parser'
    },
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: ['prettier'],
  plugins: ['vue', 'nuxt'],

  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/attribute-hyphenation': 'error', // Strongly recommended
    'vue/html-self-closing': [
      'error',
      {
        html: { normal: 'never', void: 'always' }
      }
    ], // Strongly recommended
    'vue/v-bind-style': 'error', // Strongly recommended
    'vue/v-on-style': 'error', // Strongly recommended
    'vue/v-slot-style': 'error' // Strongly recommended
    // 'vue/attributes-order': 'error' // Recommended
  }
}
