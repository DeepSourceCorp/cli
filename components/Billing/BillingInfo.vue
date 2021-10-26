<template>
  <form-group label="Billing Information" :divide="false" bodyClass="space-y-4">
    <div v-if="isBilledByStripe || isBilledManually">
      <div class="grid w-full grid-cols-1 border rounded-md md:grid-cols-2 min-h-36 border-ink-300">
        <div class="flex flex-col justify-between px-4 py-3 bg-ink-300 min-h-40">
          <div v-if="ownerBillingInfo.upcomingBillAmount">
            <label class="text-sm leading-none tracking-wide text-vanilla-300">
              Upcoming bill amount
            </label>
            <div class="text-xl font-medium text-vanilla-100 tracking-snug">
              {{ formatUSD(parseISODate(ownerBillingInfo.upcomingBillAmount)) }}
            </div>
          </div>
          <div v-if="ownerBillingInfo.upcomingPaymentDate">
            <label class="text-sm leading-none tracking-wide text-vanilla-300">
              Next payment date
            </label>
            <div class="text-xl font-medium text-vanilla-100 tracking-snug">
              {{ formatDate(parseISODate(ownerBillingInfo.upcomingPaymentDate)) }}
            </div>
          </div>
          <div
            v-if="ownerBillingInfo.outstandingCredits"
            class="flex items-center justify-between text-sm leading-none text-vanilla-400"
          >
            <span>Credits</span>
            <span
              :class="ownerBillingInfo.outstandingCredits > 0 ? 'text-juniper' : ''"
              v-if="billing && ownerBillingInfo.outstandingCredits >= 0"
            >
              {{ formatUSD(ownerBillingInfo.outstandingCredits) }}
            </span>
            <span v-else class="flex items-center">
              $<span class="w-3 h-4 ml-1 rounded-md bg-ink-200 animate-pulse"></span>
            </span>
          </div>
        </div>
        <div class="flex flex-col p-2 px-3 pr-2 space-y-2.5">
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
      </div>
      <div class="mt-5">
        <div class="flex items-center justify-between">
          <h5 class="text-sm font-semibold text-vanilla-100">Payment method</h5>
          <z-button
            @click="showUpdateCardModal = true"
            size="x-small"
            button-type="secondary"
            class="uppercase bg-ink-400 text-vanilla-400"
          >
            <z-icon icon="edit" size="x-small" class="mr-1.5" />
            Update card
          </z-button>
        </div>
        <div class="mt-3">
          <div
            v-if="isBilledByStripe && ownerBillingInfo.activeCard"
            class="flex items-center justify-between w-full p-4 border rounded-md border-ink-300"
          >
            <div class="flex items-center space-x-4">
              <img
                :src="
                  require(`~/assets/images/payments/${getCardIcon(
                    ownerBillingInfo.activeCard.brand
                  )}.png`)
                "
                :alt="ownerBillingInfo.activeCard.brand"
                class="w-auto h-6"
              />
              <div class="ml-6 leading-5 text-vanilla-100">
                {{ ownerBillingInfo.activeCard.brand }}
              </div>
            </div>
            <div class="flex items-center space-x-1.5 text-vanilla-400">
              <div>•••• •••• ••••</div>
              <div>{{ ownerBillingInfo.activeCard.endingIn }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isBilledByGithub">
      <alert-box bg-color="bg-robin" text-color="text-robin-150">
        <div
          class="
            flex flex-col
            items-start
            space-y-4
            md:flex-row md:space-y-0 md:space-x-10 md:justify-between
          "
        >
          <div>
            <p class="mb-2 text-base font-medium leading-none">
              Your billing is managed via <span class="font-bold">GitHub</span>.
            </p>
            <p>
              Please check your GitHub billing page for more updates and to make changes to your
              plan.
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
          class="
            flex flex-col
            items-start
            space-y-4
            md:flex-row md:space-y-0 md:space-x-10 md:justify-between
          "
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
      <update-card-modal v-if="showUpdateCardModal" @close="showUpdateCardModal = false" />
    </portal>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import { FormGroup } from '~/components/Form'
import UpdateBillingDetailsModal from './Modals/UpdateBillingDetailsModal.vue'
import { ZButton, ZRadioGroup, ZRadio, ZIcon } from '@deepsourcelabs/zeal'

import { parseISODate, formatDate } from '~/utils/date'
import { formatUSD } from '~/utils/string'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

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
export default class BillingInfoBox extends mixins(OwnerBillingMixin) {
  async fetch(): Promise<void> {
    if (!Object.keys(this.ownerBillingInfo).length) {
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

  public parseISODate = parseISODate
  public formatDate = formatDate
  public activeCard = 'active-card'
  public showCouponInput = false
  public couponCode = ''
  public formatUSD = formatUSD
  public showUpdateBillingsModal = false
  public showBillingDetailsLoading = false
  public showUpdateCardModal = false
}
</script>
