<template>
  <nav class="flex p-2 overflow-x-auto gap-x-8 hide-scroll flex-col lg:gap-y-1">
    <p class="p-2 text-xs font-semibold tracking-wide uppercase text-slate">Checks</p>
    <template v-for="check in checks">
      <nuxt-link
        :key="check.id"
        :to="getRoute(check.analyzer.shortcode)"
        class="flex-shrink-0 text-sm rounded-md group hover:bg-ink-300"
      >
        <div
          class="w-full flex justify-between rounded-md p-2 hover:bg-ink-200 text-sm"
          :class="[
            currentAnalyzer === check.analyzer.shortcode
              ? 'bg-ink-200 text-vanilla-100'
              : 'text-vanilla-400'
          ]"
        >
          <div class="flex items-start space-x-2">
            <z-icon
              :icon="statusIcon(check.status)"
              :color="statusIconColor(check.status)"
              class="mt-0.5"
            />
            <span>{{ check.analyzer.name }}</span>
          </div>
          <z-tag bg-color="ink-100" text-size="xs" spacing="px-2 py-1" class="leading-none min-w-1">
            <span>{{ check.issuesRaisedCount }}</span>
          </z-tag>
        </div>
      </nuxt-link>
    </template>
  </nav>
</template>

<script lang="ts">
import { ZTag, ZIcon } from '@deepsourcelabs/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Check, CheckStatus } from '~/types/types'

/**
 * Sidebar component to navigate between different analyzers for a given run
 *
 */
@Component({
  components: {
    ZTag,
    ZIcon
  },
  layout: 'repository'
})
export default class AnalyzerSelector extends Vue {
  @Prop({ default: () => [] })
  checks: Array<Check>

  /**
   * Get route for a given analyzer shortcode.
   *
   * @param {string} shortcode Shortcode of an analyzer
   * @returns {string} Route to given analyzer's check
   */
  getRoute(shortcode: string): string {
    const { runId } = this.$route.params
    return this.$generateRoute(['run', runId, shortcode])
  }

  /**
   * Get icon for a given check status.
   *
   * @param {CheckStatus} status Status code of the check
   * @returns {string} icon to be used to represent the check status
   */
  statusIcon(status: CheckStatus): string {
    const types: Record<CheckStatus, string> = {
      [CheckStatus.Pass]: 'check',
      [CheckStatus.Fail]: 'x',
      [CheckStatus.Pend]: 'clock',
      [CheckStatus.Timo]: 'timer-reset',
      [CheckStatus.Cncl]: 'alert-circle',
      [CheckStatus.Read]: 'check-circle',
      [CheckStatus.Neut]: 'check',
      [CheckStatus.Atmo]: 'x',
      [CheckStatus.Wait]: 'clock'
    }
    return types[status || 'PASS']
  }

  /**
   * Get icon color for a given check status.
   *
   * @param {CheckStatus} status Status code of the check
   * @returns {string} icon color to be used to represent the check status
   */
  statusIconColor(status: CheckStatus): string {
    const types: Record<CheckStatus, string> = {
      [CheckStatus.Pass]: 'juniper',
      [CheckStatus.Fail]: 'cherry',
      [CheckStatus.Pend]: 'vanilla-400',
      [CheckStatus.Timo]: 'honey',
      [CheckStatus.Cncl]: 'honey',
      [CheckStatus.Read]: 'vanilla-400',
      [CheckStatus.Neut]: 'vanilla-400',
      [CheckStatus.Atmo]: 'cherry',
      [CheckStatus.Wait]: 'honey'
    }
    return types[status || 'PASS']
  }

  /**
   * Get currently active analyzer
   *
   * @returns {string} the shortcode of the currently active analyzer
   */
  get currentAnalyzer(): string {
    return this.$route.params.analyzer
  }
}
</script>
