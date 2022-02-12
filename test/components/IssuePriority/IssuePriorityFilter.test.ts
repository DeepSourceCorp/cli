import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { IssuePriorityFilter } from '~/components/IssuePriority'

const stubs = {
  ZMenu: true,
  ZIcon: true,
  ZMenuItem: true,
  AnalyzerLogo: true,
  ZBadge: true
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
  async $fetchGraphqlData() {}
}

describe('[[ IssuePriorityFilter ]]', () => {
  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
  })

  test('renders IssuePriorityFilter with the store', () => {
    const store = new Vuex.Store({
      modules: {
        'repository/detail': {
          namespaced: true,
          state: {
            repository: {
              id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
              availableAnalyzers: {
                edges: [
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6bGp6a3d6',
                      shortcode: 'test-coverage',
                      name: 'Test Coverage',
                      logo: 'analyzer_logos/test-coverage.svg'
                    }
                  },
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6bGtiZXZ6',
                      shortcode: 'python',
                      name: 'Python',
                      logo: 'analyzer_logos/python.svg'
                    }
                  },
                  {
                    node: {
                      id: 'QW5hbHl6ZXI6b2x6cW5i',
                      shortcode: 'docker',
                      name: 'Dockerfile',
                      logo: 'analyzer_logos/docker.svg'
                    }
                  }
                ]
              }
            }
          }
        }
      }
    })

    const { html } = render(IssuePriorityFilter, {
      props: {
        selectedAnalyzer: 'docker'
      },
      mocks,
      store,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
  test('renders IssuePriorityFilter with the store', () => {
    const store = new Vuex.Store({
      modules: {
        'repository/detail': {
          namespaced: true,
          state: {
            repository: {
              id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
              availableAnalyzers: undefined
            }
          }
        }
      }
    })

    const { html } = render(IssuePriorityFilter, {
      props: {
        selectedAnalyzer: 'docker'
      },
      mocks,
      store,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
