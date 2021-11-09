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
            :to="routeTo"
            target="blank"
            class="w-80"
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
                cursor-pointer
                outline-none
                focus:outline-none
                bg-juniper
              "
            >
              <div class="w-2.5 h-2.5 rounded-full bg-juniper"></div>
            </div>
            <z-icon v-else :icon="icon" :color="isPrimary ? 'ink-400' : 'vanilla-100'" />
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
              <z-icon icon="check" color="juniper"></z-icon>
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
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: { ZButton, ZIcon }
})
export default class PlanCard extends Vue {
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

  @Prop({ default: 'yearly' })
  billingCycle: 'yearly' | 'monthly'

  @Prop({ default: null })
  currentPlanName: string

  imgSrc = require('~/assets/images/payments/sparkles.svg')

  nextSteps() {
    if (this.currentPlanName !== this.planName) {
      this.$emit('next', this.name)
    }
  }

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
      return `Downgrade to ${this.planName}`
    }

    return this.buttonLabel ? this.buttonLabel : `Upgrade to ${this.planName}`
  }

  get icon(): string {
    const iconMap = {
      starter: 'wind',
      premium: 'zap',
      enterprise: 'sun'
    } as Record<string, string>
    return iconMap[this.name] || 'zap'
  }

  get isCurrentPlan() {
    return this.currentPlanName === this.planName
  }
}
</script>
