import { render } from '@testing-library/vue'

import MonorepoOverview from '~/components/Monorepo/MonorepoOverview.vue'

import { focusDirective } from '~/plugins/helpers/directives.client'

import { cartesian, generateBooleanProps } from '~/test/utils'
import { RepositoryKindChoices, VcsProviderChoices } from '~/types/types'

describe('[[ MonorepoOverview ]]', () => {
  const baseProps = {
    currentPage: 1,
    totalPageCount: 10,
    searchQuery: '',
    showAddSubRepositoryCta: false,
    subRepositoryList: Array.from({ length: 10 }).map((_, idx) => ({
      id: `test-id-${idx + 1}`,
      name: `sub-repository-${idx + 1}`,
      vcsProvider: VcsProviderChoices.Github,
      isActivated: idx > 5,
      isPrivate: idx < 5,
      latestCommitOid: `test-commit-oid-${idx + 1}`,
      defaultBranchName: idx > 5 ? 'master' : 'main',
      lastAnalyzedAt: '2022-11-20T00:00:00+05:30',
      kind: RepositoryKindChoices.Subrepo
    })),
    ownerLogin: 'deepsourcelabs'
  }

  const stubs = {
    LazyEmptyState: true,
    RepoCard: true,
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZPagination: true
  }

  test('renders different states based on the `loading` and `showAddSubRepositoryCta` prop combinations', () => {
    const loadingOptions = generateBooleanProps('loading', false)
    const showAddSubRepositoryCtaOptions = generateBooleanProps('showAddSubRepositoryCta', false)

    cartesian(loadingOptions, showAddSubRepositoryCtaOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(MonorepoOverview, {
        propsData,
        stubs
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  describe('Empty states', () => {
    test('search query that does not yield a result', () => {
      const propsData = {
        ...baseProps,
        searchQuery: 'test',
        subRepositoryList: []
      }

      const { html } = render(MonorepoOverview, {
        propsData,
        stubs
      })

      expect(html()).toMatchSnapshot()
    })

    test('no activated sub-repositories', () => {
      const propsData = {
        ...baseProps,
        subRepositoryList: []
      }

      const { html } = render(
        MonorepoOverview,
        {
          propsData,
          stubs
        },
        (vue) => {
          vue.directive('focus', focusDirective)
        }
      )

      expect(html()).toMatchSnapshot()
    })
  })
})
