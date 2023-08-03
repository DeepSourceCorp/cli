<template>
  <div class="space-y-4 p-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <recently-active-repo-list
        :class="
          steps.length && completion < 100
            ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5'
            : 'col-span-full'
        "
      />
      <template v-if="steps.length && completion < 100 && allowAccountSetupCard">
        <account-setup-card :completion="completion" :provider="provider" />
      </template>
    </div>

    <div
      v-if="canViewPinnedReports && pinnedReportsListIsAvailable"
      class="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <div
        v-for="(report, reportSlot) in compiledPinnedReports"
        :key="`${reportSlot}-${reRenderKey}`"
      >
        <div
          v-if="
            loadingValues[reportSlot].condition === LoadingConditions.REPORT_WIDGET_INITIAL_LOAD
          "
          class="pinned-report-widget animate-pulse bg-ink-300"
        ></div>

        <component
          :is="report.componentName"
          v-else
          v-bind="{ ...report, reportKey: report.key }"
          :allow-pinning-reports="allowPinningReports"
          :loading-value="loadingValues[reportSlot]"
          :level="ReportLevel.Owner"
          :owner="$route.params.owner"
          :provider="provider"
          :pinned-reports="pinnedReports"
          :report-slot="reportSlot"
          class="pinned-report-widget"
          @update-report-controls="
            (reportSlotFromEmit, reportControlValueFromEmit) =>
              updateReportControls(
                ReportLevel.Owner,
                report,
                reportSlot,
                reportSlotFromEmit,
                reportControlValueFromEmit
              )
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import { AccountSetupCard, RecentlyActiveRepoList } from '@/components/TeamHome'
import PinnedChartReport from '~/components/Reports/PinnedChartReport.vue'
import PinnedCodeCoverageReport from '~/components/Reports/PinnedCodeCoverageReport.vue'

import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import PinnedReportsMixin from '~/mixins/pinnedReportsMixin'

import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { PinnedReportInput, ReportLevel } from '~/types/types'
import { LoadingConditions } from '~/types/reportTypes'

interface SetupStep {
  completed: boolean
  shortcode: string
  display_name: string
  description: string
  link?: string
  actionLabel?: string
}

@Component({
  components: {
    RecentlyActiveRepoList,
    AccountSetupCard,
    PinnedChartReport,
    PinnedCodeCoverageReport
  },
  middleware: ['validateProvider', 'perm'],
  meta: {
    auth: {
      teamPerms: [TeamPerms.VIEW_TEAM_HOME]
    }
  },
  layout: 'dashboard'
})
export default class TeamHome extends mixins(
  OwnerDetailMixin,
  PinnedReportsMixin,
  ActiveUserMixin
) {
  LoadingConditions = LoadingConditions
  ReportLevel = ReportLevel
  isFetchingAccountSetupStatus = false

  async fetchAccSetupStatuses(args: { login: string; provider: string }) {
    this.isFetchingAccountSetupStatus = true
    await this.fetchAccountSetupStatus(args)
    this.isFetchingAccountSetupStatus = false
  }

  /**
   * The fetch hook
   * Fetch account setup status information and the list of pinned reports
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider }

    await Promise.allSettled([
      this.fetchAccSetupStatuses(args),
      // Fetch `viewer` information
      this.fetchActiveUser()
    ])

    // Fetch pinned reports list only if the user has the required perms
    if (this.canViewPinnedReports) {
      // Fetch the list of report keys pinned at the owner level
      await this.fetchPinnedReports({ level: ReportLevel.Owner })
    }
  }

  head(): Record<string, string> {
    return {
      title: `DeepSource`
    }
  }

  /**
   * The `mounted` hook
   * Set the active context in cookies and bind event bus listeners
   *
   * @returns {void}
   */
  mounted(): void {
    const { owner, provider } = this.$route.params
    this.setActiveContextCookie(provider, owner)

    this.$root.$on('update-pinned-reports', this.updatePinnedReportsHandler)
  }

  /**
   * The `beforeDestroy` hook
   * Unbind event bus listeners
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('update-pinned-reports', this.updatePinnedReportsHandler)
  }

  get allowAccountSetupCard(): boolean {
    const context = this.activeDashboardContext as DashboardContext
    return ['ADMIN', 'MEMBER'].includes(context.role)
  }

  // Only ADMINs have the ability to swap the currently pinned report
  get allowPinningReports(): boolean {
    // Keep the menu hidden by default until the perms are fetched
    if (this.$fetchState.pending) {
      return false
    }
    return this.$gateKeeper.team(TeamPerms.PIN_REPORTS, this.teamPerms.permission)
  }

  // Only `ADMIN` and `MEMBER` can view reports
  get canViewPinnedReports(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_REPORTS, this.teamPerms.permission)
  }

  get steps(): Array<SetupStep> {
    if (this.isFetchingAccountSetupStatus) {
      return []
    }

    const setupOptionsSupportStatus: Record<string, boolean> = {
      'activate-repository': true,
      'install-autofix': this.$gateKeeper.provider(AppFeatures.AUTOFIX, this.provider),
      'invite-team': true,
      'configure-transformers': this.$gateKeeper.provider(AppFeatures.TRANSFORMS, this.provider)
    }

    return (this.owner.accountSetupStatus as Array<SetupStep>)
      .filter((step) => {
        const { shortcode } = step

        const isFeatureSupported = setupOptionsSupportStatus[shortcode]

        if (isFeatureSupported) {
          return step
        }
      })
      .map((step) => {
        return step as SetupStep
      })
  }

  get completion(): number {
    const completed = this.steps.filter((step) => step.completed).length
    return Math.round((completed / this.steps.length) * 100)
  }

  get provider(): string {
    return this.$route.params.provider
  }

  /**
   * Handler method for the `update-pinned-reports` event
   * Invoke the `updatePinnedReports` method as part of the `pinnedReportsMixin`
   *
   * @param {Array<PinnedReportInput>} pinnedReports
   * @param {number} [reportSlotFromEmit]
   */
  async updatePinnedReportsHandler(
    pinnedReports: Array<PinnedReportInput>,
    reportSlotFromEmit: number
  ): Promise<void> {
    await this.updatePinnedReports(ReportLevel.Owner, pinnedReports, reportSlotFromEmit)
  }
}
</script>

<style scoped>
/* Specify fixed height to prevent layout shifts */
@media screen and (min-width: 1025px) {
  .pinned-report-widget {
    height: 406px;
  }
}

/* `iPad Pro` device has the legends appearing towards the bottom */
@media screen and (width: 1024px) {
  .pinned-report-widget {
    height: 442px;
  }
}
</style>
