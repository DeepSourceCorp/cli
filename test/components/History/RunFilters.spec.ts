import { render } from '@testing-library/vue'
import RunFilters from '~/components/History/Runs/RunFilters.vue'
import VTooltip from 'v-tooltip'
import { mocksGenerator } from '~/test/mocks'
import { PrStateChoices, RunStatus } from '~/types/types'
import { cartesian, generateBooleanProps } from '~/test/utils'

const generateProps = (overrides = {}) => {
  const base = {
    openCount: 20,
    closedCount: 30,
    prStatus: PrStateChoices.Open,
    runStatus: RunStatus.Timo,
    searchText: 'lol'
  }
  return Object.assign(base, overrides)
}

test('renders RunFilters with all prop options', () => {
  const loadingProp = generateBooleanProps('loading')

  cartesian(loadingProp).forEach((propCombos) => {
    const { html } = render(
      RunFilters,
      {
        props: generateProps(propCombos),
        stubs: {
          ZRadioGroup: true,
          ZRadioButton: true,
          ZIcon: true,
          ZMenu: true,
          ZMenuItem: true,
          ZButton: true,
          ZInput: true,
          ZBadge: true
        },
        mocks: mocksGenerator()
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot('RunCard')
  })
})
