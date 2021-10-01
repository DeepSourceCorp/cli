<template>
  <div>
    <analyzer-header
      v-if="analyzer"
      :title="analyzer.name"
      :icon="analyzer.shortcode"
      :status="status"
      :finishedInDisplay="finishedInDisplay"
      :alertingMetricsCount="alertingMetrics.length"
      :issuesRaisedCount="issuesRaisedCount"
      :issuesResolvedCount="issuesResolvedCount"
      class="px-4"
    ></analyzer-header>
    <!-- Autofix -->
    <div
      v-if="autofixableIssues.length && !run.isForDefaultBranch && !run.isForCrossRepoPr"
      class="flex items-center justify-between px-4 py-2 mb-4 text-sm bg-ink-300"
    >
      <span
        >{{ autofixableIssues.length }}
        {{ autofixableIssues.length === 1 ? 'issue' : 'issues' }} can be Autofixed in
        {{ filesAffectedByAutofix }}
        {{ filesAffectedByAutofix > 1 ? 'files' : 'file' }}</span
      >
      <z-button
        buttonType="primary"
        size="small"
        spacing="px-10"
        icon="autofix"
        :disabled="!canCreateAutofix"
        @click="openAutofixModal()"
        >Autofix</z-button
      >
    </div>
    <autofix-issues-chooser
      :isOpen="isAutofixOpen"
      @close="closeAutofixModal"
      :autofixableIssues="autofixableIssues"
      :checkId="id"
    ></autofix-issues-chooser>
    <!-- Issue List and Metrics -->
    <div class="w-full mt-2">
      <z-tabs>
        <z-tab-list class="px-4 py-0 pt-2 border-b border-ink-200">
          <z-tab-item class="flex items-center space-x-1" border-active-color="vanilla-400">
            <z-icon icon="flag" size="small"></z-icon>
            <span>Issues</span>
          </z-tab-item>
          <z-tab-item class="flex items-center space-x-1" border-active-color="vanilla-400">
            <z-icon icon="bar-chart" size="small"></z-icon>
            <span>Metrics</span>
          </z-tab-item>
        </z-tab-list>
        <z-tab-panes class="p-4">
          <z-tab-pane class="flex flex-col space-y-4">
            <run-error-box v-if="errorsRendered.length" :errorsRendered="errorsRendered" />
            <run-loading v-if="status === 'PEND'" />
            <run-pass v-else-if="status === 'PASS' && issueCount === 0"></run-pass>
            <run-cancelled v-else-if="status === 'CNCL' && issueCount === 0"></run-cancelled>
            <run-timeout v-else-if="status === 'TIMO' && issueCount === 0"></run-timeout>
            <div v-else-if="issueCount" class="flex flex-col flex-1 w-full space-y-4">
              <issue-list-item
                v-for="issue in concreteIssueList.edges"
                :key="issue.node.id"
                link="/history/runs/details/issue"
                v-bind="issue.node"
                :showComparisonStat="false"
                :showAutofixButton="false"
                :issueLink="
                  $generateRoute([
                    'run',
                    $route.params.runId,
                    $route.params.analyzer,
                    issue.node.shortcode
                  ])
                "
                :hideProgress="true"
                :centerContent="true"
              ></issue-list-item>
            </div>
          </z-tab-pane>
          <z-tab-pane>
            <run-loading v-if="status === 'PEND'" />
            <run-cancelled v-else-if="status === 'CNCL'"></run-cancelled>
            <run-timeout v-else-if="status === 'TIMO'"></run-timeout>
            <div
              v-else
              class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            >
              <stat-card
                v-for="stat in metricsCaptured"
                :key="stat.id"
                :title="stat.name"
                :value="stat.valueDisplay"
                :icon="analyzer.shortcode"
                :color="stat.isPassing === false ? 'cherry' : 'juniper'"
              >
              </stat-card>
            </div>
          </z-tab-pane>
        </z-tab-panes>
      </z-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, namespace } from 'nuxt-property-decorator'
import {
  ZIcon,
  ZLabel,
  ZTabs,
  ZTabList,
  ZTabPane,
  ZTabPanes,
  ZTabItem,
  ZButton,
  ZBadge
} from '@deepsourcelabs/zeal'

import { AnalyzerHeader } from '@/components/Run'
import StatCard from '@/components/Metrics/StatCard.vue'
import IssueListItem from '@/components/IssueListItem.vue'
import { AutofixIssuesChooser } from '@/components/RepoIssues'
import {
  RepositoryMetricValue,
  IssueConnection,
  AutofixableIssueDetail,
  RunStatus,
  Run
} from '@/types/types'

const runDetailStore = namespace('run/detail')

export interface RunError {
  level: number
  message: string
}

@Component({
  components: {
    AnalyzerHeader,
    StatCard,
    IssueListItem,
    ZIcon,
    ZLabel,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    ZButton,
    ZBadge,
    AutofixIssuesChooser
  },
  layout: 'repository'
})
export default class AnalyzerRun extends Vue {
  @Prop({ default: '' })
  id: string

  @Prop({ default: '' })
  status: RunStatus

  @Prop({ default: '' })
  finishedInDisplay: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedCount: number

  @Prop({ default: () => ({}) })
  analyzer: Record<string, string>

  @Prop({ default: () => [] })
  metricsCaptured: Array<RepositoryMetricValue>

  @Prop({ default: '' })
  autofixableIssues: AutofixableIssueDetail

  @Prop()
  run!: Run

  @Prop({ default: true })
  canCreateAutofix!: boolean

  @Prop({ default: '' })
  filesAffectedByAutofix: number

  @Prop({ default: () => [] })
  errorsRendered: RunError[]

  // fetched in _analyzer
  @runDetailStore.State
  concreteIssueList: IssueConnection

  public isAutofixOpen = false

  get alertingMetrics(): Array<RepositoryMetricValue> {
    return this.metricsCaptured.filter((metric) => metric.isPassing === false)
  }

  get issueCount(): number {
    return this.concreteIssueList?.edges?.length || 0
  }

  public openAutofixModal(): void {
    this.isAutofixOpen = true
  }

  public closeAutofixModal(): void {
    this.isAutofixOpen = false
  }
}
</script>
