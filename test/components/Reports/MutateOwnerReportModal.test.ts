import { render } from '@testing-library/vue'
import { createLocalVue, mount } from '@vue/test-utils'
import { VueConstructor } from 'vue'

import { MutateOwnerReportModal } from '~/components/Reports'
import CopyButton from '~/components/CopyButton.vue'

import VTooltip from 'v-tooltip'
import { focusDirective } from '~/plugins/helpers/directives.client'

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
  sourcedRepositories: Array<string>

  // Computed properties
  reportUrl: string

  // Methods
  handlePasswordProtectedToggle: (passworProtected: boolean) => void
  generatePassword: () => void
  togglePasswordVisibility: () => void
  handleResetPassword: () => void
  handleSourceUpdate: () => void
  handleSave: (close?: () => void) => void
  emitCreateReport: (close?: () => void) => void
  emitEditReport: (close?: () => void) => void
  validateArgs: () => boolean
  closeModal: () => void
}

describe('[[ MutateOwnerReportModal ]]', () => {
  let localVue: VueConstructor<Vue>

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
    CopyButton: CopyButton
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
      $on: () => {},
      $off: () => {}
    },
    $toast: {
      danger: jest.fn(),
      success: jest.fn()
    },
    async $fetchGraphqlData() {},
    $providerMetaMap: {
      gh: {
        text: 'Github',
        shortcode: 'gh',
        value: 'GITHUB'
      }
    }
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('focus', focusDirective)
  })

  test('renders MutateOwnerReportModal in create report mode', () => {
    const props = {
      editMode: false,
      level: ReportLevel.Repository
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
      editMode: false,
      level: ReportLevel.Repository,
      isRestrictedOld: true,
      reportIdOld: 'aa183352-4b5e-427a-ac8d-95c47c52b6a1',
      reportKeysOld: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
      reportLabelOld: 'Sample Report',
      shareHistoricalDataOld: true,
      reportSourceOld: ReportSource.SourceSelected,
      sourcedRepositoriesOld: [
        'UmVwb3NpdG9yeTp6dmp2eXo=',
        'UmVwb3NpdG9yeTp6dmpleXo=',
        'UmVwb3NpdG9yeTp6Z2tlZHo='
      ]
    }

    const { html } = render(MutateOwnerReportModal, {
      props,
      stubs,
      mocks,
      localVue
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })

  test('MutateOwnerReportModal computed properties and methods', () => {
    const propsData = {
      editMode: true,
      level: ReportLevel.Repository,
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

    // ------ Test computed property ------
    expect(vm.reportUrl).toBe('https://deepsource.io/report/aa183352-4b5e-427a-ac8d-95c47c52b6a1')

    // ------ Test methods ------

    // Test generatePassword sets password data property
    expect(vm.password).toBe('')
    vm.generatePassword()
    expect(vm.password.length).toBe(16)

    // Test generatePassword generates different passwords on each call
    vm.generatePassword()
    const firstPassword = vm.password
    vm.generatePassword()
    const secondPassword = vm.password
    expect(firstPassword).not.toBe(secondPassword)

    // Test togglePasswordVisibility
    expect(vm.isPasswordHidden).toBe(false)
    vm.togglePasswordVisibility()
    expect(vm.isPasswordHidden).toBe(true)

    // Test handleResetPassword
    vm.password = ''
    vm.handleResetPassword()
    expect(vm.password.length).toBe(16)
    expect(vm.showPasswordInput).toBe(true)

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

    // Test handleSourceUpdate
    vm.reportSource = ReportSource.SourceSelected
    vm.handleSourceUpdate()
    expect(vm.showRepoSelection).toBe(true)

    // Test closeModal
    vm.closeModal()
    expect(wrapper.emitted()).toHaveProperty('close')

    // ----- Test validateArgs -----

    // Test error for only empty label
    vm.reportLabel = ''
    vm.isRestricted = false
    vm.reportKeys = [ReportPageT.OWASP_TOP_10]
    expect(vm.validateArgs()).toBe(false)

    // Test error for only no reports selected
    vm.reportLabel = 'Sample Report'
    vm.isRestricted = false
    vm.reportKeys = []
    expect(vm.validateArgs()).toBe(false)

    // Test error for only password
    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.OWASP_TOP_10]
    vm.showPasswordInput = true
    vm.password = ''
    expect(vm.validateArgs()).toBe(false)

    // Test error for reportSource
    vm.reportLabel = 'Sample Report'
    vm.showPasswordInput = false
    vm.reportKeys = [ReportPageT.OWASP_TOP_10]
    vm.reportSource = ReportSource.SourceSelected
    vm.sourcedRepositories = []
    expect(vm.validateArgs()).toBe(false)

    // Test validateArgs for all correct args
    vm.reportLabel = 'Sample Report'
    vm.reportKeys = [ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION]
    vm.showPasswordInput = true
    vm.password = 'sample-password'
    vm.reportSource = ReportSource.SourceSelected
    vm.sourcedRepositories = [
      'UmVwb3NpdG9yeTp6dmp2eXo=',
      'UmVwb3NpdG9yeTp6dmpleXo=',
      'UmVwb3NpdG9yeTp6Z2tlZHo='
    ]

    expect(vm.validateArgs()).toBe(true)
  })

  test('Report creation flow', async () => {
    const propsData = {
      editMode: false,
      level: ReportLevel.Repository
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
    vm.sourcedRepositories = [
      'UmVwb3NpdG9yeTp6dmp2eXo=',
      'UmVwb3NpdG9yeTp6dmpleXo=',
      'UmVwb3NpdG9yeTp6Z2tlZHo='
    ]

    vm.handleSave()

    // Assertions
    expect(wrapper.emitted()).toHaveProperty('create-report')
    expect(wrapper.emitted()['create-report']).toStrictEqual([
      [
        {
          ownerLogin: 'deepsourcelabs',
          repositoryName: 'asgard',
          vcsProvider: vm.$providerMetaMap['gh'].value,
          label: 'Sample Report',
          level: ReportLevel.Repository,
          isRestricted: true,
          password: 'sample-password',
          shareHistoricalData: true,
          reportKeys: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25],
          source: ReportSource.SourceSelected,
          sourcedRepositories: [
            'UmVwb3NpdG9yeTp6dmp2eXo=',
            'UmVwb3NpdG9yeTp6dmpleXo=',
            'UmVwb3NpdG9yeTp6Z2tlZHo='
          ]
        },
        undefined
      ]
    ])
  })

  test('Report updation flow', async () => {
    const propsData = {
      editMode: true,
      level: ReportLevel.Repository,
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
    vm.sourcedRepositories = [
      'UmVwb3NpdG9yeTp6dmp2eXo=',
      'UmVwb3NpdG9yeTp6dmpleXo=',
      'UmVwb3NpdG9yeTp6Z2tlZHo='
    ]

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
            'UmVwb3NpdG9yeTp6dmp2eXo=',
            'UmVwb3NpdG9yeTp6dmpleXo=',
            'UmVwb3NpdG9yeTp6Z2tlZHo='
          ]
        },
        undefined
      ]
    ])
  })
})

describe('[[ Test setTimeout for reseting password visibility ]]', () => {
  let localVue: VueConstructor<Vue>

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
    CopyButton: CopyButton
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
      $on: () => {},
      $off: () => {}
    },
    $toast: {
      danger: jest.fn(),
      success: jest.fn()
    },
    async $fetchGraphqlData() {},
    $providerMetaMap: {
      gh: {
        text: 'Github',
        shortcode: 'gh',
        value: 'GITHUB'
      }
    }
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
      editMode: false,
      level: ReportLevel.Repository
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
