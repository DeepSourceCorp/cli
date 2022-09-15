import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'

import { Menu } from 'floating-vue'
import FloatingButtonMobile from '~/components/Common/FloatingButtonMobile.vue'

interface IFloatingButton extends Vue {
  // Computed properties
  currentSelection: string

  // Methods
  onShow: () => void
  onHide: () => void
}

const baseProps = {
  navItems: [
    {
      label: 'OWASP Top 10',
      routePath: '/gh/deepsourcelabs/reports/owasp-top-10',
      separator: false
    },
    {
      label: 'SANS Top 25',
      routePath: '/gh/deepsourcelabs/reports/sans-top-25',
      separator: false
    },
    {
      label: 'Issue Distribution',
      routePath: '/gh/deepsourcelabs/reports/issue-distribution',
      separator: false
    },
    {
      label: 'Public Reports',
      routePath: '/gh/deepsourcelabs/reports/public-reports',
      separator: true
    }
  ]
}

const mocks = {
  $route: {
    name: 'provider-owner-reports-owasp-top-10',
    path: '/gh/deepsourcelabs/reports/owasp-top-10'
  }
}

const stubs = {
  portal: true,
  NuxtLink: RouterLinkStub,
  ZButton: true,
  ZDivider: true,
  ZIcon: true
}

describe('[[ FloatingButtonMobile ]]', () => {
  afterEach(() => jest.resetAllMocks())

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (options = {}) => {
    const { vm } = shallowMount(FloatingButtonMobile, {
      components: { Menu },
      propsData: {
        ...baseProps
      },
      mocks,
      stubs,
      ...options
    })

    return vm as IFloatingButton
  }

  test('renders a floating action button', () => {
    const { html } = render(FloatingButtonMobile, {
      components: { Menu },
      propsData: { ...baseProps },
      mocks,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('`currentSelection` finds the entry based on `$route.path`', () => {
    const instance = getInstance()

    expect(instance.currentSelection).toBe('OWASP Top 10')
  })

  test('`currentSelection` works with dynamic sub routes', () => {
    const instance = getInstance({
      propsData: {
        navItems: [
          {
            label: 'Documentation Coverage',
            routePath: '/gh/deepsourcelabs/demo-python/metrics/DCV'
          },
          {
            label: 'External Dependencies',
            routePath: '/gh/deepsourcelabs/demo-python/metrics/DDP'
          }
        ]
      },
      mocks: {
        $route: {
          path: '/gh/deepsourcelabs/demo-python/metrics/DCV'
        }
      }
    })

    expect(instance.currentSelection).toBe('Documentation Coverage')
  })

  test('`onShow` method adds the `overflow-hidden` class to the document body', () => {
    // Create a mock function
    document.body.classList.add = jest.fn()

    const instance = getInstance()

    // Invoke `onShow` method
    instance.onShow()

    // Assertion
    expect(document.body.classList.add).toBeCalledWith('overflow-hidden')
  })

  test('`onHide` method removes the `overflow-hidden` class from the document body', () => {
    // Create a mock function
    document.body.classList.remove = jest.fn()

    const instance = getInstance()

    // Invoke `onHide` method
    instance.onHide()

    // Assertion
    expect(document.body.classList.remove).toBeCalledWith('overflow-hidden')
  })
})
