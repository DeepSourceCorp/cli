import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { IssueDetailsHeader } from '~/components/RepoIssues'

import Vue from 'vue'

interface IssueDetailsHeaderT extends Vue {
  lastSeenDisplay: string
  firstSeenDisplay: string
  deslugifyTag: (tag: string) => string
}

const stubs = {
  ZIcon: true,
  IssueType: true,
  PriorityTypeBadge: true,
  PriorityTypeSelect: true,
  IssueSeverityTag: true,
  NuxtLink: RouterLinkStub
}

const defaultProps = {
  canEditPriority: true,
  firstSeen: '2020-02-29T07:06:11.659321+00:00',
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
  lastSeen: '2020-07-09T08:55:25.934225+00:00',
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

  expect(html()).toMatchSnapshot(JSON.stringify(defaultProps))
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

test('deslugifyTag', () => {
  const localVue = createLocalVue()
  localVue.use(VTooltip)

  const wrapper = shallowMount(IssueDetailsHeader, {
    stubs,
    propsData: defaultProps,
    mocks,
    localVue
  })

  const vm = wrapper.vm as IssueDetailsHeaderT

  expect(vm.deslugifyTag('cwe-123')).toEqual('cwe-123')
  expect(vm.deslugifyTag('owasp-top-10')).toEqual('owasp top 10')
  expect(vm.deslugifyTag('a02')).toEqual('a02')
  expect(vm.deslugifyTag('sans-top-25')).toEqual('sans top 25')
})
