import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { RunCard } from '~/components/History'
import VTooltip from 'v-tooltip'
import { BaseCard } from '~/components/History'
import { mocksGenerator } from '~/test/mocks'
import { RunStatus } from '~/types/types'

const generateProps = (overrides = {}) => {
  const base = {
    status: RunStatus.Pass,
    branchName: 'base',
    runId: '4323412432',
    createdAt: 'string',
    finishedIn: 12,
    gitCompareDisplay: '2342342...32423423',
    commitOid: '435432',
    vcsPrUrl: 'https://deepsource.io/github',
    pullRequestNumberDisplay: '#234',
    issuesRaisedCount: 12,
    issuesResolvedNum: 13,
    branchRunCount: 15,
    isSecondary: true,
    isForDefaultBranch: true
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
        NuxtLink: RouterLinkStub
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
      props: generateProps({ status: RunStatus.Pend }),
      stubs: {
        ZIcon: true,
        BaseCard: true,
        NuxtLink: RouterLinkStub
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
