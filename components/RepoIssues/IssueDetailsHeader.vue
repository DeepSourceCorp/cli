<template>
  <div class="flex flex-col flex-1 space-y-3">
    <!-- Heading -->
    <div class="flex flex-wrap items-baseline text-2xl font-normal text-vanilla-400">
      <span class="pr-2 font-semibold text-vanilla-100" v-html="escapeHtml(title)"> </span>
      <span class="flex-shrink-0 block text-xl md:flex">{{ shortcode }}</span>
    </div>
    <div class="flex items-center w-full text-vanilla-400 sm:w-auto">
      <!-- Meta data -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 leading-none">
        <issue-type v-if="issueType" :issueType="issueType"></issue-type>
        <div v-if="analyzerName" class="flex items-center space-x-2">
          <z-icon :icon="analyzerShortcode"></z-icon>
          <span class="text-sm">{{ analyzerName }}</span>
        </div>
        <div v-if="firstSeen && lastSeen" class="flex items-center space-x-2">
          <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
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
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import dayjs from 'dayjs'
import { ZIcon } from '@deepsourcelabs/zeal'
import IssueType from '@/components/Repository/IssueType.vue'
import { PriorityTypeBadge, PriorityTypeSelect } from '@/components/IssuePriority/index'

import { formatDate } from '@/utils/date'
import { escapeHtml } from '~/utils/string'
import { IssuePriority } from '~/types/types'

@Component({
  components: {
    ZIcon,
    IssueType,
    PriorityTypeBadge,
    PriorityTypeSelect
  },
  layout: 'repository',
  methods: {
    escapeHtml,
    formatDate
  }
})
export default class IssueDetailsHeader extends Vue {
  @Prop()
  analyzerName: string

  @Prop()
  analyzerShortcode: string

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

  @Prop({ default: false })
  canEditPriority!: boolean

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
