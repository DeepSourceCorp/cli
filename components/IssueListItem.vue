<template>
  <base-card
    :to="link"
    :remove-default-style="true"
    class="rounded-lg border border-slate-400 bg-ink-400 hover:bg-ink-300"
  >
    <template #left-section>
      <div class="flex w-full justify-between">
        <div class="flex w-3/4 flex-col gap-y-0 p-4 xs:w-4/5">
          <div class="pb-1">
            <h3
              class="mr-1 inline cursor-pointer break-all text-sm font-medium leading-snug text-vanilla-100 md:text-base"
              v-html="safeRenderBackticks(title)"
            ></h3>
            <span class="whitespace-nowrap text-sm font-normal text-vanilla-400">
              {{ shortcode }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-y-1.5 gap-x-4">
            <!-- Issue type -->
            <issue-type :issue-type="issueType" />
            <!-- First seen and last seen -->
            <meta-data-item v-if="showSeenInfo" icon="clock">
              <span v-tooltip="`Last seen on ${formatDate(lastSeen, 'lll')}`">
                {{ lastSeenDisplay }}
              </span>
              &mdash;
              <span v-tooltip="`First seen on ${formatDate(firstSeen, 'lll')}`">
                {{ firstSeenDisplay }}
              </span>
            </meta-data-item>

            <!-- Occurrences in files -->
            <meta-data-item icon="file-text" word-break="break-normal">
              Found in {{ seenIn }}
            </meta-data-item>
          </div>
        </div>

        <!-- right section -->
        <div
          class="flex h-full w-1/4 flex-col border-l border-slate-400 group-hover:border-slate-400 xs:w-1/5"
          :class="{
            'items-center justify-center': centerContent
          }"
        >
          <!-- Occurence count and Trend  -->
          <div
            class="flex flex-grow flex-col items-center justify-center text-xs leading-none"
            :class="showTrend ? 'py-1' : 'py-2'"
          >
            <!-- Count -->
            <div
              v-tooltip="occurrenceCount > 1000 ? `${formatIntl(occurrenceCount)} occurrences` : ''"
              class="text-lg font-bold leading-10 text-vanilla-100 md:text-1.5xl"
            >
              {{ shortenLargeNumber(occurrenceCount) }}
            </div>
            <!-- Trend -->
            <ticker
              v-if="showTrend"
              v-tooltip="trend.trendHint"
              :trend-direction="trend.trendDirection === TrendDirection.Up ? 'up' : 'down'"
              :trend-positive="trend.trendPositive"
              :trend-value="trend.trendValue ? `${trend.trendValue}%` : 'from 0'"
              :show-bg="false"
              custom-bg-class="bg-ink-100"
              class="hidden text-xxs sm:block md:text-xs"
              :class="trend.trendDirection === TrendDirection.Up ? 'text-cherry' : 'text-juniper'"
            />
          </div>
          <!-- Autofix -->
          <button
            v-if="autofixAvailable && showAutofixButton"
            :disabled="disableAutofixButton"
            data-testid="autofix-issue"
            class="flex h-auto w-full items-center justify-center border-t border-slate-400 p-2 group-hover:border-slate-400 sm:gap-x-2"
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
import { ZIcon } from '@deepsource/zeal'
import dayjs from 'dayjs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { BaseCard } from '@/components/History'
import { IssueType } from '@/components/Repository'
import { formatDate } from '~/utils/date'
import { formatIntl, safeRenderBackticks, shortenLargeNumber } from '~/utils/string'
import { IssueSeverity, IssueTrend, TrendDirection } from '~/types/types'
import { FilterParams } from './Run/AnalyzerRun.vue'

@Component({
  components: {
    ZIcon,
    IssueType,
    BaseCard
  },
  methods: { formatDate, shortenLargeNumber, formatIntl, safeRenderBackticks }
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
  lastSeen!: string

  @Prop({ default: '' })
  firstSeen!: string

  @Prop({ default: '' })
  seenIn!: string

  @Prop({ default: '' })
  occurrenceCount!: number

  @Prop()
  autofixAvailable!: boolean

  @Prop({ default: '' })
  centerContent!: boolean

  @Prop()
  trend!: IssueTrend

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

  @Prop({ default: () => ({}) })
  issueListFilters: FilterParams

  @Prop({ default: 0 })
  issueListIndex: number

  TrendDirection = TrendDirection

  public handleClick(): void {
    this.$emit('autofix', {
      shortcode: this.shortcode,
      raisedInFiles: this.raisedInFiles,
      issueId: this.id
    })
  }

  get showTrend(): boolean {
    return Boolean(this.trend && Object.keys(this.trend).length > 0)
  }

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
   * Combine the issue link with any active filters
   *
   * @returns {string}
   */
  get link(): string {
    let filters: string[] = []
    const filterTypes = ['category', 'sort', 'q']

    /**
     * ! These parameters are used to transfer the active filters from previous issues...
     * ! ...page to this page for arrow navigation
     * ? Ref: https://github.com/deepsourcelabs/bifrost/blob/d1c45b19d94f61159e60c71d717cf2d31ded048e/pages/_provider/_owner/_repo/run/_runId/_analyzer/_issueId.vue#L397
     */
    Object.keys(this.issueListFilters).forEach((key) => {
      if (filterTypes.includes(key)) {
        filters = filters.concat(`list${key}=${this.issueListFilters[key as keyof FilterParams]}`)
      }
    })

    filters = filters.concat(`listindex=${this.issueListIndex}`)

    return filters.length > 0 ? `${this.issueLink}?${filters.join('&')}` : this.issueLink
  }
}
</script>
