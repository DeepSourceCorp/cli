import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'

import RepositoryIDGQLQuery from '~/apollo/queries/repository/id.gql'
import RepositoryDetailGQLQuery from '~/apollo/queries/repository/detail.gql'
import RepositoryBaseDetailGQLQuery from '~/apollo/queries/repository/base.gql'
import RepositoryIsCommitPossible from '~/apollo/queries/repository/isCommitPossible.gql'
import RepositoryAnalyzerGQLQuery from '~/apollo/queries/repository/availableAnalyzers.gql'
import RepositoryPermsGQLQuery from '~/apollo/queries/repository/perms.gql'
import RepositoryCurrentRunAnalysisQuery from '~/apollo/queries/repository/analysisRun.gql'
import RepositoryIssueTrendsQuery from '~/apollo/queries/repository/issueTrends.gql'
import RepositoryAutofixTrendsQuery from '~/apollo/queries/repository/autofixTrends.gql'
import RepositoryAutofixStatsQuery from '~/apollo/queries/repository/autofixStats.gql'
import RepositoryIssueTypeDistributionQuery from '~/apollo/queries/repository/issueTypeDistribution.gql'
import RepositoryIssueOccurrenceDistributionByIssueType from '~/apollo/queries/repository/issueOccurrenceDistributionByIssueType.gql'
import RepositoryIssueOccurrenceDistributionByProduct from '~/apollo/queries/repository/issueOccurrenceDistributionByProduct.gql'
import RepositoryIssueTypeSettingsQuery from '~/apollo/queries/repository/issueTypeSettings.gql'
import RepositoryWidgetsGQLQuery from '~/apollo/queries/repository/widgets.gql'
import RepositoryMetricsGQLQuery from '~/apollo/queries/repository/metrics/metrics.gql'
import RepositoryMetricGQLQuery from '~/apollo/queries/repository/metrics/metric.gql'
import RepositoryMetricUpdateThresoldGQLQuery from '~/apollo/queries/repository/metrics/metricThresholdUpdateData.gql'
import RepositorySettingsGeneralGQLQuery from '~/apollo/queries/repository/settings/general.gql'
import RepositorySettingsSshGQLQuery from '~/apollo/queries/repository/settings/ssh.gql'
import RepositorySettingsIgnoreRulesGQLQuery from '~/apollo/queries/repository/settings/ignoreRules.gql'
import RepositorySettingsBadgesGQLQuery from '~/apollo/queries/repository/settings/badges.gql'
import RepositorySettingsReportingGQLQuery from '~/apollo/queries/repository/settings/reporting.gql'
import RepositorySettingsManageAccessGQLQuery from '~/apollo/queries/repository/settings/manageAccess.gql'
import RepositorySettingsAuditLogGQLQuery from '~/apollo/queries/repository/settings/auditLog.gql'
import RepositoryAddableMembersGQLQuery from '~/apollo/queries/repository/addableMembers.gql'
import RepoStatusPollQuery from '~/apollo/queries/repository/statusPoll.gql'

import ToggleRepositoryActivationMutation from '~/apollo/mutations/repository/toggleRepositoryActivation.gql'
import CommitConfigToVcsGQLMutation from '~/apollo/mutations/repository/commitConfigToVcs.gql'
import UpdateRepoMetricThreshold from '~/apollo/mutations/repository/updateRepoMetricThreshold.gql'
import DeleteIgnoredRule from '~/apollo/mutations/repository/settings/deleteIgnoredRule.gql'
import GenerateSSHKey from '~/apollo/mutations/repository/settings/generateSSHKey.gql'
import DeleteSSHKey from '~/apollo/mutations/repository/settings/deleteSSHKey.gql'
import UpdateRepositorySettings from '~/apollo/mutations/repository/settings/updateRepositorySettings.gql'
import UpdatePermission from '~/apollo/mutations/repository/settings/updatePermission.gql'
import RemoveCollaborator from '~/apollo/mutations/repository/settings/removeCollaborator.gql'
import UpdateRepositoryWidgets from '~/apollo/mutations/repository/updateRepositoryWidgets.gql'
import TriggerGSRRun from '~/apollo/mutations/repository/triggerGSRRun.gql'
import triggerAdhocRunGQLMutation from '~/apollo/mutations/repository/triggerAdHocRun.gql'
import regenerateRepositoryDSN from '~/apollo/mutations/repository/settings/regenerateRepositoryDSN.gql'

import {
  UpdateRepoMetricThresholdInput,
  CommitConfigToVcsInput,
  Repository,
  ToggleRepositoryActivationInput,
  UpdateRepositorySettingsInput,
  RemoveRepositoryCollaboratorInput,
  CommitConfigToVcsPayload,
  UpdateRepositoryWidgetsInput,
  UpdateRepositoryWidgetsPayload,
  ActivateGsrRepositoryInput,
  UpdateRepositorySettingsPayload,
  MetricTypeChoices,
  RegenerateRepositoryDsnPayload,
  UpdateOrCreateRepositoryCollaboratorPayload,
  UpdateOrCreateRepositoryCollaboratorInput
} from '~/types/types'
import { TransformerInterface } from '~/store/analyzer/list'
import {
  GraphqlError,
  GraphqlMutationResponse,
  GraphqlQueryResponse
} from '~/types/apollo-graphql-types'
import { NLCV_SHORTCODE } from '~/types/metric'
import type { LogErrorAndToastT } from '~/plugins/helpers/error'
import { IssueOccurrenceDistributionType } from '~/types/issues'

export type RepoSettingOptions = {
  settingType: keyof Repository
  field: string
  value: Record<string, boolean>
}

export interface MetricsNamespace {
  key: string
  threshold: number | null
  is_passing: boolean | null
  display: string
  trend: {
    labels: Array<string>
    values: Array<number>
  }
  modified_at: string | Date
}

export interface Metrics {
  name: string
  shortcode: string
  display: string
  last_value: number
  second_last_value: number
  description: string
  threshold: null
  is_passing: null
  namespaces: Array<MetricsNamespace>
}

export interface RepoConfigAnalyzerMeta {
  enabled: boolean
  meta: Record<string, unknown>
  name: string
}

export interface RepoConfigInterface {
  version: number
  analyzers: RepoConfigAnalyzerMeta[]
  transformers: Array<TransformerInterface>
  test_patterns: string[]
  exclude_patterns: string[]
}

export enum RepositoryDetailActions {
  FETCH_REPOSITORY_ID = 'fetchRepositoryID',
  FETCH_REPOSITORY_DETAIL = 'fetchRepositoryDetail',
  FETCH_REPOSITORY_BASE_DETAILS = 'fetchBasicRepoDetails',
  FETCH_REPOSITORY_AUTOFIX_STATS = 'fetchRepoAutofixStats',
  FETCH_REPOSITORY_COMMIT_POSSIBLE = 'fetchRepositoryCommitPossible',
  FETCH_AVAILABLE_ANALYZERS = 'fetchAvailableAnalyzers',
  FETCH_REPOSITORY_PERMS = 'fetchRepositoryPerms',
  FETCH_WIDGETS = 'fetchWidgets',
  FETCH_METRICS = 'fetchMetrics',
  FETCH_METRIC = 'fetchMetric',
  FETCH_NLCV_METRIC = 'fetchNlcvMetric',
  FETCH_CURRENT_RUN_COUNT = 'fetchCurrentRunCount',
  FETCH_ISSUE_TRENDS = 'fetchIssueTrends',
  FETCH_AUTOFIX_TRENDS = 'fetchAutofixTrends',
  FETCH_ISSUE_TYPE_DISTRIBUTION = 'fetchIssueTypeDistribution',
  FETCH_ISSUE_OCCURRENCE_DISTRIBUTION_COUNTS = 'fetchIssueOccurrenceDistributionCounts',
  FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings',
  FETCH_REPOSITORY_SETTINGS_GENERAL = 'fetchRepositorySettingsGeneral',
  FETCH_REPOSITORY_SETTINGS_BADGES = 'fetchRepositorySettingsBadges',
  FETCH_REPOSITORY_SETTINGS_REPORTING = 'fetchRepositorySettingsReporting',
  FETCH_REPOSITORY_SETTINGS_SSH = 'fetchRepositorySettingsSsh',
  FETCH_REPOSITORY_SETTINGS_IGNORE_RULES = 'fetchRepositorySettingsIgnoreRules',
  FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS = 'fetchRepositorySettingsManageAccess',
  FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS = 'fetchRepositorySettingsAuditLogs',
  COMMIT_CONFIG_TO_VCS = 'commitConfigToVcs',
  SET_METRIC_THRESHOLD = 'setRepoMetricsThreshold',
  DELETE_IGNORED_RULE = 'deleteIgnoredRule',
  GENERATE_SSH_KEY = 'generateSSHKey',
  DELETE_SSH_KEY = 'deleteSSHKey',
  TOGGLE_REPO_ACTIVATION = 'toggleRepoActivation',
  UPDATE_REPO_SETTINGS = 'updateRepoSettings',
  UPDATE_MEMBER_PERMISSION = 'updateMemberPermission',
  REMOVE_MEMBER = 'removeMember',
  FETCH_ADDABLE_MEMBERS = 'fetchAddableMembers',
  UPDATE_REPO_WIDGETS = 'udateRepositoryWidgets',
  UPDATE_REPOSITORY_IN_STORE = 'updateRepositoryInStore',
  TRIGGER_GSR_ACTIVATION = 'triggerGSRActivation',
  POLL_REPO_STATUS = 'pollRepoStatus',
  TRIGGER_ADHOC_RUN = 'triggerAdHocRun',
  REGENERATE_REPOSITORY_DSN = 'regenerateRepositoryDSN'
}

export enum RepositoryDetailMutations {
  SET_ERROR = 'setRepositoryDetailError',
  SET_LOADING = 'setRepositoryDetailLoading',
  SET_REPOSITORY = 'setRepositoryDetail',
  SET_REPO_SETTING_VALUE = 'setRepoSetting'
}

export interface RepoDetailState {
  loading: boolean
  error: Record<string, unknown>
  repository: Repository
}

/**
 * Repository details state
 *
 * @return {RepoDetailState}
 */
export const state = (): RepoDetailState => ({
  loading: false,
  error: {},
  repository: {} as Repository
})

export type RepositoryDetailModuleState = ReturnType<typeof state>
export type RepositoryDetailActionContext = ActionContext<RepositoryDetailModuleState, RootState>

export const getters: GetterTree<RepositoryDetailModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

interface RepositoryDetailModuleMutations extends MutationTree<RepositoryDetailModuleState> {
  [RepositoryDetailMutations.SET_LOADING]: (
    repoDetailState: RepositoryDetailModuleState,
    value: boolean
  ) => void
  [RepositoryDetailMutations.SET_ERROR]: (
    repoDetailState: RepositoryDetailModuleState,
    error: GraphqlError
  ) => void
  [RepositoryDetailMutations.SET_REPOSITORY]: (
    repoDetailState: RepositoryDetailModuleState,
    repository: Repository
  ) => void
}

export const mutations: RepositoryDetailModuleMutations = {
  [RepositoryDetailMutations.SET_LOADING]: (repoDetailState, value) => {
    repoDetailState.loading = value
  },
  [RepositoryDetailMutations.SET_ERROR]: (repoDetailState, error) => {
    repoDetailState.error = Object.assign({}, repoDetailState.error, error)
  },
  [RepositoryDetailMutations.SET_REPOSITORY]: (repoDetailState, repository) => {
    repoDetailState.repository = Object.assign({}, repoDetailState.repository, repository)
  },
  [RepositoryDetailMutations.SET_REPO_SETTING_VALUE]: (
    repoDetailState,
    options: RepoSettingOptions
  ) => {
    const { settingType, field, value } = options

    const repoSettings = repoDetailState.repository[settingType].map(
      (repoSetting: { slug?: string; shortcode?: string }) => {
        if (repoSetting?.slug === field || repoSetting?.shortcode === field) {
          return { ...repoSetting, ...value }
        }
        return repoSetting
      }
    )

    const updatedSettings = { [settingType]: repoSettings }
    repoDetailState.repository = Object.assign({}, repoDetailState.repository, updatedSettings)
  }
}

interface RepositoryDetailModuleActions extends ActionTree<RepositoryDetailModuleState, RootState> {
  [RepositoryDetailActions.FETCH_WIDGETS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_METRICS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      metricType?: MetricTypeChoices
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_METRIC]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      shortcode: string
      metricType?: MetricTypeChoices
      lastDays?: number
      refetch?: boolean
    }
  ) => Promise<Repository>
  [RepositoryDetailActions.FETCH_NLCV_METRIC]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      shortcode: typeof NLCV_SHORTCODE
      metricType?: MetricTypeChoices
      refetch?: boolean
    }
  ) => Promise<Repository>
  [RepositoryDetailActions.FETCH_ISSUE_TRENDS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      lastDays: number
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_AUTOFIX_TRENDS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      lastDays: number
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_CURRENT_RUN_COUNT]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      status: string
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_ISSUE_TYPE_DISTRIBUTION]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      issueType: string
      analyzer: string
      q: string
      autofixAvailable: boolean | null
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_ISSUE_OCCURRENCE_DISTRIBUTION_COUNTS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      distributionType: IssueOccurrenceDistributionType
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_ISSUE_TYPE_SETTINGS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_ID]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_DETAIL]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      lastDays: number | null
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_BADGES]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_REPORTING]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      q: string
      limit: number
      currentPageNumber: number
      refetch: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      limit: number
      currentPageNumber: number
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { id: string; refetch?: boolean }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { provider: string; owner: string; name: string }
  ) => Promise<void>
  [RepositoryDetailActions.COMMIT_CONFIG_TO_VCS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: CommitConfigToVcsInput
  ) => Promise<CommitConfigToVcsPayload>
  [RepositoryDetailActions.TOGGLE_REPO_ACTIVATION]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: ToggleRepositoryActivationInput
  ) => Promise<void>
  [RepositoryDetailActions.SET_METRIC_THRESHOLD]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: UpdateRepoMetricThresholdInput
  ) => Promise<GraphqlMutationResponse>
  [RepositoryDetailActions.DELETE_IGNORED_RULE]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { silenceRuleId: string }
  ) => Promise<void>
  [RepositoryDetailActions.GENERATE_SSH_KEY]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { repositoryId: string }
  ) => Promise<void>
  [RepositoryDetailActions.DELETE_SSH_KEY]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { repositoryId: string }
  ) => Promise<void>
  [RepositoryDetailActions.UPDATE_REPO_SETTINGS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { input: UpdateRepositorySettingsInput }
  ) => Promise<void>
  [RepositoryDetailActions.UPDATE_MEMBER_PERMISSION]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      input: UpdateOrCreateRepositoryCollaboratorInput
    }
  ) => Promise<UpdateOrCreateRepositoryCollaboratorPayload | undefined>
  [RepositoryDetailActions.REMOVE_MEMBER]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      input: RemoveRepositoryCollaboratorInput
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_PERMS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_BASE_DETAILS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_AUTOFIX_STATS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_REPOSITORY_COMMIT_POSSIBLE]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_AVAILABLE_ANALYZERS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_ADDABLE_MEMBERS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      q?: string
    }
  ) => Promise<void>
  [RepositoryDetailActions.UPDATE_REPO_WIDGETS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: UpdateRepositoryWidgetsInput
  ) => Promise<UpdateRepositoryWidgetsPayload>
  [RepositoryDetailActions.UPDATE_REPOSITORY_IN_STORE]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: Repository
  ) => void
  [RepositoryDetailActions.TRIGGER_GSR_ACTIVATION]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: ActivateGsrRepositoryInput
  ) => void
  [RepositoryDetailActions.POLL_REPO_STATUS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.TRIGGER_ADHOC_RUN]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: { config: string }
  ) => Promise<void>
  [RepositoryDetailActions.REGENERATE_REPOSITORY_DSN]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext
  ) => Promise<void>
}

export const actions: RepositoryDetailModuleActions = {
  async [RepositoryDetailActions.FETCH_WIDGETS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositoryWidgetsGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
  },
  async [RepositoryDetailActions.FETCH_METRICS](
    { commit },
    { owner, name, provider, metricType = MetricTypeChoices.DefaultBranchOnly, refetch }
  ) {
    try {
      const response = (await this.$fetchGraphqlData(
        RepositoryMetricsGQLQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name,
          metricType
        },
        refetch
      )) as GraphqlQueryResponse

      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
    } catch (e: unknown) {
      this.$logErrorAndToast(e as Error, 'An error occured while fetching repository metrics.')
    }
  },
  async [RepositoryDetailActions.FETCH_METRIC](
    { state: repoDetailState },
    {
      owner,
      name,
      provider,
      shortcode,
      lastDays = 30,
      metricType = MetricTypeChoices.DefaultBranchOnly,
      refetch
    }
  ) {
    try {
      const response = (await this.$fetchGraphqlData(
        RepositoryMetricGQLQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name,
          shortcode,
          metricType,
          lastDays
        },
        refetch
      )) as GraphqlQueryResponse

      return response.data.repository ?? repoDetailState.repository
    } catch (e: unknown) {
      this.$logErrorAndToast(e as Error, 'An error occured while fetching the metric.')
      throw e
    }
  },
  async [RepositoryDetailActions.FETCH_NLCV_METRIC](
    { state: repoDetailState },
    { owner, name, provider, shortcode, metricType = MetricTypeChoices.DefaultBranchOnly, refetch }
  ) {
    try {
      const response = (await this.$fetchGraphqlData(
        RepositoryMetricUpdateThresoldGQLQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name,
          shortcode,
          metricType
        },
        refetch
      )) as GraphqlQueryResponse

      return response.data.repository ?? repoDetailState.repository
    } catch (e: unknown) {
      this.$logErrorAndToast(
        e as Error,
        'An error occured while fetching new line code coverage information.'
      )
    }
    return repoDetailState.repository
  },
  async [RepositoryDetailActions.FETCH_CURRENT_RUN_COUNT]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(
      RepositoryCurrentRunAnalysisQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        status: args.status
      },
      true
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched widgets")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching widgets", e)
      })
  },
  async [RepositoryDetailActions.FETCH_ISSUE_TRENDS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(
      RepositoryIssueTrendsQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        lastDays: args.lastDays
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched widgets")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching widgets", e)
      })
  },
  async [RepositoryDetailActions.FETCH_AUTOFIX_TRENDS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(RepositoryAutofixTrendsQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      lastDays: args.lastDays
    })
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched widgets")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching widgets", e)
      })
  },
  async [RepositoryDetailActions.FETCH_ISSUE_TYPE_DISTRIBUTION]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(
      RepositoryIssueTypeDistributionQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        issueType: args.issueType,
        analyzer: args.analyzer,
        q: args.q,
        autofixAvailable: args.autofixAvailable
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched widgets")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching widgets", e)
      })
  },
  async [RepositoryDetailActions.FETCH_ISSUE_OCCURRENCE_DISTRIBUTION_COUNTS]({ commit }, args) {
    const distributionCountsQuery =
      args.distributionType === IssueOccurrenceDistributionType.ISSUE_TYPE
        ? RepositoryIssueOccurrenceDistributionByIssueType
        : RepositoryIssueOccurrenceDistributionByProduct

    const response = await this.$fetchGraphqlData(
      distributionCountsQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
      },
      args.refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.FETCH_ISSUE_TYPE_SETTINGS]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      RepositoryIssueTypeSettingsQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
      },
      args.refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_ID](
    { commit },
    { provider, owner, name, refetch }
  ) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        RepositoryIDGQLQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name
        },
        refetch
      )

      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error while fetching the repository id.')
    }
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_DETAIL](
    { commit },
    { provider, owner, name, lastDays, refetch }
  ) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositoryDetailGQLQuery,
      {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name,
        lastDays
      },
      refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository detail")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository detail", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsGeneralGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name
    })
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository settings detail -- General")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository settings detail -- General", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositorySettingsManageAccessGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        q: args.q,
        limit: args.limit,
        after: this.$getGQLAfter(args.currentPageNumber, args.limit)
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository settings detail -- Manage Access")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository settings detail -- Manage Access", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositorySettingsIgnoreRulesGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        limit: args.limit,
        after: this.$getGQLAfter(args.currentPageNumber, args.limit)
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository settings detail -- Ignore rules")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository settings detail -- Ignore rules", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_BADGES]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsBadgesGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name
    })
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository settings detail -- Ignore rules")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository settings detail -- Ignore rules", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_REPORTING]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositorySettingsReportingGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name
        },
        args.refetch
      )
      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch reporting configuration.', undefined, {
        context: 'repo reporting query failed',
        params: args
      })

      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositorySettingsSshGQLQuery,
      {
        id: args.id
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        // TODO: Toast("Successfully fetched repository settings detail -- SSH")
        commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in fetching repository settings detail -- SSH", e)
      })
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(RepositorySettingsAuditLogGQLQuery, {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
      })

      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepositoryDetailMutations.SET_ERROR, error)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.COMMIT_CONFIG_TO_VCS](_, args) {
    const response = await this.$applyGraphqlMutation(CommitConfigToVcsGQLMutation, {
      input: args
    })
    return response.data.commitConfigToVcs
  },
  async [RepositoryDetailActions.TOGGLE_REPO_ACTIVATION](
    { commit, state: repoDetailState },
    { isActivated, id }
  ) {
    try {
      const response = (await this.$applyGraphqlMutation(ToggleRepositoryActivationMutation, {
        input: { id, isActivated }
      })) as GraphqlMutationResponse
      if (response?.data?.toggleRepositoryActivation) {
        commit(
          RepositoryDetailMutations.SET_REPOSITORY,
          response.data.toggleRepositoryActivation.repository
        )
        if (response.data.toggleRepositoryActivation.repository?.isActivated)
          this.$toast.success(
            `Successfully activated ${repoDetailState.repository.name as string}.`
          )
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        (e as Error).message.replace('GraphQL error: ', '') as Parameters<LogErrorAndToastT>['1']
      )
      commit(RepositoryDetailMutations.SET_ERROR, e)
    }
  },
  async [RepositoryDetailActions.SET_METRIC_THRESHOLD](_ctx, args) {
    return await this.$applyGraphqlMutation(UpdateRepoMetricThreshold, {
      input: {
        metricShortcode: args.metricShortcode,
        repositoryId: args.repositoryId,
        thresholdValue: args.thresholdValue,
        key: args.key
      }
    })
  },
  async [RepositoryDetailActions.DELETE_IGNORED_RULE]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      await this.$applyGraphqlMutation(DeleteIgnoredRule, {
        silenceRuleId: args.silenceRuleId
      })
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.GENERATE_SSH_KEY]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$applyGraphqlMutation(GenerateSSHKey, {
        repositoryId: args.repositoryId
      })
      commit(
        RepositoryDetailMutations.SET_REPOSITORY,
        response.data.generateKeyPairForRepository.repository
      )
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.DELETE_SSH_KEY]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$applyGraphqlMutation(DeleteSSHKey, {
        repositoryId: args.repositoryId
      })
      commit(
        RepositoryDetailMutations.SET_REPOSITORY,
        response.data.generateKeyPairForRepository.repository
      )
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.UPDATE_REPO_SETTINGS]({ commit }, args) {
    try {
      const response = await this.$applyGraphqlMutation(UpdateRepositorySettings, {
        input: args.input
      })
      commit(
        RepositoryDetailMutations.SET_REPOSITORY,
        (response.data as UpdateRepositorySettingsPayload).repository
      )
    } catch (e) {
      throw e
    }
  },
  async [RepositoryDetailActions.UPDATE_MEMBER_PERMISSION]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)

    try {
      const response = await this.$applyGraphqlMutation(UpdatePermission, {
        input: args.input
      })

      return response.data
        .updateOrCreateRepositoryCollaborator as UpdateOrCreateRepositoryCollaboratorPayload
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
    } finally {
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }

    return undefined
  },
  async [RepositoryDetailActions.REMOVE_MEMBER]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)

    try {
      await this.$applyGraphqlMutation(RemoveCollaborator, {
        input: args.input
      })
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_PERMS]({ commit }, { provider, owner, name }) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(RepositoryPermsGQLQuery, {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      })
      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
    } finally {
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_BASE_DETAILS]({ commit }, args) {
    const { provider, owner, name, refetch } = args
    const response = await this.$fetchGraphqlData(
      RepositoryBaseDetailGQLQuery,
      {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      },
      refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_AUTOFIX_STATS]({ commit }, args) {
    const { provider, owner, name, refetch } = args
    const response = await this.$fetchGraphqlData(
      RepositoryAutofixStatsQuery,
      {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      },
      refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.FETCH_REPOSITORY_COMMIT_POSSIBLE]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      RepositoryIsCommitPossible,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
      },
      args.refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.FETCH_AVAILABLE_ANALYZERS](
    { commit },
    { provider, owner, name, refetch }
  ) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryAnalyzerGQLQuery,
        {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name
        },
        refetch
      )
      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
    } finally {
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.FETCH_ADDABLE_MEMBERS]({ commit }, { provider, ...args }) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(RepositoryAddableMembersGQLQuery, {
        provider: this.$providerMetaMap[provider].value,
        ...args
      })
      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
    } finally {
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.UPDATE_REPO_WIDGETS](_, args) {
    const response = await this.$applyGraphqlMutation(UpdateRepositoryWidgets, {
      input: args
    })
    return response.data.updateRepositoryWidgets
  },
  [RepositoryDetailActions.UPDATE_REPOSITORY_IN_STORE]({ commit }, repo) {
    commit(RepositoryDetailMutations.SET_REPOSITORY, repo)
  },
  async [RepositoryDetailActions.TRIGGER_GSR_ACTIVATION](_, args) {
    const response = await this.$applyGraphqlMutation(TriggerGSRRun, {
      input: args
    })
    return response.data.activateGsrRepository.ok
  },
  async [RepositoryDetailActions.POLL_REPO_STATUS]({ commit }, args) {
    const { provider, owner, name, refetch = true } = args
    const response = await this.$fetchGraphqlData(
      RepoStatusPollQuery,
      {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      },
      refetch
    )
    commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
  },
  async [RepositoryDetailActions.TRIGGER_ADHOC_RUN]({ state: repoDetailState }, args) {
    await this.$applyGraphqlMutation(triggerAdhocRunGQLMutation, {
      input: {
        config: args.config,
        repositoryId: repoDetailState.repository.id
      }
    })
  },
  async [RepositoryDetailActions.REGENERATE_REPOSITORY_DSN]({ commit, state: repoDetailState }) {
    const response = await this.$applyGraphqlMutation(regenerateRepositoryDSN, {
      input: {
        repositoryId: repoDetailState.repository.id
      }
    })

    const data = response?.data?.regenerateRepositoryDSN as RegenerateRepositoryDsnPayload

    commit(RepositoryDetailMutations.SET_REPOSITORY, {
      ...repoDetailState.repository,
      dsn: data?.dsn
    })
  }
}
