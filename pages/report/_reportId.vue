<template>
  <div class="w-full min-h-screen mx-auto lg:max-w-6xl 2xl:max-w-7xl animate-gradient">
    <div
      v-if="publicReport && publicReport.owner"
      class="sticky top-0 left-0 z-30 w-full border-b lg:hidden border-ink-200 bg-ink-400"
    >
      <z-button
        id="mobile-sidebar-toggle"
        icon="menu"
        buttonType="ghost"
        size="large"
        color="vanilla-100"
        @click="triggerSidebarExpand"
      />
    </div>

    <div v-if="publicReport && publicReport.owner" class="flex gap-14">
      <public-report-sidebar
        :reports="publicReport.reportKeys"
        :repository-list="repositoryList"
        :owner-logo="publicReport.owner.avatar"
        :owner-login="publicReport.owner.login"
      />

      <div
        class="w-screen px-4 pb-10 text-sm border-t md:px-6 md:text-base border-ink-300 md:border-t-0"
      >
        <nuxt-child
          :share-historical-data="publicReport.shareHistoricalData"
          :level="publicReport.level"
          :object-id="objectId"
          :owner-login="publicReport.owner.login"
          :created-at="formatDate(parseISODate(publicReport.createdAt))"
          :token="token"
          :repository-list="repositoryList"
          class="pt-6 lg:pt-26"
        ></nuxt-child>

        <section
          id="about"
          class="space-y-4 leading-8 border-b text-vanilla-400 mt-14 pb-14 border-ink-200 scroll-mt-8"
        >
          <h2 class="text-lg font-semibold text-vanilla-100">About DeepSource</h2>
          <p>
            <a
              href="https://deepsource.io"
              rel="nofollow noopener noreferrer"
              target="_blank"
              class="font-medium text-juniper-500"
            >
              DeepSource
            </a>
            is a technology company that builds tools for developers. It provides a set of tools
            that fit into a developer’s workflow. Our cloud-based technology scans code in multiple
            languages and detects flaws in the codebase including, but not restricted to security
            and performance issues, bug risks, and anti-patterns.
          </p>
          <p>DeepSource is based in San Francisco, California and Bengaluru, India.</p>
        </section>

        <footer class="flex justify-between mt-10">
          <img class="h-4" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource logo" />
          <span class="text-xs text-vanilla-400">© {{ currentYear }} DeepSource Corp.</span>
        </footer>
      </div>
    </div>

    <div v-else-if="errorMessage" class="flex items-center justify-center h-screen">
      <div class="w-80">
        <div class="bg-ink-300 px-4 py-2.5 flex items-center gap-x-2 mb-2 w-max">
          <z-icon icon="lock" />
          <span class="text-xs font-medium">This report is password-protected</span>
        </div>
        <form @submit="submitPassword" class="max-w-md px-6 py-6 rounded-md bg-ink-300">
          <label for="public-report-pasword" class="block mb-2 text-sm font-medium">
            Enter password
          </label>
          <div class="mb-2 space-y-2">
            <div class="relative">
              <z-input
                v-focus
                id="public-report-pasword"
                v-model="password"
                max-length="32"
                placeholder="Password to access the report"
                :required="true"
                :type="isPasswordHidden ? 'password' : 'text'"
                @input="clearPasswordError"
                class="rounded-md border-ink-200"
              />
              <div class="absolute flex top-1 right-1 gap-x-1 bg-ink-400">
                <z-button
                  v-tooltip="isPasswordHidden ? 'Reveal password' : 'Hide password'"
                  button-type="secondary"
                  :icon="isPasswordHidden ? 'eye' : 'eye-off'"
                  size="small"
                  :disabled="!password"
                  @click="isPasswordHidden = !isPasswordHidden"
                />
              </div>
            </div>
            <p :class="passwordError ? 'visible' : 'invisible'" class="text-xs text-cherry">
              {{ passwordErrorMessage }}
            </p>
          </div>
          <z-button
            label="Open report"
            icon="check"
            size="small"
            type="submit"
            full-width
            :is-loading="submitPasswordLoading"
            :disabled="submitPasswordLoading"
            @click.prevent="submitPassword"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZTag, ZButton, ZInput } from '@deepsourcelabs/zeal'
import { Context } from '@nuxt/types'
import gql from 'graphql-tag'

import PublicReportMixin from '~/mixins/publicReportMixin'
import { PublicReport, ReportLevel, Repository } from '~/types/types'
import { formatDate, parseISODate } from '~/utils/date'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { PublicReportErrors } from '~/types/reportTypes'

/**
 * Public Report parent page
 */
@Component({
  components: {
    ZIcon,
    ZDivider,
    ZTag,
    ZButton,
    ZInput
  },
  methods: {
    formatDate,
    parseISODate
  },
  /**
   * The middleware has a twofold purpose:
   * 1. Query the reportKeys of the public report, find the first report in the list
   * and redirect to that report.
   * 2. Check if public report does not exist and show 404 page
   *
   * Rest of the errors are handled in fetchPublicReportBase & verifyPasswordForPublicReport
   * in PublicReportMixin
   */
  middleware: [
    async function ({ $fetchGraphqlData, params, redirect, route, error }: Context): Promise<void> {
      const { reportId } = params
      if (route.name === 'report-reportId') {
        try {
          const response = (await $fetchGraphqlData(
            gql`
              query ($reportId: String!) {
                publicReport(reportId: $reportId) {
                  reportKeys
                }
              }
            `,
            { reportId },
            true,
            false
          )) as GraphqlQueryResponse

          const reports = response.data.publicReport?.reportKeys

          if (Array.isArray(reports) && reports.length) {
            const firstReport = reports[0]
            redirect(`/report/${reportId}/${firstReport}`)
          }
        } catch (e) {
          const message = (e as Error).message.replace('GraphQL error: ', '')

          // show 500 error if the server returns a non standard error
          if (!(Object.values(PublicReportErrors) as string[]).includes(message)) {
            error({ statusCode: 500 })
          }

          if (message === PublicReportErrors.DOES_NOT_EXIST) {
            error({ statusCode: 404, message: 'This page is not real' })
          }
        }
      }
    }
  ]
})
export default class PublicReportPageParent extends mixins(PublicReportMixin) {
  public publicReport: PublicReport = {} as PublicReport
  public repositoryList: Array<Repository> = []

  public isPasswordHidden = true
  public password = ''
  public token = ''
  public passwordError = false
  // If default value is '', vue doesn't render the error HTML element
  public passwordErrorMessage = 'Please enter password to access the report'

  PublicReportErrors = PublicReportErrors

  /**
   * Fetch hook for the component.
   * Fetches basic data of public report and handles redirection to first report
   * for protected reports.
   */
  async fetch() {
    const { reportId } = this.$route.params

    this.publicReport = (await this.fetchPublicReportBase(reportId, this.token)) as PublicReport

    if (this.publicReport?.repository?.id) {
      this.repositoryList.push(this.publicReport.repository)
    }

    if (this.publicReport?.sourcedRepositories?.length) {
      this.repositoryList = this.publicReport.sourcedRepositories as Array<Repository>
    }

    // Redirection specifically for protected reports
    // For non-protected reports, redirection happens in middleware above
    if (this.publicReport?.isRestricted && this.token && this.publicReport?.reportKeys?.length) {
      const firstReport = this.publicReport.reportKeys[0]

      this.$router.push(`/report/${reportId}/${firstReport}`)
    }
  }

  /**
   * Submit report password and set errors.
   */
  async submitPassword() {
    const { reportId } = this.$route.params

    if (!this.password.length) {
      this.passwordError = true
      this.passwordErrorMessage = 'Please enter password to access the report'
      return
    }

    this.token = await this.verifyPasswordForPublicReport({ password: this.password, reportId })

    if (this.errorMessage === PublicReportErrors.INVALID_PASSWORD) {
      this.passwordError = true
      this.passwordErrorMessage = 'Invalid password'
      return
    }

    if (this.token) {
      this.passwordError = false
      this.$fetch()
    }
  }

  /**
   * Emit show-public-report-sidebar event to trigger sidebar expansion.
   */
  triggerSidebarExpand() {
    this.$root.$emit('ui:show-public-report-sidebar')
  }

  get objectId(): string {
    if (this.publicReport.level === ReportLevel.Repository) {
      return this.publicReport.repository?.id as string
    }
    if (this.publicReport.level === ReportLevel.Owner) {
      return this.publicReport.owner?.id as string
    }
    return ''
  }

  /**
   * Clear password error shown when user starts typing again
   */
  clearPasswordError() {
    if (this.passwordError) {
      this.passwordError = false
    }
  }

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }
}
</script>
