import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'
import { render } from '@testing-library/vue'
import { RunMetricCard } from '~/components/Run'
import { RouterLinkStub } from '@vue/test-utils'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'
import { mockRepositoryDetail } from '~/test/store/repository/__mocks__/detail.mock'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders RunMetricCard with all prop options', () => {
  const repositoryPropCombos = generateBooleanProps('can_ignore_failing_metrics').map(
    (propState) => ({
      repository: {
        ...mockRepositoryDetail(),
        userPermissionMeta: { ...propState }
      }
    })
  )

  const baseMetricsCaptured = {
    id: 'UmVwb3NpdG9yeU1ldHJpY1ZhbHVlOmJ4anhnYQ==',
    name: 'Line coverage',
    shortcode: 'LCV',
    value: 53,
    valueDisplay: '53%',
    extraData: '{}',
    namespace: {
      key: 'python',
      analyzer_shortcode: 'python',
      analyzer_logo:
        'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg'
    }
  }

  const isPassingPropCombo = generateBooleanProps('isPassing')
  const isSuppressedPropCombo = generateBooleanProps('isSuppressed', false)
  const thresholdPropCombo = generateGenericProps('threshold', [50, 80, 53])
  const valueTrendDisplayPropCombo = generateGenericProps(
    'valueTrendDisplay',
    ['Up 50%', 'Down 20%', 'Up 30', 'Down 70'],
    false
  )
  const isInModalPropCombo = generateBooleanProps('isInModal')
  const canSuppressMetricPropCombo = generateBooleanProps('canSuppressMetric')

  cartesian(
    repositoryPropCombos,
    isPassingPropCombo,
    isSuppressedPropCombo,
    thresholdPropCombo,
    valueTrendDisplayPropCombo,
    isInModalPropCombo
  ).forEach((propCombination) => {
    const localVue = createLocalVue()
    localVue.use(Vuex)

    const props = {
      metricsCaptured: [
        {
          ...baseMetricsCaptured,
          isPassing: propCombination.isPassing,
          isSuppressed: propCombination.isSuppressed,
          threshold: propCombination.threshold,
          valueTrendDisplay: propCombination.valueTrendDisplay
        }
      ],
      isInModal: propCombination.isInModal,
      canSuppressMetric: propCombination.canSuppressMetric
    }

    const { html } = render(
      RunMetricCard,
      {
        props,
        stubs: {
          NuxtLink: RouterLinkStub,
          Ticker: true,
          ZTag: true,
          ZButton: true,
          LazyAnalyzerLogo: true
        },
        store: new Vuex.Store({
          modules: {
            'repository/detail': {
              namespaced: true,
              state: {
                repository: propCombination.repository
              }
            }
          }
        })
      },
      injectDirective
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
