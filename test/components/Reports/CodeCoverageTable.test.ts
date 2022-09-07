import { render } from '@testing-library/vue'
import { CodeCoverageTable } from '~/components/Reports'
import { RouterLinkStub } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { mocksGenerator } from '~/test/mocks'
import { cartesian, generateBooleanProps } from '~/test/utils'

test('renders CodeCoverageTable with all prop options', () => {
  const baseProps = {
    repoCoverageList: [
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6cXdwZ3o=',
        name: 'bob-cli',
        lcvValue: 72.12,
        lcvIsPassing: false,
        bcvValue: 86,
        bcvIsPassing: true
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6d2phcGI=',
        name: 'demo-go',
        lcvValue: 72.12,
        lcvIsPassing: false,
        bcvValue: 72.12,
        bcvIsPassing: false
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6anBnbHo=',
        name: 'marvin-test-coverage',
        lcvValue: 62,
        lcvIsPassing: true,
        bcvValue: 80,
        bcvIsPassing: true
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6dmp2eXo=',
        name: 'asgard',
        lcvValue: 45,
        lcvIsPassing: null,
        bcvValue: 60.8,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6ZXBqZWI=',
        name: 'demo-python',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6dmpleXo=',
        name: 'marvin-docker',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTpib3BtZXo=',
        name: 'git-label-packages',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      },
      {
        id: 'UmVwb3NpdG9yeUNvdmVyYWdlUmVwb3J0SXRlbTp6Z2tlZHo=',
        name: 'beacon-py',
        lcvValue: null,
        lcvIsPassing: null,
        bcvValue: null,
        bcvIsPassing: null
      }
    ]
  }

  const linkedRowsOptions = generateBooleanProps('linkedRows', false)

  cartesian(linkedRowsOptions).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination
    }

    const { html } = render(
      CodeCoverageTable,
      {
        props,
        stubs: {
          CodeCoverageSort: true,
          CodeCoverageTableCell: true,
          NuxtLink: RouterLinkStub
        },
        mocks: mocksGenerator()
      },
      (vue) => vue.use(VTooltip)
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
