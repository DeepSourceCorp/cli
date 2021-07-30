<template>
  <base-card :to="issueLink" :removeDefaultStyle="removeDefaultStyle">
    <template slot="header"> <slot name="header"></slot> </template>
    <template slot="title">
      <div class="font-normal flex flex-wrap text-lg text-vanilla-400 items-baseline mb-1">
        <span
          class="font-semibold text-vanilla-100 pr-2 line-clamp-1"
          :to="issueLink"
          v-html="title"
        >
        </span>
        <!-- Issue ID -->
        <span class="block md:flex flex-shrink-0 text-base">{{ shortcode }}</span>
      </div>
    </template>
    <template slot="description">
      <div class="flex flex-col space-y-1">
        <div class="space-x-4 flex flex-wrap">
          <!-- Issue type -->
          <issue-type :issueType="issueType"></issue-type>
          <!-- First seen and last seen -->
          <div class="items-center space-x-2 flex">
            <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
            <span class="text-sm text-vanilla-400">
              <span v-tooltip="`Last seen on ${formatDate(modifiedAt, 'lll')}`">{{
                lastSeenDisplay
              }}</span>
              &mdash;
              <span v-tooltip="`First seen on ${formatDate(createdAt, 'lll')}`">{{
                firstSeenDisplay
              }}</span>
            </span>
          </div>
          <!-- Occurences in files -->
        </div>
        <div
          class="flex items-center w-full space-x-1 text-sm text-vanilla-400 sm:w-auto leading-6"
        >
          <z-icon icon="file-text" size="x-small" color="vanilla-400"></z-icon>
          <span class="overflow-hidden whitespace-pre overflow-ellipsis"
            >Found in {{ seenIn }}</span
          >
        </div>
      </div>
    </template>
    <template slot="info">
      <div
        class="flex flex-col h-full"
        :class="{
          'justify-center items-center': centerContent
        }"
      >
        <!-- Occurence count and Trend  -->
        <div
          class="flex-col items-center justify-center flex-grow text-xs lg:space-y-2 hidden sm:flex leading-none"
          :class="{ 'py-4': !showTrend, 'py-2': showTrend }"
        >
          <!-- Count -->
          <div class="heading3 text-vanilla-100">{{ occurrenceCount }}</div>
          <!-- Info -->
          <div v-if="showTrend" class="hidden text-vanilla-400 sm:block text-center px-1">
            <span
              :class="{
                'text-cherry': !this.isTrendPositive,
                'text-juniper': this.isTrendPositive
              }"
              >{{ `${this.isTrendPositive ? '-' : '+'}${trendValue}` }}</span
            >
            since last week
          </div>
        </div>
        <!-- Autofix -->
        <button
          v-if="autofixAvailable && showAutofixButton"
          @click.stop.prevent="handleClick()"
          :disabled="disableAutofixButton"
          class="flex items-center justify-center w-full h-auto p-2 border-t sm:space-x-2 border-ink-300 group-hover:border-ink-200"
          :class="{
            'cursor-pointer hover:bg-ink-200': !disableAutofixButton
          }"
        >
          <z-icon icon="autofix" size="small" color="juniper" class="hidden sm:block"></z-icon>
          <z-icon icon="autofix" size="x-small" color="juniper" class="block sm:hidden"></z-icon>
          <span class="ml-1 text-sm font-medium text-juniper sm:ml-0">Autofix</span>
        </button>
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import dayjs from 'dayjs'
import { ZIcon } from '@deepsourcelabs/zeal'
import IssueType from '@/components/Repository/IssueType.vue'
import { formatDate } from '~/utils/date'
import { BaseCard } from '@/components/History'

const PERCENTAGE = 100

@Component({
  components: {
    ZIcon,
    IssueType,
    BaseCard
  }
})
export default class IssueListItem extends Vue {
  @Prop({ default: '' })
  id!: string
  @Prop({ default: '' })
  title!: string
  @Prop({ default: '' })
  shortcode!: string
  @Prop({ default: '' })
  issueType!: string
  @Prop({ default: '' })
  modifiedAt!: string
  @Prop({ default: '' })
  createdAt!: string
  @Prop({ default: '' })
  seenIn!: string
  @Prop({ default: '' })
  occurrenceCount!: string
  @Prop()
  autofixAvailable!: boolean
  @Prop({ default: '' })
  hideProgress!: boolean
  @Prop({ default: true })
  showComparisonStat!: boolean
  @Prop({ default: '' })
  centerContent!: boolean
  @Prop()
  pastValue!: string
  @Prop()
  raisedInFiles!: Array<string>
  @Prop()
  issueLink!: string
  @Prop({ default: false })
  removeDefaultStyle!: boolean
  @Prop({ default: true })
  showAutofixButton!: boolean
  @Prop({ default: false })
  disableAutofixButton!: boolean

  public handleClick(): void {
    this.$emit('autofix', {
      shortcode: this.shortcode,
      raisedInFiles: this.raisedInFiles,
      issueId: this.id
    })
  }

  get showTrend(): boolean {
    /*
        Return if the trend should be shown.

        If the past value is the same as current value of
        number of occurrences, do not show the trend.
      */
    if (this.showComparisonStat) {
      return this.occurrenceCount !== this.pastValue
    }
    return false
  }
  get isTrendPositive(): boolean {
    /*
        Return true if the trend is positive, and false if it's negative.
      */
    return Number(this.occurrenceCount) < Number(this.pastValue)
  }

  get trendValue(): string {
    /*
        Return the trend percentage display.
      */
    let changePercentage = PERCENTAGE
    // newly introduced issue, 100% increased
    if (Number.isNaN(this.pastValue) && Number(this.pastValue)) {
      const maxValue = Math.max(Number(this.pastValue), Number(this.occurrenceCount))
      const minValue = Math.min(Number(this.pastValue), Number(this.occurrenceCount))
      const delta = maxValue - minValue
      changePercentage = Math.ceil((delta / maxValue) * PERCENTAGE)
    }
    return `${changePercentage}%`
  }

  get lastSeenDisplay(): string {
    /**
     * Return when the issue was seen the last time in a human-readable form.
     */
    return dayjs(this.modifiedAt).fromNow()
  }

  get firstSeenDisplay(): string {
    /**
     * Return when the issue was first seen in a human-readable form.
     */
    return `${dayjs(this.createdAt).fromNow(true)} old`
  }

  private formatDate = formatDate
}
</script>
