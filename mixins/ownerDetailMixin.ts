import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { OwnerDetailActions } from '~/store/owner/detail'

import { Owner, IssueTypeSetting } from '~/types/types'

const ownerDetailStore = namespace('owner/detail')

@Component
export default class OwnerDetailMixin extends Vue {
  @ownerDetailStore.State
  owner: Owner

  @ownerDetailStore.State('loading')
  ownerStoreLoading: boolean

  @ownerDetailStore.State('error')
  ownerStoreError: Error

  @ownerDetailStore.Action(OwnerDetailActions.SET_ISSUE_TYPE_SETTING)
  setIssueTypeSettings: (args: {
    isIgnoredInCheckStatus: IssueTypeSetting['isIgnoredInCheckStatus']
    isIgnoredToDisplay: IssueTypeSetting['isIgnoredToDisplay']
    issueTypeSettingSlug: string
  }) => void

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_OWNER_DETAILS)
  fetchOwnerDetails: (args: { login: string; provider: string; refetch?: boolean }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS)
  fetchIssueTypeSettings: (args: { login: string; provider: string }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_ISSUE_TRENDS)
  fetchIssueTrends: (args: {
    login: string
    provider: string
    lastDays: number | null
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_AUTOFIX_TRENDS)
  fetchAutofixTrends: (args: {
    login: string
    provider: string
    lastDays: number | null
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS)
  fetchAccountSetupStatus: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS)
  submitIssueTypeSettings: (args: {
    login: string
    provider: string
    preferences: IssueTypeSetting[]
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.SYNC_REPOS_FOR_OWNER)
  syncReposForOwner: () => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_USAGE_DETAILS)
  fetchUsageDetails: (args: { login: string; provider: string; refetch?: boolean }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_MAX_USAGE_PERCENTAGE)
  fetchMaxUsagePercentage: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>
}
