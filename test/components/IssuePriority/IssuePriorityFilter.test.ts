import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { IssuePriorityFilter } from '~/components/IssuePriority'
import { cartesian, generateStringProps } from '~/test/utils'
import { IssuePriorityLevel } from '~/types/types'

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
        },
        'analyzer/list': {
          namespaced: true,
          state: {
            analyzerList: {
              edges: [
                {
                  node: {
                    id: 'QW5hbHl6ZXI6a3plZXZ6',
                    name: 'Ansible',
                    shortcode: 'ansible',
                    logo: '',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6b2x6cW5i',
                    name: 'Dockerfile',
                    shortcode: 'docker',
                    logo: 'analyzer_logos/docker.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6cnlieXZ6',
                    name: 'Go',
                    shortcode: 'go',
                    logo: 'analyzer_logos/go.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6bHhiYW1i',
                    name: 'JavaScript',
                    shortcode: 'javascript',
                    logo: 'analyzer_logos/javascript.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6b3p3dm5i',
                    name: 'PHP',
                    shortcode: 'php',
                    logo: '',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6bGtiZXZ6',
                    name: 'Python',
                    shortcode: 'python',
                    logo: 'analyzer_logos/python.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6YXFibHhi',
                    name: 'Ruby',
                    shortcode: 'ruby',
                    logo: 'analyzer_logos/ruby.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6bHpwZGF6',
                    name: 'Rust',
                    shortcode: 'rust',
                    logo: '',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6ZXJ6amFi',
                    name: 'SQL',
                    shortcode: 'sql',
                    logo: '',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6cnpqeGF6',
                    name: 'Scala',
                    shortcode: 'scala',
                    logo: '',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6cXh6ZGFi',
                    name: 'Terraform',
                    shortcode: 'terraform',
                    logo: 'analyzer_logos/terraform.svg',
                    analyzerLogo: null
                  }
                },
                {
                  node: {
                    id: 'QW5hbHl6ZXI6bGp6a3d6',
                    name: 'Test Coverage',
                    shortcode: 'test-coverage',
                    logo: 'analyzer_logos/test-coverage.svg',
                    analyzerLogo: null
                  }
                }
              ]
            }
          }
        }
      }
    })

    const baseProps = {
      selectedAnalyzer: 'docker'
    }

    const levelOptions = generateStringProps(
      'level',
      [IssuePriorityLevel.Repository, IssuePriorityLevel.Owner],
      false
    )

    cartesian(levelOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(IssuePriorityFilter, {
        props,
        mocks,
        store,
        stubs
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
  test('renders IssuePriorityFilter with empty availableAnalyzers', () => {
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
