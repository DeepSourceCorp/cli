<template>
  <section class="grid grid-cols-1 lg:grid-cols-16-fr">
    <reports-sidebar :level="ReportLevel.Owner" :show-public-reports="hasPublicReportViewAccess" />

    <div class="flex flex-col p-4 gap-y-2">
      <page-title
        v-if="!viewingPublicReports"
        description-width-class="max-w-xl"
        :title="reportTitle"
        :description="reportDescription"
        class="flex-col md:flex-row gap-y-4"
      >
        <template v-if="hasPublicReportEditAccess" #actions>
          <z-button
            icon="share"
            label="Share"
            size="small"
            button-type="secondary"
            @click="isMutateReportModalOpen = true"
          />
        </template>
      </page-title>
      <nuxt-child class="mb-28 lg:mb-24" />
    </div>

    <portal v-if="activeReportName !== ReportPageT.PUBLIC_REPORTS" to="modal">
      <mutate-owner-report-modal
        v-if="isMutateReportModalOpen"
        :owner-login="$route.params.owner"
        :vcs-provider="$route.params.provider"
        :level="ReportLevel.Owner"
        :report-keys-old="[activeReportName]"
        :save-loading="reportSaveLoading"
        @close="isMutateReportModalOpen = false"
        @create-report="createPublicReport"
      />
    </portal>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZTab, ZButton, ZIcon, ZMenu, ZMenuItem, ZSplitButtonDropdown } from '@deepsourcelabs/zeal'
import { ZDivider } from '@deepsourcelabs/zeal'

import { TeamPerms } from '~/types/permTypes'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { CreatePublicReportInput, ReportLevel } from '~/types/types'

import { createPublicReport } from '@/apollo/mutations/reports/createPublicReport.gql'
import { GraphqlMutationResponse } from '~/types/apolloTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

/**
 * Parent page for reports UI.
 */
@Component({
  components: {
    ZTab,
    ZButton,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZSplitButtonDropdown,
    ZDivider
  },
  layout: 'dashboard',
  middleware: [
    'perm',
    async function ({ route, redirect }) {
      const { provider, owner } = route.params
      if (route.name === 'provider-owner-reports') {
        redirect(`/${provider}/${owner}/reports/${ReportPageT.OWASP_TOP_10}`)
      }
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_REPORTS]
    }
  },
  scrollToTop: true
})
export default class OwnerReports extends mixins(RoleAccessMixin) {
  isMutateReportModalOpen = false
  reportSaveLoading = false

  ReportLevel = ReportLevel
  ReportPageT = ReportPageT

  /**
   * Create new public report
   *
   * @param newReportArgs CreatePublicReportInput
   * @param callback () => void
   *
   * @return {Promise<void>}
   */
  async createPublicReport(
    newReportArgs: CreatePublicReportInput,
    close?: () => void
  ): Promise<void> {
    this.reportSaveLoading = true

    try {
      const response = (await this.$applyGraphqlMutation(createPublicReport, {
        input: newReportArgs
      })) as GraphqlMutationResponse

      const newReport = response.data?.createPublicReport?.report

      if (newReport && newReport.reportId) {
        close?.()
        this.$toast.success('Report successfully created.')

        window.open(`/report/${newReport.reportId}`)
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, "Can't create a report. Please contact support.")
    } finally {
      this.reportSaveLoading = false
    }
  }

  get activeReportName(): ReportPageT {
    const currentRouteItem = Object.values(ReportPageT).find(
      (reportKey) => this.$route.name === `provider-owner-reports-${reportKey}`
    )

    return currentRouteItem ?? ReportPageT.OWASP_TOP_10
  }

  get reportTitle(): string {
    const metadata = ReportMeta[this.activeReportName]
    return metadata.title
  }

  get reportDescription(): string {
    const metadata = ReportMeta[this.activeReportName]
    return metadata.description
  }

  get viewingPublicReports(): boolean {
    return this.activeReportName === ReportPageT.PUBLIC_REPORTS
  }

  get hasPublicReportEditAccess(): boolean {
    return this.$gateKeeper.team(TeamPerms.UPDATE_PUBLIC_REPORTS, this.teamPerms.permission)
  }

  get hasPublicReportViewAccess(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_PUBLIC_REPORTS, this.teamPerms.permission)
  }

  /**
   * Set meta tags
   *
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Reports • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
