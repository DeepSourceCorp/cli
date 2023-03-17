import { RootState } from '~/store'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import {
  IssueTypeSetting,
  GetBillingInfoPayload,
  Owner,
  OwnerSetting,
  Maybe,
  SubscriptionCheckoutPayload,
  UpdateCodeQualitySubscriptionSeatsPayload,
  UpdatePaymentActionChoice,
  UpdateDefaultPaymentSourcePayload,
  GetUpgradeCodeQualitySubscriptionPlanInfoPayload,
  SubscriptionStatusChoice,
  VerifyGsrPermissionsInput,
  VerifyGsrPermissionsPayload,
  TriggerVerifyGsrsshInput,
  TriggerVerifyGsrsshPayload,
  VerifyGsrSetupInput,
  VerifyGsrSetupPayload,
  VerifyGsrWebhooksInput,
  VerifyGsrWebhooksPayload,
  IntegrationFeature,
  DeleteTeamInput,
  SyncRepositoryForOwnerInput,
  SyncRepositoriesForOwnerPayload
} from '~/types/types'
import { GraphqlError, GraphqlMutationResponse } from '~/types/apollo-graphql-types'

import OwnerDetailQuery from '~/apollo/queries/owner/details.gql'
import VCSData from '~/apollo/queries/owner/vcsData.gql'
import OwnerIDQuery from '~/apollo/queries/owner/id.gql'
import AccountSetupStatus from '~/apollo/queries/owner/accountSetupStatus.gql'
import AppConfig from '~/apollo/queries/owner/appConfig.gql'
import IssueTrendsGQLQuery from '~/apollo/queries/owner/issueTrends.gql'
import AutofixTrendsGQLQuery from '~/apollo/queries/owner/autofixTrends.gql'
import SyncRepositories from '~/apollo/mutations/owner/syncRepositories.gql'
import SyncOwnerRepository from '~/apollo/mutations/owner/syncRepository.gql'

// Settings
import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import OwnerSSHPublicKeyQuery from '~/apollo/queries/owner/settings/publicKey.gql'
import ownerPreferences from '~/apollo/queries/owner/settings/ownerPreferences.gql'
import GenerateOwnerSSHPublicKey from '~/apollo/mutations/owner/settings/generateKeyPair.gql'
import RemoveOwnerSSHPublicKey from '~/apollo/mutations/owner/settings/removeKeyPair.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'
import UpdateOwnerDataTriggerTimeoutsGQLMutation from '~/apollo/mutations/owner/settings/toggleDataTriggerTimeout.gql'

// Billing
import BillingDetails from '~/apollo/queries/owner/billing.gql'
import SeatsInfo from '~/apollo/queries/owner/seatsInfo.gql'
import ApplyCredits from '~/apollo/mutations/owner/applyCreditsToOwner.gql'
import UpdateBillingInfo from '~/apollo/mutations/owner/updateBillingInfo.gql'
import GetBillingInfo from '~/apollo/mutations/owner/getBillingInfo.gql'
import Checkout from '~/apollo/mutations/owner/checkout.gql'
import UpdateSeats from '~/apollo/mutations/owner/updateSeats.gql'
import ChangePlan from '~/apollo/mutations/owner/changePlan.gql'
import UpdatePaymentSource from '~/apollo/mutations/owner/updatePaymentSource.gql'
import CancelPlan from '~/apollo/mutations/owner/cancelPlan.gql'
import ResumePlan from '~/apollo/mutations/owner/resumePlan.gql'
import GetUpgradePlanInfo from '~/apollo/mutations/owner/getUpgradePlanInfo.gql'

// Usage details
import UsageDetailsGQLQuery from '~/apollo/queries/owner/usageDetails.gql'
import MaxUsagePercentageGQLQuery from '~/apollo/queries/owner/maxUsagePercentage.gql'

// GSR Verification
import VerifyGsrPermissions from '~/apollo/mutations/owner/gsr/verifyGsrPermissions.gql'
import VerifyGsrWebhooks from '~/apollo/mutations/owner/gsr/verifyGsrWebhooks.gql'
import TriggerVerifyGsrSsh from '~/apollo/mutations/owner/gsr/triggerVerifyGsrSsh.gql'
import VerifyGsrSetup from '~/apollo/mutations/owner/gsr/verifyGsrSetup.gql'

// Integrations
import OwnerInstalledIntegrations from '~/apollo/queries/owner/ownerInstalledIntegration.gql'

// Delete team mutation
import DeleteTeam from '~/apollo/mutations/team/deleteTeam.gql'

import { GraphqlQueryResponse } from '~/types/apolloTypes'
export interface Trend {
  labels: string[]
  values: number[]
}
export interface OwnerDetailModuleState {
  loading: boolean
  error: Record<string, unknown>
  owner: Owner
  autofixTrend: Trend
  issueTrend: Trend
  resolvedIssueTrend: Trend
  billingInfo?: GetBillingInfoPayload
}

export type IssuePreferences = {
  slug?: Maybe<string>
  isIgnoredInCheckStatus?: Maybe<boolean>
  isIgnoredToDisplay?: Maybe<boolean>
}

export type OwnerDetailModuleActionContext = ActionContext<OwnerDetailModuleState, RootState>

// Getters ------------------------------------------

export enum OwnerDetailGetters {
  CAN_ONBOARD = 'canOnboard',
  ISSUE_PREFERENCES = 'issuePreferences'
}

// Interface to set type annotations for issue preferences getter
interface OwnerDetailModuleGetters extends GetterTree<OwnerDetailModuleState, RootState> {
  [OwnerDetailGetters.CAN_ONBOARD]: (state: OwnerDetailModuleState) => boolean
  [OwnerDetailGetters.ISSUE_PREFERENCES]: (state: OwnerDetailModuleState) => Array<IssuePreferences>
}

export const getters: OwnerDetailModuleGetters = {
  [OwnerDetailGetters.CAN_ONBOARD]: (state): boolean => {
    return Boolean(state.owner.canOnboard)
  },
  [OwnerDetailGetters.ISSUE_PREFERENCES]: (state) => {
    const issuePreferences: Array<IssuePreferences> = []
    state.owner.ownerSetting?.issueTypeSettings?.forEach((issueConfig) => {
      issuePreferences.push({
        slug: issueConfig?.slug,
        isIgnoredInCheckStatus: issueConfig?.isIgnoredInCheckStatus,
        isIgnoredToDisplay: issueConfig?.isIgnoredInCheckStatus
      })
    })
    return issuePreferences
  }
}

// Mutation -----------------------------------------

export enum OwnerDetailMutations {
  SET_ERROR = 'setOwnerDetailError',
  SET_LOADING = 'setOwnerDetailLoading',
  SET_OWNER = 'setOwner',
  SET_OWNER_AUTOFIX_TREND = 'setOwnerAutofixTrend',
  SET_OWNER_ISSUES_TREND = 'setOwnerIssuesTrend',
  SET_OWNER_RESOLVED_ISSUES_TREND = 'setOwnerResolvedIssuesTrend',
  SET_BILLING_INFO = 'setBillingInfo',
  SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting',
  UPDATE_DATA_TIMEOUT_TRIGGER = 'updateDataTimeoutTrigger',
  SET_OWNER_PUBLIC_KEY = 'setOwnerPublicKey'
}

export const mutations: MutationTree<OwnerDetailModuleState> = {
  [OwnerDetailMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [OwnerDetailMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [OwnerDetailMutations.SET_OWNER]: (state, owner) => {
    state.owner = Object.assign({}, state.owner, owner)
  },
  [OwnerDetailMutations.SET_OWNER_AUTOFIX_TREND]: (state, owner: Owner) => {
    state.autofixTrend = owner.autofixedIssueTrend
  },
  [OwnerDetailMutations.SET_OWNER_ISSUES_TREND]: (state, owner: Owner) => {
    state.issueTrend = owner.issueTrend
  },
  [OwnerDetailMutations.SET_OWNER_RESOLVED_ISSUES_TREND]: (state, owner: Owner) => {
    state.resolvedIssueTrend = owner.resolvedIssueTrend
  },
  [OwnerDetailMutations.SET_BILLING_INFO]: (state, billingInfo) => {
    state.billingInfo = billingInfo
  },
  [OwnerDetailMutations.SET_ISSUE_TYPE_SETTING]: (state, args) => {
    const issueSettings = state.owner.ownerSetting?.issueTypeSettings as Array<IssueTypeSetting>
    if (issueSettings) {
      const index = issueSettings.findIndex((issue) => {
        return issue?.slug === args.issueTypeSettingSlug
      })

      if (index > -1 && issueSettings[index]) {
        Object.assign(issueSettings[index], args)
      } else {
        issueSettings.push(args)
      }
    }
  },
  [OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER]: (state, newDataTimeoutTriggerValue) => {
    state.owner.ownerSetting = Object.assign({}, state.owner.ownerSetting, {
      shouldTimeoutDataTrigger: newDataTimeoutTriggerValue
    } as OwnerSetting)
  },
  [OwnerDetailMutations.SET_OWNER_PUBLIC_KEY]: (state, newPublicKey) => {
    state.owner.ownerSetting = Object.assign({}, state.owner.ownerSetting, {
      publicKey: newPublicKey
    } as OwnerSetting)
  }
}

// Actions ------------------------------------------
export enum OwnerDetailActions {
  FETCH_OWNER_ID = 'fetchOwnerId',
  FETCH_OWNER_DETAILS = 'fetchOwnerDetails',
  FETCH_VCS_DATA = 'fetchVCSData',
  FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings',
  FETCH_SHOULD_TIMEOUT_DATA_TRIGGER = 'fetchShouldTimeoutDataTrigger',
  FETCH_ISSUE_TRENDS = 'fetchIssueTrends',
  FETCH_AUTOFIX_TRENDS = 'fetchAutofixTrends',
  FETCH_ACCOUNT_SETUP_STATUS = 'fetchAccountSetupStatus',
  FETCH_APP_CONFIG = 'fetchAppConfig',
  SET_OWNER = 'setOwner',
  FETCH_OWNER_SSH_KEY = 'fetchOwnerSSHKey',
  GENERATE_OWNER_SSH_KEY = 'generateOwnerSSHKey',
  REMOVE_OWNER_SSH_KEY = 'removeOwnerSSHKey',

  SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting',
  SUBMIT_ISSUE_TYPE_SETTINGS = 'submitIssueTypeSettings',
  SYNC_REPOS_FOR_OWNER = 'syncReposForOwner',
  SYNC_SINGLE_REPO_FOR_OWNER = 'syncSingleRepoForOwner',
  SET_DATA_TIMEOUT_TRIGGER = 'setDataTimeoutTrigger',

  FETCH_BILLING_DETAILS = 'fetchBillingDetails',
  FETCH_SEATS_INFO = 'fetchSeatsInfo',
  FETCH_BILLING_STATUS = 'fetchBillingStatus',
  APPLY_CREDITS = 'applyCredits',
  UPDATE_BILLING_INFO = 'updateBillingInfo',
  GET_BILLING_INFO = 'getBillingInfo',
  CHECKOUT = 'checkout',
  UPDATE_SEATS = 'updateSeats',
  UPDATE_PAYMENT_SOURCE = 'updatePaymentSource',
  CHANGE_SUBSCRIPTION_PLAN = 'changeSubscriptionPlan',
  CANCEL_SUBSCRIPTION_PLAN = 'cancelSubscriptionPlan',
  REVERT_SUBSCRIPTION_CANCELLATION = 'revertSubscriptionCancellation',
  GET_UPGRADE_PLAN_INFO = 'getUpgradePlanInfo',

  FETCH_MAX_USAGE_PERCENTAGE = 'fetchmaxUsagePercentage',
  FETCH_USAGE_DETAILS = 'fetchUsageDetails',

  VERIFY_GSR_PERMISSIONS = 'verifyGsrPermissions',
  VERIFY_GSR_WEBHOOKS = 'verifyGsrWebhooks',
  VERIFY_GSR_SSH = 'verifyGsrSsh',
  VERIFY_GSR_SETUP = 'verifyGsrSetup',

  FETCH_INTEGRATIONS_FOR_FEATURE = 'fetchIntegrationsForFeature',

  DELETE_TEAM = 'deleteTeam'
}

interface OwnerDetailModuleActions extends ActionTree<OwnerDetailModuleState, RootState> {
  [OwnerDetailActions.FETCH_OWNER_ID]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_OWNER_DETAILS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_VCS_DATA]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_ISSUE_TRENDS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; lastDays: number | null }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_AUTOFIX_TRENDS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; lastDays: number | null }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_APP_CONFIG]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_BILLING_DETAILS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_SEATS_INFO]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_BILLING_STATUS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<{ status?: SubscriptionStatusChoice | undefined }>

  [OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; preferences: IssueTypeSetting[] }
  ) => Promise<void>

  [OwnerDetailActions.SYNC_REPOS_FOR_OWNER]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext
  ) => Promise<void>

  [OwnerDetailActions.SYNC_SINGLE_REPO_FOR_OWNER]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: SyncRepositoryForOwnerInput
  ) => Promise<boolean>

  [OwnerDetailActions.SET_OWNER]: (injectee: OwnerDetailModuleActionContext, owner: Owner) => void

  [OwnerDetailActions.SET_ISSUE_TYPE_SETTING]: (
    injectee: OwnerDetailModuleActionContext,
    args: {
      isIgnoredInCheckStatus: IssueTypeSetting['isIgnoredInCheckStatus']
      isIgnoredToDisplay: IssueTypeSetting['isIgnoredToDisplay']
      issueTypeSettingSlug: string
    }
  ) => void

  [OwnerDetailActions.APPLY_CREDITS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { amount: number }
  ) => Promise<void>

  [OwnerDetailActions.UPDATE_BILLING_INFO]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { billingEmail: string; billingAddress: string; login: string; provider: string }
  ) => Promise<void>

  [OwnerDetailActions.GET_BILLING_INFO]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      productSlug?: string
      planSlug?: string
      quantity?: number
      couponCode?: string
      isTrial?: boolean
    }
  ) => Promise<void>

  [OwnerDetailActions.CHECKOUT]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      email: string
      name: string
      token: string
      planSlug: string
      seats: number
      coupon: string
      installationId: string
    }
  ) => Promise<SubscriptionCheckoutPayload>

  [OwnerDetailActions.UPDATE_SEATS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      id: string
      seats: number
    }
  ) => Promise<UpdateCodeQualitySubscriptionSeatsPayload>

  [OwnerDetailActions.UPDATE_PAYMENT_SOURCE]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      id: string
      token: string
      action: UpdatePaymentActionChoice
    }
  ) => Promise<UpdateDefaultPaymentSourcePayload>

  [OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      id: string
      planSlug: string
    }
  ) => Promise<void>

  [OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      id: string
      planSlug: string
    }
  ) => Promise<void>

  [OwnerDetailActions.GET_UPGRADE_PLAN_INFO]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      id: string
      planSlug: string
    }
  ) => Promise<GetUpgradeCodeQualitySubscriptionPlanInfoPayload>

  [OwnerDetailActions.FETCH_OWNER_SSH_KEY]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string }
  ) => Promise<void>

  [OwnerDetailActions.GENERATE_OWNER_SSH_KEY]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { ownerId: string }
  ) => Promise<void>

  [OwnerDetailActions.REMOVE_OWNER_SSH_KEY]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { ownerId: string }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_USAGE_DETAILS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.FETCH_MAX_USAGE_PERCENTAGE]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.VERIFY_GSR_PERMISSIONS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: VerifyGsrPermissionsInput
  ) => Promise<VerifyGsrPermissionsPayload>

  [OwnerDetailActions.VERIFY_GSR_SSH]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: TriggerVerifyGsrsshInput
  ) => Promise<TriggerVerifyGsrsshPayload>

  [OwnerDetailActions.VERIFY_GSR_WEBHOOKS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: VerifyGsrWebhooksInput
  ) => Promise<VerifyGsrWebhooksPayload>

  [OwnerDetailActions.VERIFY_GSR_SETUP]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: VerifyGsrSetupInput
  ) => Promise<VerifyGsrSetupPayload>

  [OwnerDetailActions.FETCH_INTEGRATIONS_FOR_FEATURE]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: {
      login: string
      provider: string
      feature: IntegrationFeature
      refetch?: boolean
    }
  ) => Promise<void>
  [OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { ownerId: string; shouldTimeoutDataTrigger: boolean }
  ) => Promise<boolean>

  [OwnerDetailActions.FETCH_SHOULD_TIMEOUT_DATA_TRIGGER]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.DELETE_TEAM]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: DeleteTeamInput
  ) => Promise<boolean>
}

export const actions: OwnerDetailModuleActions = {
  async [OwnerDetailActions.FETCH_OWNER_ID]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        OwnerIDQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      this.$logErrorAndToast(e as Error)
    }
  },

  async [OwnerDetailActions.FETCH_OWNER_DETAILS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(
        OwnerDetailQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_VCS_DATA]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      VCSData,
      {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value
      },
      args.refetch
    )
    commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
  },
  async [OwnerDetailActions.FETCH_OWNER_DETAILS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(
        OwnerDetailQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(IssueTypeSettingsGQLQuery, {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value
      })
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.FETCH_SHOULD_TIMEOUT_DATA_TRIGGER]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      ownerPreferences,
      {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value
      },
      args.refetch
    )
    const ownerSetting = response?.data?.owner?.ownerSetting as OwnerSetting

    commit(OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER, ownerSetting?.shouldTimeoutDataTrigger)
  },

  async [OwnerDetailActions.FETCH_ISSUE_TRENDS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(IssueTrendsGQLQuery, {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value,
        lastDays: args.lastDays
      })
      commit(OwnerDetailMutations.SET_OWNER_ISSUES_TREND, response.data.owner)
      commit(OwnerDetailMutations.SET_OWNER_RESOLVED_ISSUES_TREND, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_AUTOFIX_TRENDS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(AutofixTrendsGQLQuery, {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value,
        lastDays: args.lastDays
      })
      commit(OwnerDetailMutations.SET_OWNER_AUTOFIX_TREND, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(
        AccountSetupStatus,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_APP_CONFIG]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        AppConfig,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was an error fetching configuration from VCS provider.'
      )
    }
  },

  async [OwnerDetailActions.FETCH_BILLING_DETAILS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$fetchGraphqlData(
        BillingDetails,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.FETCH_SEATS_INFO]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        SeatsInfo,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Something went wrong while fetching seats used information.'
      )
    }
  },

  async [OwnerDetailActions.FETCH_BILLING_STATUS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = (await this.$fetchGraphqlData(
        BillingDetails,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )) as GraphqlQueryResponse
      if (response.data.owner?.billingInfo?.status) {
        commit(OwnerDetailMutations.SET_LOADING, false)
        return { status: response.data.owner.billingInfo.status }
      }
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
    }
    commit(OwnerDetailMutations.SET_LOADING, false)
    return { status: undefined }
  },

  async [OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS]({ commit, state }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(UpdateOwnerSettingsGQLMutation, {
        input: {
          ownerId: state.owner.id,
          issueTypeSettings: args.preferences
        }
      })
      const response = await this.$fetchGraphqlData(
        IssueTypeSettingsGQLQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        true
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.SYNC_REPOS_FOR_OWNER]({ commit, state }) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(SyncRepositories, {
        ownerId: state.owner.id
      })
      commit(OwnerDetailMutations.SET_LOADING, false)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.SYNC_SINGLE_REPO_FOR_OWNER](_, args) {
    const res = await this.$applyGraphqlMutation(SyncOwnerRepository, { input: args })
    const data = res?.data?.syncRepositoryForOwner as SyncRepositoriesForOwnerPayload
    return Boolean(data.ok)
  },

  [OwnerDetailActions.SET_OWNER]({ commit }, owner) {
    commit(OwnerDetailMutations.SET_OWNER, owner)
  },

  [OwnerDetailActions.SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(OwnerDetailMutations.SET_ISSUE_TYPE_SETTING, args)
  },

  async [OwnerDetailActions.APPLY_CREDITS]({ commit, state }, { amount }) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(ApplyCredits, {
        ownerId: state.owner.id,
        amount
      })
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.UPDATE_BILLING_INFO](
    { commit, state },
    { billingAddress, billingEmail, login, provider }
  ) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const args = {
        ownerId: state.owner.id,
        billingAddress,
        billingEmail
      }
      const refetchQueries = {
        query: BillingDetails,
        variables: {
          login: login,
          provider: this.$providerMetaMap[provider].value
        },
        fetchPolicy: 'network-only'
      }

      const response = await this.$applyGraphqlMutation(UpdateBillingInfo, args, refetchQueries)
      commit(OwnerDetailMutations.SET_OWNER, response.data.updateBillingInfo)
      return response
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.GET_BILLING_INFO]({ commit, state }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(GetBillingInfo, {
        ownerId: state.owner.id,
        ...args
      })
      commit(OwnerDetailMutations.SET_BILLING_INFO, response.data.getBillingInfo)
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.CHECKOUT]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(Checkout, args)
      return response.data.subscriptionCheckout || {}
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.UPDATE_SEATS]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(UpdateSeats, args)
      return response.data.updateCodeQualitySubscriptionSeats || {}
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },

  async [OwnerDetailActions.UPDATE_PAYMENT_SOURCE]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(UpdatePaymentSource, args)
      return response.data.updateDefaultPaymentSource || {}
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(ChangePlan, args)
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(CancelPlan, args)
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.REVERT_SUBSCRIPTION_CANCELLATION]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(ResumePlan, args)
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.GET_UPGRADE_PLAN_INFO]({ commit }, args) {
    try {
      commit(OwnerDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(GetUpgradePlanInfo, args, true)
      return response.data.planInfo as GetUpgradeCodeQualitySubscriptionPlanInfoPayload
    } catch (e) {
      commit(OwnerDetailMutations.SET_ERROR, e)
      throw e
    } finally {
      commit(OwnerDetailMutations.SET_LOADING, false)
    }
  },
  async [OwnerDetailActions.FETCH_OWNER_SSH_KEY]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      OwnerSSHPublicKeyQuery,
      {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value
      },
      true
    )

    const ownerSetting = response?.data?.owner?.ownerSetting as OwnerSetting
    commit(OwnerDetailMutations.SET_OWNER_PUBLIC_KEY, ownerSetting?.publicKey)
  },
  async [OwnerDetailActions.GENERATE_OWNER_SSH_KEY]({ commit }, args) {
    const response = await this.$applyGraphqlMutation(GenerateOwnerSSHPublicKey, args, true)
    const publicKey = response?.data?.generateKeyPairForOwner?.publicKey as string

    if (!publicKey) {
      throw new Error('There was a problem regenerating the key pair, please try later.')
    }

    commit(OwnerDetailMutations.SET_OWNER_PUBLIC_KEY, publicKey)
  },
  async [OwnerDetailActions.REMOVE_OWNER_SSH_KEY]({ commit }, args) {
    const response = await this.$applyGraphqlMutation(RemoveOwnerSSHPublicKey, args, true)
    if (!response.data.removeKeyPairForOwner.ok) {
      throw new Error('There was a problem removing the key pair, please try later.')
    }
    commit(OwnerDetailMutations.SET_OWNER_PUBLIC_KEY, '')
  },
  async [OwnerDetailActions.FETCH_USAGE_DETAILS]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        UsageDetailsGQLQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
    }
  },
  async [OwnerDetailActions.FETCH_MAX_USAGE_PERCENTAGE]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        MaxUsagePercentageGQLQuery,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      const err = e as GraphqlError
      commit(OwnerDetailMutations.SET_ERROR, err)
    }
  },
  async [OwnerDetailActions.VERIFY_GSR_PERMISSIONS](_, args) {
    const response = await this.$applyGraphqlMutation(VerifyGsrPermissions, args, true)
    return response.data.verifyGsrPermissions
  },
  async [OwnerDetailActions.VERIFY_GSR_WEBHOOKS](_, args) {
    const response = await this.$applyGraphqlMutation(VerifyGsrWebhooks, args, true)
    return response.data.verifyGsrWebhooks
  },
  async [OwnerDetailActions.VERIFY_GSR_SSH](_, args) {
    const response = await this.$applyGraphqlMutation(TriggerVerifyGsrSsh, args, true)
    return response.data.triggerVerifyGsrSsh
  },
  async [OwnerDetailActions.VERIFY_GSR_SETUP](_, args) {
    const response = await this.$applyGraphqlMutation(VerifyGsrSetup, args, true)
    return response.data.verifyGsrSetup
  },
  async [OwnerDetailActions.FETCH_INTEGRATIONS_FOR_FEATURE]({ commit }, args) {
    const { provider, login, feature, refetch } = args

    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        OwnerInstalledIntegrations,
        {
          provider: this.$providerMetaMap[provider].value,
          login,
          feature
        },
        refetch
      )

      commit(OwnerDetailMutations.SET_OWNER, response.data.owner)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'There was an error fetching integrations.')
    }
  },
  async [OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER](_, args) {
    const response = (await this.$applyGraphqlMutation(UpdateOwnerDataTriggerTimeoutsGQLMutation, {
      ownerId: args.ownerId,
      shouldTimeoutDataTrigger: args.shouldTimeoutDataTrigger
    })) as GraphqlMutationResponse

    return Boolean(response.data?.updateTimeoutSetting?.ok)
  },
  async [OwnerDetailActions.DELETE_TEAM](_, args) {
    const response = (await this.$applyGraphqlMutation(DeleteTeam, {
      input: args
    })) as GraphqlMutationResponse

    return Boolean(response.data?.deleteTeam?.ok)
  }
}

export const state = (): OwnerDetailModuleState => ({
  ...(<OwnerDetailModuleState>{
    loading: false,
    error: {},
    billingInfo: {},
    autofixTrend: {},
    issueTrend: {},
    resolvedIssueTrend: {},
    owner: {
      features: [],
      accountSetupStatus: [],
      ownerSetting: <OwnerSetting>{
        issueTypeSettings: <Maybe<Array<Maybe<IssueTypeSetting>>>>[]
      },
      maxUsagePercentage: 0,
      featureUsage: []
    }
  })
})
