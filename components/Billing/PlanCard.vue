<template>
  <div>
    <div class="border rounded-md border-ink-300 min-h-24 group">
      <div
        class="p-5 space-y-8"
        :class="{
          'bg-ink-300': isPrimary && !isCurrentPlan,
          'border-b border-ink-300': features.length
        }"
      >
        <div class="space-y-5">
          <div>
            <h4 class="font-medium text-1.5xl leading-none mb-2">{{ planName }}</h4>
            <p class="text-sm text-vanilla-400">{{ description }}</p>
          </div>
          <template v-if="monthlyAmount">
            <div class="flex items-start space-x-1">
              <div class="text-2xl leading-tight">$</div>
              <div class="text-3xl font-semibold leading-none">{{ amount }}</div>
              <div class="mb-1 text-sm">/month</div>
            </div>
            <p class="text-sm text-vanilla-400">
              Per team member. <br />Billed {{ billingCycle }}.
            </p>
          </template>
          <template v-else>
            <div class="flex items-start">
              <img
                src="~/assets/images/payments/sparkles.svg"
                alt="sparkles"
                class="block group-hover:hidden -my-5"
              />
              <img
                src="~/assets/images/payments/sparkles-glitter.svg"
                alt="sparkles"
                class="hidden group-hover:block -my-5"
              />
            </div>
            <p class="text-sm text-vanilla-400">
              Custom pricing, based on usage and number of seats.
            </p>
          </template>
        </div>
        <div class="flex justify-center">
          <z-button
            :button-type="isPrimary && !isCurrentPlan ? 'primary' : 'secondary'"
            :disabled="isCurrentPlan"
            :to="routeTo"
            target="blank"
            class="w-80"
            :class="{ 'opacity-100': isCurrentPlan }"
            @click="nextSteps"
          >
            <div
              v-if="isCurrentPlan"
              class="
                flex
                items-center
                justify-center
                w-4
                h-4
                bg-opacity-50
                rounded-full
                outline-none
                focus:outline-none
                bg-juniper
              "
            >
              <div class="w-2.5 h-2.5 rounded-full bg-juniper"></div>
            </div>
            <z-icon
              v-else-if="updating"
              icon="spin-loader"
              :color="isPrimary ? 'ink-400' : 'vanilla-100'"
              class="animate-spin"
            />
            <span>
              {{ ctaLabel }}
            </span>
          </z-button>
        </div>
      </div>
      <div v-if="features.length" class="p-5 space-y-5">
        <ul class="space-y-2">
          <li v-for="feature in features" :key="feature" class="flex items-start space-x-2 text-sm">
            <span class="inline-flex items-center flex-shrink-0 h-5">
              <z-icon icon="check" color="juniper" />
            </span>
            <span class="text-sm leading-6 text-vanilla-400">{{ feature }}</span>
          </li>
        </ul>
        <a
          v-if="allFeaturesLink"
          :href="allFeaturesLink"
          class="flex text-juniper cursor-pointer hover:underline"
          >See all features</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({
  components: { ZButton, ZIcon }
})
export default class PlanCard extends mixins(PlanDetailMixin) {
  @Prop({ default: false })
  isPrimary: boolean

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  planName: string

  @Prop({ required: true })
  description: string

  @Prop({ default: null })
  buttonLabel: string

  @Prop({ default: null })
  monthlyAmount: number

  @Prop({ default: null })
  annualAmount: number

  @Prop({ default: [] })
  features: string[]

  @Prop({ default: null })
  allFeaturesLink: string

  @Prop({ default: null })
  routeTo: string

  @Prop({ default: null })
  currentPlanName: string

  imgSrc = require('~/assets/images/payments/sparkles.svg')
  updating = false

  get amount(): number {
    return this.billingCycle === 'yearly' ? this.annualAmount : this.monthlyAmount
  }

  get ctaLabel(): string {
    if (this.isCurrentPlan) {
      return 'Currenty active'
    }

    // If the current plan is 'Business', button label for the 'Starter' plan
    // should start with 'Downgrade to'
    if (this.currentPlanName === 'Business' && this.planName === 'Starter') {
      return this.updating ? 'Downgrading subscription' : `Downgrade to ${this.planName}`
    }

    if (this.updating) {
      return 'Upgrading subscription'
    }

    return this.buttonLabel ? this.buttonLabel : `Upgrade to ${this.planName}`
  }

  get isCurrentPlan() {
    return this.currentPlanName === this.planName
  }

  async nextSteps() {
    // Prevent redirection to /subscribe/enterprise/
    if (this.routeTo) {
      return
    }

    // Redirect to /subscribe/{plan} for the free plan
    if (!this.currentPlanName) {
      return this.$emit('next', this.name)
    }

    // Handle subscription change accordingly
    if (this.name === 'premium') {
      // Upgrade to 'Business'
      const { planSlug } = this.availableUpgradePlans
      this.updating = true
      try {
        await this.changeSubscriptionPlan({
          id: this.owner.id,
          planSlug
        })
      } catch (e) {
        this.$toast.danger('Something went wrong while upgrading your plan')
      } finally {
        await this.refetchData()
        this.updating = false
      }
    } else if (this.name === 'starter') {
      // Downgrade to 'Starter'
      const { planSlug } = this.availableDowngradePlans
      this.updating = true
      try {
        await this.changeSubscriptionPlan({
          id: this.owner.id,
          planSlug
        })
      } catch (e) {
        this.$toast.danger('Something went wrong while upgrading your plan')
      } finally {
        await this.refetchData()
        this.updating = false
      }
    }

    // Redirect to /billing
    this.$router.push(this.$generateRoute(['settings', 'billing']))
  }
}
</script>
