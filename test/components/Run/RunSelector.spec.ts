import { render } from '@testing-library/vue'

import RunSelector from '~/components/Run/RunSelector.vue'
import { mockRunList } from '~/test/store/run/__mocks__/runList.mock'
import { resolveNodes } from '~/utils/array'

test("renders 'RunSelector' with all prop options", () => {
  const props = {
    branchRuns: resolveNodes(mockRunList())
  }

  const { html } = render(RunSelector, {
    props,
    stubs: {
      ZIcon: true,
      ZMenu: true,
      ZMenuItem: true,
      ZMenuSection: true
    },
    mocks: {
      $generateRoute: () => '/gh/deepsourcelabs/bifr/run/ajsidjioadjoiawjd'
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
