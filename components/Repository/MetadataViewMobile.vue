<template>
  <z-dialog-generic class="lg:hidden" @onClose="$emit('close')">
    <div class="text-xs">
      <div class="grid grid-cols-2 justify-between">
        <div class="flex flex-col gap-y-4 p-4">
          <span v-for="text in metadataTextEntries" :key="text">{{ text }}</span>
        </div>

        <div class="flex flex-col gap-y-4 p-4">
          <span class="text-right">{{ isActivated ? 'Active' : 'Inactive' }}</span>

          <div class="flex items-center justify-end gap-x-1.5">
            <z-icon :icon="vcsProviderIcon" size="x-small" />
            <span>{{ vcsProviderText }}</span>
          </div>

          <span class="text-right"> {{ totalIssueCount }} </span>

          <span class="text-right">{{ issuesPrevented }}</span>

          <div class="flex items-center justify-end gap-x-1.5">
            <z-icon icon="z-git-branch" size="x-small" />
            <span>{{ defaultBranchName }}</span>
          </div>

          <analyzer-list :available-analyzers="availableAnalyzers" class="justify-end" />
        </div>
      </div>

      <z-divider margin="m-0" />

      <last-run-info :latest-analysis-run="latestAnalysisRun" :runs="runs" class="p-4" />
    </div>
  </z-dialog-generic>
</template>

<script lang="ts">
import { ZDialogGeneric, ZDivider, ZIcon } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  AnalyzerConnection,
  IssueOccurrenceFrequency,
  Maybe,
  Run,
  RunConnection,
  VcsProviderChoices
} from '~/types/types'

@Component({ name: 'MetadataViewMobile', components: { ZDialogGeneric, ZDivider, ZIcon } })
export default class MetadataViewMobile extends Vue {
  @Prop()
  issuesPrevented: string | number

  @Prop({ type: Boolean })
  isActivated: boolean

  @Prop()
  defaultBranchName: Maybe<string>

  @Prop()
  availableAnalyzers: Maybe<AnalyzerConnection>

  @Prop()
  vcsProvider: VcsProviderChoices

  @Prop()
  latestAnalysisRun: Maybe<Run>

  @Prop()
  runs: Maybe<RunConnection>

  @Prop()
  issueOccurrenceDistributionByIssueType: Array<IssueOccurrenceFrequency>

  metadataTextEntries = [
    'Analysis status',
    'Source',
    'Active issues',
    'Issues prevented',
    'Default branch',
    'Analyzers'
  ]

  get totalIssueCount(): number {
    const distributionEntries = this.issueOccurrenceDistributionByIssueType.find(
      ({ key }) => key === 'all'
    )
    return distributionEntries?.count || 0
  }

  get vcsProviderIcon() {
    return this.$providerMetaMap[this.vcsProvider]?.icon || ''
  }

  get vcsProviderText() {
    return this.$providerMetaMap[this.vcsProvider]?.text || ''
  }
}
</script>
