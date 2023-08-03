<template>
  <div class="flex flex-1 flex-col gap-y-2 pb-1">
    <!-- Heading -->
    <div class="flex flex-wrap items-baseline text-lg font-normal text-vanilla-400">
      <span class="pr-2 font-bold text-vanilla-100" v-html="safeRenderBackticks(title)"> </span>
      <span class="block flex-shrink-0 font-medium md:flex">{{ shortcode }}</span>
    </div>
    <div class="flex w-full items-center text-vanilla-400 sm:w-auto">
      <!-- Meta data -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 leading-none">
        <issue-type v-if="issueType" :issue-type="issueType" />
        <issue-severity-tag v-if="severity && issueType === 'security'" :severity="severity" />
        <meta-data-item v-if="count" icon="file-pulse"
          >{{ count }} {{ count > 1 ? 'occurrences' : 'occurrence' }} in this check</meta-data-item
        >
        <div v-if="firstSeen && lastSeen" class="flex items-center space-x-2">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">
            <span v-tooltip="`Last seen on ${formatDate(lastSeen, 'lll')}`">{{
              lastSeenDisplay
            }}</span>
            &mdash;
            <span v-tooltip="`First seen on ${formatDate(firstSeen, 'lll')}`">{{
              firstSeenDisplay
            }}</span>
          </span>
        </div>
        <template v-if="issuePriority">
          <priority-type-select
            v-if="canEditPriority"
            width="small"
            :priority="issuePriority.cascadingIssuePriority.slug"
            :source="issuePriority.source"
            :verbose-title="true"
            :show-tooltip="true"
            :show-footer="true"
            @priority-changed="$emit('priority-edited', $event)"
          />
          <priority-type-badge
            v-else-if="issuePriority.cascadingIssuePriority.slug !== 'noop'"
            :source="issuePriority.source"
            :priority="issuePriority.cascadingIssuePriority.slug"
            :verbose-title="true"
            :show-tooltip="true"
          />
        </template>
        <div v-if="tags.length" class="flex items-center justify-between gap-x-1">
          <nuxt-link
            v-for="tag in tags"
            :key="tag"
            v-tooltip="`View all issues tagged ${deslugifyTag(tag).toUpperCase()}`"
            :to="`${$generateRoute(['issues'])}?category=all&q=tag:${tag}`"
            class="flex items-center gap-x-1 rounded-full border border-slate-400 px-1.5 py-1 uppercase"
          >
            <span
              class="h-2 w-2 rounded-full"
              :style="{
                background: generateColorFromTag(tag)
              }"
            ></span>
            <span class="text-xxs font-medium tracking-wide text-vanilla-400">
              {{ deslugifyTag(tag) }}
            </span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import dayjs from 'dayjs'

import { formatDate } from '@/utils/date'
import { IssuePriority, IssueSeverity } from '~/types/types'
import { safeRenderBackticks } from '~/utils/string'
import { deslugifyTag, generateColorFromTag } from '~/utils/ui'

@Component({
  layout: 'repository',
  methods: {
    deslugifyTag,
    safeRenderBackticks,
    formatDate,
    generateColorFromTag
  }
})
export default class IssueDetailsHeader extends Vue {
  @Prop()
  firstSeen: string

  @Prop()
  issueType: string

  @Prop()
  lastSeen: string

  @Prop()
  shortcode: string

  @Prop()
  title: string

  @Prop()
  issuePriority: IssuePriority | null

  @Prop({ default: () => [] })
  tags: Array<string>

  @Prop()
  severity: IssueSeverity

  @Prop({ default: false })
  canEditPriority!: boolean

  @Prop({ default: 0 })
  count: number

  get lastSeenDisplay(): string {
    /**
     * Return when the issue was seen the last time in a human-readable form.
     */
    return dayjs(this.lastSeen).fromNow()
  }

  get firstSeenDisplay(): string {
    /**
     * Return when the issue was first seen in a human-readable form.
     */
    return `${dayjs(this.firstSeen).fromNow(true)} old`
  }
}
</script>
