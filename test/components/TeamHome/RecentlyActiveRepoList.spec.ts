import '@testing-library/jest-dom'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'
import Vuex from 'vuex'
import { RecentlyActiveRepoList } from '~/components/TeamHome'

const mocks = {
  $route: {
    params: {}
  },
  $cookies: {
    get: (key: string) => {
      return key
    }
  },
  $localStore: {
    get: () => {}
  },
  $gateKeeper: {
    team: () => {}
  },
  $providerMetaMap: {
    GITHUB: {
      shortcode: 'github'
    }
  }
}

interface IRecentlyActiveRepoList {
  canActivateRepo: boolean
  loaderCount: boolean
  generateLink: (args: Record<string, unknown>) => string
  $gateKeeper: { team: jest.MockedFunction<() => boolean> }
  $localStore: { get: jest.MockedFunction<() => unknown> }
}

describe('[[ RecentlyActiveRepoList ]]', () => {
  const getInstance = () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    const store = new Vuex.Store({
      modules: {
        'repository/list': {
          namespaced: true,
          state: {
            repoWithActiveAnalysisWithAnalyzers: [
              {
                id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
                name: 'demo-python',
                vcsProvider: 'GITHUB',
                ownerLogin: 'deepsourcelabs',
                isActivated: true,
                isFork: false,
                isPrivate: false,
                lastAnalyzedAt: '2020-07-06T10:14:07.593783+00:00',
                availableAnalyzers: {
                  edges: [
                    {
                      node: {
                        id: 'QW5hbHl6ZXI6bGtiZXZ6',
                        name: 'Python',
                        shortcode: 'python',
                        analyzerLogo:
                          'http://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg'
                      }
                    }
                  ]
                }
              },
              {
                id: 'UmVwb3NpdG9yeTp6d2phcGI=',
                name: 'demo-go',
                vcsProvider: 'GITHUB',
                ownerLogin: 'deepsourcelabs',
                isActivated: true,
                isFork: false,
                isPrivate: false,
                lastAnalyzedAt: '2020-06-18T17:29:29.550106+00:00',
                availableAnalyzers: {
                  edges: [
                    {
                      node: {
                        id: 'QW5hbHl6ZXI6cnlieXZ6',
                        name: 'Go',
                        shortcode: 'go',
                        analyzerLogo:
                          'http://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg'
                      }
                    },
                    {
                      node: {
                        id: 'QW5hbHl6ZXI6b2x6cW5i',
                        name: 'Dockerfile',
                        shortcode: 'docker',
                        analyzerLogo:
                          'http://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/docker.svg'
                      }
                    }
                  ]
                }
              },
              {
                id: 'UmVwb3NpdG9yeTpib3BtZXo=',
                name: 'git-label-packages',
                vcsProvider: 'GITHUB',
                ownerLogin: 'deepsourcelabs',
                isActivated: true,
                isFork: true,
                isPrivate: false,
                lastAnalyzedAt: null,
                availableAnalyzers: { edges: [] }
              }
            ]
          }
        },
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              dashboardContext: [{ role: 'ADMIN' }]
            }
          }
        }
      }
    })

    const { vm } = shallowMount(RecentlyActiveRepoList, {
      mocks,
      store,
      localVue
    })
    return vm as unknown as IRecentlyActiveRepoList
  }

  afterAll(() => jest.resetAllMocks())

  test('`canActivateRepo` is computed based on the user role access', () => {
    const vm = getInstance()
    vm.$gateKeeper.team = jest.fn().mockImplementationOnce(() => true)
    expect(vm.canActivateRepo).toBe(true)
  })

  test('`loaderCount` is set to `10` on the server', () => {
    const vm = getInstance()
    expect(vm.loaderCount).toBe(10)
  })

  test('`loaderCount` is retrieved from local storage on the client', () => {
    const vm = getInstance()
    Object.defineProperty(process, 'client', {
      value: true
    })
    vm.$localStore.get = jest.fn().mockImplementationOnce(() => 7)
    expect(vm.loaderCount).toBe(7)
  })

  test('`generateLink` method generates a link to the given repo', () => {
    const vm = getInstance()
    expect(
      vm.generateLink({ vcsProvider: 'GITHUB', ownerLogin: 'deepsourcelabs', name: 'demo-python' })
    ).toBe('/github/deepsourcelabs/demo-python')
  })
})
