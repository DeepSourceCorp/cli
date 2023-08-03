import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { RunCard, BaseCard } from '~/components/History'
import VTooltip from 'floating-vue'
import { mocksGenerator } from '~/test/mocks'
import { RunStatus } from '~/types/types'

const generateProps = (overrides = {}) => {
  const base = {
    title: 'Base branch',
    status: RunStatus.Pass,
    branchName: 'base',
    runId: '4323412432',
    createdAt: 'string',
    commitOid: '435432',
    prNumber: '#234',
    issuesRaisedCount: 12,
    issuesResolvedCount: 13,
    isSecondary: true
  }
  return Object.assign(base, overrides)
}

test('renders RunCard with all prop options', () => {
  const { html } = render(
    RunCard,
    {
      props: generateProps(),
      stubs: {
        ZIcon: true,
        BaseCard: true,
        NuxtLink: RouterLinkStub,
        MetaDataItem: true
      },
      mocks: mocksGenerator(),
      components: { BaseCard }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot('RunCard')
})

test('renders RunCard with pending', () => {
  const { html } = render(
    RunCard,
    {
      props: generateProps({ status: RunStatus.Pend, title: undefined }),
      stubs: {
        ZIcon: true,
        BaseCard: true,
        NuxtLink: RouterLinkStub,
        MetaDataItem: true
      },
      mocks: mocksGenerator(),
      components: { BaseCard }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot('RunCard Pending')
})

test('renders RunCard with skipped', () => {
  const { html } = render(
    RunCard,
    {
      props: generateProps({ status: RunStatus.Skip, title: undefined }),
      stubs: {
        ZIcon: true,
        BaseCard: true,
        NuxtLink: RouterLinkStub,
        MetaDataItem: true
      },
      mocks: mocksGenerator(),
      components: { BaseCard }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot('RunCard Pending')
})
