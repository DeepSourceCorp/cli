<template>
  <div class="max-w-5xl p-4 space-y-4">
    <div>
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400"
          ><nuxt-link :to="$generateRoute(['settings', 'billing'])"
            >Billing</nuxt-link
          ></z-breadcrumb-item
        >
        <z-breadcrumb-item class="cursor-pointer">Your subscription</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <section class="grid grid-cols-2 gap-12">
      <div class="space-y-5">
        <div class="space-y-1">
          <h2 class="text-lg font-medium">Confirm your subscription</h2>
          <p class="text-xs text-vanilla-400">
            You’re subscribing for the
            <b class="text-vanilla-100">{{ $route.params.owner }}</b> team on
            {{ $providerMetaMap[$route.params.provider].text }}.
          </p>
        </div>
        <div class="space-y-5 text-sm">
          <div class="flex">
            <label class="w-32 font-medium">Plan</label>
            <div v-if="plan" class="flex-grow text-right">
              {{ plan.planName }}
            </div>
            <div v-else class="flex-grow">
              <div class="float-right w-24 h-5 rounded-md bg-ink-300 animate-pulse"></div>
            </div>
          </div>
          <div class="flex">
            <label class="w-32 font-medium">Billing interval</label>
            <div class="flex-grow text-right">
              <div>{{ billingCycle | capitalize }}</div>
              <span
                class="text-xs cursor-pointer text-vanilla-400 hover:text-vanilla-100"
                @click="updateBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')"
              >
                Change to {{ billingCycle === 'yearly' ? 'monthly' : 'yearly' }}
              </span>
            </div>
          </div>
          <div class="flex">
            <label for="seats-count" class="w-32 font-medium">Seats</label>
            <div class="flex-grow">
              <div class="flex items-center float-right space-x-1">
                <z-button
                  size="x-small"
                  icon="minus"
                  button-type="secondary"
                  :disabled="seats <= minSeats"
                  @click.shift="updateSeatsInStore(seats - 4)"
                  @click="updateSeatsInStore(seats - 1)"
                />
                <input
                  id="seats-count"
                  aria-label="Seats"
                  class="w-12 text-center bg-transparent focus:outline-none focus:ring focus:border-slate-400"
                  :value="seats"
                  type="text"
                  @debounceInput="updateSeatsInStore"
                  @blur="(e) => updateSeatsInStore(e.target.value)"
                />
                <z-button
                  size="x-small"
                  icon="plus"
                  button-type="secondary"
                  :disabled="seats >= maxSeats"
                  @click.shift="updateSeatsInStore(seats + 4)"
                  @click="updateSeatsInStore(seats + 1)"
                />
              </div>
            </div>
          </div>
          <z-divider color="ink-300" />
          <template v-if="coupon.isApplied || credits.isApplied">
            <div class="flex">
              <label class="font-medium w-72"
                >Amount
                <span class="text-vanilla-400"
                  >({{ seats }} × {{ formatUSD(seatAmount) }}, paid {{ billingCycle }})</span
                ></label
              >
              <div class="flex-grow text-right">
                <span>{{ formatUSD(billingInfo.amountPayableThisCycle) }}</span>
              </div>
            </div>
            <div v-if="coupon.isApplied" class="flex">
              <label class="w-32 font-medium">Coupon Applied</label>
              <div class="flex-grow font-bold text-right text-juniper">
                -
                <span>
                  {{ formatUSD(coupon.currentCycleDiscount) }}
                </span>
              </div>
            </div>
            <div v-if="credits.isApplied" class="flex">
              <label class="w-32 font-medium">Credits Applied</label>
              <div class="flex-grow font-bold text-right">
                -
                <span>
                  {{ formatUSD(credits.currentCycleDiscount) }}
                </span>
              </div>
            </div>
            <z-divider color="ink-300" />
          </template>
          <div class="flex">
            <label class="w-32 font-medium">Total payable now</label>
            <div class="flex items-center justify-end flex-grow space-x-2 text-lg font-bold">
              <z-icon v-if="loading" class="animate-spin" color="juniper" icon="spin-loader" />
              <span v-if="billingInfo.netPayableThisCycle !== null">
                {{ formatUSD(billingInfo.netPayableThisCycle) }}
              </span>
            </div>
          </div>
          <z-divider color="ink-300" />
          <p
            v-if="billingInfo.netPayableNextCycle !== null && billingInfo.nextBillingCycle !== null"
            class="text-xs leading-snug text-vanilla-400 tracking-snug"
          >
            You will be charged
            <span class="inline">{{ formatUSD(billingInfo.netPayableNextCycle) }}</span>
            when the next billing cycle starts on
            <b class="text-vanilla-100">{{ nextBillingDate }}</b>
          </p>
          <div v-else-if="calculating" class="w-full h-4 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="space-y-2">
            <z-input
              v-model="couponCode"
              placeholder="Have a coupon? Enter code."
              :show-border="!couponError"
              :class="{
                'border border-cherry': couponError
              }"
            >
              <template slot="right">
                <z-button
                  button-type="secondary"
                  class="w-24 text-vanilla-100"
                  size="small"
                  @click="redeemCoupon"
                >
                  <template v-if="couponLoading">
                    <z-icon class="animate-spin" color="juniper" icon="spin-loader" />
                  </template>
                  <template v-else>Redeem</template>
                </z-button>
              </template>
            </z-input>
            <p v-if="coupon.description" class="text-xs font-bold text-vanilla-100">
              {{ coupon.description }}
            </p>
            <p v-if="couponError" class="text-xs text-cherry">This coupon is invalid.</p>
          </div>
        </div>
      </div>
      <div>
        <stripe-checkout-box :plan-slug="planSlug" :coupon="couponCode" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsource/zeal'
import { ZButton, ZIcon, ZDivider, ZInput } from '@deepsource/zeal'
import SubscriptionMixin, { Plan } from '~/mixins/subscriptionMixin'
import { formatUSD } from '~/utils/string'
import { parseISODate, formatDate } from '~/utils/date'
import { debounceAsync } from '~/utils/debounce'
import { CouponInfo, CreditsInfo } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'
import ContextMixin from '~/mixins/contextMixin'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

/**
 * Subscribe page for the user to subscribe to a plan
 */
@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZButton,
    ZIcon,
    ZDivider,
    ZInput
  },
  middleware: ['teamOnly', 'perm'],
  methods: { formatUSD },
  filters: {
    capitalize: function (value: string) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.CHANGE_PLAN, TeamPerms.UPDATE_SEATS, TeamPerms.UPDATE_BILLING_DETAILS]
    }
  }
})
export default class Subscribe extends mixins(SubscriptionMixin, OwnerBillingMixin, ContextMixin) {
  plan: Plan
  loading = false
  calculating = false
  couponCode = ''
  couponError = false
  couponLoading = false
  debouncedCalculate = debounceAsync(this.calculate)

  /**
   * Nuxt created hook, we just fetch he current plan from the route
   * and get the plan details from `planDetails` object
   * @return {any}
   */
  created() {
    const { plan } = this.$route.params
    this.plan = this.planDetails[plan]
  }

  /**
   * Nuxt fetch hook, fetch the context, owner and calculate
   * the pricing for the current configuration set by the user
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchContext()
    await this.getOwner()
    await this.calculate()
  }

  /**
   * Update the billing cycle to either monthly or yearly
   * @param {'yearly'|'monthly'} billingCycle
   * @return {Promise<void>}
   */
  async updateBillingCycle(billingCycle: 'yearly' | 'monthly'): Promise<void> {
    this.loading = true
    this.setPlan({ billingCycle })
    await this.calculate()
    this.loading = false
  }

  /**
   * Update the number of seats. This function also ensures that
   * the number is between the limits for the plan
   * @param {number} seats
   * @return {Promise<void>}
   */
  async updateSeatsInStore(seats: number): Promise<void> {
    this.loading = true
    seats = Number(seats)
    this.setPlan({ seats: Math.min(Math.max(seats, this.minSeats), this.maxSeats) })
    await this.debouncedCalculate()
    this.loading = false
  }

  /**
   * Trigger the billing info GQL mutation to get the billing details
   * for the current configuration and plan
   * @return {Promise<void>}
   */
  async calculate(): Promise<void> {
    this.calculating = true
    await this.getBillingInfo({
      productSlug: 'code-quality',
      planSlug: this.planSlug,
      quantity: this.seats,
      couponCode: this.couponCode ?? '',
      isTrial: false
    })
    this.calculating = false
  }

  /**
   * Method to fetch owner
   * @return {Promise<void>}
   */
  async getOwner(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      login: owner,
      provider
    })
  }

  /**
   * Apply the coupon, trigger calculate and check if the coupon is applied or not
   * @return {Promise<void>}
   */
  async redeemCoupon(): Promise<void> {
    this.couponLoading = true
    await this.calculate()
    if ('isApplied' in this.coupon && this.couponCode) {
      this.couponError = !this.coupon.isApplied
    } else {
      this.couponError = false
    }
    this.couponLoading = false
  }

  get planSlug(): string {
    if (this.plan) {
      return this.billingCycle === 'yearly' ? this.plan.planSlugAnnual : this.plan.planSlugMonthly
    }
    return ''
  }

  get maxSeats(): number {
    return this.context.plans[this.planSlug].max_seats
  }

  get minSeats(): number {
    return this.context.plans[this.planSlug].min_seats
  }

  get coupon(): CouponInfo | {} {
    return this.billingInfo.discounts?.coupon || {}
  }

  get credits(): CreditsInfo | {} {
    return this.billingInfo.discounts?.credits || {}
  }

  get seatAmount(): number {
    if (this.plan.annualAmount && this.plan.monthlyAmount) {
      return this.billingCycle === 'yearly' ? this.plan.annualAmount * 12 : this.plan.monthlyAmount
    }
    return 0
  }

  get nextBillingDate(): string {
    return formatDate(parseISODate(this.billingInfo?.nextBillingCycle))
  }
}
</script>
