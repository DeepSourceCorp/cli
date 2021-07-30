import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'

import RepositoryDetailGQLQuery from '~/apollo/queries/repository/detail.gql'
import RepositoryBaseDetailGQLQuery from '~/apollo/queries/repository/base.gql'
import RepositoryAnalyzerGQLQuery from '~/apollo/queries/repository/availableAnalyzers.gql'
import RepositoryPermsGQLQuery from '~/apollo/queries/repository/perms.gql'
import RepositoryCurrentRunAnalysisQuery from '~/apollo/queries/repository/analysisRun.gql'
import RepositoryIssueTrendsQuery from '~/apollo/queries/repository/issueTrends.gql'
import RepositoryAutofixTrendsQuery from '~/apollo/queries/repository/autofixTrends.gql'
import RepositoryIssueTypeDistributionQuery from '~/apollo/queries/repository/issueTypeDistribution.gql'
import RepositoryWidgetsGQLQuery from '~/apollo/queries/repository/widgets.gql'
import RepositoryMetricsGQLQuery from '~/apollo/queries/repository/metrics.gql'
import RepositoryAlertingMetricsGQLQuery from '~/apollo/queries/repository/alertingMetrics.gql'
import RepositorySettingsGeneralGQLQuery from '~/apollo/queries/repository/settings/general.gql'
import RepositorySettingsSshGQLQuery from '~/apollo/queries/repository/settings/ssh.gql'
import RepositorySettingsIgnoreRulesGQLQuery from '~/apollo/queries/repository/settings/ignoreRules.gql'
import RepositorySettingsBadgesGQLQuery from '~/apollo/queries/repository/settings/badges.gql'
import RepositorySettingsReportingGQLQuery from '~/apollo/queries/repository/settings/reporting.gql'
import RepositorySettingsManageAccessGQLQuery from '~/apollo/queries/repository/settings/manageAccess.gql'
import RepositorySettingsAuditLogGQLQuery from '~/apollo/queries/repository/settings/auditLog.gql'
import RepositoryAddableMembersGQLQuery from '~/apollo/queries/repository/addableMembers.gql'

import ToggleRepositoryActivationMutation from '~/apollo/mutations/repository/toggleRepositoryActivation.gql'
import CommitConfigToVcsGQLMutation from '~/apollo/mutations/repository/commitConfigToVcs.gql'
import UpdateRepoMetricThreshold from '~/apollo/mutations/repository/updateRepoMetricThreshold.gql'
import DeleteIgnoredRule from '~/apollo/mutations/repository/settings/deleteIgnoredRule.gql'
import GenerateSSHKey from '~/apollo/mutations/repository/settings/generateSSHKey.gql'
import DeleteSSHKey from '~/apollo/mutations/repository/settings/deleteSSHKey.gql'
import UpdateRepositorySettings from '~/apollo/mutations/repository/settings/updateRepositorySettings.gql'
import UpdatePermission from '~/apollo/mutations/repository/settings/updatePermission.gql'
import RemoveCollaborator from '~/apollo/mutations/repository/settings/removeCollaborator.gql'

import {
  UpdateRepoMetricThresholdInput,
  CommitConfigToVcsInput,
  Repository,
  ToggleRepositoryActivationInput,
  UpdateRepositorySettingsInput,
  RemoveRepositoryCollaboratorInput
} from '~/types/types'
import { TransformerInterface } from '~/store/analyzer/list'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

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
  FETCH_REPOSITORY_DETAIL = 'fetchRepositoryDetail',
  FETCH_REPOSITORY_BASE_DETAILS = 'fetchBasicRepoDetails',
  FETCH_AVAILABLE_ANALYZERS = 'fetchAvailableAnalyzers',
  FETCH_REPOSITORY_PERMS = 'fetchRepositoryPerms',
  FETCH_WIDGETS = 'fetchWidgets',
  FETCH_METRICS = 'fetchMetrics',
  FETCH_ALERTING_METRICS = 'fetchAlertingMetrics',
  FETCH_CURRENT_RUN_COUNT = 'fetchCurrentRunCount',
  FETCH_ISSUE_TRENDS = 'fetchIssueTrends',
  FETCH_AUTOFIX_TRENDS = 'fetchAutofixTrends',
  FETCH_ISSUE_TYPE_DISTRIBUTION = 'fetchIssueTypeDistribution',
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
  FETCH_ADDABLE_MEMBERS = 'fetchAddableMembers'
}

export enum RepositoryDetailMutations {
  SET_ERROR = 'setRepositoryDetailError',
  SET_LOADING = 'setRepositoryDetailLoading',
  SET_REPOSITORY = 'setRepositoryDetail'
}

export interface RepoDetailState {
  loading: boolean
  error: Record<string, unknown>
  repository: Repository
}

export const state = (): RepoDetailState => ({
  loading: false as boolean,
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
    state: RepositoryDetailModuleState,
    value: boolean
  ) => void
  [RepositoryDetailMutations.SET_ERROR]: (
    state: RepositoryDetailModuleState,
    error: GraphqlError
  ) => void
  [RepositoryDetailMutations.SET_REPOSITORY]: (
    state: RepositoryDetailModuleState,
    repository: Repository
  ) => void
}

export const mutations: RepositoryDetailModuleMutations = {
  [RepositoryDetailMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [RepositoryDetailMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [RepositoryDetailMutations.SET_REPOSITORY]: (state, repository) => {
    state.repository = Object.assign({}, state.repository, repository)
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
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_METRICS]: (
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
  [RepositoryDetailActions.FETCH_ALERTING_METRICS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RepositoryDetailActions.FETCH_ISSUE_TRENDS]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      lastDays: number
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
  ) => Promise<void>
  [RepositoryDetailActions.TOGGLE_REPO_ACTIVATION]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: ToggleRepositoryActivationInput
  ) => Promise<void>
  [RepositoryDetailActions.SET_METRIC_THRESHOLD]: (
    this: Store<RootState>,
    injectee: RepositoryDetailActionContext,
    args: UpdateRepoMetricThresholdInput
  ) => Promise<void>
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
      input: UpdateRepositorySettingsInput
    }
  ) => Promise<void>
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
}

export const actions: RepositoryDetailModuleActions = {
  async [RepositoryDetailActions.FETCH_WIDGETS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryWidgetsGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name
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
  async [RepositoryDetailActions.FETCH_METRICS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(
      RepositoryMetricsGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        lastDays: args.lastDays ?? 30
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
  async [RepositoryDetailActions.FETCH_ALERTING_METRICS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    // use metrics query later
    await this.$fetchGraphqlData(
      RepositoryAlertingMetricsGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name
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
    await this.$fetchGraphqlData(RepositoryIssueTrendsQuery, {
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
    await this.$fetchGraphqlData(RepositoryIssueTypeDistributionQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      issueType: args.issueType,
      analyzer: args.analyzer,
      q: args.q,
      autofixAvailable: args.autofixAvailable
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
    await this.$fetchGraphqlData(RepositorySettingsIgnoreRulesGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit)
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
    await this.$fetchGraphqlData(RepositorySettingsReportingGQLQuery, {
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
      const response: { data: { repository: Repository } } = await this.$fetchGraphqlData(
        RepositorySettingsAuditLogGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name
        }
      )

      commit(RepositoryDetailMutations.SET_REPOSITORY, response.data.repository)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(RepositoryDetailMutations.SET_ERROR, error)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
  },
  async [RepositoryDetailActions.COMMIT_CONFIG_TO_VCS]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    await this.$applyGraphqlMutation(CommitConfigToVcsGQLMutation, {
      input: {
        repositoryId: args.repositoryId,
        config: args.config
      }
    })
      .then(() => {
        // TODO: Toast("Successfully committed config to VCS")
        commit(RepositoryDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RepositoryDetailMutations.SET_ERROR, e)
        commit(RepositoryDetailMutations.SET_LOADING, false)
        // TODO: Toast("Failure in committing config to VCS", e)
      })
  },
  async [RepositoryDetailActions.TOGGLE_REPO_ACTIVATION]({ commit }, { isActivated, id }) {
    try {
      const response = await this.$applyGraphqlMutation(ToggleRepositoryActivationMutation, {
        input: { id, isActivated }
      })
      commit(
        RepositoryDetailMutations.SET_REPOSITORY,
        response.data.toggleRepositoryActivation.repository
      )
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
      commit(RepositoryDetailMutations.SET_ERROR, e)
    }
  },
  async [RepositoryDetailActions.SET_METRIC_THRESHOLD]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      await this.$applyGraphqlMutation(UpdateRepoMetricThreshold, {
        input: {
          metricShortcode: args.metricShortcode,
          repositoryId: args.repositoryId,
          thresholdValue: args.thresholdValue,
          key: args.key
        }
      })
      commit(RepositoryDetailMutations.SET_LOADING, false)
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
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
    commit(RepositoryDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$applyGraphqlMutation(UpdateRepositorySettings, {
        input: args.input
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
  async [RepositoryDetailActions.UPDATE_MEMBER_PERMISSION]({ commit }, args) {
    commit(RepositoryDetailMutations.SET_LOADING, true)

    try {
      const response = await this.$applyGraphqlMutation(UpdatePermission, {
        input: args.input
      })
      commit(RepositoryDetailMutations.SET_LOADING, false)
      return response.data.updateOrCreateRepositoryCollaborator
    } catch (e) {
      commit(RepositoryDetailMutations.SET_ERROR, e)
      commit(RepositoryDetailMutations.SET_LOADING, false)
    }
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
  async [RepositoryDetailActions.FETCH_REPOSITORY_BASE_DETAILS](
    { commit },
    { provider, owner, name, refetch }
  ) {
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
  }
}
