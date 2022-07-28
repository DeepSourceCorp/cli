import { render } from '@testing-library/vue'
import { TrendSection, TrendStat, TrendTitle } from '~/components/Metrics'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { MetricType } from '~/types/metric'
import { cartesian, generateGenericProps } from '~/test/utils'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders TrendSection with all prop options', () => {
  const baseProps = {
    filterValue: 30
  }

  const getMetricBase = () => ({
    shortcode: 'DftPnk',
    name: 'Daft Punk'
  })

  const nonPercentageMetric = { ...getMetricBase(), unit: '' }
  const percentageMetric = { ...getMetricBase(), unit: '%' }

  const genericNamespace = {
    key: 'javascript',
    valueTrend: {
      labels: [
        '2022-05-30T12:44:02.022478+00:00',
        '2022-06-01T12:44:02.022478+00:00',
        '2022-06-02T12:44:02.022478+00:00',
        '2022-06-03T12:44:02.022478+00:00',
        '2022-05-28T12:44:02.022478+00:00',
        '2022-05-31T12:44:02.022478+00:00',
        '2022-05-29T12:44:02.022478+00:00',
        '2022-06-04T12:44:02.022478+00:00',
        '2022-06-05T12:44:02.022478+00:00',
        '2022-06-07T12:44:02.022478+00:00',
        '2022-06-06T12:44:02.022478+00:00'
      ],
      values: [84, 68, 78, 55, 94, 51, 58, 82, 90, 68, 85]
    },
    isPassing: true,
    valueDisplay: '85%',
    analyzerShortcode: 'javascript',
    analyzerLogo:
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg',
    threshold: 50
  }

  const aggregateNamespace = {
    key: MetricType.aggregate,
    valueTrend: {
      labels: [
        '2022-05-30T12:44:02.022478+00:00',
        '2022-06-01T12:44:02.022478+00:00',
        '2022-06-02T12:44:02.022478+00:00',
        '2022-06-03T12:44:02.022478+00:00',
        '2022-05-28T12:44:02.022478+00:00',
        '2022-05-31T12:44:02.022478+00:00',
        '2022-05-29T12:44:02.022478+00:00',
        '2022-06-04T12:44:02.022478+00:00',
        '2022-06-05T12:44:02.022478+00:00',
        '2022-06-07T12:44:02.022478+00:00',
        '2022-06-06T12:44:02.022478+00:00'
      ],
      values: [84, 68, 78, 55, 94, 51, 58, 82, 90, 68, 85]
    },
    isPassing: true,
    valueDisplay: '85%',
    analyzerShortcode: 'javascript',
    analyzerLogo:
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg',
    threshold: 50
  }

  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))

  const namespaceProp = generateGenericProps(
    'namespacesTrend',
    [aggregateNamespace, genericNamespace],
    false
  )

  const metricProp = generateGenericProps(
    'metricMeta',
    [nonPercentageMetric, percentageMetric],
    false
  )

  cartesian(namespaceProp, metricProp).forEach((propCombinations) => {
    const props = { ...baseProps, ...propCombinations }

    const { html } = render(
      TrendSection,
      {
        props,
        stubs: {
          AnalyzerLogo: true,
          ZChart: true
        },
        components: { TrendStat, TrendTitle }
      },
      injectDirective
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})