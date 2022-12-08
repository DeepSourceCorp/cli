<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <recently-active-repo-list
        :class="
          steps.length && completion < 100
            ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5'
            : 'col-span-full'
        "
      ></recently-active-repo-list>
      <template v-if="steps.length && completion < 100 && allowAccountSetupCard">
        <account-setup-card :completion="completion" />
      </template>
    </div>

    <div v-if="canViewPinnedReports" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <template v-if="isPinnedReportsLoading">
        <div v-for="ii in 4" :key="ii" class="bg-ink-300 animate-pulse h-98"></div>
      </template>

      <template v-else>
        <div
          v-for="(report, reportSlot) in compiledPinnedReports"
          :key="
            report.metadata
              ? `${report.metadata.filter}-${reportSlot}`
              : `${report.key}-${reportSlot}`
          "
        >
          <component
            v-if="report"
            :is="report.componentName"
            v-bind="{ ...report, reportKey: report.key }"
            :allow-pinning-reports="allowPinningReports"
            :loading-value="loadingValues[reportSlot]"
            :level="ReportLevel.Owner"
            :owner="$route.params.owner"
            :provider="$route.params.provider"
            :pinned-reports="pinnedReports"
            :report-slot="reportSlot"
            class="h-full"
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
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import { AccountSetupCard, RecentlyActiveRepoList } from '@/components/TeamHome'

import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import PinnedReportsMixin from '~/mixins/pinnedReportsMixin'

import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { PinnedReportInput, ReportLevel } from '~/types/types'

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
    ZIcon,
    ZTag
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
  isPinnedReportsLoading = false

  ReportLevel = ReportLevel

  /**
   * The `created` hook
   * Determine if the skeleton loader is to be displayed
   *
   * @returns {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isPinnedReportsLoading = true
      }
    }, 300)
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

    await this.fetchAccountSetupStatus(args)

    // Fetch `viewer` information
    await this.fetchActiveUser()

    // Fetch pinned reports list only if the user has the required perms
    if (this.canViewPinnedReports) {
      this.isPinnedReportsLoading = true

      // Fetch the list of report keys pinned at the owner level
      await this.fetchPinnedReports({ level: ReportLevel.Owner })

      this.isPinnedReportsLoading = false
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
    return (this.owner.accountSetupStatus as Array<SetupStep>).map((step) => {
      return step as SetupStep
    })
  }

  get completion(): number {
    const completed = this.steps.filter((step) => step.completed).length
    return Math.round((completed / this.steps.length) * 100)
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
    reportSlotFromEmit?: number
  ): Promise<void> {
    await this.updatePinnedReports(ReportLevel.Owner, pinnedReports, reportSlotFromEmit)
  }
}
</script>
