<template>
  <div class="flex flex-col flex-1 space-y-3">
    <!-- Heading -->
    <div class="flex flex-wrap items-baseline text-2xl font-normal text-vanilla-400">
      <span class="pr-2 font-semibold text-vanilla-100" v-html="escapeHtml(title)"> </span>
      <span class="flex-shrink-0 block text-xl md:flex">{{ shortcode }}</span>
    </div>
    <div class="flex items-center w-full text-vanilla-400 sm:w-auto">
      <!-- Meta data -->
      <div class="flex flex-wrap items-center leading-none">
        <issue-type v-if="issueType" :issueType="issueType" class="mr-4"></issue-type>
        <div v-if="analyzerName" class="flex items-center mr-4 space-x-2">
          <z-icon :icon="analyzerShortcode"></z-icon>
          <span class="text-sm">{{ analyzerName }}</span>
        </div>
        <div v-if="firstSeen && lastSeen" class="flex items-center mr-4 space-x-2">
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
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import dayjs from 'dayjs'
import { ZIcon } from '@deepsourcelabs/zeal'
import IssueType from '@/components/Repository/IssueType.vue'

import { formatDate } from '@/utils/date'
import { escapeHtml } from '~/utils/string'

@Component({
  components: {
    ZIcon,
    IssueType
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
