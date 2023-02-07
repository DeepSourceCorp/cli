import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import ActivateSingleRepo from '~/components/AddRepo/ActivateSingleRepo.vue'

import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

describe('[[ ActivateSingleRepo ]]', () => {
  const baseProps = {
    analyzerShortcode: 'test-analyzer',
    transformerShortcode: 'test-transformer'
  }

  const mocks = mocksGenerator({
    fetchReposToActivate: jest.fn(),
    fetchAppConfig: jest.fn()
  })

  const storeMock = {
    modules: storeModulesGenerator()
  }

  const stubs = {
    LazyEmptyState: true,
    RepoCard: true,
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZPagination: true,
    ZTabPane: true,
    SyncRepoAlert: true
  }

  test('renders an input widget with a list of repositories that can be activated', () => {
    const { html } = render(ActivateSingleRepo, {
      data() {
        return {
          reposToActivateList: [
            {
              id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
              name: 'asgard',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isPrivate: true,
              isStarred: false,
              latestCommitOid: 'a8935a7125356db4cff400415f7061b2e5491591',
              defaultBranchName: 'master',
              lastAnalyzedAt: '2020-07-09T08:56:51.012793+00:00',
              supportedAnalyzers: ['python', 'docker', 'javascript']
            },
            {
              id: 'UmVwb3NpdG9yeTp6a2V4cno=',
              name: 'marvin',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isPrivate: true,
              isStarred: false,
              latestCommitOid: 'fc773cf6b1b0c2f5d3bef0ad78eaf8f3c991cdf5',
              defaultBranchName: 'master',
              lastAnalyzedAt: '2020-06-10T10:21:17.241934+00:00',
              supportedAnalyzers: ['go', 'python', 'docker']
            },
            {
              id: 'UmVwb3NpdG9yeTp6bXh2eWI=',
              name: 'marvin-go',
              vcsProvider: 'GITHUB',
              ownerLogin: 'deepsourcelabs',
              isPrivate: true,
              isStarred: false,
              latestCommitOid: '211d079e3b315af822c0eaddc5668df5ac270b96',
              defaultBranchName: 'master',
              lastAnalyzedAt: '2020-06-09T08:39:31.291147+00:00',
              supportedAnalyzers: ['go', 'docker']
            }
          ]
        }
      },
      directives: { focus: {} },
      mocks,
      propsData: baseProps,
      store: storeMock,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('renders an input widget with an empty state if there are no repositories that can be activated', () => {
    const { html } = render(ActivateSingleRepo, {
      data() {
        return {
          reposToActivateList: []
        }
      },
      directives: { focus: {} },
      mocks,
      propsData: baseProps,
      store: storeMock,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
