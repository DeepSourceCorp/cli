<template>
  <section class="space-y-2">
    <div class="flex flex-wrap max-w-2xl md:flex-nowrap">
      <div class="flex-grow">
        <div v-if="Object.keys(this.currentPlan)">
          <div
            class="flex items-center h-16 space-x-2 text-lg tracking-wider font-medium leading-none"
          >
            <div v-if="currentPlan.name" class="px-2 py-1.5 uppercase rounded-md bg-ink-200">
              <span>{{ currentPlan.name }}</span>
            </div>
            <div v-else class="w-24 h-8 rounded-md bg-ink-300 animate-pulse"></div>
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
          <div v-else class="w-32 h-4 bg-ink-300 animate-pulse"></div>
          <usage-info :completion="completion" />
        </div>
      </div>
      <div class="flex justify-between w-full mt-4 md:mt-0 md:block md:justify-start md:w-auto">
        <div v-if="Object.keys(this.currentPlan)" class="mt-1.5">
          <div v-if="currentPlan.amount" class="flex justify-end space-x-1">
            <div class="flex space-x-1">
              <div class="text-2xl">$</div>
              <div class="text-3xl font-semibold leading-none md:text-4xl">{{ monthlyAmount }}</div>
            </div>
            <div class="self-end mb-1 text-sm">/user/month</div>
          </div>
          <div v-else class="flex justify-end">
            <div class="h-16 rounded-md w-44 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="pt-1 mt-1 text-right">
          <z-button
            v-if="ownerBillingInfo && !ownerBillingInfo.cancelAtPeriodEnd && !isBilledManually"
            @click="toggleAddMoreSeats"
            button-type="primary"
            size="small"
            class=""
          >
            <div class="flex items-center">
              Add more seats
              <z-icon
                icon="arrow-right"
                size="x-small"
                color="ink-400"
                class="stroke-2 ml-1.5"
              ></z-icon>
            </div>
          </z-button>
        </div>
      </div>
    </div>
    <portal to="modal">
      <z-modal
        v-if="showUpdateSeatsModal"
        ref="update-billing-seats-modal"
        @onClose="showUpdateSeatsModal = false"
        title="Add or remove seats"
      >
        <template v-slot:default="{ close }">
          <div class="flex flex-col p-4 space-y-3">
            <div class="flex justify-between">
              <label for="seats-count" class="text-sm text-vanilla-400">
                New number of seats in total
              </label>
              <z-number-input
                :min="ownerBillingInfo.seatsUsed"
                :max="currentPlan.max_seats"
                id="seats-count"
                class="w-24 text-sm"
                v-model="seatsCount"
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
                class="inline-flex items-center space-x-2 mt-3 cursor-pointer"
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
              class="ml-auto modal-primary-action w-36"
              buttonType="primary"
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
import { ZButton, ZIcon, ZModal, ZNumberInput } from '@deepsourcelabs/zeal'
import ContextMixin from '@/mixins/contextMixin'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

interface ZModalInterface extends Vue {
  close?: () => void
}

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

  mounted() {
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

  validateSeats() {
    const maxSeats = this.currentPlan.max_seats as number
    const minSeats = this.currentPlan.min_seats as number

    if (Number(this.seatsCount) > maxSeats) {
      this.seatsCount = maxSeats
    } else if (Number(this.seatsCount) < minSeats || this.seatsCount === 0) {
      this.seatsCount = minSeats
    }
  }

  toggleAddMoreSeats(): void {
    if (this.isBilledByStripe) {
      this.seatsCount = Number(this.ownerBillingInfo.seatsTotal)
      this.showUpdateSeatsModal = !this.showUpdateSeatsModal
    }
  }

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
