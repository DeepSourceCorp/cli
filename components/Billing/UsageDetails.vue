<template>
  <form-group label="Usage details" class="mt-5">
    <!-- Skeleton loader -->
    <div v-if="isLoading" class="skeleton-loader w-full animate-pulse bg-ink-300"></div>

    <div
      v-else
      class="grid w-full grid-cols-1 rounded-md border border-slate-400 bg-ink-400 md:grid-cols-2"
    >
      <div v-if="owner.featureUsage" class="space-y-4 border-r border-slate-400 p-4">
        <h5 class="text-xs font-medium uppercase leading-none tracking-wider text-vanilla-400">
          Usage this month
        </h5>
        <ul class="space-y-4">
          <li v-for="(feature, id) in owner.featureUsage" :key="id">
            <div class="text-sm tracking-wide text-vanilla-400">
              <span class="font-semibold text-vanilla-100">{{ feature.value }} </span>
              <span v-if="feature.max"> of {{ feature.max }} </span>
              <span v-else> of ∞ </span>
              {{ getUsageText(feature) }}
            </div>
            <usage-info v-if="feature.max" :completion="getCompletion(feature)" />
          </li>
        </ul>
      </div>

      <div v-if="features" class="space-y-4 p-4">
        <h5 class="text-xs font-medium leading-none tracking-wider text-vanilla-400">FEATURES</h5>
        <ul class="space-y-3">
          <li
            v-for="(feature, id) in features"
            :key="id"
            class="flex items-start space-x-2 text-sm"
          >
            <span class="inline-flex h-5 flex-shrink-0 items-center">
              <z-icon
                :icon="feature.enabled ? 'check' : 'x'"
                :color="feature.enabled ? 'juniper' : 'vanilla-400'"
              />
            </span>
            <span class="flex flex-col leading-6">
              <span class="text-sm font-medium text-vanilla-200">{{ feature.name }}</span>
              <span v-if="!feature.enabled" class="text-xs text-vanilla-400"
                >Not available in your plan</span
              >
            </span>
          </li>
        </ul>

        <z-button
          v-if="Object.keys(availableUpgradePlans).length"
          button-type="secondary"
          icon="zap"
          size="small"
          @click="$router.push($generateRoute(['settings', 'billing', 'plans']))"
        >
          Upgrade plan
        </z-button>
      </div>
    </div>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({})
export default class UsageDetails extends mixins(OwnerDetailMixin, PlanDetailMixin) {
  isLoading = false

  async fetch() {
    const { owner: login, provider } = this.$route.params
    const params = { login, provider }
    await this.fetchUsageDetails(params)

    this.isLoading = false
  }

  /**
   * Created hook
   * Verify whether the skeleton loader needs to be shown or not
   *
   * @returns {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isLoading = true
      }
    }, 300)
  }

  get features() {
    const availableFeatures = this.owner.features.filter(
      ({ enabled }: Record<string, string>) => enabled
    )
    const unAvailableFeatures = this.owner.features.filter(
      (feature: Record<string, string>) => !availableFeatures.includes(feature)
    )

    return [...availableFeatures, ...unAvailableFeatures]
  }

  getCompletion({ value, max }: Record<string, number>): number {
    return value && max ? Math.min((value / max) * 100, 100) : 0
  }

  getUsageText({ max, shortcode, value }: Record<string, number | string>): string {
    if (shortcode === 'analysis') {
      return max ? 'commits analyzed' : `${value === 1 ? 'commit' : 'commits'} analyzed`
    }

    if (shortcode === 'transformers') {
      return max ? 'Transform runs' : `${value === 1 ? 'Transform run' : 'Transform runs'} used`
    }

    if (shortcode === 'autofix') {
      return max ? 'Autofix runs' : `${value === 1 ? 'Autofix run' : 'Autofix runs'} used`
    }

    return `${shortcode} used`
  }
}
</script>

<style scoped>
.skeleton-loader {
  height: 182px;
}
</style>
