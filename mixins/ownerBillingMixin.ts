import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { OwnerDetailActions } from '~/store/owner/detail'
import BillingBackend from '~/types/billingBackend'

import {
  GetBillingInfoPayload,
  SubscriptionCheckoutPayload,
  UpdateCodeQualitySubscriptionSeatsPayload,
  UpdatePaymentActionChoice,
  UpdateDefaultPaymentSourcePayload,
  BillingInfo,
  GetUpgradeCodeQualitySubscriptionPlanInfoPayload,
  SubscriptionStatusChoice
} from '~/types/types'
import ContextMixin from './contextMixin'
import OwnerDetailMixin from './ownerDetailMixin'

const ownerDetailStore = namespace('owner/detail')

@Component
export default class OwnerBillingMixin extends mixins(OwnerDetailMixin, ContextMixin) {
  @ownerDetailStore.State
  billingInfo: GetBillingInfoPayload

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_BILLING_DETAILS)
  fetchBillingDetails: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_SEATS_INFO)
  fetchSeatsInfo: (args: { login: string; provider: string; refetch?: boolean }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.FETCH_BILLING_STATUS)
  fetchBillingStatus: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<{ status: SubscriptionStatusChoice | undefined }>

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

  @ownerDetailStore.Action(OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN)
  cancelSubscriptionPlan: (args: { id: string }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.REVERT_SUBSCRIPTION_CANCELLATION)
  revertSubscriptionCancellation: (args: { id: string }) => Promise<void>

  @ownerDetailStore.Action(OwnerDetailActions.GET_UPGRADE_PLAN_INFO)
  getUpgradePlanInfo: (args: {
    id: string
    planSlug: string
  }) => Promise<GetUpgradeCodeQualitySubscriptionPlanInfoPayload>

  MODE = {
    MONTHLY: 'monthly',
    ANNUAL: 'annual'
  }

  get ownerBillingInfo(): BillingInfo {
    return (this.owner.billingInfo ?? {}) as BillingInfo
  }

  get billingBackendHandler(): string {
    const billingHandlerMap = {
      [BillingBackend.st]: 'Stripe',
      [BillingBackend.mb]: 'Manual billing',
      [BillingBackend.gh]: 'GitHub'
    }

    if (Object.keys(this.ownerBillingInfo).length)
      return billingHandlerMap[this.ownerBillingInfo.billingBackend as BillingBackend]

    return ''
  }

  get currentPlan(): Record<string, string | number> {
    if (Object.keys(this.ownerBillingInfo).length) {
      const { planSlug } = this.ownerBillingInfo
      if (planSlug) {
        const planInfo = this.context.plans[planSlug]

        // Show `Enterprise` as plan for cloud customers on manual billing
        // plan-premium-monthly/plan-premium-annual
        if (this.isBilledManually && planSlug.includes('premium')) {
          return { ...planInfo, name: 'Enterprise' }
        }

        return planInfo ?? {}
      }
    }

    return {}
  }

  get isBilledByStripe(): boolean {
    return this.ownerBillingInfo.billingBackend === BillingBackend.st
  }

  get isBilledByGitHub(): boolean {
    return this.ownerBillingInfo.billingBackend === BillingBackend.gh
  }

  get isBilledManually(): boolean {
    return this.ownerBillingInfo.billingBackend === BillingBackend.mb
  }

  get isBillingScaPending(): boolean {
    return this.ownerBillingInfo.status === SubscriptionStatusChoice.ScaRequired
  }

  get isBillingPastDue(): boolean {
    return this.ownerBillingInfo.status === SubscriptionStatusChoice.PastDue
  }
}
