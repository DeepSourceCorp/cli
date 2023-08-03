<template>
  <div class="flex flex-wrap gap-2 sm:flex-nowrap">
    <div v-if="loading">
      <div class="grid h-8 min-w-52 grid-cols-2 rounded-sm border border-slate-400">
        <div class="flex items-center justify-center border-r border-slate-400 bg-ink-200 px-2">
          <div class="h-4 w-full animate-pulse rounded-md bg-ink-100"></div>
        </div>
        <div class="flex items-center justify-center px-2">
          <div class="h-4 w-full animate-pulse rounded-md bg-ink-300"></div>
        </div>
      </div>
    </div>
    <z-radio-group
      v-else
      :model-value="prStatus"
      class="grid h-8 w-full min-w-52 flex-grow grid-cols-2 font-medium text-vanilla-100 sm:w-auto sm:flex-grow-0"
      @change="(value) => $emit('runs-filter-update', { prState: value })"
    >
      <z-radio-button
        v-tooltip="{
          content: openToggleTooltip
        }"
        :value="PR_STATE_CHOICES.Open"
        spacing="w-full h-full pt-1"
        class="space-x-2 text-center"
      >
        <z-icon icon="git-pull-request" class="inline" />
        <span class="w-full text-xs capitalize">{{ shortenLargeNumber(openCount) }} Open</span>
      </z-radio-button>
      <z-radio-button
        v-tooltip="{
          content: closeToggleTooltip
        }"
        :value="PR_STATE_CHOICES.Closed"
        spacing="w-full h-full pt-1"
        class="space-x-2 text-center"
      >
        <z-icon icon="check" class="inline" />
        <span class="w-full text-xs capitalize">{{ shortenLargeNumber(closedCount) }} Closed</span>
      </z-radio-button>
    </z-radio-group>
    <z-badge type="success" size="md" :is-dot="Boolean(runStatus)">
      <z-button
        v-if="runStatus"
        size="small"
        button-type="secondary"
        :icon="runStatusIcon(runStatus)"
        :icon-color="runStatusIconColor(runStatus)"
        @click="() => $emit('runs-filter-update', { runStatus: null })"
      >
        <span>{{ runStatusTagLabel(runStatus) }}</span>
        <z-icon icon="x" size="small" />
      </z-button>
      <z-menu v-else items-z-class="z-30">
        <template #trigger="{ toggle }">
          <z-button icon="filter" size="small" button-type="secondary" @click="toggle">
            <span>Filter</span>
          </z-button>
        </template>
        <template #body="{ close }">
          <z-menu-item
            v-for="runStat in RUN_STATUSES"
            :key="runStat"
            as="button"
            :icon="runStatusIcon(runStat)"
            :icon-color="runStatusIconColor(runStat)"
            class="flex w-full items-center"
            @click="
              () => {
                $emit('runs-filter-update', { runStatus: runStat })
                close()
              }
            "
          >
            <span>{{ runStatusTagLabel(runStat) }}</span>
          </z-menu-item>
        </template>
      </z-menu>
    </z-badge>
    <div class="flex-grow">
      <z-input
        :value="searchText"
        size="small"
        background-color="ink-300"
        placeholder="Search for PR number or title"
        :show-border="false"
        class="text-sm"
        @debounceInput="(val) => $emit('runs-filter-update', { searchText: val })"
      >
        <template #left>
          <z-icon class="flex-shrink-0 p-px" icon="search" size="small" />
        </template>
        <template #right>
          <z-icon
            v-show="searchText"
            icon="x"
            size="small"
            class="cursor-pointer"
            @click="$emit('runs-filter-update', { searchText: null })"
          />
        </template>
      </z-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { runStatusTagLabel, runStatusIcon, runStatusIconColor, prCopyText } from '~/utils/ui'
import { PrStateChoices, RunStatus } from '~/types/types'
import { shortenLargeNumber } from '~/utils/string'

/**
 * Component for filtering list of PRs based on their status, status of runs and search text on title or PR number
 */
@Component({
  methods: { runStatusIcon, runStatusTagLabel, runStatusIconColor, shortenLargeNumber }
})
export default class RunFilters extends Vue {
  @Prop({ type: [String, Number] })
  openCount: string | number

  @Prop({ type: [String, Number] })
  closedCount: string | number

  @Prop({ type: Boolean, default: true })
  loading: boolean

  @Prop({ type: String, default: PrStateChoices.Open })
  prStatus: PrStateChoices

  @Prop({ type: String, default: null })
  runStatus: RunStatus | null

  @Prop({ type: String, default: null })
  searchText: string | null

  readonly PR_STATE_CHOICES = PrStateChoices
  readonly RUN_STATUSES = RunStatus

  get prStatusFilterCopy() {
    return prCopyText(this.$route.params.provider)
  }

  /**
   * Formats `x open y(s)`
   *
   * E.g.: No open pull requests, 1 open pull request, 900000 open pull requests
   */
  get openToggleTooltip() {
    return `${Number(this.openCount) ? this.openCount : 'No'} open ${this.prStatusFilterCopy}${
      Number(this.openCount) === 1 ? '' : 's'
    }`
  }

  /**
   * Formats `x closed y(s)`
   *
   * E.g.: No closed pull requests, 1 closed pull request, 900000 closed pull requests
   */
  get closeToggleTooltip() {
    return `${Number(this.closedCount) ? this.closedCount : 'No'} closed ${
      this.prStatusFilterCopy
    }${Number(this.closedCount) === 1 ? '' : 's'}`
  }
}
</script>
