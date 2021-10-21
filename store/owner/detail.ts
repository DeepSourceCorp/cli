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
  UpdateDefaultPaymentSourcePayload
} from '~/types/types'
import { GraphqlError } from '~/types/apollo-graphql-types'

import OwnerDetailQuery from '~/apollo/queries/owner/details.gql'
import AccountSetupStatus from '~/apollo/queries/owner/accountSetupStatus.gql'
import IssueTrendsGQLQuery from '~/apollo/queries/owner/issueTrends.gql'
import AutofixTrendsGQLQuery from '~/apollo/queries/owner/autofixTrends.gql'
import SyncRepositories from '~/apollo/mutations/owner/syncRepositories.gql'

// Settings
import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'

// Billing
import BillingDetails from '~/apollo/queries/owner/billing.gql'
import ApplyCredits from '~/apollo/mutations/owner/applyCreditsToOwner.gql'
import UpdateBillingInfo from '~/apollo/mutations/owner/updateBillingInfo.gql'
import GetBillingInfo from '~/apollo/mutations/owner/getBillingInfo.gql'
import Checkout from '~/apollo/mutations/owner/checkout.gql'
import UpdateSeats from '~/apollo/mutations/owner/updateSeats.gql'
import ChangePlan from '~/apollo/mutations/owner/changePlan.gql'
import UpdatePaymentSource from '~/apollo/mutations/owner/updatePaymentSource.gql'
import CancelPlan from '~/apollo/mutations/owner/cancelPlan.gql'
import ResumePlan from '~/apollo/mutations/owner/resumePlan.gql'

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
  SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'
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
  }
}

// Actions ------------------------------------------
export enum OwnerDetailActions {
  FETCH_OWNER_DETAILS = 'fetchOwnerDetails',
  FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings',
  FETCH_ISSUE_TRENDS = 'fetchIssueTrends',
  FETCH_AUTOFIX_TRENDS = 'fetchAutofixTrends',
  FETCH_ACCOUNT_SETUP_STATUS = 'fetchAccountSetupStatus',
  SET_OWNER = 'setOwner',

  SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting',
  SUBMIT_ISSUE_TYPE_SETTINGS = 'submitIssueTypeSettings',
  SYNC_REPOS_FOR_OWNER = 'syncReposForOwner',

  FETCH_BILLING_DETAILS = 'fetchBillingDetails',
  APPLY_CREDITS = 'applyCredits',
  UPDATE_BILLING_INFO = 'updateBillingInfo',
  GET_BILLING_INFO = 'getBillingInfo',
  CHECKOUT = 'checkout',
  UPDATE_SEATS = 'updateSeats',
  UPDATE_PAYMENT_SOURCE = 'updatePaymentSource',
  CHANGE_SUBSCRIPTION_PLAN = 'changeSubscriptionPlan',
  CANCEL_SUBSCRIPTION_PLAN = 'cancelSubscriptionPlan',
  REVERT_SUBSCRIPTION_CANCELLATION = 'revertSubscriptionCancellation'
}

interface OwnerDetailModuleActions extends ActionTree<OwnerDetailModuleState, RootState> {
  [OwnerDetailActions.FETCH_OWNER_DETAILS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
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

  [OwnerDetailActions.FETCH_BILLING_DETAILS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>

  [OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext,
    args: { login: string; provider: string; preferences: IssueTypeSetting[] }
  ) => Promise<void>

  [OwnerDetailActions.SYNC_REPOS_FOR_OWNER]: (
    this: Store<RootState>,
    injectee: OwnerDetailModuleActionContext
  ) => Promise<void>

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
}

export const actions: OwnerDetailModuleActions = {
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

  [OwnerDetailActions.SET_OWNER]({ commit }, owner) {
    commit(OwnerDetailMutations.SET_OWNER, owner)
  },

  [OwnerDetailActions.SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(OwnerDetailMutations.SET_ISSUE_TYPE_SETTING, args)
  },

  async [OwnerDetailActions.APPLY_CREDITS]({ commit, state, getters }, { amount }) {
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
      accountSetupStatus: [],
      ownerSetting: <OwnerSetting>{
        issueTypeSettings: <Maybe<Array<Maybe<IssueTypeSetting>>>>[]
      }
    }
  })
})
