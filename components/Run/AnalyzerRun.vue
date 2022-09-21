<template>
  <section class="flex flex-col">
    <div
      v-if="status === CheckStatus.Fail"
      id="issue-filters"
      class="px-3 md:sticky md:z-10 check-filter-headers-offset bg-ink-400"
    >
      <slot name="controls" />
    </div>
    <div class="p-3">
      <run-error-box v-if="errorsRendered.length" :errorsRendered="errorsRendered" class="mb-3" />
      <lazy-run-loading v-if="status === CheckStatus.Pend" />
      <lazy-run-pass v-else-if="status === CheckStatus.Pass && issueCount === 0" />
      <lazy-run-cancelled v-else-if="status === CheckStatus.Cncl && issueCount === 0" />
      <lazy-run-timeout v-else-if="status === CheckStatus.Timo && issueCount === 0" />
      <lazy-run-waiting v-else-if="status === CheckStatus.Wait && issueCount === 0" />
      <lazy-run-nuked v-else-if="status === CheckStatus.Atmo && issueCount === 0" />
      <lazy-run-pass
        v-else-if="status === CheckStatus.Fail && issueCount === 0 && !isFilterApplied"
      />
      <template v-else>
        <div class="grid grid-cols-1 gap-y-3">
          <template v-if="issueCount">
            <issue-list-item
              v-for="(issue, index) in concreteIssues"
              :key="issue.id"
              v-bind="issue"
              :show-autofix-button="false"
              :issue-link="
                $generateRoute([
                  'run',
                  $route.params.runId,
                  $route.params.analyzer,
                  issue.shortcode
                ])
              "
              :center-content="true"
              :show-seen-info="false"
              :issue-list-filters="filters"
              :issue-list-index="getIssueIndex(index)"
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
        </div>
      </template>
    </div>
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

export interface FilterParams {
  category: string
  sort: string
  q: string
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

  @Prop({ default: 1 })
  currentPage: number

  @Prop({
    default: () => {
      return {
        category: '',
        sort: '',
        q: ''
      }
    }
  })
  filters: FilterParams

  public isAutofixOpen = false
  readonly CheckStatus = CheckStatus

  get issueCount(): number {
    return this.concreteIssueList?.edges?.length || 0
  }

  get concreteIssues(): Issue[] {
    return resolveNodes(this.concreteIssueList) as Issue[]
  }

  get isFilterApplied(): boolean {
    if (this.filters.q) return true
    if (this.filters.sort) return true
    if (this.filters.category) return true

    return false
  }

  /**
   * Computes the issue index within the paginated list of issues in the run by adding the raw index to the number of issues to skip based on the `currentPage`
   *
   * @param index the item index in the current list
   */
  getIssueIndex(index: number): number {
    return (this.currentPage - 1) * 10 + index
  }
}
</script>
<style scoped>
/* all for mobiles */
.analyzer-page {
  --mobile-navbar-height: 40px;
  --repo-header-height: 184px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(
    var(--repo-header-height) + var(--breadcrumb-height) + var(--mobile-navbar-height)
  );

  --run-check-title-height: 140px;
}

.check-filter-headers-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
}

.min-height-for-offset {
  min-height: calc(100vh - var(--top-bar-offset) - var(--run-check-title-height));
}

@media (min-width: 640px) {
  .analyzer-page {
    --run-check-title-height: 104px;
  }
}

@media (min-width: 768px) {
  .analyzer-page {
    --breadcrumb-height: 52px;
  }
}

/* all for tablets */
@media (min-width: 1023px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 167.5px;
  }
}

@media (min-width: 1280px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 96px;
  }
}
</style>
