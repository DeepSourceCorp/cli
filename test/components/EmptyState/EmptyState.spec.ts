import { render } from '@testing-library/vue'
import EmptyState from '~/components/Common/EmptyState.vue'
import { mocksGenerator } from '~/test/mocks'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

const generateProps = (overrides = {}) => {
  const base = {
    title: 'No data found',
    subtitle: 'No data found here'
  }
  return Object.assign(base, overrides)
}

test('renders EmptyState with all prop options', () => {
  const useV2Options = generateBooleanProps('useV2', false)
  const showBorderOptions = generateBooleanProps('showBorder', false)
  const showShadowOptions = generateBooleanProps('showShadow', false)

  cartesian(useV2Options, showBorderOptions, showShadowOptions).forEach((propCombination) => {
    const { html } = render(EmptyState, {
      props: generateProps(propCombination),
      stubs: { EmptyStatePicture: true },
      mocks: mocksGenerator()
    })

    expect(html()).toMatchSnapshot('EmptyState')
  })
})

test('renders EmptyState with all slot options', () => {
  const { html } = render(EmptyState, {
    props: generateProps(),
    stubs: { EmptyStatePicture: true },
    mocks: mocksGenerator(),
    slots: {
      title: 'This is the title slot',
      subtitle: 'This is the subtitle slot',
      action: 'This is the action slot'
    }
  })

  expect(html()).toMatchSnapshot('EmptyState')
})
