<template>
  <div
    class="flex items-center text-xs lg:text-sm"
    :class="currentlyAnalyzingRuns ? 'gap-x-1.5' : 'justify-between'"
  >
    <template v-if="currentlyAnalyzingRuns">
      <z-icon color="juniper" icon="spin-loader" class="animate-spin" />
      <span class="text-vanilla-400"
        >Analyzing {{ currentlyAnalyzingRuns }}
        {{ currentlyAnalyzingRuns === 1 ? 'run' : 'runs' }}</span
      >
    </template>

    <template v-else>
      <div v-if="lastRun" class="flex items-center gap-x-1.5 text-vanilla-400">
        <z-icon color="cherry" icon="x" />

        <span class="truncate">Last analyzed</span>

        <nuxt-link
          :to="runPagePath"
          class="inline-flex cursor-pointer items-center gap-1 rounded-md bg-ink-200 px-1 font-mono"
        >
          <z-icon icon="git-commit" size="x-small" />
          {{ lastRunCommitOid }}
        </nuxt-link>
      </div>

      <span v-if="lastRunFinishedAt" class="hidden whitespace-nowrap text-vanilla-400 lg:inline">{{
        lastRunFinishedAt
      }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

import { Maybe, Run, RunConnection } from '~/types/types'

import { fromNow } from '~/utils/date'
import { toSentenceCase } from '~/utils/string'

@Component({ name: 'LastRunInfo', components: { ZIcon } })
export default class LastRunInfo extends Vue {
  @Prop()
  latestAnalysisRun: Maybe<Run>

  @Prop()
  runs: Maybe<RunConnection>

  get currentlyAnalyzingRuns(): Maybe<number> | undefined {
    return this.runs?.totalCount
  }

  get lastRun(): Run | null {
    return this.latestAnalysisRun || null
  }

  get lastRunCommitOid(): string | undefined {
    return this.lastRun?.commitOid?.slice(0, 7)
  }

  get lastRunFinishedAt(): string {
    return toSentenceCase(fromNow(this.lastRun?.finishedAt))
  }

  get runPagePath(): string {
    return this.$generateRoute([
      'run',
      this.lastRun?.runId,
      this.lastRun?.config?.analyzers[0].name
    ])
  }
}
</script>
