<template>
  <div>
    <div class="group min-h-24 rounded-md border border-slate-400">
      <div
        class="space-y-8 p-5"
        :class="{
          'bg-ink-300': isPrimary,
          'border-b border-slate-400': features.length
        }"
      >
        <div class="space-y-5">
          <div>
            <h4 class="mb-2 text-1.5xl font-medium leading-none">{{ planName }}</h4>
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
                class="-my-5 block group-hover:hidden"
              />
              <img
                src="~/assets/images/payments/sparkles-glitter.svg"
                alt="sparkles"
                class="-my-5 hidden group-hover:block"
              />
            </div>
            <p class="text-sm text-vanilla-400">
              Custom pricing, based on usage and number of seats.
            </p>
          </template>
        </div>
        <div class="flex justify-center">
          <!-- CTA should span full width on the free tier with three plan cards above `1024px`  -->
          <z-button
            :button-type="isPrimary ? 'primary' : 'secondary'"
            :to="routeTo"
            target="blank"
            class="w-full md:w-80"
            :class="{ 'lg:w-full xl:w-80': !currentPlanName }"
            @click="nextSteps"
          >
            <z-icon
              v-if="updating"
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
      <div v-if="features.length" class="space-y-5 p-5">
        <ul class="space-y-2">
          <li v-for="feature in features" :key="feature" class="flex items-start space-x-2 text-sm">
            <span class="inline-flex h-5 flex-shrink-0 items-center">
              <z-icon icon="check" color="juniper" />
            </span>
            <span class="text-sm leading-6 text-vanilla-400">{{ feature }}</span>
          </li>
        </ul>
        <a
          v-if="allFeaturesLink"
          :href="allFeaturesLink"
          class="flex cursor-pointer text-juniper hover:underline"
          >See all features</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({})
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

  get billingCycleInPlanSlug(): string {
    return this.billingCycle === 'monthly' ? 'monthly' : 'annual'
  }

  get ctaLabel(): string {
    // If the current plan is 'Business', button label for the 'Starter' plan
    // should start with 'Downgrade to'
    if (this.currentPlanName === 'Business' && this.planName === 'Starter') {
      return this.updating ? 'Downgrading subscription' : `Downgrade to ${this.planName}`
    }

    if (this.updating) {
      return 'Upgrading subscription'
    }

    return this.buttonLabel || `Upgrade to ${this.planName}`
  }

  get downgradePlanSlug(): string {
    const planSlugWithoutBillingCycle = this.availableDowngradePlans.planSlug
      .split('-') // ['plan', 'starter', 'monthly/annual']
      .slice(0, -1) // ['plan', 'starter']

    return [...planSlugWithoutBillingCycle, this.billingCycleInPlanSlug].join('-') // plan-starter-monthly/annual
  }

  get upgradePlanSlug(): string {
    const planSlugWithoutBillingCycle = this.availableUpgradePlans.planSlug
      .split('-') // ['plan', 'premium', 'monthly/annual']
      .slice(0, -1) // ['plan', 'premium']

    return [...planSlugWithoutBillingCycle, this.billingCycleInPlanSlug].join('-') // plan-premium-monthly/annual
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
      this.updating = true
      try {
        await this.changeSubscriptionPlan({
          id: this.owner.id,
          planSlug: this.upgradePlanSlug
        })
      } catch (e) {
        this.$toast.danger('Something went wrong while upgrading your plan.')
      } finally {
        await this.refetchData()
        this.updating = false
      }
    } else if (this.name === 'starter') {
      // Downgrade to 'Starter'
      this.updating = true
      try {
        await this.changeSubscriptionPlan({
          id: this.owner.id,
          planSlug: this.downgradePlanSlug
        })
      } catch (e) {
        this.$toast.danger('Something went wrong while downgrading your plan.')
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
