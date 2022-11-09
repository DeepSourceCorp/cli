import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { RepoListActions } from '~/store/repository/list'
import { Repository, RepositoryConnection } from '~/types/types'

const repoListStore = namespace('repository/list')

@Component
export default class RepoListMixin extends Vue {
  @repoListStore.State
  repositoryList: RepositoryConnection

  @repoListStore.State
  newRepos: RepositoryConnection

  @repoListStore.State
  repoWithActiveAnalysis: Repository[]

  @repoListStore.State
  repoWithActiveAnalysisWithAnalyzers: Repository[]

  @repoListStore.State
  repoWithPendingAdhocRuns: Repository[]

  @repoListStore.State
  loading: boolean

  @repoListStore.Action(RepoListActions.FETCH_REPOSITORY_LIST)
  fetchRepoList: (args: {
    login: string
    provider: string
    limit: number
    currentPageNumber: number
    query: string | null
    refetch?: boolean
  }) => Promise<void>

  @repoListStore.Action(RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST)
  fetchPendingAdHocRepoList: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>

  @repoListStore.Action(RepoListActions.FETCH_NEW_REPOSITORY_LIST)
  fetchNewRepoList: (args: {
    login: string
    provider: string
    limit: number
    currentPageNumber: number
    query: string | null
  }) => Promise<void>

  @repoListStore.Action(RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST)
  fetchActiveAnalysisRepoList: (params: {
    login: string
    provider: string
    limit: number
    refetch?: boolean
  }) => Promise<void>

  @repoListStore.Action(RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS)
  fetchActiveAnalysisRepoListWithAnalyzers: (params: {
    login: string
    provider: string
    limit: number
    refetch?: boolean
  }) => Promise<void>
}
