<template>
  <div class="max-w-5xl p-4 space-y-4">
    <div>
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400"
          ><nuxt-link :to="$generateRoute(['settings', 'billing'])"
            >Billing</nuxt-link
          ></z-breadcrumb-item
        >
        <z-breadcrumb-item class="cursor-pointer">Your Subscription</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <section class="grid grid-cols-2 gap-12">
      <div class="space-y-5">
        <div class="space-y-1">
          <h2 class="text-lg font-medium">Confirm your subscription</h2>
          <p class="text-xs text-vanilla-400">
            You’re subscribing for the <b class="text-vanilla-100">deepsourcelabs</b> team on
            Github.
          </p>
        </div>
        <div class="text-sm space-y-5">
          <div class="flex">
            <label class="w-32 font-medium">Plan</label>
            <div v-if="plan" class="flex-grow text-right">
              {{ plan.planName }}
            </div>
            <div v-else class="flex-grow">
              <div class="h-5 w-24 bg-ink-300 rounded-md animate-pulse float-right"></div>
            </div>
          </div>
          <div class="flex">
            <label class="w-32 font-medium">Billing interval</label>
            <div class="flex-grow text-right">
              <div>{{ billingCycle | capitalize }}</div>
              <span
                class="text-vanilla-400 cursor-pointer text-xs hover:text-vanilla-100"
                @click="updateBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')"
              >
                Change to {{ billingCycle === 'yearly' ? 'monthly' : 'yearly' }}
              </span>
            </div>
          </div>
          <div class="flex">
            <label for="seats-count" class="w-32 font-medium">Seats</label>
            <div class="flex-grow">
              <div class="flex items-center space-x-1 float-right">
                <z-button
                  size="x-small"
                  icon="minus"
                  buttonType="secondary"
                  :disabled="seats <= minSeats"
                  v-on:click.shift="updateSeatsInStore(seats - 4)"
                  @click="updateSeatsInStore(seats - 1)"
                />
                <input
                  aria-label="Seats"
                  id="seats-count"
                  class="w-12 text-center bg-transparent focus:outline-none focus:ring focus:border-ink-100"
                  :value="seats"
                  @debounceInput="updateSeatsInStore"
                  @blur="(e) => updateSeatsInStore(e.target.value)"
                  type="text"
                />
                <z-button
                  size="x-small"
                  icon="plus"
                  buttonType="secondary"
                  :disabled="seats >= maxSeats"
                  v-on:click.shift="updateSeatsInStore(seats + 4)"
                  @click="updateSeatsInStore(seats + 1)"
                />
              </div>
            </div>
          </div>
          <z-divider color="ink-300" />
          <template v-if="coupon.isApplied || credits.isApplied">
            <div class="flex">
              <label class="w-72 font-medium"
                >Amount
                <span class="text-vanilla-400"
                  >({{ seats }} × {{ formatUSD(seatAmount) }}, paid {{ billingCycle }})</span
                ></label
              >
              <div class="flex-grow text-right">
                <z-animated-integer
                  :value="billingInfo.amountPayableThisCycle"
                  :format="formatUSD"
                ></z-animated-integer>
              </div>
            </div>
            <div class="flex" v-if="coupon.isApplied">
              <label class="w-32 font-medium">Coupon Applied</label>
              <div class="flex-grow text-right font-bold text-juniper">
                -
                <z-animated-integer
                  :value="coupon.currentCycleDiscount"
                  :format="formatUSD"
                ></z-animated-integer>
              </div>
            </div>
            <div class="flex" v-if="credits.isApplied">
              <label class="w-32 font-medium">Credits Applied</label>
              <div class="flex-grow text-right font-bold">
                -
                <z-animated-integer
                  :value="credits.currentCycleDiscount"
                  :format="formatUSD"
                ></z-animated-integer>
              </div>
            </div>
            <z-divider color="ink-300" />
          </template>
          <div class="flex">
            <label class="w-32 font-medium">Total payable now</label>
            <div class="flex-grow text-lg font-bold flex justify-end items-center space-x-2">
              <z-icon
                class="animate-spin"
                color="juniper"
                icon="spin-loader"
                v-if="loading"
              ></z-icon>
              <z-animated-integer
                v-if="billingInfo.netPayableThisCycle !== null"
                :value="billingInfo.netPayableThisCycle"
                :format="formatUSD"
              ></z-animated-integer>
            </div>
          </div>
          <z-divider color="ink-300" />
          <p
            class="text-xs text-vanilla-400 leading-snug tracking-snug"
            v-if="billingInfo.netPayableNextCycle !== null && billingInfo.nextBillingCycle !== null"
          >
            You will be charged
            <span class="inline">{{ formatUSD(billingInfo.netPayableNextCycle) }}</span>
            when the next billing cycle starts on
            <b class="text-vanilla-100">{{ nextBillingDate }}</b>
          </p>
          <div v-else-if="calculating" class="h-4 w-full bg-ink-300 rounded-md animate-pulse"></div>
          <div class="space-y-2">
            <z-input
              v-model="couponCode"
              placeholder="Have a coupon? Enter code."
              :showBorder="!couponError"
              :class="{
                'border border-cherry': couponError
              }"
            >
              <template slot="right">
                <z-button
                  @click="redeemCoupon"
                  buttonType="secondary"
                  class="text-vanilla-100 w-24"
                  size="small"
                >
                  <template v-if="couponLoading">
                    <z-icon class="animate-spin" color="juniper" icon="spin-loader"></z-icon>
                  </template>
                  <template v-else>Redeem</template>
                </z-button>
              </template>
            </z-input>
            <p v-if="coupon.description" class="text-xs text-vanilla-100 font-bold">
              {{ coupon.description }}
            </p>
            <p v-if="couponError" class="text-xs text-cherry">This Coupon is Invalid</p>
          </div>
        </div>
      </div>
      <div>
        <stripe-checkout-box :planSlug="planSlug" :coupon="couponCode" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsourcelabs/zeal'
import { ZButton, ZIcon, ZDivider, ZInput, ZAnimatedInteger } from '@deepsourcelabs/zeal'
import SubscriptionMixin, { Plan } from '~/mixins/subscriptionMixin'
import { formatUSD } from '~/utils/string'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { parseISODate, formatDate } from '~/utils/date'
import { CouponInfo, CreditsInfo } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'
import ContextMixin from '~/mixins/contextMixin'

@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZButton,
    ZIcon,
    ZDivider,
    ZInput,
    ZAnimatedInteger
  },
  middleware: ['teamOnly', 'perm'],
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
export default class Subscribe extends mixins(SubscriptionMixin, OwnerDetailMixin, ContextMixin) {
  private plan: Plan
  private loading = false
  private calculating = false
  private couponCode = ''
  private couponError = false
  private couponLoading = false

  created() {
    const { plan } = this.$route.params
    this.plan = this.planDetails[plan]
  }

  async fetch(): Promise<void> {
    await this.fetchContext()
    await this.getOwner()
    await this.calculate()
  }

  async updateBillingCycle(billingCycle: 'yearly' | 'monthly'): Promise<void> {
    this.loading = true
    this.setPlan({ billingCycle })
    await this.calculate()
    this.loading = false
  }

  async updateSeatsInStore(seats: number): Promise<void> {
    this.loading = true
    seats = Number(seats)
    this.setPlan({ seats: Math.min(Math.max(seats, this.minSeats), this.maxSeats) })
    await this.calculate()
    this.loading = false
  }

  get maxSeats(): number {
    return this.context.plans[this.planSlug].max_seats
  }

  get minSeats(): number {
    return this.context.plans[this.planSlug].min_seats
  }

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

  async getOwner(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      login: owner,
      provider
    })
  }

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

  get coupon(): CouponInfo | {} {
    return this.billingInfo.discounts?.coupon || {}
  }

  get credits(): CreditsInfo | {} {
    return this.billingInfo.discounts?.credits || {}
  }

  private formatUSD = formatUSD

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
