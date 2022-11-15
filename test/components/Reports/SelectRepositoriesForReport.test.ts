import { render } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { SelectRepositoriesForReport } from '~/components/Reports'
import { mocksGenerator } from '~/test/mocks'
import { SourceableRepository } from '~/types/types'

interface SelectRepositoriesForReportT extends Vue {
  selectedRepos: Array<string>
  unSelectedRepos: Array<string>
  repoList: Array<SourceableRepository>
  repoListLoading: boolean
  query: string
  perPageCount: number
  scrollTopVisible: boolean
  currentPage: number

  showMore: () => void
  handleSearch: () => void
  handleCheckboxSelection: (newSelectedRepos: Array<string>) => void
  alreadySelectedRepos: (newRepoList: Array<SourceableRepository>) => Array<string>
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

const data = function () {
  return {
    repoList: [
      {
        id: 'UmVwb3NpdG9yeTp6d2phcGI=',
        name: 'demo-go',
        ownerLogin: 'deepsourcelabs'
      },
      {
        id: 'UmVwb3NpdG9yeTp6dmpleXo=',
        name: 'marvin-docker',
        ownerLogin: 'deepsourcelabs'
      },
      {
        id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
        name: 'asgard',
        ownerLogin: 'deepsourcelabs'
      },
      {
        id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
        name: 'demo-python',
        ownerLogin: 'deepsourcelabs'
      }
    ]
  }
}

const props = {
  ownerLogin: 'deepsourcelabs',
  vcsProvider: 'gh',
  editMode: false
}

describe('[[ render SelectRepositoriesForReport ]]', () => {
  test('renders SelectRepositoriesForReport with all prop options', () => {
    const { html } = render(SelectRepositoriesForReport, {
      props,
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks,
      data
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

describe('[[ render SelectRepositoriesForReport ]]', () => {
  test('showMore', () => {
    const $fetch = jest.fn()

    const wrapper = mount(SelectRepositoriesForReport, {
      propsData: props,
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks: {
        ...mocks,
        $fetch
      },
      data
    })

    const vm = wrapper.vm as SelectRepositoriesForReportT

    // check default value
    expect(vm.currentPage).toBe(1)

    vm.showMore()

    // check final value
    expect(vm.currentPage).toBe(2)

    // check $fetch is called
    expect($fetch).toBeCalled()
  })

  test('handleSearch', () => {
    const $fetch = jest.fn()

    const wrapper = mount(SelectRepositoriesForReport, {
      propsData: props,
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks: {
        ...mocks,
        $fetch
      },
      data
    })

    const vm = wrapper.vm as SelectRepositoriesForReportT

    // Need to test if handleSearch resets pagination
    vm.currentPage = 3

    // check default value
    expect(vm.currentPage).toBe(3)
    expect(vm.repoList.length).toBe(data().repoList.length)

    vm.handleSearch()

    // check final value
    expect(vm.currentPage).toBe(1)
    expect(vm.repoList.length).toBe(0)

    // check $fetch is called
    expect($fetch).toBeCalled()
  })

  test('handleCheckboxSelection', () => {
    const wrapper = mount(SelectRepositoriesForReport, {
      propsData: props,
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks,
      data
    })

    const vm = wrapper.vm as SelectRepositoriesForReportT

    vm.selectedRepos = ['abc', 'def', 'ghi']
    vm.unSelectedRepos = ['xyz']

    // ————— Removing repo id abc from selection —————
    vm.handleCheckboxSelection(['def', 'ghi'])

    expect(vm.selectedRepos).toStrictEqual(['def', 'ghi'])
    expect(vm.unSelectedRepos).toStrictEqual(['xyz', 'abc'])

    // test emitted event
    expect(wrapper.emitted('remove-repo')).toStrictEqual([[['abc']]])

    // ————— Adding xyz back to selected repos —————
    vm.handleCheckboxSelection(['def', 'ghi', 'xyz'])

    expect(vm.selectedRepos).toStrictEqual(['def', 'ghi', 'xyz'])
    expect(vm.unSelectedRepos).toStrictEqual(['abc'])

    // test emitted event
    expect(wrapper.emitted('add-repo')).toStrictEqual([[['xyz']]])
  })

  test('alreadySelectedRepos if not editMode', () => {
    const wrapper = mount(SelectRepositoriesForReport, {
      propsData: props,
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks,
      data
    })

    const vm = wrapper.vm as SelectRepositoriesForReportT

    const repos = vm.alreadySelectedRepos([
      {
        id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
        name: 'asgard',
        ownerLogin: 'deepsourcelabs',
        isSourced: true
      },
      {
        id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
        name: 'demo-python',
        ownerLogin: 'deepsourcelabs',
        isSourced: false
      }
    ])

    expect(repos).toStrictEqual([])
  })

  test('alreadySelectedRepos if not editMode', () => {
    const wrapper = mount(SelectRepositoriesForReport, {
      propsData: { ...props, editMode: true },
      stubs: {
        ZPagination: true,
        ZInput: true,
        ZIcon: true,
        ZCheckbox: true
      },
      mocks,
      data
    })

    const vm = wrapper.vm as SelectRepositoriesForReportT

    // unselecting demo go
    vm.unSelectedRepos = ['UmVwb3NpdG9yeTp6d2phcGI=']

    const repos = vm.alreadySelectedRepos([
      {
        id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
        name: 'asgard',
        ownerLogin: 'deepsourcelabs',
        isSourced: true
      },
      {
        id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
        name: 'demo-python',
        ownerLogin: 'deepsourcelabs',
        isSourced: false
      },
      {
        id: 'UmVwb3NpdG9yeTp6d2phcGI=',
        name: 'demo-go',
        ownerLogin: 'deepsourcelabs',
        isSourced: true
      }
    ])

    // only repo which has isSourced === true and is not present in unSelectedRepos will be returned
    expect(repos).toStrictEqual(['UmVwb3NpdG9yeTp6dmp2eXo='])
  })
})
