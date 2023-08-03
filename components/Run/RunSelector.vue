<template>
  <z-menu width="2x-large">
    <template #trigger="{ toggle, isOpen }">
      <slot name="trigger" :toggle="toggle" :is-open="isOpen" :count-text="countText"></slot>
    </template>
    <template #body>
      <z-menu-section
        :divider="false"
        class="hide-scroll max-h-52 divide-y divide-ink-200 overflow-y-auto rounded-md border border-slate-400"
      >
        <z-menu-item
          v-for="run in branchRuns"
          :key="run.runId"
          v-bind="getMenuItemProps(run)"
          class="bg-ink-300 p-4"
          :class="{ 'cursor-not-allowed': isRunSkipped(run.status) }"
        >
          <div class="flex flex-col gap-y-2.5">
            <div class="flex items-center gap-x-1.5">
              <z-icon
                :icon="runStatusIcon(run.status)"
                :color="runStatusIconColor(run.status)"
                class="mt-px"
                :class="{ 'motion-safe:animate-spin': run.status === 'PEND' }"
              />
              <div class="max-w-xs truncate text-sm font-medium leading-6 text-vanilla-100">
                {{ run.commitMessage || run.branchName }}
              </div>
            </div>
            <div class="flex flex-wrap gap-x-4 pl-6">
              <span
                v-if="isRunSkipped(run.status)"
                class="rounded-full bg-ink-200 px-1.5 pb-px pt-0.5 text-xxs uppercase leading-tight text-vanilla-400"
              >
                Skipped
              </span>
              <meta-data-item v-if="run.commitOid" icon="git-commit">
                {{ run.commitOid.slice(0, 7) }}
              </meta-data-item>
              <meta-data-item
                v-if="run.issuesRaisedCount"
                icon="double-exclamation"
                icon-color="cherry"
                size="small"
                spacing="space-x-0"
              >
                {{ shortenLargeNumber(run.issuesRaisedCount) }}
              </meta-data-item>
              <meta-data-item
                v-if="run.issuesResolvedCount"
                icon="double-check"
                icon-color="juniper"
                size="small"
                spacing="space-x-0.5"
                class="ml-1"
              >
                {{ shortenLargeNumber(run.issuesResolvedCount) }}
              </meta-data-item>
            </div>
          </div>
        </z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { shortenLargeNumber } from '~/utils/string'
import { runStatusIcon, runStatusIconColor } from '~/utils/ui'
import { Run, RunStatus } from '~/types/types'
import { generalizeRunStatuses } from '~/utils/runs'

@Component({
  methods: { runStatusIcon, runStatusIconColor, shortenLargeNumber }
})
export default class RunSelector extends Vue {
  @Prop({ required: true })
  branchRuns: Run[]

  /**
   * Get the text label to be used for additional runs
   *
   * @returns {string}
   */
  get countText(): string {
    const runCount = this.branchRuns.length
    if (runCount === 1) {
      // singular
      return `${runCount} more run`
    }
    if (runCount > 1 && runCount <= 30) {
      // plural
      return `${runCount} more runs`
    }
    return '30 more runs'
  }

  /**
   * Returns if a given `Run.status` is skipped or not.
   *
   * @param {RunStatus} status - Status of a Run
   * @returns {boolean}
   */
  isRunSkipped(status: RunStatus) {
    return generalizeRunStatuses(status).status === RunStatus.Skip
  }

  /**
   * Returns bindable props for `ZMenuItem` depending on whether the given Run is skipped or not.
   *
   * @param {Run} run - An object of type `Run`
   * @returns - Props for `ZMenuItem`
   */
  getMenuItemProps(run: Run) {
    return this.isRunSkipped(run.status)
      ? {
          as: 'div',
          disabled: true
        }
      : { as: 'nuxt-link', to: this.$generateRoute(['run', run.runId]) }
  }
}
</script>
