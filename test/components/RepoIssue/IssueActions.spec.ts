import Vuex, { Store } from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'
import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import { VueConstructor } from 'vue'

import IssueActions from '~/components/RepoIssues/IssueActions.vue'
import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { Maybe, RepositoryCollaboratorPermission } from '~/types/types'
import { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'

const BASE_PROPS = {
  issue: {
    id: 'issue-id-for-testing',
    autofixAvailable: true,
    newVcsIssueUrl: 'vcs-url-for-testing',
    shortcode: 'PYL-TEST-2342',
    raisedInFiles: ['file1.py', 'file2.py']
  },
  canCreateAutofix: true,
  isAutofixEnabled: true,
  issueCreateIntegrations: [IntegrationShortcodes.JIRA],
  checkId: 'check-id-for-testing',
  shortcode: 'shortcode'
}

export interface CreateIssueActionItem {
  id: string
  icon: string
  label: string
  to?: string
  action?: () => Promise<void>
}

const MOCKS = {
  $route: {
    params: {
      provider: 'gh'
    }
  },
  viewer: {},
  $config: { onPrem: false },
  $socket: {
    $on: jest.fn(),
    $off: jest.fn()
  },
  $cookies: {
    get: jest.fn(() => 'create-issue-on-jira'),
    set: jest.fn()
  },
  $toast: {
    danger: jest.fn(),
    success: jest.fn(),
    show: jest.fn()
  },
  $emit: jest.fn(),
  $gateKeeper: {
    repo: jest.fn(() => {
      return true
    }),
    team: jest.fn(() => {
      return true
    }),
    provider: jest.fn((_: string, provider: string) => {
      return provider !== 'bb'
    })
  },
  $logErrorAndToast: jest.fn((e: Error, message: string) => {
    // skipcq: JS-0002
    console.log(e, message)
  }),
  async $fetchGraphqlData() {},
  async fetchAnalyzers() {}
}

const STUBS = {
  ZIcon: true,
  ZButton: true,
  ZMenu: true,
  ZMenuItem: true,
  ZSplitButtonDropdown: true,
  IgnoreIssueTestFiles: true,
  IgnoreIssueAllFiles: true,
  IgnoreIssueFilePattern: true,
  AutofixFileChooser: true
}

interface IssueActionsInterface {
  createIssueOptions: CreateIssueActionItem[]
  isJiraEnabled: boolean
  currentOption: Maybe<CreateIssueActionItem>
  canIgnoreIssues: boolean
  isOpen: boolean
  isUpgradeAccountModalOpen: boolean
  currentComponent: string
  createJiraIssue: () => Promise<void>
  createIssueOnIntegration: () => Promise<void>
  wrapAction: (option: unknown) => Promise<void>
  close: () => void
  openModal: (name: string) => void
  markAllOccurrenceDisabled: (checkIds: string[]) => void
  openUpgradeAccountModal: () => void
}

const MOCK_STORE = {
  modules: {
    'repository/detail': {
      namespaced: true,
      state: {
        repository: {
          id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
          userPermissionMeta: {
            can_ignore_issues: true,
            can_modify_metric_thresholds: true,
            permission: RepositoryCollaboratorPermission.Admin
          }
        }
      }
    },
    'integrations/detail': {
      namespaced: true,
      actions: {
        createIssueOnIntegration: () => {
          return { ok: true, shortcode: 1, issueUrl: 'https://deepsource.io/carl-sagan-was-here' }
        }
      }
    }
  }
}

const getInstance = (propsData = {}, mocks = {}, store = MOCK_STORE) => {
  const localVue = createLocalVue()
  localVue.use(VTooltip)
  localVue.use(Vuex)
  const { vm } = shallowMount(IssueActions, {
    propsData,
    mocks,
    store: new Vuex.Store(store),
    localVue
  })
  return vm as unknown as IssueActionsInterface
}

describe('[[ IssueActions ]]', () => {
  let localVue: VueConstructor<Vue>, store: Store<any>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store(MOCK_STORE)
  })

  test('renders the issue actions', () => {
    const canCreateAutofix = generateBooleanProps('canCreateAutofix', false)
    const isAutofixEnabled = generateBooleanProps('isAutofixEnabled', false)
    const issueCreateIntegrations = generateGenericProps('issueCreateIntegrations', [
      [IntegrationShortcodes.JIRA],
      []
    ])

    cartesian(canCreateAutofix, isAutofixEnabled, issueCreateIntegrations).forEach(
      (propsCombination) => {
        const props = { ...BASE_PROPS, ...propsCombination }
        const { html } = render(
          IssueActions,
          {
            props,
            stubs: STUBS,
            mocks: MOCKS,
            store
          },
          (vue) => {
            vue.use(VTooltip)
          }
        )

        expect(html()).toMatchSnapshot(JSON.stringify(props))
      }
    )
  })

  describe('[[ getter `createIssueOptions` with Jira Enabled ]]', () => {
    test('[GITHUB] Getter createIssueOptions gives correct options', () => {
      const vm = getInstance(BASE_PROPS, {
        ...MOCKS
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(2)
      expect(optIds.includes('create-issue-on-jira')).toBeTruthy()
      expect(optIds.includes('create-issue-on-vcs')).toBeTruthy()
    })

    test('[GITLAB] getter createIssueOptions gives correct options', () => {
      const vm = getInstance(BASE_PROPS, {
        ...MOCKS,
        $route: {
          params: {
            provider: 'gl'
          }
        }
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(2)
      expect(optIds.includes('create-issue-on-jira')).toBeTruthy()
      expect(optIds.includes('create-issue-on-vcs')).toBeTruthy()
    })

    test('[BITBUCKET] getter createIssueOptions gives correct options', () => {
      const vm = getInstance(BASE_PROPS, {
        ...MOCKS,
        $route: {
          params: {
            provider: 'bb'
          }
        }
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(1)
      expect(optIds.includes('create-issue-on-jira')).toBeTruthy()
      expect(optIds.includes('create-issue-on-vcs')).toBeFalsy()
    })
  })

  describe('[[ getter `createIssueOptions` with Jira Disabled ]]', () => {
    const props = () => {
      return {
        ...BASE_PROPS,
        issueCreateIntegrations: []
      }
    }

    test('[GITHUB] Getter createIssueOptions gives correct options', () => {
      const vm = getInstance(props(), {
        ...MOCKS
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(1)
      expect(optIds.includes('create-issue-on-jira')).toBeFalsy()
      expect(optIds.includes('create-issue-on-vcs')).toBeTruthy()
    })

    test('[GITLAB] getter createIssueOptions gives correct options', () => {
      const vm = getInstance(props(), {
        ...MOCKS,
        $route: {
          params: {
            provider: 'gl'
          }
        }
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(1)
      expect(optIds.includes('create-issue-on-jira')).toBeFalsy()
      expect(optIds.includes('create-issue-on-vcs')).toBeTruthy()
    })

    test('[BITBUCKET] getter createIssueOptions gives correct options', () => {
      const vm = getInstance(props(), {
        ...MOCKS,
        $route: {
          params: {
            provider: 'bb'
          }
        }
      })

      const optIds = vm.createIssueOptions.map((opt) => opt.id)

      expect(vm.createIssueOptions).toHaveLength(0)
      expect(optIds.includes('create-issue-on-jira')).toBeFalsy()
      expect(optIds.includes('create-issue-on-vcs')).toBeFalsy()
    })
  })

  describe('[[ `createJiraIssue` ]]', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('Success', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS)
      await vm.createJiraIssue()
      expect(MOCKS.$toast.show).toBeCalledTimes(1)
    })

    test('Non ok response', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS, {
        modules: {
          'repository/detail': MOCK_STORE.modules['repository/detail'],
          'integrations/detail': {
            namespaced: true,
            actions: {
              createIssueOnIntegration: () => {
                return { ok: false, shortcode: 1, issueUrl: '' }
              }
            }
          }
        }
      })

      await vm.createJiraIssue()
      expect(MOCKS.$logErrorAndToast).toBeCalledTimes(1)
    })

    test('Breaking action', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS, {
        modules: {
          'repository/detail': MOCK_STORE.modules['repository/detail'],
          'integrations/detail': {
            namespaced: true,
            actions: {
              createIssueOnIntegration: () => {
                throw new Error(
                  'If you wish to make an apple pie from scratch, you must first invent the universe'
                )
                // ~ Carl Sagan
              }
            }
          }
        }
      })

      await vm.createJiraIssue()
      expect(MOCKS.$logErrorAndToast).toBeCalledTimes(1)
    })
  })

  describe('[[ `wrapAction` ]]', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('Sets cookie', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS)
      await vm.wrapAction({
        id: 'hello-world'
      })
      expect(MOCKS.$cookies.set).toBeCalledTimes(1)
      expect(MOCKS.$cookies.set).toBeCalledWith('ds-default-create-issue-action', 'hello-world')
    })

    test('Calls action', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS)
      const option = {
        id: 'hello-world',
        action: jest.fn()
      }
      await vm.wrapAction(option)
      expect(option.action).toBeCalledTimes(1)
    })

    test('Opens URL', async () => {
      const vm = getInstance(BASE_PROPS, MOCKS)
      const oldOpen = window.open
      window.open = jest.fn()
      await vm.wrapAction({
        id: 'hello-world',
        to: 'test-url'
      })
      expect(window.open).toBeCalledTimes(1)
      expect(window.open).toBeCalledWith('test-url', '_blank')

      window.open = oldOpen
    })
  })

  test('[[ `close` ]]', () => {
    const vm = getInstance(BASE_PROPS, MOCKS)
    vm.isOpen = true
    vm.close()
    expect(vm.isOpen).toEqual(false)
  })

  test('[[ `openModal` ]]', () => {
    const vm = getInstance(BASE_PROPS, MOCKS)
    vm.currentComponent = ''
    vm.isOpen = false
    vm.openModal('hello-test-component')

    expect(vm.isOpen).toEqual(true)
    expect(vm.currentComponent).toEqual('hello-test-component')
  })

  test('[[ `markAllOccurrenceDisabled` ]]', () => {
    const vm = getInstance(BASE_PROPS, MOCKS)
    const issueIds = ['1', '2', '3']
    vm.isOpen = true
    vm.markAllOccurrenceDisabled(issueIds)

    expect(MOCKS.$emit.mock.calls).toEqual([
      ['refetchCheck', 'check-id-for-testing'],
      ['ignoreIssues', issueIds]
    ])

    expect(vm.isOpen).toEqual(false)
  })

  test('[[ `openUpgradeAccountModal` ]]', () => {
    const vm = getInstance(BASE_PROPS, MOCKS)
    vm.isOpen = true
    vm.isUpgradeAccountModalOpen = false
    vm.openUpgradeAccountModal()

    expect(vm.isOpen).toEqual(false)
    expect(vm.isUpgradeAccountModalOpen).toEqual(true)
  })
})
