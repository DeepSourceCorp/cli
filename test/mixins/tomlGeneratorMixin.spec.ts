import { shallowMount } from '@vue/test-utils'
import TomlGeneratorMixin from '@/mixins/tomlGeneratorMixin'
import { RepoConfigInterface as RepoConfig } from '~/store/repository/detail'

describe('Generate TOML from JSON', () => {
  it('Works with empty config', () => {
    const testComponent = shallowMount(TomlGeneratorMixin, {
      template: '<div/>'
    })
    const { methods } = testComponent.vm.$options
    expect(methods).toHaveProperty('tomlTemplate')
    if (methods) {
      const fn = methods.tomlTemplate as (
        config: RepoConfig,
        testPatterns: RepoConfig['test_patterns'],
        excludePatterns: RepoConfig['exclude_patterns']
      ) => string

      const emptyConfig = {
        version: 1,
        analyzers: [],
        transformers: [],
        test_patterns: [],
        exclude_patterns: []
      }
      expect(fn(emptyConfig, [], [])).toStrictEqual('version = 1')
    }
  })

  it('`testPatternsTemplate` method works as expected', () => {
    const testComponent = shallowMount(TomlGeneratorMixin, {
      template: '<div/>'
    })
    const { methods } = testComponent.vm.$options
    expect(methods).toHaveProperty('testPatternsTemplate')
    if (methods) {
      const fn = methods.testPatternsTemplate as (testPatterns: string[]) => string

      let testPatterns = ['example_string']
      expect(fn(testPatterns)).toStrictEqual('test_patterns = ["example_string"]')

      testPatterns = ['example_string1', 'example_string2', 'example_string3']
      expect(fn(testPatterns)).toStrictEqual(
        `test_patterns = [\n  "example_string1",\n  "example_string2",\n  "example_string3"\n]`
      )
    }
  })

  it('`excludePatternsTemplate` method works as expected', () => {
    const testComponent = shallowMount(TomlGeneratorMixin, {
      template: '<div/>'
    })
    const { methods } = testComponent.vm.$options
    expect(methods).toHaveProperty('excludePatternsTemplate')
    if (methods) {
      const fn = methods.excludePatternsTemplate as (excludePatterns: string[]) => string

      let testPatterns = ['example_string']
      expect(fn(testPatterns)).toStrictEqual('exclude_patterns = ["example_string"]')

      testPatterns = ['example_string1', 'example_string2', 'example_string3']
      expect(fn(testPatterns)).toStrictEqual(
        `exclude_patterns = [\n  "example_string1",\n  "example_string2",\n  "example_string3"\n]`
      )
    }
  })

  it('`analyzersTemplate` method works as expected', () => {
    const testComponent = shallowMount(TomlGeneratorMixin, {
      template: '<div/>'
    })
    const { methods } = testComponent.vm.$options
    expect(methods).toHaveProperty('analyzersTemplate')
    if (methods) {
      const fn = methods.analyzersTemplate as (allAnalyzers: RepoConfig['analyzers']) => string

      let testAnalyzers: RepoConfig['analyzers'] = [
        {
          meta: {
            max_line_length: 100,
            skip_doc_coverage: ['module', 'magic', 'class']
          },
          name: 'python',
          enabled: true
        },
        {
          name: 'test-coverage',
          enabled: true,
          meta: {}
        },
        {
          name: 'docker',
          enabled: true,
          meta: {}
        }
      ]

      expect(fn(testAnalyzers)).toStrictEqual(
        `[[analyzers]]\nname = "python"\n\n  [analyzers.meta]\n  max_line_length = 100\n  skip_doc_coverage = [\n    "module",\n    "magic",\n    "class"\n  ]\n\n[[analyzers]]\nname = "test-coverage"\n\n[[analyzers]]\nname = "docker"`
      )

      testAnalyzers = [
        {
          name: 'test-coverage',
          enabled: true,
          meta: {}
        },
        {
          name: 'docker',
          enabled: true,
          meta: {}
        }
      ]

      expect(fn(testAnalyzers)).toStrictEqual(
        `[[analyzers]]\nname = "test-coverage"\n\n[[analyzers]]\nname = "docker"`
      )
    }
  })

  it('`transformersTemplate` method works as expected', () => {
    const testComponent = shallowMount(TomlGeneratorMixin, {
      template: '<div/>'
    })
    const { methods } = testComponent.vm.$options
    expect(methods).toHaveProperty('transformersTemplate')
    if (methods) {
      const fn = methods.transformersTemplate as (
        allTransformers: RepoConfig['transformers']
      ) => string

      const transformersConfig: RepoConfig['transformers'] = [
        {
          name: 'black',
          enabled: true,
          shortcode: 'BLACK'
        },
        {
          name: 'prettier',
          enabled: true,
          shortcode: 'PRETTIER'
        },
        {
          name: 'yapf',
          enabled: false,
          shortcode: 'YAPF'
        }
      ]
      expect(fn(transformersConfig)).toStrictEqual(
        `[[transformers]]\nname = "black"\n\n[[transformers]]\nname = "prettier"\n\n[[transformers]]\nname = "yapf"\nenabled = false`
      )
    }
  })
})
