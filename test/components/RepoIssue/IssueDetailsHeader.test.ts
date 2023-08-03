import Vue from 'vue'
import dayjs from 'dayjs'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount, RouterLinkStub } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { IssueDetailsHeader } from '~/components/RepoIssues'
import { DurationTypeT, getDateFromXAgo } from '~/utils/date'

interface IssueDetailsHeaderT extends Vue {
  lastSeenDisplay: string
  firstSeenDisplay: string
}

const stubs = {
  ZIcon: true,
  IssueType: true,
  PriorityTypeBadge: true,
  PriorityTypeSelect: true,
  IssueSeverityTag: true,
  NuxtLink: RouterLinkStub
}

const today = dayjs().format('YYYY-MM-DD')

const twoYearsAgo = getDateFromXAgo(today, DurationTypeT.years, 2)

const defaultProps = {
  canEditPriority: true,
  firstSeen: twoYearsAgo,
  issuePriority: {
    cascadingIssuePriority: {
      id: 'SXNzdWVQcmlvcml0eVR5cGU6',
      slug: 'high',
      verboseName: 'High',
      weight: 75
    },
    source: 'REPOSITORY'
  },
  issueType: 'style',
  lastSeen: twoYearsAgo,
  severity: 'MINOR',
  shortcode: 'PYL-C0412',
  tags: ['a01', 'owasp-top-10'],
  title: 'Imports from same package are not grouped'
}

const mocks = {
  $generateRoute: () => '/gh/deepsourcelabs/asgard/issues?category=all&q=tag%3Aowasp-top-10'
}

test('renders IssueDetailsHeader with all props', () => {
  const { html } = render(
    IssueDetailsHeader,
    {
      stubs,
      props: defaultProps,
      mocks
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot()
})

test('EmptyChart computed properties', () => {
  const localVue = createLocalVue()
  localVue.use(VTooltip)

  const wrapper = shallowMount(IssueDetailsHeader, {
    stubs,
    propsData: defaultProps,
    mocks,
    localVue
  })

  const vm = wrapper.vm as IssueDetailsHeaderT

  expect(vm.firstSeenDisplay).toEqual('2 years old')
  expect(vm.lastSeenDisplay).toEqual('2 years ago')
})
