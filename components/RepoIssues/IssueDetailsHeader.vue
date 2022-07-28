<template>
  <div class="flex flex-col flex-1 gap-y-2 pb-1">
    <!-- Heading -->
    <div class="flex flex-wrap items-baseline text-lg font-normal text-vanilla-400">
      <span class="pr-2 font-bold text-vanilla-100" v-html="escapeHtml(title)"> </span>
      <span class="flex-shrink-0 block md:flex font-medium">{{ shortcode }}</span>
    </div>
    <div class="flex items-center w-full text-vanilla-400 sm:w-auto">
      <!-- Meta data -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 leading-none">
        <issue-type v-if="issueType" :issueType="issueType"></issue-type>
        <issue-severity-tag v-if="severity && issueType === 'security'" :severity="severity" />
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
        <div v-if="tags.length" class="flex items-center justify-between gap-x-1">
          <nuxt-link
            v-for="tag in tags"
            :key="tag"
            :to="`${$generateRoute(['issues'])}?category=all&q=tag:${tag}`"
            v-tooltip="`View all issues tagged ${deslugifyTag(tag).toUpperCase()}`"
            class="flex items-center gap-x-1 uppercase border border-ink-200 rounded-full px-1.5 py-1"
          >
            <span
              class="h-2 w-2 rounded-full"
              :style="{
                background: generateColorFromTag(tag)
              }"
            ></span>
            <span class="text-xxs text-vanilla-400 tracking-wide font-medium">
              {{ deslugifyTag(tag) }}
            </span>
          </nuxt-link>
        </div>
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
import { IssuePriority, IssueSeverity } from '~/types/types'
import { generateColorFromTag } from '~/utils/ui'

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

  @Prop()
  tags: Array<string>

  @Prop()
  severity: IssueSeverity

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

  /**
   * Remove hyphens from tag slugs except for cwe tags
   *
   * @param  {string} tag
   * @returns {string}
   */
  deslugifyTag(tag: string): string {
    const cweRegex = new RegExp('^(cwe-)[0-9]+$', 'i')

    if (cweRegex.test(tag)) return String(tag)

    return String(tag).replace(/-/g, ' ')
  }
}
</script>
