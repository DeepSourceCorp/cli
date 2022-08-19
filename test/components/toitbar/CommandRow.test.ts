import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import CommandRow from '~/components/ToitBar/CommandRow.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

test('renders CommandRow with all prop options', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const store = new Vuex.Store({
    modules: {
      'account/context': {
        namespaced: true,
        state: {
          context: {
            emptyAvatarUrl: 'hello-world'
          }
        }
      }
    }
  })

  const label = generateStringProps('label', ['hello', ''], false)
  const labelHTML = generateStringProps('labelHTML', ['<b>hello</b>', ''], false)
  const icon = generateStringProps('icon', ['arrow-up', ''], false)
  const active = generateBooleanProps('active', false)
  const image = generateStringProps('image', ['https://deepsource.io/example.png', ''], false)
  const shortkey = generateStringProps('shortkey', ['Alt+KeyO', ''], false)
  const hint = generateStringProps('hint', ['hint', ''], false)

  cartesian(label, labelHTML, icon, active, image, shortkey, hint).forEach((propCombination) => {
    const { html } = render(CommandRow, {
      props: propCombination,
      stubs: {
        ZAvatar: true,
        ZIcon: true
      },
      store
    })

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
