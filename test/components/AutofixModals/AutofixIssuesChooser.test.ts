import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import { AutofixIssuesChooser } from '~/components/RepoIssues'

const stubs = {
  ZIcon: true,
  ZModal: true,
  ZButton: true,
  ZCheckbox: true,
  ZList: true,
  ZListItem: true,
  ZInput: true,
  IssueType: true,
  portal: true
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

const defaultProps = {
  isOpen: false,
  checkId: 'Q2hlY2s6YnJnbnZq',
  autofixableIssues: [
    {
      shortcode: 'BAN-B101',
      title: 'Assert statement used outside of tests',
      category: 'security',
      occurrenceCount: 1
    },
    {
      shortcode: 'PYL-W0102',
      title: 'Dangerous default argument',
      category: 'bug-risk',
      occurrenceCount: 1
    },
    {
      shortcode: 'PYL-R0201',
      title: 'No use of `self`',
      category: 'performance',
      occurrenceCount: 2
    },
    {
      shortcode: 'FLK-F901',
      title: '`raise NotImplemented` should be `raise NotImplementedError`',
      category: 'bug-risk',
      occurrenceCount: 1
    },
    {
      shortcode: 'PTC-W0016',
      title: 'Unnecessary comprehension',
      category: 'performance',
      occurrenceCount: 1
    }
  ]
}

interface AutofixIssuesChooserT extends Vue {
  searchedIssues: Record<string, string | number>[]
  selectedIssues: Record<string, string | number>[]
  selectedIssueShortcodeArray: Array<string>
  selectAll: boolean
  isIssueSelected: (
    selectedIssues: Record<string, string | number>[],
    issue: Record<string, string | number>
  ) => boolean
}

describe('[[ AutofixIssuesChooser ]]', () => {
  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
  })

  test("Doesn`t render AutofixIssuesChooser when 'isOpen' is false", () => {
    const { html } = render(AutofixIssuesChooser, {
      props: { ...defaultProps, isOpen: false },
      mocks,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test("Renders AutofixIssuesChooser when 'isOpen' is true", () => {
    const { html } = render(AutofixIssuesChooser, {
      props: { ...defaultProps, isOpen: true },
      mocks,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('Search term updates searchedIssues', () => {
    const wrapper = shallowMount(AutofixIssuesChooser, {
      propsData: { ...defaultProps, isOpen: true },
      mocks,
      stubs
    })

    wrapper.setData({ searchedIssue: 'PYL' })
    expect((wrapper.vm as AutofixIssuesChooserT).searchedIssues.length).toBe(2)
  })

  // TODO understand how to test watchers
  // test('Array of selected issue shortcodes', () => {
  //   const wrapper = shallowMount(AutofixIssuesChooser, {
  //     propsData: { ...defaultProps, isOpen: true },
  //     mocks,
  //     stubs
  //   })

  //   wrapper.setData({ selectAll: true })
  //   wrapper.vm.$nextTick(() => {
  //     expect((wrapper.vm as AutofixIssuesChooserT).selectedIssues.length).toBeTruthy()
  //     expect((wrapper.vm as AutofixIssuesChooserT).selectedIssueShortcodeArray).toBe([
  //       'BAN-B101',
  //       'PYL-W0102',
  //       'PYL-R0201',
  //       'FLK-F901',
  //       'PTC-W0016'
  //     ])
  //   })
  // })

  // test('Select all checkbox selects all and deselects all', () => {
  //   const wrapper = shallowMount(AutofixIssuesChooser, {
  //     propsData: { ...defaultProps, isOpen: true },
  //     mocks,
  //     stubs
  //   })

  //   wrapper.vm.$options.watch.updateSelectAll.call(wrapper.vm, true)
  //   expect((wrapper.vm as AutofixIssuesChooserT).selectedIssues.length).toBe(5)

  //   wrapper.vm.$options.watch.updateSelectAll.call(wrapper.vm, false)
  //   expect((wrapper.vm as AutofixIssuesChooserT).selectedIssues.length).toBe(0)
  // })
})
