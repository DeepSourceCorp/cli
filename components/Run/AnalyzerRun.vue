<template>
  <section class="flex flex-col gap-y-3">
    <run-error-box v-if="errorsRendered.length" :errorsRendered="errorsRendered" />
    <run-loading v-if="status === 'PEND'" />
    <run-pass v-else-if="status === 'PASS' && issueCount === 0" />
    <run-cancelled v-else-if="status === 'CNCL' && issueCount === 0" />
    <run-timeout v-else-if="status === 'TIMO' && issueCount === 0" />
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
import { Issue, RunStatus } from '@/types/types'

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

  public isScrolled = false

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
    top: 281px;
  }
}

@media (min-width: 1280px) {
  .header-offset {
    top: 240px;
  }
}
</style>
