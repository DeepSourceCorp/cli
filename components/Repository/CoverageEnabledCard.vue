<template>
  <div class="rounded-md border border-ink-200 bg-ink-300">
    <div class="flex flex-wrap items-start justify-between gap-2 border-b border-ink-200 p-4">
      <div class="space-y-1">
        <h4 class="text-sm leading-4">Code Coverage</h4>
        <p class="text-xs leading-6 text-vanilla-400">
          When active, DeepSource will report code coverage issues and metrics.
        </p>
      </div>
      <div v-if="loading" class="h-coverage-badge w-32 animate-pulse rounded-full bg-ink-200"></div>
      <div
        v-else
        :class="
          hasTestCoverage
            ? 'border-juniper border-opacity-10 bg-juniper bg-opacity-5'
            : 'border-ink-50 bg-ink-200'
        "
        class="flex items-center gap-x-2 rounded-l-full rounded-r-full border px-2.5 py-0.5"
      >
        <span
          :class="hasTestCoverage ? 'bg-juniper-500' : 'bg-vanilla-400'"
          class="h-1.5 w-1.5 rounded-full"
        ></span>
        <span
          :class="hasTestCoverage ? 'text-juniper-300' : 'text-vanilla-400'"
          class="text-xxs font-semibold uppercase leading-6"
        >
          Reporting {{ hasTestCoverage ? 'active' : 'inactive' }}
        </span>
      </div>
    </div>

    <enable-coverage-steps :dsn="dsn" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'CoverageEnabledCard'
})
export default class CoverageEnabledCard extends Vue {
  @Prop({ required: true })
  dsn: string

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
