import { render } from '@testing-library/vue'

import EmptyPinnedCodeCoverageTable from '~/components/Reports/EmptyPinnedCodeCoverageTable.vue'

describe('[[ EmptyPinnedCodeCoverageTable ]]', () => {
  const stubs = { CodeCoverageTable: true }

  test('renders the empty state for pinned code coverage widget empty', () => {
    const { html } = render(EmptyPinnedCodeCoverageTable, { stubs })

    expect(html()).toMatchSnapshot()
  })
})
