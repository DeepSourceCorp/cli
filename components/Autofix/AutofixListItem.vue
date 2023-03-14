<template>
  <base-card :show-info="showInfo" :to="$generateRoute(['autofix', runId])">
    <template slot="title">
      <z-icon
        v-tooltip="tooltipText"
        :icon="runIcon"
        size="small"
        class="flex-shrink-0"
        :color="statusColor"
      />
      <h3
        class="overflow-hidden cursor-pointer text-vanilla-100 whitespace-nowrap overflow-ellipsis"
        v-html="safeRenderBackticks(pullRequestTitle.trim() || (issue && issue.title))"
      ></h3>

      <span class="flex-shrink-0 inline text-sm font-normal text-vanilla-400 md:flex" v-if="issue">
        {{ issue.shortcode }}
      </span>
    </template>
    <template slot="description">
      <div class="items-center mt-2 ml-6 gap-x-4 gap-y-1 md:flex-wrap md:flex">
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
        <div class="hidden sm:flex items-center space-x-1.5 text-sm">
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
    <template slot="info">
      <div class="flex items-center justify-around h-full space-x-2">
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
import { ZIcon, ZButton, ZAvatar } from '@deepsource/zeal'
import { fromNow } from '@/utils/date'
import { safeRenderBackticks } from '~/utils/string'
import { AutofixRunStatus } from '~/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    BaseCard,
    ZIcon,
    ZButton,
    ZAvatar
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
