import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { IssueListActions } from '~/store/issue/list'
import { RepositoryIssueConnection } from '~/types/types'

const issueListStore = namespace('issue/list')

export interface IssueLink {
  to: string
  label: string
}

@Component
export default class IssueListMixin extends Vue {
  @issueListStore.State
  issueList!: RepositoryIssueConnection

  @issueListStore.State
  issueListLoading!: boolean

  @issueListStore.Action(IssueListActions.FETCH_ISSUE_LIST)
  fetchIssueList: (args: {
    provider: string
    owner: string
    name: string
    limit: number
    currentPageNumber?: number
    issueType?: string
    product?: string
    analyzer?: string
    sort?: string
    q?: string
    autofixAvailable?: boolean
    all?: boolean
    recommended?: boolean
    auditRequired?: boolean
    refetch?: boolean
  }) => Promise<void>
}
