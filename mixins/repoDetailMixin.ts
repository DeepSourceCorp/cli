import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { RepositoryDetailActions } from '~/store/repository/detail'
import {
  Repository,
  CommitConfigToVcsInput,
  UpdateRepoMetricThresholdInput,
  ToggleRepositoryActivationInput,
  UpdateRepositorySettingsInput,
  UpdateOrCreateRepositoryCollaboratorInput,
  RemoveRepositoryCollaboratorInput,
  UpdateOrCreateRepositoryCollaboratorPayload,
  RepositoryPermissionChoices,
  CommitConfigToVcsPayload
} from '~/types/types'

const repoStore = namespace('repository/detail')

export const REPO_PERMS = {
  ADMIN: {
    label: 'Admin',
    value: RepositoryPermissionChoices.Admin,
    description:
      'Members will have full access to all repository settings, including the ability to add or remove members from the repository.'
  },
  WRITE: {
    label: 'Write',
    value: RepositoryPermissionChoices.Write,
    description:
      'Members will have full access to all repositories which they have access to, except the ability to add or remove members, and deactivating or activating analysis on them.'
  },
  READ: {
    label: 'Read-only',
    value: RepositoryPermissionChoices.Read,
    description: `Members will be able to only view the issues and metrics on private repositories they have access to, but won't be able to take any actions on issues or create Autofixes.`
  }
}

@Component
export default class RepoDetailMixin extends Vue {
  @repoStore.State
  repository!: Repository

  @repoStore.State('loading')
  repoStoreLoading: boolean

  // Query
  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_DETAIL)
  fetchRepoDetails: (args: {
    provider: string
    owner: string
    name: string
    lastDays?: number
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_BASE_DETAILS)
  fetchBasicRepoDeatils: (args: {
    provider: string
    owner: string
    name: string
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_AVAILABLE_ANALYZERS)
  fetchAvailableAnalyzers: (args: {
    provider: string
    owner: string
    name: string
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_CURRENT_RUN_COUNT)
  fetchRepoRunCount: (args: {
    provider: string
    owner: string
    name: string
    status: string
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_PERMS)
  fetchRepoPerms: (args: { provider: string; owner: string; name: string }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_WIDGETS)
  fetchWidgets: (args: { provider: string; owner: string; name: string }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_METRICS)
  fetchMetrics: (args: {
    provider: string
    owner: string
    name: string
    lastDays: number
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_ALERTING_METRICS)
  fetchAlertingMetrics: (args: {
    provider: string
    owner: string
    name: string
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_ISSUE_TRENDS)
  fetchIssueTrends: (args: {
    provider: string
    owner: string
    name: string
    lastDays: number
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_AUTOFIX_TRENDS)
  fetchAutofixTrends: (args: {
    provider: string
    owner: string
    name: string
    lastDays: number
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL)
  fetchRepositorySettingsGeneral: (args: {
    provider: string
    owner: string
    name: string
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_BADGES)
  fetchRepositorySettingsBadges: (args: {
    provider: string
    owner: string
    name: string
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_REPORTING)
  fetchRepositorySettingsReporting: (args: {
    provider: string
    owner: string
    name: string
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH)
  fetchRepositorySettingsSsh: (args: { id: string; refetch?: boolean }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES)
  fetchRepositorySettingsIgnoreRules: (args: {
    provider: string
    owner: string
    name: string
    limit: number
    currentPageNumber: number
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS)
  fetchRepositorySettingsManageAccess: (args: {
    provider: string
    owner: string
    name: string
    q: string
    limit: number
    currentPageNumber: number
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS)
  fetchRepositorySettingsAuditLogs: (args: {
    provider: string
    owner: string
    name: string
  }) => Promise<void>

  // Mutations
  @repoStore.Action(RepositoryDetailActions.COMMIT_CONFIG_TO_VCS)
  commitConfigToVcs: (args: CommitConfigToVcsInput) => Promise<CommitConfigToVcsPayload>

  @repoStore.Action(RepositoryDetailActions.SET_METRIC_THRESHOLD)
  setRepoMetricsThreshold: (args: UpdateRepoMetricThresholdInput) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.DELETE_IGNORED_RULE)
  deleteIgnoredRule: (args: { silenceRuleId: string }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.GENERATE_SSH_KEY)
  generateSSHKey: (args: { repositoryId: string }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.DELETE_SSH_KEY)
  deleteSSHKey: (args: { repositoryId: string }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.TOGGLE_REPO_ACTIVATION)
  toggleRepoActivation: (args: ToggleRepositoryActivationInput) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.UPDATE_REPO_SETTINGS)
  updateRepoSettings: (args: { input: UpdateRepositorySettingsInput }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_ISSUE_TYPE_DISTRIBUTION)
  fetchIssueTypeDistribution: (args: {
    provider: string
    owner: string
    name: string
    issueType?: string
    analyzer?: string
    q?: string
    autofixAvailable?: boolean | null
    refetch?: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.FETCH_ADDABLE_MEMBERS)
  fetchAddableMembers: (args: {
    provider: string
    owner: string
    name: string
    q?: string
  }) => Promise<void>

  onRepoAnalysisUpdated(data: Record<string, string>): void {
    if (data.repository_id === this.repository.id && data.is_for_default_branch) {
      this.$toast.show({
        type: 'success',
        message: `Results for latest analysis run on branch`,
        primary: {
          label: 'Refresh',
          action: () => {
            window.location.reload()
          }
        },
        timeout: 10
      })
    }
  }

  @repoStore.Action(RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS)
  fetchRepoCollaborators: (args: {
    provider: string
    owner: string
    name: string
    q: string
    limit: number
    currentPageNumber: number
    refetch: boolean
  }) => Promise<void>

  @repoStore.Action(RepositoryDetailActions.UPDATE_MEMBER_PERMISSION)
  updateMemberPermission: (args: {
    input: UpdateOrCreateRepositoryCollaboratorInput
  }) => Promise<UpdateOrCreateRepositoryCollaboratorPayload>

  @repoStore.Action(RepositoryDetailActions.REMOVE_MEMBER)
  removeMemberAPI: (args: { input: RemoveRepositoryCollaboratorInput }) => Promise<void>

  get baseRouteParams(): { name: string; provider: string; owner: string } {
    const { provider, owner, repo } = this.$route.params
    return {
      name: repo,
      provider,
      owner
    }
  }

  setAnalysisUpdateEvent(): void {
    // https://vuejs.org/v2/api/#vm-on
    this.$socket.$on('repo-analysis-updated', this.onRepoAnalysisUpdated)
  }

  beforeDestroy(): void {
    // https://vuejs.org/v2/api/#vm-off
    this.$socket.$off('repo-analysis-updated', this.onRepoAnalysisUpdated)
  }
}