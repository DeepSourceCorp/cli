<template>
  <div>
    <component
      :is="isIssuesPage ? 'button' : 'nuxt-link'"
      :to="
        isIssuesPage && !analyzerShortcode ? '' : `/directory/analyzers/${analyzerShortcode}/issues`
      "
      class="
        flex
        justify-between
        w-72
        rounded-md
        p-2
        mb-3
        hover:bg-ink-200 hover:text-vanilla-100
        focus:text-vanilla-100
        outline-none
        focus:outline-none
      "
      :class="{
        'bg-ink-200 text-vanilla-100': activeFilter === '',
        'text-vanilla-400': activeFilter !== ''
      }"
      @click="updateFilter('')"
    >
      <p class="flex items-center gap-x-2 text-sm">
        <z-icon icon="list" size="small" color="current" />
        <span>All issues</span>
      </p>
      <z-tag bg-color="ink-200" text-size="xs" spacing="py-0.5 px-2">
        {{ shortenNumber(allFilterCount) }}
      </z-tag>
    </component>
    <component
      v-for="issueType in filteredIssueDistribution"
      :key="issueType.shortcode"
      :is="isIssuesPage ? 'button' : 'nuxt-link'"
      :to="
        isIssuesPage && !analyzerShortcode
          ? ''
          : `/directory/analyzers/${analyzerShortcode}/issues?filter-preset=${issueType.shortcode}`
      "
      button-type="ghost"
      :type="isIssuesPage ? 'button' : ''"
      :color="activeFilter === issueType.shortcode ? '' : 'vanilla-400'"
      class="
        flex
        justify-between
        w-72
        rounded-md
        p-2
        mb-3
        hover:bg-ink-200 hover:text-vanilla-100
        focus:text-vanilla-100
        outline-none
        focus:outline-none
      "
      :class="{
        'bg-ink-200 text-vanilla-100': activeFilter === issueType.shortcode,
        'text-vanilla-400': activeFilter !== issueType.shortcode
      }"
      @click="updateFilter(issueType.shortcode)"
    >
      <p class="flex items-center gap-x-2 text-sm">
        <z-icon :icon="issueType.shortcode" size="small" color="current" />
        <span>{{ issueType.title }}</span>
      </p>
      <z-tag bg-color="ink-200" text-size="xs" spacing="py-0.5 px-2">
        {{ shortenNumber(issueType.count) }}
      </z-tag>
    </component>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'

import { shortenLargeNumber } from '~/utils/string'
import IssueTypeT from '~/types/issueDistribution'

@Component({
  components: { ZButton, ZIcon, ZTag },
  name: 'AnalyzerIssuesFilter'
})
export default class AnalyzerIssuesFilter extends Vue {
  @Prop()
  issueDistribution: IssueTypeT[]

  @Prop()
  totalIssueCount: number

  @Prop()
  activeFilter: string

  @Prop({ default: true })
  isIssuesPage: boolean

  @Prop({ default: '' })
  analyzerShortcode: string

  get filteredIssueDistribution(): IssueTypeT[] {
    return this.issueDistribution.slice(1)
  }

  get allFilterCount(): number | undefined {
    return this.issueDistribution.find((issueType) => issueType.shortcode === 'all')?.count
  }

  updateFilter(val: string) {
    this.$emit('selected', val)
  }

  shortenNumber(val: number): string {
    return shortenLargeNumber(val)
  }
}
</script>
