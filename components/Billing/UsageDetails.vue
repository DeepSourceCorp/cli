<template>
  <form-group label="Usage details" class="mt-5">
    <div class="grid w-full grid-cols-1 border rounded-sm md:grid-cols-2 bg-ink-400 border-ink-200">
      <div class="p-6 space-y-4 border-r border-ink-200">
        <div v-for="(feature, id) in owner.featureUsage" :key="id">
          <div class="text-sm text-vanilla-400 tracking-wide">
            <span class="font-semibold text-vanilla-100">{{ feature.value }} </span>
            <span v-if="feature.max"> of {{ feature.max }} </span>
            {{ getUsageText(feature) }}
          </div>
          <usage-info v-if="feature.max" :completion="getCompletion(feature)" />
        </div>
      </div>

      <div class="p-6 space-y-8">
        <ul class="space-y-2">
          <li
            v-for="(feature, id) in owner.features"
            :key="id"
            class="flex items-start space-x-2 text-sm"
          >
            <span class="inline-flex items-center flex-shrink-0 h-5">
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
          button-type="primary"
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
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

@Component({
  components: {
    ZButton,
    ZIcon
  }
})
export default class UsageDetails extends mixins(OwnerDetailMixin) {
  async fetch() {
    const { owner: login, provider } = this.$route.params
    const params = { login, provider }
    await this.fetchUsageDetails(params)
  }

  getCompletion({ value, max }: Record<string, number>): number {
    return value && max ? (value / max) * 100 : 0
  }

  getUsageText({ max, shortcode, value }: Record<string, number | string>): string {
    if (shortcode === 'analysis') {
      return max ? 'commits analyzed' : `${value === 1 ? 'commit' : 'commits'} analyzed`
    }

    if (shortcode === 'transformers') {
      return max
        ? 'Transform runs used'
        : `${value === 1 ? 'Transform run' : 'Transform runs'} used`
    }

    if (shortcode === 'autofix') {
      return max ? 'Autofix runs used' : `${value === 1 ? 'Autofix run' : 'Autofix runs'} used`
    }

    return `${shortcode} used`
  }
}
</script>
