<template>
  <div
    class="hidden w-96 space-y-5 divide-y divide-ink-200 rounded-md border border-ink-200 text-11px lg:block"
  >
    <div class="grid grid-cols-2 p-4">
      <div class="space-y-5">
        <div class="flex flex-col gap-y-2">
          <span class="font-semibold uppercase tracking-wider text-vanilla-400">
            ACTIVE ISSUES
          </span>

          <span v-if="loading" class="h-6 w-16 animate-pulse rounded-md bg-ink-300"></span>

          <span v-else class="font-mono text-base font-medium text-vanilla-100">
            {{ totalIssueCount }}
          </span>
        </div>

        <div class="flex flex-col gap-y-2">
          <span class="font-semibold uppercase tracking-wider text-vanilla-400">
            DEFAULT BRANCH
          </span>

          <div v-if="loading" class="h-5 w-16 animate-pulse rounded-md bg-ink-300"></div>

          <div v-else class="flex items-center gap-x-1.5 h-5">
            <z-icon icon="z-git-branch" color="vanilla-100" />
            <span class="text-sm font-medium text-vanilla-100">
              {{ defaultBranchName }}
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex flex-col gap-y-2">
          <span class="font-semibold uppercase tracking-wider text-vanilla-400">
            ISSUES PREVENTED
          </span>

          <span v-if="loading" class="h-6 w-16 animate-pulse rounded-md bg-ink-300"></span>

          <span v-else class="font-mono text-base font-medium text-vanilla-100">
            {{ issuesPrevented }}
          </span>
        </div>

        <div class="flex flex-col gap-y-2">
          <span class="font-semibold uppercase tracking-wider text-vanilla-400"> ANALYZERS </span>

          <div v-if="loading" class="h-5 w-24 animate-pulse rounded-md bg-ink-300"></div>

          <analyzer-list v-else :available-analyzers="availableAnalyzers" />
        </div>
      </div>
    </div>

    <div class="p-4">
      <div
        v-if="loading"
        class="last-run-info-skeleton-dimensions h-5 animate-pulse rounded-md bg-ink-300"
      ></div>

      <last-run-info v-else :latest-analysis-run="latestAnalysisRun" :runs="runs" class="h-5" />
    </div>
  </div>
</template>

<script lang="ts">
import { ZIcon } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  AnalyzerConnection,
  IssueOccurrenceFrequency,
  Maybe,
  Run,
  RunConnection
} from '~/types/types'

import { fromNow } from '~/utils/date'
import { shortenLargeNumber } from '~/utils/string'

@Component({
  name: 'MetadataView',
  components: {
    ZIcon
  },
  methods: {
    fromNow
  }
})
export default class MetadataView extends Vue {
  @Prop()
  issuesPrevented: string | number

  @Prop({ default: false, type: Boolean })
  loading: boolean

  @Prop()
  defaultBranchName: Maybe<string>

  @Prop()
  availableAnalyzers: Maybe<AnalyzerConnection>

  @Prop()
  latestAnalysisRun: Maybe<Run>

  @Prop()
  issueOccurrenceDistributionByIssueType: Array<IssueOccurrenceFrequency>

  @Prop()
  runs: Maybe<RunConnection>

  get totalIssueCount(): string | number {
    // The truthy check is required while navigating to the repository page
    // since `issueOccurrenceDistributionByIssueType` can be `null` for a small time period
    const distributionEntries = this.issueOccurrenceDistributionByIssueType?.find(
      ({ key }) => key === 'all'
    )
    return shortenLargeNumber(distributionEntries?.count as number) || 0
  }
}
</script>

<style scoped>
@media screen and (width: 1024px) {
  .last-run-info-skeleton-dimensions {
    width: 297px;
  }
}

@media screen and (min-width: 1025px) {
  .last-run-info-skeleton-dimensions {
    width: full;
  }
}
</style>
