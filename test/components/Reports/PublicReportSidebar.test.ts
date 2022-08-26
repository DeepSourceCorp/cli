import { render } from '@testing-library/vue'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import { outsideClickDirective } from '@deepsourcelabs/zeal'
import VTooltip from 'v-tooltip'

import { PublicReportSidebar } from '~/components/Reports'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { mocksGenerator } from '~/test/mocks'
import { cartesian, generateGenericProps } from '~/test/utils'

interface PublicReportSidebarT extends Vue {
  isOpen: boolean
  closeSidebar: (event: Event) => void
}

describe('[[ PublicReportSidebar ]]', () => {
  const baseProps = {
    ownerLogin: 'deepsourcelabs',
    ownerLogo: 'https://static.deepsource.io/dashboard/images/empty-avatar.svg',
    reports: [ReportPageT.OWASP_TOP_10, ReportPageT.SANS_TOP_25, ReportPageT.DISTRIBUTION],
    repositoryList: [{ id: 'UmVwb3NpdG9yeTp6dmp2eXo=', name: 'asgard', isPrivate: true }]
  }

  const mocks = mocksGenerator({
    $route: {
      name: 'provider-owner-repo',
      params: {
        provider: 'gh',
        owner: 'deepsourcelabs',
        repo: 'bifrost',
        reportId: '123456'
      }
    },
    ReportMeta: ReportMeta
  })

  const stubs = {
    ZTag: true,
    ZDivider: true,
    NuxtLink: RouterLinkStub
  }

  test('renders PublicReportSidebar with all prop options', () => {
    const repositoryListOptions = generateGenericProps('repositoryList', [
      [{ id: 'UmVwb3NpdG9yeTp6dmp2eXo=', name: 'asgard', isPrivate: true }],
      [
        {
          id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
          name: 'demo-python',
          isPrivate: false
        },
        {
          id: 'UmVwb3NpdG9yeTp6dmpleXo=',
          name: 'marvin-docker',
          isPrivate: true
        },
        {
          id: 'UmVwb3NpdG9yeTp6cXdwZ3o=',
          name: 'bob-cli',
          isPrivate: true
        },
        { id: 'UmVwb3NpdG9yeTp6dmp2eXo=', name: 'asgard', isPrivate: true }
      ]
    ])

    cartesian(repositoryListOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(
        PublicReportSidebar,
        {
          props,
          mocks,
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
          vue.directive('outside-click', outsideClickDirective)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('listens to toggle sidebar event', async () => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const wrapper = mount(PublicReportSidebar, {
      propsData: baseProps,
      mocks,
      stubs,
      localVue
    })

    const vm = wrapper.vm as PublicReportSidebarT

    expect(vm.isOpen).toBe(false)

    vm.$root.$emit('ui:show-public-report-sidebar')

    await vm.$nextTick()

    expect(vm.isOpen).toBe(true)
  })

  test('closeSidebar method', async () => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)
    localVue.directive('outside-click', outsideClickDirective)

    const div = document.createElement('div')
    document.body.appendChild(div)

    const wrapper = mount(
      {
        template: `<div><PublicReportSidebar/></div>`,
        components: { PublicReportSidebar }
      },
      {
        propsData: baseProps,
        mocks,
        stubs,
        localVue,
        attachTo: div
      }
    )

    await new Promise((r) => setTimeout(r))

    const vm = wrapper.vm as PublicReportSidebarT
    const testElement = wrapper.find('[data-testid="public-report-sidebar"]')

    vm.$root.$emit('ui:show-public-report-sidebar')
    await vm.$nextTick()

    expect(testElement.classes().includes('left-0')).toBe(true)
    expect(testElement.classes().includes('-left-full')).toBe(false)

    await wrapper.trigger('click')
    expect(testElement.classes().includes('-left-full')).toBe(true)
    expect(testElement.classes().includes('left-0')).toBe(false)
  })
})
