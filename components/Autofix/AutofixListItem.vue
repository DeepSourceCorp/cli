<template>
  <base-card :show-info="showInfo" :to="$generateRoute(['autofix', runId])">
    <template #title>
      <z-icon
        v-tooltip="tooltipText"
        :icon="runIcon"
        size="small"
        class="flex-shrink-0"
        :color="statusColor"
      />
      <h3
        class="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-vanilla-100"
        v-html="safeRenderBackticks(pullRequestTitle.trim() || (issue && issue.title))"
      ></h3>

      <span v-if="issue" class="inline flex-shrink-0 text-sm font-normal text-vanilla-400 md:flex">
        {{ issue.shortcode }}
      </span>
    </template>
    <template #description>
      <div class="ml-6 mt-2 items-center gap-x-4 gap-y-1 md:flex md:flex-wrap">
        <!-- Issue type -->
        <div class="flex space-x-5">
          <issue-type v-if="issue" :issue-type="issue.issueType" />
          <!-- Analyzer -->
          <div class="flex items-center space-x-1.5 text-sm">
            <analyzer-logo v-bind="analyzer" size="small" class="flex-shrink-0" />
            <span class="text-sm text-vanilla-400">{{ analyzer.name }}</span>
          </div>
        </div>
        <!-- Created -->
        <div class="flex items-center space-x-1.5 text-sm">
          <z-icon icon="clock" size="x-small" color="vanilla-400" class="flex-shrink-0" />
          <span class="text-sm text-vanilla-400">Created {{ formatDuration }}</span>
        </div>
        <!-- Avatar -->
        <div class="hidden items-center space-x-1.5 text-sm sm:flex">
          <z-avatar
            size="xs"
            :image="createdBy.avatar"
            :fallback-image="getDefaultAvatar(createdBy.email)"
            :user-name="createdBy.fullName || createdBy.email"
          />
          <span class="text-sm text-vanilla-400"
            >Created by {{ createdBy.fullName || createdBy.email }}</span
          >
        </div>
      </div>
    </template>
    <template #info>
      <div class="flex h-full items-center justify-around space-x-2">
        <div class="flex flex-col items-center">
          <div
            class="text-2xl font-medium"
            :class="resolvedIssuesCount > 0 ? 'text-juniper' : 'text-vanilla-400'"
          >
            {{ resolvedIssuesCount || 0 }}
          </div>
          <div v-if="isPending" class="text-xs text-vanilla-400">occurrences fixable</div>
          <div v-else class="text-xs text-vanilla-400">occurrences fixed</div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { BaseCard } from '@/components/History'
import { fromNow } from '@/utils/date'
import { safeRenderBackticks } from '~/utils/string'
import { AutofixRunStatus } from '~/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    BaseCard
  },
  methods: {
    getDefaultAvatar,
    safeRenderBackticks
  }
})
export default class AutofixListItem extends mixins(RoleAccessMixin) {
  @Prop()
  runId!: string

  @Prop()
  issue!: Record<string, string>

  @Prop()
  analyzer!: Record<string, string>

  @Prop()
  createdBy!: Record<string, string>

  @Prop()
  createdAt!: string

  @Prop()
  resolvedIssuesCount!: number

  @Prop()
  status!: string

  @Prop()
  pullRequestTitle!: string

  @Prop({ default: true })
  showInfo!: boolean

  public selectedFiles: Array<string> = []

  public selectedHunkIds: Array<string> = []

  get formatDuration(): string {
    return fromNow(this.createdAt)
  }

  get statusColor(): string {
    const colors: Record<string, string> = {
      PASS: 'juniper',
      PEND: 'vanilla-100',
      CNCL: 'vanilla-400',
      FAIL: 'cherry',
      STAL: 'slate',
      TIMO: 'honey'
    }
    return colors[this.status]
  }

  get tooltipText(): string {
    const types: Record<string, string> = {
      PASS: 'Autofix completed',
      PEND: 'This Autofix is pending',
      CNCL: 'Autofix cancelled',
      FAIL: 'Autofix failed',
      STAL: 'Stale Autofix',
      TIMO: 'Autofix timed out'
    }
    return types[this.status || 'PASS']
  }

  get runIcon(): string {
    const icons: Record<string, string> = {
      PASS: 'check',
      PEND: 'refresh-cw',
      CNCL: 'slash',
      FAIL: 'x',
      STAL: 'stale',
      TIMO: 'clock'
    }
    return icons[this.status]
  }

  get isPending(): boolean {
    return this.status === AutofixRunStatus.Pend
  }
}
</script>
