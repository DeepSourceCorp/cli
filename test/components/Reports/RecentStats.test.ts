import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'
import { RecentStats } from '~/components/Reports'
import { TrendDirection } from '~/types/types'

interface RecentStatsT extends Vue {
  direction: (trendDirection: TrendDirection) => string
  smartTrendValue: (trendValue: number, statValue: number) => string
}

const props = {
  currentVal: 1,
  stats: [
    {
      statLabel: '1 Month Ago',
      statValue: 17,
      trendValue: 16,
      trendDirection: 'DOWN',
      trendPositive: true
    },
    {
      statLabel: '3 Months Ago',
      statValue: 4,
      trendValue: 3,
      trendDirection: 'DOWN',
      trendPositive: true
    },
    {
      statLabel: '6 Months Ago',
      statValue: 0,
      trendValue: 100,
      trendDirection: 'DOWN',
      trendPositive: true
    },
    {
      statLabel: '12 Months Ago',
      statValue: null,
      trendValue: null,
      trendDirection: 'DOWN',
      trendPositive: true
    }
  ]
}

describe('[[ RecentStats ]]', () => {
  test('renders RecentStats with all prop options', () => {
    const { html } = render(RecentStats, {
      props,
      stubs: {
        Ticker: true
      }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })

  test('direction method returns correct values', () => {
    const { vm } = shallowMount(RecentStats, {
      propsData: props,
      stubs: {
        Ticker: true
      }
    })

    expect((vm as RecentStatsT).direction(TrendDirection.Up)).toStrictEqual('up')
    expect((vm as RecentStatsT).direction(TrendDirection.Down)).toStrictEqual('down')
  })

  test('smartTrendValues returns correct values', () => {
    const { vm } = shallowMount(RecentStats, {
      propsData: props,
      stubs: {
        Ticker: true
      }
    })

    const testArray = Array.from(Array(5000).keys())

    const resultArray = testArray.map((ii) => (vm as RecentStatsT).smartTrendValue(ii, 100))

    // take snapshot of values 0 to 5000
    expect(resultArray).toMatchSnapshot(resultArray)

    // test if statValue 0 it returns empty string
    expect((vm as RecentStatsT).smartTrendValue(5, 0)).toStrictEqual('')
  })
})
