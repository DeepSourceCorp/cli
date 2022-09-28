import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import SupportMenu from '~/components/Layout/Sidebar/SupportMenu.vue'
import SidebarItem from '~/components/Layout/Sidebar/SidebarItem.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

test('renders SupportMenu with all props', () => {
  const showBorderOptions = generateBooleanProps('isCollapsed')

  cartesian(showBorderOptions).forEach((propCombination) => {
    const { html } = render(SupportMenu, {
      props: propCombination,
      stubs: {
        SidebarItem: true,
        ZMenu: true,
        ZMenuItem: true,
        ZMenuSection: true
      }
    })
    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})

test('Support Menu title toggles on collapsible', async () => {
  const title = 'Help and support'
  const { getByText, updateProps } = render(SupportMenu, {
    slots: {
      default: title
    },
    stubs: {
      SidebarItem
    },
    props: { isCollapsed: false }
  })

  expect(getByText(title)).toBeVisible()

  await updateProps({ isCollapsed: true })
  expect(getByText(title)).not.toBeVisible()
})
