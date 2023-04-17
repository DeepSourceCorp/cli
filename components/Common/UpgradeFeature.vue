<template>
  <div class="juniper-highlight-card">
    <div class="space-y-1.5">
      <slot name="title">
        <p class="text-sm leading-4 text-juniper-300">
          <span>{{ featureName }}</span> requires the
          <span class="capitalize">{{ planName }}</span> plan
        </p>
      </slot>
      <slot name="subtitle">
        <p class="text-xs leading-6 text-juniper-150">
          Please upgrade your plan to be able to access {{ featureName }} for your team and
          repositories.
        </p>
      </slot>
    </div>
    <nuxt-link :to="$generateRoute(['settings', 'billing'], false)">
      <z-button
        button-type="primary"
        icon="zap"
        label="Upgrade plan"
        size="small"
        class="w-full xs:w-auto"
      />
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import { ZButton } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { featureMap, FeatureType } from '~/types/features'

@Component({ components: { ZButton } })
export default class UpgradeFeature extends Vue {
  @Prop({ required: true, type: String })
  featureShortcode: FeatureType

  get planName() {
    return featureMap[this.featureShortcode]?.minRequiredPlan
  }

  get featureName() {
    return featureMap[this.featureShortcode]?.title
  }
}
</script>

<style scoped lang="postcss">
.juniper-highlight-card {
  @apply flex flex-col justify-between gap-x-16 gap-y-2 rounded-md border p-4 sm:flex-row;
  background-color: rgba(51, 203, 154, 0.06);
  border-color: rgba(51, 203, 154, 0.1);
}
</style>
