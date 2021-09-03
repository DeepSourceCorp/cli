<template>
  <form-group label="Billing Information" :divide="false" bodyClass="space-y-4">
    <div v-if="billedBy === 'Stripe'">
      <div class="grid w-full grid-cols-2 border rounded-md min-h-36 border-ink-300">
        <div class="flex flex-col justify-between px-4 py-3 bg-ink-300">
          <div>
            <label class="text-sm leading-none tracking-wide text-vanilla-300">Next payment</label>
            <div
              v-if="billing.upcomingPaymentDate"
              class="text-2xl font-medium text-vanilla-100 tracking-snug"
            >
              {{ formatDate(parseISODate(billing.upcomingPaymentDate)) }}
            </div>
            <div v-else class="h-10 rounded-md w-44 bg-ink-200 animate-pulse"></div>
          </div>
          <div class="flex items-center justify-between text-sm leading-none text-vanilla-400">
            <span>Credits</span>
            <span
              :class="billing.outstandingCredits > 0 ? 'text-juniper' : ''"
              v-if="billing && billing.outstandingCredits >= 0"
            >
              {{ formatUSD(billing.outstandingCredits) }}
            </span>
            <span v-else class="flex items-center">
              $<span class="h-4 w-3 bg-ink-200 rounded-md animate-pulse ml-1"></span>
            </span>
          </div>
        </div>
        <div class="flex flex-col p-2 px-3 pr-2 space-y-2.5">
          <div class="text-right">
            <z-button
              @click="toggleBillingDetailUpdateModal"
              size="x-small"
              buttonType="secondary"
              class="bg-ink-400 text-vanilla-400 uppercase"
            >
              <z-icon icon="edit" size="x-small" class="mr-1.5"></z-icon>
              Edit
            </z-button>
          </div>
          <div v-if="owner.billingEmail !== undefined" class="flex items-center justify-between">
            <label class="w-1/3 text-sm text-vanilla-300">Billing email</label>
            <span
              v-if="owner.billingEmail && !showBillingDetailsLoading"
              class="w-2/3 text-sm text-right text-vanilla-400"
              >{{ owner.billingEmail }}</span
            >
          </div>
          <div v-else class="flex items-center justify-between animate-pulse">
            <div class="h-4 w-22 bg-ink-200 rounded-md animate-pulse float-right"></div>
            <div class="h-4 w-40 bg-ink-200 rounded-md animate-pulse float-right"></div>
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
            <div class="h-4 w-22 bg-ink-200 rounded-md animate-pulse float-right"></div>
            <div class="space-y-2">
              <div class="h-4 w-40 bg-ink-200 rounded-md animate-pulse float-right"></div>
              <div class="h-4 w-32 bg-ink-200 rounded-md animate-pulse float-right"></div>
            </div>
          </div>
          <div v-if="billing.couponApplied" class="flex items-center justify-between">
            <label class="w-1/3 text-sm text-vanilla-300">Coupon</label>
            <div class="w-2/3 text-right">
              <span
                v-if="billing.couponApplied"
                class="text-sm tracking-wide uppercase text-vanilla-400"
              >
                {{ billing.couponApplied.code }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h5 class="text-vanilla-100 font-semibold text-sm">Payment method</h5>
        <div class="mt-5">
          <div v-if="billing.activeCard" class="flex items-center justify-between w-full">
            <div class="space-x-4 flex items-center">
              <img
                :src="
                  require(`~/assets/images/payments/${getCardIcon(billing.activeCard.brand)}.png`)
                "
                :alt="billing.activeCard.brand"
                class="h-6 w-auto"
              />
              <div class="text-vanilla-100 ml-6 leading-5">{{ billing.activeCard.brand }}</div>
            </div>
            <div class="text-vanilla-400">
              <span>•••• •••• ••••</span>
              <span>{{ billing.activeCard.endingIn }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <alert-box bg-color="bg-robin" text-color="text-light-robin">
        <div
          v-if="billedBy === 'GitHub'"
          class="
            flex flex-col
            md:flex-row
            space-y-4
            md:space-y-0 md:space-x-10
            md:justify-between
            items-start
          "
        >
          <div>
            <p class="font-medium mb-2 text-base leading-none">
              Your billing is managed via <span class="font-bold">GitHub</span>.
            </p>
            <p>
              Please check your GitHub billing page for more updates and to make changes to your
              plan.
            </p>
          </div>
          <span
            class="bg-robin bg-opacity-20 hover:bg-opacity-40 focus-within:bg-opacity-40 rounded-sm"
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
    <portal to="modal">
      <update-billing-details-modal
        v-if="showUpdateBillingsModal"
        @setLoading="setLoadingForBillingDetails"
        @onClose="toggleBillingDetailUpdateModal"
      />
    </portal>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { BillingInfo } from '~/types/types'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { FormGroup } from '~/components/Form'
import UpdateBillingDetailsModal from './UpdateBillingDetailsModal.vue'
import { ZButton, ZRadioGroup, ZRadio, ZIcon } from '@deepsourcelabs/zeal'

import { parseISODate, formatDate } from '~/utils/date'
import { formatUSD } from '~/utils/string'

@Component({
  components: {
    FormGroup,
    ZButton,
    ZRadioGroup,
    ZRadio,
    ZIcon,
    UpdateBillingDetailsModal
  },
  layout: 'dashboard'
})
export default class BillingInfoBox extends mixins(OwnerDetailMixin) {
  @Prop({ default: {} })
  billing: BillingInfo

  @Prop({ default: '' })
  billedBy: string

  async fetch(): Promise<void> {
    if (!Object.keys(this.billing).length) {
      const { owner, provider } = this.$route.params
      await this.fetchBillingDetails({
        login: owner,
        provider
      })
    }
  }

  // toggleCoupon(): void {
  //   this.showCouponInput = !this.showCouponInput
  // }

  toggleBillingDetailUpdateModal(): void {
    this.showUpdateBillingsModal = !this.showUpdateBillingsModal
  }

  setLoadingForBillingDetails(val: boolean): void {
    this.showBillingDetailsLoading = val
  }

  getCardIcon(name: string): string {
    const cards: Record<string, string> = {
      'American Express': 'amex',
      'Diners Club': 'diners',
      UnionPay: 'union',
      Discover: 'discover',
      JCB: 'jcb',
      Visa: 'visa',
      Maestro: 'maestro',
      MasterCard: 'mastercard',
      Unknown: 'stripe'
    }

    if (name in cards) {
      return cards[name]
    }
    return 'stripe'
  }

  private parseISODate = parseISODate
  private formatDate = formatDate
  private activeCard = 'active-card'
  private showCouponInput = false
  private couponCode = ''
  private formatUSD = formatUSD
  private showUpdateBillingsModal = false
  private showBillingDetailsLoading = false
}
</script>
