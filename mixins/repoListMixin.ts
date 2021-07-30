import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { RepoListActions } from '~/store/repository/list'
import { RepositoryConnection } from '~/types/types'

const repoListStore = namespace('repository/list')

@Component
export default class IssueListMixin extends Vue {
  @repoListStore.State
  repositoryList: RepositoryConnection

  @repoListStore.State
  repoWithActiveAnalysis: RepositoryConnection

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

  @repoListStore.Action(RepoListActions.FETCH_ACTIVE_ANALYSIS_REPOSITORY_LIST)
  fetchActiveAnalysisRepoList: (params: {
    login: string
    provider: string
    limit: number
    refetch?: boolean
  }) => Promise<void>
}
