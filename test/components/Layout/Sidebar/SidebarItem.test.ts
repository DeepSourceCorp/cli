import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import SidebarItem from '~/components/Layout/Sidebar/SidebarItem.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

test('renders SidebarItem with all props', () => {
  const iconOptions = generateStringProps('icon', ['support'])
  const iconColorOptions = generateStringProps('iconColor', ['vanilla-100'])
  const activeOption = generateBooleanProps('active')
  const showCollapsedOptions = generateBooleanProps('isCollapsed')
  const toOptions = generateStringProps('to', ['/hello', 'https://example.com', 'mailto:'])

  cartesian(iconOptions, iconColorOptions, activeOption, showCollapsedOptions, toOptions).forEach(
    (propCombination) => {
      const { html } = render(SidebarItem, {
        props: propCombination,
        stubs: {
          NuxtLink: RouterLinkStub,
          ZIcon: true
        }
      })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    }
  )
})

test('SidebarItem toggles on collapsible', async () => {
  const title = 'THIS_SHOULD_BE_HIDDEN_ON_COLLAPSED'
  const { getByText, updateProps } = render(SidebarItem, {
    slots: {
      default: title
    },
    props: { isCollapsed: false, icon: 'support' }
  })

  expect(getByText(title)).toBeVisible()

  await updateProps({ isCollapsed: true })
  expect(getByText(title)).not.toBeVisible()
})
