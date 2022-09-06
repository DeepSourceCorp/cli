import { render } from '@testing-library/vue'
import EmptyStatePicture from '~/components/Common/EmptyStatePicture.vue'
import { mocksGenerator } from '~/test/mocks'
import { cartesian, generateStringProps } from '~/test/utils'

const generateProps = (overrides = {}) => {
  const base = {
    pngImagePath: '~/assets/test.png'
  }
  return Object.assign(base, overrides)
}

test('renders EmptyStatePicture with all prop options', () => {
  const webpImagePathOptions = generateStringProps('webpImagePath', ['', '~/assets/test.webp'])
  const svgImagePathOptions = generateStringProps('svgImagePath', ['', '~/assets/test.svg'])
  const imageWidthOptions = generateStringProps('width', ['w-full'], false)
  const altTextOptions = generateStringProps('altText', ['Needs test cov'], false)

  cartesian(webpImagePathOptions, svgImagePathOptions, imageWidthOptions, altTextOptions).forEach(
    (propCombination) => {
      const { html } = render(EmptyStatePicture, {
        props: generateProps(propCombination),
        mocks: mocksGenerator()
      })

      expect(html()).toMatchSnapshot('EmptyStatePicture')
    }
  )
})
