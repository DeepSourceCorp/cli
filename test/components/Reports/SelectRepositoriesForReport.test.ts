import { render } from '@testing-library/vue'
import { SelectRepositoriesForReport } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'

test('renders OccurrenceTags with all prop options', () => {
  const props = {
    selectedRepos: []
  }

  const mocks = {
    ...mocksGenerator(),
    $fetchGraphqlData() {
      return {
        data: {
          owner: {
            id: 'T3duZXI6cXpscnh6',
            repositories: {
              totalCount: 4,
              edges: [
                {
                  node: {
                    id: 'UmVwb3NpdG9yeTp6d2phcGI=',
                    name: 'demo-go',
                    ownerLogin: 'deepsourcelabs'
                  }
                },
                {
                  node: {
                    id: 'UmVwb3NpdG9yeTp6dmpleXo=',
                    name: 'marvin-docker',
                    ownerLogin: 'deepsourcelabs'
                  }
                },
                {
                  node: {
                    id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
                    name: 'asgard',
                    ownerLogin: 'deepsourcelabs'
                  }
                },
                {
                  node: {
                    id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
                    name: 'demo-python',
                    ownerLogin: 'deepsourcelabs'
                  }
                }
              ]
            }
          }
        }
      }
    }
  }

  const { html } = render(SelectRepositoriesForReport, {
    props,
    stubs: {
      ZPagination: true,
      ZInput: true,
      ZIcon: true,
      ZCheckbox: true
    },
    mocks
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
