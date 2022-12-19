import { render } from '@testing-library/vue'
import { IgnoredRule } from '~/components/Repository'
import { BaseCard } from '~/components/History'
import { ZIcon, ZButton } from '@deepsource/zeal'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { RouterLinkStub } from '@vue/test-utils'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders IgnoredRule with all prop options', () => {
  const props = {
    rule: {
      silenceLevel: 'RL',
      id: 'U2lsZW5jZVJ1bGU6eXp5bHZi',
      filePath: null,
      createdAt: '2022-03-14T11:50:48.350324+00:00',
      metadata: { type: 'test-pattern' },
      issue: {
        shortcode: 'PYL-W0621',
        title: 'Re-defined variable from outer scope',
        analyzer: { shortcode: 'python' }
      },
      creator: {
        firstName: 'Vaibhav',
        lastName: '',
        email: 'vaibhav@deepsource.io',
        avatar: '/static/dashboard/images/empty-avatar.svg'
      }
    },
    verticalPadding: 'pb-4'
  }

  const mocks = {
    $route: {
      query: ''
    },
    viewer: {},
    $config: { onPrem: false },
    $socket: {
      $on: () => {},
      $off: () => {}
    },
    async $fetchGraphqlData() {}
  }

  const { html } = render(
    IgnoredRule,
    {
      props,
      mocks,
      stubs: {
        NuxtLink: RouterLinkStub,
        BaseCard: BaseCard,
        ZIcon: true,
        ZButton: true
      },
      computed: {
        allowDelete() {
          return true
        },
        ruleCreatedTime() {
          return '30 minutes ago'
        }
      }
    },
    injectDirective
  )

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
