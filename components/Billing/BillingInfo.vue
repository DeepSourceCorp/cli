<template>
  <form-group label="Billing Information" :divide="false" bodyClass="space-y-4" class="mt-5">
    <div v-if="isBilledByStripe || isBilledManually">
      <div
        class="grid w-full grid-cols-1 border rounded-md border-opacity-70 md:grid-cols-2 border-slate-400"
      >
        <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 bg-ink-300">
          <div v-if="ownerBillingInfo.upcomingPaymentDate">
            <label class="text-sm leading-none tracking-wide text-vanilla-300"> Renews on </label>
            <div class="text-lg font-medium text-vanilla-100 tracking-snug">
              {{ formatDate(parseISODate(ownerBillingInfo.upcomingPaymentDate)) }}
            </div>
          </div>
          <div v-if="!isBilledManually && ownerBillingInfo.upcomingBillAmount">
            <label class="text-sm leading-none tracking-wide text-vanilla-300">
              Renewal amount
            </label>
            <div class="text-lg font-medium text-vanilla-100 tracking-snug">
              {{ formatUSD(ownerBillingInfo.upcomingBillAmount) }}
            </div>
          </div>
          <div
            v-if="ownerBillingInfo.outstandingCredits && ownerBillingInfo.outstandingCredits >= 0"
          >
            <label class="text-sm leading-none tracking-wide text-vanilla-300"> Credits </label>
            <div class="text-lg font-medium text-juniper tracking-snug">
              {{ formatUSD(ownerBillingInfo.outstandingCredits) }}
            </div>
          </div>
          <div v-if="!isBilledManually" class="md:col-span-2">
            <label class="text-sm leading-none tracking-wide text-vanilla-300">
              Billing interval
            </label>
            <div class="flex items-baseline space-x-2">
              <div class="text-lg font-medium text-vanilla-100 tracking-snug">
                <template v-if="currentPlan.mode === MODE.MONTHLY"> Monthly </template>
                <template v-else-if="currentPlan.mode === MODE.ANNUAL"> Yearly </template>
              </div>
              <button
                class="text-xs hover:text-vanilla-100 text-vanilla-400"
                @click="togglePlanChange"
              >
                (switch to
                {{ currentPlan.mode === MODE.MONTHLY ? 'yearly and save 20%' : 'monthly' }})
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between p-4">
          <div class="space-y-2.5 flex-grow">
            <div v-if="owner.billingEmail !== undefined" class="flex items-center justify-between">
              <label class="w-1/3 text-sm text-vanilla-300">Billing email</label>
              <span
                v-if="owner.billingEmail && !showBillingDetailsLoading"
                class="w-2/3 text-sm text-right text-vanilla-400"
                >{{ owner.billingEmail }}</span
              >
            </div>
            <div v-else class="flex items-center justify-between animate-pulse">
              <div class="float-right h-4 rounded-md w-22 bg-ink-200 animate-pulse"></div>
              <div class="float-right w-40 h-4 rounded-md bg-ink-200 animate-pulse"></div>
            </div>
            <div
              v-if="owner.billingAddress !== undefined && !showBillingDetailsLoading"
              class="flex items-start justify-between"
            >
              <label class="w-1/3 text-sm text-vanilla-300">Billing address</label>
              <span class="w-2/3 text-sm text-right text-vanilla-400">{{
                owner.billingAddress
              }}</span>
            </div>
            <div v-else class="flex items-start justify-between animate-pulse">
              <div class="float-right h-4 rounded-md w-22 bg-ink-200 animate-pulse"></div>
              <div class="space-y-2">
                <div class="float-right w-40 h-4 rounded-md bg-ink-200 animate-pulse"></div>
                <div class="float-right w-32 h-4 rounded-md bg-ink-200 animate-pulse"></div>
              </div>
            </div>
            <div v-if="ownerBillingInfo.couponApplied" class="flex items-center justify-between">
              <label class="w-1/3 text-sm text-vanilla-300">Coupon</label>
              <div class="w-2/3 text-right">
                <span
                  v-if="ownerBillingInfo.couponApplied"
                  class="text-sm tracking-wide uppercase text-vanilla-400"
                >
                  {{ ownerBillingInfo.couponApplied.code }}
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <z-button
              @click="toggleBillingDetailUpdateModal"
              size="x-small"
              button-type="secondary"
              class="uppercase bg-ink-400 text-vanilla-400"
            >
              <z-icon icon="edit" size="x-small" class="mr-1.5" />
              Edit
            </z-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isBilledByGitHub">
      <alert-box bg-color="bg-robin" text-color="text-robin-150">
        <div
          class="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-10 md:justify-between"
        >
          <div>
            <p class="mb-2 text-base font-medium leading-none">
              Your billing is managed via <span class="font-bold">GitHub</span>.
            </p>
            <p>
              Please check your GitHub billing page for more updates and to make changes to your
              plan, including adding or removing seats.
            </p>
          </div>
          <span
            class="rounded-sm bg-robin bg-opacity-20 hover:bg-opacity-40 focus-within:bg-opacity-40"
          >
            <z-button
              type="button"
              button-type="ghost"
              icon="external-link"
              icon-size="x-small"
              icon-color="vanilla-100"
              label="Open GitHub billing"
              size="small"
              :to="`https://github.com/organizations/${owner.login}/settings/billing`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-vanilla-100 hover:bg-opacity-0"
            />
          </span>
        </div>
      </alert-box>
    </div>
    <div v-else class="w-full rounded-md h-36 bg-ink-300 animate-pulse"></div>
    <div v-if="isBilledManually">
      <alert-box bg-color="bg-robin" text-color="text-robin-150">
        <div
          class="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-10 md:justify-between"
        >
          <div>
            <p class="mb-2 text-base font-medium leading-none">Your billing is managed manually.</p>
            <p>Please contact support for more updates and to make changes to your plan.</p>
          </div>
          <span
            class="rounded-sm bg-robin bg-opacity-20 hover:bg-opacity-40 focus-within:bg-opacity-40"
          >
            <nuxt-link to="/support">
              <z-button
                type="button"
                button-type="ghost"
                icon="support"
                icon-size="x-small"
                icon-color="vanilla-100"
                label="Contact DeepSource"
                size="small"
                rel="noopener noreferrer"
                class="text-vanilla-100 hover:bg-opacity-0"
              />
            </nuxt-link>
          </span>
        </div>
      </alert-box>
    </div>
    <portal to="modal">
      <update-billing-details-modal
        v-if="showUpdateBillingsModal"
        @setLoading="setLoadingForBillingDetails"
        @onClose="toggleBillingDetailUpdateModal"
      />
      <update-subscription-modal
        :new-plan-name="planAlternateInterval"
        v-if="showPlanUpdateModal"
        @close="showPlanUpdateModal = false"
      />
    </portal>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import { FormGroup } from '~/components/Form'
import UpdateBillingDetailsModal from './Modals/UpdateBillingDetailsModal.vue'
import { ZButton, ZIcon } from '@deepsource/zeal'

import { parseISODate, formatDate } from '~/utils/date'
import { formatUSD } from '~/utils/string'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

/**
 * Billing information component for the billing page that shows renewal date, renewal amount,
 * billing interval, billing email & address. Allows editing the billing email and address.
 * Allows switching between monthly and yearly billing.
 */
@Component({
  components: {
    FormGroup,
    ZButton,
    ZIcon,
    UpdateBillingDetailsModal
  },
  layout: 'dashboard',
  methods: {
    parseISODate,
    formatDate,
    formatUSD
  }
})
export default class BillingInfoBox extends mixins(OwnerBillingMixin) {
  public showCouponInput = false
  public couponCode = ''
  public togglePlanLoading = false
  public showUpdateBillingsModal = false
  public showPlanUpdateModal = false
  public showBillingDetailsLoading = false

  /**
   * Fetch hook for the component.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchBillingDetails({
      login: owner,
      provider
    })
  }

  get planAlternateInterval(): string {
    return `plan-${this.currentPlan.slug}-${
      this.currentPlan.mode === this.MODE.ANNUAL ? 'monthly' : 'annual'
    }`
  }

  /**
   * Toggles hide/show state for billing interval modal.
   *
   * @returns {void}
   */
  togglePlanChange(): void {
    this.showPlanUpdateModal = !this.showPlanUpdateModal
  }

  /**
   * Toggles hide/show state for edit billing email and address modal.
   *
   * @returns {void}
   */
  toggleBillingDetailUpdateModal(): void {
    this.showUpdateBillingsModal = !this.showUpdateBillingsModal
  }

  /**
   * Sets `BillingInfoBox` into loading state.
   *
   * @returns {void}
   */
  setLoadingForBillingDetails(val: boolean): void {
    this.showBillingDetailsLoading = val
  }
}
</script>
