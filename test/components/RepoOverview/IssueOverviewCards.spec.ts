import { render } from '@testing-library/vue'
import { TooltipDirective } from 'floating-vue'

import { StatSection } from '~/components/Metrics'
import { IssueOverviewCards } from '~/components/RepoOverview'

import { storeModulesGenerator } from '~/test/mocks'
import { VcsProviderChoices } from '~/types/types'

describe('[[ IssueOverviewCards ]]', () => {
  const mocks = {
    $fetchState: { pending: false },
    $gateKeeper: {
      repo: () => ''
    },
    $socket: {
      $on: () => '',
      $off: () => ''
    }
  }

  const storeMock = {
    modules: storeModulesGenerator({
      'repository/detail': {
        namespaced: true,
        state: {
          repository: {
            id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
            vcsProvider: VcsProviderChoices.Github,
            isActivated: true,
            widgets: [
              'antipattern-widget',
              'bug-risk-widget',
              'performance-widget',
              'security-widget',
              'lcv-widget',
              'bcv-widget',
              'ccv-widget',
              'cpcv-widget'
            ],
            widgetsDisplay: {
              'antipattern-widget': {
                title: 'Anti-patterns',
                value_display: 308,
                link: '/gh/deepsourcelabs/bifrost/issues/?category=antipattern',
                description: 'Antipattern issues',
                hint: null,
                has_trend_value: true,
                trend_direction: 'down',
                trend_value: '2%',
                trend_display: 'since last week',
                trend_positive: false
              },
              'bug-risk-widget': {
                title: 'Bug risks',
                value_display: 10,
                link: '/gh/deepsourcelabs/bifrost/issues/?category=bug-risk',
                description: 'Bug-Risk issues',
                hint: null,
                has_trend_value: false,
                trend_direction: null,
                trend_value: null,
                trend_display: 'no change since last week',
                trend_positive: false
              },
              'performance-widget': {
                title: 'Performance Issues',
                value_display: 27,
                link: '/gh/deepsourcelabs/bifrost/issues/?category=performance',
                description: 'Performance issues',
                hint: null,
                has_trend_value: false,
                trend_direction: null,
                trend_value: null,
                trend_display: 'no change since last week',
                trend_positive: false
              },
              'security-widget': {
                title: 'Security Issues',
                value_display: 32,
                link: '/gh/deepsourcelabs/bifrost/issues/?category=security',
                description: 'Security issues',
                hint: null,
                has_trend_value: false,
                trend_direction: null,
                trend_value: null,
                trend_display: 'no change since last week',
                trend_positive: false
              },
              'lcv-widget': {
                title: 'Line Coverage',
                value_display: '65.5%',
                link: '/gh/deepsourcelabs/bifrost/metrics/LCV',
                description: 'Code coverage of this repository excluding the branches.',
                hint: null,
                has_trend_value: false,
                trend_display: 'no change since last commit',
                trend_direction: null,
                trend_value: null,
                trend_positive: true
              },
              'bcv-widget': {
                title: 'Branch Coverage',
                value_display: '48.8%',
                link: '/gh/deepsourcelabs/bifrost/metrics/BCV',
                description:
                  'Code coverage of this repository, including the branches in the code.',
                hint: null,
                has_trend_value: false,
                trend_display: 'no change since last commit',
                trend_direction: null,
                trend_value: null,
                trend_positive: true
              },
              'ccv-widget': {
                title: 'Condition Coverage',
                value_display: '50%',
                link: '/gh/deepsourcelabs/bifrost/metrics/CCV',
                description:
                  'Percentage of logical conditions in the source code covered by tests.',
                hint: null,
                has_trend_value: false,
                trend_display: 'no change since last commit',
                trend_direction: null,
                trend_value: null,
                trend_positive: true
              },
              'cpcv-widget': {
                title: 'Composite Coverage',
                value_display: '62.5%',
                link: '/gh/deepsourcelabs/bifrost/metrics/CPCV',
                description:
                  'Weighted average of the coverage of lines, conditions and branches executed by the tests.',
                hint: null,
                has_trend_value: false,
                trend_display: 'no change since last commit',
                trend_direction: null,
                trend_value: null,
                trend_positive: true
              }
            }
          }
        }
      }
    })
  }

  const stubs = {
    CustomizeWidgetsModal: true,
    Portal: true,
    StatCard: true,
    ZIcon: true
  }

  test('renders the issue overview widgets', () => {
    const { html } = render(
      IssueOverviewCards,
      {
        components: { StatSection },
        mocks,
        store: storeMock,
        stubs
      },
      (vue) => {
        vue.directive('tooltip', TooltipDirective)
      }
    )

    expect(html()).toMatchSnapshot()
  })
})
