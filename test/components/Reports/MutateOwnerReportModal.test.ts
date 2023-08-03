import { render } from '@testing-library/vue'
import { createLocalVue, mount } from '@vue/test-utils'
import { VueConstructor } from 'vue'

import { MutateOwnerReportModal } from '~/components/Reports'
import CopyButton from '~/components/CopyButton.vue'

import VTooltip from 'floating-vue'
import focusDirective from '~/utils/directives/focus'

import { ReportLevel, ReportSource } from '~/types/types'
import { ReportPageT } from '~/types/reportTypes'

interface MutateOwnerReportModalT extends Vue {
  //  Data properties
  isRestricted: boolean
  isPasswordHidden: boolean
  password: string
  reportKeys: Array<ReportPageT>
  shareHistoricalData: boolean
  reportLabel: string
  showPasswordInput: boolean
  showRepoSelection: boolean
  reportSource: ReportSource
  repoListToAdd: Array<string>
  repoListToRemove: Array<string>
  sourceRepoCount: number

  // Computed properties
  reportUrl: string

  // Methods
  handlePasswordProtectedToggle: (passworProtected: boolean) => void
  generatePassword: () => void
  togglePasswordVisibility: () => void
  handleResetPassword: () => void
  handleSave: (close?: () => void) => void
  emitCreateReport: (close?: () => void) => void
  emitEditReport: (close?: () => void) => void
  validateArgs: () => boolean
  closeModal: () => void
  handleRepoAddition: (addedRepos: Array<string>) => void
  handleRepoRemoval: (removedRepos: Array<string>) => void
}

const mocks = {
  $route: {
    params: {
      provider: 'gh',
      owner: 'deepsourcelabs',
      repo: 'asgard'
    }
  },
  viewer: {},
  $config: { onPrem: false, domain: 'deepsource.io' },
  $socket: {
    $on: () => {
      return
    },
    $off: () => {
      return
    }
  },
  $toast: {
    danger: jest.fn(),
    success: jest.fn()
  },
  $fetchGraphqlData() {
    return
  },
  $providerMetaMap: {
    gh: {
      text: 'Github',
      shortcode: 'gh',
      value: 'GITHUB'
    }
  }
}

const stubs = {
  ZModal: true,
  ZInput: true,
  ZButton: true,
  ZAlert: true,
  ZSelect: true,
  ZOption: true,
  ZIcon: true,
  ZToggle: true,
  ZCheckbox: true,
  ToggleInput: true,
  SelectRepositoriesForReport: true,
  ZRadioGroup: true,
  ZRadio: true,
  CopyButton: CopyButton
}

describe('[[ render MutateOwnerReportModal ]]', () => {
  let localVue: VueConstructor<Vue>

  const baseProps = {
    level: ReportLevel.Owner,
    ownerLogin: 'deepsourcelabs',
    vcsProvider: 'gh'
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
  })

  test('renders MutateOwnerReportModal in create report mode', () => {
    const props = {
      ...baseProps,
      editMode: false
    }

    const { html } = render(MutateOwnerReportModal, {
      props,
      stubs,
      localVue
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })

  test('renders MutateOwnerReportModal in edit report mode', () => {
    const props = {
      ...baseProps,
      editMode: false,
      isRestrictedOld: true,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 2
    }

    const { html } = render(MutateOwnerReportModal, {
      props,
      stubs,
      mocks,
      localVue
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

describe('[[ MutateOwnerReportModal methods and getters ]]', () => {
  let localVue: VueConstructor<Vue>

  const baseProps = {
    level: ReportLevel.Owner,
    ownerLogin: 'deepsourcelabs',
    vcsProvider: 'gh'
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
  })

  test('MutateOwnerReportModal computed properties', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    expect(vm.reportUrl).toBe('https://deepsource.io/report/aa183352-4b5e-427a-ac8d-95c47c52b6a1')
  })

  test('generatePassword', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    expect(vm.password).toBe('')
    vm.generatePassword()
    expect(vm.password.length).toBe(16)
  })

  test('generatePassword generates new password every time', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Test generatePassword generates different passwords on each call
    vm.generatePassword()
    const firstPassword = vm.password
    vm.generatePassword()
    const secondPassword = vm.password
    expect(firstPassword).not.toBe(secondPassword)
  })

  test('togglePasswordVisibility', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Test togglePasswordVisibility
    expect(vm.isPasswordHidden).toBe(false)
    vm.togglePasswordVisibility()
    expect(vm.isPasswordHidden).toBe(true)
  })

  test('handleResetPassword', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Test handleResetPassword
    vm.password = ''
    vm.handleResetPassword()
    expect(vm.password.length).toBe(16)
    expect(vm.showPasswordInput).toBe(true)
  })

  test('handlePasswordProtectedToggle', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Test handlePasswordProtectedToggle for passwordProtected = true
    vm.password = ''
    vm.showPasswordInput = false
    vm.handlePasswordProtectedToggle(true)
    expect(vm.password.length).toBe(16)
    expect(vm.showPasswordInput).toBe(true)

    // Test handlePasswordProtectedToggle for passwordProtected = false
    vm.password = 'sample-password'
    vm.showPasswordInput = true
    vm.handlePasswordProtectedToggle(false)
    expect(vm.password).toBe('')
    expect(vm.showPasswordInput).toBe(false)
  })

  test('handleRepoAddition', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    vm.repoListToRemove = ['abc']

    // —————————— initial values ——————————

    // sourceRepoCountOld is 5, so report already had 5 repos selected
    expect(vm.sourceRepoCount).toBe(5)
    expect(vm.repoListToAdd).toStrictEqual([])
    expect(vm.repoListToRemove).toStrictEqual(['abc'])

    vm.handleRepoAddition(['abc'])

    // —————————— final values ——————————
    expect(vm.sourceRepoCount).toBe(6)
    expect(vm.repoListToAdd).toStrictEqual(['abc'])
    expect(vm.repoListToRemove).toStrictEqual([])

    // ^ the repo id 'abc' moved from repoListToRemove to repoListToAdd
  })

  test('handleRepoRemoval', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    vm.repoListToAdd = ['abc']

    // —————————— initial values ——————————

    // sourceRepoCountOld is 5, so report already had 5 repos selected
    expect(vm.sourceRepoCount).toBe(5)
    expect(vm.repoListToAdd).toStrictEqual(['abc'])
    expect(vm.repoListToRemove).toStrictEqual([])

    vm.handleRepoRemoval(['abc'])

    // —————————— final values ——————————
    expect(vm.sourceRepoCount).toBe(4)
    expect(vm.repoListToAdd).toStrictEqual([])
    expect(vm.repoListToRemove).toStrictEqual(['abc'])

    // ^ the repo id 'abc' moved from repoListToAdd to repoListToRemove
  })

  test('closeModal', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Test closeModal
    vm.closeModal()
    expect(wrapper.emitted()).toHaveProperty('close')
  })
})

describe('[[ test validateArgs method ]]', () => {
  let localVue: VueConstructor<Vue>

  const baseProps = {
    level: ReportLevel.Owner,
    ownerLogin: 'deepsourcelabs',
    vcsProvider: 'gh'
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
  })

  test('all valid args', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // ----- Test validateArgs -----

    // Initialize with all valid args
    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION]
    vm.showPasswordInput = true
    vm.password = 'sample-password'
    vm.reportSource = ReportSource.SourceSelected
    vm.repoListToAdd = ['abc', 'def']
    vm.repoListToRemove = ['hij', 'klm', 'nop']
    // ^ sourceRepoCountOld was 5 i.e. report already has 5 repos, so we can remove 3 repos

    expect(vm.validateArgs()).toBe(true)
  })

  test('empty report label', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Initialize with all valid args
    vm.reportKeys = [ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION]
    vm.showPasswordInput = true
    vm.password = 'sample-password'
    vm.reportSource = ReportSource.SourceSelected

    // Initilaize with invalid arg
    vm.reportLabel = ''

    expect(vm.validateArgs()).toBe(false)
  })

  test('empty password field', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Initialize with all valid args
    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION]
    vm.showPasswordInput = true
    vm.reportSource = ReportSource.SourceSelected
    vm.repoListToAdd = ['abc', 'def']
    vm.repoListToRemove = ['hij', 'klm', 'nop']

    // Initilaize with invalid arg
    vm.password = ''

    expect(vm.validateArgs()).toBe(false)
  })

  test('no report keys selected', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourceRepoCountOld: 5
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Initialize with all valid args
    vm.reportLabel = 'Sample Report'
    vm.showPasswordInput = true
    vm.password = 'sample-password'
    vm.reportSource = ReportSource.SourceSelected

    // Initilaize with invalid arg
    vm.reportKeys = []

    expect(vm.validateArgs()).toBe(false)
  })

  test('sourced repos validation', () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = mount(MutateOwnerReportModal, {
      stubs,
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    // Initialize with all valid args
    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION]
    vm.showPasswordInput = true
    vm.password = 'sample-password'
    vm.reportSource = ReportSource.SourceSelected

    // Initilaize with invalid arg
    vm.sourceRepoCount = 0

    expect(vm.validateArgs()).toBe(false)
  })
})

describe('[[ Report creation and updation flow ]]', () => {
  let localVue: VueConstructor<Vue>

  const baseProps = {
    level: ReportLevel.Owner,
    ownerLogin: 'deepsourcelabs',
    vcsProvider: 'gh'
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
  })

  test('Report creation flow', async () => {
    const propsData = {
      ...baseProps,
      editMode: false
    }
    const wrapper = await mount(MutateOwnerReportModal, {
      stubs: { ...stubs, ZModal: false },
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25]
    vm.isRestricted = true
    vm.password = 'sample-password'
    vm.shareHistoricalData = true
    vm.reportSource = ReportSource.SourceSelected

    // Adding repos for the report
    vm.handleRepoAddition([
      'U291cmNlYWJsZVJlcG9zaXRvcnk6Ymdkcnh6',
      'U291cmNlYWJsZVJlcG9zaXRvcnk6emVwamVi',
      'U291cmNlYWJsZVJlcG9zaXRvcnk6endqYXBi'
    ])

    vm.handleSave()

    // Assertions
    expect(wrapper.emitted()).toHaveProperty('create-report')
    expect(wrapper.emitted()['create-report']).toStrictEqual([
      [
        {
          ownerLogin: 'deepsourcelabs',
          vcsProvider: vm.$providerMetaMap['gh'].value,
          label: 'Sample Report',
          level: ReportLevel.Owner,
          isRestricted: true,
          password: 'sample-password',
          shareHistoricalData: true,
          reportKeys: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
          source: ReportSource.SourceSelected,
          sourcedRepositories: vm.repoListToAdd
        },
        undefined
      ]
    ])
  })

  test('Report updation flow', async () => {
    const propsData = {
      ...baseProps,
      editMode: true,
      isRestrictedOld: false,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: false,
      reportSourceOld: ReportSource.SourceAll
    }
    const wrapper = await mount(MutateOwnerReportModal, {
      stubs: { ...stubs, ZModal: false },
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    vm.reportLabel = 'Updated Report'
    vm.reportKeys = [ReportPageT.OWASP_TOP_10, ReportPageT.DISTRIBUTION]
    vm.isRestricted = true
    vm.password = 'sample-password'
    vm.shareHistoricalData = true
    vm.reportSource = ReportSource.SourceSelected

    // Adding repos for the report
    vm.handleRepoAddition([
      'U291cmNlYWJsZVJlcG9zaXRvcnk6Ymdkcnh6',
      'U291cmNlYWJsZVJlcG9zaXRvcnk6emVwamVi',
      'U291cmNlYWJsZVJlcG9zaXRvcnk6endqYXBi'
    ])

    vm.handleSave()

    // Assertions
    expect(wrapper.emitted()).toHaveProperty('edit-report')
    expect(wrapper.emitted()['edit-report']).toStrictEqual([
      [
        {
          reportId: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
          label: 'Updated Report',
          shareHistoricalData: true,
          reportKeys: [ReportPageT.OWASP_TOP_10, ReportPageT.DISTRIBUTION],
          isRestricted: true,
          password: 'sample-password',
          source: ReportSource.SourceSelected,
          sourcedRepositories: [
            'U291cmNlYWJsZVJlcG9zaXRvcnk6Ymdkcnh6',
            'U291cmNlYWJsZVJlcG9zaXRvcnk6emVwamVi',
            'U291cmNlYWJsZVJlcG9zaXRvcnk6endqYXBi'
          ]
        },
        {
          action: 'ADD',
          reportId: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
          repositoryIds: []
        },
        {
          action: 'REMOVE',
          reportId: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
          repositoryIds: []
        },
        undefined
      ]
    ])
  })
})

describe('[[ Test setTimeout for reseting password visibility ]]', () => {
  let localVue: VueConstructor<Vue>

  const baseProps = {
    level: ReportLevel.Owner,
    ownerLogin: 'deepsourcelabs',
    vcsProvider: 'gh'
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Password hide setTimeout', async () => {
    const propsData = {
      ...baseProps,
      editMode: false
    }
    const wrapper = await mount(MutateOwnerReportModal, {
      stubs: { ...stubs, ZModal: false },
      propsData,
      mocks,
      localVue
    })

    const vm = wrapper.vm as MutateOwnerReportModalT

    vm.isPasswordHidden = true

    vm.generatePassword()

    expect(vm.isPasswordHidden).toBe(false)
    jest.runAllTimers()
    expect(vm.isPasswordHidden).toBe(true)
  })
})
