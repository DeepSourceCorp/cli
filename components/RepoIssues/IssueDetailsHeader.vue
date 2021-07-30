<template>
  <div class="flex flex-col flex-1 space-y-3">
    <!-- Heading -->
    <div class="font-normal flex flex-wrap text-2xl text-vanilla-400 items-baseline">
      <!-- Issue title -->
      <span class="font-semibold text-vanilla-100 pr-2" v-html="title"> </span>
      <!-- Issue ID -->
      <span class="block md:flex flex-shrink-0 text-xl">{{ shortcode }}</span>
    </div>
    <div class="flex items-center text-vanilla-400 w-full sm:w-auto">
      <!-- Meta data -->
      <div class="flex items-center space-x-5 flex-1 leading-none">
        <!-- issue type -->
        <issue-type v-if="issueType" :issueType="issueType"></issue-type>

        <!-- analyzer name -->
        <div v-if="analyzerName" class="flex items-center space-x-2">
          <z-icon :icon="analyzerShortcode"></z-icon>
          <span class="text-sm">{{ analyzerName }}</span>
        </div>

        <!-- First and last seen -->
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

        <!-- occurrence count -->
        <div v-if="count" class="flex items-center space-x-2">
          <z-icon icon="file-text" size="small" color="vanilla-400"></z-icon>
          <span>{{ count }} occurences found in these check</span>
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

@Component({
  components: {
    ZIcon,
    IssueType
  },
  layout: 'repository'
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

  private formatDate = formatDate

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
