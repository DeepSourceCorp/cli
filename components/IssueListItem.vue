<template>
  <base-card
    :to="issueLink"
    :remove-default-style="true"
    class="border rounded-lg bg-ink-400 hover:bg-ink-300 border-ink-200"
  >
    <template #left-section>
      <div class="flex justify-between w-full">
        <div class="flex flex-col w-3/4 p-4 gap-y-1 xs:w-4/5">
          <div>
            <h3
              class="inline mr-1 text-sm font-medium leading-snug cursor-pointer text-vanilla-100 md:text-base"
              v-html="escapeHtml(title)"
            />
            <span class="text-sm font-normal whitespace-nowrap text-vanilla-400">
              {{ shortcode }}
            </span>
          </div>
          <div class="flex items-center flex-wrap gap-y-1.5 gap-x-4">
            <!-- Issue type -->
            <issue-type :issue-type="issueType" />
            <!-- First seen and last seen -->
            <meta-data-item v-if="showSeenInfo" icon="clock">
              <span v-tooltip="`Last seen on ${formatDate(modifiedAt, 'lll')}`">
                {{ lastSeenDisplay }}
              </span>
              &mdash;
              <span v-tooltip="`First seen on ${formatDate(createdAt, 'lll')}`">
                {{ firstSeenDisplay }}
              </span>
            </meta-data-item>
          </div>
          <div class="flex items-center flex-wrap gap-y-1.5 gap-x-4">
            <!-- Occurrences in files -->
            <meta-data-item icon="file-text"> Found in {{ seenIn }} </meta-data-item>
          </div>
        </div>

        <!-- right section -->
        <div
          class="flex flex-col w-1/4 h-full border-l xs:w-1/5 border-ink-200 group-hover:border-ink-100"
          :class="{
            'justify-center items-center': centerContent
          }"
        >
          <!-- Occurence count and Trend  -->
          <div
            class="flex flex-col items-center justify-center flex-grow text-xs leading-none"
            :class="showTrend ? 'py-1' : 'py-2'"
          >
            <!-- Count -->
            <div
              v-tooltip="occurrenceCount > 1000 ? `${formatIntl(occurrenceCount)} occurrences` : ''"
              class="text-lg md:text-1.5xl font-bold leading-10 text-vanilla-100"
            >
              {{ shortenLargeNumber(occurrenceCount) }}
            </div>
            <ticker
              v-if="showTrend"
              :icon="isTrendPositive ? 'triangle-up' : 'triangle-down'"
              :trend-direction="isTrendPositive ? 'up' : 'down'"
              :trend-positive="isTrendPositive"
              :trend-value="`${trendValue}%`"
              :show-bg="false"
              trend-hint="since last week"
              class="bg-opacity-0 text-xxs md:text-xs"
              :class="isTrendPositive ? 'text-juniper' : 'text-cherry'"
            />
          </div>
          <!-- Autofix -->
          <button
            v-if="autofixAvailable && showAutofixButton"
            :disabled="disableAutofixButton"
            data-testid="autofix-issue"
            class="flex items-center justify-center w-full h-auto p-2 border-t sm:gap-x-2 border-ink-200 group-hover:border-ink-100"
            :class="{
              'cursor-pointer hover:bg-ink-200': !disableAutofixButton
            }"
            @click.stop.prevent="handleClick()"
          >
            <z-icon icon="autofix" color="juniper" class="hidden sm:block" />
            <z-icon icon="autofix" size="x-small" color="juniper" class="block sm:hidden" />
            <span class="ml-1 text-sm font-medium text-juniper sm:ml-0">Autofix</span>
          </button>
        </div>
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { ZIcon } from '@deepsourcelabs/zeal'
import dayjs from 'dayjs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { BaseCard } from '@/components/History'
import { IssueType } from '@/components/Repository'
import { formatDate } from '~/utils/date'
import { escapeHtml, formatIntl, shortenLargeNumber } from '~/utils/string'
import { IssueSeverity } from '~/types/types'

const PERCENTAGE = 100

@Component({
  components: {
    ZIcon,
    IssueType,
    BaseCard
  },
  methods: { formatDate, shortenLargeNumber, formatIntl, escapeHtml }
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

  @Prop()
  severity: IssueSeverity

  @Prop({ default: '' })
  modifiedAt!: string

  @Prop({ default: '' })
  createdAt!: string

  @Prop({ default: '' })
  seenIn!: string

  @Prop({ default: '' })
  occurrenceCount!: number

  @Prop()
  autofixAvailable!: boolean

  @Prop({ default: '' })
  hideProgress!: boolean

  @Prop({ default: true })
  showComparisonStat!: boolean

  @Prop({ default: '' })
  centerContent!: boolean

  @Prop()
  pastValue!: number

  @Prop()
  raisedInFiles!: Array<string>

  @Prop()
  issueLink!: string

  @Prop({ default: true })
  showAutofixButton!: boolean

  @Prop({ default: false })
  disableAutofixButton!: boolean

  @Prop({ default: true })
  showSeenInfo!: boolean

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

        If the past value is zero, don't show
      */
    if (this.pastValue === 0) {
      return false
    }

    if (this.trendValue === 100) {
      return false
    }

    if (this.showComparisonStat && Number.isFinite(this.pastValue) && Number(this.pastValue)) {
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

  get trendValue(): number {
    /*
        Return the trend percentage display.
      */
    let changePercentage = PERCENTAGE
    // newly introduced issue, 100% increased
    if (Number.isFinite(this.pastValue)) {
      const maxValue = Math.max(Number(this.pastValue), Number(this.occurrenceCount))
      const minValue = Math.min(Number(this.pastValue), Number(this.occurrenceCount))
      const delta = maxValue - minValue
      changePercentage = Math.round((delta / maxValue) * PERCENTAGE)
    }
    return changePercentage
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
}
</script>
