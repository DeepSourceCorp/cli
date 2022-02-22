<template>
  <section class="flex flex-col space-y-4">
    <run-error-box v-if="errorsRendered.length" :errorsRendered="errorsRendered" />
    <run-loading v-if="status === 'PEND'" />
    <run-pass v-else-if="status === 'PASS' && issueCount === 0"></run-pass>
    <run-cancelled v-else-if="status === 'CNCL' && issueCount === 0"></run-cancelled>
    <run-timeout v-else-if="status === 'TIMO' && issueCount === 0"></run-timeout>
    <template v-else>
      <div id="issue-filters" class="flex items-center space-x-3">
        <slot name="controls"></slot>
      </div>
      <template v-if="issueCount">
        <issue-list-item
          v-for="issue in concreteIssues"
          :key="issue.id"
          v-bind="issue"
          :show-comparison-stat="false"
          :show-autofix-button="false"
          :issue-link="
            $generateRoute(['run', $route.params.runId, $route.params.analyzer, issue.shortcode])
          "
          :hide-progress="true"
          :center-content="true"
          link="/history/runs/details/issue"
        />
      </template>
      <template v-else>
        <empty-state class="border-2 border-dashed rounded-md border-ink-200">
          <template slot="title">
            <p class="text-base text-vanilla-200">No issues found</p>
          </template>
        </empty-state>
      </template>
    </template>
  </section>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'

import IssueListItem from '@/components/IssueListItem.vue'
import { RunStatus, Issue } from '@/types/types'
import RunDetailMixin from '~/mixins/runDetailMixin'
import { resolveNodes } from '~/utils/array'

export interface RunError {
  level: number
  message: string
}

@Component({
  components: {
    IssueListItem
  }
})
export default class AnalyzerRun extends mixins(RunDetailMixin) {
  @Prop({ required: true })
  status: RunStatus

  @Prop({ default: () => [] })
  errorsRendered: RunError[]

  public isAutofixOpen = false

  get issueCount(): number {
    return this.concreteIssueList?.edges?.length || 0
  }

  get concreteIssues(): Issue[] {
    return resolveNodes(this.concreteIssueList) as Issue[]
  }
}
</script>
