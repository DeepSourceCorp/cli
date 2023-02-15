import Vuex, { Store } from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { AnalyzerSelector } from '~/components/ConfigGenerator'
import { render } from '@testing-library/vue'
import { VueConstructor } from 'vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

const stubs = {
  ZIcon: true,
  ZModal: true,
  ZButton: true,
  ZTag: true,
  ZInput: true,
  Analyzer: true,
  AnalyzerSearch: true
}

const mocks = {
  $route: {
    query: ''
  },
  viewer: {},
  $config: { onPrem: false },
  $socket: {
    $on: () => {},
    $off: () => {}
  },
  async $fetchGraphqlData() {},
  async fetchAnalyzers() {}
}

const propsData = {
  userConfig: {
    version: 1,
    analyzers: [
      { name: 'ansible', enabled: true, meta: {} },
      { name: 'test-coverage', enabled: true, meta: {} }
    ],
    transformers: [{ name: 'black', enabled: true }],
    test_patterns: ['*/tests/**/test_*.py'],
    exclude_patterns: ['core/migrations/*', 'providers/tests/common/test_files/*']
  }
}

describe('[[ AnalyzerSelector ]]', () => {
  let localVue: VueConstructor<Vue>, store: Store<any>
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store({
      modules: {
        'analyzer/list': {
          namespaced: true,
          getters: {
            getAnalyzers: () => [
              {
                name: 'ansible',
                shortcode: 'ansible',
                label: 'Ansible',
                analyzerLogo: null,
                icon: 'ansible',
                enabled: false,
                transformers: [],
                meta: {}
              },
              {
                name: 'ruby',
                shortcode: 'ruby',
                label: 'Ruby',
                analyzerLogo: null,
                icon: 'ruby',
                enabled: false,
                transformers: [],
                meta: {}
              },
              {
                name: 'sql',
                shortcode: 'sql',
                label: 'SQL',
                analyzerLogo: null,
                icon: 'sql',
                enabled: false,
                transformers: [],
                meta: {}
              },
              {
                name: 'terraform',
                shortcode: 'terraform',
                label: 'Terraform',
                analyzerLogo: null,
                icon: 'terraform',
                enabled: false,
                transformers: [],
                meta: { type: 'object', properties: {}, additionalProperties: false }
              },
              {
                name: 'test-coverage',
                shortcode: 'test-coverage',
                label: 'Test Coverage',
                analyzerLogo: null,
                icon: 'test-coverage',
                enabled: false,
                transformers: [],
                meta: {}
              }
            ]
          }
        }
      }
    })
  })

  test('renders AnalyzerSelector with all prop options', () => {
    const disableAnalyzerCardOptions = generateBooleanProps('disableAnalyzerCardOptions', false)

    cartesian(disableAnalyzerCardOptions).forEach((propCombination) => {
      const { html } = render(AnalyzerSelector, {
        propsData: { ...propsData, ...propCombination },
        stubs,
        mocks,
        store
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('emits updateAnalyzer', () => {
    const wrapper = shallowMount(AnalyzerSelector, {
      propsData,
      stubs,
      mocks,
      store,
      localVue
    })
    // @ts-ignore
    wrapper.vm.removeAnalyzer({
      shortcode: 'ansible',
      enabled: true
    })
    // @ts-ignore
    wrapper.vm.addAnalyzer({
      shortcode: 'ansible',
      enabled: false
    })

    // wrapper.emitted('updateAnalyzer') is of form [ [ analyzer ] ]
    expect(wrapper.emitted('updateAnalyzers')).toStrictEqual([
      [{ name: 'ansible', meta: {}, enabled: false }],
      [{ name: 'ansible', meta: {}, enabled: true }]
    ])
  })

  test('activeAnalyzers getter', () => {
    const wrapper = shallowMount(AnalyzerSelector, {
      propsData,
      stubs,
      mocks,
      store,
      localVue
    })

    // @ts-ignore
    const activeAnalyzers = wrapper.vm.activeAnalyzers
    expect(activeAnalyzers).toStrictEqual([
      {
        name: 'ansible',
        shortcode: 'ansible',
        label: 'Ansible',
        analyzerLogo: null,
        icon: 'ansible',
        enabled: false,
        transformers: [],
        meta: {}
      },
      {
        name: 'test-coverage',
        shortcode: 'test-coverage',
        label: 'Test Coverage',
        analyzerLogo: null,
        icon: 'test-coverage',
        enabled: false,
        transformers: [],
        meta: {}
      }
    ])
  })
})
