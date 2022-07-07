<template>
  <section class="flex flex-col gap-y-3">
    <run-error-box v-if="errorsRendered.length" :errorsRendered="errorsRendered" />
    <lazy-run-loading v-if="status === CheckStatus.Pend" />
    <lazy-run-pass v-else-if="status === CheckStatus.Pass && issueCount === 0" />
    <lazy-run-cancelled v-else-if="status === CheckStatus.Cncl && issueCount === 0" />
    <lazy-run-timeout v-else-if="status === CheckStatus.Timo && issueCount === 0" />
    <lazy-run-waiting v-else-if="status === CheckStatus.Wait && issueCount === 0" />
    <lazy-run-nuked v-else-if="status === CheckStatus.Atmo && issueCount === 0" />
    <lazy-run-metric-threshold-error v-else-if="status === CheckStatus.Fail && issueCount === 0" />
    <template v-else>
      <div id="issue-filters" class="md:sticky header-offset bg-ink-400">
        <!-- fade overlay -->
        <div
          v-if="isScrolled"
          class="absolute z-10 top-0 -mt-4 w-full bg-gradient-to-b from-ink-400 via-ink-400 to-transparent h-32"
        ></div>
        <div class="relative z-20">
          <slot name="controls" />
        </div>
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
          :show-seen-info="false"
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
      <slot name="footer"></slot>
    </template>
  </section>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import IssueListItem from '@/components/IssueListItem.vue'
import { Issue, CheckStatus } from '@/types/types'

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
  status: CheckStatus

  @Prop({ default: () => [] })
  errorsRendered: RunError[]

  public isScrolled = false
  public isAutofixOpen = false
  readonly CheckStatus = CheckStatus

  get issueCount(): number {
    return this.concreteIssueList?.edges?.length || 0
  }

  get concreteIssues(): Issue[] {
    return resolveNodes(this.concreteIssueList) as Issue[]
  }

  handleScroll() {
    this.isScrolled = Boolean(window.scrollY > 10)
  }

  mounted() {
    document.addEventListener('scroll', this.handleScroll)
  }

  beforeDestroy() {
    document.removeEventListener('scroll', this.handleScroll)
  }
}
</script>
<style scoped>
/* height of RepoHeader + Breadcrumbs + RunHeader */
.header-offset {
  top: 339px;
}

@media (min-width: 1024px) {
  .header-offset {
    top: 282px;
  }
}

@media (min-width: 1280px) {
  .header-offset {
    top: 242px;
  }
}
</style>
