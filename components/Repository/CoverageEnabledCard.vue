<template>
  <div class="bg-ink-300 border border-ink-200 rounded-md">
    <div class="p-4 border-ink-200 flex flex-wrap items-start gap-2 justify-between">
      <div class="space-y-1">
        <h4 class="text-sm leading-4">Code Coverage</h4>
        <p class="text-vanilla-400 text-xs leading-6">
          When active, DeepSource will report code coverage issues and metrics.
        </p>
      </div>
      <div v-if="loading" class="rounded-full bg-ink-200 animate-pulse w-32 h-coverage-badge"></div>
      <div
        v-else
        :class="
          hasTestCoverage
            ? 'border-juniper bg-juniper bg-opacity-5 border-opacity-10'
            : 'bg-ink-200 border-ink-50'
        "
        class="flex items-center gap-x-2 rounded-l-full rounded-r-full px-2.5 py-0.5 border"
      >
        <span
          :class="hasTestCoverage ? 'bg-juniper-500' : 'bg-vanilla-400'"
          class="rounded-full w-1.5 h-1.5"
        ></span>
        <span
          :class="hasTestCoverage ? 'text-juniper-300' : 'text-vanilla-400'"
          class="uppercase leading-6 text-xxs font-semibold"
        >
          Reporting {{ hasTestCoverage ? 'active' : 'inactive' }}
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'CoverageEnabledCard'
})
export default class CoverageEnabledCard extends Vue {
  @Prop({ default: false })
  hasTestCoverage: boolean

  @Prop({ default: false })
  loading: boolean
}
</script>

<style scoped>
.h-coverage-badge {
  height: 26px;
}
</style>
