<template>
  <z-modal title="Confirm updates to your subscription" @onClose="$emit('close')">
    <div class="p-4 space-y-4">
      <div class="flex items-center space-x-2">
        <z-avatar
          :image="owner.avatar"
          :fallback-image="getDefaultAvatar(owner.login, false)"
          :user-name="owner.login"
          size="lg"
        />
        <ul>
          <li class="text-base font-medium">
            {{ owner.login }}
          </li>
          <li class="text-sm text-vanilla-400">
            Currently on {{ currentPlan.name }} plan (${{ currentPlan.amount }} /
            {{ currentPlan.mode === MODE.MONTHLY ? 'month' : 'year' }} &times;
            {{ owner.billingInfo.seatsTotal }}
            {{ 'seat' | pluralize(owner.billingInfo.seatsTotal) }})
          </li>
        </ul>
      </div>
      <section class="w-full space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-vanilla-400">New plan</span>
          <span
            v-if="$fetchState.pending"
            class="w-16 h-5 rounded-md bg-ink-200 animate-pulse"
          ></span>
          <span v-else class="font-semibold">{{ newPlan.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-vanilla-400">Billing interval</span>
          <span
            v-if="$fetchState.pending"
            class="h-5 rounded-md w-14 bg-ink-200 animate-pulse"
          ></span>
          <span v-else>
            <template v-if="newPlan.mode === MODE.MONTHLY">Monthly</template>
            <template v-else>Yearly</template>
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-vanilla-400">
            New {{ newPlan.mode === MODE.MONTHLY ? 'monthly' : 'yearly' }} total
            <template v-if="!$fetchState.pending">
              (for {{ planInfo.quantity }} {{ 'seat' | pluralize(planInfo.quantity) }})
            </template>
          </span>
          <span
            v-if="$fetchState.pending"
            class="w-24 h-5 rounded-md bg-ink-200 animate-pulse"
          ></span>
          <span v-else>
            {{ formatUSD(newPlan.amount * planInfo.quantity) }}
            <span class="text-sm"> / {{ newPlan.mode === MODE.MONTHLY ? 'month' : 'year' }} </span>
          </span>
        </div>
        <div
          v-if="!$fetchState.pending && !planInfo.billedImmediately && planInfo.upcomingBillDate"
          class="flex items-baseline justify-between pt-3 border-t border-slate-400"
        >
          <div>
            <span class="text-sm font-semibold">
              >Due on {{ formatDate(parseISODate(planInfo.upcomingBillDate)) }}</span
            >
            <span v-if="planInfo.proratedForDays" class="block text-xs text-vanilla-400"
              >Prorated for {{ 'day' | pluralize(planInfo.proratedForDays) }}</span
            >
          </div>
          <span class="text-base">
            {{ formatUSD(planInfo.upcomingBillAmount) }}
          </span>
        </div>
        <div class="pt-3 border-t border-slate-400">
          <div class="flex items-center justify-between">
            <span class="text-base font-semibold">Due today</span>
            <span
              v-if="$fetchState.pending"
              class="w-20 h-6 rounded-md bg-ink-200 animate-pulse"
            ></span>
            <span
              v-else-if="planInfo.billedImmediately"
              class="text-lg"
              :class="{ 'text-juniper': planInfo.upcomingBillAmount === 0 }"
            >
              {{ formatUSD(planInfo.upcomingBillAmount) }}
            </span>
          </div>
          <div v-if="!$fetchState.pending" class="block max-w-sm mt-1 text-sm text-vanilla-400">
            <span v-if="planInfo.prorationAmount">
              {{ formatUSD(planInfo.prorationAmount) }} will be adjusted via proration.
            </span>
            <span v-if="planInfo.endingBalance">
              Remaining {{ formatUSD(planInfo.endingBalance) }} will be added to your account
              credits, to be used in subsequent billing cycles.
            </span>
          </div>
        </div>
      </section>
    </div>
    <template #footer="{ close }">
      <div class="flex justify-between p-4 text-vanilla-100 border-slate-400">
        <div class="items-end hidden md:flex">
          <span class="leading-none bg-ink-200 rounded-bl-md text-xs px-2 py-1.5 text-vanilla-400">
            Powered by
            <img
              class="inline"
              width="30"
              height="14"
              alt="stripe"
              src="~/assets/images/stripe.svg"
            />
          </span>
        </div>
        <z-button
          :is-loading="updatingSubscription"
          loading-label="Updating subscription details"
          label="Confirm and update subscription"
          icon="check"
          class="w-full md:w-auto"
          size="small"
          @click="switchPlan(close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZModal, ZButton, ZAvatar } from '@deepsource/zeal'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import { GetUpgradeCodeQualitySubscriptionPlanInfoPayload } from '~/types/types'
import { formatUSD } from '~/utils/string'
import { formatDate, parseISODate } from '~/utils/date'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    ZModal,
    ZButton,
    ZAvatar
  },
  methods: {
    getDefaultAvatar,
    parseISODate,
    formatDate,
    formatUSD
  }
})
export default class UpdateSubscriptionModal extends mixins(OwnerBillingMixin) {
  planInfo: GetUpgradeCodeQualitySubscriptionPlanInfoPayload
  updatingSubscription = false

  @Prop({ required: true })
  newPlanName: string

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchBillingDetails({
      login: owner,
      provider
    })

    this.planInfo = await this.getUpgradePlanInfo({
      id: this.owner.id,
      planSlug: this.newPlanName
    })
  }

  get newPlan(): Record<string, string | number> {
    return this.context.plans[this.newPlanName]
  }

  async switchPlan(close: () => void): Promise<void> {
    this.updatingSubscription = true
    try {
      await this.changeSubscriptionPlan({
        id: this.owner.id,
        planSlug: this.newPlanName
      })
      this.$emit('refetch')

      const { owner, provider } = this.$route.params
      await this.fetchBillingDetails({
        login: owner,
        provider,
        refetch: true
      })
      this.$toast.success('Successfully updated the subscription.')

      if (close) {
        close()
      } else {
        this.$emit('close')
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while changing the subscription.')
    } finally {
      this.updatingSubscription = false
    }
  }
}
</script>
