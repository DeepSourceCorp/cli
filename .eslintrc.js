module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
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
    'vue/v-slot-style': 'error', // Strongly recommended
    'vue/attributes-order': 'error', // Recommended
    'vue/no-deprecated-slot-attribute': 'error', // Essential
    'vue/this-in-template': 'error', // Recommended
    'vue/no-arrow-functions-in-watch': 'error', // Essential
    'vue/no-async-in-computed-properties': 'error', // Essential
    'vue/no-child-content': 'error', // Essential
    'vue/no-computed-properties-in-data': 'error', // Essential
    'vue/no-dupe-keys': 'error', // Essential
    'vue/no-dupe-v-else-if': 'error', // Essential
    'vue/no-duplicate-attributes': 'error', // Essential
    'vue/no-parsing-error': 'error', // Essential
    'vue/no-reserved-component-names': [
      'error',
      {
        disallowVueBuiltInComponents: true
      }
    ], // Recommended
    'vue/no-reserved-keys': 'error', // Essential
    'vue/no-reserved-props': [
      'error',
      {
        vueVersion: 2
      }
    ], // Essential
    'vue/no-shared-component-data': 'error', // Essential
    'vue/no-side-effects-in-computed-properties': 'error', // Essential
    'vue/no-template-key': 'error', // Essential
    'vue/no-textarea-mustache': 'error', // Essential
    'vue/no-unused-components': [
      'error',
      {
        ignoreWhenBindingPresent: true
      }
    ], // Essential
    'vue/no-unused-vars': 'error', // Essential
    'vue/no-use-computed-property-like-method': 'error', // Essential
    'vue/no-use-v-if-with-v-for': 'error', // Essential
    'vue/no-useless-template-attributes': 'error', // Essential
    'vue/no-v-text-v-html-on-component': 'error', // Essential
    'vue/require-component-is': 'error', // Essential
    'vue/require-v-for-key': 'error', // Essential
    'vue/return-in-computed-property': 'error', // Essential
    'vue/use-v-on-exact': 'error', // Essential
    'vue/valid-attribute-name': 'error', // Essential
    'vue/valid-next-tick': 'error', // Essential
    'vue/valid-template-root': 'error', // Essential
    'vue/valid-v-bind': 'error', // Essential
    'vue/valid-v-else-if': 'error', // Essential
    'vue/valid-v-else': 'error', // Essential
    'vue/valid-v-for': 'error', // Essential
    'vue/valid-v-html': 'error', // Essential
    'vue/valid-v-if': 'error', // Essential
    'vue/valid-v-model': 'error', // Essential
    'vue/valid-v-on': 'error', // Essential
    'vue/valid-v-once': 'error', // Essential
    'vue/valid-v-pre': 'error', // Essential
    'vue/valid-v-show': 'error', // Essential
    'vue/valid-v-slot': 'error', // Essential
    'vue/valid-v-text': 'error', // Essential
    'vue/no-custom-modifiers-on-v-model': 'error', // Essential
    'vue/no-multiple-template-root': 'error', // Essential
    'vue/no-v-for-template-key': 'error', // Essential
    'vue/no-v-model-argument': 'error', // Essential
    'vue/valid-v-bind-sync': 'error' // Essential
  }
}
