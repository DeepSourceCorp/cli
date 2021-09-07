import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { OwnerDetailActions } from '~/store/owner/detail'

import {
  Owner,
  GetBillingInfoPayload,
  SubscriptionCheckoutPayload,
  IssueTypeSetting,
  UpdateCodeQualitySubscriptionSeatsPayload,
  UpdatePaymentActionChoice,
  UpdateDefaultPaymentSourcePayload
} from '~/types/types'

const ownerDetailStore = namespace('owner/detail')

@Component
export default class OwnerDetailMixin extends Vue {
  @ownerDetailStore.State
  owner: Owner

  @ownerDetailStore.State
  billingInfo: GetBillingInfoPayload

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

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_BILLING_DETAILS)
  fetchBillingDetails: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.APPLY_CREDITS)
  applyCredits: (args: { amount: number }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.UPDATE_BILLING_INFO)
  updateBillingInfo: (args: {
    billingEmail: string
    billingAddress: string
    login: string
    provider: string
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.GET_BILLING_INFO)
  getBillingInfo: (args: {
    productSlug?: string
    planSlug?: string
    quantity?: number
    couponCode?: string
    isTrial?: boolean
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.CHECKOUT)
  subscriptionCheckout: (args: {
    email: string
    name: string
    token: string
    planSlug: string
    seats: number
    coupon: string
    installationId: string
  }) => Promise<SubscriptionCheckoutPayload>

  @ownerDetailStore.Action(OwnerDetailActions.UPDATE_SEATS)
  updateSeats: (args: {
    id: string
    seats: number
  }) => Promise<UpdateCodeQualitySubscriptionSeatsPayload>

  @ownerDetailStore.Action(OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN)
  changeSubscriptionPlan: (args: { id: string; planSlug: string }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.UPDATE_PAYMENT_SOURCE)
  updatePaymentSource: (args: {
    id: string
    token: string
    action: UpdatePaymentActionChoice
  }) => Promise<UpdateDefaultPaymentSourcePayload>

  @ownerDetailStore.Action(OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS)
  submitIssueTypeSettings: (args: {
    login: string
    provider: string
    preferences: IssueTypeSetting[]
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.SYNC_REPOS_FOR_OWNER)
  syncReposForOwner: () => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN)
  cancelSubscriptionPlan: (args: { id: string }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.REVERT_SUBSCRIPTION_CANCELLATION)
  revertSubscriptionCancellation: (args: { id: string }) => Promise<void>
}
