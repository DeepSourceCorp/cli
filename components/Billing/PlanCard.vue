<template>
  <div>
    <div class="border border-ink-300 min-h-24 rounded-md">
      <div
        class="p-5 space-y-8"
        :class="{
          'bg-ink-300': isPrimary,
          'border-b border-ink-300': features.length
        }"
      >
        <div class="space-y-5">
          <div>
            <h4 class="font-medium text-1.5xl leading-none mb-2">{{ planName }}</h4>
            <p class="text-sm text-vanilla-400">{{ description }}</p>
          </div>
          <template v-if="monthlyAmount">
            <div class="flex space-x-1 items-start">
              <div class="text-2xl leading-tight">$</div>
              <div class="text-3xl font-semibold leading-none">{{ amount }}</div>
              <div class="mb-1 text-sm">/month</div>
            </div>
            <p class="text-sm text-vanilla-400">
              Per team member. <br />Billed {{ billingCycle === 'annual' ? 'yearly' : 'monthly' }}.
            </p>
          </template>
          <template v-else>
            <div class="h-11 rounded-md w-44 bg-ink-300"></div>
            <p class="text-sm text-vanilla-400">
              Custom pricing, based on usage and number of seats.
            </p>
          </template>
        </div>
        <z-button
          :buttonType="isPrimary ? 'primary' : 'secondary'"
          :to="routeTo"
          target="blank"
          @click="nextSteps"
        >
          <template v-if="buttonLabel">
            {{ buttonLabel }}
          </template>
          <template v-else> Upgrade to {{ planName }} </template>
        </z-button>
      </div>
      <div class="p-5" v-if="features.length">
        <ul class="space-y-2">
          <li v-for="feature in features" :key="feature" class="text-sm flex items-start space-x-2">
            <span class="flex-shrink-0 h-5 inline-flex items-center">
              <z-icon icon="check" color="juniper"></z-icon>
            </span>
            <span class="leading-6 text-vanilla-400 text-sm">{{ feature }}</span>
          </li>
        </ul>
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

  nextSteps() {
    this.$emit('next', this.name)
  }

  get amount(): number {
    return this.billingCycle === 'yearly' ? this.annualAmount : this.monthlyAmount
  }
}
</script>
