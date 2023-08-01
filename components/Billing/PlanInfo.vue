<template>
  <section class="space-y-2">
    <div class="flex max-w-2xl flex-wrap md:flex-nowrap">
      <div class="flex-grow">
        <div v-if="Object.keys(currentPlan)">
          <div
            class="flex h-16 items-center space-x-2 text-lg font-medium leading-none tracking-wider"
          >
            <div v-if="currentPlan.name" class="rounded-md bg-ink-200 px-2 py-1.5 uppercase">
              <span>{{ currentPlan.name }}</span>
            </div>
            <div v-else class="h-8 w-24 animate-pulse rounded-md bg-ink-300"></div>
            <div>Plan</div>
          </div>
        </div>
        <div class="md:mt-3.5">
          <div
            v-if="ownerBillingInfo && ownerBillingInfo.seatsUsed"
            class="text-sm font-semibold tracking-snug"
          >
            {{ ownerBillingInfo.seatsUsed }} of {{ ownerBillingInfo.seatsTotal }} seats used
          </div>
          <div v-else class="h-4 w-32 animate-pulse bg-ink-300"></div>
          <usage-info :completion="completion" />
        </div>
      </div>
      <div class="mt-4 flex w-full justify-between md:mt-0 md:block md:w-auto md:justify-start">
        <div v-if="!isBilledManually && Object.keys(currentPlan)" class="mt-1.5">
          <div v-if="currentPlan.amount" class="flex justify-end space-x-1">
            <div class="flex space-x-1">
              <div class="text-2xl">$</div>
              <div class="text-3xl font-semibold leading-none md:text-4xl">{{ monthlyAmount }}</div>
            </div>
            <div class="mb-1 self-end text-sm">/user/month</div>
          </div>
          <div v-else class="flex justify-end">
            <div class="h-16 w-44 animate-pulse rounded-md bg-ink-300"></div>
          </div>
        </div>
        <div class="mt-1 pt-1 text-right">
          <z-button
            v-if="ownerBillingInfo && !ownerBillingInfo.cancelAtPeriodEnd && isBilledByStripe"
            button-type="primary"
            size="small"
            class=""
            @click="toggleAddMoreSeats"
          >
            <div class="flex items-center">
              Add more seats
              <z-icon icon="arrow-right" size="x-small" color="ink-400" class="ml-1.5 stroke-2" />
            </div>
          </z-button>
        </div>
      </div>
    </div>
    <portal to="modal">
      <z-modal
        v-if="showUpdateSeatsModal"
        ref="update-billing-seats-modal"
        title="Add or remove seats"
        @onClose="showUpdateSeatsModal = false"
      >
        <template #default="{ close }">
          <div class="flex flex-col space-y-3 p-4">
            <div class="flex justify-between">
              <label for="seats-count" class="text-sm text-vanilla-400">
                New number of seats in total
              </label>
              <z-number-input
                id="seats-count"
                v-model="seatsCount"
                :min="ownerBillingInfo.seatsUsed"
                :max="currentPlan.max_seats"
                class="w-24 text-sm"
              />
            </div>
            <alert-box
              v-if="seatsCount === ownerBillingInfo.seatsUsed"
              bg-color="bg-honey"
              text-color="text-honey-400"
            >
              <p>Remove or demote admins/members to contributor to reduce seats further.</p>
              <nuxt-link
                :to="$generateRoute(['members'])"
                class="mt-3 inline-flex cursor-pointer items-center space-x-2"
              >
                <span class="hover:underline">Manage members</span>
                <z-icon color="honey-400" icon="arrow-right" class="mt-1" />
              </nuxt-link>
            </alert-box>
            <p class="text-sm text-vanilla-400">
              You can add up to {{ currentPlan.max_seats }} seats, contributors are not counted
              against your seats usage. If you need more seats, please write to us at
              <a
                href="mailto:support@deepsource.io"
                target="_blank"
                rel="noopener noreferrer"
                class="text-juniper hover:underline"
                >support@deepsource.io</a
              >.
            </p>
            <z-button
              label="Update seats"
              icon="check-circle"
              class="modal-primary-action ml-auto w-36"
              button-type="primary"
              size="small"
              :disabled="!isValid || loading"
              :is-loading="loading"
              loading-label="Updating seats"
              @click="() => updateSeatsMutation(close)"
            />
          </div>
        </template>
      </z-modal>
    </portal>
  </section>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal, ZNumberInput } from '@deepsource/zeal'
import ContextMixin from '@/mixins/contextMixin'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

interface ZModalInterface extends Vue {
  close?: () => void
}

/**
 * Plan information component with information for plan type, seats used, per seat price and `Add more seats` CTA.
 */
@Component({
  components: { ZButton, ZIcon, ZModal, ZNumberInput },
  layout: 'dashboard'
})
export default class PlanInfo extends mixins(ContextMixin, OwnerBillingMixin) {
  @Prop({ required: true })
  id: string

  showUpdateSeatsModal = false
  updateSeatsError = false
  loading = false
  seatsCount: number = 0

  /**
   * Mounted lifecycle hook for the page, updates `seatCount` value from store.
   *
   * @returns {void}
   */
  mounted(): void {
    this.seatsCount = Number(this.ownerBillingInfo.seatsTotal)
  }

  get monthlyAmount(): number {
    if (Object.keys(this.currentPlan)) {
      const { mode, amount } = this.currentPlan
      return mode === 'annual' ? (amount as number) / 12 : (amount as number)
    }
    return 0
  }

  get completion(): number {
    if (this.ownerBillingInfo) {
      const { seatsUsed, seatsTotal } = this.ownerBillingInfo
      return seatsUsed && seatsTotal ? (seatsUsed / seatsTotal) * 100 : 0
    }
    return 0
  }

  get isValid(): boolean {
    const maxSeats = this.currentPlan.max_seats as number
    const minSeats = this.currentPlan.min_seats as number

    return Number(this.seatsCount) <= maxSeats && Number(this.seatsCount) >= minSeats
  }

  /**
   * Validate the value of `seatsCount` against `maxSeats` and `minSeats`.
   *
   * @returns {void}
   */
  validateSeats(): void {
    const maxSeats = this.currentPlan.max_seats as number
    const minSeats = this.currentPlan.min_seats as number

    if (Number(this.seatsCount) > maxSeats) {
      this.seatsCount = maxSeats
    } else if (Number(this.seatsCount) < minSeats || this.seatsCount === 0) {
      this.seatsCount = minSeats
    }
  }

  /**
   * Show the `Add more seats` modal for the user to update seats.
   *
   * @returns {void}
   */
  toggleAddMoreSeats(): void {
    if (this.isBilledByStripe) {
      this.seatsCount = Number(this.ownerBillingInfo.seatsTotal)
      this.showUpdateSeatsModal = !this.showUpdateSeatsModal
    }
  }

  /**
   * Run the `updateSeats` mutation to update the count for seats that the user has subscribed to.
   *
   * @returns {Promise<void>}
   */
  async updateSeatsMutation(close: () => void): Promise<void> {
    this.loading = true
    const modal = this.$refs['update-billing-seats-modal'] as ZModalInterface
    const { owner, provider } = this.$route.params
    try {
      await this.updateSeats({
        id: this.id,
        seats: this.seatsCount
      })
      await this.fetchBillingDetails({
        login: owner,
        provider,
        refetch: true
      })
      if (close) {
        close()
      } else if (modal && modal.close) {
        modal.close()
      } else {
        this.showUpdateSeatsModal = false
      }
    } catch (e) {
      this.$toast.danger(
        'Oops, something went wrong, could not update your seats. Please contact support'
      )
    } finally {
      this.loading = false
    }
  }
}
</script>

<style>
input[type='number'].hide-input-spinners::-webkit-inner-spin-button,
input[type='number'].hide-input-spinners::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  opacity: 0;
}

input[type='number'].hide-input-spinners {
  -moz-appearance: textfield; /*For FireFox*/
}
</style>
