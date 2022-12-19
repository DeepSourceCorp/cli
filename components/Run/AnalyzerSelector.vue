<template>
  <nav class="flex flex-col p-2 overflow-x-auto gap-x-8 hide-scroll lg:gap-y-1">
    <p class="p-2 pl-2.5 text-xs font-semibold tracking-wide uppercase text-vanilla-400">Checks</p>
    <template v-for="check in checks">
      <nuxt-link
        :key="check.id"
        :to="getRoute(check.analyzer.shortcode)"
        class="flex-shrink-0 text-sm rounded-md group border-2"
        :class="{
          'border-vanilla-400 animate-pulse-border-once': flashActiveAnalyzer,
          'border-opacity-0': currentAnalyzer !== check.analyzer.shortcode || !flashActiveAnalyzer
        }"
      >
        <div
          class="flex justify-between w-full p-2 text-sm rounded-md hover:bg-ink-200"
          :class="[
            currentAnalyzer === check.analyzer.shortcode
              ? 'bg-ink-200 text-vanilla-100'
              : 'text-vanilla-400'
          ]"
        >
          <div class="flex items-center gap-x-2">
            <z-icon
              :icon="checkStatusIcon(check.status)"
              :color="checkStatusIconColor(check.status)"
              class="flex-shrink-0"
              :class="{ 'animate-spin': isCheckPending(check.status) }"
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
import { ZTag, ZIcon } from '@deepsource/zeal'
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Check, CheckStatus } from '~/types/types'
import { checkStatusIcon, checkStatusIconColor } from '~/utils/ui'

/**
 * Sidebar component to navigate between different analyzers for a given run
 *
 */
@Component({
  components: {
    ZTag,
    ZIcon
  },
  layout: 'repository',
  methods: {
    checkStatusIcon,
    checkStatusIconColor
  }
})
export default class AnalyzerSelector extends Vue {
  @Prop({ default: () => [] })
  checks: Array<Check>

  @Prop({ default: false })
  flashActiveAnalyzer: boolean

  /**
   * given a status, see if the check is pending or not
   *
   * @param {CheckStatus} status CheckStatus
   * @returns {boolean} Check if the analyzer's check is pending
   */
  isCheckPending(status: CheckStatus): boolean {
    return status === CheckStatus.Pend
  }

  /**
   * Get route for a given analyzer shortcode.
   *
   * @param {string} shortcode Shortcode of an analyzer
   * @returns {string} Route to given analyzer's check
   */
  getRoute(shortcode: string): string {
    const { runId, issueId } = this.$route.params
    let link = this.$generateRoute(['run', runId, shortcode])
    if (this.currentAnalyzer === shortcode) {
      if (issueId && this.$route.query) {
        const { listsort, listcategory, listq } = this.$route.query

        let filters = []
        if (listsort) filters.push(`sort=${listsort}`)
        if (listcategory) filters.push(`category=${listcategory}`)
        if (listq) filters.push(`q=${listq}`)
        if (filters.length > 0) {
          link = `${link}?${filters.join('&')}`
        }
      }
    }
    return link
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
